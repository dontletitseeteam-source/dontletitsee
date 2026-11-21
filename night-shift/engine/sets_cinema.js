// NIGHT SHIFT — Episode 6 set painters: the old single-screen cinema at 3 AM.
// THE VIEWER: a too-tall man whose face is a glowing screen. drawHall (house lights, rows A-H, him in H13),
// drawFaceClose (the POSTER image: his screen-face; on it, you screaming), drawBooth (projection booth side view: projector,
// reels, beam, window, you in the mustard jacket, the Viewer bending under the ceiling = scale shot), drawPOV (through the
// booth window: the big screen playing the live film of the booth, the back of his head in H13), drawPanel (PLAY / STOP),
// drawNote (the 2 rules), drawShoulder (the cold hand). World space 1080x1920, same conventions as the other sets.
const D = require('./draw');
const { W, H, C, clamp, lerp, inv, E, hash, noise1, flicker, rrect, glow, spaced, drawStick, drawFace } = D;

const JACKET = '#d9a01e', SEAT = '#b3263a', SEAT_D = '#6e1424', SUIT = '#10131f', SKIN = '#9aa1b3', SCREEN = '#d8ecff';
const INK = '#141a36', REDINK = '#c4202c';
const poly = (ctx, pts, fill) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } };
const mix = (a, b, k) => { const p = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(k)))).join(',')})`; };
const darken = (ctx, a) => { if (a > 0.005) { ctx.fillStyle = `rgba(2,3,8,${a})`; ctx.fillRect(-2000, -2000, W + 4000, H + 4000); } };

// ---------- what plays on a screen: the live "film" of the booth, seen from behind (virtual 900x500) ----------
// st: {wave 0..1, shape 0..1 (the tall shape steps in), lean 0..1, scream}
function filmFrame(ctx, t, st = {}) {
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, 900, 500); ctx.clip();
  ctx.fillStyle = '#c9d3e6'; ctx.fillRect(0, 0, 900, 500);
  ctx.fillStyle = '#aab6cf'; ctx.fillRect(0, 400, 900, 100);
  ctx.fillStyle = '#8e9bb8'; ctx.fillRect(0, 396, 900, 6);
  // the booth window (we look at the man's back, he faces the window)
  rrect(ctx, 560, 150, 170, 120, 8); ctx.fillStyle = '#25304e'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#59647f'; ctx.stroke();
  // projector silhouette
  ctx.fillStyle = '#3b4560'; rrect(ctx, 600, 270, 180, 90, 10); ctx.fill(); ctx.fillRect(670, 360, 30, 40);
  for (const rx of [630, 750]) { ctx.beginPath(); ctx.arc(rx, 240, 40, 0, 7); ctx.fill(); }
  // the tall shape (behind him, from the left)
  const sh = clamp(st.shape || 0);
  if (sh > 0) {
    const x = lerp(-120, 250, E.out(sh)), lean = clamp(st.lean || 0);
    ctx.save(); ctx.translate(x, 400);
    ctx.fillStyle = '#0a0c16';
    poly(ctx, [[-50, 0], [50, 0], [44, -300], [60 + lean * 60, -400], [-30 + lean * 60, -420], [-44, -300]], '#0a0c16');
    ctx.save(); ctx.translate(20 + lean * 70, -450); ctx.rotate(0.35 * lean + 0.2);
    ctx.beginPath(); ctx.ellipse(0, 0, 42, 56, 0, 0, 7); ctx.fill();
    rrect(ctx, -28, -32, 56, 60, 8); ctx.fillStyle = `rgba(230,244,255,${0.75 + 0.25 * flicker(t, 3, 0.1)})`; ctx.fill();
    ctx.restore();
    ctx.strokeStyle = '#0a0c16'; ctx.lineWidth = 14; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(30, -360); ctx.lineTo(90 + lean * 60, -280 + lean * 20); ctx.lineTo(120 + lean * 130, -300 + lean * 40); ctx.stroke();
    ctx.restore();
  }
  // the man from behind, in YOUR mustard jacket
  ctx.save();
  drawStick(ctx, { x: 420, y: 398, s: 0.62, view: 'back', jacket: JACKET, color: '#1a2036', fill: '#2a3150', arm: st.wave > 0 ? 'wave' : undefined, wv: Math.sin(t * 9) * 1.6 * clamp(st.wave || 0) });
  ctx.restore();
  // old film look: grain, flicker, scratches, vignette
  ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(140,160,200,0.55)'; ctx.fillRect(0, 0, 900, 500);
  ctx.globalCompositeOperation = 'source-over';
  const fr = Math.floor(t * 24);
  for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(255,255,255,${0.12 * hash(fr * 7 + i)})`; ctx.fillRect(hash(fr + i * 3.3) * 900, hash(fr * 1.7 + i) * 500, 3, 3); }
  if (hash(fr * 0.37) > 0.6) { ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(hash(fr * 2.1) * 900, 0, 2, 500); }
  const vg = ctx.createRadialGradient(450, 250, 150, 450, 250, 520); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, 900, 500);
  ctx.fillStyle = `rgba(255,255,255,${0.05 * (1 - flicker(t, 9, 0.2))})`; ctx.fillRect(0, 0, 900, 500);
  // LIVE tag
  if (st.live) { ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(40, 40, 10, 0, 7); ctx.fill(); ctx.font = '30px Mono700'; ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.fillText('LIVE', 58, 41); }
  ctx.restore();
}

