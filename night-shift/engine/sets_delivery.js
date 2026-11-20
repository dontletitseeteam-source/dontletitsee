// NIGHT SHIFT — Episode 3 set painters: the house at 47 Lantern Lane (porch, chained door, step, your scooter),
// the seven-fingered hand through the door chain, her face in the gap (poster image), the rider app on your phone.
// World space 1080x1920, same conventions as sets.js / sets_train.js.
const D = require('./draw');
const { W, H, C, clamp, lerp, inv, E, hash, noise1, flicker, rrect, glow, spaced, drawStick } = D;

const SKIN = '#a3abbb', SKIN_D = '#7a8398', SKIN_L = '#ccd2dc';
const DOOR = '#8c2a33', DOOR_D = '#5e1820', TRIM = '#efe9dc', BRASS = '#d9b45a';
const APP = '#c6ff3a';
const poly = (ctx, pts, fill) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); };
const mix = (a, b, k) => { const p = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(k)))).join(',')})`; };
const darken = (ctx, a) => { if (a > 0.005) { ctx.fillStyle = `rgba(2,3,8,${a})`; ctx.fillRect(-1500, -1500, W + 3000, H + 3000); } };

// ---------- the chain (a row of brass links between two points) ----------
function chain(ctx, x0, y0, x1, y1, sag, link, t = 0) {
  const n = Math.max(4, Math.round(Math.hypot(x1 - x0, y1 - y0) / (link * 1.25)));
  for (let i = 0; i <= n; i++) {
    const u = i / n, x = lerp(x0, x1, u), y = lerp(y0, y1, u) + sag * 4 * u * (1 - u) + Math.sin(t * 2 + i) * 0.6;
    const nx = lerp(x0, x1, Math.min(1, u + 1 / n)), ny = lerp(y0, y1, Math.min(1, u + 1 / n)) + sag * 4 * Math.min(1, u + 1 / n) * (1 - Math.min(1, u + 1 / n));
    const a = Math.atan2(ny - y, nx - x);
    ctx.save(); ctx.translate(x, y); ctx.rotate(a + (i % 2 ? Math.PI / 2 * 0.0 : 0));
    ctx.lineWidth = link * 0.32; ctx.strokeStyle = '#3a2a10'; ctx.beginPath(); ctx.ellipse(0, 0, link * 0.62, i % 2 ? link * 0.14 : link * 0.36, 0, 0, 7); ctx.stroke();
    ctx.lineWidth = link * 0.2; ctx.strokeStyle = BRASS; ctx.beginPath(); ctx.ellipse(0, 0, link * 0.62, i % 2 ? link * 0.14 : link * 0.36, 0, 0, 7); ctx.stroke();
    ctx.restore();
  }
  // the slide plate on the frame
  rrect(ctx, x1 - link * 0.3, y1 - link * 1.1, link * 0.7, link * 2.2, link * 0.2); ctx.fillStyle = BRASS; ctx.fill();
}

// ---------- the hand: palm + 7 long fingers. Drawn at the wrist (0,0), pointing +x, fingers fan out. ----------
// o: {s, curl 0..1 (close around a handle), nums n (finger labels), spread 0..1, skin}
function sevenHand(ctx, t, o = {}) {
  const sk = o.skin || SKIN, cu = clamp(o.curl || 0), sp = o.spread ?? 1;
  ctx.save(); ctx.scale(o.s || 1, o.s || 1);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // palm
  const palm = () => { ctx.beginPath(); ctx.moveTo(-10, -46); ctx.quadraticCurveTo(70, -80, 150, -70); ctx.lineTo(160, 70); ctx.quadraticCurveTo(70, 80, -10, 46); ctx.closePath(); };
  palm(); ctx.lineWidth = 16; ctx.strokeStyle = '#0b1022'; ctx.stroke(); ctx.fillStyle = sk; ctx.fill();
  // seven fingers from the knuckle line x=150, y -66..66
  const tips = [];
  for (let i = 0; i < 7; i++) {
    const v = i / 6 - 0.5;
    const by = v * 132, base = [150, by];
    const ang = v * 0.9 * sp + Math.sin(t * 1.7 + i * 1.3) * 0.04;
    const L = [110, 100, 92].map(l => l * (1 - Math.abs(v) * 0.35));
    let x = base[0], y = base[1], a = ang;
    const pts = [[x, y]];
    for (let k = 0; k < 3; k++) { a += cu * 0.95 + (k ? 0.08 : 0); x += Math.cos(a) * L[k]; y += Math.sin(a) * L[k]; pts.push([x, y]); }
    tips.push([x, y, a]);
    for (const pass of [0, 1]) {
      ctx.strokeStyle = pass ? sk : '#0b1022'; ctx.lineWidth = pass ? 30 : 42;
      ctx.beginPath(); pts.forEach(([px, py], j) => (j ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.stroke();
    }
    // knuckle creases + a dark nail
    ctx.strokeStyle = SKIN_D; ctx.lineWidth = 3.5;
    for (let k = 1; k < 3; k++) { const [px, py] = pts[k]; const nx = -Math.sin(a), ny = Math.cos(a); ctx.beginPath(); ctx.moveTo(px - nx * 9, py - ny * 9); ctx.lineTo(px + nx * 9, py + ny * 9); ctx.stroke(); ctx.beginPath(); ctx.moveTo(px - nx * 7 + 4, py - ny * 7 + 3); ctx.lineTo(px + nx * 7 + 4, py + ny * 7 + 3); ctx.stroke(); }
    ctx.fillStyle = '#4b5068'; ctx.beginPath(); ctx.ellipse(x - Math.cos(a) * 7, y - Math.sin(a) * 7, 10, 7, a, 0, 7); ctx.fill();
  }
  // palm shading over the finger roots
  const g = ctx.createLinearGradient(0, -70, 0, 70); g.addColorStop(0, 'rgba(255,240,210,0.18)'); g.addColorStop(1, 'rgba(20,24,50,0.3)');
  palm(); ctx.fillStyle = sk; ctx.fill(); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = SKIN_D; ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(30 + i * 30, -30 + i * 8); ctx.quadraticCurveTo(70 + i * 20, 0, 40 + i * 30, 34 - i * 6); ctx.stroke(); }
  ctx.restore();
  const s = o.s || 1;
  return tips.map(([x, y, a]) => [x * s, y * s, a]);
}
// finger labels: numbers pop over the tips (in screen space of the hand's parent transform)
function fingerNums(ctx, tips, n, t, times = []) {
  for (let i = 0; i < Math.min(n, 7); i++) {
    const [x, y, a] = tips[i];
    const lx = x + Math.cos(a) * 62, ly = y + Math.sin(a) * 62;
    const age = times[i] !== undefined ? t - times[i] : 1;
    const pop = E.outBack(clamp(age / 0.25));
    const red = i >= 5;
    ctx.save(); ctx.translate(lx, ly); ctx.scale(pop, pop);
    ctx.beginPath(); ctx.arc(0, 0, 40, 0, 7); ctx.fillStyle = red ? C.red : 'rgba(10,14,30,0.85)'; ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = red ? '#fff' : C.lime; ctx.stroke();
    ctx.font = '50px Osw700'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText(String(i + 1), 0, 3);
    ctx.restore();
  }
}

// ---------- the delivery bag ----------
function bag(ctx, x, y, s = 1, a = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
  ctx.strokeStyle = '#2a1c10'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-30, -70); ctx.quadraticCurveTo(0, -125, 30, -70); ctx.stroke();
  poly(ctx, [[-62, -74], [62, -74], [70, 60], [-70, 60]], '#c99a5b');
  poly(ctx, [[-62, -74], [62, -74], [58, -54], [-58, -54]], '#a77a40');
  ctx.fillStyle = '#d6303b'; ctx.fillRect(-70, -6, 140, 30);
  ctx.font = '22px Mono700'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('NITEBITE', 0, 10);
  ctx.restore();
}

// ---------- the scooter with its delivery box ----------
function scooter(ctx, x, y, s, L) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const wx of [-110, 120]) { ctx.beginPath(); ctx.arc(wx, -40, 40, 0, 7); ctx.fillStyle = '#0a0d18'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = mix('#3b4466', '#8a93ab', L); ctx.stroke(); }
  poly(ctx, [[-150, -70], [70, -80], [130, -50], [150, -100], [120, -200], [100, -200], [90, -120], [-40, -100], [-150, -110]], mix('#141c3a', '#4b6fd6', L * 0.8));
  ctx.lineWidth = 8; ctx.strokeStyle = '#0b1022'; ctx.beginPath(); ctx.moveTo(110, -200); ctx.lineTo(150, -230); ctx.stroke();
  // the box
  rrect(ctx, -190, -260, 150, 150, 12); ctx.fillStyle = mix('#5e1820', '#d6303b', L); ctx.fill();
  ctx.fillStyle = mix('#2e3a10', APP, L); ctx.fillRect(-190, -205, 150, 18);
  ctx.font = '22px Mono700'; ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.textAlign = 'center'; ctx.fillText('24/7', -115, -228);
  ctx.restore();
}

// ---------- THE HOUSE (from the street) ----------
// st: {light 0..1 porch, open 0..1 (door on the chain), hand 0..1 reach, face 0..1 (sliver in the gap), eye 0..1,
//      bag: 'step'|'lift'|'take'|null, bagT 0..1, me {x, y, s, view, arm}, scooter bool, dark 0..1, street 0..1 (street light)}
const DR = { x0: 420, x1: 660, y0: 470, y1: 1180, chainY: 770 };
function drawHouse(ctx, t, st = {}) {
  const L = (st.light ?? 1) * flicker(t, 7, 0.02);
  const SL = st.street ?? 1;
  // sky + far roofs
  const sg = ctx.createLinearGradient(0, -600, 0, 900); sg.addColorStop(0, '#0a1230'); sg.addColorStop(1, '#22336a');
  ctx.fillStyle = sg; ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  ctx.fillStyle = '#0b1128'; for (let i = -3; i < 9; i++) { const x = i * 190, h = 70 + hash(i * 3.3) * 120; ctx.fillRect(x, 420 - h, 170, h + 200); }
  for (let i = 0; i < 22; i++) { const x = hash(i * 7.1) * 1500 - 200, y = hash(i * 2.3) * 300 - 200; ctx.fillStyle = `rgba(230,236,255,${0.3 + 0.5 * hash(i)})`; ctx.fillRect(x, y, 3, 3); }
  // the house
  const wall = mix('#1f2746', '#e2d6b8', L), wall2 = mix('#1a2140', '#c9bd9e', L);
  poly(ctx, [[60, 330], [540, 70], [1020, 330]], mix('#140f22', '#3a2a48', L * 0.7));
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 4; for (let k = 1; k < 6; k++) { const y = 70 + k * 46; const hw = (y - 70) / 260 * 480; ctx.beginPath(); ctx.moveTo(540 - hw, y); ctx.lineTo(540 + hw, y); ctx.stroke(); }
  ctx.fillStyle = wall; ctx.fillRect(100, 320, 880, 1080);
  ctx.fillStyle = wall2; for (let y = 360; y < 1400; y += 64) ctx.fillRect(100, y, 880, 4);
  // the porch light pool on the wall
  if (L > 0.05) glow(ctx, 540, 520, 760, 'rgba(255,214,150,A)', 0.55 * L);
  // windows: dark, one with a curtain gap
  for (const [wx, cur] of [[150, 0], [770, 1]]) {
    ctx.fillStyle = mix('#131a33', '#efe9dc', L * 0.9); ctx.fillRect(wx - 12, 548, 184, 264);
    ctx.fillStyle = '#070b1a'; ctx.fillRect(wx, 560, 160, 240);
    ctx.fillStyle = mix('#131a33', '#efe9dc', L * 0.9); ctx.fillRect(wx + 76, 560, 8, 240); ctx.fillRect(wx, 676, 160, 8);
    if (cur) { ctx.fillStyle = mix('#1a1022', '#6e3b4a', L * 0.8); ctx.fillRect(wx, 560, 62, 240); ctx.fillRect(wx + 104, 560, 56, 240); }
  }
  // house number
  rrect(ctx, 700, 520, 96, 64, 8); ctx.fillStyle = mix('#11162c', '#2a2f44', L); ctx.fill();
  ctx.font = '50px Osw700'; ctx.fillStyle = mix('#3a4466', '#f4e7c4', L); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('47', 748, 555);
  // door frame + interior gap + the door panel
  const op = clamp(st.open || 0), gap = 82 * op;
  ctx.fillStyle = mix('#2b3256', TRIM, L); ctx.fillRect(DR.x0 - 30, DR.y0 - 30, DR.x1 - DR.x0 + 60, DR.y1 - DR.y0 + 30);
  ctx.fillStyle = '#020309'; ctx.fillRect(DR.x0, DR.y0, DR.x1 - DR.x0, DR.y1 - DR.y0);
  const dx1 = DR.x1 - gap;
  ctx.fillStyle = mix('#2a0f16', DOOR, L); ctx.fillRect(DR.x0, DR.y0, dx1 - DR.x0, DR.y1 - DR.y0);
  ctx.fillStyle = mix('#1a0810', DOOR_D, L);
  for (const [py, ph] of [[DR.y0 + 50, 260], [DR.y0 + 370, 290]]) { ctx.fillRect(DR.x0 + 34, py, (dx1 - DR.x0) - 68, 18); ctx.fillRect(DR.x0 + 34, py + ph - 18, (dx1 - DR.x0) - 68, 18); }
  if (op > 0) { ctx.fillStyle = mix('#14060a', '#4a1018', L); ctx.fillRect(dx1 - 14, DR.y0, 14, DR.y1 - DR.y0); }
  // knob
  ctx.beginPath(); ctx.arc(dx1 - 40, 840, 14, 0, 7); ctx.fillStyle = BRASS; ctx.fill();
  // something in the gap: a sliver of face, an eye
  if (op > 0 && (st.face || 0) > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(dx1, DR.y0, gap, DR.y1 - DR.y0); ctx.clip();
    ctx.globalAlpha = clamp(st.face);
    ctx.fillStyle = mix('#3a4058', SKIN, L * 0.8); ctx.beginPath(); ctx.ellipse(dx1 + gap * 0.6, 720, 60, 110, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#05060c'; ctx.beginPath(); ctx.ellipse(dx1 + gap * 0.9, 640, 60, 130, 0.2, 0, 7); ctx.fill();
    ctx.restore();
  }
  if (op > 0 && (st.eye || 0) > 0) {
    const ex = dx1 + gap * 0.55, ey = 700;
    ctx.save(); ctx.globalAlpha = clamp(st.eye);
    glow(ctx, ex, ey, 60, 'rgba(255,255,255,A)', 0.4);
    ctx.fillStyle = '#f2f4f8'; ctx.beginPath(); ctx.ellipse(ex, ey, 16, 10, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(ex, ey, 3.5, 0, 7); ctx.fill();
    ctx.restore();
  }
  if (op > 0) chain(ctx, dx1 - 30, DR.chainY, DR.x1 + 16, DR.chainY - 6, 34 * op, 18, t);
  // porch lamp
  ctx.fillStyle = '#1b1b22'; ctx.fillRect(528, 380, 24, 40);
  rrect(ctx, 510, 410, 60, 74, 10); ctx.fillStyle = mix('#3a3a40', '#fff6dc', L); ctx.fill();
  if (L > 0.05) glow(ctx, 540, 450, 220, 'rgba(255,236,190,A)', 0.9 * L);
  // steps + light cone
  poly(ctx, [[360, 1180], [720, 1180], [740, 1260], [340, 1260]], mix('#232a44', '#c3bba8', L));
  poly(ctx, [[340, 1260], [740, 1260], [760, 1340], [320, 1340]], mix('#1e2440', '#aaa290', L));
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(340, 1256, 400, 6); ctx.fillRect(320, 1336, 440, 6);
  // yard + path + pavement
  ctx.fillStyle = mix('#0b1428', '#1f3a34', L * 0.6); ctx.fillRect(-1500, 1400, W + 3000, 300);
  poly(ctx, [[400, 1340], [680, 1340], [760, 1700], [320, 1700]], mix('#161d36', '#8f8878', L * 0.8));
  ctx.fillStyle = mix('#151c34', '#3c4560', 0.4 + 0.6 * SL); ctx.fillRect(-1500, 1700, W + 3000, 1500);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(-1500, 1700, W + 3000, 10);
  // the light cone from the porch
  if (L > 0.05) { const g = ctx.createRadialGradient(540, 1250, 40, 540, 1250, 520); g.addColorStop(0, `rgba(255,220,160,${0.32 * L})`); g.addColorStop(1, 'rgba(255,220,160,0)'); ctx.fillStyle = g; ctx.fillRect(0, 900, W, 900); }
  // streetlamp (right)
  ctx.fillStyle = '#0e1326'; ctx.fillRect(1000, 300, 16, 1600);
  ctx.fillRect(940, 300, 76, 12); rrect(ctx, 920, 306, 60, 26, 8); ctx.fillStyle = mix('#3a3f55', '#dff0ff', SL); ctx.fill();
  if (SL > 0.05) glow(ctx, 950, 330, 420, 'rgba(180,215,255,A)', 0.35 * SL);
  // the bag on the step / lifted / taken
  if (st.bag === 'step') bag(ctx, 600, 1250, 0.85);
  if (st.scooter) scooter(ctx, 230, 1880, 1.15, 0.5 + 0.5 * SL);
  // you
  if (st.me) {
    const m = st.me;
    drawStick(ctx, { x: m.x, y: m.y, s: m.s || 1, view: m.view || 'back', arm: m.arm || 'down', lit: m.lit || 0, fill: m.fill || C.navy1, headDY: m.headDY || 0, walk: m.walk });
    if (m.holdBag) bag(ctx, m.x + (m.bagDX ?? 34) * (m.s || 1), m.y + (m.bagDY ?? -300) * (m.s || 1), 0.75 * (m.s || 1));
    if (m.helmet) { ctx.save(); ctx.translate(m.x, m.y - 378 * (m.s || 1)); ctx.scale(m.s || 1, m.s || 1); ctx.beginPath(); ctx.arc(0, 0, 46, Math.PI, 0); ctx.closePath(); ctx.fillStyle = '#d6303b'; ctx.fill(); ctx.restore(); }
  }
  if (st.bag === 'take') { // the bag hangs from her hand at the gap, rising in
    const k = clamp(st.bagT || 0);
    bag(ctx, lerp(720, dx1 + gap * 0.5, k), lerp(900, 860, k), 0.75, lerp(-0.1, 0.25, k));
  }
  // the hand out of the gap
  const r = clamp(st.hand || 0);
  if (r > 0 && op > 0) {
    ctx.save();
    ctx.beginPath(); ctx.rect(dx1 + 4, -1000, 4000, 4000); ctx.clip();
    const wx = lerp(dx1 - 40, dx1 + 150, E.out(r)), wy = lerp(800, 870, E.out(r));
    ctx.lineCap = 'round'; ctx.strokeStyle = '#0b1022'; ctx.lineWidth = 44; ctx.beginPath(); ctx.moveTo(dx1 - 60, 790); ctx.quadraticCurveTo(dx1 + 40, 800, wx, wy); ctx.stroke();
    ctx.strokeStyle = mix('#5a6078', SKIN, L); ctx.lineWidth = 32; ctx.beginPath(); ctx.moveTo(dx1 - 60, 790); ctx.quadraticCurveTo(dx1 + 40, 800, wx, wy); ctx.stroke();
    ctx.translate(wx, wy); ctx.rotate(0.5);
    sevenHand(ctx, t, { s: 0.42, skin: mix('#5a6078', SKIN, L), curl: st.curl || 0.15, spread: 0.9 });
    ctx.restore();
  }
  if (st.dark) darken(ctx, st.dark);
}

// ---------- CLOSE: the hand through the chain ----------
// st: {reach 0..1, n (finger count labels), times [], curl 0..1, bagT 0..1 (bag taken into the gap), light, gapEye}
function drawHandClose(ctx, t, st = {}) {
  const L = (st.light ?? 1) * flicker(t, 9, 0.02);
  // wall + frame (right), door (left), gap (middle)
  ctx.fillStyle = mix('#1f2746', '#e2d6b8', L); ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  if (L > 0.05) glow(ctx, 640, -100, 1300, 'rgba(255,214,150,A)', 0.5 * L);
  ctx.fillStyle = mix('#2b3256', TRIM, L); ctx.fillRect(640, -1500, 140, H + 3000);
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(640, -1500, 16, H + 3000);
  ctx.fillStyle = '#020309'; ctx.fillRect(470, -1500, 170, H + 3000);
  ctx.fillStyle = mix('#2a0f16', DOOR, L); ctx.fillRect(-1500, -1500, 1970, H + 3000);
  ctx.fillStyle = mix('#14060a', '#4a1018', L); ctx.fillRect(440, -1500, 30, H + 3000);
  ctx.fillStyle = mix('#1a0810', DOOR_D, L); ctx.fillRect(-1500, 300, 1880, 26); ctx.fillRect(-1500, 1300, 1880, 26); ctx.fillRect(330, 300, 26, 1026);
  if (st.gapEye) { const ex = 560, ey = 520; ctx.save(); ctx.globalAlpha = clamp(st.gapEye); glow(ctx, ex, ey, 110, 'rgba(255,255,255,A)', 0.35); ctx.fillStyle = '#f2f4f8'; ctx.beginPath(); ctx.ellipse(ex, ey, 34, 20, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(ex + Math.sin(t) * 3, ey, 7, 0, 7); ctx.fill(); ctx.restore(); }
  // the bag being pulled into the gap
  const bt = st.bagT;
  // the arm + hand
  const r = clamp(st.reach ?? 1);
  let tips = null;
  if (r > 0) {
    const wx = lerp(500, 620, E.out(r)) + (bt ? -120 * E.in(clamp(bt)) : 0), wy = lerp(700, 760, E.out(r));
    ctx.save(); ctx.beginPath(); ctx.rect(470, -1000, 4000, 4000); ctx.clip();
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0b1022'; ctx.lineWidth = 118; ctx.beginPath(); ctx.moveTo(380, 660); ctx.quadraticCurveTo(470, 680, wx, wy); ctx.stroke();
    ctx.strokeStyle = mix('#5a6078', SKIN, L); ctx.lineWidth = 96; ctx.beginPath(); ctx.moveTo(380, 660); ctx.quadraticCurveTo(470, 680, wx, wy); ctx.stroke();
    ctx.strokeStyle = SKIN_D; ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(wx - 30 - i * 26, wy - 30); ctx.lineTo(wx - 34 - i * 26, wy + 26); ctx.stroke(); }
    ctx.save(); ctx.translate(wx, wy); ctx.rotate(1.05);
    tips = sevenHand(ctx, t, { s: 1.1, skin: mix('#5a6078', SKIN, L), curl: st.curl ?? 0.12, spread: 1 });
    ctx.restore();
    ctx.restore();
    if (bt !== undefined) bag(ctx, wx + 120, wy + 260 - 30 * clamp(bt), 1.4, 0.12);
    // labels in the parent space
    if (st.n) {
      const ca = Math.cos(1.05), sa = Math.sin(1.05);
      const ptips = tips.map(([x, y, a]) => [wx + x * ca - y * sa, wy + x * sa + y * ca, a + 1.05]);
      fingerNums(ctx, ptips, st.n, t, st.times || []);
    }
  }
  // the chain across the gap, in front of the arm
  chain(ctx, 400, 560, 680, 550, 60, 40, t);
  if (st.dark) darken(ctx, st.dark);
}

// ---------- THE POSTER IMAGE: her face pressed sideways into the gap, the chain across it, fingers round the door ----------
// st: {slide 0..1, smile 0..1, light}
function drawGapFace(ctx, t, st = {}) {
  const L = (st.light ?? 1) * flicker(t, 11, 0.02);
  const sl = E.out(clamp(st.slide ?? 1)), sm = clamp(st.smile || 0);
  ctx.fillStyle = mix('#1f2746', '#e2d6b8', L); ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  if (L > 0.05) glow(ctx, 560, -200, 1400, 'rgba(255,214,150,A)', 0.55 * L);
  const G0 = 290, G1 = 800;
  ctx.fillStyle = mix('#2b3256', TRIM, L); ctx.fillRect(G1, -1500, 220, H + 3000);
  ctx.fillStyle = '#020309'; ctx.fillRect(G0, -1500, G1 - G0, H + 3000);
  // the face, tilted, pressed into the gap
  ctx.save(); ctx.beginPath(); ctx.rect(G0, -1500, G1 - G0, H + 3000); ctx.clip();
  ctx.translate(lerp(420, 545, sl), lerp(980, 900, sl)); ctx.rotate(-0.32);
  ctx.globalAlpha = clamp(sl * 1.4);
  ctx.fillStyle = '#07080f'; ctx.beginPath(); ctx.ellipse(0, -60, 300, 300, 0, 0, 7); ctx.fill();
  const fg = ctx.createLinearGradient(0, -260, 0, 260); fg.addColorStop(0, SKIN_L); fg.addColorStop(1, SKIN_D);
  ctx.fillStyle = fg; ctx.beginPath(); ctx.ellipse(0, 0, 210, 265, 0, 0, 7); ctx.fill();
  // deep sockets, small wet eyes, tiny pupils (the near one wider)
  for (const [ex, k] of [[-80, 1.15], [82, 0.9]]) {
    const sg = ctx.createRadialGradient(ex, -40, 10, ex, -40, 80); sg.addColorStop(0, 'rgba(30,34,58,0.9)'); sg.addColorStop(1, 'rgba(30,34,58,0)');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(ex, -40, 84, 64, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#e9ecf1'; ctx.beginPath(); ctx.ellipse(ex, -38, 34 * k, 22 * k, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#05060a'; ctx.beginPath(); ctx.arc(ex + 4 + Math.sin(t * 0.8) * 2, -37, 5, 0, 7); ctx.fill();
    ctx.strokeStyle = '#2a2e44'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(ex, -38, 34 * k, 22 * k, 0, 0, 7); ctx.stroke();
  }
  // hair: a heavy fringe and long wet strands down over the face
  ctx.fillStyle = '#07080f'; ctx.beginPath(); ctx.ellipse(0, -250, 250, 140, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = '#07080f'; ctx.lineCap = 'round';
  for (let i = 0; i < 9; i++) { const x0 = -200 + i * 50; const len = 60 + hash(i * 3.7) * 120; ctx.lineWidth = 12 + (i % 3) * 5; ctx.beginPath(); ctx.moveTo(x0, -160); ctx.quadraticCurveTo(x0 + Math.sin(t * 0.7 + i) * 5, -160 + len * 0.5, x0 + (i % 2 ? 6 : -6), -150 + len); ctx.stroke(); }
  for (const [x0, k] of [[-205, -1], [-170, -1], [200, 1], [168, 1]]) { ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(x0, -200); ctx.quadraticCurveTo(x0 + k * 30 + Math.sin(t + x0) * 6, 0, x0 + k * 10, 280); ctx.stroke(); }
  ctx.strokeStyle = SKIN_D; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(6, -6); ctx.lineTo(16, 56); ctx.lineTo(-6, 62); ctx.stroke();
  const w = lerp(56, 185, sm), dip = lerp(6, 62, sm);
  ctx.fillStyle = '#0a0b12'; ctx.strokeStyle = '#4a3040'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(-w, 118); ctx.quadraticCurveTo(0, 118 + dip * 2, w, 118); ctx.quadraticCurveTo(0, 118 + dip * 0.6, -w, 118); ctx.closePath(); ctx.fill(); ctx.stroke();
  if (sm > 0.2) { ctx.strokeStyle = '#eceef2'; ctx.lineWidth = 4; const n = 20; for (let i = 1; i < n; i++) { const u = i / n, x = lerp(-w, w, u), k = 4 * u * (1 - u); ctx.beginPath(); ctx.moveTo(x, 118 + dip * 0.6 * k); ctx.lineTo(x, 118 + dip * 1.25 * k); ctx.stroke(); } }
  ctx.restore();
  // pressed-in shadow at the gap edges
  const eg = ctx.createLinearGradient(G0, 0, G0 + 70, 0); eg.addColorStop(0, 'rgba(0,0,0,0.7)'); eg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = eg; ctx.fillRect(G0, -1500, 70, H + 3000);
  const eg2 = ctx.createLinearGradient(G1, 0, G1 - 70, 0); eg2.addColorStop(0, 'rgba(0,0,0,0.7)'); eg2.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = eg2; ctx.fillRect(G1 - 70, -1500, 70, H + 3000);
  // the door edge (left)
  ctx.fillStyle = mix('#2a0f16', DOOR, L); ctx.fillRect(-1500, -1500, G0 - 30 + 1500, H + 3000);
  ctx.fillStyle = mix('#14060a', '#4a1018', L); ctx.fillRect(G0 - 40, -1500, 40, H + 3000);
  // seven fingers curled over the door edge, left of her face
  ctx.save(); ctx.globalAlpha = clamp(sl * 1.5); ctx.lineCap = 'round';
  for (let i = 0; i < 7; i++) {
    const y = 470 + i * 52 + Math.sin(i * 2.3) * 8, reach = 90 + hash(i * 5.1) * 60, th = 0.8 + 0.3 * hash(i * 1.9);
    const x1 = G0 - reach, tipY = y + 34 + hash(i) * 20;
    for (const pass of [0, 1]) { ctx.strokeStyle = pass ? mix('#5a6078', SKIN, L) : '#0b1022'; ctx.lineWidth = (pass ? 22 : 32) * th; ctx.beginPath(); ctx.moveTo(G0 + 50, y + 6); ctx.lineTo(G0 - 20, y); ctx.quadraticCurveTo(x1 - 10, y - 6, x1, tipY); ctx.stroke(); }
    ctx.strokeStyle = SKIN_D; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(G0 - 30, y - 8); ctx.lineTo(G0 - 34, y + 8); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x1 + reach * 0.45, y - 9); ctx.lineTo(x1 + reach * 0.42, y + 7); ctx.stroke();
    ctx.fillStyle = '#3c4058'; ctx.beginPath(); ctx.ellipse(x1 + 1, tipY - 4, 7, 10, 0, 0, 7); ctx.fill();
  }
  ctx.restore();
  // the chain across her chin
  chain(ctx, G0 - 40, 1090, G1 + 30, 1070, 50, 46, t);
  if (st.dark) darken(ctx, st.dark);
}

// ---------- THE PHONE (rider app) ----------
const PH = { cx: 540, cy: 860, w: 640, h: 1180 };
const CHAT_RULES = [
  { y: 640, lines: ['Always accept the', '2:47 order.'] },
  { y: 830, lines: ['Never hand the bag', 'through the chain.'] },
  { y: 1020, lines: ['Never count her', 'fingers.'] },
];
function phoneBody(ctx, t, st, inner) {
  const p = PH;
  ctx.save();
  const bob = Math.sin(t * 1.3) * 5;
  const [sx, sy] = st.shake || [0, 0];
  ctx.translate(p.cx + sx, p.cy + bob + sy); ctx.rotate(st.rot ?? -0.03); ctx.translate(-p.cx, -p.cy);
  const x0 = p.cx - p.w / 2, y0 = p.cy - p.h / 2;
  glow(ctx, p.cx, p.cy, 900, 'rgba(110,140,220,A)', 0.18);
  ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 20;
  rrect(ctx, x0, y0, p.w, p.h, 86); ctx.fillStyle = '#0a0c13'; ctx.fill();
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; ctx.lineWidth = 4; ctx.strokeStyle = '#30364d'; ctx.stroke();
  const sx0 = x0 + 20, sy0 = y0 + 20, sw = p.w - 40, sh = p.h - 40;
  rrect(ctx, sx0, sy0, sw, sh, 68);
  const g = ctx.createLinearGradient(0, sy0, 0, sy0 + sh); g.addColorStop(0, '#121730'); g.addColorStop(1, '#080a14'); ctx.fillStyle = g; ctx.fill();
  ctx.save(); ctx.clip();
  rrect(ctx, p.cx - 76, sy0 + 22, 152, 44, 22); ctx.fillStyle = '#000'; ctx.fill();
  ctx.font = '26px Inter600'; ctx.fillStyle = 'rgba(230,236,250,0.85)'; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  ctx.fillText(st.clock || '2:41', sx0 + 50, sy0 + 54);
  ctx.textAlign = 'right'; ctx.fillText('13%', sx0 + sw - 50, sy0 + 54);
  inner(sx0, sy0, sw, sh);
  ctx.restore();
  // the hand holding it: thumb + fingers, white outline (house style)
  ctx.strokeStyle = C.white; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x0 - 120, y0 + p.h + 260); ctx.lineTo(x0 + 30, y0 + p.h - 60); ctx.lineTo(x0 + 120, y0 + p.h - 190); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x0 + p.w + 160, y0 + p.h + 220); ctx.lineTo(x0 + p.w - 10, y0 + p.h - 120); ctx.stroke();
  ctx.restore();
}
function appHeader(ctx, x, y, w, title, sub) {
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(x, y + 80, w, 110);
  ctx.beginPath(); ctx.arc(x + 76, y + 135, 30, 0, 7); ctx.fillStyle = APP; ctx.fill();
  ctx.font = '30px Osw700'; ctx.fillStyle = '#0b1022'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('N', x + 76, y + 137);
  ctx.textAlign = 'left'; ctx.font = '34px Inter700'; ctx.fillStyle = '#eef1f7'; ctx.fillText(title, x + 126, y + 122);
  ctx.font = '24px Inter500'; ctx.fillStyle = 'rgba(238,241,247,0.55)'; ctx.fillText(sub, x + 126, y + 158);
}
// st: {mode: 'chat'|'order'|'map'|'delivered'|'tomorrow', hl, hlA, dim, last 0..1, accept 0..1, street 0..1, from 0..1, addr 0..1,
//      clock, bg: fn, dark}
function drawPhone(ctx, t, st = {}) {
  if (st.bg) st.bg(ctx, t); else { ctx.fillStyle = '#060912'; ctx.fillRect(-1500, -1500, W + 3000, H + 3000); }
  phoneBody(ctx, t, st, (x, y, w, h) => {
    const cx = x + w / 2;
    if (st.mode === 'chat') {
      appHeader(ctx, x, y, w, 'Riders · Night', 'pinned message');
      // the pinned bubble from R.
      rrect(ctx, x + 30, y + 230, w - 60, 960, 34); ctx.fillStyle = '#232a42'; ctx.fill();
      ctx.font = '26px Mono700'; ctx.fillStyle = APP; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      spaced(ctx, 'R. · LAST NIGHT RIDER', x + 64, y + 290, 2);
      ctx.font = '40px Osw700'; ctx.fillStyle = '#eef1f7'; ctx.fillText('YOUR FIRST NIGHT? READ THIS.', x + 64, y + 360);
      ctx.fillStyle = 'rgba(238,241,247,0.2)'; ctx.fillRect(x + 64, y + 384, w - 128, 3);
      CHAT_RULES.forEach((r, i) => {
        const ry = r.y - 200 + y;
        const hl = st.hl === i ? clamp(st.hlA ?? 1) : 0;
        if (hl > 0) { ctx.save(); ctx.globalAlpha = 0.85; ctx.fillStyle = C.lime; rrect(ctx, x + 50, ry - 58, (w - 100) * hl, 150, 16); ctx.fill(); ctx.restore(); }
        ctx.globalAlpha = (st.dim && st.hl !== i) ? 1 - 0.6 * st.dim : 1;
        const ink = hl > 0.5 ? '#0b1022' : '#eef1f7';
        ctx.font = '62px Osw700'; ctx.fillStyle = hl > 0.5 ? '#0b1022' : APP; ctx.fillText(`${i + 1}`, x + 70, ry + 22);
        ctx.font = '44px Inter700';
        r.lines.forEach((ln, k) => { ctx.fillStyle = (i === 1 && k === 0 && hl <= 0.5) ? '#ff6b7a' : ink; ctx.fillText(ln, x + 130, ry + k * 56); });
        ctx.globalAlpha = 1;
      });
      const la = clamp(st.last || 0);
      if (la > 0) {
        ctx.save(); ctx.beginPath(); ctx.rect(x, y + 1040, (w) * la + 40, 140); ctx.clip();
        ctx.font = '44px Inter700'; ctx.fillStyle = '#ff4757';
        ctx.fillText('My phone ordered it.', x + 70, y + 1080);
        ctx.fillText('Not me.', x + 70, y + 1136);
        ctx.restore();
      }
      ctx.font = '22px Inter500'; ctx.fillStyle = 'rgba(238,241,247,0.45)'; ctx.textAlign = 'right'; ctx.fillText('sent 2:47 AM · last seen 7 nights ago', x + w - 50, y + 1170);
    } else if (st.mode === 'order') {
      appHeader(ctx, x, y, w, 'NiteBite Rider', 'online · 1 order nearby');
      const k = E.outBack(clamp(st.pop ?? 1));
      ctx.save(); ctx.translate(cx, y + 640); ctx.scale(k, k); ctx.translate(-cx, -(y + 640));
      rrect(ctx, x + 30, y + 240, w - 60, 880, 36); ctx.fillStyle = '#eef1f7'; ctx.fill();
      ctx.textAlign = 'center'; ctx.font = '30px Mono700'; ctx.fillStyle = '#d6303b'; spaced(ctx, 'NEW ORDER', cx, y + 310, 4, 'center');
      ctx.font = '150px Osw700'; ctx.fillStyle = '#0b1022'; ctx.fillText('2:47', cx - 30, y + 470); ctx.font = '48px Osw600'; ctx.fillText('AM', cx + 165, y + 470);
      // timer ring
      const ring = 1 - clamp(st.timer ?? 0);
            ctx.textAlign = 'left'; ctx.font = '34px Inter700'; ctx.fillStyle = '#0b1022';
      ctx.fillText('1 × Soup. Cold.', x + 80, y + 580);
      ctx.font = '30px Inter500'; ctx.fillStyle = '#5d6680'; ctx.fillText('47 Lantern Lane · 0.6 km', x + 80, y + 630);
      ctx.fillStyle = 'rgba(214,48,59,0.12)'; rrect(ctx, x + 70, y + 670, w - 140, 120, 18); ctx.fill();
      ctx.font = '24px Mono700'; ctx.fillStyle = '#d6303b'; ctx.fillText('NOTE FROM CUSTOMER', x + 96, y + 712);
      ctx.font = '38px Inter700'; ctx.fillText('"Hand it to me."', x + 96, y + 764);
      // accept button
      const ac = clamp(st.accept || 0);
      rrect(ctx, x + 70, y + 860, w - 140, 150, 75); ctx.fillStyle = ac > 0 ? mix('#c6ff3a', '#7fd11a', ac) : APP; ctx.fill();
      ctx.fillStyle = 'rgba(11,16,34,0.15)'; rrect(ctx, x + 70, y + 860, (w - 140) * ring, 150, 75); ctx.fill();
      ctx.textAlign = 'center'; ctx.font = '60px Osw700'; ctx.fillStyle = '#0b1022'; ctx.fillText(ac > 0.5 ? 'ACCEPTED ✓' : 'ACCEPT', cx, y + 958);
      if (ac > 0 && ac < 1) { ctx.globalAlpha = 1 - ac; ctx.beginPath(); ctx.arc(cx + 120, y + 935, 60 + 120 * ac, 0, 7); ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fill(); ctx.globalAlpha = 1; }
      ctx.restore();
    } else if (st.mode === 'map') {
      ctx.fillStyle = '#0d1428'; ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#1d2a4c'; ctx.lineCap = 'butt';
      for (let i = 0; i < 9; i++) { ctx.lineWidth = i % 3 ? 14 : 26; ctx.beginPath(); ctx.moveTo(x - 50, y + 150 + i * 130 + i * 10); ctx.lineTo(x + w + 50, y + 100 + i * 140); ctx.stroke(); }
      for (let i = 0; i < 6; i++) { ctx.lineWidth = i % 2 ? 14 : 24; ctx.beginPath(); ctx.moveTo(x + 40 + i * 120, y); ctx.lineTo(x + 10 + i * 128, y + h); ctx.stroke(); }
      ctx.font = '22px Mono500'; ctx.fillStyle = 'rgba(160,180,230,0.6)'; ctx.textAlign = 'left'; ctx.fillText('MARKET RD', x + 60, y + 410); ctx.fillText('STATION ST', x + 300, y + 940);
      // the new street, fading in
      const ns = clamp(st.street || 0);
      if (ns > 0) {
        ctx.save(); ctx.globalAlpha = ns; ctx.strokeStyle = '#ff3347'; ctx.lineWidth = 26; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x + 330, y + 640); ctx.bezierCurveTo(x + 420, y + 560, x + 470, y + 470, x + 540, y + 360); ctx.stroke();
        ctx.font = '26px Mono700'; ctx.fillStyle = '#ff6b7a'; ctx.save(); ctx.translate(x + 400, y + 470); ctx.rotate(-1.0); ctx.fillText('LANTERN LN', 0, 0); ctx.restore();
        ctx.restore();
      }
      // route + you + the pin
      ctx.setLineDash([18, 14]); ctx.strokeStyle = APP; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(x + 170, y + 960); ctx.lineTo(x + 280, y + 700); ctx.lineTo(x + 330, y + 640); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(x + 170, y + 960, 24, 0, 7); ctx.fillStyle = '#4c8dff'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#fff'; ctx.stroke();
      glow(ctx, x + 170, y + 960, 90, 'rgba(76,141,255,A)', 0.5);
      if (ns > 0.3) {
        const pk = E.outBack(inv(0.3, 0.7, ns)), px = x + 500, py = y + 410;
        ctx.save(); ctx.translate(px, py); ctx.scale(pk, pk);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-44, -50, -44, -110, 0, -110); ctx.bezierCurveTo(44, -110, 44, -50, 0, 0); ctx.fillStyle = '#ff3347'; ctx.fill();
        ctx.font = '36px Osw700'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText('47', 0, -62);
        ctx.restore();
      }
      rrect(ctx, x + 40, y + h - 250, w - 80, 190, 30); ctx.fillStyle = 'rgba(10,14,30,0.92)'; ctx.fill();
      ctx.textAlign = 'left'; ctx.font = '26px Mono700'; ctx.fillStyle = ns > 0.5 ? '#ff6b7a' : 'rgba(238,241,247,0.6)';
      spaced(ctx, ns > 0.5 ? 'NEW ROAD · ADDED 00:00' : 'ROUTING…', x + 80, y + h - 190, 2);
      ctx.font = '40px Inter700'; ctx.fillStyle = '#eef1f7'; ctx.fillText('47 Lantern Lane', x + 80, y + h - 130);
      ctx.font = '26px Inter500'; ctx.fillStyle = 'rgba(238,241,247,0.55)'; ctx.fillText('Not on yesterday\'s map', x + 80, y + h - 86);
      appHeader(ctx, x, y, w, 'Navigating', '4 min · 0.6 km');
    } else if (st.mode === 'delivered' || st.mode === 'tomorrow') {
      appHeader(ctx, x, y, w, 'NiteBite Rider', st.mode === 'delivered' ? 'order #2147' : 'scheduled');
      if (st.mode === 'delivered') {
        const ck = E.outBack(clamp(st.pop ?? 1));
        ctx.save(); ctx.translate(cx, y + 360); ctx.scale(ck, ck);
        ctx.beginPath(); ctx.arc(0, 0, 90, 0, 7); ctx.fillStyle = APP; ctx.fill();
        ctx.strokeStyle = '#0b1022'; ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(-10, 32); ctx.lineTo(44, -30); ctx.stroke();
        ctx.restore();
        ctx.textAlign = 'center'; ctx.font = '58px Osw700'; ctx.fillStyle = '#eef1f7'; ctx.fillText('ORDER DELIVERED', cx, y + 540);
        ctx.font = '28px Inter500'; ctx.fillStyle = 'rgba(238,241,247,0.55)'; ctx.fillText('2:52 AM · 47 Lantern Lane', cx, y + 590);
        const row = (lab, val, ry, red) => {
          ctx.textAlign = 'left'; ctx.font = '24px Mono700'; ctx.fillStyle = 'rgba(238,241,247,0.5)'; spaced(ctx, lab, x + 70, ry, 2);
          ctx.font = '40px Inter700'; ctx.fillStyle = red ? '#ff4757' : '#eef1f7'; ctx.fillText(val, x + 70, ry + 52);
        };
        row('CUSTOMER', '— (no name)', y + 680);
        row('TIP', 'none · "See you tomorrow"', y + 810);
        const f = clamp(st.from || 0);
        if (f > 0) { ctx.save(); ctx.globalAlpha = f; rrect(ctx, x + 40, y + 900, w - 80, 170, 22); ctx.fillStyle = 'rgba(255,51,71,0.16)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#ff3347'; ctx.stroke(); ctx.restore(); }
        row('PLACED FROM', f > 0.4 ? 'THIS PHONE · YOU' : '···', y + 950, f > 0.4);
      } else {
        ctx.textAlign = 'center'; ctx.font = '30px Mono700'; ctx.fillStyle = '#ff6b7a'; spaced(ctx, 'NEXT ORDER · ALREADY PLACED', cx, y + 290, 3, 'center');
        ctx.font = '120px Osw700'; ctx.fillStyle = '#eef1f7'; ctx.fillText('2:47 AM', cx, y + 420);
        ctx.font = '34px Inter600'; ctx.fillStyle = 'rgba(238,241,247,0.7)'; ctx.fillText('Tomorrow · 1 × Soup. Cold.', cx, y + 505);
        // mini map with your place
        rrect(ctx, x + 40, y + 550, w - 80, 440, 28); ctx.fillStyle = '#0d1428'; ctx.fill();
        ctx.save(); rrect(ctx, x + 40, y + 550, w - 80, 440, 28); ctx.clip();
        ctx.strokeStyle = '#1d2a4c'; for (let i = 0; i < 5; i++) { ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(x, y + 600 + i * 90); ctx.lineTo(x + w, y + 560 + i * 100); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + 90 + i * 120, y + 550); ctx.lineTo(x + 70 + i * 126, y + 990); ctx.stroke(); }
        const a = clamp(st.addr || 0);
        const px = cx, py = y + 790;
        glow(ctx, px, py, 160, 'rgba(255,51,71,A)', 0.6 * a);
        ctx.beginPath(); ctx.arc(px, py + 10, 26, 0, 7); ctx.fillStyle = '#4c8dff'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#fff'; ctx.stroke();
        if (a > 0) { const pk = E.outBack(clamp(a * 1.4)); ctx.save(); ctx.translate(px, py - 10); ctx.scale(pk, pk); ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-50, -56, -50, -124, 0, -124); ctx.bezierCurveTo(50, -124, 50, -56, 0, 0); ctx.fillStyle = '#ff3347'; ctx.fill(); ctx.beginPath(); ctx.arc(0, -82, 16, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore(); }
        ctx.restore();
        ctx.textAlign = 'left'; ctx.font = '24px Mono700'; ctx.fillStyle = 'rgba(238,241,247,0.5)'; spaced(ctx, 'DELIVER TO', x + 70, y + 1050, 2);
        ctx.font = '42px Inter700'; ctx.fillStyle = a > 0.4 ? '#ff4757' : '#eef1f7'; ctx.fillText(a > 0.4 ? 'YOUR LOCATION · RM 13' : '···', x + 70, y + 1104);
      }
    }
  });
  if (st.dark) darken(ctx, st.dark);
}

// a blurred street behind the phone (porch light on/off)
function streetBG(ctx, t, porch = 1) {
  ctx.save(); ctx.filter = 'blur(26px)';
  drawHouse(ctx, t, { light: porch, open: porch > 0.5 ? 1 : 0, street: 0.8, scooter: false });
  ctx.restore();
  ctx.fillStyle = 'rgba(3,4,10,0.45)'; ctx.fillRect(0, 0, W, H);
}

module.exports = { drawHouse, drawHandClose, drawGapFace, drawPhone, CHAT_RULES, streetBG, sevenHand, bag, scooter, chain, DR, PH, darken };
