// NIGHT SHIFT — Episode 2 set painters: the sleeper coach, the chart + handover note, the tally counter,
// the passenger hanging upside down from the top berth, your seat (berth 73). World space 1080x1920.
const D = require('./draw');
const { W, H, C, clamp, lerp, inv, E, hash, noise1, flicker, rrect, glow, spaced, drawStick } = D;

const INK = '#141a36', REDINK = '#c4102a';
const SKIN = '#c9d2e2', SKIN_D = '#98a4bd';
const poly = (ctx, pts, fill) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); };
const mix = (a, b, k) => { const p = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`; };
const darken = (ctx, a) => { if (a > 0.005) { ctx.fillStyle = `rgba(2,3,8,${a})`; ctx.fillRect(-1500, -1500, W + 3000, H + 3000); } };

// ---------- perspective coach ----------
const VX = 540, VY = 860;
const P = (X, Y, d) => [VX + X / d, VY + Y / d];
const AL = -260, AR = 200, WALL_R = 520, FL = 700, CE = -760, OUT = -1100;
const Y_LOW = 380, Y_MID = -60, Y_UP = -470;
const BAYS = [0.62, 1.95, 3.3, 4.65, 6.0, 7.35, 8.7];
const BAY_LEN = 1.35;
const HANG_BAY = 0;  // the hanger's upper berth (stack B of bay 1)
const pal = (L, night) => ({
  wall: mix('#d9dde3', '#1d2a4e', night), wall2: mix('#c3cad4', '#16213f', night), panel: mix('#e8e6dc', '#223056', night),
  ceil: mix('#eef1f4', '#1a2546', night), floor: mix('#7d8796', '#0e1428', night), floor2: mix('#6b7483', '#0b1022', night),
  berth: mix('#2d4f9e', '#16275a', night), berthE: mix('#1f3a7a', '#0f1c44', night), metal: mix('#a9b2bf', '#33405f', night),
  blankets: ['#f2efe6', '#b23a48', '#d8dce4', '#8a6f5a', '#e7d6b0'].map(c => mix(c, '#2a3866', night * 0.8)),
});

function berthSlab(ctx, Y, a, b, col, colE, seed, st, opts = {}) {
  // end face (towards the aisle) + the top face (below eye) or underside (above eye)
  const th = 46;
  if (Y > 0) poly(ctx, [P(AL, Y, a), P(OUT, Y, a), P(OUT, Y, b), P(AL, Y, b)], col);
  else poly(ctx, [P(AL, Y + th, a), P(OUT, Y + th, a), P(OUT, Y + th, b), P(AL, Y + th, b)], colE);
  poly(ctx, [P(AL, Y, a), P(AL, Y, b), P(AL, Y + th, b), P(AL, Y + th, a)], colE);
  // the occupant: a blanket lump or a pair of feet at the aisle end
  if (opts.empty) return;
  const k = hash(seed * 7.3);
  const bl = st.p.blankets[Math.floor(hash(seed * 3.1) * st.p.blankets.length)];
  const m = (a + b) / 2;
  if (Y > 0 || k > 0.5) {
    const [x0, y0] = P(AL - 40, Y - (Y > 0 ? 34 : 0), m); const r = 120 / m;
    if (Y > 0) { ctx.fillStyle = bl; ctx.beginPath(); ctx.ellipse(x0 - r * 0.9, y0, r * 1.1, r * 0.4, 0, Math.PI, 0); ctx.fill(); }
    if (k > 0.45) { // feet
      ctx.fillStyle = mix('#e9dccb', '#3a4670', st.night * 0.8);
      const [fx, fy] = P(AL - 12, Y - (Y > 0 ? 24 : -20), m);
      ctx.beginPath(); ctx.ellipse(fx, fy, 9 / m * 2, 15 / m * 2, 0.15, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(fx + 3 / m, fy + 26 / m * 1.2, 9 / m * 2, 15 / m * 2, 0.15, 0, 7); ctx.fill();
    }
  }
  if (Y < 0) { // a blanket corner hanging over the edge of a high berth
    const [x0, y0] = P(AL, Y + th, a + (b - a) * 0.3), [x1, y1] = P(AL, Y + th, a + (b - a) * 0.75);
    poly(ctx, [[x0, y0], [x1, y1], [x1 - 2, y1 + 40 / m], [x0 + 4, y0 + 56 / m]], bl);
  }
}

// arms (and, with full>0, the whole man) hanging from the upper berth of stack B in bay HANG_BAY
function hangerInCoach(ctx, t, st) {
  const z = BAYS[HANG_BAY] + 0.95, m = z + 0.22;
  const sw = Math.sin(t * 1.3) * 6 * (st.sway ?? 1);
  const [ax, ay] = P(AL - 10, Y_UP + 46, m);
  const s = 1 / m;
  ctx.save(); ctx.translate(ax, ay); ctx.scale(s, s);
  const full = st.full || 0;
  const skin = mix(SKIN, '#55648c', st.night * 0.6);
  const armsDraw = () => {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const reach = full > 0 ? 800 : 620;
  for (const pass of [0, 1]) {
    ctx.strokeStyle = pass ? skin : '#0b1022';
    for (const [ox, ph] of [[-46, 0], [46, 1.7]]) {
      const dx = Math.sin(t * 1.1 + ph) * 14 + sw;
      const x0 = full > 0 ? ox * 1.8 + sw : ox, y0 = full > 0 ? 280 : 0, x1 = full > 0 ? ox * 2.7 + dx : ox * 1.2 + dx;
      ctx.lineWidth = pass ? 30 : 42;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + x1) / 2, (y0 + reach) / 2, x1, reach); ctx.stroke();
      ctx.lineWidth = pass ? 9 : 17;
      for (let f = -2; f <= 2; f++) { ctx.beginPath(); ctx.moveTo(x1 + f * 8, reach + 6); ctx.lineTo(x1 + f * 11, reach + 70 + Math.abs(f) * -8); ctx.stroke(); }
    }
  }
  };
  armsDraw();
  if (full > 0) {
    // the body: hips hooked in the berth, torso hangs down into the aisle, face at eye level
    ctx.globalAlpha = 1;
    poly(ctx, [[-70, -10], [70, -10], [80 + sw, 300], [-60 + sw, 300]], mix('#d6d9de', '#3a4670', st.night * 0.7)); // white vest
    ctx.fillStyle = skin; ctx.fillRect(-26 + sw, 296, 52, 50);
    ctx.save(); ctx.translate(10 + sw, 420); ctx.rotate(Math.PI);
    headUpside(ctx, t, { smile: st.smile || 0, skin, night: st.night });
    ctx.restore();
  }
  ctx.restore();
}

// the head drawn upright (caller rotates by PI): wide smile reads upside down
function headUpside(ctx, t, st) {
  ctx.strokeStyle = 'rgba(223,232,255,0.85)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(0, 0, 80, 100, 0, 0, 7); ctx.stroke();
  ctx.fillStyle = st.skin || SKIN; ctx.beginPath(); ctx.ellipse(0, 0, 78, 98, 0, 0, 7); ctx.fill();
  const sh = ctx.createLinearGradient(0, -98, 0, 98); sh.addColorStop(0, 'rgba(20,30,60,0.35)'); sh.addColorStop(0.6, 'rgba(20,30,60,0)'); ctx.fillStyle = sh; ctx.beginPath(); ctx.ellipse(0, 0, 78, 98, 0, 0, 7); ctx.fill();
  // short black hair; after the flip it hangs toward the floor
  ctx.fillStyle = '#262d48'; ctx.beginPath(); ctx.ellipse(0, -52, 80, 50, 0, Math.PI, 0); ctx.quadraticCurveTo(0, -70, -80, -52); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#262d48'; ctx.lineWidth = 7; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(-64 + i * 16, -84); ctx.quadraticCurveTo(-66 + i * 16, -130, -68 + i * 16 + Math.sin(t * 2 + i) * 5, -170 - (i % 3) * 14); ctx.stroke(); }
  // wide-open eyes, tiny pupils
  for (const ex of [-32, 32]) {
    ctx.fillStyle = '#556080'; ctx.beginPath(); ctx.ellipse(ex, 2, 25, 18, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#f6f8fc'; ctx.beginPath(); ctx.ellipse(ex, 4, 17, 13, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#0a0d18'; ctx.beginPath(); ctx.arc(ex + Math.sin(t * 0.7) * 2, 4, 3.5, 0, 7); ctx.fill();
  }
  ctx.strokeStyle = SKIN_D; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(4, 12); ctx.lineTo(10, 40); ctx.lineTo(0, 44); ctx.stroke();
  const g = clamp(st.smile || 0), w = lerp(22, 62, g), dip = lerp(4, 26, g);
  ctx.fillStyle = '#0a0d18'; ctx.strokeStyle = '#3d4a70'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-w, 62); ctx.quadraticCurveTo(0, 62 + dip * 2.0, w, 62); ctx.quadraticCurveTo(0, 62 + dip * 0.7, -w, 62); ctx.closePath(); ctx.fill(); ctx.stroke();
  if (g > 0.2) { ctx.strokeStyle = '#e9ecf2'; ctx.lineWidth = 2.5; const n = 12; for (let i = 1; i < n; i++) { const u = i / n, x = lerp(-w, w, u), k = 4 * u * (1 - u); ctx.beginPath(); ctx.moveTo(x, 62 + dip * 0.7 * k); ctx.lineTo(x, 62 + dip * 1.4 * k); ctx.stroke(); } }
}

// st: {light 0..1, night 0..1 (blue night lamp), hanger: 0 | 'arms' | 'full', smile, station 0..1 (platform light in the windows),
//      dark 0..1, emptyHang (no hanger), me {d, x, view, arm, ...}, seat73 0..1}
function drawCoach(ctx, t, st = {}) {
  const night = st.night || 0, L = (st.light ?? 1) * flicker(t, 5, 0.025);
  const p = pal(L, night); st = { ...st, p, night };
  // far background
  ctx.fillStyle = p.wall2; ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  // ceiling + floor planes
  poly(ctx, [P(OUT, CE, 0.4), P(WALL_R, CE, 0.4), P(WALL_R, CE, 12), P(OUT, CE, 12)], p.ceil);
  poly(ctx, [P(OUT, FL, 0.4), P(WALL_R, FL, 0.4), P(WALL_R, FL, 12), P(OUT, FL, 12)], p.floor);
  for (let d = 0.6; d < 12; d *= 1.18) { const [x0, y] = P(AL, FL, d), [x1] = P(AR, FL, d); ctx.fillStyle = p.floor2; ctx.fillRect(x0, y, x1 - x0, Math.max(1, 5 / d)); }
  // the far door
  { const [x0, y0] = P(AL, CE + 40, 11), [x1, y1] = P(AR + 60, FL, 11); ctx.fillStyle = mix('#8d97a6', '#141c38', night); ctx.fillRect(x0, y0, x1 - x0, y1 - y0); ctx.fillStyle = st.station ? '#ffd27a' : '#0a1230'; ctx.fillRect(x0 + (x1 - x0) * 0.3, y0 + (y1 - y0) * 0.2, (x1 - x0) * 0.4, (y1 - y0) * 0.25); }
  // right wall + windows + side berths
  poly(ctx, [P(WALL_R, CE, 0.4), P(WALL_R, CE, 11), P(WALL_R, FL, 11), P(WALL_R, FL, 0.4)], p.wall);
  for (let i = BAYS.length - 1; i >= 0; i--) {
    const z = BAYS[i];
    const wa = z + 0.25, wb = z + 1.1;
    const outside = st.station ? mix('#f6c86a', '#ffe2a0', noise1(t * 3 + i)) : '#0a1230';
    poly(ctx, [P(WALL_R, -300, wa), P(WALL_R, -300, wb), P(WALL_R, 140, wb), P(WALL_R, 140, wa)], outside);
    if (!st.station && st.dark === undefined) { // passing lights
      const ph = (t * 0.7 + hash(i * 3)) % 1; const k = wa + (wb - wa) * ph;
      const [lx, ly] = P(WALL_R, -80, k); glow(ctx, lx, ly, 60 / k, 'rgba(255,220,160,A)', 0.5);
    }
    // side berths (lengthwise)
    for (const [Y, below] of [[Y_LOW, true], [Y_UP + 60, false]]) {
      const a = z + 0.05, b = z + 1.3;
      if (below) poly(ctx, [P(AR, Y, a), P(WALL_R, Y, a), P(WALL_R, Y, b), P(AR, Y, b)], p.berth);
      else poly(ctx, [P(AR, Y + 46, a), P(WALL_R, Y + 46, a), P(WALL_R, Y + 46, b), P(AR, Y + 46, b)], p.berthE);
      poly(ctx, [P(AR, Y, a), P(AR, Y, b), P(AR, Y + 46, b), P(AR, Y + 46, a)], p.berthE);
      const bl = p.blankets[(i * 2 + (below ? 1 : 0)) % p.blankets.length];
      if (below || hash(i) > 0.4) { const [x0, y0] = P(AR + 140, Y + (below ? -30 : 46), z + 0.7); ctx.fillStyle = bl; ctx.beginPath(); ctx.ellipse(x0, y0, 150 / (z + 0.7), 42 / (z + 0.7), 0, below ? Math.PI : 0, below ? 0 : Math.PI); ctx.fill(); }
    }
    // berth number plates on the right wall (the seat-73 plate is drawn by drawSeat)
  }
  // ceiling tube lights
  for (let i = BAYS.length - 1; i >= 0; i--) {
    const z = BAYS[i] + 0.7;
    const [x0, y0] = P(-120, CE + 6, z), [x1, y1] = P(80, CE + 30, z);
    ctx.fillStyle = night > 0.5 ? '#253462' : `rgba(${Math.round(lerp(60, 250, L))},${Math.round(lerp(70, 252, L))},255,1)`; ctx.fillRect(x0, y0, x1 - x0, Math.max(2, y1 - y0));
    if (L > 0.2 && night < 0.5) glow(ctx, (x0 + x1) / 2, y1, 300 / z, 'rgba(225,240,255,A)', 0.35 * L);
    if (night > 0) { const [nx, ny] = P(-20, CE + 30, z); glow(ctx, nx, ny, 160 / z, 'rgba(60,110,255,A)', 0.55 * night); ctx.fillStyle = '#4f7dff'; ctx.beginPath(); ctx.arc(nx, ny, 9 / z + 2, 0, 7); ctx.fill(); }
  }
  // left: bays far -> near
  for (let i = BAYS.length - 1; i >= 0; i--) {
    const z = BAYS[i];
    const zb = z + BAY_LEN;
    // partition behind stack B
    poly(ctx, [P(AL, CE, zb), P(OUT, CE, zb), P(OUT, FL, zb), P(AL, FL, zb)], p.panel);
    // stack B (z+0.85 .. z+1.3) and stack A (z+0.05 .. z+0.5)
    for (const [a, b, sk] of [[z + 0.85, z + 1.3, 1], [z + 0.05, z + 0.5, 0]]) {
      for (const [Y, lv] of [[Y_UP, 2], [Y_MID, 1], [Y_LOW, 0]]) {
        const isHang = i === HANG_BAY && sk === 1 && lv === 2;
        berthSlab(ctx, Y, a, b, p.berth, p.berthE, i * 13 + sk * 5 + lv, st, { empty: isHang });
      }
      // the steel ladder at the aisle end of stack A
      if (sk === 0) { const [lx0, ly0] = P(AL + 6, Y_UP, a + 0.1), [, ly1] = P(AL + 6, FL, a + 0.1); ctx.fillStyle = p.metal; ctx.fillRect(lx0 - 3 / a, ly0, 6 / a + 1, ly1 - ly0); }
    }
    if (i === HANG_BAY && st.hanger && !st.emptyHang) hangerInCoach(ctx, t, { ...st, full: st.hanger === 'full' ? 1 : 0 });
    // partition in front of stack A (the bay edge, seen as a slim panel edge)
    const [ex0, ey0] = P(AL, CE, z), [, ey1] = P(AL, FL, z);
    ctx.fillStyle = p.panel; ctx.fillRect(ex0 - 24 / z, ey0, 24 / z, ey1 - ey0);
    ctx.fillStyle = mix('#b8bcc4', '#101830', night); ctx.fillRect(ex0 - 2, ey0, 3, ey1 - ey0);
  }
  // you, standing in the aisle
  if (st.me) {
    const m = st.me, d = m.d ?? 1.6;
    const [gx, gy] = P(m.x ?? -20, FL, d);
    drawTTE(ctx, gx, gy, 2.05 / d, m, night);
  }
  if (st.dark) darken(ctx, st.dark);
}

function drawTTE(ctx, x, y, s, m = {}, night = 0) {
  drawStick(ctx, { x, y, s, view: m.view || 'back', arm: m.arm || 'down', color: night > 0.5 ? '#dfe8ff' : '#1a2140', fill: night > 0.5 ? '#0b1022' : '#f2f5f8', headDX: m.headDX || 0, headDY: m.headDY || 0 });
  // black TTE blazer + the clipboard
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#0d1020'; ctx.strokeStyle = night > 0.5 ? '#dfe8ff' : '#1a2140'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-42, -282); ctx.lineTo(42, -282); ctx.lineTo(58, -146); ctx.lineTo(-58, -146); ctx.closePath(); ctx.fill(); ctx.stroke();
  if (m.view === 'front') { ctx.fillStyle = '#e9eef5'; poly(ctx, [[-12, -282], [12, -282], [0, -230]], '#e9eef5'); rrect(ctx, 12, -262, 28, 14, 3); ctx.fillStyle = '#d7b24a'; ctx.fill(); }
  if (m.board !== false) { ctx.save(); ctx.translate(m.view === 'front' ? 44 : -46, -196); ctx.rotate(m.view === 'front' ? -0.2 : 0.2); rrect(ctx, -30, -40, 60, 80, 6); ctx.fillStyle = '#7a5a36'; ctx.fill(); ctx.fillStyle = '#f2efe6'; ctx.fillRect(-24, -30, 48, 64); ctx.restore(); }
  ctx.restore();
}

// ---------- the chart on its clipboard + the handover note ----------
function boardBG(ctx, night = 0) {
  const g = ctx.createLinearGradient(0, -600, 0, H + 600); g.addColorStop(0, mix('#2d4f9e', '#101c44', night)); g.addColorStop(1, mix('#22407f', '#0b1533', night));
  ctx.fillStyle = g; ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 3; for (let y = -600; y < H + 600; y += 60) { ctx.beginPath(); ctx.moveTo(-1500, y); ctx.lineTo(W + 1500, y); ctx.stroke(); }
}
const NAMES = ['R. MEHTA', 'A. KHAN', 'P. IYER', 'S. DAS', 'L. GOMES', 'V. RAO', 'N. JOSHI', 'K. PILLAI', 'T. SEN', 'M. NAIR', 'D. SHAH', 'J. DSOUZA'];
const CH = { x0: 120, x1: 960, y0: 160, y1: 1800 };
// st: {hl72 0..1, newLine 0..1, ring73 0..1, night}
function drawChart(ctx, t, st = {}) {
  boardBG(ctx, st.night || 0);
  ctx.save(); ctx.translate(540, 960); ctx.rotate(-0.015); ctx.translate(-540, -960);
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 34; ctx.shadowOffsetY = 14;
  rrect(ctx, CH.x0 - 30, CH.y0 - 40, CH.x1 - CH.x0 + 60, CH.y1 - CH.y0 + 70, 20); ctx.fillStyle = '#7a5a36'; ctx.fill();
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.fillStyle = '#f4f1e6'; ctx.fillRect(CH.x0, CH.y0, CH.x1 - CH.x0, CH.y1 - CH.y0);
  rrect(ctx, 400, CH.y0 - 70, 280, 90, 14); ctx.fillStyle = '#b9c0cc'; ctx.fill(); ctx.fillStyle = '#7d8696'; ctx.fillRect(430, CH.y0 - 40, 220, 14);
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'center'; ctx.fillStyle = INK;
  ctx.font = '50px Osw700'; ctx.fillText('RESERVATION CHART', 540, CH.y0 + 90);
  ctx.font = '26px Mono700'; spaced(ctx, 'COACH S7 · SLEEPER · 72 BERTHS', 540, CH.y0 + 136, 3, 'center');
  ctx.fillRect(CH.x0 + 30, CH.y0 + 160, CH.x1 - CH.x0 - 60, 4);
  ctx.textAlign = 'left';
  const row0 = CH.y0 + 220, rh = 52;
  for (let r = 0; r < 26; r++) {
    const n = r < 23 ? 50 + r : 0; if (r >= 23) break;
    const y = row0 + r * rh;
    ctx.fillStyle = r % 2 ? 'rgba(20,26,54,0.04)' : 'rgba(20,26,54,0)'; ctx.fillRect(CH.x0 + 20, y - 38, CH.x1 - CH.x0 - 40, rh);
    ctx.fillStyle = INK; ctx.font = '34px Mono700'; ctx.fillText(String(n), CH.x0 + 40, y);
    ctx.font = '32px Mono500'; ctx.fillText(NAMES[(n * 7) % NAMES.length], CH.x0 + 150, y);
    ctx.fillText(['LB', 'MB', 'UB', 'LB', 'MB', 'UB', 'SL', 'SU'][n % 8], CH.x1 - 260, y);
    ctx.fillStyle = 'rgba(20,26,54,0.5)'; ctx.fillText('✓', CH.x1 - 110, y);
  }
  const y72 = row0 + 22 * rh;
  const h72 = clamp(st.hl72 || 0);
  if (h72 > 0) { ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = C.lime; ctx.fillRect(CH.x0 + 20, y72 - 40, (CH.x1 - CH.x0 - 40) * h72, rh); ctx.restore(); }
  // end-of-chart rule
  ctx.fillStyle = INK; ctx.fillRect(CH.x0 + 30, y72 + 26, CH.x1 - CH.x0 - 60, 4);
  ctx.font = '26px Mono700'; ctx.fillStyle = 'rgba(20,26,54,0.6)'; spaced(ctx, '— END OF CHART · 72 —', 540, y72 + 70, 3, 'center');
  // the new line, written in red under the end of the chart
  const nl = clamp(st.newLine || 0);
  if (nl > 0) {
    const y = y72 + 150;
    ctx.save(); ctx.beginPath(); ctx.rect(CH.x0, y - 70, (CH.x1 - CH.x0) * nl, 110); ctx.clip();
    ctx.fillStyle = REDINK; ctx.font = '62px Osw700'; ctx.textAlign = 'left'; ctx.fillText('73', CH.x0 + 36, y);
    ctx.font = '58px Inter700'; ctx.save(); ctx.translate(CH.x0 + 160, y); ctx.rotate(-0.03); ctx.fillText('SAM K. · T.T.E.', 0, 0); ctx.restore();
    ctx.restore();
    const rg = clamp(st.ring73 || 0);
    if (rg > 0) { ctx.strokeStyle = REDINK; ctx.lineWidth = 7; ctx.beginPath(); ctx.ellipse(540, y - 20, 430, 70, -0.02, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * rg); ctx.stroke(); }
  }
  // the handover note clipped on top (for the note shots) — drawn by drawTrainNote
  ctx.restore();
  if (st.dark) darken(ctx, st.dark);
}

const NOTE = { x0: 140, x1: 940, y0: 260, y1: 1700 };
const TRAIN_RULES = [
  { y: 640, lines: ['Count every passenger', 'at every stop.'] },
  { y: 900, lines: ['If you count 73,', 'NEVER count again.'] },
  { y: 1160, lines: ['Never look up at', 'the top berths.'] },
];
function drawTrainNote(ctx, t, st = {}) {
  boardBG(ctx, st.night || 0);
  const N = NOTE;
  ctx.save(); ctx.translate(540, 960); ctx.rotate(0.025); ctx.translate(-540, -960);
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  ctx.fillStyle = '#f4ecb8'; ctx.fillRect(N.x0, N.y0, N.x1 - N.x0, N.y1 - N.y0);
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.fillStyle = 'rgba(70,100,170,0.25)'; for (let y = N.y0 + 160; y < N.y1 - 30; y += 66) ctx.fillRect(N.x0 + 10, y, N.x1 - N.x0 - 20, 2);
  ctx.fillStyle = 'rgba(200,60,70,0.4)'; ctx.fillRect(N.x0 + 110, N.y0, 3, N.y1 - N.y0);
  rrect(ctx, 440, N.y0 - 50, 200, 80, 12); ctx.fillStyle = '#b9c0cc'; ctx.fill();
  ctx.fillStyle = INK; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'center';
  ctx.font = '80px Osw700'; ctx.fillText('COACH S7 · NIGHT', 540, 390);
  ctx.font = '44px Osw600'; spaced(ctx, 'READ THIS FIRST', 540, 455, 8, 'center');
  ctx.fillRect(330, 480, 420, 5);
  ctx.textAlign = 'left';
  TRAIN_RULES.forEach((r, i) => {
    const hl = st.hl === i ? clamp(st.hlA ?? 1) : 0;
    if (hl > 0) { ctx.save(); ctx.globalAlpha = 0.55; ctx.fillStyle = C.lime; ctx.fillRect(N.x0 + 20, r.y - 56, 760 * hl, r.lines.length * 70 + 6); ctx.restore(); }
    ctx.globalAlpha = (st.dim && st.hl !== i) ? 1 - 0.55 * st.dim : 1;
    ctx.fillStyle = INK; ctx.font = '72px Osw700'; ctx.fillText(`${i + 1}.`, N.x0 + 20, r.y + 4);
    ctx.font = '54px Inter600';
    r.lines.forEach((ln, k) => { ctx.fillStyle = (i === 1 && k === 1) ? REDINK : INK; ctx.fillText(ln, N.x0 + 140, r.y + k * 70); });
    ctx.globalAlpha = 1;
  });
  const so = clamp(st.last ?? 1);
  if (so > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(N.x0, 1330, (N.x1 - N.x0) * so, 300); ctx.clip();
    ctx.font = '58px Inter700'; ctx.fillStyle = REDINK;
    const ws = ['There', 'is', 'no', 'berth', '73.']; let x = N.x0 + 140;
    ws.forEach((w, i) => { ctx.save(); ctx.translate(x, 1420 + Math.sin(i * 2.1) * 7); ctx.rotate((hash(i * 4) - 0.5) * 0.12); ctx.fillText(w, 0, 0); ctx.restore(); x += ctx.measureText(w).width + 18; });
    ctx.save(); ctx.translate(N.x0 + 140, 1515); ctx.rotate(-0.04); ctx.fillText("Don't sit in it.", 0, 0); ctx.restore();
    ctx.restore();
  }
  ctx.font = '40px Inter600'; ctx.fillStyle = INK; ctx.fillText('— R.', N.x1 - 200, 1640);
  ctx.restore();
  if (st.dark) darken(ctx, st.dark);
}

// ---------- the hand tally counter ----------
// st: {n (number shown), press 0..1, night, self (clicks with no thumb)}
function drawClicker(ctx, t, st = {}) {
  const night = st.night || 0;
  // background: the dim aisle, out of focus
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, mix('#4a5a7a', '#0b1230', night)); g.addColorStop(1, mix('#1d2846', '#05081a', night));
  ctx.fillStyle = g; ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  if (night > 0) glow(ctx, 540, 200, 700, 'rgba(60,110,255,A)', 0.35 * night);
  ctx.save(); ctx.translate(540, 1000);
  // hand
  ctx.fillStyle = mix('#e7d2bd', '#6a7598', night * 0.8);
  ctx.beginPath(); ctx.ellipse(-20, 230, 300, 230, 0, 0, 7); ctx.fill();
  for (let f = 0; f < 4; f++) { rrect(ctx, -330, 60 + f * 78, 220, 70, 35); ctx.fill(); }
  // body
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30;
  ctx.beginPath(); ctx.arc(0, 0, 250, 0, 7); ctx.fillStyle = mix('#c9d0da', '#55617f', night * 0.7); ctx.fill(); ctx.shadowBlur = 0;
  ctx.beginPath(); ctx.arc(0, 0, 226, 0, 7); ctx.fillStyle = mix('#e3e8ee', '#6b7695', night * 0.7); ctx.fill();
  // ring + button on top
  const pr = clamp(st.press || 0);
  rrect(ctx, -60, -330 + pr * 40, 120, 90, 14); ctx.fillStyle = mix('#aeb6c2', '#4a5675', night * 0.7); ctx.fill();
  ctx.fillStyle = mix('#8b93a2', '#3a4565', night * 0.7); ctx.fillRect(-70, -250, 140, 16);
  // thumb on the button (absent when it counts by itself)
  if (!st.self) { ctx.fillStyle = mix('#e7d2bd', '#6a7598', night * 0.8); ctx.beginPath(); ctx.ellipse(10, -380 + pr * 40, 70, 56, -0.2, 0, 7); ctx.fill(); }
  // digit window
  rrect(ctx, -180, -80, 360, 160, 16); ctx.fillStyle = '#0a0d14'; ctx.fill();
  const s = String(Math.max(0, Math.floor(st.n || 0))).padStart(3, '0');
  ctx.font = '132px Osw700'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let i = 0; i < 3; i++) {
    const x = -112 + i * 112;
    rrect(ctx, x - 50, -66, 100, 132, 8); ctx.fillStyle = '#f4f4f0'; ctx.fill();
    ctx.fillStyle = (st.red && i > 0) ? REDINK : '#0a0d14'; ctx.fillText(s[i], x, 8);
  }
  ctx.restore();
  if (st.red) glow(ctx, 540, 1000, 420, 'rgba(255,40,60,A)', 0.18 * st.red);
}

// ---------- the poster image: his upside-down face at eye level ----------
// st: {smile 0..1, push 0..1, night}
function drawHangerFace(ctx, t, st = {}) {
  const night = st.night ?? 0.8;
  ctx.fillStyle = '#05081a'; ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  glow(ctx, 540, 200, 900, 'rgba(60,110,255,A)', 0.4);
  // the berth edge above, his vest going up out of frame
  poly(ctx, [[-200, -400], [1280, -400], [1280, 160], [-200, 210]], '#16275a');
  poly(ctx, [[-200, 160], [1280, 140], [1280, 210], [-200, 260]], '#0f1c44');
  const sw = Math.sin(t * 1.2) * 10;
  ctx.lineCap = 'round';
  for (const pass of [0, 1]) { ctx.strokeStyle = pass ? '#8c9abb' : '#05081a'; ctx.lineWidth = pass ? 54 : 70;
    for (const [ox, ph] of [[-300, 0], [300, 1.7]]) { const dx = Math.sin(t + ph) * 18; ctx.beginPath(); ctx.moveTo(540 + ox * 0.55, 200); ctx.quadraticCurveTo(540 + ox * 1.15 + dx, 1100, 540 + ox * 1.2 + dx, 2000); ctx.stroke(); } }
  poly(ctx, [[330, -100], [750, -100], [700 + sw, 560], [380 + sw, 560]], '#3a4670');
  ctx.fillStyle = '#7d89aa'; ctx.fillRect(470 + sw, 540, 140, 120);
  ctx.save(); ctx.translate(540 + sw, 960); const s = 3.6 + 0.35 * (st.push || 0); ctx.scale(s, s); ctx.rotate(Math.PI);
  headUpside(ctx, t, { smile: st.smile || 0, skin: '#a9b6d0', night });
  ctx.restore();
  glow(ctx, 540, 960, 380, 'rgba(200,220,255,A)', 0.12);
}

// ---------- your seat: the side lower berth, plate 73 ----------
// st: {plate 0..1 (73 lights red), me 0..1 sitting, night}
function drawSeat(ctx, t, st = {}) {
  const night = st.night ?? 0.3;
  ctx.fillStyle = mix('#d9dde3', '#1d2a4e', night); ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  // window
  rrect(ctx, 140, 260, 800, 520, 40); ctx.fillStyle = '#0a1230'; ctx.fill();
  ctx.strokeStyle = mix('#a9b2bf', '#33405f', night); ctx.lineWidth = 18; ctx.stroke();
  for (let i = 0; i < 5; i++) { ctx.fillStyle = 'rgba(160,190,255,0.15)'; ctx.fillRect(160, 320 + i * 100, 760, 3); }
  // the berth (seen from the aisle)
  poly(ctx, [[80, 820], [1000, 820], [1000, 1160], [80, 1160]], mix('#3a5cae', '#1b2c62', night));
  poly(ctx, [[60, 1160], [1020, 1160], [1060, 1300], [20, 1300]], mix('#2d4f9e', '#16275a', night));
  // the plate
  const pl = clamp(st.plate || 0);
  ctx.save(); ctx.translate(540, 900);
  rrect(ctx, -150, -70, 300, 140, 14); ctx.fillStyle = '#e9edf2'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#8b93a2'; ctx.stroke();
  ctx.font = '108px Osw700'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = pl > 0 ? REDINK : INK; ctx.fillText(pl > 0.5 ? '73' : '63', 0, 6);
  ctx.font = '22px Mono700'; ctx.fillStyle = '#5a6476'; spaced(ctx, 'SIDE LOWER', 0, 58, 2, 'center');
  ctx.restore();
  if (pl > 0) glow(ctx, 540, 900, 380, 'rgba(255,40,60,A)', 0.35 * pl);
  // you, sitting
  if (st.me !== 0) drawTTE(ctx, 780, 1470, 1.75, { view: 'front', board: false }, night);
  ctx.fillStyle = mix('#1f3a7a', '#0f1c44', night); ctx.fillRect(-1500, 1290, W + 3000, 80);
  ctx.fillStyle = mix('#7d8796', '#0e1428', night); ctx.fillRect(-1500, 1370, W + 3000, 1500);
  if (st.dark) darken(ctx, st.dark);
}

module.exports = { drawCoach, drawTTE, drawChart, drawTrainNote, TRAIN_RULES, drawClicker, drawHangerFace, drawSeat, headUpside, P, BAYS, HANG_BAY, darken };
