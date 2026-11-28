// NIGHT SHIFT Season 2 Ep 3 — the last bus (v4 look). Palette: sick mint-white tube light inside an old state bus, blue rexine
// seats, brass-yellow roof rails, amber streetlights sweeping past the windows, black-green night outside, threat red (bell lamp).
// Interior = one-point perspective down the aisle (vanishing point VP). World units in metres: x across (bus half-width 1.2),
// y down from eye height (floor +1.1, ceiling -1.1), z depth (back wall at 12).
const D = require('./draw');
const L = require('./look4');
const Wd = require('./sets_wedding');
const { clamp, lerp, E, hash, noise1 } = D;
const { mix, rgba, dust, beam } = L;

const VP = { x: 540, y: 860 }, F = 2100, BACK = 12, HW = 1.2, FL = 1.1, CE = -1.1;
const COL = { body: '#04070a', rim: '#d8fff0', tube: '#effff6', wall: '#a8c4b4', seat: '#3d66c4', rail: '#d3c58e', amber: '#ff9a3c', red: '#ff3d34', mint: '#8ff0c8', floor: '#3a433e' };
const P = (x, y, z) => [VP.x + (x * F) / z, VP.y + (y * F) / z];
function quad(ctx, a, b, c, d, fill) { ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.lineTo(...c); ctx.lineTo(...d); ctx.closePath(); ctx.fill(); }
// amber streetlight sweep: 0..1 brightness at depth z (lights pass from the front to the back as the bus drives on)
function sweep(t, z) { let v = 0; for (let k = 0; k < 2; k++) { const ph = ((t * 0.55 + k * 0.5 - z / 26) % 1 + 1) % 1; v += Math.exp(-Math.pow((ph - 0.5) / 0.06, 2)); } return v; }
function limb(ctx, pts, w0, w1, col) {
  ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let i = 0; i < pts.length - 1; i++) { ctx.lineWidth = lerp(w0, w1, i / Math.max(1, pts.length - 2)); ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[i + 1][0], pts[i + 1][1]); ctx.stroke(); }
}

