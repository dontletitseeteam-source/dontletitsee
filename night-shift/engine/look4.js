// LOOK v4 (owner directive 2026-11-23): no permanent HUD, serif sentence-case captions without a box, film grain + paper
// texture, bloom, handheld camera, low-res "lens blur" layers for rack focus, dust in light beams, whip-pan smears.
// Opt-in: a part that exports { look: 'v4', caption, post, grainOver } gets this pipeline from render.js.
const path = require('path');
const { GlobalFonts, createCanvas } = require('@napi-rs/canvas');
const D = require('./draw');
const { W, H, clamp, lerp, E, hash, noise1 } = D;

const FD = path.join(__dirname, '..', 'fonts');
GlobalFonts.registerFromPath(path.join(FD, 'DMSerifDisplay-Regular.ttf'), 'Serif4');
GlobalFonts.registerFromPath(path.join(FD, 'DMSerifDisplay-Italic.ttf'), 'Serif4i');

// ---------- colour helpers ----------
function hex(c) { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function mix(a, b, k) { const A = hex(a), B = hex(b); const r = A.map((v, i) => Math.round(lerp(v, B[i], clamp(k)))); return `rgb(${r[0]},${r[1]},${r[2]})`; }
function rgba(c, a) { const A = hex(c); return `rgba(${A[0]},${A[1]},${A[2]},${a})`; }

// ---------- camera ----------
// handheld drift: slow wander + small fast jitter, amplitude in px
function hand(t, amp = 6, seed = 0) {
  const x = (noise1(t * 0.7 + seed) - 0.5) * 2 * amp + (noise1(t * 6 + seed + 9) - 0.5) * amp * 0.25;
  const y = (noise1(t * 0.6 + seed + 40) - 0.5) * 2 * amp + (noise1(t * 6.4 + seed + 19) - 0.5) * amp * 0.25;
  const r = (noise1(t * 0.5 + seed + 80) - 0.5) * amp * 0.0012;
  return [x, y, r];
}
function cam(ctx, cx, cy, z, t, o = {}) {
  const [hx, hy, hr] = hand(t, o.hand ?? 5, o.seed || 0);
  ctx.translate(540 + hx + (o.sx || 0), 960 + hy + (o.sy || 0));
  ctx.rotate(hr + (o.rot || 0));
  ctx.scale(z, z);
  ctx.translate(-cx, -cy);
}

// ---------- low-res layer = optical blur (rack focus, depth) ----------
const layers = {};
function blurLayer(ctx, key, scale, fn, alpha = 1) {
  const w = Math.max(8, Math.round(W * scale)), h = Math.max(8, Math.round(H * scale));
  let L = layers[key + w];
  if (!L) { const c = createCanvas(w, h); L = layers[key + w] = { c, x: c.getContext('2d') }; }
  const x = L.x; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, w, h); x.scale(scale, scale);
  fn(x);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = alpha; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(L.c, 0, 0, W, H); ctx.restore();
}

// ---------- grain / paper / bloom ----------
const GR = [];
function makeGrain() {
  for (let k = 0; k < 6; k++) {
    const c = createCanvas(540, 960), x = c.getContext('2d'); const img = x.createImageData(540, 960); const d = img.data;
    let s = 1234 + k * 777;
    for (let i = 0; i < d.length; i += 4) { s = (s * 16807) % 2147483647; const v = (s / 2147483647) * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    x.putImageData(img, 0, 0); GR.push(c);
  }
}
let PAPER = null;
function makePaper() {
  const c = createCanvas(270, 480), x = c.getContext('2d'); const img = x.createImageData(270, 480); const d = img.data;
  for (let y = 0; y < 480; y++) for (let X = 0; X < 270; X++) {
    const n = noise1(X * 0.06 + noise1(y * 0.05) * 3) * 0.5 + noise1(y * 0.11 + X * 0.013 + 50) * 0.3 + hash(X * 7.1 + y * 13.3) * 0.2;
    const v = 128 + (n - 0.5) * 70; const i = (y * 270 + X) * 4; d[i] = v + 6; d[i + 1] = v; d[i + 2] = v - 8; d[i + 3] = 255;
  }
  x.putImageData(img, 0, 0); PAPER = c;
}
const bloomC = createCanvas(216, 384), bloomX = bloomC.getContext('2d');
function bloom(ctx, canvas, amt = 0.35) {
  bloomX.setTransform(1, 0, 0, 1, 0, 0); bloomX.globalCompositeOperation = 'source-over'; bloomX.filter = 'blur(6px)';
  bloomX.drawImage(canvas, 0, 0, 216, 384); bloomX.filter = 'none';
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = amt;
  ctx.drawImage(bloomC, 0, 0, W, H); ctx.restore();
}
function grain(ctx, t, amt = 0.07) {
  if (!GR.length) { makeGrain(); makePaper(); }
  const f = Math.floor(t * 24) % GR.length;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.5; ctx.drawImage(PAPER, 0, 0, W, H);
  ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = amt * 2.2;
  const ox = Math.floor(hash(f + Math.floor(t * 24)) * 40);
  ctx.drawImage(GR[f], -ox, -ox, W + 40, H + 40);
  ctx.restore();
}
function grade(ctx, tint = '#ff9a3c', a = 0.06, vig = 0.55) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = rgba(tint, a * 4); ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
  const g = ctx.createRadialGradient(540, 860, 300, 540, 960, 1300);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${vig})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