// ---------- the content of HIS face-screen (virtual 200x240 centred on 0,0) ----------
// mode: 'blank' (glowing white, scan lines, film light), 'scream' (your face screaming), 'you' (your scared face, close)
function faceScreen(ctx, t, mode, k = 1) {
  ctx.save();
  rrect(ctx, -100, -120, 200, 240, 30); ctx.clip();
  const g = ctx.createRadialGradient(0, -20, 10, 0, 0, 170); g.addColorStop(0, '#ffffff'); g.addColorStop(1, mode === 'blank' ? '#9fc3ff' : '#ff9aa8');
  ctx.fillStyle = g; ctx.fillRect(-100, -120, 200, 240);
  if (mode !== 'blank') {
    // you, on the screen: a big round head with a readable face
    const jit = mode === 'scream' ? Math.sin(t * 50) * 2.5 : 0;
    ctx.save(); ctx.translate(jit, 18); ctx.scale(1.9, 1.9);
    ctx.beginPath(); ctx.arc(0, 0, 40, 0, 7); ctx.fillStyle = '#26304e'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#0b1022'; ctx.stroke();
    drawFace(ctx, { fear: mode === 'scream' ? 1 : 0.7 }, '#ffffff');
    ctx.restore();
    ctx.fillStyle = 'rgba(255,40,70,0.18)'; ctx.fillRect(-100, -120, 200, 240);
  } else {
    // drifting film light
    for (let i = 0; i < 3; i++) { const y = ((t * 40 + i * 80) % 240) - 120; ctx.fillStyle = 'rgba(120,150,210,0.18)'; ctx.fillRect(-100, y, 200, 26); }
  }
  ctx.fillStyle = 'rgba(0,0,30,0.13)'; for (let y = -120; y < 120; y += 6) ctx.fillRect(-100, y, 200, 2);
  ctx.restore();
}

// ---------- THE VIEWER (full figure). origin = feet centre. Height ~1150 at s=1 standing.
// st: {bend 0..1 (head pressed under a ceiling, leaning forward), mode (face screen), glow, arm 0..1 (reach), tilt}
function drawViewer(ctx, t, x, y, s, st = {}) {
  const bend = clamp(st.bend || 0);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // long legs
  ctx.fillStyle = SUIT;
  poly(ctx, [[-70, 0], [-30, 0], [-18, -520], [-62, -520]], SUIT); poly(ctx, [[30, 0], [70, 0], [62, -520], [18, -520]], SUIT);
  ctx.fillStyle = '#05060c'; rrect(ctx, -86, -18, 64, 22, 8); ctx.fill(); rrect(ctx, 22, -18, 64, 22, 8); ctx.fill();
  // torso (bends forward at the chest)
  ctx.save(); ctx.translate(0, -510);
  poly(ctx, [[-80, 0], [80, 0], [90, -380], [-90, -380]], SUIT);
  ctx.strokeStyle = '#2b3150'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(0, -370); ctx.stroke();
  ctx.translate(0, -380); ctx.rotate(bend * 0.85);
  poly(ctx, [[-92, 0], [92, 0], [70, -200], [-70, -200]], SUIT);
  // white shirt + thin black tie
  poly(ctx, [[-22, -200], [22, -200], [10, -120], [-10, -120]], '#e8ecf4'); poly(ctx, [[-5, -196], [5, -196], [7, -130], [0, -118], [-7, -130]], '#05060c');
  // arm (hangs, or reaches forward)
  const ar = clamp(st.arm || 0);
  ctx.strokeStyle = SUIT; ctx.lineWidth = 34; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(78, -180); ctx.lineTo(lerp(110, 230, ar), lerp(80, -40, ar)); ctx.lineTo(lerp(110, 400, ar), lerp(340, 60, ar)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-78, -180); ctx.lineTo(-108, 80); ctx.lineTo(-104, 330); ctx.stroke();
  const hand = (hx, hy, rot) => { ctx.save(); ctx.translate(hx, hy); ctx.rotate(rot); ctx.fillStyle = SKIN; ctx.beginPath(); ctx.ellipse(0, 10, 22, 30, 0, 0, 7); ctx.fill(); ctx.strokeStyle = SKIN; ctx.lineWidth = 7; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-15 + i * 10, 30); ctx.lineTo(-20 + i * 12, 100 + (i === 1 || i === 2 ? 14 : 0)); ctx.stroke(); } ctx.restore(); };
  hand(lerp(110, 400, ar), lerp(340, 60, ar), lerp(0, -0.9, ar)); hand(-104, 330, 0.05);
  // neck + head with the screen face
  ctx.fillStyle = SUIT; ctx.fillRect(-20, -250, 40, 60);
  ctx.translate(0, -330); ctx.rotate((st.tilt || 0) + bend * 0.5);
  ctx.beginPath(); ctx.ellipse(0, 0, 112, 136, 0, 0, 7); ctx.fillStyle = '#0b0d16'; ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = '#2b3150'; ctx.stroke();
  glow(ctx, 0, 10, 330, 'rgba(190,220,255,A)', 0.45 * (st.glow ?? 1));
  ctx.save(); ctx.translate(0, 8); ctx.scale(0.86, 0.86); faceScreen(ctx, t, st.mode || 'blank'); ctx.restore();
  ctx.restore();
  ctx.restore();
}