// ------------------------------------------------------------------ HIM: hanging from the roof rail
// feet at (x,y) (toes on the floor), rail at y - 125u; u = px per unit (a person is 100 units tall). Arms with an extra joint,
// zigzagging up to the rail; body slumped, knees forward, head hanging BELOW the shoulders, two pale eyes.
// o.fold 0..1: his right arm unhooks and folds down toward (o.fx, o.fy) in units; o.up 0..1: head snaps up; o.jerk.
function hanger(ctx, x, y, u, t, o = {}) {
  const rim = o.rim || COL.rim, lt = o.light ?? 1;
  const sw = Math.sin(t * 1.15) * 0.045 + (o.jerk || 0) * 0.08;
  const up = o.up || 0, fold = o.fold || 0;
  ctx.save(); ctx.translate(x, y - 125 * u); ctx.rotate(sw); ctx.translate(0, 125 * u); ctx.scale(u, u);
  const drag = Math.sin(t * 1.15) * 3;                                   // toes drag on the floor with the sway
  const sh = [[-12, -64], [12, -64]];
  const armPts = (s) => {
    const hand = [s * 30, -125], e1 = [s * 36, -90], e2 = [s * 16, -108];
    if (s > 0 && fold > 0) {
      const tx = o.fx ?? -10, ty = o.fy ?? -30, k = E.inOut(clamp(fold));
      return [sh[1], [lerp(e1[0], 42, k), lerp(e1[1], -96, k)], [lerp(e2[0], 30, k), lerp(e2[1], -70, k)], [lerp(hand[0], tx, k), lerp(hand[1], ty, k)]];
    }
    return [s < 0 ? sh[0] : sh[1], e1, e2, hand];
  };
  const draw = (c, cf) => {
    // legs: knees forward, heels up, toes on the floor
    limb(ctx, [[-6, -38], [-10 + drag * 0.3, -18], [-6 + drag, -1]], 8, 5, cf);
    limb(ctx, [[6, -38], [10 + drag * 0.3, -19], [7 + drag, -1]], 8, 5, c);
    ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(7 + drag, -1, 5, 2, 0, 0, Math.PI * 2); ctx.fill();
    // torso: a long shirt hanging slack from the shoulders
    ctx.beginPath(); ctx.moveTo(-13, -66); ctx.quadraticCurveTo(-15, -50, -11, -34); ctx.lineTo(11, -34); ctx.quadraticCurveTo(15, -50, 13, -66); ctx.quadraticCurveTo(0, -70, -13, -66); ctx.closePath(); ctx.fill();
    // arms
    for (const s of [-1, 1]) { const pts = armPts(s); limb(ctx, pts, 5, 3.2, s < 0 ? cf : c); const hd = pts[pts.length - 1]; ctx.fillStyle = s < 0 ? cf : c; ctx.beginPath(); ctx.ellipse(hd[0], hd[1] + (s > 0 && fold > 0.5 ? 2 : -2), 3.2, 4.4, 0, 0, Math.PI * 2); ctx.fill(); }
    // neck + head: hanging forward below the shoulders, lifts with o.up
    const hy = lerp(-54, -76, up), hx = lerp(2, 0, up);
    ctx.strokeStyle = c; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -66); ctx.quadraticCurveTo(0, lerp(-58, -70, up), hx, hy); ctx.stroke();
    ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(hx, hy, 6, 7.4, lerp(0.5, 0.1, up), 0, Math.PI * 2); ctx.fill();
  };
  ctx.save(); ctx.translate(-1.2, -0.8); draw(rgba(rim, 0.8 * lt), rgba(rim, 0.45 * lt)); ctx.restore();
  draw(COL.body, '#020305');
  const ea = o.eyes ?? 1;
  if (ea > 0) {
    const hy = lerp(-54, -76, up), hx = lerp(2, 0, up);
    for (const s of [-1, 1]) { ctx.fillStyle = rgba('#f4fff9', 0.95 * ea); ctx.beginPath(); ctx.ellipse(hx + s * 2.3, hy + lerp(2.2, -0.5, up), 1.1, lerp(0.6, 1.0, up), 0, 0, Math.PI * 2); ctx.fill(); }
  }
  if (o.coin && fold > 0.6) { ctx.fillStyle = '#e9c96a'; ctx.beginPath(); ctx.arc(o.fx ?? -10, (o.fy ?? -30) + 4, 2.4, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  if (ea > 0) D.glow(ctx, x, y - lerp(54, 76, up) * u, 10 * u, 'rgba(210,255,235,A)', 0.14 * ea * lt);
}
// you: the conductor (dark shirt, a leather cash bag on a strap, the ticket machine in hand)
function conductor(ctx, x, y, h, o = {}) {
  Wd.person(ctx, x, y, h, { col: '#14130f', rim: o.rim || COL.rim, rimSide: o.rimSide ?? 1, view: o.view || 'front', fear: o.fear || 0, look: o.look || 0, walk: o.walk ?? null, armL: o.armL, armR: o.armR, eyes: o.eyes, lean: o.lean });
  const u = h / 100; ctx.save(); ctx.translate(x, y); if (o.lean) ctx.rotate(o.lean);
  ctx.strokeStyle = '#3a2614'; ctx.lineWidth = 2.2 * u; ctx.beginPath(); ctx.moveTo(-10 * u, -80 * u); ctx.lineTo(9 * u, -46 * u); ctx.stroke();
  ctx.fillStyle = '#3a2614'; D.rrect(ctx, 4 * u, -50 * u, 13 * u, 11 * u, 2 * u); ctx.fill();
  if (o.view !== 'back') { ctx.fillStyle = '#9aa3a0'; ctx.fillRect(-14 * u, -46 * u, 7 * u, 10 * u); ctx.fillStyle = '#7fe8c8'; ctx.fillRect(-13 * u, -45 * u, 5 * u, 3 * u); }
  ctx.restore();
}

// ------------------------------------------------------------------ the bus interior (aisle view toward the back)
function interior(ctx, t, o = {}) {
  const lt = o.light ?? 1, fl = o.flick || 0, wm = o.warm || 0;
  // warm (v5 opening fix, 2026-11-29): every tube + warm bulbs on, cream walls, so frames 0-3 s are bright and colourful
  const W_ = (c, to, k = 1) => (wm > 0 ? mix(c, to, wm * k) : c);
  ctx.fillStyle = W_('#020403', '#6a4a2c', 0.9); ctx.fillRect(-500, -500, 2080, 2920);
  // back wall + back window (night road behind, far headlights)
  const bw = [P(-HW, CE, BACK), P(HW, CE, BACK), P(HW, FL, BACK), P(-HW, FL, BACK)];
  quad(ctx, ...bw, W_(mix(COL.wall, '#1a2420', 1 - lt * 0.85), '#f4c27c', 0.9));
  const w0 = P(-0.95, -0.75, BACK), w1 = P(0.95, 0.05, BACK);
  ctx.fillStyle = W_('#050a0c', '#3a2a40', 0.6); ctx.fillRect(w0[0], w0[1], w1[0] - w0[0], w1[1] - w0[1]);
  D.glow(ctx, VP.x + Math.sin(t * 0.3) * 40, w1[1] - 30, 60, 'rgba(255,220,170,A)', 0.25);
  if (o.backArm) { /* the arm out of the back window is drawn in busRear */ }
  // walls, floor, ceiling as strips from front to back
  const zs = [1.2, 2.2, 3.4, 4.6, 5.8, 7.0, 8.2, 9.4, 10.6, BACK];
  for (let i = zs.length - 2; i >= 0; i--) {
    const za = zs[i], zb = zs[i + 1], am = sweep(t, (za + zb) / 2) * (o.sweep ?? 1);
    const wallC = W_(mix(mix(COL.wall, '#18221e', 1 - lt * 0.9), COL.amber, am * 0.25), '#f7c27a', 0.88);
    for (const s of [-1, 1]) {
      // wall below the window, window, wall above
      quad(ctx, P(s * HW, 0.05, za), P(s * HW, 0.05, zb), P(s * HW, FL, zb), P(s * HW, FL, za), mix(wallC, '#000', 0.12));
      quad(ctx, P(s * HW, -0.62, za), P(s * HW, -0.62, zb), P(s * HW, 0.05, zb), P(s * HW, 0.05, za), W_(mix('#0c2420', COL.amber, am * 0.55), '#e08a3c', 0.85));
      quad(ctx, P(s * HW, CE, za), P(s * HW, CE, zb), P(s * HW, -0.62, zb), P(s * HW, -0.62, za), wallC);
      // window pillar
      quad(ctx, P(s * HW, -0.62, zb - 0.12), P(s * HW, -0.62, zb), P(s * HW, 0.05, zb), P(s * HW, 0.05, zb - 0.12), W_(mix('#9aa8a0', '#141a18', 1 - lt * 0.8), '#c8402c', 0.85));
    }
    quad(ctx, P(-HW, FL, za), P(HW, FL, za), P(HW, FL, zb), P(-HW, FL, zb), W_(mix(COL.floor, COL.amber, am * 0.08), '#b4865a', 0.85));
    quad(ctx, P(-HW, CE, za), P(HW, CE, za), P(HW, CE, zb), P(-HW, CE, zb), W_(mix(mix('#cfe3d8', '#1c2622', 1 - lt * 0.9), COL.amber, am * 0.15), '#ffd590', 0.9));
    // floor ribs
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = Math.max(1, 6 / za); ctx.beginPath(); ctx.moveTo(...P(-0.4, FL, za)); ctx.lineTo(...P(0.4, FL, za)); ctx.stroke();
  }
  // tubes down the ceiling
  for (let z = 1.6; z < BACK; z += 1.7) {
    const a = P(-0.12, CE + 0.02, z), b = P(0.12, CE + 0.02, z + 0.9);
    ctx.fillStyle = lt > 0.1 && !fl ? COL.tube : '#38423e'; ctx.fillRect(a[0], a[1], b[0] - a[0], Math.max(3, 40 / z));
    if (lt > 0.1 && !fl) D.glow(ctx, (a[0] + b[0]) / 2, a[1], 900 / z, 'rgba(210,255,232,A)', 0.35 * lt);
    if (wm > 0) for (const s of [-1, 1]) { const q = P(s * 0.85, CE + 0.08, z + 0.4); ctx.fillStyle = '#fff3c0'; ctx.beginPath(); ctx.arc(q[0], q[1], Math.max(3, 70 / z), 0, Math.PI * 2); ctx.fill(); D.glow(ctx, q[0], q[1], 1100 / z, 'rgba(255,190,90,A)', 0.45 * wm); }
  }
  // seats (both sides), back to front
  for (let z = 10.4; z >= 2.0; z -= 1.3) {
    if (o.seatsFrom && z < o.seatsFrom) continue;
    const am = sweep(t, z) * (o.sweep ?? 1);
    for (const s of [-1, 1]) {
      const x0 = s * 0.38, x1 = s * HW;
      quad(ctx, P(x0, -0.05, z), P(x1, -0.05, z), P(x1, FL, z), P(x0, FL, z), W_(mix(mix(COL.seat, '#0a1020', 1 - lt * 0.95), COL.amber, am * 0.2), '#2f6ae8', 0.8));
      quad(ctx, P(x0, -0.05, z), P(x1, -0.05, z), P(x1, -0.02, z - 0.08), P(x0, -0.02, z - 0.08), rgba('#ffffff', 0.18 * lt));
      // grab handle on the seat top
      const g = P(x0 + s * 0.06, -0.12, z); ctx.strokeStyle = mix(COL.rail, '#2a281c', 1 - lt * 0.8); ctx.lineWidth = Math.max(1.5, 30 / z); ctx.beginPath(); ctx.arc(g[0] + s * 30 / z, g[1] + 10 / z, 50 / z, Math.PI, 0); ctx.stroke();
    }
  }
  // roof rails (both sides of the aisle) + strap loops
  for (const s of [-1, 1]) {
    const a = P(s * 0.5, -0.92, 1.1), b = P(s * 0.5, -0.92, BACK);
    ctx.strokeStyle = mix(COL.rail, '#3a3424', 1 - lt * 0.7); ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke();
    ctx.strokeStyle = rgba('#ffffff', 0.35 * lt); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(a[0], a[1] - 5); ctx.lineTo(b[0], b[1] - 1); ctx.stroke();
    for (let z = 2.0; z < BACK; z += 1.0) { const p = P(s * 0.5, -0.92, z), sway = Math.sin(t * 1.15 + z) * 0.05; ctx.save(); ctx.translate(...p); ctx.rotate(sway); ctx.strokeStyle = '#1d1d1a'; ctx.lineWidth = Math.max(1.5, 40 / z); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 260 / z); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 330 / z, 70 / z, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  }
  // the bell cord along the right wall top + red bell pushes + the STOP lamp over the front door (right, near)
  const c0 = P(1.12, -0.78, 1.1), c1 = P(1.12, -0.78, BACK);
  ctx.strokeStyle = '#c8b27a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(...c0); ctx.quadraticCurveTo((c0[0] + c1[0]) / 2, (c0[1] + c1[1]) / 2 + 30, ...c1); ctx.stroke();
  const lamp = P(-0.9, -0.95, 2.6), lampOn = o.lamp || 0;
  ctx.fillStyle = lampOn ? COL.red : '#3a1210'; D.rrect(ctx, lamp[0] - 70, lamp[1] - 26, 140, 52, 8); ctx.fill();
  ctx.fillStyle = lampOn ? '#fff2ea' : '#6a2a24'; ctx.font = '36px Serif4'; ctx.textAlign = 'center'; ctx.fillText('STOP', lamp[0], lamp[1] + 12);
  if (lampOn) { D.glow(ctx, lamp[0], lamp[1], 320, 'rgba(255,60,50,A)', 0.6 * lampOn); }
  // the two rules on a paper by the front door (left wall, near)
  // him
  if (o.him) { const z = o.him.z ?? 6.4, f = P(o.him.x ?? 0, FL, z); hanger(ctx, f[0], f[1], (F / z) * 0.0162 * (o.him.s ?? 1), t, { ...o.him, light: lt }); }
  if (o.you) { const z = o.you.z ?? 2.6, f = P(o.you.x ?? 0.3, FL, z); conductor(ctx, f[0], f[1], (F / z) * 1.65 * (o.you.s ?? 1), o.you); }
  dust(ctx, t, 0, 300, 1080, 1300, 30, '#e6fff4', 0.25 * lt, 11);
  if (fl) { ctx.save(); ctx.fillStyle = `rgba(0,0,0,${fl})`; ctx.fillRect(-500, -500, 2080, 2920); ctx.restore(); }
}
// screen y of the roof rail and floor at depth z (for camera framing)
const railY = (z) => P(0.5, -0.92, z)[1], floorY = (z) => P(0, FL, z)[1];

// ------------------------------------------------------------------ exterior: the bus on the highway (side view)
// bus body from bx to bx+940 at road y 1500; o.him (silhouette in a window), o.door 0..1 open, o.you {x}, o.dark
function busSide(ctx, t, o = {}) {
  const sk = ctx.createLinearGradient(0, -200, 0, 1500); sk.addColorStop(0, '#010304'); sk.addColorStop(1, '#0b1a18');
  ctx.fillStyle = sk; ctx.fillRect(-500, -500, 2080, 2100);
  for (let i = 0; i < 60; i++) { ctx.fillStyle = `rgba(220,240,255,${0.2 + hash(i) * 0.5})`; ctx.fillRect(hash(i * 3.3) * 1600 - 260, hash(i * 7.1) * 900 - 200, 2, 2); }
  // tree line + fields
  ctx.fillStyle = '#020605'; for (let i = 0; i < 18; i++) { const x = -300 + i * 110 + hash(i) * 40, h = 120 + hash(i * 5) * 160; ctx.beginPath(); ctx.ellipse(x - (o.scroll || 0) % 110, 1330 - h / 2, 70, h / 2, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#071010'; ctx.fillRect(-500, 1320, 2080, 120);
  ctx.fillStyle = '#121615'; ctx.fillRect(-500, 1440, 2080, 700);
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = -2; i < 12; i++) ctx.fillRect(i * 200 - ((o.scroll || 0) * 3) % 200, 1640, 110, 10);
  const bx = o.bx ?? 70, by = 1500, lt = o.light ?? 1;
  // headlight beam ahead (bus faces left)
  beam(ctx, bx + 20, by - 110, Math.PI / 2 + 0.05, 900, 40, 380, '#fff2c8', 0.22 * lt);
  // body
  ctx.fillStyle = '#4a1f1a'; D.rrect(ctx, bx, by - 470, 940, 420, 30); ctx.fill();               // old red state bus
  ctx.fillStyle = '#c9b98a'; ctx.fillRect(bx, by - 240, 940, 26);                                 // cream band
  ctx.fillStyle = '#2a0f0c'; ctx.fillRect(bx, by - 80, 940, 30);
  // windows (lit mint)
  for (let i = 0; i < 7; i++) {
    const wx = bx + 170 + i * 108; ctx.fillStyle = lt > 0.1 ? '#bfeedd' : '#1a2420'; ctx.fillRect(wx, by - 430, 92, 150);
    ctx.fillStyle = 'rgba(0,30,20,0.25)'; ctx.fillRect(wx, by - 330, 92, 50);
  }
  if (o.him) { ctx.save(); ctx.beginPath(); for (let i = 0; i < 7; i++) ctx.rect(bx + 170 + i * 108, by - 430, 92, 150); ctx.clip(); hanger(ctx, bx + 170 + (o.him.w ?? 3) * 108 + 46, by - 250, 1.55, t, { light: 0.6, eyes: o.him.eyes ?? 0.8, rim: '#e8fff4' }); ctx.restore(); }
  // front: windscreen + door
  ctx.fillStyle = '#9fd8c4'; ctx.fillRect(bx + 14, by - 440, 70, 190);
  const dw = 60 * clamp(o.door || 0);
  ctx.fillStyle = '#1b0b09'; ctx.fillRect(bx + 92, by - 440, 64, 390);
  ctx.fillStyle = (o.door || 0) > 0.05 ? '#d8fff0' : '#9fd8c4'; ctx.fillRect(bx + 96 + dw * 0.9, by - 430, 56 - dw * 0.9, 370);
  if ((o.door || 0) > 0.05) D.glow(ctx, bx + 124, by - 200, 260, 'rgba(200,255,232,A)', 0.4 * o.door);
  ctx.fillStyle = '#fff6d0'; ctx.fillRect(bx, by - 130, 18, 30); D.glow(ctx, bx, by - 115, 140, 'rgba(255,240,200,A)', 0.6 * lt);
  ctx.fillStyle = COL.red; ctx.fillRect(bx + 925, by - 140, 15, 40); D.glow(ctx, bx + 935, by - 120, 120, 'rgba(255,50,40,A)', (o.brake ? 0.9 : 0.4));
  // destination board
  ctx.fillStyle = '#0a0a08'; ctx.fillRect(bx + 170, by - 470, 400, 36); ctx.fillStyle = '#ffb347'; ctx.font = '28px Serif4'; ctx.textAlign = 'left'; ctx.fillText('Last bus · Kesarpur', bx + 184, by - 443);
  // wheels
  for (const wx of [bx + 200, bx + 760]) { ctx.fillStyle = '#060606'; ctx.beginPath(); ctx.arc(wx, by - 40, 62, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#3a3a36'; ctx.beginPath(); ctx.arc(wx, by - 40, 24, 0, Math.PI * 2); ctx.fill(); }
  // light spill from the door / windows onto the road
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const sp = ctx.createLinearGradient(0, by - 40, 0, by + 300); sp.addColorStop(0, rgba('#bfeedd', 0.18 * lt)); sp.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = sp; ctx.fillRect(bx, by - 40, 940, 340); ctx.restore();
  if (o.you) conductor(ctx, o.you.x, o.you.y ?? 1640, o.you.h ?? 330, { ...o.you, rim: '#bfeedd' });
  if (o.flick) { ctx.save(); ctx.fillStyle = `rgba(0,0,0,${o.flick})`; ctx.fillRect(-500, -500, 2080, 2920); ctx.restore(); }
}

// ------------------------------------------------------------------ exterior: the road behind; the bus driving away
// d 0..1 = how far the bus has gone; o.arm 0..1 = his long arm out of the back window, waving down to the road; o.you
function busRear(ctx, t, o = {}) {
  const sk = ctx.createLinearGradient(0, 0, 0, 900); sk.addColorStop(0, '#010203'); sk.addColorStop(1, '#0a1614');
  ctx.fillStyle = sk; ctx.fillRect(-500, -500, 2080, 1500);
  for (let i = 0; i < 50; i++) { ctx.fillStyle = `rgba(220,240,255,${0.15 + hash(i * 2) * 0.5})`; ctx.fillRect(hash(i * 4.3) * 1500 - 200, hash(i * 9.1) * 700 - 100, 2, 2); }
  const hz = 880;
  ctx.fillStyle = '#030807'; ctx.fillRect(-500, hz - 40, 2080, 60);
  ctx.fillStyle = '#0a0f0e'; ctx.fillRect(-500, hz, 2080, 1600);
  ctx.fillStyle = '#16191a'; ctx.beginPath(); ctx.moveTo(530, hz); ctx.lineTo(550, hz); ctx.lineTo(1500, 2200); ctx.lineTo(-420, 2200); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; for (let i = 0; i < 9; i++) { const k = i / 9, y0 = lerp(hz, 2100, k * k), y1 = lerp(hz, 2100, (k + 0.05) * (k + 0.05)); ctx.beginPath(); ctx.moveTo(538, y0); ctx.lineTo(542, y0); ctx.lineTo(540 + (y1 - hz) * 0.02, y1); ctx.lineTo(540 - (y1 - hz) * 0.02, y1); ctx.fill(); }
  // green highway sign at the roadside
  if (o.sign !== false) {
    ctx.fillStyle = '#2b2f2c'; ctx.fillRect(860, 760, 10, 340); ctx.fillRect(1010, 760, 10, 340);
    ctx.fillStyle = '#0d5a34'; D.rrect(ctx, 820, 640, 240, 150, 10); ctx.fill(); ctx.strokeStyle = '#e8f2ea'; ctx.lineWidth = 4; D.rrect(ctx, 828, 648, 224, 134, 8); ctx.stroke();
    ctx.fillStyle = '#f4fbf6'; ctx.font = '40px Serif4'; ctx.textAlign = 'center'; ctx.fillText('Kesarpur', 940, 705); ctx.font = '36px Serif4i'; ctx.fillText('12 km', 940, 755);
  }
  // the bus rear, shrinking toward the horizon
  const d = clamp(o.d ?? 0), s = lerp(1.0, 0.16, E.out(d)), cx = 540, by = lerp(1520, hz + 14, E.out(d));
  ctx.save(); ctx.translate(cx, by); ctx.scale(s, s);
  ctx.fillStyle = '#3c1814'; D.rrect(ctx, -260, -560, 520, 540, 30); ctx.fill();
  ctx.fillStyle = '#c9b98a'; ctx.fillRect(-260, -300, 520, 22);
  ctx.fillStyle = '#bfeedd'; ctx.fillRect(-210, -520, 420, 190);                 // back window, lit
  // inside the back window: him, hanging, facing us
  ctx.save(); ctx.beginPath(); ctx.rect(-210, -520, 420, 190); ctx.clip(); hanger(ctx, 0, -250, 2.0, t, { light: 0.8, rim: '#ffffff', eyes: 1, fold: o.arm ? 0.0 : 0 }); ctx.restore();
  for (const sx of [-1, 1]) { ctx.fillStyle = COL.red; ctx.fillRect(sx * 230 - 14, -200, 28, 60); D.glow(ctx, sx * 230, -170, 160, 'rgba(255,40,30,A)', 0.7); }
  ctx.fillStyle = '#0a0a08'; ctx.fillRect(-90, -120, 180, 50); ctx.fillStyle = '#e8e2c8'; ctx.font = '30px Serif4'; ctx.textAlign = 'center'; ctx.fillText('MH 12 · 0240', 0, -84);
  // his long arm out of the back window, hanging down the back of the bus and waving low over the road
  const ar = clamp(o.arm || 0);
  if (ar > 0) {
    const wv = Math.sin(t * 3.2) * 40 * ar;
    const pts = [[-150, -360], [-230, -250], [-200 + wv * 0.3, -80], [-160 + wv, 60 + 80 * ar], [-120 + wv * 1.3, 120 + 140 * ar]];
    ctx.save(); ctx.translate(-1.5, -1); limb(ctx, pts, 22, 14, rgba('#ffffff', 0.6)); ctx.restore();
    limb(ctx, pts, 22, 14, COL.body);
    const hd = pts[pts.length - 1]; ctx.fillStyle = COL.body; ctx.save(); ctx.translate(...hd); ctx.rotate(wv * 0.01);
    ctx.beginPath(); ctx.ellipse(0, 18, 18, 28, 0, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 7; ctx.strokeStyle = COL.body; for (let f = 0; f < 4; f++) { ctx.beginPath(); ctx.moveTo(-12 + f * 8, 36); ctx.lineTo(-18 + f * 12 + Math.sin(t * 6 + f) * 6, 80); ctx.stroke(); }
    ctx.restore();
  }
  ctx.restore();
  // red glow of the tail lights on the road
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const rg = ctx.createRadialGradient(cx, by + 40, 10, cx, by + 40, 500 * s + 60); rg.addColorStop(0, 'rgba(255,40,30,0.25)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = rg; ctx.fillRect(-500, hz, 2080, 1400); ctx.restore();
  if (o.you) conductor(ctx, o.you.x, o.you.y, o.you.h, { ...o.you, rim: '#ff7a5a', rimSide: 1 });
}

// ------------------------------------------------------------------ inserts
// the electronic ticket machine in your hand: screen with the time, a taped note with the two rules, a printed ticket
function etm(ctx, t, o = {}) {
  L.blurLayer(ctx, 'etmBg', 0.05, (x) => interior(x, t, { him: { z: 6.4 } }), 1);
  ctx.save(); ctx.translate(540, 1000); ctx.rotate(-0.05 + Math.sin(t * 1.1) * 0.012);
  // printed ticket coming out of the top
  const pr = clamp(o.print || 0);
  if (pr > 0) {
    ctx.save(); ctx.translate(0, -360 - pr * 300);
    ctx.fillStyle = '#f3efe2'; ctx.fillRect(-170, -20, 340, 300 + pr * 0);
    ctx.fillStyle = '#2a2a2a'; ctx.font = '30px Serif4'; ctx.textAlign = 'center';
    ctx.fillText('STATE TRANSPORT', 0, 30); ctx.fillText('02:40 · 1 adult · Rs 10', 0, 80);
    ctx.font = '26px Serif4i'; ctx.fillText('from: city depot', 0, 130);
    ctx.fillStyle = o.hot ? '#c0201a' : '#2a2a2a'; ctx.font = '52px Serif4'; ctx.fillText('to: Kesarpur', 0, 210);
    ctx.restore();
  }
  ctx.fillStyle = '#20262a'; D.rrect(ctx, -260, -400, 520, 860, 50); ctx.fill();
  ctx.fillStyle = '#3a4248'; D.rrect(ctx, -240, -380, 480, 820, 40); ctx.fill();
  ctx.fillStyle = '#0a0d0c'; ctx.fillRect(-160, -398, 320, 22);                                  // paper slot
  ctx.fillStyle = '#0b2a22'; D.rrect(ctx, -190, -330, 380, 230, 16); ctx.fill();               // screen
  ctx.fillStyle = '#8ff0c8'; ctx.font = '96px Serif4'; ctx.textAlign = 'center'; ctx.fillText(o.time || '02:40', 0, -195);
  ctx.font = '34px Serif4i'; ctx.fillText(o.screen || 'last trip', 0, -135);
  D.glow(ctx, 0, -215, 260, 'rgba(140,240,200,A)', 0.25);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { ctx.fillStyle = '#c7ccc8'; D.rrect(ctx, -165 + c * 115, -60 + r * 85, 100, 66, 10); ctx.fill(); }
  // taped note over the bottom of the machine
  const na = o.note ?? 0;
  if (na > 0) {
    ctx.save(); ctx.globalAlpha = na; ctx.translate(10, 260); ctx.rotate(0.06);
    ctx.fillStyle = '#efe9d6'; ctx.fillRect(-300, -120, 600, 250);
    ctx.fillStyle = 'rgba(230,220,160,0.6)'; ctx.fillRect(-330, -135, 110, 40); ctx.fillRect(220, -135, 110, 40);
    ctx.fillStyle = '#1a2252'; ctx.font = '50px Serif4i'; ctx.textAlign = 'left';
    ctx.globalAlpha = na * (0.25 + 0.75 * clamp(o.l1 ?? 1)); ctx.fillText('1. Everyone needs a ticket.', -275, -40);
    ctx.globalAlpha = na * (0.25 + 0.75 * clamp(o.l2 ?? 1)); ctx.fillText('2. Never ring the bell twice.', -275, 50);
    ctx.restore();
  }
  ctx.restore();
  Wd.myHand(ctx, 260, 1480, -0.25, 1.2, { curl: 0.7 });
  const sh = ctx.createLinearGradient(0, 0, 1080, 0); sh.addColorStop(0, 'rgba(0,0,0,0.45)'); sh.addColorStop(0.4, 'rgba(0,0,0,0)'); ctx.fillStyle = sh; ctx.fillRect(0, 0, 1080, 1920);
}
// your open palm (bottom) and his long grey fingers coming down from above; drop 0..1 = the coin falls
function coinHand(ctx, t, o = {}) {
  L.blurLayer(ctx, 'chBg', 0.05, (x) => interior(x, t, {}), 1);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, 0, 1080, 1920);
  const k = E.out(clamp(o.reach ?? 1)), dr = clamp(o.drop || 0);
  // his forearm + hand from the top, impossibly long, wrist bent
  const hx = 560 + Math.sin(t * 1.3) * 10, hy = lerp(-300, 720, k);
  ctx.save();
  ctx.strokeStyle = '#05080a'; ctx.lineCap = 'round'; ctx.lineWidth = 70; ctx.beginPath(); ctx.moveTo(700, -400); ctx.quadraticCurveTo(640, hy - 400, hx, hy - 120); ctx.stroke();
  ctx.strokeStyle = rgba('#d8fff0', 0.35); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(735, -400); ctx.quadraticCurveTo(675, hy - 400, hx + 34, hy - 120); ctx.stroke();
  const sk = '#7d8a86';
  ctx.translate(hx, hy - 60); ctx.scale(1.8, 1.8); ctx.translate(-hx, -(hy - 60));
  ctx.fillStyle = sk; ctx.beginPath(); ctx.ellipse(hx, hy - 60, 60, 80, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = sk; ctx.lineWidth = 18; for (let f = 0; f < 4; f++) { const fx = hx - 45 + f * 30; ctx.beginPath(); ctx.moveTo(fx, hy - 20); ctx.quadraticCurveTo(fx - 4, hy + 90, fx + Math.sin(t * 4 + f) * 6, hy + 150 + (f === 1 || f === 2 ? 30 : 0)); ctx.stroke(); }
  ctx.restore();
  // the coin
  const cy = lerp(hy + 130, 1150, E.in(dr)), spin = Math.abs(Math.cos(t * 9));
  if (o.coin !== false) { ctx.fillStyle = '#e9c96a'; ctx.beginPath(); ctx.ellipse(hx + 10, cy, 34, 34 * (dr > 0 && dr < 1 ? spin : 0.5) + 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#8a6a20'; ctx.lineWidth = 4; ctx.stroke(); D.glow(ctx, hx + 10, cy, 80, 'rgba(255,220,130,A)', 0.3); }
  // your palm, up
  ctx.save(); ctx.translate(520, 1260); ctx.scale(1.4, 1.4);
  ctx.fillStyle = '#2c2a33'; ctx.fillRect(-90, 80, 180, 700);
  const sk2 = ctx.createLinearGradient(-90, 0, 90, 0); sk2.addColorStop(0, '#5a3524'); sk2.addColorStop(0.6, '#93603e'); sk2.addColorStop(1, '#4a2a1a');
  ctx.fillStyle = sk2; ctx.beginPath(); ctx.ellipse(0, 20, 120, 80, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = sk2; ctx.lineCap = 'round'; ctx.lineWidth = 30; for (let f = 0; f < 4; f++) { ctx.beginPath(); ctx.moveTo(-70 + f * 46, -20); ctx.lineTo(-80 + f * 52, -80 - (f === 1 || f === 2 ? 14 : 0)); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-110, 30); ctx.lineTo(-170, -20); ctx.stroke();
  ctx.restore();
}
// the bell cord close-up: your hand pulls it; the red STOP lamp lights on each pull
function cord(ctx, t, o = {}) {
  ctx.fillStyle = '#b8cfc2'; ctx.fillRect(-500, -500, 2080, 2920);
  const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.6)'); ctx.fillStyle = g; ctx.fillRect(-500, -500, 2080, 2920);
  // window strip with passing amber light
  const am = sweep(t, 3); ctx.fillStyle = mix('#05100d', COL.amber, am * 0.6); ctx.fillRect(-500, 820, 2080, 640);
  ctx.fillStyle = '#9aa8a0'; ctx.fillRect(-500, 800, 2080, 30); ctx.fillRect(-500, 1450, 2080, 30);
  const p = clamp(o.pull || 0), lamp = o.lamp || 0;
  // lamp
  ctx.fillStyle = lamp ? COL.red : '#3a1210'; D.rrect(ctx, 620, 280, 320, 130, 16); ctx.fill();
  ctx.fillStyle = lamp ? '#fff2ea' : '#6a2a24'; ctx.font = '96px Serif4'; ctx.textAlign = 'center'; ctx.fillText('STOP', 780, 380);
  if (lamp) D.glow(ctx, 780, 345, 700, 'rgba(255,50,40,A)', 0.7 * lamp);
  // the cord, pulled down into a V by your hand
  const hx = 420, hy = 560 + p * 150;
  ctx.strokeStyle = '#c8b27a'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(-200, 520); ctx.lineTo(hx, hy); ctx.lineTo(1300, 520); ctx.stroke();
  Wd.myHand(ctx, hx + 20, hy + 70, 0.15, 1.3, { curl: 1 });
}
// a village house at night, one lit window (your mother asleep)
function village(ctx, t, o = {}) {
  const sk = ctx.createLinearGradient(0, 0, 0, 1300); sk.addColorStop(0, '#02040a'); sk.addColorStop(1, '#14202a'); ctx.fillStyle = sk; ctx.fillRect(-500, -500, 2080, 2000);
  for (let i = 0; i < 90; i++) { ctx.fillStyle = `rgba(230,240,255,${0.15 + hash(i * 1.7) * 0.6})`; ctx.fillRect(hash(i * 5.3) * 1500 - 200, hash(i * 2.9) * 1100 - 200, 2, 2); }
  D.glow(ctx, 820, 330, 120, 'rgba(230,240,255,A)', 0.4); ctx.fillStyle = '#e8eef4'; ctx.beginPath(); ctx.arc(820, 330, 36, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#05080a'; ctx.fillRect(-500, 1280, 2080, 900);
  // neem tree
  ctx.fillStyle = '#030506'; ctx.fillRect(150, 820, 34, 480); for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(100 + hash(i) * 200, 700 + hash(i * 3) * 220, 120, 80, 0, 0, Math.PI * 2); ctx.fill(); }
  // house: mud walls, tin roof, door, one window lit warm
  ctx.fillStyle = '#2a1c14'; ctx.fillRect(360, 960, 520, 340);
  ctx.fillStyle = '#1a1512'; ctx.beginPath(); ctx.moveTo(330, 970); ctx.lineTo(620, 820); ctx.lineTo(910, 970); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#0a0705'; ctx.fillRect(420, 1100, 110, 200);
  const lamp = 0.8 + 0.2 * noise1(t * 3);
  ctx.fillStyle = mix('#3a2410', '#ffc06a', lamp * (o.lamp ?? 1)); ctx.fillRect(640, 1060, 120, 100);
  ctx.strokeStyle = '#1a1210'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(700, 1060); ctx.lineTo(700, 1160); ctx.moveTo(640, 1110); ctx.lineTo(760, 1110); ctx.stroke();
  D.glow(ctx, 700, 1110, 260, 'rgba(255,170,80,A)', 0.45 * lamp * (o.lamp ?? 1));
  // a far road with a small pair of headlights coming (the bus)
  if (o.bus) { const k = clamp(o.bus); D.glow(ctx, lerp(-80, 260, k), 1300, 60 + k * 30, 'rgba(255,240,200,A)', 0.8); D.glow(ctx, lerp(-40, 300, k), 1300, 60 + k * 30, 'rgba(255,240,200,A)', 0.8); }
}
// his face, close: the head hanging between his shoulders, two long arms going up out of frame; o.up lifts the head
function hangerFace(ctx, t, o = {}) {
  L.blurLayer(ctx, 'hfBg', 0.05, (x) => { x.translate(540, 960); x.scale(2.2, 2.2); x.translate(-540, -760); interior(x, t, {}); }, 1);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, 0, 1080, 1920);
  const up = clamp(o.up || 0), sw = Math.sin(t * 1.15) * 14;
  ctx.save(); ctx.translate(540 + sw, 1000);
  // arms up out of frame
  for (const s of [-1, 1]) { ctx.strokeStyle = COL.body; ctx.lineCap = 'round'; ctx.lineWidth = 90; ctx.beginPath(); ctx.moveTo(s * 300, 300); ctx.lineTo(s * 420, -300); ctx.lineTo(s * 260, -1300); ctx.stroke(); ctx.strokeStyle = rgba(COL.rim, 0.3); ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(s * 300 + s * 44, 300); ctx.lineTo(s * 420 + s * 44, -300); ctx.lineTo(s * 260 + s * 44, -1300); ctx.stroke(); }
  // shoulders
  ctx.fillStyle = COL.body; ctx.beginPath(); ctx.moveTo(-420, 1000); ctx.quadraticCurveTo(-400, 260, -280, 240); ctx.lineTo(280, 240); ctx.quadraticCurveTo(400, 260, 420, 1000); ctx.closePath(); ctx.fill();
  // head: hangs low between the shoulders, lifts on o.up
  const hy = lerp(380, 20, E.outBack(up)), rot = lerp(0.6, 0.05, up);
  ctx.save(); ctx.translate(0, hy); ctx.rotate(rot);
  ctx.fillStyle = '#0a0f0e'; ctx.beginPath(); ctx.ellipse(0, 0, 200, 250, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = rgba('#b9c8c2', 0.06 + 0.08 * up); ctx.beginPath(); ctx.ellipse(10, 40, 150, 190, 0, 0, Math.PI * 2); ctx.fill();
  for (const s of [-1, 1]) { ctx.fillStyle = '#f4fff9'; ctx.beginPath(); ctx.ellipse(s * 66, -10, 16, 3 + up * 6, s * 0.12, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.beginPath(); ctx.ellipse(0, 130, 36, 3 + up * 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#05080a'; ctx.beginPath(); ctx.ellipse(0, -150, 210, 130, 0, Math.PI, 0); ctx.fill();
  ctx.restore();
  ctx.restore();
  D.glow(ctx, 540 + sw, 1000 + hy - 10, 260, 'rgba(210,255,235,A)', 0.12 + 0.15 * up);
}

module.exports = { interior, hanger, conductor, busSide, busRear, etm, coinHand, cord, village, hangerFace, P, railY, floorY, sweep, VP, F, BACK, HW, FL, CE, COL };
