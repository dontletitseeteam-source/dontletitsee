// FLOOR 0 — generic compositor and frame renderer
// usage: node render.js <part> --stills 0.5,3.4   (PNGs into ../p<part>/out/stills)
//        node render.js <part> --video            (-> ../p<part>/out/video_noaudio.mp4)
//        node render.js <part> --keys             (-> ../p<part>/keys.json, for the sound mix)
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { createCanvas } = require('@napi-rs/canvas');
const D = require('./draw');
const { W, H } = D;

const ROOT = path.join(__dirname, '..');
const PART = parseInt(process.argv[2], 10);
const PDIR = path.join(ROOT, `p${PART}`);
const TL = JSON.parse(fs.readFileSync(path.join(PDIR, 'timeline.json'), 'utf8'));
const FPS = TL.fps, DUR = TL.duration;
const P = require(`./part${PART}.js`)(TL);
P.shots.sort((a, b) => a.start - b.start);

function renderFrame(ctx, t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  let cur = P.shots[0];
  for (const s of P.shots) if (t >= s.start) cur = s;
  const lt = t - cur.start;
  cur.draw(ctx, t, lt);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over';
  const m = cur.meta || {};
  D.vignette(ctx, m.vignette ?? 0.62);
  if (m.captions !== false) {
    for (const L of TL.lines) for (const c of L.captions) {
      if (t >= c.start - 0.02 && t < c.end) D.drawCaption(ctx, c.text, t - c.start + 0.02);
    }
  }
  if (P.overlay) P.overlay(ctx, t, cur);
  if (!(m.hideHud && m.hideHud(lt))) D.drawHUD(ctx, P.hudState(t));
}

async function main() {
  const args = process.argv.slice(3);
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  if (args[0] === '--keys') {
    const changes = [];
    if (P.elevatorState) { let prev = null; for (let f = 0; f < DUR * FPS; f++) { const e = P.elevatorState(f / FPS).ch; if (prev !== null && e !== prev) changes.push(+(f / FPS).toFixed(3)); prev = e; } }
    fs.writeFileSync(path.join(PDIR, 'keys.json'), JSON.stringify({ ...P.K, floorChanges: changes, duration: DUR }, null, 1));
    console.log('keys written', changes.length, 'floor changes');
    return;
  }
  if (args[0] === '--stills') {
    const dir = path.join(PDIR, 'out', 'stills'); fs.mkdirSync(dir, { recursive: true });
    for (const ts of args[1].split(',')) {
      const t = parseFloat(ts);
      renderFrame(ctx, t);
      fs.writeFileSync(path.join(dir, `f_${t.toFixed(2).padStart(6, '0')}.png`), await canvas.encode('png'));
    }
    console.log('stills done');
    return;
  }
  if (args[0] === '--cover') {  // --cover t outfile : clean frame + series title, no HUD or captions
    const t = parseFloat(args[1]);
    let cur = P.shots[0]; for (const s of P.shots) if (t >= s.start) cur = s;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    cur.draw(ctx, t, t - cur.start);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over';
    D.vignette(ctx, 0.7);
    const g = ctx.createLinearGradient(0, 1150, 0, 1700); g.addColorStop(0, 'rgba(3,5,12,0)'); g.addColorStop(1, 'rgba(3,5,12,0.85)');
    ctx.fillStyle = g; ctx.fillRect(0, 1150, W, 770);
    D.drawCaption(ctx, 'FLOOR [0]', 1, { y: 1380, size: 150 });
    ctx.save(); ctx.font = '40px Mono700'; ctx.fillStyle = D.C.red; ctx.textBaseline = 'alphabetic';
    D.spaced(ctx, `PART ${PART}`, 540, 1500, 12, 'center'); ctx.restore();
    fs.writeFileSync(args[2], await canvas.encode('jpeg', 92));
    console.log('cover', args[2]);
    return;
  }
  if (args[0] === '--jpg') {  // storyboard thumbnails: --jpg t1,t2 outdir
    fs.mkdirSync(args[2], { recursive: true });
    const small = createCanvas(360, 640); const sx = small.getContext('2d');
    let i = 1;
    for (const ts of args[1].split(',')) {
      renderFrame(ctx, parseFloat(ts));
      sx.drawImage(canvas, 0, 0, 360, 640);
      fs.writeFileSync(path.join(args[2], `s${String(i++).padStart(2, '0')}.jpg`), await small.encode('jpeg', 82));
    }
    console.log('jpgs done');
    return;
  }
  if (args[0] === '--video') {
    const out = path.join(PDIR, 'out', 'video_noaudio.mp4');
    const N = Math.round(DUR * FPS);
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let f = 0; f < N; f++) {
      renderFrame(ctx, f / FPS);
      const buf = ctx.getImageData(0, 0, W, H).data;
      const ok = ff.stdin.write(Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength));
      if (!ok) await new Promise(r => ff.stdin.once('drain', r));
      if (f % 300 === 0) console.log(`frame ${f}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    console.log('video done', out, ((Date.now() - t0) / 1000).toFixed(0) + 's');
  }
}
main();