// ---------- the seated Viewer (front, used in the hall). origin = seat centre ----------
function viewerSeated(ctx, t, s, st = {}) {
  ctx.save(); ctx.scale(s, s);
  poly(ctx, [[-70, 0], [70, 0], [80, -240], [-80, -240]], SUIT);
  poly(ctx, [[-20, -240], [20, -240], [9, -170], [-9, -170]], '#e8ecf4'); poly(ctx, [[-4, -236], [4, -236], [6, -180], [0, -170], [-6, -180]], '#05060c');
  ctx.fillStyle = SUIT; ctx.fillRect(-18, -290, 36, 60);
  ctx.translate(0, -370 - (st.rise || 0) * 200); ctx.rotate(st.tilt || 0);
  glow(ctx, 0, 0, 420, 'rgba(190,220,255,A)', 0.55);
  ctx.beginPath(); ctx.ellipse(0, 0, 100, 122, 0, 0, 7); ctx.fillStyle = '#0b0d16'; ctx.fill();
  ctx.save(); ctx.translate(0, 6); ctx.scale(0.78, 0.78); faceScreen(ctx, t, st.mode || 'blank'); ctx.restore();
  ctx.restore();
}

// ---------- THE HALL, seen from the screen end. Rows A (near) .. H (far, under the booth window) ----------
// st: {light 0..1 (house lights), beam 0..1, viewer 0..1 (in H13), empty (H13 seat label lit), tilt}
const ROWS = 8;
const rowY = i => lerp(1820, 1010, Math.pow(i / (ROWS - 1), 0.85));
const rowS = i => lerp(1.0, 0.46, i / (ROWS - 1));
const H13 = { x: 560 };
function drawHall(ctx, t, st = {}) {
  const L = (st.light ?? 1) * flicker(t, 2, 0.01);
  // back wall + ceiling
  ctx.fillStyle = mix('#07091a', '#3a2340', L); ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  ctx.fillStyle = mix('#0b0e22', '#5a3350', L); ctx.fillRect(-1500, 300, W + 3000, 760);
  // wall drapes (vertical folds)
  for (let x = -600; x < 1700; x += 60) { ctx.fillStyle = `rgba(0,0,0,${0.12 + 0.1 * Math.sin(x * 0.11)})`; ctx.fillRect(x, 300, 30, 760); }
  // sconces
  for (const sx of [-120, 200, 880, 1200]) { ctx.fillStyle = mix('#2a2030', '#ffd9a0', L); poly(ctx, [[sx - 26, 600], [sx + 26, 600], [sx + 14, 650], [sx - 14, 650]]); glow(ctx, sx, 620, 260, 'rgba(255,200,130,A)', 0.55 * L); }
  // the booth window high on the back wall + the projector beam fanning toward us
  rrect(ctx, 470, 380, 180, 110, 10); ctx.fillStyle = '#05060c'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = mix('#2a2f48', '#8a7a8a', L); ctx.stroke();
  const bm = clamp(st.beam ?? 0);
  if (bm > 0) {
    glow(ctx, 560, 435, 120, 'rgba(230,240,255,A)', 0.9 * bm);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(560, 435, 560, 2000); g.addColorStop(0, `rgba(200,220,255,${0.32 * bm})`); g.addColorStop(1, 'rgba(200,220,255,0)');
    poly(ctx, [[540, 430], [580, 430], [1700, 2000], [-600, 2000]], null); ctx.fillStyle = g; ctx.fill();
    for (let i = 0; i < 30; i++) { const u = (hash(i * 3.1) + t * 0.01 * (1 + hash(i))) % 1; const yy = lerp(500, 1900, u); const xx = 560 + (hash(i * 7.7) - 0.5) * (yy - 430) * 1.6; ctx.fillStyle = `rgba(255,255,255,${0.35 * bm})`; ctx.fillRect(xx, yy, 3, 3); }
    ctx.restore();
  }
  // EXIT sign
  rrect(ctx, 880, 330, 120, 46, 6); ctx.fillStyle = '#0d2a14'; ctx.fill(); ctx.font = '30px Osw700'; ctx.fillStyle = '#5dff7a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('EXIT', 940, 354);
  glow(ctx, 940, 354, 90, 'rgba(90,255,120,A)', 0.25);
  // stepped floor
  ctx.fillStyle = mix('#05060e', '#2a1a28', L); ctx.fillRect(-1500, 1000, W + 3000, 1500);
  // rows, far to near
  for (let i = ROWS - 1; i >= 0; i--) {
    const y = rowY(i), s = rowS(i), sw = 150 * s, letter = 'ABCDEFGH'[i];
    ctx.fillStyle = mix('#04050c', '#1e1220', L); ctx.fillRect(-1500, y - 10 * s, W + 3000, 140 * s);
    const n = Math.ceil(1500 / sw) + 2;
    for (let k = -n; k <= n; k++) {
      const sx = H13.x + k * sw;
      const isH13 = i === 7 && k === 0;
      // seat back (we see the front of it)
      rrect(ctx, sx - sw * 0.42, y - 170 * s, sw * 0.84, 160 * s, 14 * s); ctx.fillStyle = mix(SEAT_D, SEAT, L * 0.95); ctx.fill();
      rrect(ctx, sx - sw * 0.36, y - 160 * s, sw * 0.72, 130 * s, 10 * s); ctx.fillStyle = mix('#3a0a14', '#d0364c', L * 0.9); ctx.fill();
      if (isH13 && (st.viewer ?? 1) > 0) { ctx.save(); ctx.globalAlpha = st.viewer ?? 1; ctx.translate(sx, y - 20 * s); viewerSeated(ctx, t, s * 1.3, { mode: st.mode, tilt: st.tilt, rise: st.rise }); ctx.restore(); }
      // seat cushion front + armrests
      rrect(ctx, sx - sw * 0.4, y - 30 * s, sw * 0.8, 42 * s, 8 * s); ctx.fillStyle = mix('#2a0610', '#8a1a2e', L); ctx.fill();
      ctx.fillStyle = mix('#05060c', '#2a1a20', L); ctx.fillRect(sx - sw * 0.5, y - 60 * s, 10 * s, 80 * s);
      if (isH13 && st.label > 0) {
        ctx.save(); ctx.globalAlpha = st.label; rrect(ctx, sx + 120 * s, y - 120 * s, 120 * s, 54 * s, 8 * s); ctx.fillStyle = C.red; ctx.fill();
        ctx.font = `${Math.round(40 * s)}px Osw700`; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('H13', sx + 180 * s, y - 92 * s); ctx.restore();
      }
    }
    // row letter on the aisle end
    ctx.font = `${Math.round(30 * s)}px Mono700`; ctx.fillStyle = mix('#3a3f5a', '#e8d6a0', L); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(letter, 60, y - 80 * s);
  }
  if (st.dark) darken(ctx, st.dark);
}

