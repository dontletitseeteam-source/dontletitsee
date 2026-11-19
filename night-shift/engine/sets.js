// NIGHT SHIFT — set painters (world space 1080x1920; same conventions as scenes*.js)
// Episode 1: the all-night pharmacy and the customer with a toe tag.
const D = require('./draw');
const { W, H, C, clamp, lerp, inv, E, hash, noise1, flicker, rrect, glow, spaced, drawStick } = D;

const SKIN = '#b8c3d6', SKIN_D = '#8e9ab3', SUIT = '#141a30', SUIT_L = '#232c4c', INK = '#141a36', REDINK = '#c4102a';
const MINT = '#39e58c';
const poly = (ctx, pts, fill) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); };
const darken = (ctx, a) => { if (a > 0.005) { ctx.fillStyle = `rgba(2,3,8,${a})`; ctx.fillRect(-1200, -1200, W + 2400, H + 2400); } };

// shelf stock, generated once
const STOCK = (() => {
  const pal = ['#f4f6f8', '#bfd3e6', '#ffffff', '#d7e4ee', '#e8b4b8', '#9fc6d9', '#f2e6c9', '#c9d8c0', '#f6d0a8'];
  const rows = [];
  for (let r = 0; r < 4; r++) {
    const items = []; let x = 100;
    while (x < 960) { const w = 38 + Math.floor(hash(r * 91 + x) * 58), h = 62 + Math.floor(hash(r * 17 + x * 3) * 60); items.push({ x, w, h, c: pal[Math.floor(hash(x * 7 + r) * pal.length)], s: hash(x + r * 5) }); x += w + 6 + Math.floor(hash(x * 1.3) * 10); }
    rows.push(items);
  }
  return rows;
})();

function fluoTubes(ctx, t, L, y = 90) {
  for (const x of [170, 540, 910]) {
    rrect(ctx, x - 150, y, 300, 34, 8); ctx.fillStyle = `rgba(${Math.round(lerp(40, 245, L))},${Math.round(lerp(46, 250, L))},${Math.round(lerp(60, 255, L))},1)`; ctx.fill();
    if (L > 0.2) glow(ctx, x, y + 17, 420, 'rgba(220,240,255,A)', 0.35 * L);
  }
}

