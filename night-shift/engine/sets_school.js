// NIGHT SHIFT — Episode 5 set painters: the floodlit schoolyard (two-storey school, the bell by the door, the swing set),
// the girl who swings without moving her legs, the watchman's window (the POSTER image: her face rising to the glass at
// the top of the arc), the bell close-up, the night register (rules page + attendance roll). World space 1080x1920,
// same conventions as sets.js / sets_pump.js.
const D = require('./draw');
const { W, H, C, clamp, lerp, inv, E, hash, flicker, rrect, glow, spaced, drawStick } = D;

const SKIN = '#c3c8d4', SKIN_D = '#8a92a6', DRESS = '#8fa6cf', DRESS_D = '#5d74a0', RIB = '#e3242f';
const INK = '#141a36', REDINK = '#c4202c', BLUEINK = '#1d3fa8';
const poly = (ctx, pts, fill) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } };
const mix = (a, b, k) => { const p = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(k)))).join(',')})`; };
const darken = (ctx, a) => { if (a > 0.005) { ctx.fillStyle = `rgba(2,3,8,${a})`; ctx.fillRect(-1500, -1500, W + 3000, H + 3000); } };

// ---------- the girl's face (front), used small on the swing and huge at the window ----------
// o: {smile 0..1, mouth 0..1 (calling), look -1..1}
function girlHead(ctx, o = {}) {
  // plaits with red ribbons
  for (const sx of [-1, 1]) {
    ctx.fillStyle = '#0b0e1c'; ctx.beginPath(); ctx.ellipse(sx * 46, 34, 14, 46, sx * -0.15, 0, 7); ctx.fill();
    ctx.fillStyle = RIB; ctx.beginPath(); ctx.ellipse(sx * 50, 78, 14, 8, 0, 0, 7); ctx.fill();
  }
  ctx.beginPath(); ctx.ellipse(0, 0, 44, 52, 0, 0, 7); ctx.fillStyle = SKIN; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#0b1022'; ctx.stroke();
  const g = ctx.createRadialGradient(-14, -18, 6, 0, 0, 60); g.addColorStop(0, 'rgba(255,255,255,0.28)'); g.addColorStop(1, 'rgba(20,24,50,0.3)'); ctx.fillStyle = g; ctx.fill();
  // fringe + centre parting
  ctx.beginPath(); ctx.ellipse(0, -26, 48, 32, 0, Math.PI, 0); ctx.fillStyle = '#0b0e1c'; ctx.fill();
  ctx.fillStyle = '#0b0e1c'; poly(ctx, [[-46, -26], [46, -26], [40, -10], [10, -16], [0, -8], [-10, -16], [-40, -10]], '#0b0e1c');
  // big hollow eyes with a pinpoint
  for (const ex of [-17, 17]) {
    ctx.beginPath(); ctx.ellipse(ex, 4, 11, 14, 0, 0, 7); ctx.fillStyle = '#05060c'; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.beginPath(); ctx.arc(ex + (o.look || 0) * 3, 5, 2.4, 0, 7); ctx.fill();
  }
  const m = clamp(o.mouth || 0), sm = o.smile ?? 0.5;
  ctx.lineWidth = 3.5; ctx.strokeStyle = '#0b1022';
  if (m > 0.05) { ctx.beginPath(); ctx.ellipse(0, 32, 10, 3 + 10 * m, 0, 0, 7); ctx.fillStyle = '#05060c'; ctx.fill(); ctx.stroke(); }
  else { ctx.beginPath(); ctx.moveTo(-18, 30); ctx.quadraticCurveTo(0, 30 + 14 * sm, 18, 30); ctx.stroke(); }
}

// ---------- the girl seated on a swing. Origin = the seat centre. Legs hang DEAD STRAIGHT (never pump) ----------
function girlOnSwing(ctx, s, o = {}) {
  ctx.save(); ctx.scale(s, s);
  // legs: straight down, together, white socks + black shoes, no bend at the knee
  ctx.fillStyle = SKIN; ctx.fillRect(-20, 4, 16, 120); ctx.fillRect(4, 4, 16, 120);
  ctx.fillStyle = '#eef1f7'; ctx.fillRect(-21, 96, 18, 34); ctx.fillRect(3, 96, 18, 34);
  ctx.fillStyle = '#05060c'; rrect(ctx, -24, 128, 24, 16, 5); ctx.fill(); rrect(ctx, 2, 128, 24, 16, 5); ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = '#0b1022'; ctx.strokeRect(-20, 4, 16, 92); ctx.strokeRect(4, 4, 16, 92);
  // pinafore dress + white collar
  poly(ctx, [[-30, -96], [30, -96], [46, 14], [-46, 14]], DRESS); ctx.lineWidth = 4; ctx.strokeStyle = '#0b1022'; ctx.stroke();
  ctx.fillStyle = DRESS_D; ctx.fillRect(-44, 0, 88, 14);
  poly(ctx, [[-24, -98], [0, -78], [24, -98], [12, -104], [0, -92], [-12, -104]], '#f2f4f8');
  // arms up to the chains
  ctx.strokeStyle = SKIN; ctx.lineWidth = 11; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-28, -88); ctx.lineTo(-38, -60); ctx.lineTo(-40, -120); ctx.moveTo(28, -88); ctx.lineTo(38, -60); ctx.lineTo(40, -120); ctx.stroke();
  // head
  ctx.save(); ctx.translate(0, -150); girlHead(ctx, o); ctx.restore();
  ctx.restore();
}

// ---------- one swing (chains + seat), rotating about its pivot. angle in radians ----------
function swing(ctx, px, py, len, ang, L, girl, gs, o) {
  ctx.save(); ctx.translate(px, py); ctx.rotate(ang);
  ctx.strokeStyle = mix('#2c3350', '#7d869c', L); ctx.lineWidth = 5; ctx.setLineDash([10, 5]);
  ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(-40, len); ctx.moveTo(40, 0); ctx.lineTo(40, len); ctx.stroke(); ctx.setLineDash([]);
  rrect(ctx, -56, len - 4, 112, 16, 5); ctx.fillStyle = mix('#3a1410', '#b3412c', L); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#0b1022'; ctx.stroke();
  if (girl > 0) { ctx.save(); ctx.globalAlpha *= girl; ctx.translate(0, len - 2); girlOnSwing(ctx, gs, o); ctx.restore(); }
  ctx.restore();
}

// ---------- THE SCHOOLYARD (bright floodlight) ----------
// st: {light, a1 (girl's swing angle), a2 (second swing angle), girl 0..1, bell (bell angle), win 0..1 (your window lit),
//      me {...}, face {smile, mouth, look}, dark, gate}
const SW = { x: 540, top: 1010, len: 380, p1: 430, p2: 650 };
function drawYard(ctx, t, st = {}) {
  const L = (st.light ?? 1) * flicker(t, 5, 0.015);
  const sg = ctx.createLinearGradient(0, -600, 0, 900); sg.addColorStop(0, '#060b22'); sg.addColorStop(1, '#17234f');
  ctx.fillStyle = sg; ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  for (let i = 0; i < 30; i++) { const x = hash(i * 5.3) * 2000 - 500, y = hash(i * 3.1) * 400 - 300; ctx.fillStyle = `rgba(230,236,255,${0.3 + 0.5 * hash(i)})`; ctx.fillRect(x, y, 3, 3); }
  ctx.fillStyle = 'rgba(240,240,220,0.9)'; ctx.beginPath(); ctx.arc(880, 120, 34, 0, 7); ctx.fill();
  // the school: two storeys, cream facade
  const fac = mix('#151c3a', '#e6dcc4', L * 0.92), facD = mix('#10162e', '#c9bea4', L * 0.9);
  ctx.fillStyle = fac; ctx.fillRect(-1500, 330, W + 3000, 600);
  ctx.fillStyle = facD; ctx.fillRect(-1500, 330, W + 3000, 40); ctx.fillRect(-1500, 610, W + 3000, 22);
  // sign on the parapet
  rrect(ctx, 250, 268, 580, 76, 10); ctx.fillStyle = mix('#1a2140', '#1f3a7a', L); ctx.fill();
  ctx.font = '40px Osw700'; ctx.fillStyle = mix('#5a5f70', '#ffffff', L); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('GOVT. SCHOOL NO. 13', 540, 308);
  // windows, 2 rows; one upstairs (yours) lit warm
  for (let row = 0; row < 2; row++) for (let i = -3; i < 9; i++) {
    const x = 30 + i * 150, y = row ? 680 : 420, wi = row * 20 + i;
    const mine = row === 0 && i === 4;
    ctx.fillStyle = mine && (st.win ?? 1) > 0 ? mix('#0a0e20', '#ffe3a0', (st.win ?? 1) * L) : mix('#070a18', '#2a3458', L * 0.7);
    ctx.fillRect(x, y, 96, 150);
    ctx.strokeStyle = mix('#10162e', '#7d7360', L); ctx.lineWidth = 6; ctx.strokeRect(x, y, 96, 150);
    ctx.lineWidth = 3; for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(x + k * 24, y); ctx.lineTo(x + k * 24, y + 150); ctx.stroke(); }
    if (mine && st.meWin) { ctx.save(); ctx.beginPath(); ctx.rect(x, y, 96, 150); ctx.clip(); drawStick(ctx, { x: x + 48, y: y + 210, s: 0.36, view: 'front' }); ctx.restore(); }
    if (wi === 7 && row === 1) { /* the door instead */ }
  }
  // the main door (ground floor) + the bell on its bracket beside it
  ctx.fillStyle = mix('#0b1022', '#4a2f22', L); ctx.fillRect(470, 700, 140, 230);
  ctx.strokeStyle = '#0b1022'; ctx.lineWidth = 6; ctx.strokeRect(470, 700, 140, 230);
  bell(ctx, 690, 650, 0.42, st.bell || 0, L);
  // boundary wall + gate (right)
  ctx.fillStyle = mix('#0e1430', '#b5ab95', L * 0.8); ctx.fillRect(-1500, 900, W + 3000, 50);
  // the yard: packed sand, brighter under the floodlight
  const fg = ctx.createLinearGradient(0, 930, 0, 1920); fg.addColorStop(0, mix('#10162e', '#a89a7c', L)); fg.addColorStop(0.5, mix('#141a36', '#c7b994', L)); fg.addColorStop(1, mix('#0b1128', '#8f8366', L));
  ctx.fillStyle = fg; ctx.fillRect(-1500, 940, W + 3000, 2000);
  ctx.fillStyle = 'rgba(60,50,30,0.18)'; for (let i = 0; i < 60; i++) { ctx.fillRect(hash(i * 3.7) * 1400 - 160, 960 + hash(i * 9.1) * 960, 10 + hash(i) * 30, 4); }
  // floodlight pole (left) and its cone
  ctx.fillStyle = mix('#151c3a', '#5d6680', L); ctx.fillRect(60, 380, 26, 1200);
  rrect(ctx, 40, 360, 120, 46, 8); ctx.fillStyle = mix('#151c3a', '#fffbe8', L); ctx.fill();
  if (L > 0.05) { glow(ctx, 110, 400, 260, 'rgba(255,248,225,A)', 0.5 * L); glow(ctx, 520, 1350, 900, 'rgba(255,244,215,A)', 0.2 * L); }
  // shadows of the swing set on the sand
  ctx.fillStyle = 'rgba(30,24,14,0.22)'; ctx.beginPath(); ctx.ellipse(SW.p1 + 40, 1560, 140, 18, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(SW.p2 + 40, 1560, 140, 18, 0, 0, 7); ctx.fill();
  // swing set: A-frames + top bar
  const frame = mix('#1b2140', '#c4202c', L * 0.85);
  ctx.strokeStyle = frame; ctx.lineWidth = 18; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(250, 1580); ctx.lineTo(290, SW.top - 20); ctx.lineTo(330, 1580); ctx.moveTo(750, 1580); ctx.lineTo(790, SW.top - 20); ctx.lineTo(830, 1580); ctx.stroke();
  ctx.lineWidth = 20; ctx.beginPath(); ctx.moveTo(270, SW.top - 10); ctx.lineTo(810, SW.top - 10); ctx.stroke();
  // the swings: hers (left) and the second one (right)
  swing(ctx, SW.p1, SW.top, SW.len, st.a1 || 0, L, st.girl ?? 0, 0.85, st.face || {});
  swing(ctx, SW.p2, SW.top, SW.len, st.a2 || 0, L, 0, 0.85, {});
  if (st.ring2 > 0) { ctx.save(); ctx.globalAlpha = clamp(st.ring2); ctx.setLineDash([16, 12]); ctx.strokeStyle = C.red; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(SW.p2, SW.top + SW.len, 150, 90, 0, 0, 7); ctx.stroke(); ctx.restore(); }
  if (st.me) drawStick(ctx, { ...st.me, lit: st.me.lit ?? 0 });
  if (st.dark) darken(ctx, st.dark);
}

// ---------- the brass bell on its wall bracket. Origin = the bracket's hinge ----------
function bell(ctx, x, y, s, ang, L) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = mix('#151c3a', '#3a4469', L); ctx.fillRect(-14, -40, 120, 26); ctx.fillRect(-14, -40, 26, 120);
  ctx.translate(70, -14); ctx.rotate(ang);
  ctx.strokeStyle = '#0b1022'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 30); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-26, 40); ctx.quadraticCurveTo(-30, 120, -78, 150); ctx.lineTo(78, 150); ctx.quadraticCurveTo(30, 120, 26, 40); ctx.closePath();
  ctx.fillStyle = mix('#3a2a10', '#d9a83a', L); ctx.fill(); ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(-16, 50, 10, 80);
  ctx.beginPath(); ctx.arc(Math.sin(ang * 3) * 20, 160, 16, 0, 7); ctx.fillStyle = '#20263e'; ctx.fill();
  ctx.restore();
}

// ---------- the bell close-up (cream wall, the rope hangs untouched, count badge) ----------
function drawBell(ctx, t, st = {}) {
  ctx.fillStyle = '#d9cfb6'; ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  ctx.fillStyle = 'rgba(120,100,70,0.18)'; for (let y = -200; y < 2200; y += 110) ctx.fillRect(-1500, y, W + 3000, 4);
  glow(ctx, 540, 700, 700, 'rgba(255,248,225,A)', 0.4);
  const ang = st.ang || 0;
  // the rope (hangs perfectly still: nobody is pulling it)
  ctx.strokeStyle = '#7a5a34'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(540 + Math.sin(ang) * 260, 1060); ctx.lineTo(540, 1700); ctx.stroke();
  ctx.save(); ctx.translate(-30, 300); bell(ctx, 380, 300, 2.6, ang, 1); ctx.restore();
  if (st.count > 0) {
    const n = Math.min(13, Math.floor(st.count));
    const pop = 1 + 0.25 * Math.exp(-(st.count - n) * 6);
    ctx.save(); ctx.translate(540, 1270); ctx.scale(pop, pop);
    rrect(ctx, -200, -90, 400, 180, 24); ctx.fillStyle = n >= 13 ? C.red : 'rgba(11,16,34,0.9)'; ctx.fill();
    ctx.font = '130px Osw700'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(`${n}/13`, 0, 8);
    ctx.restore();
  }
  if (st.dark) darken(ctx, st.dark);
}

// ---------- the watchman's window, from inside the dark classroom ----------
// st: {rise 0..1 (her face up to the glass), smile, mouth, look, a1 (outside swing angle), girl, me {..}, light, out 0..1, a2}
const WIN = { x0: 150, x1: 930, y0: 330, y1: 1230 };
function drawWindow(ctx, t, st = {}) {
  const L = (st.light ?? 1);
  // classroom wall
  ctx.fillStyle = '#0d1330'; ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  // the outside, seen down from the 2nd floor (the yard, scaled)
  ctx.save(); ctx.beginPath(); ctx.rect(WIN.x0, WIN.y0, WIN.x1 - WIN.x0, WIN.y1 - WIN.y0); ctx.clip();
  ctx.save(); ctx.translate(540, 780); ctx.scale(0.9, 0.9); ctx.translate(-540, -1250);
  drawYard(ctx, t, { light: L, a1: st.a1 || 0, a2: st.a2 || 0, girl: st.girl ?? 1, win: 0, face: { smile: st.smile, look: st.look } });
  ctx.restore();
  // HER, at the top of the arc: rising into the pane, chains running up out of frame
  const r = clamp(st.rise || 0);
  if (r > 0) {
    const fy = lerp(1500, 760, E.out(r));
    ctx.save(); ctx.translate(540, fy);
    ctx.strokeStyle = '#7d869c'; ctx.lineWidth = 10; ctx.setLineDash([18, 9]);
    ctx.beginPath(); ctx.moveTo(-210, -900); ctx.lineTo(-200, 420); ctx.moveTo(210, -900); ctx.lineTo(200, 420); ctx.stroke(); ctx.setLineDash([]);
    glow(ctx, 0, 0, 460, 'rgba(200,215,255,A)', 0.35);
    // shoulders + collar + hands on the chains
    poly(ctx, [[-170, 260], [-120, 170], [120, 170], [170, 260], [190, 600], [-190, 600]], DRESS); ctx.lineWidth = 8; ctx.strokeStyle = '#0b1022'; ctx.stroke();
    poly(ctx, [[-80, 172], [0, 236], [80, 172], [40, 150], [0, 196], [-40, 150]], '#f2f4f8');
    for (const hx of [-202, 202]) { ctx.fillStyle = SKIN; ctx.beginPath(); ctx.ellipse(hx, 120, 30, 38, 0, 0, 7); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#0b1022'; ctx.stroke(); }
    ctx.scale(3.1, 3.1); girlHead(ctx, { smile: st.smile ?? 0.7, mouth: st.mouth || 0, look: st.look || 0 });
    ctx.restore();
  }
  // glass sheen
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; poly(ctx, [[260, 1230], [520, 330], [580, 330], [320, 1230]]); ctx.fill();
  ctx.restore();
  // frame + grille bars (her face sits between them)
  ctx.strokeStyle = '#2a3253'; ctx.lineWidth = 34; ctx.strokeRect(WIN.x0, WIN.y0, WIN.x1 - WIN.x0, WIN.y1 - WIN.y0);
  ctx.strokeStyle = '#1b2140'; ctx.lineWidth = 12;
  for (const bx of [300, 780]) { ctx.beginPath(); ctx.moveTo(bx, WIN.y0); ctx.lineTo(bx, WIN.y1); ctx.stroke(); }
  ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(WIN.x0, 780); ctx.lineTo(300, 780); ctx.moveTo(780, 780); ctx.lineTo(WIN.x1, 780); ctx.stroke();
  // sill + desk edge, chalk board corner
  ctx.fillStyle = '#20284a'; ctx.fillRect(100, 1240, 880, 50);
  ctx.fillStyle = '#0f2a22'; ctx.fillRect(-1500, 1380, 400, 600);
  // cold light spill from the window onto the floor
  glow(ctx, 540, 1500, 700, 'rgba(160,190,255,A)', 0.12 * L);
  if (st.me) drawStick(ctx, { ...st.me, lit: st.me.lit ?? 0 });
  if (st.dark) darken(ctx, st.dark);
}

// ---------- the night register: page 1 = the rules ----------
const NOTE_RULES = [
  { y: 640, lines: ['When the bell rings', 'at three, LET IT RING.'] },
  { y: 880, lines: ['If the swing moves,', 'STAY INSIDE.'] },
  { y: 1120, lines: ['If she calls the roll,', 'never answer "present".'] },
];
function page(ctx, title, sub) {
  const g = ctx.createLinearGradient(0, -600, 0, H + 600); g.addColorStop(0, '#3a2a22'); g.addColorStop(1, '#5a4030');
  ctx.fillStyle = g; ctx.fillRect(-600, -600, W + 1200, H + 1200);
  const x0 = 120, x1 = 960, y0 = 210, y1 = 1780;
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  ctx.fillStyle = '#efe6c8'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.fillStyle = '#7a1e24'; ctx.fillRect(x0 - 30, y0, 30, y1 - y0);
  ctx.fillStyle = 'rgba(70,100,170,0.22)'; for (let y = y0 + 160; y < y1 - 30; y += 66) ctx.fillRect(x0 + 10, y, x1 - x0 - 20, 2);
  ctx.fillStyle = 'rgba(200,60,70,0.4)'; ctx.fillRect(x0 + 110, y0, 3, y1 - y0);
  ctx.fillStyle = INK; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'center';
  ctx.font = '76px Osw700'; ctx.fillText(title, 540, 360);
  ctx.font = '36px Osw600'; spaced(ctx, sub, 540, 424, 7, 'center');
  ctx.fillRect(300, 448, 480, 5);
  return { x0, x1, y0, y1 };
}
function drawRules(ctx, t, st = {}) {
  ctx.save(); ctx.translate(540, 960); ctx.rotate(-0.012); ctx.translate(-540, -960);
  const { x0, x1 } = page(ctx, 'NIGHT REGISTER', 'SCHOOL NO. 13 · WATCHMAN');
  ctx.textAlign = 'left';
  NOTE_RULES.forEach((r, i) => {
    const hl = st.hl === i ? clamp(st.hlA ?? 1) : 0;
    if (hl > 0) { ctx.save(); ctx.globalAlpha = 0.55; ctx.fillStyle = C.lime; ctx.fillRect(x0 + 20, r.y - 56, 800 * hl, r.lines.length * 70 + 6); ctx.restore(); }
    ctx.globalAlpha = (st.dim > 0 && st.hl !== i) ? 1 - 0.55 * st.dim : 1;
    ctx.fillStyle = INK; ctx.font = '72px Osw700'; ctx.fillText(`${i + 1}.`, x0 + 20, r.y + 4);
    ctx.font = '50px Inter600';
    r.lines.forEach((ln, k) => { ctx.fillStyle = /[A-Z]{4,}|present/.test(ln) ? REDINK : INK; ctx.fillText(ln, x0 + 140, r.y + k * 70); });
    ctx.globalAlpha = 1;
  });
  const so = clamp(st.last ?? 1);
  if (so > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(x0, 1330, (x1 - x0) * so, 140); ctx.clip();
    ctx.font = '60px Inter700'; ctx.fillStyle = REDINK;
    let x = x0 + 130; ['She', 'marked', 'me', 'present.'].forEach((w, i) => { ctx.save(); ctx.translate(x, 1420 + Math.sin(i * 2.1) * 7); ctx.rotate((hash(i * 4) - 0.5) * 0.1); ctx.fillText(w, 0, 0); ctx.restore(); x += ctx.measureText(w).width + 20; });
    ctx.restore();
    ctx.font = '46px Inter700'; ctx.fillStyle = INK; ctx.fillText('— R.', x1 - 200, 1520);
  }
  ctx.restore();
  if (st.dark) darken(ctx, st.dark);
}

// ---------- the night register: the attendance roll ----------
// st: {call (float row index being called, -1 none), her 0..1 (her row highlight + SINCE 1998), mine 0..1 (your row), tick 0..1, nights}
const KIDS = ['ANITA R.', 'BILAL K.', 'CHITRA M.', 'DEV P.', 'FARAH S.', 'GOPI N.', 'MEERA S.'];
const ROW0 = 600, RH = 120, COLS = 9;
function drawRoll(ctx, t, st = {}) {
  ctx.save(); ctx.translate(540, 960); ctx.rotate(0.01); ctx.translate(-540, -960);
  const { x0, x1 } = page(ctx, 'NIGHT ATTENDANCE', 'CALLED AT 3:00 AM');
  // date columns
  ctx.font = '22px Mono700'; ctx.fillStyle = 'rgba(20,26,54,0.6)'; ctx.textAlign = 'center';
  for (let c = 0; c < COLS; c++) ctx.fillText(c < COLS - 1 ? `${13 + c}/11` : '21/11', 560 + c * 44, 520);
  ctx.strokeStyle = 'rgba(20,26,54,0.25)'; ctx.lineWidth = 2; for (let c = 0; c <= COLS; c++) { ctx.beginPath(); ctx.moveTo(538 + c * 44, 540); ctx.lineTo(538 + c * 44, ROW0 + RH * 8 - 30); ctx.stroke(); }
  const rows = [...KIDS, 'SAM · WATCHMAN'];
  rows.forEach((name, i) => {
    const y = ROW0 + i * RH;
    const mine = i === rows.length - 1, her = i === rows.length - 2;
    if (mine && !(st.mine > 0)) return;
    ctx.save(); if (mine) ctx.globalAlpha = clamp(st.mine);
    const called = st.call != null && st.call >= i && st.call < i + 1;
    if (called) { ctx.fillStyle = 'rgba(198,255,58,0.5)'; ctx.fillRect(x0 + 16, y - 50, 400 * clamp((st.call - i) * 3), 70); }
    if (her && st.her > 0) { ctx.fillStyle = `rgba(255,51,71,${0.25 * clamp(st.her)})`; ctx.fillRect(x0 + 16, y - 52, x1 - x0 - 32, 76); }
    ctx.textAlign = 'left'; ctx.font = mine ? 'italic 46px Inter700' : '46px Inter600'; ctx.fillStyle = mine ? BLUEINK : (her ? REDINK : INK);
    ctx.fillText(`${i + 1}. ${name}`, x0 + 24, y);
    // ticks
    ctx.font = '40px Inter700'; ctx.textAlign = 'center';
    for (let c = 0; c < COLS; c++) {
      let mark = '';
      if (her) mark = '✓';
      else if (mine) mark = c === COLS - 1 && (st.tick ?? 0) > 0 ? '✓' : '';
      else mark = hash(i * 13 + c) > 0.6 ? '✓' : '·';
      if (!mark) continue;
      ctx.save(); if (mine) ctx.globalAlpha *= clamp(st.tick ?? 0);
      ctx.fillStyle = her || mine ? REDINK : 'rgba(20,26,54,0.55)'; ctx.fillText(mark, 560 + c * 44, y);
      ctx.restore();
    }
    ctx.restore();
  });
  // her row: since 1998
  if (st.her > 0) {
    const y = ROW0 + 6 * RH;
    ctx.save(); ctx.globalAlpha = clamp(st.her);
    ctx.strokeStyle = C.red; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(540, y - 14, 440, 70, -0.02, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(st.her)); ctx.stroke();
    ctx.restore();
  }
  if (st.since > 0) {
    ctx.save(); ctx.globalAlpha = clamp(st.since); ctx.translate(560, 1560); ctx.rotate(-0.06); const s = lerp(1.4, 1, E.outBack(clamp(st.since))); ctx.scale(s, s);
    rrect(ctx, -330, -80, 660, 160, 18); ctx.lineWidth = 10; ctx.strokeStyle = REDINK; ctx.stroke();
    ctx.font = '50px Osw700'; ctx.fillStyle = REDINK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('MEERA S. · PRESENT', 0, -26); ctx.font = '40px Mono700'; ctx.fillText(`EVERY NIGHT SINCE 1998`, 0, 36);
    ctx.restore();
  }
  ctx.restore();
  if (st.dark) darken(ctx, st.dark);
}

module.exports = { drawYard, drawWindow, drawBell, drawRules, drawRoll, NOTE_RULES, SW, WIN, ROW0, RH, girlOnSwing };