// ---------- POV through the booth window: the big screen + the back of his head in H13 ----------
// st: {film {...filmFrame}, play 0..1 (screen lit), viewer 0..1, beam 0..1}
function drawPOV(ctx, t, st = {}) {
  ctx.fillStyle = '#03040a'; ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  const pl = clamp(st.play ?? 1);
  // big screen
  const sx = 90, sy = 420, sw = 900, sh = 500;
  ctx.fillStyle = '#0b0d18'; ctx.fillRect(sx - 30, sy - 30, sw + 60, sh + 60);
  ctx.save(); ctx.translate(sx, sy);
  if (pl > 0) { ctx.globalAlpha = pl; filmFrame(ctx, t, st.film || {}); ctx.globalAlpha = 1; }
  else { ctx.fillStyle = '#151a2c'; ctx.fillRect(0, 0, sw, sh); }
  ctx.restore();
  glow(ctx, 540, 670, 700, 'rgba(170,190,240,A)', 0.25 * pl);
  // red curtains
  for (const s of [-1, 1]) { const x0 = s < 0 ? -500 : 990; ctx.fillStyle = '#4a0c18'; ctx.fillRect(x0, 250, 590, 1100); for (let x = 0; x < 590; x += 40) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x0 + x, 250, 18, 1100); } }
  // the beam from below (the booth) to the screen
  if (pl > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(540, 1900, 540, 600); g.addColorStop(0, `rgba(210,225,255,${0.3 * pl})`); g.addColorStop(1, 'rgba(210,225,255,0.04)');
    poly(ctx, [[500, 1950], [580, 1950], [990, 920], [90, 920]], null); ctx.fillStyle = g; ctx.fill(); ctx.restore();
  }
  // rows of seat backs (silhouettes), far (top) to near (bottom)
  for (let i = 0; i < 7; i++) {
    const u = i / 6, y = lerp(1040, 1560, u), s = lerp(0.5, 1.15, u), w = 140 * s;
    for (let k = -8; k <= 8; k++) { const x = 540 + k * w + (i % 2) * w * 0.5; rrect(ctx, x - w * 0.42, y - 70 * s, w * 0.84, 120 * s, 16 * s); ctx.fillStyle = `rgb(${18 + i * 4},${8 + i * 2},${16 + i * 3})`; ctx.fill(); }
  }
  // row H, right under the window: H13 = the back of his huge dark head, haloed by the screen light
  const v = clamp(st.viewer ?? 1);
  const y = 1700, s = 1.3;
  for (let k = -4; k <= 4; k++) { const x = 560 + k * 200; rrect(ctx, x - 84, y - 40, 168, 220, 20); ctx.fillStyle = '#2a0a14'; ctx.fill(); }
  if (v > 0) {
    ctx.save(); ctx.globalAlpha = v; ctx.translate(560, y - 190);
    glow(ctx, 0, -40, 260, 'rgba(200,225,255,A)', 0.55 * pl);
    ctx.beginPath(); ctx.ellipse(0, 0, 100 * s * 0.8, 125 * s * 0.8, 0, 0, 7); ctx.fillStyle = '#06070d'; ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = `rgba(200,225,255,${0.6 * pl})`; ctx.beginPath(); ctx.ellipse(0, 0, 100 * s * 0.8, 125 * s * 0.8, 0, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    ctx.fillStyle = SUIT; poly(ctx, [[-150, 120], [150, 120], [190, 400], [-190, 400]], SUIT);
    ctx.restore();
  }
  if (st.label > 0) {
    ctx.save(); ctx.globalAlpha = st.label; rrect(ctx, 490, y - 30, 140, 64, 10); ctx.fillStyle = C.red; ctx.fill();
    ctx.font = '46px Osw700'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('H13', 560, y + 2); ctx.restore();
  }
  // the booth window frame (we are inside the booth)
  ctx.fillStyle = '#0e1222';
  ctx.fillRect(-1500, -1500, W + 3000, 1500 + 200); ctx.fillRect(-1500, 1840, W + 3000, 1000);
  ctx.fillRect(-1500, 0, 1500 + 40, 2000); ctx.fillRect(1040, 0, 1500, 2000);
  ctx.lineWidth = 16; ctx.strokeStyle = '#2a3253'; ctx.strokeRect(40, 200, 1000, 1640);
  ctx.fillStyle = 'rgba(180,200,255,0.05)'; poly(ctx, [[40, 200], [420, 200], [40, 900]]);
  if (st.dark) darken(ctx, st.dark);
}