// ---------- THE STORE (customer side, looking at the counter) ----------
// st: {light 0..1, man {x, y, s, a}, me {..} | null, prints 0..1, frost 0..1, meArm}
function drawStore(ctx, t, st = {}) {
  const L = (st.light ?? 1) * flicker(t, 3, 0.03);
  // ceiling + wall
  const wg = ctx.createLinearGradient(0, -400, 0, 1000); wg.addColorStop(0, '#9fb2c8'); wg.addColorStop(1, '#d7e4ea');
  ctx.fillStyle = wg; ctx.fillRect(-600, -600, W + 1200, 1600);
  ctx.fillStyle = '#b5c5d4'; ctx.fillRect(-600, -600, W + 1200, 260);
  fluoTubes(ctx, t, L, 40);
  // the sign
  ctx.save(); ctx.translate(540, 300);
  rrect(ctx, -300, -62, 600, 124, 18); ctx.fillStyle = '#0d1424'; ctx.fill();
  glow(ctx, -220, 0, 160, 'rgba(57,229,140,A)', 0.5 * L);
  ctx.fillStyle = MINT; ctx.fillRect(-250, -14, 60, 28); ctx.fillRect(-234, -30, 28, 60);
  ctx.font = '50px Osw700'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#eafff3'; ctx.textAlign = 'left'; ctx.fillText('PHARMACY', -160, -14);
  ctx.font = '26px Mono700'; ctx.fillStyle = MINT; spaced(ctx, 'OPEN 24 HOURS', -158, 30, 4);
  ctx.restore();
  // shelves
  STOCK.forEach((row, r) => {
    const y = 470 + r * 140;
    for (const b of row) {
      ctx.fillStyle = b.c; ctx.fillRect(b.x, y - b.h, b.w, b.h);
      ctx.fillStyle = 'rgba(20,30,60,0.18)'; ctx.fillRect(b.x, y - b.h, 4, b.h);
      ctx.fillStyle = b.s > 0.5 ? 'rgba(196,16,42,0.55)' : 'rgba(40,90,150,0.45)'; ctx.fillRect(b.x + 6, y - b.h * 0.6, b.w - 12, 8);
    }
    ctx.fillStyle = '#f7fafc'; ctx.fillRect(80, y, 920, 14); ctx.fillStyle = 'rgba(30,40,70,0.25)'; ctx.fillRect(80, y + 14, 920, 8);
  });
  // you, behind the counter
  if (st.me !== null) {
    const me = st.me || {};
    const ms = me.s ?? 1.75;
    drawStick(ctx, { x: me.x ?? 560, y: 1330, s: ms, view: 'front', arm: me.arm || 'down', color: '#1a2140', fill: '#f2f5f8', headDX: me.headDX || 0 });
    // white coat + badge
    ctx.save(); ctx.translate(me.x ?? 560, 1330); ctx.scale(ms, ms);
    ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#1a2140'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-40, -282); ctx.lineTo(40, -282); ctx.lineTo(56, -150); ctx.lineTo(-56, -150); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#1a2140'; ctx.fillRect(-2, -282, 4, 132);
    rrect(ctx, 10, -262, 26, 15, 3); ctx.fillStyle = '#2f6fd0'; ctx.fill();
    ctx.restore();
  }
  // counter
  const cg = ctx.createLinearGradient(0, 1040, 0, 1330); cg.addColorStop(0, '#e6eef3'); cg.addColorStop(1, '#c4d2dd');
  ctx.fillStyle = cg; ctx.fillRect(-600, 1040, W + 1200, 290);
  ctx.fillStyle = '#1d2a55'; ctx.fillRect(-600, 1170, W + 1200, 34);
  ctx.fillStyle = MINT; ctx.fillRect(522, 1176, 36, 22); ctx.fillRect(531, 1167, 18, 40);
  ctx.fillStyle = '#9fd7ff'; ctx.globalAlpha = 0.55; ctx.fillRect(-600, 1000, W + 1200, 40); ctx.globalAlpha = 1;
  ctx.fillStyle = '#ffffff'; ctx.fillRect(-600, 1000, W + 1200, 5);
  // till + tray + newspaper on the counter
  rrect(ctx, 120, 900, 180, 104, 10); ctx.fillStyle = '#2a3253'; ctx.fill();
  ctx.fillStyle = '#071018'; ctx.fillRect(138, 914, 144, 46); ctx.font = '28px Mono700'; ctx.fillStyle = MINT; ctx.fillText('02:0' + Math.min(9, Math.floor(st.minute ?? 0)), 160, 948);
  ctx.fillStyle = '#e9e4d6'; ctx.save(); ctx.translate(700, 1000); ctx.rotate(-0.04); ctx.fillRect(-90, -24, 180, 24); ctx.restore();
  ctx.strokeStyle = '#596487'; ctx.lineWidth = 5; ctx.strokeRect(820, 950, 140, 50);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(832, 942, 116, 14);
  // floor tiles (perspective toward the counter)
  const fg = ctx.createLinearGradient(0, 1330, 0, 2400); fg.addColorStop(0, '#c9d6df'); fg.addColorStop(1, '#eef3f6');
  ctx.fillStyle = fg; ctx.fillRect(-600, 1330, W + 1200, 1200);
  ctx.strokeStyle = 'rgba(70,90,120,0.28)'; ctx.lineWidth = 3;
  let y = 1330, dy = 40; while (y < 2500) { ctx.beginPath(); ctx.moveTo(-600, y); ctx.lineTo(W + 600, y); ctx.stroke(); y += dy; dy *= 1.28; }
  for (let i = -14; i <= 14; i++) { ctx.beginPath(); ctx.moveTo(540 + i * 80, 1330); ctx.lineTo(540 + i * 330, 2500); ctx.stroke(); }
  ctx.fillStyle = 'rgba(20,30,60,0.25)'; ctx.fillRect(-600, 1330, W + 1200, 10);
  // wet footprints from the door (bottom left) to his feet
  const pr = st.prints ?? 1;
  if (pr > 0) {
    const n = 9;
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1); if (u > pr) break;
      const fx = lerp(-80, (st.man?.x ?? 420) + (i % 2 ? 24 : -24), u), fy = lerp(2250, (st.man?.y ?? 1640) + 30, Math.pow(u, 0.8));
      const sc = lerp(1.7, 0.75, u);
      ctx.save(); ctx.translate(fx + (i % 2 ? 26 : -26) * sc, fy); ctx.scale(sc, sc * 0.45);
      ctx.fillStyle = 'rgba(70,95,130,0.32)'; ctx.beginPath(); ctx.ellipse(0, 0, 26, 52, 0, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(-8, -14, 7, 18, 0, 0, 7); ctx.fill();
      ctx.restore();
    }
  }
  if (st.man && (st.man.a ?? 1) > 0) drawCustomerBack(ctx, t, st.man);
  // overall light level
  darken(ctx, (1 - L) * 0.9);
  if (st.chill > 0) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(150,180,255,${0.35 * st.chill})`; ctx.fillRect(-600, -600, W + 1200, H + 1200); ctx.restore(); }
}

// the customer from behind: too tall, dark suit, wet hair, pale bare heels, the toe tag on the tile
function drawCustomerBack(ctx, t, m) {
  const x = m.x ?? 420, y = m.y ?? 1640, s = m.s ?? 1;
  ctx.save(); ctx.globalAlpha = m.a ?? 1; ctx.translate(x, y); ctx.scale(s, s);
  const sw = (noise1(t * 0.7) - 0.5) * 6;
  // feet (heels toward us), pale
  for (const sx of [-42, 42]) {
    ctx.fillStyle = SKIN; ctx.beginPath(); ctx.ellipse(sx, -8, 30, 18, 0, 0, 7); ctx.fill();
    ctx.fillStyle = SKIN_D; ctx.fillRect(sx - 18, -70, 36, 62);
  }
  // the tag: string from the right foot to a paper tag lying on the tile
  ctx.strokeStyle = '#e8e2cc'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(62, -14); ctx.quadraticCurveTo(110, -2, 128, 14); ctx.stroke();
  ctx.save(); ctx.translate(150, 22); ctx.rotate(0.18);
  ctx.fillStyle = '#f3efe0'; ctx.beginPath(); ctx.moveTo(-26, -14); ctx.lineTo(30, -14); ctx.lineTo(30, 14); ctx.lineTo(-26, 14); ctx.lineTo(-36, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#c94b3c'; ctx.beginPath(); ctx.arc(-24, 0, 4, 0, 7); ctx.fill();
  ctx.fillStyle = '#28304f'; ctx.fillRect(-12, -6, 34, 4); ctx.fillRect(-12, 2, 24, 4);
  ctx.restore();
  // trousers
  poly(ctx, [[-70, -66], [-14, -66], [-6, -380], [-78, -380]], SUIT);
  poly(ctx, [[14, -66], [70, -66], [78, -380], [6, -380]], SUIT);
  // jacket, too long torso
  poly(ctx, [[-96, -360], [96, -360], [104 + sw, -760], [-104 + sw, -760]], SUIT_L);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-3, -760, 6, 380);
  // arms hanging too long
  poly(ctx, [[-104 + sw, -750], [-80, -750], [-92, -300], [-120, -300]], SUIT);
  poly(ctx, [[80, -750], [104 + sw, -750], [120, -300], [92, -300]], SUIT);
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.ellipse(-106, -282, 16, 30, 0, 0, 7); ctx.ellipse(106, -282, 16, 30, 0, 0, 7); ctx.fill();
  // neck + head from behind, wet hair
  ctx.fillStyle = SKIN_D; ctx.fillRect(-22 + sw, -810, 44, 60);
  ctx.save(); ctx.translate(sw, -860); ctx.rotate(0.12);
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.ellipse(0, 0, 58, 72, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#0b0e19'; ctx.beginPath(); ctx.ellipse(0, -14, 60, 64, 0, Math.PI, 0); ctx.lineTo(60, 10); ctx.quadraticCurveTo(0, 40, -60, 10); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#0b0e19'; ctx.lineWidth = 5; for (let i = 0; i < 6; i++) { const hx = -46 + i * 18; ctx.beginPath(); ctx.moveTo(hx, 10); ctx.lineTo(hx + 2, 34 + (i % 2) * 14); ctx.stroke(); }
  ctx.restore();
  // drips
  for (let i = 0; i < 3; i++) { const ph = (t * 0.8 + i * 0.37) % 1; ctx.fillStyle = `rgba(160,200,255,${0.8 * (1 - ph)})`; ctx.beginPath(); ctx.arc(-106 + i * 106, -250 + ph * 240, 5, 0, 7); ctx.fill(); }
  ctx.restore();
}

// ---------- THE FEET (close-up, toes toward camera) ----------
function drawFeet(ctx, t, st = {}) {
  const fg = ctx.createLinearGradient(0, 0, 0, H); fg.addColorStop(0, '#4d5d74'); fg.addColorStop(1, '#8496ab');
  ctx.fillStyle = fg; ctx.fillRect(-600, -600, W + 1200, H + 1200);
  ctx.strokeStyle = 'rgba(60,80,110,0.3)'; ctx.lineWidth = 4;
  for (let y = 300; y < 2400; y += 260) { ctx.beginPath(); ctx.moveTo(-600, y); ctx.lineTo(W + 600, y); ctx.stroke(); }
  for (let x = -520; x < 1700; x += 260) { ctx.beginPath(); ctx.moveTo(x, -600); ctx.lineTo(x + (x - 540) * 0.3, 2400); ctx.stroke(); }
  // puddle
  ctx.fillStyle = 'rgba(90,120,160,0.28)'; ctx.beginPath(); ctx.ellipse(540, 1330, 520, 170, 0, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.ellipse(380, 1290, 120, 18, -0.1, 0, 7); ctx.fill();
  // trouser hems
  poly(ctx, [[180, -600], [480, -600], [470, 720], [190, 740]], SUIT);
  poly(ctx, [[600, -600], [900, -600], [890, 740], [610, 720]], SUIT);
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(200, 690, 260, 10); ctx.fillRect(620, 690, 260, 10);
  const foot = (cx, flip) => {
    ctx.save(); ctx.translate(cx, 0); ctx.scale(flip, 1);
    ctx.fillStyle = SKIN_D; ctx.fillRect(-90, 700, 180, 260);
    ctx.fillStyle = SKIN; ctx.beginPath(); ctx.moveTo(-110, 900); ctx.quadraticCurveTo(-140, 1200, -100, 1300); ctx.lineTo(130, 1300); ctx.quadraticCurveTo(160, 1150, 110, 900); ctx.closePath(); ctx.fill();
    // toes (big toe on the inner side = +x)
    const toes = [[110, 1300, 42], [50, 1316, 30], [0, 1316, 27], [-46, 1308, 24], [-86, 1294, 20]];
    for (const [x, y, r] of toes) { ctx.fillStyle = SKIN; ctx.beginPath(); ctx.ellipse(x, y, r, r * 1.15, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#d9e2ee'; ctx.beginPath(); ctx.ellipse(x, y + r * 0.35, r * 0.55, r * 0.4, 0, 0, 7); ctx.fill(); }
    // frost blue at the toes
    ctx.fillStyle = 'rgba(120,160,230,0.3)'; ctx.beginPath(); ctx.ellipse(10, 1300, 150, 50, 0, 0, 7); ctx.fill();
    ctx.restore();
  };
  foot(330, -1); foot(750, 1);
  // tag on the right foot's big toe (x 860, y 1300)
  const sway = Math.sin(t * 1.6) * 0.05 + (st.swing || 0) * Math.sin(t * 9) * 0.12;
  ctx.strokeStyle = '#efe9d4'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(860, 1296, 46, 16, 0, 0, 7); ctx.stroke();
  ctx.save(); ctx.translate(880, 1310); ctx.rotate(0.35 + sway);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(30, 90, 10, 160); ctx.stroke();
  ctx.translate(10, 160); ctx.rotate(-0.25);
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 8;
  ctx.fillStyle = '#f5f1e2'; ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(40, 0); ctx.lineTo(40, 250); ctx.lineTo(-40, 250); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.fillStyle = '#c94b3c'; ctx.beginPath(); ctx.arc(0, 24, 9, 0, 7); ctx.fill();
  ctx.save(); ctx.translate(0, 140); ctx.rotate(Math.PI / 2); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '40px Osw700'; ctx.fillStyle = INK; ctx.fillText('HALE, T.', 0, -10);
  ctx.font = '20px Mono700'; ctx.fillStyle = REDINK; ctx.fillText('MORGUE · 19 / 11', 0, 22);
  ctx.restore();
  ctx.restore();
  if (st.light !== undefined) darken(ctx, (1 - st.light) * 0.9);
}

// ---------- THE COUNTER, your side (POV): the man across the glass, the shop door behind him ----------
// st: {man 0..1 (alpha), lean, frost 0..1, slip 0..1 (slides in), light, empty, door 0..1, prints}
function drawCounterPOV(ctx, t, st = {}) {
  const L = (st.light ?? 1) * flicker(t, 7, 0.03);
  // shop interior walls + the glass front at night
  ctx.fillStyle = '#d3dfe7'; ctx.fillRect(-600, -600, W + 1200, H + 1200);
  ctx.fillStyle = '#b5c5d4'; ctx.fillRect(-600, -600, W + 1200, 380);
  fluoTubes(ctx, t, L, -120);
  // glass front: dark street
  const gx0 = 120, gx1 = 960, gy0 = 260, gy1 = 1180;
  const ng = ctx.createLinearGradient(0, gy0, 0, gy1); ng.addColorStop(0, '#060a18'); ng.addColorStop(1, '#0d1430');
  ctx.fillStyle = ng; ctx.fillRect(gx0, gy0, gx1 - gx0, gy1 - gy0);
  glow(ctx, 260, 420, 220, 'rgba(255,190,120,A)', 0.35); // streetlight
  ctx.fillStyle = '#ffcf8a'; ctx.beginPath(); ctx.arc(260, 420, 10, 0, 7); ctx.fill();
  // rain streaks
  ctx.strokeStyle = 'rgba(160,190,240,0.18)'; ctx.lineWidth = 2;
  for (let i = 0; i < 40; i++) { const x = gx0 + hash(i * 3.1) * (gx1 - gx0), y0 = gy0 + ((hash(i * 7.7) * 900 + t * 700) % 900); ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x - 6, y0 + 50); ctx.stroke(); }
  // frames + the door (centre panel) with reversed sticker
  ctx.fillStyle = '#8c9bb0'; for (const x of [gx0, 400, 680, gx1]) ctx.fillRect(x - 10, gy0, 20, gy1 - gy0);
  ctx.fillRect(gx0, gy0 - 10, gx1 - gx0, 20); ctx.fillRect(gx0, gy1 - 10, gx1 - gx0, 20);
  const dr = st.door || 0;
  if (dr > 0) { ctx.fillStyle = 'rgba(200,215,235,0.25)'; ctx.fillRect(410, gy0 + 10, 260 * (1 - dr * 0.6), gy1 - gy0 - 20); }
  ctx.save(); ctx.translate(540, 560); ctx.scale(-1, 1); ctx.font = '64px Osw700'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(57,229,140,0.85)'; ctx.fillText('24H', 0, 0); ctx.restore();
  ctx.fillStyle = '#c0ccd8'; ctx.fillRect(650, 820, 12, 120);
  // floor between door and counter
  ctx.fillStyle = '#c6d3dc'; ctx.fillRect(-600, 1180, W + 1200, 400);
  ctx.strokeStyle = 'rgba(70,90,120,0.25)'; ctx.lineWidth = 3;
  for (let y = 1200; y < 1500; y += 50) { ctx.beginPath(); ctx.moveTo(-600, y); ctx.lineTo(W + 600, y); ctx.stroke(); }
  // wet footprints: from the door to the counter (empty shop: they stop halfway)
  if (st.prints > 0) {
    for (let i = 0; i < 6; i++) {
      const u = i / 5; if (u > st.prints) break;
      const fx = 540 + (i % 2 ? 28 : -28), fy = lerp(1200, 1430, u);
      ctx.save(); ctx.translate(fx, fy); ctx.scale(lerp(0.6, 1, u), lerp(0.6, 1, u) * 0.5);
      ctx.fillStyle = 'rgba(60,85,125,0.4)'; ctx.beginPath(); ctx.ellipse(0, 0, 24, 46, 0, 0, 7); ctx.fill(); ctx.restore();
    }
  }
  // the man (waist up above the counter)
  const ma = st.man ?? 1;
  if (ma > 0 && !st.empty) drawCustomerFront(ctx, t, { a: ma, lean: st.lean || 0, frost: st.frost || 0 });
  // counter top (glass) in the foreground
  ctx.fillStyle = 'rgba(160,215,255,0.55)';
  ctx.beginPath(); ctx.moveTo(-200, 1480); ctx.lineTo(1280, 1480); ctx.lineTo(1500, 2400); ctx.lineTo(-420, 2400); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#eaf6ff'; ctx.fillRect(-200, 1474, 1480, 8);
  const cg = ctx.createLinearGradient(0, 1480, 0, 2000); cg.addColorStop(0, 'rgba(230,240,248,0.85)'); cg.addColorStop(1, 'rgba(200,214,226,0.95)');
  ctx.fillStyle = cg; ctx.beginPath(); ctx.moveTo(-200, 1482); ctx.lineTo(1280, 1482); ctx.lineTo(1500, 2400); ctx.lineTo(-420, 2400); ctx.closePath(); ctx.fill();
  // his hands on the glass + frost
  if (ma > 0 && !st.empty) {
    const fr = st.frost || 0;
    for (const hx of [330, 750]) {
      if (fr > 0) frostPatch(ctx, hx, 1560, 60 + 320 * fr, t, hx);
      ctx.save(); ctx.globalAlpha = ma; ctx.fillStyle = SKIN; ctx.beginPath(); ctx.ellipse(hx, 1540, 70, 44, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = SKIN; ctx.lineWidth = 17; ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(hx - 45 + i * 30, 1560); ctx.lineTo(hx - 66 + i * 44, 1606 + (i === 1 || i === 2 ? 8 : 0)); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(hx + (hx < 540 ? 60 : -60), 1530); ctx.lineTo(hx + (hx < 540 ? 92 : -92), 1556); ctx.stroke();
      ctx.strokeStyle = 'rgba(80,95,130,0.6)'; ctx.lineWidth = 3; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(hx - 66 + i * 44, 1600); ctx.lineTo(hx - 62 + i * 44, 1612); ctx.stroke(); }
      ctx.restore();
    }
  }
  // the slip on the counter
  const sl = st.slip ?? 0;
  if (sl > 0) {
    const sx = lerp(540, 540, sl), sy = lerp(1520, 1760, E.out(sl));
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(-0.06 + 0.06 * sl);
    ctx.fillStyle = '#eef3f8'; ctx.fillRect(-130, -70, 260, 160);
    ctx.fillStyle = 'rgba(90,120,160,0.35)'; ctx.beginPath(); ctx.ellipse(40, 20, 70, 40, 0.3, 0, 7); ctx.fill();
    ctx.font = '34px Osw700'; ctx.fillStyle = INK; ctx.fillText('Rx', -110, -26);
    ctx.fillStyle = 'rgba(20,26,54,0.6)'; ctx.fillRect(-60, -42, 160, 6); ctx.fillRect(-110, 0, 200, 6); ctx.fillRect(-110, 30, 150, 6);
    ctx.restore();
  }
  if (st.empty && st.slipLeft) {
    ctx.save(); ctx.translate(560, 1720); ctx.rotate(0.05); ctx.fillStyle = '#eef3f8'; ctx.fillRect(-130, -70, 260, 160);
    ctx.font = '34px Osw700'; ctx.fillStyle = INK; ctx.fillText('Rx', -110, -26); ctx.restore();
  }
  darken(ctx, (1 - L) * 0.95);
}

function frostPatch(ctx, x, y, r, t, seed) {
  ctx.save();
  const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(240,248,255,0.85)'); g.addColorStop(0.6, 'rgba(220,236,255,0.45)'); g.addColorStop(1, 'rgba(220,236,255,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, r * 1.3, r * 0.6, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 2.5;
  for (let i = 0; i < 26; i++) {
    const a = hash(seed + i * 3.7) * Math.PI * 2, len = r * (0.4 + 0.6 * hash(seed + i));
    let px = x, py = y; ctx.beginPath(); ctx.moveTo(px, py);
    for (let k = 1; k <= 4; k++) { px = x + Math.cos(a + (hash(i * k) - 0.5) * 0.5) * len * k / 4 * 1.3; py = y + Math.sin(a + (hash(i + k) - 0.5) * 0.5) * len * k / 4 * 0.6; ctx.lineTo(px, py); }
    ctx.stroke();
  }
  ctx.restore();
}

// the customer from the front (waist up, behind the counter): pale, burial suit, eyes like frost
function drawCustomerFront(ctx, t, st = {}) {
  const lean = st.lean || 0;
  ctx.save(); ctx.globalAlpha = st.a ?? 1;
  ctx.translate(540, 1480); ctx.scale(1 + 0.5 * lean, 1 + 0.5 * lean);
  const sw = (noise1(t * 0.6) - 0.5) * 6;
  // cold light from the counter on him
  glow(ctx, 0, -500, 520, 'rgba(200,225,255,A)', 0.35);
  // jacket + shoulders (too narrow, too long)
  poly(ctx, [[-170, 0], [170, 0], [150 + sw, -520], [70, -600], [-70, -600], [-150 + sw, -520]], SUIT_L);
  // shirt + tie
  poly(ctx, [[-50, -600], [50, -600], [24, -280], [-24, -280]], '#e9eef5');
  poly(ctx, [[-14, -590], [14, -590], [22, -330], [0, -300], [-22, -330]], '#0a0d18');
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-50, -600); ctx.lineTo(-10, -400); ctx.moveTo(50, -600); ctx.lineTo(10, -400); ctx.stroke();
  // arms down to the counter
  poly(ctx, [[-170, -500], [-120, -500], [-200, -40], [-250, -40]], SUIT);
  poly(ctx, [[120, -500], [170, -500], [250, -40], [200, -40]], SUIT);
  // neck
  ctx.fillStyle = SKIN_D; ctx.fillRect(-30, -660, 60, 70);
  // head
  ctx.save(); ctx.translate(sw * 0.6, -760); ctx.rotate(0.1 - lean * 0.06);
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.ellipse(0, 0, 82, 104, 0, 0, 7); ctx.fill();
  // wet hair, combed flat, strands stuck to the forehead
  ctx.fillStyle = '#0b0e19'; ctx.beginPath(); ctx.ellipse(0, -40, 86, 72, 0, Math.PI, 0); ctx.quadraticCurveTo(70, -20, 40, -42); ctx.quadraticCurveTo(0, -30, -60, -20); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#0b0e19'; ctx.lineWidth = 5; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-50 + i * 22, -40); ctx.quadraticCurveTo(-46 + i * 22, -10, -54 + i * 24, 6 + (i % 2) * 10); ctx.stroke(); }
  // sunken eyes: dark hollows with milky frost irises
  for (const ex of [-34, 34]) {
    ctx.fillStyle = '#5d6a86'; ctx.beginPath(); ctx.ellipse(ex, 4, 26, 18, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#eef6ff'; ctx.beginPath(); ctx.ellipse(ex, 6, 15, 11, 0, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(160,200,240,0.7)'; ctx.beginPath(); ctx.arc(ex, 6, 6, 0, 7); ctx.fill();
  }
  if (lean > 0) glow(ctx, 0, 6, 120, 'rgba(220,240,255,A)', 0.25 * lean);
  // nose shadow + blue lips
  ctx.strokeStyle = SKIN_D; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(4, 14); ctx.lineTo(10, 42); ctx.lineTo(0, 46); ctx.stroke();
  ctx.strokeStyle = '#5068a8'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-24, 70); ctx.quadraticCurveTo(0, 66 + 6 * lean, 24, 70); ctx.stroke();
  // frost on the brows
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 3;
  for (let i = 0; i < 10; i++) { const bx = -56 + i * 12 + (i > 4 ? 16 : 0); ctx.beginPath(); ctx.moveTo(bx, -18); ctx.lineTo(bx + 4, -10); ctx.stroke(); }
  ctx.restore();
  // breath fog (cold coming OUT of him)
  for (let i = 0; i < 3; i++) { const ph = (t * 0.5 + i / 3) % 1; ctx.fillStyle = `rgba(230,240,255,${0.22 * (1 - ph)})`; ctx.beginPath(); ctx.ellipse(20 + ph * 60, -690 + ph * 40, 30 + ph * 60, 18 + ph * 24, 0, 0, 7); ctx.fill(); }
  // drips from the hair
  for (let i = 0; i < 4; i++) { const ph = (t * 0.9 + i * 0.29) % 1; ctx.fillStyle = `rgba(170,205,255,${0.8 * (1 - ph)})`; ctx.beginPath(); ctx.arc(-60 + i * 40, -700 + ph * 160, 5, 0, 7); ctx.fill(); }
  ctx.restore();
}

// ---------- THE FACE (lean-in close-up) ----------
function drawFace(ctx, t, st = {}) {
  ctx.fillStyle = '#05070f'; ctx.fillRect(-600, -600, W + 1200, H + 1200);
  glow(ctx, 540, 1250, 900, 'rgba(160,200,255,A)', 0.3);
  ctx.save(); ctx.translate(540, 980); const s = 3.0 + 0.4 * (st.push || 0); ctx.scale(s, s);
  ctx.translate(0, 760);
  // re-use the front head at scale: draw just the head part
  ctx.save(); ctx.translate(0, -760); ctx.rotate(0.08);
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.ellipse(0, 0, 82, 104, 0, 0, 7); ctx.fill();
  const sh = ctx.createLinearGradient(0, -104, 0, 104); sh.addColorStop(0, 'rgba(20,30,60,0.5)'); sh.addColorStop(0.5, 'rgba(20,30,60,0)'); ctx.fillStyle = sh; ctx.beginPath(); ctx.ellipse(0, 0, 82, 104, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#0b0e19'; ctx.beginPath(); ctx.ellipse(0, -40, 86, 72, 0, Math.PI, 0); ctx.quadraticCurveTo(70, -20, 40, -42); ctx.quadraticCurveTo(0, -30, -60, -20); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#0b0e19'; ctx.lineWidth = 3; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(-56 + i * 18, -40); ctx.quadraticCurveTo(-52 + i * 18, -10, -60 + i * 19, 4 + (i % 2) * 12); ctx.stroke(); }
  const open = st.eyes ?? 1;
  for (const ex of [-34, 34]) {
    ctx.fillStyle = '#4a5674'; ctx.beginPath(); ctx.ellipse(ex, 4, 26, 18, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#f2f8ff'; ctx.beginPath(); ctx.ellipse(ex, 6, 16, 12 * open, 0, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(150,190,235,0.85)'; ctx.beginPath(); ctx.arc(ex, 6, 6 * open, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 1.4;
    for (let k = 0; k < 6; k++) { const a = k * 1.05; ctx.beginPath(); ctx.moveTo(ex + Math.cos(a) * 3, 6 + Math.sin(a) * 3); ctx.lineTo(ex + Math.cos(a) * 10, 6 + Math.sin(a) * 8 * open); ctx.stroke(); }
  }
  glow(ctx, 0, 6, 70, 'rgba(220,240,255,A)', 0.3);
  ctx.strokeStyle = '#7d8aa6'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(4, 14); ctx.lineTo(10, 42); ctx.lineTo(0, 46); ctx.stroke();
  const m = st.mouth || 0;
  ctx.fillStyle = '#0a0d18'; ctx.beginPath(); ctx.ellipse(0, 70, 22, 3 + 9 * m, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = '#4e66a6'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(0, 70, 24, 4 + 9 * m, 0, 0, 7); ctx.stroke();
  // frost crystals on brows and lashes
  ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 1.8;
  for (let i = 0; i < 18; i++) { const bx = -60 + i * 7 + (i > 8 ? 12 : 0); ctx.beginPath(); ctx.moveTo(bx, -20); ctx.lineTo(bx + 3, -12); ctx.moveTo(bx + 1.5, -19); ctx.lineTo(bx - 2, -13); ctx.stroke(); }
  ctx.restore();
  ctx.restore();
  // breath fog toward camera
  for (let i = 0; i < 4; i++) { const ph = ((t * 0.45 + i / 4) % 1); ctx.fillStyle = `rgba(225,238,255,${0.16 * (1 - ph) * (st.breath ?? 1)})`; ctx.beginPath(); ctx.ellipse(540 + (i - 1.5) * 40, 1210 + ph * 260, 120 + ph * 420, 60 + ph * 180, 0, 0, 7); ctx.fill(); }
}

// ---------- PAPERS ----------
function paperBG(ctx) {
  // the glass counter top under the paper
  const g = ctx.createLinearGradient(0, -600, 0, H + 600); g.addColorStop(0, '#7f9bb5'); g.addColorStop(1, '#a9c1d4');
  ctx.fillStyle = g; ctx.fillRect(-600, -600, W + 1200, H + 1200);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 6; for (let i = -6; i < 12; i++) { ctx.beginPath(); ctx.moveTo(i * 200, -600); ctx.lineTo(i * 200 + 900, H + 600); ctx.stroke(); }
}
const NOTE = { x0: 150, x1: 930, y0: 230, y1: 1720 };
const NOTE_RULES = [
  { y: 640, lines: ['Fill every prescription.', 'Even the paper ones.'] },
  { y: 900, lines: ['If he\'s in today\'s', 'obituaries, he waits', 'OUTSIDE.'] },
  { y: 1220, lines: ['Never ask why', 'he\'s cold.'] },
];
function drawNote(ctx, t, st = {}) {
  paperBG(ctx);
  const P = NOTE;
  ctx.save(); ctx.translate(540, 960); ctx.rotate(0.02); ctx.translate(-540, -960);
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  ctx.fillStyle = '#f4ecb8'; ctx.fillRect(P.x0, P.y0, P.x1 - P.x0, P.y1 - P.y0);
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.fillStyle = 'rgba(70,100,170,0.25)'; for (let y = P.y0 + 160; y < P.y1 - 30; y += 66) ctx.fillRect(P.x0 + 10, y, P.x1 - P.x0 - 20, 2);
  ctx.fillStyle = 'rgba(200,60,70,0.4)'; ctx.fillRect(P.x0 + 110, P.y0, 3, P.y1 - P.y0);
  ctx.fillStyle = '#3a3f55'; ctx.fillRect(P.x0, P.y0, P.x1 - P.x0, 40);
  ctx.fillStyle = INK; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'center';
  ctx.font = '86px Osw700'; ctx.fillText('NIGHT SHIFT', 540, 380);
  ctx.font = '44px Osw600'; spaced(ctx, 'READ THIS FIRST', 540, 450, 8, 'center');
  ctx.fillRect(330, 476, 420, 5);
  ctx.textAlign = 'left';
  NOTE_RULES.forEach((r, i) => {
    const hl = st.hl === i ? clamp(st.hlA ?? 1) : 0;
    if (hl > 0) { ctx.save(); ctx.globalAlpha = 0.55; ctx.fillStyle = C.lime; ctx.fillRect(P.x0 + 20, r.y - 56, 740 * hl, r.lines.length * 70 + 6); ctx.restore(); }
    if (st.dim !== undefined && st.hl !== i && st.dim > 0) ctx.globalAlpha = 1 - 0.55 * st.dim; else ctx.globalAlpha = 1;
    ctx.fillStyle = INK; ctx.font = '72px Osw700'; ctx.fillText(`${i + 1}.`, P.x0 + 20, r.y + 4);
    ctx.font = '54px Inter600';
    r.lines.forEach((ln, k) => { ctx.fillStyle = (i === 1 && k === 2) ? REDINK : INK; ctx.fillText(ln, P.x0 + 140, r.y + k * 70); });
    ctx.globalAlpha = 1;
  });
  // the last line, shaky handwriting
  const so = clamp(st.sorry ?? 1);
  if (so > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(P.x0, 1380, (P.x1 - P.x0) * so, 260); ctx.clip();
    ctx.font = '62px Inter700'; ctx.fillStyle = REDINK;
    const words = ['I', 'left', 'early.']; let x = P.x0 + 140;
    words.forEach((w, i) => { ctx.save(); ctx.translate(x, 1480 + Math.sin(i * 2.1) * 8); ctx.rotate((hash(i * 4) - 0.5) * 0.12); ctx.fillText(w, 0, 0); ctx.restore(); x += ctx.measureText(w).width + 22; });
    ctx.font = '54px Inter600'; ctx.save(); ctx.translate(P.x0 + 140, 1566); ctx.rotate(-0.04); ctx.fillText('Sorry.', 0, 0); ctx.restore();
    ctx.restore();
  }
  // signature
  signature(ctx, P.x1 - 220, 1650, 1, INK);
  ctx.restore();
  if (st.dark) darken(ctx, st.dark);
}
// the night pharmacist's signature: "M." + a loop
function signature(ctx, x, y, k = 1, col = INK) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); const n = Math.floor(40 * k);
  for (let i = 0; i <= n; i++) {
    const u = i / 40; let px, py;
    if (u < 0.35) { const v = u / 0.35; px = x + v * 70; py = y - Math.abs(Math.sin(v * Math.PI * 2)) * 60; }
    else if (u < 0.7) { const v = (u - 0.35) / 0.35; px = x + 70 + Math.cos(v * Math.PI * 2 + Math.PI) * 30 + v * 40 + 30; py = y - 20 + Math.sin(v * Math.PI * 2) * 30; }
    else { const v = (u - 0.7) / 0.3; px = x + 170 + v * 60; py = y - 10 + v * 10 - Math.sin(v * 9) * 6; }
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.stroke(); ctx.restore();
}

// prescription slip close-up (also tomorrow's slip with your name)
function drawSlip(ctx, t, st = {}) {
  paperBG(ctx);
  ctx.save(); ctx.translate(540, 980); ctx.rotate(st.rot ?? -0.03); ctx.translate(-540, -980);
  const x0 = 120, x1 = 960, y0 = 380, y1 = 1600;
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  ctx.fillStyle = '#eef3f8'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.fillStyle = '#2f6fd0'; ctx.fillRect(x0, y0, x1 - x0, 24);
  // wet blotches
  if (!st.mine) {
    ctx.fillStyle = 'rgba(90,120,170,0.18)';
    for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.ellipse(x0 + 100 + hash(i * 3) * 640, y0 + 200 + hash(i * 7) * 900, 60 + hash(i) * 90, 40 + hash(i * 2) * 60, hash(i * 5), 0, 7); ctx.fill(); }
  }
  ctx.fillStyle = INK; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  ctx.font = '120px Osw700'; ctx.fillText('Rx', x0 + 50, y0 + 170);
  ctx.font = '30px Mono700'; ctx.fillStyle = 'rgba(20,26,54,0.75)'; spaced(ctx, 'ALL-NIGHT PHARMACY', x0 + 220, y0 + 100, 3); spaced(ctx, st.mine ? 'DATE  21 / 11' : 'DATE  19 / 11', x0 + 220, y0 + 150, 3);
  ctx.fillStyle = 'rgba(20,26,54,0.5)'; ctx.fillRect(x0 + 50, y0 + 210, x1 - x0 - 100, 3);
  ctx.font = '34px Mono700'; ctx.fillStyle = 'rgba(20,26,54,0.7)'; ctx.fillText('NAME', x0 + 50, y0 + 300);
  const nm = st.mine ? 'SAM' : 'THOMAS HALE';
  const nk = clamp(st.name ?? 1);
  ctx.save(); ctx.beginPath(); ctx.rect(x0 + 40, y0 + 310, (x1 - x0 - 80) * nk, 140); ctx.clip();
  ctx.font = '96px Osw700'; ctx.fillStyle = st.mine ? REDINK : INK; ctx.fillText(nm, x0 + 50, y0 + 420); ctx.restore();
  if (st.nameHL > 0) { ctx.save(); ctx.globalAlpha = 0.45 * clamp(st.nameHL); ctx.fillStyle = C.lime; ctx.fillRect(x0 + 40, y0 + 336, ctx.measureText ? (st.mine ? 220 : 620) * clamp(st.nameHL) : 0, 100); ctx.restore(); }
  ctx.font = '34px Mono700'; ctx.fillStyle = 'rgba(20,26,54,0.7)'; ctx.fillText('Rx', x0 + 50, y0 + 540);
  ctx.font = '48px Inter600'; ctx.fillStyle = INK;
  const rx = st.mine ? ['Same as Thomas.', 'Keep cold.'] : ['Take one at 2 AM.', 'Keep cold.'];
  rx.forEach((l, i) => ctx.fillText(l, x0 + 50, y0 + 620 + i * 70));
  ctx.fillStyle = 'rgba(20,26,54,0.5)'; ctx.fillRect(x0 + 50, y1 - 330, x1 - x0 - 100, 3);
  ctx.font = '30px Mono700'; ctx.fillStyle = 'rgba(20,26,54,0.7)'; ctx.fillText('SIGNED · NIGHT PHARMACIST', x0 + 50, y1 - 280);
  signature(ctx, x0 + 120, y1 - 120, 1, INK);
  if (st.sigRing > 0) { ctx.save(); ctx.strokeStyle = REDINK; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(x0 + 240, y1 - 150, 190, 80, -0.04, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(st.sigRing)); ctx.stroke(); ctx.restore(); }
  // frost creeping in from the edges
  const fr = st.frost || 0;
  if (fr > 0) { frostPatch(ctx, x0 + 40, y0 + 60, 320 * fr, t, 11); frostPatch(ctx, x1 - 40, y1 - 60, 360 * fr, t, 23); }
  // a toe tag clipped to your slip
  if (st.mine && st.tag > 0) {
    const a = E.outBack(clamp(st.tag));
    ctx.save(); ctx.translate(800, 1080); ctx.rotate(0.3); ctx.scale(a, a);
    ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 18;
    ctx.fillStyle = '#f5f1e2'; ctx.beginPath(); ctx.moveTo(-60, -130); ctx.lineTo(60, -130); ctx.lineTo(60, 150); ctx.lineTo(-60, 150); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = '#c94b3c'; ctx.beginPath(); ctx.arc(0, -100, 12, 0, 7); ctx.fill();
    ctx.strokeStyle = '#efe9d4'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, -100); ctx.quadraticCurveTo(-70, -200, -40, -260); ctx.stroke();
    ctx.save(); ctx.translate(0, 30); ctx.rotate(Math.PI / 2); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '58px Osw700'; ctx.fillStyle = REDINK; ctx.fillText('SAM', 0, -12); ctx.font = '22px Mono700'; ctx.fillStyle = INK; ctx.fillText('MORGUE · 21/11', 0, 30); ctx.restore();
    ctx.restore();
  }
  ctx.restore();
  if (st.dark) darken(ctx, st.dark);
}

// today's paper, obituaries page
const OBIT = [[150, 420], [560, 420], [150, 900], [560, 900], [150, 1380], [560, 1380]];
function drawPaper(ctx, t, st = {}) {
  paperBG(ctx);
  ctx.save(); ctx.translate(540, 960); ctx.rotate(-0.025); ctx.translate(-540, -960);
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  ctx.fillStyle = '#e4dfd0'; ctx.fillRect(90, 140, 900, 1700); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.fillStyle = '#1b1d24'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.font = '40px Mono700'; spaced(ctx, 'THE CITY HERALD · THU 19 NOV', 540, 210, 3, 'center');
  ctx.fillRect(130, 232, 820, 4);
  ctx.font = '110px Osw700'; ctx.fillText('OBITUARIES', 540, 350); ctx.fillRect(130, 372, 820, 3);
  ctx.textAlign = 'left';
  OBIT.forEach(([x, y], i) => {
    const hero = i === 3;
    ctx.fillStyle = hero ? '#2a2f3e' : '#6a6c74'; ctx.fillRect(x, y, 140, 170);
    ctx.fillStyle = hero ? SKIN : '#a9aab0'; ctx.beginPath(); ctx.ellipse(x + 70, y + 74, 34, 44, 0, 0, 7); ctx.fill();
    if (hero) { ctx.fillStyle = '#0b0e19'; ctx.beginPath(); ctx.ellipse(x + 70, y + 54, 36, 28, 0, Math.PI, 0); ctx.fill(); ctx.fillStyle = SUIT_L; ctx.fillRect(x + 20, y + 120, 100, 50); }
    else { ctx.fillStyle = '#85878f'; ctx.fillRect(x + 25, y + 125, 90, 45); }
    ctx.fillStyle = '#1b1d24'; ctx.font = hero ? '44px Osw700' : '36px Osw600';
    ctx.fillText(hero ? 'THOMAS HALE' : ['R. OKAFOR', 'E. LINDQVIST', 'J. PEREIRA', '', 'A. KOWALSKI', 'D. MBEKI'][i], x + 160, y + 44);
    ctx.fillStyle = 'rgba(27,29,36,0.45)';
    for (let k = 0; k < 6; k++) ctx.fillRect(x + 160, y + 74 + k * 26, 200 - (k % 3) * 30, 10);
    if (hero) { ctx.font = '34px Inter700'; ctx.fillStyle = '#1b1d24'; ctx.fillText('Died this morning.', x + 160, y + 250); }
  });
  ctx.fillStyle = 'rgba(27,29,36,0.4)'; for (let k = 0; k < 7; k++) ctx.fillRect(150, 1660 + k * 22, 780 - (k % 4) * 60, 9);
  const hx = OBIT[3][0], hy = OBIT[3][1];
  if (st.nameHL > 0) { ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = C.lime; ctx.fillRect(hx + 150, hy + 4, 290 * clamp(st.nameHL), 56); ctx.restore(); }
  if (st.ring > 0) { ctx.save(); ctx.strokeStyle = REDINK; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(hx + 290, hy + 238, 180, 50, -0.04, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(st.ring)); ctx.stroke(); ctx.restore(); }
  ctx.restore();
}

// pill counting tray, your shaking hand with the spatula
function drawPills(ctx, t, st = {}) {
  paperBG(ctx);
  const k = st.count || 0, shk = st.shake || 0;
  ctx.save(); ctx.translate(540, 1000);
  rrect(ctx, -420, -300, 840, 600, 40); ctx.fillStyle = '#2f6fd0'; ctx.fill();
  rrect(ctx, -380, -260, 560, 520, 30); ctx.fillStyle = '#4b88e6'; ctx.fill();
  rrect(ctx, 200, -260, 180, 520, 30); ctx.fillStyle = '#245cb3'; ctx.fill();
  // pills: some on the tray, some slid into the channel
  for (let i = 0; i < 26; i++) {
    const inCh = i / 26 < k;
    const px = inCh ? 290 + (hash(i * 3) - 0.5) * 100 : -330 + hash(i * 7) * 460, py = inCh ? 220 - (i % 13) * 34 : -220 + hash(i * 11) * 420;
    ctx.save(); ctx.translate(px, py); ctx.rotate(hash(i) * 3);
    rrect(ctx, -26, -13, 52, 26, 13); ctx.fillStyle = '#f6f8fb'; ctx.fill(); ctx.strokeStyle = 'rgba(20,30,60,0.35)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = 'rgba(20,30,60,0.25)'; ctx.fillRect(-1, -12, 2, 24);
    ctx.restore();
  }
  ctx.restore();
  // your arm + spatula (white stick hand) with tremor
  const jx = (noise1(t * 30) - 0.5) * 30 * shk, jy = (noise1(t * 27 + 9) - 0.5) * 22 * shk;
  const sx = lerp(-200, 160, (Math.sin(t * 5) * 0.5 + 0.5)) + jx, sy = 960 + jy;
  ctx.save(); ctx.strokeStyle = '#1a2140'; ctx.lineWidth = 14; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(1300, 1900); ctx.lineTo(sx + 620, sy + 300); ctx.lineTo(sx + 360, sy + 40); ctx.stroke();
  ctx.fillStyle = '#c9d2dc'; ctx.save(); ctx.translate(sx + 360, sy + 40); ctx.rotate(-0.55); rrect(ctx, -260, -18, 300, 36, 10); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(sx + 360, sy + 40, 26, 0, 7); ctx.fill(); ctx.strokeStyle = '#1a2140'; ctx.lineWidth = 8; ctx.stroke();
  ctx.restore();
  // amber bottle with his label
  ctx.save(); ctx.translate(890, 560); ctx.rotate(0.05);
  rrect(ctx, -80, -150, 160, 300, 18); ctx.fillStyle = 'rgba(214,128,40,0.9)'; ctx.fill();
  ctx.fillStyle = '#f2f5f8'; ctx.fillRect(-80, -70, 160, 130);
  ctx.font = '34px Osw700'; ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText('HALE, T.', 0, -20); ctx.font = '20px Mono700'; ctx.fillText('KEEP COLD', 0, 20);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(-90, -190, 180, 50);
  ctx.restore();
}

// the wire tray of tomorrow's slips
function drawTray(ctx, t, st = {}) {
  paperBG(ctx);
  ctx.save(); ctx.translate(540, 1000);
  // stack
  for (let i = 6; i >= 0; i--) { ctx.save(); ctx.translate((hash(i) - 0.5) * 30, -i * 10); ctx.rotate((hash(i * 3) - 0.5) * 0.08); ctx.fillStyle = i ? '#dfe6ee' : '#eef3f8'; ctx.fillRect(-330, -420, 660, 820); ctx.fillStyle = '#2f6fd0'; ctx.fillRect(-330, -420, 660, 16); ctx.restore(); }
  // top slip text (small, reads at zoom)
  ctx.fillStyle = INK; ctx.font = '90px Osw700'; ctx.textAlign = 'left'; ctx.fillText('Rx', -290, -280);
  ctx.font = '26px Mono700'; ctx.fillStyle = 'rgba(20,26,54,0.75)'; ctx.fillText('DATE  21 / 11', -120, -320);
  ctx.fillText('NAME', -290, -170);
  ctx.font = '84px Osw700'; ctx.fillStyle = REDINK; ctx.fillText('SAM', -290, -80);
  ctx.fillStyle = 'rgba(20,26,54,0.5)'; for (let k = 0; k < 4; k++) ctx.fillRect(-290, 20 + k * 60, 480 - k * 60, 8);
  // wire tray
  ctx.strokeStyle = '#8c98ad'; ctx.lineWidth = 10;
  ctx.strokeRect(-380, -470, 760, 920);
  for (let i = 1; i < 8; i++) { ctx.beginPath(); ctx.moveTo(-380, 450 - i * 4); ctx.lineTo(380, 450 - i * 4); ctx.stroke(); }
  // label tab
  rrect(ctx, -170, 380, 340, 110, 12); ctx.fillStyle = '#1d2a55'; ctx.fill();
  ctx.font = '50px Osw700'; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.fillText('TOMORROW', 0, 452);
  ctx.restore();
  if (st.dark) darken(ctx, st.dark);
}

// your name badge (insert)
function drawBadge(ctx, x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.05);
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 20;
  rrect(ctx, -200, -80, 400, 160, 18); ctx.fillStyle = '#2f6fd0'; ctx.fill(); ctx.shadowBlur = 0;
  rrect(ctx, -186, -66, 372, 132, 12); ctx.fillStyle = '#f4f7fb'; ctx.fill();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '76px Osw700'; ctx.fillStyle = INK; ctx.fillText('SAM', 0, -10);
  ctx.font = '22px Mono700'; ctx.fillStyle = '#2f6fd0'; spaced(ctx, 'NIGHT PHARMACIST', 0, 44, 2, 'center');
  ctx.restore();
}

module.exports = { drawStore, drawCustomerBack, drawFeet, drawCounterPOV, drawCustomerFront, drawFace, drawNote, NOTE_RULES, drawSlip, drawPaper, drawPills, drawTray, drawBadge, signature, frostPatch, darken };
