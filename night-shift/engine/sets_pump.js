// NIGHT SHIFT — Episode 4 set painters: the petrol pump forecourt under a bright canopy, the white car with no driver
// whose passengers all sit facing backwards (side view + the back-window POSTER image), the pump meter, the handover
// note, the two number plates. World space 1080x1920, same conventions as sets.js / sets_delivery.js.
const D = require('./draw');
const { W, H, C, clamp, lerp, inv, E, hash, noise1, flicker, rrect, glow, spaced, drawStick } = D;

const SKIN = '#b9bfcc', SKIN_D = '#8a92a6', CAR = '#e9edf3', CAR_D = '#b8c0cf', GLASS = '#0a1024';
const INK = '#141a36', REDINK = '#c4202c', BLUEINK = '#1d3fa8';
const PLATE = 'KA 13 NS 2222';
const poly = (ctx, pts, fill) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } };
const mix = (a, b, k) => { const p = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(k)))).join(',')})`; };
const darken = (ctx, a) => { if (a > 0.005) { ctx.fillStyle = `rgba(2,3,8,${a})`; ctx.fillRect(-1500, -1500, W + 3000, H + 3000); } };

// ---------- a passenger head seen from the side, facing BACKWARDS (toward -x) ----------
function sideHead(ctx, x, y, s, t, i, L) {
  ctx.save(); ctx.translate(x, y + Math.sin(t * 0.9 + i) * 1.5); ctx.scale(s, s);
  // shoulders (facing back)
  ctx.beginPath(); ctx.moveTo(-36, 70); ctx.quadraticCurveTo(0, 30, 40, 70); ctx.lineTo(40, 110); ctx.lineTo(-36, 110); ctx.closePath(); ctx.fillStyle = '#1a2038'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, 0, 34, 42, 0, 0, 7); ctx.fillStyle = mix('#3a4058', SKIN, L); ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = '#0b1022'; ctx.stroke();
  // nose to the LEFT (face looks back), dark eye, thin mouth
  ctx.beginPath(); ctx.moveTo(-32, -6); ctx.lineTo(-44, 8); ctx.lineTo(-32, 12); ctx.fillStyle = mix('#3a4058', SKIN, L); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(-20, -6, 7, 9, 0, 0, 7); ctx.fillStyle = '#05060c'; ctx.fill();
  ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-30, 24); ctx.quadraticCurveTo(-18, 28, -10, 22); ctx.stroke();
  // hair on the back of the head (on the right)
  ctx.beginPath(); ctx.ellipse(10, -14, 28, 32, 0.3, -1.4, 1.6); ctx.fillStyle = '#0b0e1c'; ctx.fill();
  ctx.restore();
}

// ---------- the white car, side view, front to the RIGHT. Origin = ground under the car's centre ----------
// o: {s, L light 0..1, heads bool, wheelRot, cap bool (fuel cap open), nozzle 0..1, tail 0..1}
function carSide(ctx, t, o = {}) {
  const L = o.L ?? 1;
  ctx.save(); ctx.scale(o.s || 1, o.s || 1);
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(0, 4, 420, 26, 0, 0, 7); ctx.fill();
  // cabin glass
  poly(ctx, [[-250, -150], [-205, -290], [130, -290], [230, -150]], '#0b1022');
  poly(ctx, [[-235, -158], [-195, -278], [-20, -278], [-20, -158]], GLASS);
  poly(ctx, [[-4, -158], [-4, -278], [122, -278], [212, -158]], GLASS);
  // the windows glow faintly from the canopy
  if (L > 0.1) { ctx.save(); ctx.globalAlpha = 0.18 * L; poly(ctx, [[-235, -158], [-195, -278], [-150, -278], [-200, -158]], '#ffffff'); poly(ctx, [[10, -158], [40, -278], [70, -278], [40, -158]], '#ffffff'); ctx.restore(); }
  // the empty driver's seat + steering wheel in the front window (NO DRIVER)
  ctx.save(); ctx.beginPath(); ctx.rect(-4, -278, 220, 120); ctx.clip();
  ctx.fillStyle = '#20263e'; rrect(ctx, 20, -250, 46, 92, 10); ctx.fill();
  ctx.lineWidth = 9; ctx.strokeStyle = '#2c3350'; ctx.beginPath(); ctx.ellipse(112, -200, 12, 34, 0.35, 0, 7); ctx.stroke();
  ctx.restore();
  // passengers facing backwards in the rear window
  if (o.heads !== false) {
    ctx.save(); ctx.beginPath(); ctx.moveTo(-235, -158); ctx.lineTo(-195, -278); ctx.lineTo(-20, -278); ctx.lineTo(-20, -158); ctx.closePath(); ctx.clip();
    sideHead(ctx, -150, -215, 0.95, t, 0, L); sideHead(ctx, -75, -222, 1.0, t, 1, L);
    ctx.restore();
  }
  // body
  const body = mix('#2a3150', CAR, L), bodyD = mix('#1b2140', CAR_D, L);
  ctx.beginPath(); ctx.moveTo(-400, -60); ctx.quadraticCurveTo(-405, -150, -330, -155); ctx.lineTo(380, -150); ctx.quadraticCurveTo(415, -140, 410, -60); ctx.lineTo(400, -30); ctx.lineTo(-395, -30); ctx.closePath();
  ctx.fillStyle = body; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#0b1022'; ctx.stroke();
  ctx.fillStyle = bodyD; ctx.fillRect(-395, -70, 800, 30);
  ctx.strokeStyle = 'rgba(11,16,34,0.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-10, -150); ctx.lineTo(-14, -40); ctx.moveTo(200, -150); ctx.lineTo(198, -40); ctx.stroke();
  ctx.fillStyle = '#0b1022'; ctx.fillRect(40, -120, 34, 7); ctx.fillRect(-170, -120, 34, 7);
  // lights: tail (left, red) + head (right, warm)
  ctx.fillStyle = '#ff2e3e'; rrect(ctx, -402, -138, 22, 40, 6); ctx.fill();
  glow(ctx, -400, -118, 120, 'rgba(255,40,60,A)', 0.45 * (o.tail ?? 0.6));
  ctx.fillStyle = '#fff3c4'; rrect(ctx, 388, -132, 22, 34, 6); ctx.fill();
  // fuel cap (rear quarter)
  ctx.fillStyle = o.cap ? '#05060c' : bodyD; ctx.beginPath(); ctx.arc(-300, -112, 16, 0, 7); ctx.fill();
  // wheels
  for (const wx of [-260, 250]) {
    ctx.beginPath(); ctx.arc(wx, -32, 58, 0, 7); ctx.fillStyle = '#05060c'; ctx.fill();
    ctx.beginPath(); ctx.arc(wx, -32, 30, 0, 7); ctx.fillStyle = mix('#3b4466', '#9aa3b8', L); ctx.fill();
    ctx.save(); ctx.translate(wx, -32); ctx.rotate(o.wheelRot || 0); ctx.strokeStyle = '#0b1022'; ctx.lineWidth = 5;
    for (let k = 0; k < 5; k++) { ctx.rotate(Math.PI * 2 / 5); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 26); ctx.stroke(); }
    ctx.restore();
  }
  // a tiny number plate on the rear (unreadable at this size)
  ctx.fillStyle = '#f3f1e6'; ctx.fillRect(-404, -92, 10, 30);
  ctx.restore();
}

// ---------- the pump (dispenser) ----------
function pump(ctx, x, y, s, L, t, st = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -90, -420, 180, 420, 16); ctx.fillStyle = mix('#1a2140', '#f2f4f8', L); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#0b1022'; ctx.stroke();
  ctx.fillStyle = mix('#3a0c12', '#e3242f', L); ctx.fillRect(-90, -420, 180, 70);
  ctx.font = '40px Osw700'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('3', 0, -384);
  rrect(ctx, -66, -330, 132, 100, 8); ctx.fillStyle = '#070a14'; ctx.fill();
  ctx.font = '34px Osw700'; ctx.fillStyle = C.led; ctx.fillText(st.lit ?? '00.0', 0, -280);
  ctx.fillStyle = '#20263e'; ctx.fillRect(-60, -200, 50, 70);
  ctx.restore();
}

// ---------- your motorbike (parked by the kiosk) ----------
function bike(ctx, x, y, s, L) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const wx of [-95, 95]) { ctx.beginPath(); ctx.arc(wx, -42, 42, 0, 7); ctx.fillStyle = '#05060c'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = mix('#3b4466', '#9aa3b8', L); ctx.stroke(); }
  poly(ctx, [[-100, -60], [-40, -120], [60, -120], [100, -70], [40, -60]], mix('#141c3a', '#3c5bd0', L));
  poly(ctx, [[-60, -125], [40, -125], [30, -140], [-50, -140]], '#0b0e1c');
  ctx.lineWidth = 8; ctx.strokeStyle = '#0b1022'; ctx.beginPath(); ctx.moveTo(80, -110); ctx.lineTo(110, -170); ctx.lineTo(140, -170); ctx.stroke();
  ctx.fillStyle = '#f3f1e6'; ctx.fillRect(-138, -92, 26, 20);
  ctx.restore();
}

// ---------- THE FORECOURT (bright canopy) ----------
// st: {light 0..1, car bool, carX, wheelRot, heads, me {...}, bike bool, nozzle 0..1, kiosk 1, hose bool, tail}
function drawForecourt(ctx, t, st = {}) {
  const L = (st.light ?? 1) * flicker(t, 4, 0.015);
  const sg = ctx.createLinearGradient(0, -600, 0, 900); sg.addColorStop(0, '#070d26'); sg.addColorStop(1, '#1a2858');
  ctx.fillStyle = sg; ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  for (let i = 0; i < 26; i++) { const x = hash(i * 7.1) * 1800 - 400, y = hash(i * 2.3) * 500 - 300; ctx.fillStyle = `rgba(230,236,255,${0.3 + 0.5 * hash(i)})`; ctx.fillRect(x, y, 3, 3); }
  // far tree line + the highway lamp
  ctx.fillStyle = '#060a1c'; for (let i = -6; i < 14; i++) { const x = i * 120, h = 60 + hash(i * 1.7) * 90; ctx.beginPath(); ctx.ellipse(x, 560, 90, h, 0, Math.PI, 0); ctx.fill(); }
  ctx.fillStyle = '#060a1c'; ctx.fillRect(-1500, 560, W + 3000, 80);
  // forecourt floor (bright under the canopy)
  const fg = ctx.createLinearGradient(0, 600, 0, 1920); fg.addColorStop(0, mix('#0d1430', '#7d8aa8', L)); fg.addColorStop(0.5, mix('#121a3a', '#b8c2d6', L)); fg.addColorStop(1, mix('#0b1128', '#8794b0', L));
  ctx.fillStyle = fg; ctx.fillRect(-1500, 620, W + 3000, 2000);
  ctx.strokeStyle = 'rgba(11,16,34,0.18)'; ctx.lineWidth = 4; for (let y = 700; y < 2200; y += 160) { ctx.beginPath(); ctx.moveTo(-1500, y); ctx.lineTo(2600, y); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,214,90,0.55)'; for (let x = -800; x < 2000; x += 220) ctx.fillRect(x, 1500, 120, 12);
  // the kiosk (background, lit window, 24 HRS)
  if (st.kiosk !== false) {
    ctx.fillStyle = mix('#151c3a', '#e8e2d2', L * 0.9); ctx.fillRect(700, 470, 380, 300);
    ctx.fillStyle = mix('#0b1022', '#ffe7a8', L); ctx.fillRect(730, 520, 220, 150);
    ctx.fillStyle = 'rgba(11,16,34,0.5)'; ctx.fillRect(838, 520, 6, 150);
    rrect(ctx, 735, 420, 200, 50, 8); ctx.fillStyle = mix('#3a0c12', '#e3242f', L); ctx.fill();
    ctx.font = '30px Osw700'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('24 HRS', 835, 447);
    ctx.fillStyle = mix('#0b1022', '#5a3b2a', L); ctx.fillRect(970, 560, 80, 210);
  }
  if (st.bike !== false) bike(ctx, 930, 800, 0.62, L);
  else if (st.bikeGhost) {   // where it stood: a dry patch + the kickstand scratch
    ctx.save(); ctx.globalAlpha = st.bikeGhost; ctx.fillStyle = 'rgba(30,40,70,0.35)'; ctx.beginPath(); ctx.ellipse(930, 800, 120, 16, 0, 0, 7); ctx.fill();
    ctx.setLineDash([12, 10]); ctx.strokeStyle = C.red; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(930, 760, 150, 70, 0, 0, 7); ctx.stroke(); ctx.restore();
  }
  // canopy
  ctx.fillStyle = mix('#0e1430', '#dfe4ee', L * 0.9); ctx.fillRect(-1500, 200, W + 3000, 150);
  ctx.fillStyle = mix('#3a0c12', '#e3242f', L); ctx.fillRect(-1500, 300, W + 3000, 50);
  ctx.font = '46px Osw700'; ctx.fillStyle = mix('#5a5f70', '#ffffff', L); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('HIGHWAY FUELS', 540, 255);
  ctx.fillStyle = mix('#151a30', '#fffbe8', L); for (let x = -300; x < 1500; x += 260) ctx.fillRect(x, 350, 160, 14);
  if (L > 0.05) for (let x = -170; x < 1500; x += 260) glow(ctx, x + 50, 420, 520, 'rgba(255,248,225,A)', 0.22 * L);
  // pillar
  ctx.fillStyle = mix('#151c3a', '#d9dde6', L); ctx.fillRect(40, 350, 50, 1000);
  // pump 3
  pump(ctx, 160, 1360, 1, L, t, { lit: st.meter || '00.0' });
  // the car
  const cx = 640 + (st.carX || 0);
  if (st.car !== false) {
    ctx.save(); ctx.translate(cx, 1420); carSide(ctx, t, { L, heads: st.heads, wheelRot: st.wheelRot, cap: st.hose, tail: st.tail ?? 0.6 }); ctx.restore();
  }
  // the hose from pump to the car's fuel cap
  if (st.hose && st.car !== false) {
    const nx = cx - 300, ny = 1420 - 112;
    ctx.strokeStyle = '#0b0e1c'; ctx.lineWidth = 14; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(220, 1150); ctx.bezierCurveTo(260, 1420, nx - 80, 1430, nx - 30, ny + 6); ctx.stroke();
    ctx.save(); ctx.translate(nx - 20, ny); ctx.rotate(-0.25 + (st.jam ? Math.sin(t * 40) * 0.06 * st.jam : 0));
    rrect(ctx, -56, -16, 64, 32, 8); ctx.fillStyle = '#1b2140'; ctx.fill(); ctx.fillStyle = '#e3242f'; ctx.fillRect(-56, -16, 20, 32); ctx.restore();
  }
  if (st.me) drawStick(ctx, { ...st.me, lit: st.me.lit ?? 0 });
  if (st.dark) darken(ctx, st.dark);
}

// ---------- a frontal face in the back window (the POSTER image) ----------
function backFace(ctx, x, y, s, t, i, o = {}) {
  ctx.save(); ctx.translate(x, y + Math.sin(t * 0.8 + i * 2) * 2); ctx.scale(s, s);
  // shoulders
  ctx.beginPath(); ctx.moveTo(-110, 200); ctx.quadraticCurveTo(-100, 110, 0, 105); ctx.quadraticCurveTo(100, 110, 110, 200); ctx.closePath(); ctx.fillStyle = o.uniform ? '#2a4a8c' : '#1a2038'; ctx.fill();
  if (o.uniform) {   // the attendant's uniform: collar, red pump logo, name tag
    poly(ctx, [[-36, 106], [0, 150], [36, 106], [20, 100], [0, 124], [-20, 100]], '#dfe4ee');
    ctx.fillStyle = '#e3242f'; ctx.fillRect(40, 140, 40, 24); ctx.fillStyle = '#f2f4f8'; ctx.fillRect(-84, 140, 64, 20);
    ctx.font = '16px Mono700'; ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('R.', -52, 151);
  }
  // long pale face
  ctx.beginPath(); ctx.ellipse(0, 0, 66, 92, 0, 0, 7); ctx.fillStyle = SKIN; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = '#0b1022'; ctx.stroke();
  const g = ctx.createRadialGradient(-20, -30, 10, 0, 0, 100); g.addColorStop(0, 'rgba(255,255,255,0.25)'); g.addColorStop(1, 'rgba(20,24,50,0.35)'); ctx.fillStyle = g; ctx.fill();
  if (o.uniform) { poly(ctx, [[-74, -52], [74, -52], [80, -78], [0, -110], [-80, -78]], '#2a4a8c'); ctx.fillStyle = '#1b2f60'; ctx.fillRect(-78, -58, 156, 12); }
  else { ctx.beginPath(); ctx.ellipse(0, -62, 70, 40, 0, Math.PI, 0); ctx.fillStyle = '#0b0e1c'; ctx.fill(); }
  // hollow eyes with a pinpoint
  for (const ex of [-26, 26]) {
    ctx.beginPath(); ctx.ellipse(ex, -10, 17, 21, 0, 0, 7); ctx.fillStyle = '#05060c'; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(ex + (o.look || 0) * 5, -8, 3.2, 0, 7); ctx.fill();
  }
  ctx.strokeStyle = SKIN_D; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-6, 26); ctx.lineTo(4, 28); ctx.stroke();
  // mouth: a thin smile, or speaking (o.mouth 0..1)
  const m = clamp(o.mouth || 0), sm = o.smile ?? 0.6;
  ctx.lineWidth = 4; ctx.strokeStyle = '#0b1022';
  if (m > 0.05) { ctx.beginPath(); ctx.ellipse(0, 52, 22, 6 + 16 * m, 0, 0, 7); ctx.fillStyle = '#05060c'; ctx.fill(); ctx.stroke(); }
  else { ctx.beginPath(); ctx.moveTo(-34, 46); ctx.quadraticCurveTo(0, 46 + 20 * sm, 34, 46); ctx.stroke(); }
  // palms pressed to the glass
  if (o.palms) for (const px of [-120, 120]) {
    ctx.save(); ctx.translate(px, 40); ctx.fillStyle = 'rgba(200,206,220,0.9)';
    ctx.beginPath(); ctx.ellipse(0, 0, 36, 42, 0, 0, 7); ctx.fill();
    for (let f = 0; f < 4; f++) { ctx.beginPath(); ctx.ellipse(-27 + f * 18, -58, 8, 22, 0, 0, 7); ctx.fill(); }
    ctx.restore();
  }
  ctx.restore();
}

// ---------- THE CAR FROM BEHIND (the back window full of faces + the number plate) ----------
// st: {light, faces 0..1, empty idx|-1, mouth 0..1, plate 0..1 reveal, plateHL 0..1, look, recede 0..1, dark}
const RW = { x0: 170, x1: 910, y0: 520, y1: 900 };
function drawCarRear(ctx, t, st = {}) {
  const L = (st.light ?? 1) * flicker(t, 9, 0.02);
  const sg = ctx.createLinearGradient(0, -600, 0, 1000); sg.addColorStop(0, '#070d26'); sg.addColorStop(1, '#1a2858');
  ctx.fillStyle = sg; ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  // the dark highway beyond
  ctx.fillStyle = '#060a1c'; ctx.fillRect(-1500, 700, W + 3000, 300);
  ctx.fillStyle = 'rgba(255,214,90,0.35)'; for (let k = 0; k < 6; k++) { const y = 760 + k * 40; ctx.fillRect(520 - k * 4, y, 40 + k * 8, 10); }
  const fg = ctx.createLinearGradient(0, 900, 0, 1920); fg.addColorStop(0, mix('#0d1430', '#8d9ab8', L)); fg.addColorStop(1, mix('#0b1128', '#b8c2d6', L));
  ctx.fillStyle = fg; ctx.fillRect(-1500, 980, W + 3000, 2000);
  const r = st.recede || 0;
  ctx.save(); ctx.translate(540, 1500); const sc = lerp(1, 0.35, E.in(r)); ctx.scale(sc, sc); ctx.translate(-540, -1500 - r * 900);
  // shadow + body
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(540, 1500, 520, 40, 0, 0, 7); ctx.fill();
  const body = mix('#2a3150', CAR, L), bodyD = mix('#1b2140', CAR_D, L);
  poly(ctx, [[130, 920], [210, 470], [870, 470], [950, 920]], mix('#20263e', '#cfd5e0', L));
  ctx.beginPath(); ctx.moveTo(60, 940); ctx.quadraticCurveTo(60, 890, 140, 880); ctx.lineTo(940, 880); ctx.quadraticCurveTo(1020, 890, 1020, 940); ctx.lineTo(1030, 1440); ctx.lineTo(50, 1440); ctx.closePath();
  ctx.fillStyle = body; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#0b1022'; ctx.stroke();
  ctx.fillStyle = bodyD; ctx.fillRect(50, 1330, 980, 110);
  ctx.strokeStyle = 'rgba(11,16,34,0.35)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(110, 1000); ctx.lineTo(970, 1000); ctx.stroke();
  // tail lights
  for (const tx of [70, 860]) { rrect(ctx, tx, 950, 150, 80, 14); ctx.fillStyle = '#ff2e3e'; ctx.fill(); glow(ctx, tx + 75, 990, 260, 'rgba(255,40,60,A)', 0.5 * (st.tail ?? 0.7)); }
  // tyres
  ctx.fillStyle = '#05060c'; ctx.fillRect(90, 1440, 150, 60); ctx.fillRect(840, 1440, 150, 60);
  // THE NUMBER PLATE
  const px0 = 330, px1 = 750, py0 = 1110, py1 = 1230;
  rrect(ctx, px0, py0, px1 - px0, py1 - py0, 12); ctx.fillStyle = '#f3f1e6'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#0b1022'; ctx.stroke();
  const pr = clamp(st.plate ?? 0);
  ctx.save(); ctx.font = '70px Osw700'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (pr < 1) { ctx.fillStyle = 'rgba(20,26,54,0.35)'; for (let k = 0; k < 9; k++) ctx.fillRect(px0 + 30 + k * 42, py0 + 40, 30, 44); }
  ctx.globalAlpha = pr; ctx.fillStyle = INK; ctx.fillText(PLATE, 540, (py0 + py1) / 2 + 4); ctx.restore();
  if (st.plateHL > 0) { ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 9; ctx.beginPath(); ctx.ellipse(540, (py0 + py1) / 2, 260, 95, -0.03, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(st.plateHL)); ctx.stroke(); ctx.restore(); }
  // back window + the faces
  poly(ctx, [[RW.x0, RW.y1], [RW.x0 + 70, RW.y0], [RW.x1 - 70, RW.y0], [RW.x1, RW.y1]], GLASS);
  ctx.save(); poly(ctx, [[RW.x0, RW.y1], [RW.x0 + 70, RW.y0], [RW.x1 - 70, RW.y0], [RW.x1, RW.y1]]); ctx.clip();
  // interior light: a faint cold wash so the faces read
  glow(ctx, 540, 700, 520, 'rgba(160,190,255,A)', 0.22 * L);
  const fa = clamp(st.faces ?? 1);
  const seats = [[300, 760, 0.95], [540, 735, 1.05], [780, 760, 0.95]];
  seats.forEach(([fx, fy, s], i) => {
    if (st.empty === i) {   // an empty seat, turned around, waiting
      ctx.fillStyle = '#2a3150'; rrect(ctx, fx - 80, fy - 60, 160, 240, 30); ctx.fill();
      ctx.fillStyle = '#20263e'; rrect(ctx, fx - 50, fy - 130, 100, 70, 20); ctx.fill();
      if (st.emptyHL > 0) { ctx.save(); ctx.globalAlpha = clamp(st.emptyHL); ctx.setLineDash([16, 12]); ctx.strokeStyle = C.red; ctx.lineWidth = 8; rrect(ctx, fx - 100, fy - 150, 200, 320, 30); ctx.stroke(); ctx.restore(); }
      return;
    }
    ctx.save(); ctx.globalAlpha = fa;
    backFace(ctx, fx, fy + (1 - fa) * 60, s, t, i, { uniform: i === 1, mouth: i === 1 ? st.mouth : 0, look: st.look || 0, palms: st.palms && i !== 1, smile: st.smile ?? 0.6 });
    ctx.restore();
  });
  // glass reflection streaks
  ctx.fillStyle = 'rgba(255,255,255,0.07)'; poly(ctx, [[260, 900], [380, 520], [430, 520], [310, 900]]); ctx.fill();
  ctx.restore();
  ctx.lineWidth = 10; ctx.strokeStyle = '#0b1022'; poly(ctx, [[RW.x0, RW.y1], [RW.x0 + 70, RW.y0], [RW.x1 - 70, RW.y0], [RW.x1, RW.y1]]); ctx.stroke();
  ctx.restore();
  if (st.dark) darken(ctx, st.dark);
}

// ---------- the pump meter close-up ----------
function drawMeter(ctx, t, st = {}) {
  ctx.fillStyle = '#c9cfdb'; ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  ctx.fillStyle = '#e3242f'; ctx.fillRect(-1500, 260, W + 3000, 150);
  ctx.font = '64px Osw700'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('PUMP 3 · PETROL', 540, 336);
  const box = (y, label, val, hot) => {
    rrect(ctx, 130, y, 820, 300, 24); ctx.fillStyle = '#05070f'; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#2a3253'; ctx.stroke();
    ctx.font = '34px Mono700'; ctx.fillStyle = 'rgba(238,241,247,0.7)'; ctx.textAlign = 'left'; spaced(ctx, label, 170, y + 56, 4);
    ctx.font = '170px Osw700'; ctx.textAlign = 'right'; ctx.fillStyle = hot ? C.red : C.led;
    ctx.shadowColor = 'rgba(255,46,46,0.8)'; ctx.shadowBlur = 30; ctx.fillText(val, 910, y + 190); ctx.shadowBlur = 0;
  };
  const lit = st.litres ?? 0;
  box(520, 'LITRES', st.full ? 'FULL' : lit.toFixed(1), lit > 60 || st.full);
  box(900, 'AMOUNT · RS', st.full ? '— —' : (lit * 104.6).toFixed(0), false);
  ctx.font = '40px Mono700'; ctx.fillStyle = '#20263e'; ctx.textAlign = 'center'; spaced(ctx, st.full ? 'TANK FULL · NO PAYMENT' : 'TANK CAPACITY 35 L', 540, 478, 4, 'center');
  
  if (st.dark) darken(ctx, st.dark);
}

// ---------- the handover note (taped to the kiosk counter) ----------
const NOTE_RULES = [
  { y: 640, lines: ['At 2:22, fill the', 'white car. Full tank.', 'TAKE NO MONEY.'] },
  { y: 940, lines: ['Never stand', 'BEHIND it.'] },
  { y: 1160, lines: ['Never read the', 'number plate.'] },
];
function drawPumpNote(ctx, t, st = {}) {
  const g = ctx.createLinearGradient(0, -600, 0, H + 600); g.addColorStop(0, '#5a6a88'); g.addColorStop(1, '#7f8eac');
  ctx.fillStyle = g; ctx.fillRect(-600, -600, W + 1200, H + 1200);
  ctx.save(); ctx.translate(540, 960); ctx.rotate(-0.015); ctx.translate(-540, -960);
  const x0 = 140, x1 = 940, y0 = 230, y1 = 1760;
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  ctx.fillStyle = '#f4ecc8'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.fillStyle = 'rgba(70,100,170,0.25)'; for (let y = y0 + 160; y < y1 - 30; y += 66) ctx.fillRect(x0 + 10, y, x1 - x0 - 20, 2);
  ctx.fillStyle = 'rgba(200,60,70,0.4)'; ctx.fillRect(x0 + 110, y0, 3, y1 - y0);
  ctx.fillStyle = 'rgba(230,220,170,0.8)'; ctx.fillRect(470, y0 - 30, 140, 60);
  ctx.fillStyle = INK; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'center';
  ctx.font = '84px Osw700'; ctx.fillText('PUMP 3 · NIGHTS', 540, 390);
  ctx.font = '40px Osw600'; spaced(ctx, 'READ BEFORE 2:22', 540, 456, 8, 'center');
  ctx.fillRect(330, 480, 420, 5);
  ctx.textAlign = 'left';
  NOTE_RULES.forEach((r, i) => {
    const hl = st.hl === i ? clamp(st.hlA ?? 1) : 0;
    if (hl > 0) { ctx.save(); ctx.globalAlpha = 0.55; ctx.fillStyle = C.lime; ctx.fillRect(x0 + 20, r.y - 56, 760 * hl, r.lines.length * 70 + 6); ctx.restore(); }
    ctx.globalAlpha = (st.dim > 0 && st.hl !== i) ? 1 - 0.55 * st.dim : 1;
    ctx.fillStyle = INK; ctx.font = '72px Osw700'; ctx.fillText(`${i + 1}.`, x0 + 20, r.y + 4);
    ctx.font = '52px Inter600';
    r.lines.forEach((ln, k) => { ctx.fillStyle = /[A-Z]{4,}/.test(ln) ? REDINK : INK; ctx.fillText(ln, x0 + 140, r.y + k * 70); });
    ctx.globalAlpha = 1;
  });
  // his last line
  const so = clamp(st.last ?? 1);
  if (so > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(x0, 1330, (x1 - x0) * so, 140); ctx.clip();
    ctx.font = '62px Inter700'; ctx.fillStyle = REDINK;
    let x = x0 + 140; ['Don\'t', 'wait', 'for', 'me.'].forEach((w, i) => { ctx.save(); ctx.translate(x, 1420 + Math.sin(i * 2.1) * 7); ctx.rotate((hash(i * 4) - 0.5) * 0.1); ctx.fillText(w, 0, 0); ctx.restore(); x += ctx.measureText(w).width + 22; });
    ctx.restore();
    ctx.font = '46px Inter700'; ctx.fillStyle = INK; ctx.fillText('— R.', x1 - 200, 1500);
  }
  // YOUR new line (blue ballpoint, your handwriting)
  const mine = clamp(st.mine ?? 0);
  if (mine > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(x0, 1540, (x1 - x0) * mine, 180); ctx.clip();
    ctx.font = 'italic 70px Inter700'; ctx.fillStyle = BLUEINK;
    let x = x0 + 140; ['I\'m', 'in', 'the', 'back.'].forEach((w, i) => { ctx.save(); ctx.translate(x, 1650 + Math.sin(i * 1.7) * 9); ctx.rotate((hash(i * 9) - 0.5) * 0.14); ctx.fillText(w, 0, 0); ctx.restore(); x += ctx.measureText(w).width + 24; });
    ctx.restore();
  }
  ctx.restore();
  if (st.dark) darken(ctx, st.dark);
}

// ---------- the two plates: the white car's and your bike's ----------
function drawPlates(ctx, t, st = {}) {
  ctx.fillStyle = '#0b1022'; ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  glow(ctx, 540, 900, 900, 'rgba(120,150,230,A)', 0.25);
  const plate = (y, s, label, k, hl) => {
    ctx.save(); ctx.translate(540, y); ctx.scale(s, s);
    ctx.font = '30px Mono700'; ctx.fillStyle = 'rgba(238,241,247,0.7)'; ctx.textAlign = 'center'; spaced(ctx, label, 0, -110, 5, 'center');
    rrect(ctx, -380, -80, 760, 160, 16); ctx.fillStyle = '#f3f1e6'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#05060c'; ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.rect(-370, -80, 740 * clamp(k), 160); ctx.clip();
    ctx.font = '96px Osw700'; ctx.fillStyle = INK; ctx.textBaseline = 'middle'; ctx.fillText(PLATE, 0, 6); ctx.restore();
    if (hl > 0) { ctx.strokeStyle = C.red; ctx.lineWidth = 10; ctx.beginPath(); ctx.ellipse(0, 0, 440, 130, 0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(hl)); ctx.stroke(); }
    ctx.restore();
  };
  plate(640, 1, 'THE WHITE CAR', st.a ?? 1, 0);
  plate(1080, 1, 'YOUR BIKE', st.b ?? 1, st.hl || 0);
  if (st.eq > 0) { ctx.save(); ctx.globalAlpha = clamp(st.eq); ctx.font = '120px Osw700'; ctx.fillStyle = C.red; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('=', 540, 862); ctx.restore(); }
}

module.exports = { drawForecourt, drawCarRear, drawMeter, drawPumpNote, NOTE_RULES, drawPlates, carSide, backFace, darken, PLATE, RW };