// ---------- THE PROJECTION BOOTH (side view). you face the camera (front) or the window (back) ----------
// st: {light, run 0..1 (reels + beam), me {...drawStick opts} | null, viewer {x, s, bend, mode, arm, a} | null, note 0..1}
const BOOTH = { floor: 1720, ceil: 520, win: { x: 860, y: 880, w: 170, h: 200 }, proj: { x: 430, y: 940 } };
function drawBooth(ctx, t, st = {}) {
  const L = (st.light ?? 1) * flicker(t, 4, 0.03);
  // walls
  ctx.fillStyle = mix('#080a16', '#3c4462', L); ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  ctx.fillStyle = mix('#0a0c1a', '#4a5375', L); ctx.fillRect(-1500, BOOTH.ceil, W + 3000, BOOTH.floor - BOOTH.ceil);
  for (let x = -600; x < 1700; x += 120) { ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(x, BOOTH.ceil, 4, BOOTH.floor - BOOTH.ceil); }
  // ceiling (low, with a pipe)
  ctx.fillStyle = mix('#04050c', '#20263c', L); ctx.fillRect(-1500, -1500, W + 3000, BOOTH.ceil + 1500);
  ctx.fillStyle = mix('#151a2e', '#59607e', L); ctx.fillRect(-1500, BOOTH.ceil - 14, W + 3000, 14);
  ctx.fillStyle = mix('#10142a', '#6a7290', L); ctx.fillRect(-1500, BOOTH.ceil + 40, W + 3000, 22);
  // floor
  ctx.fillStyle = mix('#05060c', '#2a2f45', L); ctx.fillRect(-1500, BOOTH.floor, W + 3000, 1000);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; for (let x = -600; x < 1700; x += 140) ctx.fillRect(x, BOOTH.floor, 3, 600);
  // the bulb
  const bx = 260, by = BOOTH.ceil + 150;
  ctx.strokeStyle = '#05060c'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(bx, BOOTH.ceil + 60); ctx.lineTo(bx, by - 30); ctx.stroke();
  ctx.fillStyle = mix('#2a2a30', '#fff2c8', L); ctx.beginPath(); ctx.arc(bx, by, 26, 0, 7); ctx.fill();
  glow(ctx, bx, by, 700, 'rgba(255,220,160,A)', 0.42 * L);
  // film cans on a shelf + a poster
  ctx.fillStyle = mix('#0a0c18', '#2a3048', L); ctx.fillRect(-300, 820, 380, 16);
  for (let i = 0; i < 4; i++) { ctx.fillStyle = mix('#1a1e30', '#8a8fa8', L); ctx.beginPath(); ctx.ellipse(-240 + i * 90, 800, 38, 18, 0, 0, 7); ctx.fill(); }
  // the window to the hall
  const w = BOOTH.win;
  rrect(ctx, w.x, w.y, w.w, w.h, 10); ctx.fillStyle = '#0a1024'; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = mix('#1a1f34', '#6a7290', L); ctx.stroke();
  const run = clamp(st.run || 0);
  if (run > 0) glow(ctx, w.x + w.w / 2, w.y + w.h / 2, 260, 'rgba(190,215,255,A)', 0.5 * run);
  // projector: pedestal, body, lens, reels
  const p = BOOTH.proj;
  ctx.fillStyle = mix('#0b0d18', '#2d344e', L); poly(ctx, [[p.x - 80, BOOTH.floor], [p.x + 160, BOOTH.floor], [p.x + 130, p.y + 180], [p.x - 50, p.y + 180]]);
  rrect(ctx, p.x - 140, p.y, 420, 190, 18); ctx.fillStyle = mix('#11142a', '#4f5a80', L); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#0b1022'; ctx.stroke();
  for (let i = 0; i < 5; i++) { ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(p.x - 110 + i * 26, p.y + 30, 12, 60); }
  rrect(ctx, p.x + 280, p.y + 50, 100, 80, 10); ctx.fillStyle = mix('#0a0c18', '#3a4262', L); ctx.fill();
  ctx.fillStyle = run > 0 ? '#e8f2ff' : '#1a1e30'; ctx.beginPath(); ctx.ellipse(p.x + 382, p.y + 90, 14, 32, 0, 0, 7); ctx.fill();
  // control lamp
  ctx.fillStyle = run > 0 ? '#5dff7a' : '#ff3347'; ctx.beginPath(); ctx.arc(p.x + 220, p.y + 150, 12, 0, 7); ctx.fill();
  const reel = (cx, cy, r) => {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 3.2 * run);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fillStyle = mix('#0c0e1a', '#6a7290', L); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#0b1022'; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r * 0.82, 0, 7); ctx.fillStyle = mix('#05060c', '#1a1e2e', L); ctx.fill();
    for (let i = 0; i < 3; i++) { ctx.rotate(Math.PI * 2 / 3); ctx.beginPath(); ctx.ellipse(r * 0.45, 0, r * 0.22, r * 0.14, 0, 0, 7); ctx.fillStyle = mix('#1a1e30', '#8a92b0', L); ctx.fill(); }
    ctx.beginPath(); ctx.arc(0, 0, r * 0.12, 0, 7); ctx.fillStyle = '#0b1022'; ctx.fill();
    ctx.restore();
  };
  ctx.fillStyle = mix('#0b0d18', '#2d344e', L); ctx.fillRect(p.x - 40, p.y - 120, 16, 130); ctx.fillRect(p.x + 200, p.y - 120, 16, 130);
  reel(p.x - 32, p.y - 150, 120); reel(p.x + 208, p.y - 150, 120);
  // the note taped to the projector
  ctx.save(); ctx.translate(p.x + 20, p.y + 110); ctx.rotate(-0.06); ctx.fillStyle = '#efe6c8'; ctx.fillRect(-46, -36, 92, 72); ctx.fillStyle = 'rgba(20,26,54,0.6)'; for (let i = 0; i < 4; i++) ctx.fillRect(-36, -22 + i * 14, 70 - i * 8, 4); ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(-20, -42, 40, 12); ctx.restore();
  // the beam: lens -> window
  if (run > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(p.x + 382, 0, w.x + w.w, 0); g.addColorStop(0, `rgba(220,235,255,${0.5 * run})`); g.addColorStop(1, `rgba(220,235,255,${0.12 * run})`);
    poly(ctx, [[p.x + 382, p.y + 82], [p.x + 382, p.y + 98], [w.x + w.w * 0.6, w.y + w.h * 0.75], [w.x + w.w * 0.6, w.y + w.h * 0.25]], null); ctx.fillStyle = g; ctx.fill();
    for (let i = 0; i < 14; i++) { const u = (hash(i) + t * 0.08) % 1; ctx.fillStyle = `rgba(255,255,255,${0.4 * run})`; ctx.fillRect(lerp(p.x + 390, w.x + 80, u), p.y + 90 + (hash(i * 5) - 0.5) * lerp(10, 150, u), 3, 3); }
    ctx.restore();
  }
  // the Viewer (behind you) and you
  if (st.viewer) { const v = st.viewer; ctx.save(); ctx.globalAlpha = v.a ?? 1; drawViewer(ctx, t, v.x, BOOTH.floor, v.s ?? 1, v); ctx.restore(); }
  if (st.me) drawStick(ctx, { y: BOOTH.floor, jacket: JACKET, ...st.me });
  if (st.dark) darken(ctx, st.dark);
}