// horizontal smear over a cut (whip pan): dir +1/-1, k 0..1 strength
function whip(ctx, canvas, k, dir = 1) {
  if (k <= 0.01) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 1; i <= 5; i++) { ctx.globalAlpha = 0.16 * k; ctx.drawImage(canvas, dir * i * 34 * k, 0); }
  ctx.restore();
}
// dust motes drifting in a light (cone or area)
function dust(ctx, t, x0, y0, w, h, n = 40, col = '#ffd9a0', a = 0.5, seed = 1) {
  ctx.save();
  for (let i = 0; i < n; i++) {
    const hx = hash(i * 3.1 + seed), hy = hash(i * 7.7 + seed), hs = hash(i * 1.3 + seed);
    const x = x0 + ((hx * w + Math.sin(t * 0.4 + i) * 20 + t * 6 * (hs - 0.5)) % w + w) % w;
    const y = y0 + ((hy * h - t * (8 + hs * 14)) % h + h) % h;
    const tw = 0.5 + 0.5 * Math.sin(t * (1 + hs * 3) + i);
    ctx.globalAlpha = a * tw; ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(x, y, 1.2 + hs * 2.4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
// volumetric beam from (x,y) spreading to width w at distance len, angle ang (rad, 0 = down)
function beam(ctx, x, y, ang, len, w0, w1, col, a) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(0, 0, 0, len); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-w0 / 2, 0); ctx.lineTo(w0 / 2, 0); ctx.lineTo(w1 / 2, len); ctx.lineTo(-w1 / 2, len); ctx.closePath(); ctx.fill();
  ctx.restore();
}

// ---------- captions: serif, sentence case, white with soft shadow, no box ----------
// markup: [x] accent, {x} threat. Words rise in one by one (by character time), 1-4 words per chunk.
function caption(ctx, text, lt, o = {}) {
  const size = o.size || 82, cy = o.y || 1530, maxW = 900;
  const acc = o.accent || '#ffb84a', thr = o.threat || '#ff4a3d';
  const words = D.parseMarkup(text).map(w => ({ ...w, col: w.col === D.C.lime ? acc : w.col === D.C.red ? thr : '#fbf6ee' }));
  ctx.save(); ctx.font = `${size}px Serif4`; ctx.textBaseline = 'alphabetic';
  const space = size * 0.24; const lines = []; let line = [], lw = 0;
  for (const w of words) {
    const ww = ctx.measureText(w.w).width; const add = (line.length && !w.join ? space : 0) + ww;
    if (line.length && lw + add > maxW && !w.join) { lines.push({ line, lw }); line = []; lw = 0; }
    line.push({ ...w, ww }); lw += (line.length > 1 && !w.join ? space : 0) + ww;
  }
  if (line.length) lines.push({ line, lw });
  const lh = size * 1.12; const y0 = cy - ((lines.length - 1) * lh) / 2;
  let wi = 0;
  lines.forEach(({ line, lw }, li) => {
    let x = 540 - lw / 2; const y = y0 + li * lh;
    line.forEach((w, i) => {
      if (i && !w.join) x += space;
      const k = E.out(clamp((lt - wi * 0.06) / 0.22));
      ctx.globalAlpha = k;
      const dy = (1 - k) * 18;
      ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 6;
      ctx.fillStyle = w.col; ctx.fillText(w.w, x, y + dy);
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; ctx.fillText(w.w, x, y + dy);
      x += w.ww; wi++;
    });
  });
  ctx.restore();
}
// small serif title (hook, labels)
function title(ctx, s, x, y, size, col = '#fbf6ee', a = 1, italic = false, align = 'center') {
  ctx.save(); ctx.globalAlpha = a; ctx.font = `${size}px ${italic ? 'Serif4i' : 'Serif4'}`; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = 28; ctx.shadowOffsetY = 5; ctx.fillStyle = col; ctx.fillText(s, x, y);
  ctx.shadowBlur = 0; ctx.fillText(s, x, y); ctx.restore();
}

module.exports = { hex, mix, rgba, hand, cam, blurLayer, bloom, grain, grade, whip, dust, beam, caption, title };
