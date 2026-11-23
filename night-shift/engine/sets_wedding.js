// NIGHT SHIFT Ep 8 — the wedding hall (v4 look). Palette: marigold + crimson + tungsten gold; lights-off = teal moonlight.
// Hall world = 1080x1920 frame seen from the back of the aisle. Stage front edge y=1010, vanishing point (540, 880).
const D = require('./draw');
const L = require('./look4');
const { clamp, lerp, E, hash, noise1, flicker } = D;
const { mix, rgba, dust, beam } = L;

const STAGE_Y = 1010, VPX = 540, VPY = 880;
const BRIDE = { x: 430, y: STAGE_Y, h: 600 };
const PAL = {
  wall: ['#4a1512', '#0a141d'], wall2: ['#5e1d16', '#0d1a25'], ceil: ['#24100b', '#060c12'], floor: ['#3a2216', '#08121a'],
  drape: ['#efe3cc', '#22323f'], drape2: ['#cdb48c', '#16222c'], skirt: ['#7a1418', '#0f1a24'], gold: ['#e3a53c', '#55708a'], mari: ['#ff9d1c', '#3f5468'],
  mari2: ['#ffc23a', '#4c6378'], cover: ['#efe4d2', '#4a6076'], coverS: ['#bfae96', '#2c3c4c'], carpet: ['#9c1d22', '#13202b'],
};
const P = (k, lt) => mix(PAL[k][0], PAL[k][1], 1 - lt);