// ---------- the control panel close-up: PLAY + STOP, your finger ----------
// st: {press 0..1 (PLAY pushed), hover 0..1 (finger over STOP), tremble, run}
function drawPanel(ctx, t, st = {}) {
  const g = ctx.createLinearGradient(0, 300, 0, 1700); g.addColorStop(0, '#3c4566'); g.addColorStop(1, '#232a44');
  ctx.fillStyle = g; ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  for (const [x, y] of [[120, 420], [960, 420], [120, 1500], [960, 1500]]) { ctx.fillStyle = '#151a2e'; ctx.beginPath(); ctx.arc(x, y, 16, 0, 7); ctx.fill(); }
  ctx.font = '40px Mono700'; ctx.fillStyle = 'rgba(238,241,247,0.7)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  spaced(ctx, 'PROJECTOR 1 · HALL 1', 540, 470, 6, 'center');
  const run = clamp(st.run || 0);
  // status lamp
  ctx.fillStyle = run > 0 ? '#5dff7a' : '#ff3347'; ctx.beginPath(); ctx.arc(540, 600, 30, 0, 7); ctx.fill(); glow(ctx, 540, 600, 160, run > 0 ? 'rgba(90,255,120,A)' : 'rgba(255,60,80,A)', 0.6);
  ctx.font = '34px Mono700'; ctx.fillStyle = 'rgba(238,241,247,0.8)'; ctx.fillText(run > 0 ? 'RUNNING' : 'READY', 540, 680);
  const btn = (x, label, col, down) => {
    rrect(ctx, x - 170, 880, 340, 340, 40); ctx.fillStyle = '#10142a'; ctx.fill();
    ctx.beginPath(); ctx.arc(x, 1050 + down * 14, 130, 0, 7); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.stroke();
    ctx.font = '70px Osw700'; ctx.fillStyle = '#fff'; ctx.fillText(label, x, 1054 + down * 14);
  };
  btn(310, 'PLAY', '#2fae4e', clamp(st.press || 0)); btn(770, 'STOP', '#d82638', 0);
  // your hand (white stick fingers coming from below)
  const hv = clamp(st.hover || 0), pr = clamp(st.press || 0);
  const tx = lerp(310, 770, hv), ty = lerp(1500, 1110, hv > 0 ? hv : pr) + Math.sin(t * 40) * (st.tremble || 0) * 6;
  if (hv > 0 || pr > 0 || st.hand) {
    ctx.save(); ctx.translate(tx, ty); ctx.strokeStyle = C.white; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.fillStyle = JACKET; poly(ctx, [[-70, 240], [70, 240], [90, 900], [-90, 900]], JACKET);
    ctx.lineWidth = 24; ctx.beginPath(); ctx.moveTo(0, 260); ctx.lineTo(0, 40); ctx.stroke();
    ctx.lineWidth = 20; ctx.beginPath(); ctx.moveTo(0, 60); ctx.lineTo(0, -40); ctx.moveTo(-20, 70); ctx.lineTo(-40, 20); ctx.moveTo(20, 70); ctx.lineTo(40, 30); ctx.stroke();
    ctx.restore();
  }
}

