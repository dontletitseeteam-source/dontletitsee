// FLOOR 0 — Part 3 "Below" shot list (series finale, loops into Part 1)
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('@napi-rs/canvas');
const D = require('./draw');
const S = require('./scenes');
const S2 = require('./scenes2');
const { W, H, C, clamp, lerp, inv, E, hash, noise1, flicker, shake, rrect, glow, spaced, camera, drawStick, drawEntity } = D;

module.exports = function build(TL) {
  const FPS = TL.fps, DUR = TL.duration;
  const Ln = id => TL.lines[id - 1];
  const Wd = (id, k) => Ln(id).words[k].start;
  const TL1 = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'p1', 'timeline.json'), 'utf8'));
  const P1 = require('./part1')(TL1);
  const shot1 = n => P1.shots.find(s => s.name === n);

  const K = {
    panel: 0, press: Wd(2, 0) - 0.12,
    close: Ln(3).start - 0.1, doorsClose: Wd(3, 1), goDown: Wd(3, 3),
    down2: Ln(4).start, down3: Ln(5).start,
    ding: Wd(6, 0) - 0.06, open0: Wd(6, 0) + 0.15,
    backwards: Ln(7).start - 0.1,
    full: Ln(8).start - 0.12,
    dozens: Ln(9).start - 0.05,
    tall: Ln(10).start - 0.1,
    taller: Ln(11).start - 0.1, tallerWord: Wd(11, 7),
    buzzShot: Ln(12).start - 0.1, buzz: Wd(12, 2),
    typing: Ln(13).start - 0.1, type0: Wd(13, 0) + 0.05,
    number: Wd(14, 2),
    send1: Wd(15, 0) + 0.15,
    didnt: Ln(16).start,
    rises: Ln(17).start - 0.1, facing: Wd(17, 3),
    cant: Ln(18).start - 0.1,
    lobbyDing: Wd(19, 0) - 0.06,
    lookOut: Ln(20).start - 0.1, lookingIn: Ln(21).start,
    type2Shot: Ln(22).start - 0.1, type2a: Wd(22, 0) + 0.1,
    send2: Ln(23).end - 0.08,
    flash: Ln(23).end + 0.28,
    rule: Ln(24).start - 0.25,
    loop: DUR - 1.45,
  };
  const MSG1 = "Don't look inside.", MSG2 = 'Smile.';
  const NUM = '+1 (555) 014-0808';

  function hudState(t) {
    if (t >= K.loop) return { t, part: 'PART 1', time: '12:07', battery: '19%', elevator: '▼ 2', location: 'LOBBY' };
    let el = 'L', elCol, loc = 'ELEVATOR', locCol;
    if (t >= K.press) el = '0';
    if (t >= K.doorsClose && t < K.ding) { const depth = Math.floor(Math.pow(inv(K.doorsClose, K.ding, t), 1.6) * 66) + 1; el = `▼ -${depth}`; }
    if (t >= K.ding) { el = '0'; elCol = C.lime; loc = 'FLOOR 0'; locCol = C.red; }
    if (t >= K.rises) { el = t < K.lobbyDing ? '▲ 0' : 'L'; elCol = undefined; loc = t < K.lobbyDing ? 'ELEVATOR' : 'LOBBY'; locCol = undefined; }
    return { t, part: 'PART 3', time: t < K.typing ? '12:13' : '12:14', battery: '16%', elevator: el, elevatorCol: elCol, location: loc, locationCol: locCol };
  }

  const shots = [];
  const shot = (name, start, draw, meta) => shots.push({ name, start, draw, meta });

  // what you see beyond the car doors
  let cor = null;
  const outsideCorridor = (ctx, x0, y0, x1, y1) => {
    if (!cor) { cor = createCanvas(W, H); const x = cor.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, W, H); x.save(); camera(x, 540, 900, 0.9); S2.drawCorridor(x, 1, { lights: [0, 0, 0, 0, 0], ajar: 0 }); x.restore(); }
    ctx.drawImage(cor, 0, 0, W, H, x0 - 300, y0 - 200, (x1 - x0) + 600, (y1 - y0) + 400);
  };
  const f0 = createCanvas(W, H), f0x = f0.getContext('2d');
  const outsideFloor0 = (t) => (ctx, x0, y0, x1, y1) => {
    f0x.setTransform(1, 0, 0, 1, 0, 0); f0x.fillStyle = '#fff'; f0x.fillRect(0, 0, W, H);
    S2.drawFloor0(f0x, t, { cam: [540, 1150, 1.35], crowd: [] });
    ctx.drawImage(f0, 0, 0, W, H, x0 - 200, y0 - 120, (x1 - x0) + 400, (y1 - y0) + 240);
  };

  // 1. The panel: one button
  shot('panel', 0, (ctx, t, lt) => {
    const pr = E.out(inv(K.press, K.press + 0.12, t)) * (1 - 0.6 * inv(K.press + 0.3, K.press + 0.8, t));
    ctx.save(); camera(ctx, 540, lerp(1050, 1250, E.sine(clamp(t / K.close))), lerp(1.0, 1.35, E.sine(clamp(t / K.close))));
    S2.drawCarPanel(ctx, t, { press: pr, finger: inv(K.press - 0.3, K.press, t) * (1 - inv(K.press + 0.4, K.press + 0.7, t)) });
    ctx.restore();
  });
  // 2. Inside the car: doors close on the dark hallway, then down, down, down
  shot('car', K.close, (ctx, t, lt) => {
    const open = 1 - E.inOut(inv(K.doorsClose - 0.1, K.doorsClose + 0.8, t));
    const desc = inv(K.goDown, K.ding, t);
    const [sx, sy] = t > K.goDown ? [(noise1(t * 30) - 0.5) * (6 + 14 * desc), (noise1(t * 30 + 50) - 0.5) * (6 + 14 * desc)] : [0, 0];
    const light = t > K.down3 ? flicker(t * 2, 61, 0.35) : t > K.down2 ? flicker(t, 62, 0.15) : 1;
    ctx.save(); camera(ctx, 540, lerp(1000, 960, desc), lerp(1.0, 1.18, desc), sx, sy);
    S2.drawCarInside(ctx, t, { open, outside: outsideCorridor, light, red: inv(K.down2, K.ding, t) * 0.8, ind: { ch: '0', arrow: t > K.goDown ? 'D' : ' ', arrowBlink: Math.floor(t * 4) % 2 ? 1 : 0.2 },
      char: { x: 540, y: 2230, s: 1.45, view: 'back', arm: 'down', fill: '#5d6889' } });
    ctx.restore();
  });
  // 3. Ding. The doors open on Floor 0
  shot('arrive', K.ding, (ctx, t, lt) => {
    const open = E.inOut(inv(K.open0, K.open0 + 1.0, t));
    const flood = E.out(inv(K.open0, K.open0 + 0.8, t));
    ctx.save(); camera(ctx, 540, 1000, lerp(1.18, 1.32, clamp(lt / 2)));
    S2.drawCarInside(ctx, t, { open, outside: outsideFloor0(t), light: 1, ind: { ch: '0', arrow: ' ' }, char: { x: 540, y: 2230, s: 1.45, view: 'back', arm: 'down', fill: '#5d6889', rim: flood } });
    ctx.restore();
    if (flood > 0) { ctx.fillStyle = `rgba(235,240,255,${0.25 * flood * (1 - inv(K.open0 + 0.8, K.backwards, t))})`; ctx.fillRect(0, 0, W, H); }
  });
  // 4. Your lobby, backwards (and empty, at first glance)
  const me = (o) => ({ color: '#0b1022', fill: '#e8ecf6', view: 'front', arm: 'down', ...o });
  shot('backwards', K.backwards, (ctx, t, lt) => {
    S2.drawFloor0(ctx, t, { cam: [lerp(760, 720, clamp(lt / 2.5)), 1150, lerp(1.08, 1.16, clamp(lt / 2.5))], crowd: [], char: me({ x: 520, y: 1700, s: 0.9 }) });
  });
  // 5. ...and it's full
  shot('full', K.full, (ctx, t, lt) => {
    const [sx, sy] = shake(t, K.full, 14, 0.35);
    S2.drawFloor0(ctx, t, { cam: [540, 1180, lerp(0.74, 0.78, clamp(lt / 1.2))], crowd: S2.CROWD, char: me({ x: 520, y: 1700, s: 0.9 }) });
    void sx; void sy;
  });
  shot('dozens', K.dozens, (ctx, t, lt) => {
    const k = E.inOut(clamp(lt / (K.tall - K.dozens)));
    S2.drawFloor0(ctx, t, { cam: [lerp(80, 1000, k), 1220, 1.15], crowd: S2.CROWD, char: me({ x: 520, y: 1700, s: 0.9 }) });
  });
  // 6. Too tall — tilt up one of them to its bent head
  shot('tall', K.tall, (ctx, t, lt) => {
    const k = E.inOut(clamp(lt / (K.taller - K.tall - 0.2)));
    S2.drawFloor0(ctx, t, { cam: [940, lerp(1330, 830, k), 2.3], crowd: S2.CROWD });
  });
  // 7. The longer you stay... (you stretch)
  shot('taller', K.taller, (ctx, t, lt) => {
    const st = E.inOut(inv(K.taller + 0.6, K.tallerWord + 0.6, t)) * 1.15;
    const [sx, sy] = [(noise1(t * 20) - 0.5) * 3 * st, 0];
    S2.drawFloor0(ctx, t, { cam: [540 + sx, lerp(1580, 1500, st), lerp(1.75, 1.45, st)], crowd: S2.CROWD.filter(c => c.s < 0.85), char: me({ x: 540, y: 1700, s: 1.0, stretch: st, headDY: -st * 20 }) });
  });
  // 8-9. The phone types by itself
  let f0bg = null;
  const bgF0 = (ctx) => {
    if (!f0bg) { f0bg = createCanvas(W, H); const x = f0bg.getContext('2d'); S2.drawFloor0(x, 20, { cam: [540, 1180, 0.8], crowd: S2.CROWD }); }
    ctx.save(); ctx.filter = 'blur(24px) brightness(0.8)'; ctx.drawImage(f0bg, 0, 0); ctx.restore();
  };
  const typed = (t, t0, t1, msg) => msg.slice(0, Math.floor(clamp((t - t0) / (t1 - t0)) * msg.length));
  const keyOf = (s) => { const c = s.slice(-1).toLowerCase(); return /[a-z]/.test(c) ? c : null; };
  shot('buzz', K.buzzShot, (ctx, t, lt) => {
    const b = t - K.buzz; const buzzing = (b > 0 && b < 0.26) || (b > 0.4 && b < 0.66);
    const sh = buzzing ? [(hash(Math.floor(t * 60)) - 0.5) * 18, (hash(Math.floor(t * 60) + 5) - 0.5) * 10] : [0, 0];
    S.drawPhone(ctx, t, { bg: bgF0, screen: 'lock', time: '12:13', shake: sh, scale: 1.12,
      notifs: [{ a: (t - K.buzz) / 0.3, title: 'Messages', lines: [{ text: 'Sending to ' + NUM }], h: 140 }] });
  });
  shot('typing', K.typing, (ctx, t, lt) => {
    const txt = t < K.send1 ? typed(t, K.type0, K.send1 - 0.25, MSG1) : '';
    S.drawPhone(ctx, t, { bg: bgF0, screen: 'chat', contact: { name: NUM, avatar: 'q', hl: t > K.number }, sub: 'New Message · 12:14 AM',
      scale: lerp(1.12, 1.2, E.sine(clamp(lt / (K.rises - K.typing)))),
      bubbles: [{ text: MSG1, a: (t - K.send1) / 0.25, mine: true, delivered: (t - K.didnt + 0.2) / 0.3 }],
      compose: { text: txt, key: t < K.send1 ? keyOf(txt) : null } });
  });
  // 10. The elevator rises — you're facing the wall now (Part 1's shot, from the other side)
  shot('rises', K.rises, (ctx, t, lt) => {
    const rv = 0.75 + 0.25 * inv(K.rises, K.facing, t);
    ctx.save(); camera(ctx, lerp(560, 600, clamp(lt / 3)), 990, lerp(1.0, 1.12, clamp(lt / 3)));
    S.drawInterior(ctx, t, { reveal: rv, entityVis: 1 });
    ctx.restore();
  });
  shot('cant', K.cant, (ctx, t, lt) => {
    const [sx, sy] = [(noise1(t * 26) - 0.5) * 5, (noise1(t * 26 + 9) - 0.5) * 3];
    const spill = E.out(inv(K.lobbyDing + 0.2, K.lookOut, t));
    ctx.save(); camera(ctx, 690, lerp(760, 700, clamp(lt / 1.6)), lerp(2.4, 2.7, clamp(lt / 2.5)), sx, sy);
    S.drawInterior(ctx, t, { reveal: 1, entityVis: 1, rim: 0.6 + 1.2 * spill });
    ctx.restore();
    if (spill > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(0, H, 0, 0); g.addColorStop(0, `rgba(150,170,230,${0.35 * spill})`); g.addColorStop(1, 'rgba(150,170,230,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  });
  // 11. Reverse angle: from the dark corner, out to the lobby — someone is looking in
  function drawLookOut(ctx, t, st) {
    const fl = st.flash || 0;
    // lobby beyond
    let g = ctx.createLinearGradient(0, 380, 0, 1300); g.addColorStop(0, '#151c3a'); g.addColorStop(1, '#0e142b');
    ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, 1600);
    g = ctx.createLinearGradient(0, 1300, 0, 1900); g.addColorStop(0, '#0c1126'); g.addColorStop(1, '#05070e');
    ctx.fillStyle = g; ctx.fillRect(-300, 1300, W + 600, 900);
    ctx.fillStyle = '#1a1f33'; ctx.fillRect(390, 470, 300, 20);
    const L = flicker(t, 77, 0.05);
    ctx.fillStyle = `rgba(225,235,255,${0.3 + 0.7 * L})`; ctx.fillRect(402, 480, 276, 9);
    glow(ctx, 540, 486, 300, 'rgba(170,195,255,A)', 0.32 * L);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    g = ctx.createLinearGradient(0, 490, 0, 1600); g.addColorStop(0, `rgba(150,175,235,${0.12 * L})`); g.addColorStop(1, 'rgba(150,175,235,0)');
    S.poly(ctx, [[400, 490], [680, 490], [1080, 1600], [0, 1600]], g); ctx.restore();
    // the next one: phone in hand, looking in
    drawStick(ctx, { x: 540, y: 1590, s: 1.2, view: 'front', arm: st.shield ? 'shield' : 'phone', lit: 0.9, fill: fl > 0 ? '#ffffff' : C.navy1, color: fl > 0 ? '#0b1022' : C.white });
    if (fl > 0) { ctx.fillStyle = `rgba(255,255,255,${0.86 * fl})`; ctx.fillRect(-300, -300, W + 600, H + 600); drawStick(ctx, { x: 540, y: 1590, s: 1.2, view: 'front', arm: 'shield', fill: '#f4f6fb', color: '#0b1022' }); }
    // the car around us: dark frame, door edges
    ctx.fillStyle = fl > 0 ? '#2a2f44' : '#020306';
    ctx.fillRect(-300, -300, 530, H + 600); ctx.fillRect(850, -300, 600, H + 600); ctx.fillRect(-300, -300, W + 600, 680); ctx.fillRect(-300, 1700, W + 600, 600);
    ctx.fillStyle = '#2a3253'; ctx.fillRect(218, 368, 12, 1340); ctx.fillRect(850, 368, 12, 1340);
    // its arm and long fingers in the foreground, holding a phone
    ctx.save(); ctx.fillStyle = fl > 0 ? '#000' : '#05060b';
    ctx.beginPath(); ctx.moveTo(1180, 900); ctx.quadraticCurveTo(980, 1250, 930, 1640); ctx.lineTo(1010, 1660); ctx.quadraticCurveTo(1060, 1300, 1260, 980); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 12; ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(950 + i * 14, 1630); ctx.quadraticCurveTo(900 + i * 10, 1720, 880 + i * 18, 1810 + (i % 2) * 20); ctx.stroke(); }
    ctx.restore();
    const sc = st.screen ?? 1;
    ctx.save(); ctx.translate(905, 1700); ctx.rotate(-0.25);
    rrect(ctx, -46, -80, 92, 160, 14); ctx.fillStyle = '#0a0c13'; ctx.fill();
    rrect(ctx, -40, -74, 80, 148, 10); ctx.fillStyle = `rgba(190,215,255,${0.85 * sc})`; ctx.fill();
    ctx.restore();
    glow(ctx, 905, 1700, 240, 'rgba(140,180,255,A)', 0.35 * sc);
  }
  shot('lookout', K.lookOut, (ctx, t, lt) => {
    const push = E.inOut(inv(K.lookingIn - 0.1, K.type2Shot, t));
    ctx.save(); camera(ctx, lerp(560, 545, push), lerp(1100, 1250, push), lerp(1.0, 1.55, push));
    drawLookOut(ctx, t, {});
    ctx.restore();
  });
  shot('typing2', K.type2Shot, (ctx, t, lt) => {
    const txt = t < K.send2 ? typed(t, K.type2a, K.send2 - 0.35, MSG2) : '';
    S.drawPhone(ctx, t, { bg: bgF0, screen: 'chat', contact: { name: NUM, avatar: 'q' }, sub: 'New Message · 12:14 AM', scale: lerp(1.18, 1.26, clamp(lt / 2.6)),
      bubbles: [{ text: MSG1, a: 1, mine: true }, { text: MSG2, a: (t - K.send2) / 0.22, mine: true }],
      compose: { text: txt, key: t < K.send2 ? keyOf(txt) : null } });
  });
  // 12. Flash — it's their turn now
  shot('flash', K.flash, (ctx, t, lt) => {
    const f = Math.floor(lt * FPS);
    if (f < 2) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); return; }
    if (f < 9) {
      ctx.save(); camera(ctx, 545, 1250, 1.6 + f * 0.01);
      drawLookOut(ctx, t, { flash: f < 6 ? 1 : lerp(1, 0.5, (f - 6) / 3), shield: true, screen: 0 });
      ctx.restore();
      return;
    }
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const a = 0.45 * Math.exp(-(lt - 9 / FPS) * 3);
    ctx.save(); ctx.globalAlpha = a; camera(ctx, 545, 1250, 1.65);
    drawStick(ctx, { x: 540, y: 1590, s: 1.2, view: 'front', arm: 'shield', fill: '#000', color: '#3f6f7a' });
    ctx.restore();
  }, { captions: false, hideHud: lt => lt * FPS < 9 });
  // 13. Rule #3
  shot('rule', K.rule, (ctx, t, lt) => {
    S2.drawRuleCard(ctx, t, lt, { title: 'RULE #3',
      lines: [{ text: 'FLOOR [0] IS NEVER', t: Wd(24, 3) }, { text: '{EMPTY} FOR LONG.', t: Wd(24, 7) }],
      footer: 'THE END?', footerT: Ln(24).end + 0.15, footer2: 'START AGAIN FROM PART 1' });
  }, { captions: false, vignette: 0.45 });
  // 14. Loop tag: Part 1's first second
  shot('loop', K.loop, (ctx, t, lt) => {
    shot1('indicator_down').draw(ctx, lt * 0.9, lt * 0.9);
    ctx.save(); ctx.globalAlpha = clamp(lt / 0.2); ctx.font = '26px Mono700'; ctx.fillStyle = C.red; ctx.textBaseline = 'alphabetic';
    spaced(ctx, 'PART 1', 1016, 186, 3, 'right'); ctx.restore();
  }, { captions: false });

  return { shots, K, hudState };
};