// ---------------------------------------------------------------- people
// generic person, feet at (x,y), height h. view 'front' | 'back'. rim = light colour, rimSide -1 left / +1 right
function person(ctx, x, y, h, o = {}) {
  const u = h / 100, dark = o.col || '#120c0b', rim = o.rim || '#ffb46a', rs = o.rimSide ?? 1;
  const walk = o.walk ?? null, sw = walk === null ? 0 : Math.sin(walk);
  const aL = o.armL ?? 0.08, aR = o.armR ?? -0.08;
  ctx.save(); ctx.translate(x, y);
  if (o.lean) ctx.rotate(o.lean);
  const body = () => {
    ctx.beginPath();
    // legs
    const lx = 4.6 * u, st = sw * 5 * u;
    ctx.moveTo(-9 * u, -47 * u); ctx.lineTo(-lx - 3 * u + st, -1 * u); ctx.lineTo(-lx + 4 * u + st, 0); ctx.lineTo(-0.8 * u, -40 * u);
    ctx.lineTo(lx - 4 * u - st, 0); ctx.lineTo(lx + 3 * u - st, -1 * u); ctx.lineTo(9 * u, -47 * u); ctx.closePath();
    // kurta / torso
    ctx.moveTo(-11.5 * u, -79.5 * u);
    ctx.bezierCurveTo(-13 * u, -70 * u, -10 * u, -50 * u, -11 * u, -32 * u);
    ctx.lineTo(11 * u, -32 * u);
    ctx.bezierCurveTo(10 * u, -50 * u, 13 * u, -70 * u, 11.5 * u, -79.5 * u);
    ctx.quadraticCurveTo(0, -83.5 * u, -11.5 * u, -79.5 * u); ctx.closePath();
    // neck
    ctx.rect(-2.6 * u, -85 * u, 5.2 * u, 6 * u);
    // head
    ctx.moveTo((o.headX || 0) * u + 6.1 * u, -91 * u); ctx.ellipse((o.headX || 0) * u, -91 * u, 6.1 * u, 7.6 * u, 0, 0, Math.PI * 2);
  };
  const arm = (side, ang) => {
    ctx.save(); ctx.translate(side * 11 * u, -78 * u); ctx.rotate(ang + (walk === null ? 0 : -side * sw * 0.18));
    ctx.moveTo(-2.8 * u, 0); ctx.lineTo(2.8 * u, 0); ctx.lineTo(2 * u, 34 * u); ctx.lineTo(-2 * u, 34 * u); ctx.closePath();
    ctx.moveTo(2.4 * u, 36 * u); ctx.ellipse(0, 36 * u, 2.4 * u, 3.4 * u, 0, 0, Math.PI * 2);
    ctx.restore();
  };
  const all = () => { body(); arm(-1, aL); arm(1, aR); };
  // rim light: fill rim colour, then the dark body shifted away from the light
  ctx.save(); all(); ctx.fillStyle = rim; ctx.fill();
  ctx.clip();
  ctx.translate(-rs * 1.6 * u, 0.6 * u); all(); ctx.fillStyle = dark; ctx.fill();
  ctx.restore();
  // hair
  ctx.fillStyle = '#060404';
  ctx.beginPath(); ctx.ellipse((o.headX || 0) * u, -95 * u, 6.4 * u, 4.6 * u, 0, Math.PI, 0); ctx.fill();
  if (o.view === 'back') { ctx.beginPath(); ctx.ellipse((o.headX || 0) * u, -92 * u, 6.2 * u, 6.8 * u, 0, 0, Math.PI * 2); ctx.fill(); }
  // eyes (front view): pale points that widen with fear
  if (o.view !== 'back' && o.eyes !== false) {
    const f = o.fear || 0, ex = (o.headX || 0) * u + (o.look || 0) * 1.2 * u;
    for (const s of [-1, 1]) {
      ctx.fillStyle = rgba('#fff4e6', 0.85); ctx.beginPath(); ctx.ellipse(ex + s * 2.4 * u, -91.5 * u, (0.8 + f * 0.5) * u, (0.6 + f * 0.7) * u * (o.blink ? 0.15 : 1), 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  // marigold garland (the groom)
  if (o.garland) {
    for (let i = 0; i <= 18; i++) {
      const a = Math.PI * (0.08 + 0.84 * i / 18);
      const gx = Math.cos(a) * 10 * u, gy = -80 * u + Math.sin(a) * 26 * u;
      ctx.fillStyle = i % 3 ? '#ff9d1c' : '#ffc23a'; ctx.beginPath(); ctx.arc(gx, gy, 2.1 * u, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

// a seated guest seen from behind/turning: head + shoulders above a chair back. turn 0 = facing stage, 1 = faces camera
function guestBust(ctx, x, y, s, turn, lt, seed, t) {
  const v = hash(seed * 13.7);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const sk = mix('#1a1110', '#05090d', 1 - lt);
  ctx.fillStyle = sk;
  ctx.beginPath(); ctx.moveTo(-34, 30); ctx.bezierCurveTo(-34, -6, -22, -14, 0, -15); ctx.bezierCurveTo(22, -14, 34, -6, 34, 30); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.rect(-6, -28, 12, 16); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -42, 15, 19, 0, 0, Math.PI * 2); ctx.fill();
  if (v < 0.33) { ctx.beginPath(); ctx.arc(0, -58, 8, 0, Math.PI * 2); ctx.fill(); }        // bun
  else if (v < 0.5) { ctx.fillStyle = mix('#5a1a12', '#0b1620', 1 - lt); ctx.beginPath(); ctx.ellipse(0, -52, 17, 11, 0, Math.PI, 0); ctx.fill(); } // turban
  else if (v < 0.75) { ctx.fillStyle = mix('#4a1830', '#0a1420', 1 - lt); ctx.beginPath(); ctx.moveTo(-17, -46); ctx.quadraticCurveTo(0, -70, 17, -46); ctx.lineTo(30, 20); ctx.lineTo(-30, 20); ctx.closePath(); ctx.globalAlpha = 0.85; ctx.fill(); ctx.globalAlpha = 1; } // dupatta
  // rim light from the stage (top)
  ctx.strokeStyle = rgba(lt > 0.5 ? '#ffb46a' : '#86b4d8', 0.55); ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.ellipse(0, -42, 15, 19, 0, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  if (turn > 0.02) {
    // the face turning to camera: a pale oval slides into view, then two eyes
    const k = clamp(turn);
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, -42, 15, 19, 0, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = rgba('#d9c8b4', 0.16 * k); ctx.beginPath(); ctx.ellipse(lerp(26, 0, k), -40, 12, 16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    const ea = clamp((k - 0.5) * 2);
    if (ea > 0) {
      const bl = (t + seed) % 4.7 < 0.1 ? 0.1 : 1;
      for (const sx of [-5.5, 5.5]) { ctx.fillStyle = rgba('#fff1dc', 0.95 * ea); ctx.beginPath(); ctx.ellipse(sx + lerp(10, 0, k), -43, 2.6, 2.6 * bl, 0, 0, Math.PI * 2); ctx.fill(); }
      D.glow(ctx, 0, -43, 26, 'rgba(255,230,200,A)', 0.12 * ea);
    }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- the bride
// feet at (x,y), height h (straight). o: bend (rad, head pushed sideways), arms 'hang'|'reach'|'book', walk phase, glint, open
function bride(ctx, x, y, h, t, o = {}) {
  const u = h / 100, sw = o.walk != null ? Math.sin(o.walk) : 0, breathe = Math.sin(t * 1.3) * 0.4 * u;
  const lt = o.light ?? 1;
  const red = mix('#a5161c', '#1d2a38', 1 - lt), red2 = mix('#6c0d12', '#111c27', 1 - lt), gold = mix('#f0b443', '#6f8aa3', 1 - lt);
  ctx.save(); ctx.translate(x, y);
  // shadow pool
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.ellipse(0, 0, 30 * u, 3.5 * u, 0, 0, Math.PI * 2); ctx.fill();
  // lehenga (bell skirt)
  const hem = 25 * u, sway = sw * 3 * u;
  const g = ctx.createLinearGradient(-hem, 0, hem, 0); g.addColorStop(0, red2); g.addColorStop(0.45, red); g.addColorStop(1, red2);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-6.5 * u, -50 * u);
  ctx.bezierCurveTo(-12 * u, -30 * u, -hem + sway, -8 * u, -hem + sway, 0);
  ctx.lineTo(hem + sway, 0); ctx.bezierCurveTo(hem + sway, -8 * u, 12 * u, -30 * u, 6.5 * u, -50 * u); ctx.closePath(); ctx.fill();
  // gold border + embroidery
  ctx.strokeStyle = gold; ctx.lineWidth = 2.2 * u; ctx.beginPath(); ctx.moveTo(-hem + sway, -2 * u); ctx.lineTo(hem + sway, -2 * u); ctx.stroke();
  ctx.lineWidth = 0.6 * u; ctx.beginPath(); ctx.moveTo(-hem + sway + 1 * u, -5 * u); ctx.lineTo(hem + sway - 1 * u, -5 * u); ctx.stroke();
  ctx.globalAlpha = 0.5; ctx.lineWidth = 0.35 * u;
  for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 1.6 * u, -49 * u); ctx.quadraticCurveTo(i * 4 * u, -25 * u, i * 7.5 * u + sway, -6 * u); ctx.stroke(); }
  ctx.globalAlpha = 1;
  for (let i = 0; i < 14; i++) { const bx = lerp(-hem + 3 * u, hem - 3 * u, i / 13) + sway; D.glow(ctx, bx, -3.5 * u, 2.2 * u, 'rgba(255,214,120,A)', 0.5 * lt); }
  // too-long torso
  ctx.fillStyle = red; ctx.beginPath(); ctx.moveTo(-6.5 * u, -50 * u); ctx.lineTo(-8.2 * u, -79 * u + breathe); ctx.lineTo(8.2 * u, -79 * u + breathe); ctx.lineTo(6.5 * u, -50 * u); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = gold; ctx.lineWidth = 1 * u; ctx.beginPath(); ctx.moveTo(-6.6 * u, -51 * u); ctx.lineTo(6.6 * u, -51 * u); ctx.stroke();
  // arms
  const arm = (side) => {
    ctx.save(); ctx.translate(side * 8 * u, -77 * u + breathe);
    let ang = side * 0.05 - side * sw * 0.06, len = 47 * u;
    if (o.arms === 'reach') { ang = side > 0 ? -0.55 : 0.15; len = 44 * u; }
    if (o.arms === 'book') { ang = side * -0.5; len = 30 * u; }
    ctx.rotate(ang);
    ctx.fillStyle = red2; ctx.beginPath(); ctx.moveTo(-2 * u, 0); ctx.lineTo(2 * u, 0); ctx.lineTo(1.4 * u, len); ctx.lineTo(-1.4 * u, len); ctx.closePath(); ctx.fill();
    // bangles
    for (let b = 0; b < 5; b++) { ctx.strokeStyle = b % 2 ? gold : mix('#d2232a', '#2a3a4a', 1 - lt); ctx.lineWidth = 0.7 * u; ctx.beginPath(); ctx.moveTo(-1.8 * u, len - 9 * u + b * 1.1 * u); ctx.lineTo(1.8 * u, len - 9 * u + b * 1.1 * u); ctx.stroke(); }
    // mehndi hand, long fingers
    const hc = mix('#9c4a24', '#2b3a48', 1 - lt);
    ctx.fillStyle = hc; ctx.beginPath(); ctx.ellipse(0, len + 2.2 * u, 1.9 * u, 3 * u, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = hc; ctx.lineCap = 'round'; ctx.lineWidth = 0.75 * u;
    for (let f = -2; f <= 2; f++) { const cl = Math.sin(t * 2 + f + side) * 0.06; ctx.beginPath(); ctx.moveTo(f * 0.7 * u, len + 4 * u); ctx.quadraticCurveTo(f * 0.95 * u, len + 9 * u, f * 0.6 * u + cl * 30 * u, len + (12 - Math.abs(f) * 1.2) * u); ctx.stroke(); }
    ctx.restore();
  };
  arm(-1); arm(1);
  // head + veil, rotated by bend about the neck
  ctx.save(); ctx.translate(0, -80 * u + breathe); ctx.rotate(o.bend || 0);
  // veil back drape (falls behind shoulders)
  ctx.fillStyle = rgba(mix('#c0262b', '#22313f', 1 - lt).startsWith('rgb') ? '#b3202a' : '#b3202a', 0);
  const vg = ctx.createLinearGradient(0, -24 * u, 0, 30 * u); vg.addColorStop(0, mix('#c4232b', '#24344a', 1 - lt)); vg.addColorStop(1, mix('#7d1016', '#121d28', 1 - lt));
  ctx.fillStyle = vg; ctx.globalAlpha = 0.92;
  ctx.beginPath(); ctx.moveTo(0, -21 * u); ctx.bezierCurveTo(-9 * u, -20 * u, -10 * u, -6 * u, -11 * u, 2 * u); ctx.lineTo(-12 * u, 26 * u);
  ctx.quadraticCurveTo(0, 29 * u, 12 * u, 26 * u); ctx.lineTo(11 * u, 2 * u); ctx.bezierCurveTo(10 * u, -6 * u, 9 * u, -20 * u, 0, -21 * u); ctx.fill();
  ctx.globalAlpha = 1;
  // head under the veil
  ctx.fillStyle = mix('#8d1419', '#1a2633', 1 - lt); ctx.beginPath(); ctx.ellipse(0, -10 * u, 6.8 * u, 9 * u, 0, 0, Math.PI * 2); ctx.fill();
  // net texture
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, -10 * u, 6.8 * u, 9 * u, 0, 0, Math.PI * 2); ctx.clip();
  ctx.strokeStyle = rgba('#ffd28a', 0.12 * lt + 0.05); ctx.lineWidth = 0.25 * u;
  for (let i = -12; i <= 12; i++) { ctx.beginPath(); ctx.moveTo(i * 1.2 * u - 10 * u, -20 * u); ctx.lineTo(i * 1.2 * u + 10 * u, 0); ctx.stroke(); ctx.beginPath(); ctx.moveTo(i * 1.2 * u + 10 * u, -20 * u); ctx.lineTo(i * 1.2 * u - 10 * u, 0); ctx.stroke(); }
  // shading
  const sh = ctx.createLinearGradient(-7 * u, 0, 7 * u, 0); sh.addColorStop(0, 'rgba(0,0,0,0.45)'); sh.addColorStop(0.5, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = sh; ctx.fillRect(-8 * u, -20 * u, 16 * u, 22 * u);
  ctx.restore();
  // gold veil border
  ctx.strokeStyle = gold; ctx.lineWidth = 0.9 * u; ctx.beginPath(); ctx.ellipse(0, -10 * u, 7.2 * u, 9.4 * u, 0, Math.PI * 0.85, Math.PI * 2.15); ctx.stroke();
  // the sewn seam (front): gold X stitches
  const op = o.open || 0;
  if (op > 0) { ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(0, -9 * u, 1.6 * u * op, 7 * u, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = gold; ctx.lineWidth = 0.4 * u;
  ctx.beginPath(); ctx.moveTo(0, -18 * u); ctx.lineTo(0, -2 * u); ctx.stroke();
  for (let i = 0; i < 7; i++) { const sy = -17 * u + i * 2.3 * u; ctx.beginPath(); ctx.moveTo(-1 * u, sy - 0.8 * u); ctx.lineTo(1 * u, sy + 0.8 * u); ctx.moveTo(1 * u, sy - 0.8 * u); ctx.lineTo(-1 * u, sy + 0.8 * u); ctx.stroke(); }
  // maang tikka glint
  D.glow(ctx, 0, -17.5 * u, 4 * u, 'rgba(255,226,150,A)', (0.5 + 0.5 * Math.sin(t * 3)) * (0.4 + 0.6 * lt));
  if (o.eyes) { for (const s of [-1, 1]) { ctx.fillStyle = rgba('#fff3e0', o.eyes); ctx.beginPath(); ctx.ellipse(s * 2.4 * u, -11 * u, 0.9 * u, 0.6 * u, 0, 0, Math.PI * 2); ctx.fill(); } }
  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------- the hall
function marigoldString(ctx, x, y0, y1, r, lt, t, seed, swayA = 1) {
  const n = Math.floor((y1 - y0) / (r * 1.7));
  for (let i = 0; i <= n; i++) {
    const k = i / Math.max(1, n), sx = Math.sin(t * 0.9 + seed + k * 2) * 3 * k * swayA;
    ctx.fillStyle = (i + seed) % 4 === 0 ? P('mari2', lt) : P('mari', lt);
    ctx.beginPath(); ctx.arc(x + sx, y0 + i * r * 1.7, r, 0, Math.PI * 2); ctx.fill();
  }
}
function chandelier(ctx, x, y, s, lt, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = P('gold', lt); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -120); ctx.lineTo(0, 0); ctx.stroke();
  for (let ring = 0; ring < 3; ring++) {
    const rw = 60 + ring * 28, ry = ring * 26;
    ctx.beginPath(); ctx.ellipse(0, ry, rw, 9, 0, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 9 + ring * 3; i++) {
      const a = i / (9 + ring * 3) * Math.PI * 2 + ring, dx = Math.cos(a) * rw, dy = ry + Math.sin(a) * 9;
      ctx.fillStyle = rgba('#fff2cc', 0.25 + 0.6 * lt); ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx - 3, dy + 14); ctx.lineTo(dx, dy + 22); ctx.lineTo(dx + 3, dy + 14); ctx.closePath(); ctx.fill();
    }
  }
  ctx.restore();
  if (lt > 0.05) { D.glow(ctx, x, y + 30 * s, 260 * s, 'rgba(255,196,120,A)', 0.55 * lt * flicker(t, x)); D.glow(ctx, x, y + 30 * s, 70 * s, 'rgba(255,246,220,A)', 0.8 * lt); }
}
function throne(ctx, x, y, s, lt) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const gold = P('gold', lt), red = mix('#9a1820', '#16222c', 1 - lt), red2 = mix('#6c0d12', '#0f1a24', 1 - lt);
  ctx.fillStyle = gold; ctx.beginPath(); ctx.moveTo(-62, -60); ctx.lineTo(-62, -150); ctx.bezierCurveTo(-62, -235, 62, -235, 62, -150); ctx.lineTo(62, -60); ctx.closePath(); ctx.fill();
  ctx.fillStyle = red; ctx.beginPath(); ctx.moveTo(-46, -62); ctx.lineTo(-46, -150); ctx.bezierCurveTo(-46, -212, 46, -212, 46, -150); ctx.lineTo(46, -62); ctx.closePath(); ctx.fill();
  ctx.fillStyle = red2; ctx.fillRect(-70, -64, 140, 30);                 // seat cushion
  ctx.fillStyle = gold; ctx.fillRect(-84, -100, 20, 100); ctx.fillRect(64, -100, 20, 100);   // arms
  ctx.beginPath(); ctx.arc(-74, -102, 14, 0, Math.PI * 2); ctx.arc(74, -102, 14, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-66, -34, 8, 34); ctx.fillRect(58, -34, 8, 34);
  ctx.restore();
}
function chairRowY(j) { const k = j / 7; return 1095 + 860 * Math.pow(k, 1.7); }
function chairRowS(j) { const k = j / 7; return 0.36 + 1.05 * Math.pow(k, 1.7); }

// o: light (1 warm .. 0 dark), bride (obj|null), guests 0..1, turn 0..1, band (bool), groom (person on throne), me (person opts)
function hall(ctx, t, o = {}) {
  const lt = o.light ?? 1;
  // ceiling + walls
  ctx.fillStyle = P('ceil', lt); ctx.fillRect(-600, -400, 2280, 760);
  ctx.fillStyle = P('wall', lt);
  ctx.beginPath(); ctx.moveTo(-600, -400); ctx.lineTo(180, 300); ctx.lineTo(180, 1010); ctx.lineTo(-600, 2400); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(1680, -400); ctx.lineTo(900, 300); ctx.lineTo(900, 1010); ctx.lineTo(1680, 2400); ctx.closePath(); ctx.fill();
  // pillars with fairy lights on the side walls
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
    const k = i / 4, px = s < 0 ? lerp(150, -260, k * k + k * 0.4) : lerp(930, 1340, k * k + k * 0.4);
    const top = lerp(270, -200, k), bot = lerp(1040, 1900, k), w = lerp(26, 90, k);
    ctx.fillStyle = P('wall2', lt); ctx.fillRect(px - w / 2, top, w, bot - top);
    if (lt > 0.05) for (let j = 0; j < 14; j++) { const fy = lerp(top, bot, j / 14); D.glow(ctx, px + Math.sin(j * 1.7) * w * 0.3, fy, lerp(6, 16, k), 'rgba(255,214,150,A)', 0.7 * lt * (0.6 + 0.4 * Math.sin(t * 4 + j + i))); }
  }
  // back wall = stage backdrop: crimson drapes, flower arch
  const bw = ctx.createLinearGradient(0, 300, 0, 1010); bw.addColorStop(0, P('drape2', lt)); bw.addColorStop(1, P('drape', lt));
  ctx.fillStyle = bw; ctx.fillRect(180, 300, 720, 710);
  ctx.strokeStyle = rgba('#7a5a30', 0.22); ctx.lineWidth = 5;
  for (let i = 0; i < 18; i++) { const dx = 190 + i * 40; ctx.beginPath(); ctx.moveTo(dx, 300); ctx.quadraticCurveTo(dx + 14, 650, dx, 1010); ctx.stroke(); }
  // flower arch behind the thrones
  for (let i = 0; i <= 40; i++) { const a = Math.PI * (1 + i / 40), ax = 540 + Math.cos(a) * 330, ay = 1000 + Math.sin(a) * 520; ctx.fillStyle = i % 2 ? P('mari', lt) : P('mari2', lt); ctx.globalAlpha = 0.5 + 0.5 * lt; ctx.beginPath(); ctx.arc(ax, ay, 13, 0, Math.PI * 2); ctx.fill(); }
  ctx.globalAlpha = 1;
  if (lt > 0.05) D.glow(ctx, 540, 640, 420, 'rgba(255,190,120,A)', 0.25 * lt);
  // stage floor + front skirting
  ctx.fillStyle = mix('#5a2a1a', '#0a131b', 1 - lt); ctx.fillRect(130, 980, 820, 32);
  ctx.fillStyle = P('skirt', lt); ctx.fillRect(120, 1010, 840, 52);
  for (let i = 0; i < 28; i++) { ctx.fillStyle = i % 2 ? P('mari', lt) : P('mari2', lt); ctx.beginPath(); ctx.arc(130 + i * 30.5, 1014 + Math.abs(Math.sin(i * 0.9)) * 6, 8, 0, Math.PI * 2); ctx.fill(); }
  // stage steps (centre)
  ctx.fillStyle = mix('#6b2a1d', '#0c1720', 1 - lt); ctx.fillRect(460, 1062, 160, 12); ctx.fillRect(445, 1074, 190, 12);
  // thrones
  throne(ctx, 430, 1000, 1.0, lt); throne(ctx, 650, 1000, 1.0, lt);
  // band corner (stage right)
  if (o.band !== false) {
    ctx.fillStyle = mix('#7a3b1e', '#18252f', 1 - lt); ctx.fillRect(812, 930, 70, 60);            // harmonium
    ctx.fillStyle = mix('#c48a4a', '#2c3e4e', 1 - lt); ctx.beginPath(); ctx.ellipse(230, 950, 34, 26, 0, 0, Math.PI * 2); ctx.fill(); // dhol
  }
  // groom on his throne (after the twist)
  if (o.groom) person(ctx, 650, 1012, 270, { view: 'front', rim: '#ffbe7a', rimSide: -1, garland: true, ...o.groom });
  // the bride
  if (o.bride) bride(ctx, o.bride.x ?? BRIDE.x, o.bride.y ?? BRIDE.y, o.bride.h ?? BRIDE.h, t, { light: lt, ...o.bride });
  // marigold strings: hang over the stage (in front of the bride's head) + swags
  for (let i = 0; i < 14; i++) {
    const x = 200 + i * 52, len = 400 + Math.sin(i * 1.3) * 40 + (o.stringsPush && Math.abs(x - (o.stringsPush.x)) < 90 ? 0 : 0);
    let sw = 1; if (o.stringsPush) { const d = Math.abs(x - o.stringsPush.x); if (d < 110) sw = 4 * o.stringsPush.k; }
    marigoldString(ctx, x, 300, 300 + len * 0.3 + 40, 6, lt, t, i, sw);
  }
  for (let s = 0; s < 2; s++) { for (let i = 0; i <= 36; i++) { const k = i / 36, ax = lerp(180, 900, k), ay = 310 + s * 24 + Math.sin(k * Math.PI) * 50; ctx.fillStyle = (i + s) % 2 ? P('mari', lt) : P('mari2', lt); ctx.beginPath(); ctx.arc(ax, ay, 9, 0, Math.PI * 2); ctx.fill(); } }
  // chandeliers
  chandelier(ctx, 540, 150, 1.0, lt * (o.chand ?? 1), t); chandelier(ctx, 250, 210, 0.6, lt, t + 1); chandelier(ctx, 830, 210, 0.6, lt, t + 2);
  // hall floor
  const fg = ctx.createLinearGradient(0, 1060, 0, 1920); fg.addColorStop(0, P('floor', lt)); fg.addColorStop(1, mix('#1c0f0a', '#03070a', 1 - lt));
  ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(120, 1062); ctx.lineTo(960, 1062); ctx.lineTo(1800, 2400); ctx.lineTo(-720, 2400); ctx.closePath(); ctx.fill();
  // aisle carpet
  ctx.fillStyle = P('carpet', lt); ctx.beginPath(); ctx.moveTo(470, 1086); ctx.lineTo(610, 1086); ctx.lineTo(820, 2400); ctx.lineTo(260, 2400); ctx.closePath(); ctx.fill();
  if (lt > 0.05) { ctx.globalAlpha = 0.18 * lt; ctx.fillStyle = '#ffcf8a'; ctx.beginPath(); ctx.ellipse(540, 1250, 200, 60, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
  // walking figure in the aisle (behind chairs of nearer rows): drawn by caller via o.inAisle(ctx) between rows
  // chairs + guests, far to near
  for (let j = 0; j <= 7; j++) {
    const y = chairRowY(j), s = chairRowS(j), aisle = 90 * s + 20;
    if (o.inAisle && o.inAisle.row === j) o.inAisle.draw(ctx);
    for (const side of [-1, 1]) for (let c = 0; c < 4; c++) {
      const x = 540 + side * (aisle + (c + 0.5) * 112 * s);
      const seed = j * 10 + c * 2 + (side > 0 ? 1 : 0);
      // guest (seated, above the chair back)
      if ((o.guests || 0) > 0) {
        const ga = clamp((o.guests - hash(seed) * 0.4) / 0.6);
        if (ga > 0) {
          ctx.save(); ctx.globalAlpha = ga;
          const delay = hash(seed * 3.3) * 0.25;
          guestBust(ctx, x, y - 62 * s, s * 1.05, clamp(((o.turn || 0) - delay) / 0.75), lt, seed, t);
          if (o.clap) { const cp = Math.abs(Math.sin((t * 2.2 + hash(seed) * 0.15) * Math.PI)); ctx.fillStyle = mix('#2a1a14', '#08121a', 1 - lt); for (const hs of [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + hs * lerp(4, 22, cp) * s, y - 80 * s, 6 * s, 9 * s, 0, 0, Math.PI * 2); ctx.fill(); } }
          ctx.restore();
        }
      }
      // chair back: white cover + gold sash
      ctx.fillStyle = P('cover', lt);
      ctx.beginPath(); D.rrect(ctx, x - 40 * s, y - 70 * s, 80 * s, 92 * s, 14 * s); ctx.fill();
      ctx.fillStyle = P('coverS', lt); ctx.fillRect(x - 40 * s, y + 4 * s, 80 * s, 18 * s);
      ctx.fillStyle = P('gold', lt); ctx.fillRect(x - 40 * s, y - 30 * s, 80 * s, 14 * s);
      ctx.beginPath(); ctx.moveTo(x - 8 * s, y - 23 * s); ctx.lineTo(x - 20 * s, y + 10 * s); ctx.lineTo(x - 2 * s, y - 16 * s); ctx.lineTo(x + 14 * s, y + 12 * s); ctx.lineTo(x + 6 * s, y - 23 * s); ctx.fill();
    }
  }
  if (o.inAisle && o.inAisle.row === 8) o.inAisle.draw(ctx);
  // dust in the chandelier light
  if (lt > 0.1) dust(ctx, t, 140, 200, 800, 900, 50, '#ffe2b0', 0.45 * lt, 3);
  else dust(ctx, t, 140, 200, 800, 900, 30, '#a9c8e8', 0.3, 5);
  // moonlight through a high side window when dark
  if (lt < 0.95) beam(ctx, 980, 120, 0.55, 1500, 60, 520, '#7fb0d8', 0.12 * (1 - lt));
}

// ---------------------------------------------------------------- inserts
function veilClose(ctx, t, o = {}) {
  const lt = o.light ?? 1, op = o.open || 0;
  const bg = ctx.createRadialGradient(540, 900, 50, 540, 900, 1100); bg.addColorStop(0, '#3a0c0e'); bg.addColorStop(1, '#0a0203');
  ctx.fillStyle = bg; ctx.fillRect(-200, -200, 1480, 2320);
  // marigold strings out of focus in front (drawn later by caller); head shape under net
  ctx.save(); ctx.translate(540, 940); ctx.rotate(o.bend || 0);
  const hg = ctx.createRadialGradient(-80, -160, 40, 0, 0, 520); hg.addColorStop(0, mix('#d42a30', '#304a62', 1 - lt)); hg.addColorStop(0.6, mix('#8d1419', '#1a2633', 1 - lt)); hg.addColorStop(1, '#2a0507');
  ctx.fillStyle = hg; ctx.beginPath(); ctx.ellipse(0, 0, 360, 470, 0, 0, Math.PI * 2); ctx.fill();
  // a face pressing from inside: brow ridge, nose, too-wide mouth shadow
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 110, -40, 70, 36, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.beginPath(); ctx.ellipse(0, 210, 150, 26, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,160,140,0.10)'; ctx.beginPath(); ctx.ellipse(0, 70, 30, 80, 0, 0, Math.PI * 2); ctx.fill();
  // net texture
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 360, 470, 0, 0, Math.PI * 2); ctx.clip();
  ctx.strokeStyle = 'rgba(255,200,150,0.10)'; ctx.lineWidth = 1.4;
  for (let i = -60; i <= 60; i++) { ctx.beginPath(); ctx.moveTo(i * 14 - 500, -520); ctx.lineTo(i * 14 + 500, 520); ctx.stroke(); ctx.beginPath(); ctx.moveTo(i * 14 + 500, -520); ctx.lineTo(i * 14 - 500, 520); ctx.stroke(); }
  // the seam opening: a dark lens
  if (op > 0) {
    const gw = 150 * E.inOut(op);
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.moveTo(0, -330); ctx.quadraticCurveTo(gw, 0, 0, 360); ctx.quadraticCurveTo(-gw, 0, 0, -330); ctx.fill();
    const ea = clamp((op - 0.35) / 0.4);
    if (ea > 0) {
      for (const s of [-1, 1]) { ctx.fillStyle = rgba('#fff4e0', ea); ctx.beginPath(); ctx.ellipse(s * 26 * E.inOut(op), -40, 9, 6, 0, 0, Math.PI * 2); ctx.fill(); D.glow(ctx, s * 26, -40, 50, 'rgba(255,240,220,A)', 0.35 * ea); }
      ctx.strokeStyle = rgba('#e9ddd0', 0.8 * clamp((op - 0.6) / 0.3)); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-gw * 0.5, 150); ctx.quadraticCurveTo(0, 175 + 30 * op, gw * 0.5, 150); ctx.stroke();
    }
  }
  ctx.restore();
  // gold border at the forehead
  ctx.strokeStyle = mix('#f0b443', '#6f8aa3', 1 - lt); ctx.lineWidth = 16; ctx.beginPath(); ctx.ellipse(0, 0, 368, 478, 0, Math.PI * 1.12, Math.PI * 1.88); ctx.stroke();
  // stitches down the seam (they snap one by one from the bottom when opening)
  const N = 11;
  for (let i = 0; i < N; i++) {
    const sy = -300 + i * 60, snap = clamp((op * 1.25 - (N - 1 - i) / N) * 4);
    const fly = E.out(snap), dx = (hash(i) - 0.5) * 300 * fly, dy = -120 * fly + 400 * fly * fly;
    ctx.save(); ctx.translate(dx * (i % 2 ? 1 : -1), sy + dy); ctx.rotate(fly * (hash(i * 3) - 0.5) * 6);
    ctx.globalAlpha = 1 - snap * 0.7;
    ctx.strokeStyle = mix('#ffcf6a', '#9ab6cf', 1 - lt); ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-22, -18); ctx.lineTo(22, 18); ctx.moveTo(22, -18); ctx.lineTo(-22, 18); ctx.stroke();
    ctx.restore();
  }
  // tikka
  D.glow(ctx, 0, -380, 60, 'rgba(255,226,150,A)', 0.6 + 0.3 * Math.sin(t * 3));
  ctx.fillStyle = '#ffd27a'; ctx.beginPath(); ctx.moveTo(0, -410); ctx.lineTo(16, -380); ctx.lineTo(0, -350); ctx.lineTo(-16, -380); ctx.closePath(); ctx.fill();
  ctx.restore();
}

// the note in your hand, tilted, half in shadow
function note(ctx, t, o = {}) {
  ctx.save(); ctx.translate(560, 930); ctx.rotate(-0.1 + Math.sin(t * 0.8) * 0.01);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(-330, -210, 680, 450);
  const pg = ctx.createLinearGradient(-340, 0, 340, 0); pg.addColorStop(0, '#efe2c6'); pg.addColorStop(0.65, '#d9c7a4'); pg.addColorStop(1, '#6d5a40');
  ctx.fillStyle = pg; ctx.beginPath(); ctx.moveTo(-340, -230); ctx.lineTo(330, -220); ctx.lineTo(340, 210); ctx.lineTo(-330, 225); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(80,50,20,0.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-10, -225); ctx.lineTo(5, 218); ctx.stroke(); // fold
  ctx.fillStyle = '#2a1608'; ctx.font = '66px Serif4i'; ctx.textAlign = 'left';
  const a1 = clamp((t - (o.l1 || 0)) / 0.25), a2 = clamp((t - (o.l2 || 0)) / 0.25);
  ctx.globalAlpha = 0.25 + 0.75 * a1; ctx.fillText('1. Never lift her veil.', -290, -60);
  ctx.globalAlpha = 0.25 + 0.75 * a2; ctx.fillText('2. Never sign her book.', -290, 60);
  ctx.globalAlpha = 0.8; ctx.font = '40px Serif4i'; ctx.fillStyle = '#5a3a18'; ctx.fillText('— the old caretaker', -60, 160);
  ctx.globalAlpha = 1;
  // thumb
  ctx.fillStyle = '#2a1a12'; ctx.beginPath(); ctx.ellipse(-330, 140, 60, 36, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a100b'; ctx.fillRect(-520, 120, 200, 200);
  ctx.restore();
  // shadow across half the paper
  const sh = ctx.createLinearGradient(700, 0, 1000, 0); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = sh; ctx.fillRect(0, 0, 1080, 1920);
}

// the register on a stand / held open. page: 'guest' or 'marriage'. sign 0..1 writes your signature on the groom line
function register(ctx, t, o = {}) {
  const lt = o.light ?? 1;
  ctx.save(); ctx.translate(540, 960); ctx.rotate(o.rot ?? -0.05);
  ctx.fillStyle = '#5a0c10'; ctx.beginPath(); D.rrect(ctx, -440, -330, 880, 660, 16); ctx.fill();          // cover
  for (const s of [-1, 1]) {
    const pg = ctx.createLinearGradient(0, 0, s * 420, 0); pg.addColorStop(0, '#a8946e'); pg.addColorStop(0.15, '#efe3c8'); pg.addColorStop(1, '#e4d4b2');
    ctx.fillStyle = pg; ctx.beginPath(); ctx.moveTo(0, -300); ctx.quadraticCurveTo(s * 200, -320, s * 420, -305); ctx.lineTo(s * 420, 305); ctx.quadraticCurveTo(s * 200, 290, 0, 310); ctx.closePath(); ctx.fill();
  }
  ctx.strokeStyle = 'rgba(90,60,30,0.35)'; ctx.lineWidth = 2;
  for (let i = 0; i < 9; i++) for (const s of [-1, 1]) { const y = -170 + i * 52; ctx.beginPath(); ctx.moveTo(s * 40, y); ctx.lineTo(s * 390, y); ctx.stroke(); }
  ctx.fillStyle = '#7a1418'; ctx.textAlign = 'center';
  if (o.page === 'marriage') {
    ctx.font = '50px Serif4'; ctx.fillText('Marriage', -215, -225); ctx.fillText('Register', 215, -225);
    ctx.font = '40px Serif4i'; ctx.fillStyle = '#3a2410'; ctx.textAlign = 'left';
    ctx.fillText('Bride:', -380, -40); ctx.fillText('Groom:', 40, -40);
    // her "signature": a knot of red thread
    ctx.strokeStyle = '#b3141c'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i < 40; i++) { const a = i * 0.9; ctx.lineTo(-210 + Math.cos(a) * (14 + i), -50 + Math.sin(a) * (8 + i * 0.4)); } ctx.stroke();
  } else {
    ctx.font = '50px Serif4'; ctx.fillText('Guest', -215, -225); ctx.fillText('Book', 215, -225);
    ctx.strokeStyle = 'rgba(40,30,60,0.6)'; ctx.lineWidth = 2.4;
    for (let i = 0; i < 6; i++) for (const s of [-1, 1]) { ctx.beginPath(); const y = -180 + i * 52; for (let k = 0; k < 14; k++) ctx.lineTo(s * 60 + s * k * 18 * (0.6 + hash(i + k) * 0.6), y - hash(i * 7 + k + s) * 18); ctx.stroke(); }
  }
  // your signature on the groom line
  const sg = o.sign || 0;
  if (sg > 0) {
    ctx.strokeStyle = '#141b3a'; ctx.lineWidth = 4.5; ctx.lineCap = 'round'; ctx.beginPath();
    const n = Math.floor(60 * sg); let px = 0, py = 0;
    for (let i = 0; i <= n; i++) { const k = i / 60; px = 200 + k * 190 + Math.sin(k * 40) * 14; py = -50 + Math.sin(k * 25 + 1) * 16 - k * 10; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.stroke(); o._pen = [px, py];
  }
  ctx.restore();
  if (lt < 1) { ctx.fillStyle = `rgba(0,0,0,${0.5 * (1 - lt)})`; ctx.fillRect(0, 0, 1080, 1920); }
  return o._pen;
}

// a human hand (yours): sleeve from the bottom edge to (x,y), ang = direction it points
function myHand(ctx, x, y, ang, s = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  ctx.fillStyle = '#2c2a33'; ctx.fillRect(-60, 60, 120, 900);   // sleeve
  ctx.fillStyle = '#1b1920'; ctx.fillRect(-64, 50, 128, 30);
  const sk = ctx.createLinearGradient(-50, 0, 50, 0); sk.addColorStop(0, '#5a3524'); sk.addColorStop(0.6, '#8a5638'); sk.addColorStop(1, '#4a2a1a');
  ctx.fillStyle = sk; ctx.beginPath(); ctx.moveTo(-48, 60); ctx.lineTo(-52, -30); ctx.quadraticCurveTo(0, -70, 52, -30); ctx.lineTo(48, 60); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = sk; ctx.lineCap = 'round'; ctx.lineWidth = 22;
  const curl = o.curl || 0;
  for (let f = 0; f < 4; f++) { const fx = -36 + f * 24; ctx.beginPath(); ctx.moveTo(fx, -40); ctx.quadraticCurveTo(fx, -90 + curl * 30, fx + curl * 10, -120 + f % 2 * 10 + curl * 60); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-50, 0); ctx.quadraticCurveTo(-90, -30, -95, -70 + curl * 30); ctx.stroke();
  if (o.pen) { ctx.strokeStyle = '#d9b25a'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(-10, -100); ctx.lineTo(60, -260); ctx.stroke(); }
  ctx.restore();
}
// her long mehndi hand gripping around (x,y)
function herHand(ctx, x, y, ang, s = 1, t = 0, grip = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  ctx.fillStyle = '#6c0d12'; ctx.fillRect(-46, -1100, 92, 900);
  for (let b = 0; b < 8; b++) { ctx.fillStyle = b % 2 ? '#f0b443' : '#c8202a'; ctx.fillRect(-50, -260 + b * 18, 100, 12); }
  const hc = '#8a3e1c';
  ctx.fillStyle = hc; ctx.beginPath(); ctx.ellipse(0, -110, 52, 100, 0, 0, Math.PI * 2); ctx.fill();
  // mehndi pattern
  ctx.strokeStyle = '#4a1608'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, -110, 26, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.beginPath(); ctx.arc(Math.cos(a) * 40, -110 + Math.sin(a) * 60, 6, 0, Math.PI * 2); ctx.stroke(); }
  ctx.strokeStyle = hc; ctx.lineCap = 'round'; ctx.lineWidth = 20;
  for (let f = 0; f < 4; f++) { const fx = -36 + f * 24, L = 230 - Math.abs(f - 1.5) * 20; ctx.beginPath(); ctx.moveTo(fx, -30); ctx.quadraticCurveTo(fx + 10, L * 0.5, fx - grip * 70, L * (1 - grip * 0.35) + Math.sin(t * 3 + f) * 4); ctx.stroke(); }
  ctx.restore();
}

// your face, close: 3/4 view, lit from one side. fear 0..1
function myFace(ctx, t, o = {}) {
  const f = o.fear || 0, rim = o.rim || '#ffb46a', lt = o.light ?? 1;
  const bg = ctx.createLinearGradient(0, 0, 0, 1920); bg.addColorStop(0, o.bg0 || '#2a0e0a'); bg.addColorStop(1, o.bg1 || '#0a0403');
  ctx.fillStyle = bg; ctx.fillRect(-300, -300, 1680, 2520);
  if (o.behind) o.behind(ctx);
  ctx.save(); ctx.translate(560, 980);
  // neck + shoulders
  ctx.fillStyle = '#1e1c24'; ctx.beginPath(); ctx.moveTo(-520, 1000); ctx.bezierCurveTo(-480, 560, -260, 520, -120, 470); ctx.lineTo(160, 470); ctx.bezierCurveTo(330, 520, 520, 600, 560, 1000); ctx.closePath(); ctx.fill();
  const skin = ctx.createLinearGradient(-300, 0, 300, 0); skin.addColorStop(0, '#2a160e'); skin.addColorStop(0.55, mix('#7a4a30', '#3a4a5a', 1 - lt)); skin.addColorStop(1, mix('#b77a50', '#7a9ab8', 1 - lt));
  ctx.fillStyle = skin; ctx.fillRect(-120, 300, 250, 220);
  // head
  ctx.beginPath(); ctx.moveTo(-250, -120); ctx.bezierCurveTo(-260, -420, 250, -430, 260, -120); ctx.bezierCurveTo(270, 60, 200, 300, 40, 380); ctx.bezierCurveTo(-80, 420, -230, 300, -250, -120); ctx.fill();
  // ear
  ctx.fillStyle = '#3a2014'; ctx.beginPath(); ctx.ellipse(-245, 0, 36, 70, 0.1, 0, Math.PI * 2); ctx.fill();
  // hair
  ctx.fillStyle = '#0b0706'; ctx.beginPath(); ctx.moveTo(-275, -40); ctx.bezierCurveTo(-310, -430, 290, -470, 275, -110); ctx.bezierCurveTo(200, -250, 40, -230, -100, -240); ctx.bezierCurveTo(-170, -200, -230, -120, -275, -40); ctx.fill();
  // brows (raise with fear)
  ctx.strokeStyle = '#120a07'; ctx.lineWidth = 20; ctx.lineCap = 'round';
  for (const s of [-1, 1]) { const bx = s > 0 ? 150 : -30; ctx.beginPath(); ctx.moveTo(bx - 60, -95 - f * 35 + (s > 0 ? 0 : 6)); ctx.quadraticCurveTo(bx, -120 - f * 50, bx + 60, -100 - f * 20 * (s > 0 ? 1 : 0.3)); ctx.stroke(); }
  // eyes
  const look = o.look || 0, bl = o.blink ? 0.12 : 1;
  for (const s of [-1, 1]) {
    const ex = s > 0 ? 150 : -30, ey = -30, rw = 52 + f * 10, rh = (24 + f * 22) * bl;
    ctx.fillStyle = '#efe6da'; ctx.beginPath(); ctx.ellipse(ex, ey, rw, rh, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.ellipse(ex, ey, rw, rh, 0, 0, Math.PI * 2); ctx.clip();
    const ir = 26 - f * 8; ctx.fillStyle = '#2a170c'; ctx.beginPath(); ctx.arc(ex + look * 26, ey, ir, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#050302'; ctx.beginPath(); ctx.arc(ex + look * 26, ey, ir * 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex + look * 26 + 9, ey - 9, 6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // nose + mouth
  ctx.strokeStyle = 'rgba(30,14,8,0.8)'; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(70, 0); ctx.quadraticCurveTo(110, 110, 60, 140); ctx.stroke();
  ctx.fillStyle = '#2a0e08'; ctx.beginPath(); ctx.ellipse(60, 240, 60 + f * 10, 8 + f * 42, 0, 0, Math.PI * 2); ctx.fill();
  if (o.garland) { for (let i = 0; i <= 26; i++) { const a = Math.PI * (0.1 + 0.8 * i / 26); ctx.fillStyle = i % 3 ? '#ff9d1c' : '#ffc23a'; ctx.beginPath(); ctx.arc(Math.cos(a) * 420, 420 + Math.sin(a) * 300, 34, 0, Math.PI * 2); ctx.fill(); } }
  // sweat
  if (f > 0.4) { ctx.fillStyle = 'rgba(255,240,220,0.7)'; ctx.beginPath(); ctx.ellipse(210, -140 + ((t * 40) % 120), 8, 13, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  // rim light on the right edge
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const rg = ctx.createLinearGradient(700, 0, 900, 0); rg.addColorStop(0, rgba(rim, 0)); rg.addColorStop(1, rgba(rim, 0.22)); ctx.fillStyle = rg; ctx.fillRect(560, 400, 400, 1200); ctx.restore();
}

// light switch board with a wall clock (the only time in the episode)
function switches(ctx, t, o = {}) {
  const lt = o.light ?? 1;
  ctx.fillStyle = mix('#5a2a1e', '#0b141c', 1 - lt); ctx.fillRect(-300, -300, 1680, 2520);
  // wall texture
  ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 3; for (let i = 0; i < 30; i++) { ctx.beginPath(); ctx.moveTo(-100, i * 80 + noise1(i) * 30); ctx.lineTo(1200, i * 80 + noise1(i + 5) * 30); ctx.stroke(); }
  // clock
  ctx.save(); ctx.translate(800, 470);
  ctx.fillStyle = mix('#efe4d0', '#41576b', 1 - lt); ctx.beginPath(); ctx.arc(0, 0, 130, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#3a2418'; ctx.lineWidth = 12; ctx.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(Math.sin(a) * 100, -Math.cos(a) * 100); ctx.lineTo(Math.sin(a) * 116, -Math.cos(a) * 116); ctx.stroke(); }
  const hh = (2 + 14 / 60) / 12 * Math.PI * 2, mm = 14 / 60 * Math.PI * 2;
  ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(hh) * 60, -Math.cos(hh) * 60); ctx.stroke();
  ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(mm) * 96, -Math.cos(mm) * 96); ctx.stroke();
  const sa = (Math.floor(t) % 60) / 60 * Math.PI * 2; ctx.strokeStyle = '#b3141c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(sa) * 104, -Math.cos(sa) * 104); ctx.stroke();
  ctx.restore();
  // board
  ctx.save(); ctx.translate(470, 1000); ctx.rotate(-0.04);
  ctx.fillStyle = mix('#6b3a1c', '#16222c', 1 - lt); ctx.beginPath(); D.rrect(ctx, -380, -200, 760, 400, 18); ctx.fill();
  ctx.fillStyle = mix('#efe6d6', '#3c5064', 1 - lt);
  const n = 6;
  for (let i = 0; i < n; i++) {
    const sx = -300 + i * 120, off = i < (o.off || 0);
    ctx.fillStyle = mix('#efe6d6', '#3c5064', 1 - lt); ctx.beginPath(); D.rrect(ctx, sx - 40, -110, 80, 220, 10); ctx.fill();
    ctx.fillStyle = mix('#c9bba4', '#2a3a4a', 1 - lt); ctx.beginPath(); D.rrect(ctx, sx - 22, off ? 0 : -80, 44, 80, 8); ctx.fill();
    D.glow(ctx, sx, -150, 18, off ? 'rgba(255,60,40,A)' : 'rgba(255,200,120,A)', 0.6);
  }
  ctx.restore();
  if (lt > 0.05) D.glow(ctx, 540, 300, 900, 'rgba(255,170,90,A)', 0.18 * lt);
}

// the band corner: dhol + harmonium playing themselves in the dark
function band(ctx, t, o = {}) {
  const play = o.play || 0;
  ctx.fillStyle = '#060d13'; ctx.fillRect(-300, -300, 1680, 2520);
  ctx.fillStyle = '#0b1822'; ctx.fillRect(-300, 1200, 1680, 1200);
  beam(ctx, 900, -100, 0.45, 2200, 80, 760, '#86b4d8', 0.16);
  // marigold strings hanging dark in the foreground
  for (let i = 0; i < 5; i++) marigoldString(ctx, 80 + i * 230, -100, 500 + i * 60, 18, 0.15, t, i, 1 + play * 3);
  // harmonium
  ctx.save(); ctx.translate(700, 1150);
  ctx.fillStyle = '#1a2a36'; ctx.fillRect(-220, -60, 440, 200);
  ctx.fillStyle = '#d6dde6'; ctx.fillRect(-190, -50, 380, 50);
  for (let k = 0; k < 18; k++) { const down = play > 0 && hash(Math.floor(t * 6) + k) < 0.25 * play; ctx.fillStyle = down ? '#7a8a9a' : '#e8eef5'; ctx.fillRect(-188 + k * 21, -50 + (down ? 4 : 0), 18, 46); }
  const bel = Math.sin(t * 5) * 18 * play;
  ctx.fillStyle = '#2a3e50'; for (let f = 0; f < 6; f++) { ctx.fillRect(-210 + f * 4, 140 + f * (10 + bel / 6), 420, 6); }
  ctx.restore();
  // dhol on its side, skin pulsing
  ctx.save(); ctx.translate(300, 1420);
  ctx.fillStyle = '#2b3e50'; ctx.beginPath(); ctx.ellipse(0, 0, 230, 160, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#8fb0cc'; ctx.lineWidth = 5; for (let i = -5; i <= 5; i++) { ctx.beginPath(); ctx.moveTo(i * 38, -150); ctx.lineTo(-i * 38, 150); ctx.stroke(); }
  const beat = play * Math.pow(Math.max(0, Math.sin(t * Math.PI * 2.4)), 8);
  ctx.fillStyle = '#c2d2e0'; ctx.beginPath(); ctx.ellipse(250, 0, 70 + beat * 8, 170 + beat * 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = `rgba(200,225,245,${0.6 * beat})`; ctx.lineWidth = 4; for (let r = 1; r < 4; r++) { ctx.beginPath(); ctx.ellipse(250, 0, 70 + r * 30 * beat + 20, 170 + r * 40 * beat, 0, -1.2, 1.2); ctx.stroke(); }
  ctx.restore();
  dust(ctx, t, 200, 0, 900, 1600, 40, '#a9c8e8', 0.35, 9);
}

module.exports = { hall, bride, person, guestBust, veilClose, note, register, myHand, herHand, myFace, switches, band, marigoldString, BRIDE, STAGE_Y, chairRowY, chairRowS, PAL };