// ---------- the note: two rules ----------
const NOTE_RULES = [{ y: 900, lines: ['Never STOP', 'THE FILM.'] }, { y: 1220, lines: ['Never LOOK', 'AT HIS FACE.'] }];
function drawNote(ctx, t, st = {}) {
  ctx.fillStyle = '#2d344e'; ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  for (let i = 0; i < 6; i++) { ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(-300, 300 + i * 260, 1700, 6); }
  ctx.save(); ctx.translate(540, 960); ctx.rotate(-0.02); ctx.translate(-540, -960);
  const x0 = 150, x1 = 930, y0 = 470, y1 = 1600;
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  ctx.fillStyle = '#efe6c8'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.save(); ctx.translate(540, y0); ctx.rotate(0.04); ctx.fillRect(-90, -24, 180, 48); ctx.restore();
  ctx.fillStyle = 'rgba(70,100,170,0.22)'; for (let y = y0 + 200; y < y1 - 30; y += 70) ctx.fillRect(x0 + 10, y, x1 - x0 - 20, 2);
  ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.font = '64px Osw700'; ctx.fillText('THE 3 AM SHOW', 540, 600);
  ctx.font = '30px Mono700'; spaced(ctx, '1 TICKET SOLD · SEAT H13', 540, 660, 4, 'center');
  ctx.fillRect(300, 690, 480, 5);
  ctx.textAlign = 'left';
  NOTE_RULES.forEach((r, i) => {
    const hl = st.hl === i ? clamp(st.hlA ?? 1) : 0;
    if (hl > 0) { ctx.save(); ctx.globalAlpha = 0.55; ctx.fillStyle = C.lime; ctx.fillRect(x0 + 20, r.y - 70, 740 * hl, 180); ctx.restore(); }
    ctx.globalAlpha = (st.dim > 0 && st.hl !== i) ? 1 - 0.55 * st.dim : 1;
    ctx.fillStyle = INK; ctx.font = '90px Osw700'; ctx.fillText(`${i + 1}.`, x0 + 30, r.y + 10);
    ctx.font = '68px Inter700';
    r.lines.forEach((ln, k) => { ctx.fillStyle = k === 1 ? REDINK : INK; ctx.fillText(ln, x0 + 160, r.y + k * 86); });
    ctx.globalAlpha = 1;
  });
  ctx.font = '50px Inter700'; ctx.fillStyle = INK; ctx.fillText('— R.', x1 - 220, 1530);
  ctx.restore();
}

// ---------- the cold hand on your shoulder (you from behind, close) ----------
// st: {land 0..1, flinch}
function drawShoulder(ctx, t, st = {}) {
  drawBooth(ctx, t, { light: 0.75, run: 1, me: null });
  ctx.fillStyle = 'rgba(2,3,8,0.35)'; ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  // your back: huge head + mustard shoulders
  const fl = st.flinch || 0;
  ctx.save(); ctx.translate(540 + fl * 10, 1300 - fl * 20);
  ctx.fillStyle = JACKET; poly(ctx, [[-420, 120], [420, 120], [520, 900], [-520, 900]], JACKET); ctx.lineWidth = 10; ctx.strokeStyle = '#0b1022'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-420, 120); ctx.quadraticCurveTo(0, 40, 420, 120); ctx.fillStyle = JACKET; ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.navy1; ctx.beginPath(); ctx.arc(0, -150, 220, 0, 7); ctx.fill(); ctx.lineWidth = 22; ctx.strokeStyle = C.white; ctx.stroke();
  ctx.restore();
  // the hand: long grey fingers sliding down onto the right shoulder
  const ld = E.out(clamp(st.land || 0));
  ctx.save(); ctx.translate(lerp(1000, 820, ld), lerp(700, 1400, ld)); ctx.rotate(0.5);
  ctx.strokeStyle = SUIT; ctx.lineWidth = 120; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(300, -700); ctx.lineTo(60, -60); ctx.stroke();
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.ellipse(0, 0, 90, 110, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = SKIN; ctx.lineWidth = 30;
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-60 + i * 40, 60); ctx.quadraticCurveTo(-90 + i * 40, 220, -130 + i * 36, 330 + (i === 1 || i === 2 ? 40 : 0)); ctx.stroke(); }
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(40,46,70,0.6)'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-70 + i * 40, 160); ctx.lineTo(-50 + i * 40, 166); ctx.stroke(); }
  ctx.restore();
  glow(ctx, 760, 1100, 500, 'rgba(160,200,255,A)', 0.18 * ld);
}

// ---------- THE POSTER IMAGE: his face, close. The screen shows you ----------
// st: {mode, push, tilt}
function drawFaceClose(ctx, t, st = {}) {
  ctx.fillStyle = '#05060c'; ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  const g = ctx.createRadialGradient(540, 900, 50, 540, 900, 1000); g.addColorStop(0, '#2a3456'); g.addColorStop(1, '#05060c');
  ctx.fillStyle = g; ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  // shoulders + collar + tie
  ctx.fillStyle = '#262c48'; ctx.fillRect(480, 1300, 120, 220);
  ctx.beginPath(); ctx.moveTo(-200, 2400); ctx.lineTo(40, 1560); ctx.quadraticCurveTo(540, 1440, 1040, 1560); ctx.lineTo(1280, 2400); ctx.closePath();
  ctx.fillStyle = '#262c48'; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(170,200,255,0.55)'; ctx.stroke();
  poly(ctx, [[470, 1490], [610, 1490], [540, 1760]], '#e8ecf4');
  poly(ctx, [[525, 1500], [555, 1500], [572, 1820], [540, 1880], [508, 1820]], '#05060c');
  poly(ctx, [[380, 1500], [470, 1480], [540, 1780], [440, 1960]], '#3a4166'); poly(ctx, [[700, 1500], [610, 1480], [540, 1780], [640, 1960]], '#3a4166');
  ctx.save(); ctx.translate(540, 900); ctx.rotate(st.tilt || 0); ctx.scale(3.6, 3.6);
  glow(ctx, 0, 0, 260, 'rgba(200,225,255,A)', 0.7);
  ctx.beginPath(); ctx.ellipse(0, 0, 112, 136, 0, 0, 7); ctx.fillStyle = '#0b0d16'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#2b3150'; ctx.stroke();
  ctx.translate(0, 8); ctx.scale(0.86, 0.86); faceScreen(ctx, t, st.mode || 'blank');
  ctx.restore();
}

function viewerHead(ctx, t, x, y, s, rot, mode) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.scale(s, s);
  glow(ctx, 0, 0, 330, 'rgba(200,225,255,A)', 0.55);
  ctx.beginPath(); ctx.ellipse(0, 0, 112, 136, 0, 0, 7); ctx.fillStyle = '#0b0d16'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#2b3150'; ctx.stroke();
  ctx.translate(0, 8); ctx.scale(0.86, 0.86); faceScreen(ctx, t, mode || 'blank');
  ctx.restore();
}

module.exports = { viewerHead, drawHall, drawPOV, drawBooth, drawPanel, drawNote, drawShoulder, drawFaceClose, drawViewer, filmFrame, faceScreen, NOTE_RULES, BOOTH, H13, rowY, rowS, JACKET };
