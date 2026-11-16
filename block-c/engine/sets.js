// BLOCK C — set painters (world space; same conventions as scenes*.js)
const { createCanvas } = require('@napi-rs/canvas');
const D = require('./draw');
const S = require('./scenes');
const { W, H, C, clamp, lerp, inv, E, hash, noise1, flicker, rrect, glow, spaced, drawStick } = D;
const { poly } = S;

const FL = 1320; // room floor line

// ---------- THE WARDEN (too tall, long coat, register book; face never shown) ----------
// local: ground at 0, ~780 tall. st: {t, walk (phase rad or undefined), col, rim, book (0..1 open), page (0..1 flicker)}
function drawWarden(ctx, x, y, s, st = {}) {
  const t = st.t || 0, col = st.col || '#04060d';
  const j = (i, a = 3) => (noise1(t * 2.1 + i * 11.3) - 0.5) * a;
  const ph = st.walk;
  const bob = ph !== undefined ? Math.abs(Math.sin(ph)) * -10 : 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // legs (thin, below the coat)
  let fl = -22, fr = 22, ll = 0, lr = 0;
  if (ph !== undefined) { fl = -10 + 26 * Math.sin(ph); fr = 10 - 26 * Math.sin(ph); ll = Math.max(0, -Math.cos(ph)) * 12; lr = Math.max(0, Math.cos(ph)) * 12; }
  ctx.lineWidth = 15;
  ctx.beginPath(); ctx.moveTo(-12, -170 + bob); ctx.lineTo(fl, -ll); ctx.moveTo(12, -170 + bob); ctx.lineTo(fr, -lr); ctx.stroke();
  // shoes
  ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(fl - 4, -ll); ctx.lineTo(fl + 22, -ll); ctx.moveTo(fr - 4, -lr); ctx.lineTo(fr + 22, -lr); ctx.stroke();
  ctx.translate(0, bob);
  // coat (A-line, slightly hunched)
  ctx.beginPath();
  ctx.moveTo(-50 + j(1), -585); ctx.lineTo(48 + j(2), -590);
  ctx.lineTo(70 + j(3), -400); ctx.lineTo(92 + j(4, 5), -150); ctx.lineTo(30, -140 + j(5, 4)); ctx.lineTo(-30, -146 + j(6, 4));
  ctx.lineTo(-90 + j(7, 5), -152); ctx.lineTo(-68 + j(8), -400); ctx.closePath(); ctx.fill();
  // collar + neck bent forward
  ctx.beginPath(); ctx.moveTo(-26, -585); ctx.lineTo(22, -590); ctx.lineTo(34 + j(9), -660); ctx.lineTo(4 + j(10), -664); ctx.closePath(); ctx.fill();
  // left arm: hangs below the hem, long fingers
  ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(-48, -575); ctx.lineTo(-74 + j(11, 4), -380); ctx.lineTo(-84 + j(12, 4), -190); ctx.stroke();
  ctx.lineWidth = 5;
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-86 + (i - 1.5) * 5, -192); ctx.quadraticCurveTo(-90 + (i - 1.5) * 7, -150, -92 + (i - 1.5) * 6, -112 + (i === 1 || i === 2 ? 10 : 0)); ctx.stroke(); }
  // right arm bent: holds the register at chest height
  ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(46, -575); ctx.lineTo(80 + j(13), -470); ctx.lineTo(40, -420); ctx.stroke();
  // head: small, tilted
  ctx.save(); ctx.translate(26, -704); ctx.rotate(0.28 + j(14, 0.04));
  ctx.beginPath(); ctx.ellipse(0, 0, 34, 47, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  // the register (open book): pale page edges
  const bk = st.book ?? 1;
  if (bk > 0) {
    ctx.save(); ctx.translate(30, -440); ctx.rotate(-0.12);
    ctx.fillStyle = col; ctx.fillRect(-62, -34, 124, 62);
    ctx.globalAlpha = 0.55 * bk; ctx.fillStyle = '#6f7ba3'; ctx.fillRect(-58, -38, 56, 4); ctx.fillRect(2, -38, 56, 4);
    if (st.page > 0) { ctx.globalAlpha = 0.7 * st.page; ctx.fillStyle = '#9aa6c8'; ctx.save(); ctx.translate(0, -38); ctx.rotate(-Math.PI * st.page); ctx.fillRect(0, -2, 56, 4); ctx.restore(); }
    ctx.restore();
  }
  // rim light
  if (st.rim > 0) {
    ctx.save(); ctx.globalAlpha = st.rim; ctx.strokeStyle = st.rimCol || '#4d5c8c'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-50, -585); ctx.lineTo(-68, -400); ctx.lineTo(-90, -152); ctx.stroke();
    ctx.save(); ctx.translate(26, -704); ctx.rotate(0.28); ctx.beginPath(); ctx.ellipse(0, 0, 34, 47, 0, Math.PI * 0.7, Math.PI * 1.5); ctx.stroke(); ctx.restore();
    ctx.restore();
  }
  ctx.restore();
}

// ---------- HOSTEL ROOM 13 (front elevation, world x -700..1500) ----------
// st: {lamp, moon, dark, door gap {gap, feet, red, page}, wardrobe open (0..1), torch {x,y,a},
//      kabir {mode:'sit'|'lump'|'none', shake, laugh, headDX}, me {...stick opts} , meBed {...bust opts}}
function bedFrame(ctx, x0, x1, st) {
  // iron bed against the back wall
  ctx.strokeStyle = '#3a4469'; ctx.lineWidth = 9; ctx.lineCap = 'round';
  const hb = st.headLeft ? x0 : x1, fb = st.headLeft ? x1 : x0;
  // headboard
  ctx.beginPath(); ctx.moveTo(hb, FL); ctx.lineTo(hb, 990); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(hb + (st.headLeft ? 0 : 0), 1000); ctx.lineTo(hb + (st.headLeft ? 70 : -70), 1000); ctx.lineTo(hb + (st.headLeft ? 70 : -70), FL); ctx.stroke();
  ctx.lineWidth = 5; for (let i = 1; i < 4; i++) { const xx = hb + (st.headLeft ? 1 : -1) * i * 17.5; ctx.beginPath(); ctx.moveTo(xx, 1000); ctx.lineTo(xx, 1175); ctx.stroke(); }
  // footboard
  ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(fb, FL); ctx.lineTo(fb, 1100); ctx.stroke();
  // frame + legs
  ctx.beginPath(); ctx.moveTo(x0, 1228); ctx.lineTo(x1, 1228); ctx.stroke();
  ctx.lineWidth = 7; for (const xx of [x0 + 40, x1 - 40]) { ctx.beginPath(); ctx.moveTo(xx, 1228); ctx.lineTo(xx, FL); ctx.stroke(); }
  // mattress
  rrect(ctx, x0 + 8, 1178, x1 - x0 - 16, 44, 12); ctx.fillStyle = '#1d2547'; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(x0 + 14, 1180, x1 - x0 - 28, 6);
  // under-bed black
  const g = ctx.createLinearGradient(0, 1230, 0, FL); g.addColorStop(0, '#010103'); g.addColorStop(1, '#03040a');
  ctx.fillStyle = g; ctx.fillRect(x0 + 10, 1232, x1 - x0 - 20, FL - 1234);
  // pillow
  const px = st.headLeft ? x0 + 30 : x1 - 160;
  rrect(ctx, px, 1146, 130, 38, 16); ctx.fillStyle = '#2b3460'; ctx.fill();
}
function blanket(ctx, x0, x1, peak, sh, t, col = '#273163') {
  ctx.beginPath(); ctx.moveTo(x0, 1226);
  const n = 18;
  for (let i = 0; i <= n; i++) {
    const u = i / n, x = lerp(x0, x1, u);
    const bump = Math.sin(Math.PI * Math.pow(u, 0.8)) * peak + (noise1(u * 6 + 3) - 0.5) * 10;
    const jit = sh * (noise1(t * 22 + i * 1.7) - 0.5) * 9;
    ctx.lineTo(x, 1180 - bump + jit);
  }
  ctx.lineTo(x1 + 6, 1226); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  ctx.strokeStyle = 'rgba(160,180,240,0.10)'; ctx.lineWidth = 3; ctx.stroke();
  // fold lines
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 3;
  for (let i = 1; i < 4; i++) { const x = lerp(x0, x1, i / 4); ctx.beginPath(); ctx.moveTo(x, 1222); ctx.quadraticCurveTo(x + 18, 1200, x + 6, 1186 - peak * 0.5); ctx.stroke(); }
}
function drawRoom(ctx, t, st = {}) {
  const lamp = st.lamp ?? 1, moon = st.moon ?? 1;
  // wall
  ctx.fillStyle = '#04060c'; ctx.fillRect(-1200, -600, 3600, 3600);
  let g = ctx.createLinearGradient(0, 200, 0, FL);
  g.addColorStop(0, '#0f1530'); g.addColorStop(1, '#141c3c');
  ctx.fillStyle = g; ctx.fillRect(-1200, 200, 3600, FL - 200);
  // paint line + switchboard
  ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(-1200, 880, 3600, 4);
  ctx.fillStyle = '#1e2750'; ctx.fillRect(-1200, 884, 3600, FL - 884);
  rrect(ctx, -330, 760, 120, 70, 6); ctx.fillStyle = '#2a3460'; ctx.fill();
  for (let i = 0; i < 4; i++) { ctx.fillStyle = '#121833'; ctx.fillRect(-318 + i * 27, 778, 16, 30); }
  // ceiling fan rod
  ctx.fillStyle = '#05070f'; ctx.fillRect(-1200, -600, 3600, 800);
  ctx.fillStyle = '#20284c'; ctx.fillRect(296, 200, 8, 130); ctx.beginPath(); ctx.ellipse(300, 336, 46, 16, 0, 0, 7); ctx.fill();
  const fa = t * 0.8; ctx.save(); ctx.translate(300, 336); ctx.scale(1, 0.22);
  for (let i = 0; i < 3; i++) { ctx.save(); ctx.rotate(fa + i * 2.094); ctx.fillStyle = '#1a2142'; ctx.fillRect(30, -18, 300, 36); ctx.restore(); }
  ctx.restore();
  // floor
  g = ctx.createLinearGradient(0, FL, 0, 2100); g.addColorStop(0, '#0d1329'); g.addColorStop(1, '#03050b');
  ctx.fillStyle = g; ctx.fillRect(-1200, FL, 3600, 1200);
  ctx.fillStyle = '#0a0f22'; ctx.fillRect(-1200, FL - 18, 3600, 18);
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 2;
  for (let i = -12; i < 22; i++) { ctx.beginPath(); ctx.moveTo(i * 120, FL); ctx.lineTo(540 + (i * 120 - 540) * 3, 2100); ctx.stroke(); }

  // ---- window with bars (moonlight)
  const wx0 = 800, wx1 = 1010, wy0 = 520, wy1 = 840;
  ctx.fillStyle = '#2a3253'; ctx.fillRect(wx0 - 16, wy0 - 16, wx1 - wx0 + 32, wy1 - wy0 + 32);
  g = ctx.createLinearGradient(0, wy0, 0, wy1); g.addColorStop(0, `rgba(60,86,150,${0.55 * moon + 0.1})`); g.addColorStop(1, `rgba(20,30,70,${0.6})`);
  ctx.fillStyle = '#04060f'; ctx.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0); ctx.fillStyle = g; ctx.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
  // far block silhouette with lit windows (other wings)
  ctx.fillStyle = '#060914'; ctx.fillRect(wx0, 700, wx1 - wx0, 140);
  for (let i = 0; i < 6; i++) { const on = hash(i * 7.1) > 0.55 && (st.farLights ?? 1) > 0.5; ctx.fillStyle = on ? 'rgba(200,220,170,0.55)' : '#0b1020'; ctx.fillRect(wx0 + 14 + i * 33, 728, 18, 20); ctx.fillRect(wx0 + 14 + i * 33, 778, 18, 20); }
  ctx.fillStyle = '#3a4469'; for (let i = 1; i < 6; i++) ctx.fillRect(wx0 + i * (wx1 - wx0) / 6 - 4, wy0, 8, wy1 - wy0);
  ctx.fillRect(wx0, (wy0 + wy1) / 2 - 3, wx1 - wx0, 6);
  // moonlight shaft on floor
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  g = ctx.createLinearGradient(0, wy0, 0, 1900); g.addColorStop(0, `rgba(110,140,220,${0.10 * moon})`); g.addColorStop(1, 'rgba(110,140,220,0)');
  poly(ctx, [[wx0, wy0], [wx1, wy0], [wx1 - 160, 1900], [wx0 - 420, 1900]], g); ctx.restore();

  // ---- study table + lamp
  ctx.fillStyle = '#1a2246'; ctx.fillRect(790, 1060, 250, 22); ctx.fillRect(800, 1082, 12, FL - 1082); ctx.fillRect(1018, 1082, 12, FL - 1082);
  ctx.fillStyle = '#121933'; ctx.fillRect(812, 1082, 206, 70);
  // books
  [[830, 60, '#2b3460'], [852, 74, '#3a2a3a'], [874, 54, '#22304e']].forEach(([x, h, c]) => { ctx.fillStyle = c; ctx.fillRect(x, 1060 - h, 20, h); });
  // lamp
  ctx.strokeStyle = '#3a4469'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(990, 1060); ctx.lineTo(990, 990); ctx.lineTo(950, 950); ctx.stroke();
  poly(ctx, [[915, 930], [985, 950], [968, 990], [905, 966]], '#2a3253');
  if (lamp > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    g = ctx.createLinearGradient(0, 960, 0, 1070); g.addColorStop(0, `rgba(255,236,190,${0.45 * lamp})`); g.addColorStop(1, 'rgba(255,236,190,0)');
    poly(ctx, [[910, 968], [966, 988], [1040, 1062], [800, 1062]], g); ctx.restore();
    glow(ctx, 935, 1000, 520, 'rgba(255,225,170,A)', 0.16 * lamp);
  }

  // ---- wardrobe (steel almirah) with the right door open
  const ax0 = 330, ax1 = 610, ay0 = 470;
  ctx.fillStyle = '#2b3a46'; ctx.fillRect(ax0 - 8, ay0 - 8, ax1 - ax0 + 16, FL - ay0 + 8);
  ctx.fillStyle = '#33454f'; ctx.fillRect(ax0, ay0, 140, FL - ay0 - 30);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; for (let i = 0; i < 6; i++) ctx.fillRect(ax0 + 30, ay0 + 60 + i * 14, 80, 5);
  ctx.fillStyle = '#5a6a7a'; ctx.fillRect(ax0 + 120, 880, 8, 60);
  const wo = st.wardrobe ?? 1;
  // interior
  ctx.fillStyle = '#05070c'; ctx.fillRect(ax0 + 140, ay0, ax1 - ax0 - 140, FL - ay0 - 30);
  ctx.strokeStyle = '#2a3253'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(ax0 + 140, ay0 + 70); ctx.lineTo(ax1, ay0 + 70); ctx.stroke();
  for (let i = 0; i < 3; i++) { const hx = ax0 + 170 + i * 36; poly(ctx, [[hx, ay0 + 74], [hx + 34, ay0 + 120], [hx + 30, ay0 + 360], [hx - 26, ay0 + 360], [hx - 30, ay0 + 120]], ['#0f1428', '#141a33', '#0c1122'][i]); }
  ctx.fillStyle = '#0f1428'; ctx.fillRect(ax0 + 140, 1000, ax1 - ax0 - 140, 10);
  // open door: trapezoid toward the viewer, inner face with the taped list
  const dx = lerp(0, 190, wo);
  const doorPts = [[ax1, ay0], [ax1 + dx, ay0 - 30 * wo], [ax1 + dx, FL - 30 + 26 * wo], [ax1, FL - 30]];
  poly(ctx, doorPts, wo > 0.5 ? '#3d505c' : '#33454f');
  ctx.strokeStyle = '#1d2a33'; ctx.lineWidth = 4; ctx.beginPath(); doorPts.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.closePath(); ctx.stroke();
  if (wo > 0.6) {
    // the paper (small, perspective-skewed)
    ctx.save(); ctx.transform(1, -0.15 * wo, 0, 1, 0, 0);
    const px = ax1 + 30, py = 650 + 95;
    poly(ctx, [[px, py], [px + 130, py], [px + 130, py + 230], [px, py + 230]], '#c5c7cf');
    ctx.fillStyle = 'rgba(30,36,70,0.85)'; ctx.fillRect(px + 22, py + 18, 86, 12); ctx.fillRect(px + 30, py + 36, 70, 8);
    for (let i = 0; i < 9; i++) ctx.fillRect(px + 14, py + 62 + i * 16, 60 + hash(i) * 44, 4);
    ctx.fillStyle = 'rgba(10,10,20,0.9)'; ctx.fillRect(px + 12, py + 206, 100, 10);
    ctx.fillStyle = 'rgba(220,210,170,0.5)'; ctx.fillRect(px - 8, py - 8, 38, 14); ctx.fillRect(px + 100, py - 8, 38, 14);
    ctx.restore();
  }

  // ---- your bed (right) and Kabir's bed (left)
  bedFrame(ctx, 1080, 1500, { headLeft: false });
  bedFrame(ctx, -340, 250, { headLeft: true });
  // Kabir
  const kb = st.kabir || { mode: 'sit' };
  if (kb.mode === 'sit') {
    const laugh = kb.laugh || 0;
    drawStick(ctx, { x: -200, y: 1350, s: 0.92, view: 'front', bust: true, arm: kb.arm || 'down', headDY: -Math.abs(Math.sin(t * 15)) * 12 * laugh, headDX: kb.headDX || 0, fill: C.navy1 });
    blanket(ctx, -300, 230, 42, 0, t);
  } else if (kb.mode === 'lump') {
    blanket(ctx, -310, 230, 92 + (kb.breath || 0) * 26 * Math.sin(t * 2 * Math.PI / 3.2), kb.shake || 0, t, '#323e7a');
  } else blanket(ctx, -310, 230, 6, 0, t, '#222b56');
  // you in your bed (sitting up), or blanket only
  if (st.meBed) {
    drawStick(ctx, { x: 1360, y: 1350, s: 0.92, view: 'front', bust: true, arm: 'down', fill: C.navy1, ...st.meBed });
    blanket(ctx, 1110, 1480, 42, st.meBed.shake || 0, t);
  } else blanket(ctx, 1110, 1480, 14, 0, t, '#222b56');

  // ---- room door (far left) with the gap under it
  drawRoomDoor(ctx, t, st.gap || {});

  // overall darkness
  if (st.dark > 0) { ctx.fillStyle = `rgba(1,2,6,${st.dark})`; ctx.fillRect(-1200, -600, 3600, 3600); }
  // gap light drawn again above the darkness (it is the light source)
  if (st.dark > 0) gapLight(ctx, t, st.gap || {}, true);
  // torch from your phone
  if (st.torch && st.torch.a > 0) glow(ctx, st.torch.x, st.torch.y, st.torch.r || 260, 'rgba(225,235,255,A)', 0.35 * st.torch.a);
  // you, standing
  if (st.me) drawStick(ctx, st.me);
}
const RD = { x0: -660, x1: -420, y0: 560 };
function gapLight(ctx, t, gp, only) {
  const L = gp.gap ?? 0.8; if (L <= 0) return;
  const red = gp.red || 0;
  const col = (a) => `rgba(${Math.round(lerp(200, 255, red))},${Math.round(lerp(235, 40, red))},${Math.round(lerp(210, 50, red))},${a})`;
  const x0 = RD.x0 + 8, x1 = RD.x1 - 8, y = FL - 6;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(0, y, 0, y + 420);
  g.addColorStop(0, col(0.32 * L)); g.addColorStop(1, col(0));
  poly(ctx, [[x0, y], [x1, y], [x1 + 160, y + 420], [x0 - 160, y + 420]], g);
  ctx.restore();
  ctx.fillStyle = col(0.9 * L); ctx.fillRect(x0, y, x1 - x0, 6);
  // shadows of two feet breaking the strip
  const f = gp.feet || 0;
  if (f > 0) {
    const fx = lerp(x1 + 40, (x0 + x1) / 2, E.out(f));
    for (const o of [-56, 22]) {
      const sx = fx + o;
      ctx.fillStyle = '#000'; ctx.fillRect(Math.max(x0, sx), y - 1, Math.max(0, Math.min(x1, sx + 34) - Math.max(x0, sx)), 8);
      ctx.save(); ctx.globalAlpha = 0.85; poly(ctx, [[sx, y + 6], [sx + 34, y + 6], [sx + 34 + (sx - 540) * 0.08 + 30, y + 420], [sx + (sx - 540) * 0.08 - 40, y + 420]], 'rgba(0,0,0,0.75)'); ctx.restore();
    }
  }
}
function drawRoomDoor(ctx, t, gp) {
  ctx.fillStyle = '#2a3253'; ctx.fillRect(RD.x0 - 22, RD.y0 - 22, RD.x1 - RD.x0 + 44, FL - RD.y0 + 22);
  const g = ctx.createLinearGradient(RD.x0, 0, RD.x1, 0); g.addColorStop(0, '#1b2348'); g.addColorStop(1, '#161d3d');
  ctx.fillStyle = g; ctx.fillRect(RD.x0, RD.y0, RD.x1 - RD.x0, FL - RD.y0 - 6);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 4;
  ctx.strokeRect(RD.x0 + 30, RD.y0 + 40, RD.x1 - RD.x0 - 60, 300); ctx.strokeRect(RD.x0 + 30, RD.y0 + 400, RD.x1 - RD.x0 - 60, 300);
  // tower bolt + handle
  ctx.fillStyle = '#5a6488'; ctx.fillRect(RD.x1 - 60, 940, 40, 10); ctx.fillRect(RD.x1 - 34, 930, 10, 30);
  ctx.fillRect(RD.x1 - 50, 760, 30, 8);
  // towel on a hook
  poly(ctx, [[RD.x0 + 40, 640], [RD.x0 + 110, 640], [RD.x0 + 116, 820], [RD.x0 + 34, 830]], '#2b2f52');
  gapLight(ctx, t, gp);
}

// ---------- THE LIST (wardrobe door close-up) ----------
const RULES = [
  'Roll call is at 12:07 AM. Answer only to your own name.',
  'The warden never knocks.',
  "If your roommate's bed is empty after 1 AM, do not look under it.",
  'The mess opens at 3 AM for someone. Not for you.',
  'Block C has 42 students. If the group chat says 43, leave it.',
];
const PAPER = { x0: 150, x1: 930, y0: 230, y1: 1790 };
let LAYOUT = null;
function listLayout() {
  if (LAYOUT) return LAYOUT;
  const c = createCanvas(10, 10).getContext('2d');
  c.font = '50px Inter600';
  const maxW = 610; let y = 640; const rules = [];
  for (const r of RULES) {
    const words = r.split(' '); const lines = []; let cur = '';
    for (const w of words) { const tst = cur ? cur + ' ' + w : w; if (c.measureText(tst).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tst; }
    lines.push(cur);
    rules.push({ y, lines }); y += lines.length * 64 + 70;
  }
  rules.push({ y, lines: [] }); // 6
  LAYOUT = rules; return rules;
}
function drawList(ctx, t, st = {}) {
  const R = listLayout();
  // steel inner face of the wardrobe door
  ctx.fillStyle = '#25343e'; ctx.fillRect(-600, -600, 2400, 3200);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; for (let i = 0; i < 40; i++) ctx.fillRect(-600, -600 + i * 90, 2400, 2);
  for (const [x, y] of [[90, 120], [990, 120], [90, 1880], [990, 1880]]) { ctx.beginPath(); ctx.arc(x, y, 10, 0, 7); ctx.fillStyle = '#3d505c'; ctx.fill(); }
  // paper
  ctx.save(); ctx.translate(540, 1010); ctx.rotate(-0.018); ctx.translate(-540, -1010);
  const P = PAPER;
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
  ctx.beginPath(); ctx.moveTo(P.x0, P.y0); ctx.lineTo(P.x1, P.y0 + 6); ctx.lineTo(P.x1 - 6, P.y1); ctx.lineTo(P.x0 + 4, P.y1 - 4); ctx.closePath();
  const pg = ctx.createLinearGradient(0, P.y0, 0, P.y1); pg.addColorStop(0, '#d3d2cc'); pg.addColorStop(1, '#bdbcb5');
  ctx.fillStyle = pg; ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  // ruled lines + margin
  ctx.fillStyle = 'rgba(70,100,170,0.22)'; for (let y = P.y0 + 120; y < P.y1 - 40; y += 64) ctx.fillRect(P.x0 + 10, y, P.x1 - P.x0 - 20, 2);
  ctx.fillStyle = 'rgba(200,60,70,0.35)'; ctx.fillRect(P.x0 + 120, P.y0 + 6, 3, P.y1 - P.y0 - 14);
  // tape
  ctx.fillStyle = 'rgba(225,215,170,0.55)';
  for (const [x, y, r] of [[P.x0 + 10, P.y0 + 6, -0.5], [P.x1 - 10, P.y0 + 10, 0.5], [P.x0 + 14, P.y1 - 10, 0.45], [P.x1 - 14, P.y1 - 8, -0.4]]) { ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.fillRect(-70, -22, 140, 44); ctx.restore(); }
  const ink = '#141a36';
  ctx.fillStyle = ink; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'center';
  ctx.font = '104px Osw700'; ctx.fillText('BLOCK C', 540, 400);
  ctx.font = '62px Osw600'; spaced(ctx, 'NIGHT RULES', 540, 480, 10, 'center');
  ctx.fillRect(330, 508, 420, 6);
  ctx.textAlign = 'left';
  R.forEach((r, i) => {
    const hl = st.hl === i ? clamp(st.hlA ?? 1) : (st.done && st.done > i ? 1 : 0);
    if (hl > 0) {
      // lime marker swipe behind the number + first line
      ctx.save(); ctx.globalAlpha = st.hl === i ? 0.55 : 0.08;
      ctx.fillStyle = C.lime; ctx.fillRect(P.x0 + 30, r.y - 52, (r.lines.length ? 750 : 120) * hl, (Math.max(1, r.lines.length)) * 64 + 8); ctx.restore();
    }
    ctx.fillStyle = ink; ctx.font = '70px Osw700'; ctx.fillText(`${i + 1}.`, P.x0 + 40, r.y + 4);
    ctx.font = '50px Inter600';
    r.lines.forEach((ln, k) => ctx.fillText(ln, P.x0 + 150, r.y + k * 64));
  });
  // rule 6: scratched out so hard the paper tore
  const r6 = R[5];
  ctx.save(); ctx.strokeStyle = '#0a0d1e'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); let x = P.x0 + 150, y = r6.y - 30; ctx.moveTo(x, y);
  for (let i = 0; i < 46; i++) { x = P.x0 + 150 + hash(i * 3.3) * 600; y = r6.y - 50 + (i % 2) * 70 + hash(i * 1.7) * 30 + Math.floor(i / 16) * 40; ctx.lineTo(x, y); }
  ctx.stroke(); ctx.restore();
  // the tear
  ctx.save(); ctx.beginPath();
  const cx = 520, cy = r6.y + 30;
  for (let i = 0; i <= 22; i++) { const a = (i / 22) * Math.PI * 2; const rr = (i % 2 ? 46 : 70) + hash(i * 5.1) * 30; const px = cx + Math.cos(a) * rr * 2.2, py = cy + Math.sin(a) * rr * 0.75; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  ctx.closePath(); ctx.fillStyle = '#18242c'; ctx.fill(); ctx.strokeStyle = '#e8e6de'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
  ctx.fillStyle = ink; ctx.font = '70px Osw700'; ctx.fillText('6.', P.x0 + 40, r6.y + 4);
  // signature
  ctx.font = '36px Inter500'; ctx.fillStyle = 'rgba(20,26,54,0.7)'; ctx.fillText('— R. 13', P.x1 - 190, P.y1 - 60);
  ctx.restore();
  // torch pool: everything outside it falls to dark
  const tx = st.tx ?? 540, ty = st.ty ?? 900, tr = st.tr ?? 760;
  const dg = ctx.createRadialGradient(tx, ty, tr * 0.25, tx, ty, tr);
  dg.addColorStop(0, 'rgba(2,3,8,0)'); dg.addColorStop(1, `rgba(2,3,8,${st.dark ?? 0.86})`);
  ctx.fillStyle = dg; ctx.fillRect(-600, -600, 2400, 3200);
  glow(ctx, tx, ty, tr * 0.7, 'rgba(210,225,255,A)', 0.08);
}

// ---------- GROUP CHAT (overlays the shared phone frame) ----------
function drawGroupChat(ctx, t, st) {
  S.drawPhone(ctx, t, { screen: 'chat', bubbles: [], contact: { name: st.name || 'BLOCK C', initial: st.initial || 'C', hl: st.hlName }, sub: st.sub || '42 members · muted', scale: st.scale, shake: st.shake, date: st.date, bg: st.bg, compose: st.compose });
  const p = S.PH;
  ctx.save();
  const bob = Math.sin(t * 1.3) * 6; const [sx, sy] = st.shake || [0, 0];
  ctx.translate(p.cx + sx, p.cy + bob + sy); ctx.rotate(-0.035); ctx.scale(st.scale || 1, st.scale || 1); ctx.translate(-p.cx, -p.cy);
  const x0 = p.cx - p.w / 2 + 20, y0 = p.cy - p.h / 2 + 20, sw = p.w - 40, sh = p.h - 40;
  rrect(ctx, x0, y0, sw, sh, 74); ctx.clip();
  let y = y0 + 400;
  for (const m of st.msgs || []) {
    const a = clamp(m.a); if (a <= 0) continue;
    if (m.sys) { // centred system pill ("You left", "+91 … added you")
      ctx.save(); ctx.globalAlpha = clamp(a * 2);
      const ss = lerp(0.7, 1, E.outBack(a)); ctx.translate(p.cx, y + 34); ctx.scale(ss, ss); ctx.translate(-p.cx, -(y + 34));
      ctx.font = '30px Inter500'; const tw = ctx.measureText(m.text).width;
      rrect(ctx, p.cx - tw / 2 - 30, y, tw + 60, 68, 34); ctx.fillStyle = m.bg || 'rgba(52,58,82,0.95)'; ctx.fill();
      if (m.ring > 0) { ctx.lineWidth = 5; ctx.strokeStyle = m.ringCol || C.red; ctx.globalAlpha *= clamp(m.ring); ctx.stroke(); ctx.globalAlpha = clamp(a * 2); }
      ctx.fillStyle = m.fg || 'rgba(225,230,245,0.9)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(m.text, p.cx, y + 35);
      if (m.tap > 0 && m.tap < 1) { ctx.beginPath(); ctx.arc(p.cx - 60, y + 34, 30 + 70 * m.tap, 0, 7); ctx.fillStyle = `rgba(255,255,255,${0.35 * (1 - m.tap)})`; ctx.fill(); }
      ctx.restore();
      y += (68 + 26) * clamp(a * 3);
      continue;
    }
    if (m.mine) { // your own side (right, blue) - sent "by you"
      ctx.save(); ctx.globalAlpha = clamp(a * 2);
      ctx.font = '38px Inter500';
      const words = m.text.split(' '); const lines = []; let cur = '';
      for (const w of words) { const tst = cur ? cur + ' ' + w : w; if (ctx.measureText(tst).width > sw - 170 && cur) { lines.push(cur); cur = w; } else cur = tst; }
      lines.push(cur);
      const bw = Math.max(...lines.map(l => ctx.measureText(l).width)) + 60, bh = 34 + lines.length * 48 + 30;
      const bx = x0 + sw - 34 - bw;
      const ss = lerp(0.7, 1, E.outBack(a)); ctx.translate(bx + bw, y); ctx.scale(ss, ss); ctx.translate(-(bx + bw), -y);
      rrect(ctx, bx, y, bw, bh, 30); ctx.fillStyle = m.bg || '#2a5fd8'; ctx.fill();
      if (m.ring > 0) { ctx.lineWidth = 6; ctx.strokeStyle = C.red; ctx.save(); ctx.globalAlpha *= clamp(m.ring); ctx.stroke(); ctx.restore(); }
      ctx.fillStyle = '#f4f6fb'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      lines.forEach((l, k) => ctx.fillText(l, bx + 30, y + 58 + k * 48));
      ctx.font = '20px Inter400'; ctx.fillStyle = 'rgba(225,232,255,0.7)'; ctx.textAlign = 'right'; ctx.fillText((m.time || '') + '  ✓✓', bx + bw - 18, y + bh - 10);
      ctx.restore();
      y += (bh + 22) * clamp(a * 3);
      continue;
    }
    ctx.save(); ctx.globalAlpha = clamp(a * 2);
    const s = lerp(0.7, 1, E.outBack(a)); ctx.translate(x0 + 34, y); ctx.scale(s, s); ctx.translate(-(x0 + 34), -y);
    ctx.font = '25px Inter600'; ctx.fillStyle = m.col || '#7fb0ff'; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    // wrap
    ctx.font = '38px Inter500';
    const words = m.text.split(' '); const lines = []; let cur = '';
    for (const w of words) { const tst = cur ? cur + ' ' + w : w; if (ctx.measureText(tst).width > sw - 140 && cur) { lines.push(cur); cur = w; } else cur = tst; }
    lines.push(cur);
    const bw = Math.max(...lines.map(l => ctx.measureText(l).width)) + 56, bh = 64 + lines.length * 48;
    rrect(ctx, x0 + 34, y, Math.max(bw, 220), bh, 30); ctx.fillStyle = m.bg || '#262c3f'; ctx.fill();
    ctx.font = '25px Inter600'; ctx.fillStyle = m.col || '#7fb0ff'; ctx.fillText(m.from, x0 + 62, y + 40);
    ctx.font = '38px Inter500'; ctx.fillStyle = m.fg || '#f0f2f8';
    lines.forEach((l, k) => ctx.fillText(l, x0 + 62, y + 88 + k * 48));
    ctx.font = '20px Inter400'; ctx.fillStyle = 'rgba(200,206,224,0.5)'; ctx.textAlign = 'right'; ctx.fillText(m.time || '', x0 + 34 + Math.max(bw, 220) - 18, y + bh - 14);
    ctx.restore();
    y += (bh + 22) * clamp(a * 3);
  }
  if (st.typing > 0) {
    const ty = st.typing;
    ctx.save(); ctx.globalAlpha = clamp(ty * 2);
    ctx.font = '25px Inter600'; ctx.fillStyle = st.typingCol || '#ff6b7a'; ctx.textAlign = 'left'; ctx.fillText(st.typingFrom || '+91 ••••• •••43', x0 + 40, y + 30);
    rrect(ctx, x0 + 34, y + 46, 150, 86, 40); ctx.fillStyle = '#262c3f'; ctx.fill();
    for (let i = 0; i < 3; i++) {
      const k = 0.5 + 0.5 * Math.sin(t * 9 - i * 0.9);
      ctx.beginPath(); ctx.arc(x0 + 76 + i * 33, y + 89 - k * 7, 10, 0, 7); ctx.fillStyle = `rgba(190,196,216,${0.45 + 0.55 * k})`; ctx.fill();
    }
    ctx.restore();
  }
  if (st.footer) { // replaces the input bar
    ctx.fillStyle = 'rgba(20,24,40,0.98)'; ctx.fillRect(x0, y0 + sh - 160, sw, 160);
    ctx.font = '27px Inter500'; ctx.fillStyle = st.footerCol || 'rgba(200,206,224,0.75)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(st.footer, p.cx, y0 + sh - 92);
  }
  if (st.sheet > 0) { // action sheet: Exit group
    const k = E.out(clamp(st.sheet));
    ctx.fillStyle = `rgba(0,0,0,${0.45 * k})`; ctx.fillRect(x0, y0, sw, sh);
    const hy = y0 + sh - 430 * k;
    rrect(ctx, x0 + 20, hy, sw - 40, 250, 36); ctx.fillStyle = 'rgba(44,49,70,0.98)'; ctx.fill();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '24px Inter500'; ctx.fillStyle = 'rgba(200,206,224,0.6)'; ctx.fillText('Exit "BLOCK C"?', p.cx, hy + 52);
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(x0 + 20, hy + 100, sw - 40, 2);
    const tp = st.tap || 0;
    if (tp > 0 && tp < 1) { ctx.save(); rrect(ctx, x0 + 20, hy + 102, sw - 40, 148, 36); ctx.clip(); ctx.beginPath(); ctx.arc(p.cx, hy + 176, 60 + 300 * tp, 0, 7); ctx.fillStyle = `rgba(255,90,100,${0.35 * (1 - tp)})`; ctx.fill(); ctx.restore(); }
    ctx.font = '44px Inter600'; ctx.fillStyle = '#ff5a64'; ctx.fillText('Exit group', p.cx, hy + 176);
    rrect(ctx, x0 + 20, hy + 268, sw - 40, 120, 36); ctx.fillStyle = 'rgba(44,49,70,0.98)'; ctx.fill();
    ctx.font = '42px Inter600'; ctx.fillStyle = '#7fa8ff'; ctx.fillText('Cancel', p.cx, hy + 328);
  }
  ctx.restore();
}

// ---------- CONTACT INFO of member 43: the profile photo is a photo of YOU, from behind, in the mess hall ----------
// st: {photo 0..1 (loads in), zoom (photo zoom 1..), hlNum, hlAbout, scale, shake, bg, rec (red 'just now' tag)}
function drawMemberInfo(ctx, t, st = {}) {
  S.drawPhone(ctx, t, { screen: 'info', scale: st.scale, shake: st.shake, bg: st.bg });
  const p = S.PH;
  ctx.save();
  const bob = Math.sin(t * 1.3) * 6; const [sx, sy] = st.shake || [0, 0];
  ctx.translate(p.cx + sx, p.cy + bob + sy); ctx.rotate(-0.035); ctx.scale(st.scale || 1, st.scale || 1); ctx.translate(-p.cx, -p.cy);
  const x0 = p.cx - p.w / 2 + 20, y0 = p.cy - p.h / 2 + 20, sw = p.w - 40, sh = p.h - 40;
  rrect(ctx, x0, y0, sw, sh, 74); ctx.clip();
  ctx.fillStyle = '#0d1122'; ctx.fillRect(x0, y0, sw, sh);
  // photo (square, top)
  const ph = sw, py = y0;
  ctx.save(); ctx.beginPath(); ctx.rect(x0, py, sw, ph); ctx.clip();
  const pa = clamp(st.photo ?? 1);
  if (pa > 0) {
    const z = 0.43 * (st.zoom || 1);
    ctx.save(); ctx.translate(x0 + sw / 2, py + ph / 2); ctx.scale(z, z); ctx.translate(-540, -(st.photoCy || 1380));
    if (pa < 1) ctx.filter = `blur(${((1 - pa) * 30).toFixed(1)}px)`;
    drawMess(ctx, t, { lift: 0.15, stop: 1, turn: 1, me: { x: 540, y: 2120, s: 1.75 } });
    ctx.restore();
  }
  if (pa < 1) { ctx.fillStyle = `rgba(13,17,34,${1 - pa})`; ctx.fillRect(x0, py, sw, ph); }
  const sg = ctx.createLinearGradient(0, py + ph - 200, 0, py + ph); sg.addColorStop(0, 'rgba(13,17,34,0)'); sg.addColorStop(1, 'rgba(13,17,34,0.95)');
  ctx.fillStyle = sg; ctx.fillRect(x0, py + ph - 200, sw, 200);
  ctx.restore();
  // back arrow + rec tag
  ctx.font = '54px Inter400'; ctx.fillStyle = '#eef1f8'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('‹', x0 + 40, y0 + 120);
  if (st.rec > 0) {
    ctx.save(); ctx.globalAlpha = clamp(st.rec); rrect(ctx, x0 + sw - 250, y0 + 80, 210, 54, 27); ctx.fillStyle = 'rgba(196,16,42,0.9)'; ctx.fill();
    ctx.font = '26px Mono700'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText('3:01 · NOW', x0 + sw - 145, y0 + 116); ctx.restore();
  }
  // name + number
  let y = py + ph + 20;
  ctx.textAlign = 'center';
  ctx.font = '50px Inter600'; ctx.fillStyle = '#f0f2f8'; ctx.fillText('Room 13', p.cx, y + 40);
  ctx.font = '25px Mono500'; ctx.fillStyle = 'rgba(200,206,224,0.6)'; ctx.fillText('MEMBER 43 OF 43', p.cx, y + 86);
  y += 130;
  const row = (label, val, hl, yy, col) => {
    rrect(ctx, x0 + 30, yy, sw - 60, 120, 26); ctx.fillStyle = 'rgba(34,39,58,0.95)'; ctx.fill();
    if (hl > 0) { ctx.save(); ctx.globalAlpha = clamp(hl); ctx.lineWidth = 6; ctx.strokeStyle = col || C.lime; ctx.stroke(); ctx.restore(); }
    ctx.textAlign = 'left'; ctx.font = '22px Inter500'; ctx.fillStyle = 'rgba(200,206,224,0.55)'; ctx.fillText(label, x0 + 64, yy + 42);
    ctx.font = '40px Inter600'; ctx.fillStyle = hl > 0.5 ? (col || C.lime) : '#eef1f8'; ctx.fillText(val, x0 + 64, yy + 94);
  };
  row('Phone', '+91 98•••  ••043  (You)', st.hlNum || 0, y, C.red);
  row('About', 'Block C · Room 13', st.hlAbout || 0, y + 140, C.red);
  rrect(ctx, p.cx - 80, y0 + 26, 160, 46, 23); ctx.fillStyle = '#000'; ctx.fill();
  ctx.restore();
}

// ---------- HOSTEL CORRIDOR (1-point perspective, adapted from drawCorridor) ----------
const VX = 540, VY = 860, HW = 430, CEIL = -620, FLR = 820, FAR = 8;
const P = (X, Y, d) => [VX + X / d, VY + Y / d];
const CDOORS = [[-1, 1.15, 1.55, '13'], [1, 2.35, 2.75, '12'], [-1, 3.1, 3.45, '11'], [1, 4.1, 4.4, '10'], [-1, 5.1, 5.4, '9'], [1, 1.0, 1.4, '14']];
function doorDepth(n) { const d = CDOORS.find(x => x[3] === String(n)); return d ? (d[1] + d[2]) / 2 : 6; }
function drawHostelCorridor(ctx, t, st = {}) {
  const lights = st.lights || [1, 1, 1, 1, 1];
  const amb = lights.reduce((a, b) => a + b, 0) / lights.length;
  const dn = 0.45;
  ctx.fillStyle = '#04060d'; ctx.fillRect(-800, -800, W + 1600, H + 1600);
  const wallG = (x0, x1) => { const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, `rgb(${14 + 10 * amb},${22 + 16 * amb},${36 + 14 * amb})`); g.addColorStop(1, '#060a12'); return g; };
  poly(ctx, [P(-HW, CEIL, dn), P(-HW, CEIL, FAR), P(-HW, FLR, FAR), P(-HW, FLR, dn)], wallG(P(-HW, 0, dn)[0], P(-HW, 0, FAR)[0]));
  poly(ctx, [P(HW, CEIL, dn), P(HW, CEIL, FAR), P(HW, FLR, FAR), P(HW, FLR, dn)], wallG(P(HW, 0, dn)[0], P(HW, 0, FAR)[0]));
  // green oil-paint dado on both walls
  for (const X of [-HW, HW]) poly(ctx, [P(X, 260, dn), P(X, 260, FAR), P(X, FLR, FAR), P(X, FLR, dn)], `rgba(${20 + 14 * amb},${48 + 30 * amb},${44 + 18 * amb},0.55)`);
  poly(ctx, [P(-HW, CEIL, dn), P(HW, CEIL, dn), P(HW, CEIL, FAR), P(-HW, CEIL, FAR)], '#06080f');
  let g = ctx.createLinearGradient(0, P(0, FLR, dn)[1], 0, P(0, FLR, FAR)[1]);
  g.addColorStop(0, `rgb(${10 + 8 * amb},${14 + 12 * amb},${22 + 10 * amb})`); g.addColorStop(1, '#05070d');
  poly(ctx, [P(-HW, FLR, dn), P(HW, FLR, dn), P(HW, FLR, FAR), P(-HW, FLR, FAR)], g);
  // floor tiles
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2;
  for (let X = -HW; X <= HW; X += 143) { ctx.beginPath(); ctx.moveTo(...P(X, FLR, dn)); ctx.lineTo(...P(X, FLR, FAR)); ctx.stroke(); }
  for (let d = 0.6; d < FAR; d *= 1.25) { ctx.beginPath(); ctx.moveTo(...P(-HW, FLR, d)); ctx.lineTo(...P(HW, FLR, d)); ctx.stroke(); }
  // far wall with a barred window (moonlight)
  poly(ctx, [P(-HW, CEIL, FAR), P(HW, CEIL, FAR), P(HW, FLR, FAR), P(-HW, FLR, FAR)], '#0a0f1c');
  const [wx0, wy0] = P(-200, -300, FAR), [wx1, wy1] = P(200, 250, FAR);
  ctx.fillStyle = 'rgba(70,100,170,0.75)'; ctx.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
  ctx.fillStyle = '#0a0f1c'; for (let i = 1; i < 5; i++) ctx.fillRect(wx0 + i * (wx1 - wx0) / 5 - 2, wy0, 4, wy1 - wy0);
  glow(ctx, (wx0 + wx1) / 2, (wy0 + wy1) / 2, 320, 'rgba(90,120,200,A)', 0.25 * (st.moon ?? 1));
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  g = ctx.createLinearGradient(0, P(0, FLR, FAR)[1], 0, P(0, FLR, 1.0)[1]);
  g.addColorStop(0, `rgba(90,120,200,${0.22 * (st.moon ?? 1)})`); g.addColorStop(1, 'rgba(90,120,200,0)');
  poly(ctx, [P(-200, FLR, FAR), P(200, FLR, FAR), P(330, FLR, 1.2), P(-330, FLR, 1.2)], g); ctx.restore();
  // notice board on the right wall
  { const X = HW, d1 = 1.55, d2 = 2.15; poly(ctx, [P(X, -260, d1), P(X, -260, d2), P(X, 60, d2), P(X, 60, d1)], '#2a2620');
    poly(ctx, [P(X, -230, d1 + 0.08), P(X, -230, d1 + 0.3), P(X, -40, d1 + 0.3), P(X, -40, d1 + 0.08)], 'rgba(200,200,190,0.35)');
    poly(ctx, [P(X, -190, d1 + 0.36), P(X, -190, d1 + 0.55), P(X, 30, d1 + 0.55), P(X, 30, d1 + 0.36)], 'rgba(200,200,190,0.25)'); }
  // doors
  const glowD = st.doorGlow || {};
  for (const [side, d1, d2, label] of CDOORS) {
    const X = side * HW;
    poly(ctx, [P(X, -200, d1), P(X, -200, d2), P(X, FLR, d2), P(X, FLR, d1)], '#1b2348');
    ctx.strokeStyle = 'rgba(60,72,112,0.9)'; ctx.lineWidth = 3;
    ctx.beginPath(); [P(X, -200, d1), P(X, -200, d2), P(X, FLR, d2), P(X, FLR, d1)].forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.closePath(); ctx.stroke();
    const dm = (d1 + d2) / 2, [nx, ny] = P(X, -120, dm);
    // number plate
    const pw = 90 / dm, ph = 60 / dm;
    ctx.fillStyle = 'rgba(210,214,224,0.75)'; ctx.fillRect(nx - pw / 2, ny - ph / 2, pw, ph);
    ctx.font = `${Math.round(46 / dm)}px Osw700`; ctx.fillStyle = '#0b1022'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, nx, ny + 2); ctx.textBaseline = 'alphabetic';
    // light under the door when the room answers
    const gl = glowD[label] || 0;
    if (gl > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      poly(ctx, [P(X, FLR - 10, d1), P(X, FLR - 10, d2), P(X, FLR, d2), P(X, FLR, d1)], `rgba(255,230,180,${0.9 * gl})`);
      const [ax, ay] = P(X, FLR, dm);
      glow(ctx, ax - side * 30 / dm, ay, 220 / dm, 'rgba(255,220,170,A)', 0.4 * gl);
      ctx.restore();
    }
  }
  // tube lights (cold green)
  const LD = [0.9, 1.7, 2.7, 3.9, 5.4];
  LD.forEach((d, i) => {
    const on = lights[i] ?? 1;
    poly(ctx, [P(-110, CEIL, d), P(110, CEIL, d), P(110, CEIL, d + 0.12), P(-110, CEIL, d + 0.12)], on > 0.05 ? `rgba(215,255,228,${0.25 + 0.75 * on})` : '#10141c');
    if (on > 0.05) {
      const [lx, ly] = P(0, FLR, d + 0.1);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const gg = ctx.createRadialGradient(lx, ly, 0, lx, ly, 560 / d);
      gg.addColorStop(0, `rgba(140,200,170,${0.22 * on})`); gg.addColorStop(1, 'rgba(140,200,170,0)');
      ctx.translate(lx, ly); ctx.scale(1, 0.35); ctx.translate(-lx, -ly); ctx.fillStyle = gg; ctx.fillRect(lx - 700, ly - 700, 1400, 1400);
      ctx.restore();
      glow(ctx, ...P(0, CEIL, d + 0.06), 300 / d, 'rgba(170,240,200,A)', 0.3 * on);
    }
  });
  // the warden
  if (st.warden) {
    const w = st.warden, [x, y] = P(w.X || 0, FLR, w.d);
    drawWarden(ctx, x, y, (1.85 / w.d), { t, ...w });
  }
}

// ---------- DOOR GAP (low, inside the room, looking at the bottom of the door) ----------
function drawDoorGap(ctx, t, st = {}) {
  const L = st.light ?? 1, red = st.red || 0;
  const col = (a) => `rgba(${Math.round(lerp(205, 255, red))},${Math.round(lerp(240, 36, red))},${Math.round(lerp(215, 48, red))},${a})`;
  ctx.fillStyle = '#03040a'; ctx.fillRect(-600, -600, W + 1200, H + 1200);
  // wall + frame
  ctx.fillStyle = '#10162e'; ctx.fillRect(-600, -600, W + 1200, 1840);
  ctx.fillStyle = '#2a3253'; ctx.fillRect(60, -600, 960, 1840);
  // door
  const g = ctx.createLinearGradient(100, 0, 980, 0); g.addColorStop(0, '#1a2247'); g.addColorStop(1, '#141b3b');
  ctx.fillStyle = g; ctx.fillRect(100, -600, 880, 1830);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 6; ctx.strokeRect(180, 330, 720, 760);
  ctx.save(); ctx.translate(909, 528); ctx.rotate(st.handle || 0); ctx.fillStyle = '#5a6488'; ctx.fillRect(-49, -8, 70, 16); ctx.restore();
  ctx.fillStyle = '#5a6488'; ctx.fillRect(900, 496, 18, 64);
  // floor
  const fg = ctx.createLinearGradient(0, 1240, 0, 1920); fg.addColorStop(0, '#0b1024'); fg.addColorStop(1, '#03050b');
  ctx.fillStyle = fg; ctx.fillRect(-600, 1240, W + 1200, 1200);
  // the gap: light strip + spill
  const page = st.page || 0;
  const strip = (x0, x1) => { ctx.fillStyle = col(0.95 * L); ctx.fillRect(x0, 1228, x1 - x0, 14); };
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const sg = ctx.createLinearGradient(0, 1240, 0, 1900); sg.addColorStop(0, col(0.42 * L)); sg.addColorStop(1, col(0));
  poly(ctx, [[100, 1240], [980, 1240], [1300, 1900], [-220, 1900]], sg);
  ctx.restore();
  strip(100, 980);
  glow(ctx, 540, 1236, 520, red > 0.5 ? 'rgba(255,40,50,A)' : 'rgba(190,240,210,A)', 0.18 * L);
  // feet shadows
  const f = st.feet || 0;
  if (f > 0) {
    const cx = lerp(1250, st.feetX ?? 540, E.out(clamp(f)));
    const turn = st.toes || 0; // toes point at the gap
    for (const o of [-120, 50]) {
      const x = cx + o;
      ctx.fillStyle = '#000'; ctx.fillRect(x, 1224, 72, 20);
      ctx.save(); ctx.globalAlpha = 0.9;
      poly(ctx, [[x, 1242], [x + 72, 1242], [x + 72 + (x - 540) * 0.5 + 60 + turn * 30, 1920], [x + (x - 540) * 0.5 - 60 - turn * 30, 1920]], 'rgba(0,0,0,0.8)');
      ctx.restore();
    }
  }
  // PART 4: the whole block walking past the door (feet shadow pairs crossing the strip)
  for (const wx of st.walkers || []) {
    for (const o of [-60, 40]) {
      const x = wx + o + (o < 0 ? 1 : -1) * 18 * Math.sin(t * 7 + wx);
      if (x < 40 || x > 1040) continue;
      ctx.fillStyle = '#000'; ctx.fillRect(x, 1224, 60, 20);
      poly(ctx, [[x, 1242], [x + 60, 1242], [x + 60 + (x - 540) * 0.5 + 50, 1920], [x + (x - 540) * 0.5 - 50, 1920]], 'rgba(0,0,0,0.7)');
    }
  }
  // a page turning: a thin shadow sweeps the strip
  if (page > 0 && page < 1) { const x = lerp(cx0(st), cx0(st) + 260, page); ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(x, 1226, 26, 18); }
  ctx.fillStyle = `rgba(1,2,6,${st.dark ?? 0})`; ctx.fillRect(-600, -600, W + 1200, H + 1200);
}
const cx0 = st => (st.feetX ?? 540) - 160;

// ---------- THE REGISTER (insert) ----------
const REG = [['9', 'ANKIT SHARMA', 'P'], ['10', 'ROHAN VERMA', 'P'], ['11', 'DEV MALIK', 'P'], ['12', 'IMRAN KHAN', 'P'], ['13', 'KABIR MEHTA', 'P']];
function drawRegister(ctx, t, st = {}) {
  ctx.fillStyle = '#05070e'; ctx.fillRect(-600, -600, W + 1200, H + 1200);
  ctx.save(); ctx.translate(540, 960); ctx.rotate(0.03); ctx.translate(-540, -960);
  const x0 = 70, x1 = 1010, y0 = 260, y1 = 1700;
  const pg = ctx.createLinearGradient(0, y0, 0, y1); pg.addColorStop(0, '#b9b4a4'); pg.addColorStop(1, '#a29d8d');
  ctx.fillStyle = pg; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  // gutter shadow
  const gg = ctx.createLinearGradient(x0, 0, x0 + 90, 0); gg.addColorStop(0, 'rgba(0,0,0,0.45)'); gg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gg; ctx.fillRect(x0, y0, 90, y1 - y0);
  const ink = '#1a2140';
  ctx.fillStyle = ink; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  ctx.font = '40px Mono700'; spaced(ctx, 'BLOCK C · NIGHT ROLL CALL', 140, 350, 3);
  ctx.font = '34px Mono500'; ctx.fillStyle = 'rgba(26,33,64,0.8)'; ctx.fillText('12:07 AM', 140, 410); ctx.textAlign = 'right'; ctx.fillText(st.date || '12 / 11', x1 - 50, 410); ctx.textAlign = 'left';
  // columns
  ctx.fillStyle = 'rgba(26,33,64,0.55)'; ctx.fillRect(130, 450, x1 - 180, 4);
  for (const cx of [250, 820]) ctx.fillRect(cx, 450, 3, 1180);
  ctx.font = '30px Mono700'; ctx.fillStyle = ink; ctx.fillText('ROOM', 140, 500); ctx.fillText('NAME', 280, 500); ctx.fillText('MARK', 845, 500);
  const rows = [...REG];
  for (let i = 0; i < 8; i++) { ctx.fillStyle = 'rgba(26,33,64,0.3)'; ctx.fillRect(130, 530 + i * 140, x1 - 180, 2); }
  rows.forEach(([room, name, m], i) => {
    const y = 620 + i * 140;
    ctx.font = '54px Osw600'; ctx.fillStyle = ink; ctx.fillText(room, 150, y);
    ctx.font = '50px Inter500'; ctx.fillText(name, 280, y);
    ctx.font = '60px Osw700'; ctx.fillStyle = '#2b3a8a'; ctx.fillText(m, 880, y);
  });
  // the new row: room 13, a name in red ink being written
  const y = 620 + 5 * 140;
  ctx.font = '54px Osw600'; ctx.fillStyle = C.red; ctx.fillText('13', 150, y);
  const w = clamp(st.write || 0);
  if (w > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(270, y - 80, 530 * w, 120); ctx.clip();
    ctx.strokeStyle = '#c4102a'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(290, y - 10);
    for (let i = 0; i < 60; i++) { const xx = 290 + i * 8.5, yy = y - 14 + Math.sin(i * 1.9) * 26 * (0.5 + hash(i) * 0.6) - (i % 7 === 0 ? 24 : 0); ctx.lineTo(xx, yy); }
    ctx.stroke(); ctx.restore();
  }
  const mk = clamp(st.mark || 0);
  if (mk > 0) {
    ctx.save(); ctx.globalAlpha = mk; ctx.translate(912, y - 22); ctx.rotate(-0.12); const sc = lerp(1.6, 1, E.out(mk)); ctx.scale(sc, sc);
    ctx.font = '64px Osw700'; ctx.fillStyle = '#c4102a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('LEFT', 0, 0);
    ctx.strokeStyle = '#c4102a'; ctx.lineWidth = 5; ctx.strokeRect(-76, -42, 152, 84);
    ctx.restore();
  }
  if (st.dateHL > 0) {
    ctx.save(); ctx.globalAlpha = clamp(st.dateHL); ctx.strokeStyle = '#c4102a'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.ellipse(x1 - 120, 398, 110, 46, -0.05, 0, Math.PI * 2 * clamp(st.dateHL * 1.2)); ctx.stroke(); ctx.restore();
  }
  const ca = clamp(st.circle || 0);
  if (ca > 0) {
    ctx.save(); ctx.strokeStyle = '#c4102a'; ctx.lineWidth = 7; ctx.beginPath(); ctx.ellipse(905, y - 20, 62, 50, -0.2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ca); ctx.stroke(); ctx.restore();
  }
  ctx.restore();
  glow(ctx, st.lx ?? 540, st.ly ?? 1000, 900, 'rgba(120,140,200,A)', 0.08);
  const dg = ctx.createRadialGradient(540, 1000, 300, 540, 1000, 1100); dg.addColorStop(0, 'rgba(2,3,8,0)'); dg.addColorStop(1, 'rgba(2,3,8,0.85)');
  ctx.fillStyle = dg; ctx.fillRect(-600, -600, W + 1200, H + 1200);
}

// ---------- DOOR PLATE (corridor side, cold open) ----------
function drawPlate(ctx, t, st = {}) {
  const L = flicker(t, 21, 0.06);
  ctx.fillStyle = '#121a33'; ctx.fillRect(-600, -600, W + 1200, H + 1200);
  const g = ctx.createLinearGradient(0, 0, W, 0); g.addColorStop(0, '#1d2650'); g.addColorStop(1, '#151c3c');
  ctx.fillStyle = g; ctx.fillRect(160, -600, 760, 3200);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 6; ctx.strokeRect(240, 1160, 600, 900);
  // plate
  rrect(ctx, 300, 560, 480, 300, 16); ctx.fillStyle = '#c9ccd4'; ctx.fill();
  rrect(ctx, 318, 578, 444, 264, 10); ctx.lineWidth = 4; ctx.strokeStyle = '#7d8398'; ctx.stroke();
  ctx.fillStyle = '#0b1022'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.font = '40px Mono700'; spaced(ctx, 'BLOCK C', 540, 650, 10, 'center');
  ctx.font = '170px Osw700'; ctx.fillText('13', 540, 815);
  for (const [x, y] of [[330, 590], [750, 590], [330, 830], [750, 830]]) { ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fillStyle = '#6a7088'; ctx.fill(); }
  // empty name-card slot
  rrect(ctx, 340, 920, 400, 100, 8); ctx.fillStyle = '#2a3253'; ctx.fill(); ctx.strokeStyle = '#5a6488'; ctx.stroke();
  ctx.font = '26px Mono500'; ctx.fillStyle = 'rgba(200,206,224,0.35)'; ctx.fillText('— — —', 540, 980);
  // tube light from above
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const lg = ctx.createLinearGradient(0, 0, 0, 1400); lg.addColorStop(0, `rgba(160,230,190,${0.22 * L})`); lg.addColorStop(1, 'rgba(160,230,190,0)');
  ctx.fillStyle = lg; ctx.fillRect(-600, 0, W + 1200, 1400); ctx.restore();
  if (L < 1) { ctx.fillStyle = `rgba(0,0,5,${(1 - L) * 0.6})`; ctx.fillRect(-600, -600, W + 1200, H + 1200); }
}

// ---------- DOORWAY (inside room 13, looking at the door; it swings in onto the dead corridor) ----------
// st: {open 0..1, bolt 0..1 (slid), book 0..1 (register on the threshold), me {x,y,s} (you, from behind), dark}
function drawDoorway(ctx, t, st = {}) {
  const op = clamp(st.open || 0);
  ctx.fillStyle = '#03040a'; ctx.fillRect(-600, -600, W + 1200, H + 1200);
  ctx.fillStyle = '#10162e'; ctx.fillRect(-600, -600, W + 1200, 1840);
  ctx.fillStyle = '#2a3253'; ctx.fillRect(60, -600, 960, 1840);
  // the corridor beyond (visible through the opening)
  ctx.save(); ctx.beginPath(); ctx.rect(100, -600, 880, 1840); ctx.clip();
  ctx.translate(540, 760); ctx.scale(0.58, 0.58); ctx.translate(-540, -860);
  drawHostelCorridor(ctx, t, { lights: [0, 0, 0, 0, 0], moon: st.moon ?? 0.9, warden: st.warden });
  ctx.restore();
  // room floor
  const fg = ctx.createLinearGradient(0, 1240, 0, 1920); fg.addColorStop(0, '#0b1024'); fg.addColorStop(1, '#03050b');
  ctx.fillStyle = fg; ctx.fillRect(-600, 1240, W + 1200, 1200);
  // moonlight spilling in through the opening
  if (op > 0.05) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const sg = ctx.createLinearGradient(0, 1240, 0, 1920); sg.addColorStop(0, `rgba(90,120,200,${0.22 * op})`); sg.addColorStop(1, 'rgba(90,120,200,0)');
    poly(ctx, [[100 + 880 * (1 - op) * 0.2, 1240], [980, 1240], [1350, 1920], [-200, 1920]], sg); ctx.restore();
  }
  // the register, lying open on the threshold
  const bk = clamp(st.book || 0);
  if (bk > 0) {
    ctx.save(); ctx.globalAlpha = bk; ctx.translate(560, 1268);
    poly(ctx, [[-170, 0], [0, -12], [0, 40], [-190, 46]], '#a9a495'); poly(ctx, [[0, -12], [170, 0], [190, 46], [0, 40]], '#b9b4a4');
    ctx.fillStyle = 'rgba(26,33,64,0.55)'; for (let i = 0; i < 4; i++) { ctx.fillRect(-150 + i * 4, 4 + i * 9, 120, 3); ctx.fillRect(24, 4 + i * 9, 120 - i * 6, 3); }
    ctx.fillStyle = '#c4102a'; ctx.fillRect(30, 34, 110, 4);
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(-2, -12, 4, 52);
    ctx.restore();
    glow(ctx, 560, 1280, 260, 'rgba(160,180,240,A)', 0.12 * bk);
  }
  // the door panel, hinged on the left, swinging toward you
  const ang = op * 1.38, sn = Math.sin(ang), cs = Math.cos(ang);
  const fx = 100 + 880 * cs, top = -600 - 260 * sn, bot = 1240 + 150 * sn;
  const g = ctx.createLinearGradient(100, 0, Math.max(fx, 101), 0); g.addColorStop(0, '#1a2247'); g.addColorStop(1, op > 0 ? '#0e1430' : '#141b3b');
  poly(ctx, [[100, -600], [fx, top], [fx, bot], [100, 1240]], g);
  if (op < 0.02) {
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 6; ctx.strokeRect(180, 330, 720, 760);
    // gap strip (dim: the corridor is dead)
    ctx.fillStyle = 'rgba(90,120,200,0.55)'; ctx.fillRect(100, 1228, 880, 12);
  }
  // handle + tower bolt on the free edge
  const hx = 100 + (909 - 100) * cs, hy = 528 + (top + 600) * 0.3;
  ctx.fillStyle = '#5a6488'; ctx.fillRect(hx - 9, hy - 32, 18, 64);
  if (op < 0.3) {
    const b = clamp(st.bolt ?? 1);
    ctx.fillRect(hx - 70, 830, 60, 22); ctx.fillStyle = '#8a94b8'; ctx.fillRect(hx - 64 + lerp(30, 0, b), 836, 60, 10); ctx.fillRect(hx - 50 + lerp(30, 0, b), 820, 12, 26);
  }
  if (st.me) drawStick(ctx, { view: 'back', fill: '#05070f', color: 'rgba(225,232,250,0.9)', ...st.me });
  if (st.dark > 0) { ctx.fillStyle = `rgba(1,2,6,${st.dark})`; ctx.fillRect(-600, -600, W + 1200, H + 1200); }
}

// ---------- UNDER KABIR'S BED (floor level, the dark under the iron frame) ----------
// st: {hand 0..1 (long fingers slide out of the dark), breath 0..1, moon}
function drawUnderBed(ctx, t, st = {}) {
  ctx.fillStyle = '#02030a'; ctx.fillRect(-600, -600, W + 1200, H + 1200);
  // wall far behind (barely visible) + floor
  ctx.fillStyle = '#0c1126'; ctx.fillRect(-600, -600, W + 1200, 1100);
  let g = ctx.createLinearGradient(0, 1040, 0, 2000); g.addColorStop(0, '#0b1024'); g.addColorStop(1, '#04060d');
  ctx.fillStyle = g; ctx.fillRect(-600, 1040, W + 1200, 1100);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 3;
  for (let i = -8; i < 16; i++) { ctx.beginPath(); ctx.moveTo(540 + i * 90, 1040); ctx.lineTo(540 + i * 330, 2100); ctx.stroke(); }
  // moonlight shaft across the floor (from the window, right)
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  g = ctx.createLinearGradient(1100, 0, 300, 0); g.addColorStop(0, `rgba(110,140,220,${0.20 * (st.moon ?? 1)})`); g.addColorStop(1, 'rgba(110,140,220,0)');
  poly(ctx, [[1300, 1300], [1300, 1900], [200, 2000], [420, 1400]], g); ctx.restore();
  // bed: mattress underside + iron frame, very close
  ctx.fillStyle = '#121933'; ctx.fillRect(-600, 380, W + 1200, 240);
  ctx.strokeStyle = '#3a4469'; ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(-600, 630); ctx.lineTo(W + 600, 630); ctx.stroke();
  ctx.lineWidth = 26; for (const x of [40, 1040]) { ctx.beginPath(); ctx.moveTo(x, 630); ctx.lineTo(x, 1180); ctx.stroke(); }
  // the black under the bed
  g = ctx.createLinearGradient(0, 640, 0, 1180); g.addColorStop(0, '#000'); g.addColorStop(1, '#010104');
  ctx.fillStyle = g; ctx.fillRect(54, 642, 972, 538);
  // blanket edge hanging down over the opening, it moves with a slow breath
  const br = (st.breath || 0) * Math.sin(t * 2 * Math.PI / 3.4);
  ctx.beginPath(); ctx.moveTo(-600, 600);
  for (let i = 0; i <= 24; i++) { const x = -600 + i * (W + 1200) / 24; ctx.lineTo(x, 770 + Math.sin(i * 1.3) * 24 + noise1(i * 0.7) * 30 + br * 22 * Math.sin(i * 0.4 + 1)); }
  ctx.lineTo(W + 600, 600); ctx.closePath(); ctx.fillStyle = '#273163'; ctx.fill();
  ctx.strokeStyle = 'rgba(160,180,240,0.12)'; ctx.lineWidth = 3; ctx.stroke();
  // dust in the moonlight, pushed by the breath
  ctx.fillStyle = 'rgba(200,215,255,0.35)';
  for (let i = 0; i < 26; i++) { const x = 300 + hash(i * 3.1) * 700 + br * 30 * hash(i), y = 1200 + hash(i * 7.7) * 500 + Math.sin(t * 0.6 + i) * 12; ctx.fillRect(x, y, 3, 3); }
  // PART 4: the torch beam inside the dark (items, the wrapped shape, the scratched number)
  const tr = clamp(st.torch || 0);
  if (tr > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(54, 642, 972, 538); ctx.clip();
    // inside: far wall + floor receding to a vanishing point
    ctx.fillStyle = '#151b30'; ctx.fillRect(54, 642, 972, 230);
    let fg2 = ctx.createLinearGradient(0, 860, 0, 1180); fg2.addColorStop(0, '#1a2138'); fg2.addColorStop(1, '#2a3150');
    ctx.fillStyle = fg2; ctx.fillRect(54, 860, 972, 320);
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 3;
    for (let i = -6; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(540 + i * 60, 860); ctx.lineTo(540 + i * 210, 1180); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(54, 860); ctx.lineTo(1026, 860); ctx.stroke();
    if (st.items) {
      // one slipper
      ctx.save(); ctx.translate(205, 1118); ctx.rotate(-0.25); rrect(ctx, -70, -22, 140, 44, 20); ctx.fillStyle = '#3c5a8a'; ctx.fill();
      ctx.strokeStyle = '#7f9cc8'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-10, -20); ctx.quadraticCurveTo(25, -48, 55, -18); ctx.stroke(); ctx.restore();
      // the steel mess plate (thali)
      ctx.save(); ctx.translate(865, 1122);
      ctx.beginPath(); ctx.ellipse(0, 0, 92, 26, 0, 0, 7); ctx.fillStyle = '#9aa4b8'; ctx.fill();
      ctx.beginPath(); ctx.ellipse(0, -2, 74, 19, 0, 0, 7); ctx.fillStyle = '#c3cad8'; ctx.fill();
      ctx.beginPath(); ctx.ellipse(-28, -4, 18, 5, 0, 0, 7); ctx.fillStyle = '#e8ecf4'; ctx.fill(); ctx.restore();
    }
    const sh = clamp(st.shape || 0);
    if (sh > 0) {
      ctx.save(); ctx.globalAlpha = sh;
      // the wrapped shape: head near you (front left), feet into the far wall (back right), longer than the bed
      const path = [[250, 1050], [420, 1010], [640, 950], [860, 900], [1080, 860], [1080, 905], [870, 955], [660, 1020], [440, 1090], [270, 1135]];
      const br2 = Math.sin(t * 2 * Math.PI / 3.4) * 6 * (st.breath ?? 1);
      ctx.beginPath(); path.forEach(([x, y], i) => { const yy = y + (i < 5 ? -br2 : 0); i ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); }); ctx.closePath();
      ctx.fillStyle = '#3a4789'; ctx.fill(); ctx.strokeStyle = 'rgba(190,205,250,0.45)'; ctx.lineWidth = 4; ctx.stroke();
      ctx.strokeStyle = 'rgba(10,14,30,0.55)'; ctx.lineWidth = 5;
      for (const [x0, y0, x1, y1] of [[380, 1030, 420, 1100], [520, 990, 560, 1060], [690, 945, 720, 1005], [850, 905, 880, 950], [990, 880, 1010, 915]]) { ctx.beginPath(); ctx.moveTo(x0, y0 - br2); ctx.quadraticCurveTo(x0 + 30, (y0 + y1) / 2, x1, y1); ctx.stroke(); }
      // the head: smooth, pale, no face; turns toward you
      const ht = clamp(st.headTurn || 0);
      const hx = 205, hy = 1088 - br2 * 0.5, hr = 66;
      ctx.beginPath(); ctx.arc(hx, hy, hr, 0, 7); ctx.fillStyle = '#0d1226'; ctx.fill();
      if (ht > 0) {
        ctx.save(); ctx.beginPath(); ctx.arc(hx, hy, hr, 0, 7); ctx.clip();
        ctx.beginPath(); ctx.ellipse(hx + lerp(70, 0, ht), hy, hr * lerp(0.2, 1, ht), hr, 0, 0, 7);
        const hg = ctx.createRadialGradient(hx - 18, hy - 22, 6, hx, hy, hr); hg.addColorStop(0, '#f2f4fa'); hg.addColorStop(1, '#a9b2cb');
        ctx.fillStyle = hg; ctx.fill(); ctx.restore();
      }
      ctx.lineWidth = 5; ctx.strokeStyle = `rgba(238,241,247,${0.35 + 0.55 * ht})`; ctx.beginPath(); ctx.arc(hx, hy, hr, 0, 7); ctx.stroke();
      ctx.restore();
    }
    const sc = clamp(st.scratch || 0);
    if (sc > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(330, 900, 420 * sc, 300); ctx.clip();
      ctx.translate(540, 1150); ctx.transform(1, 0, -0.35, 0.55, 0, 0);
      ctx.font = '300px Osw700'; ctx.textAlign = 'center';
      ctx.lineWidth = 9; ctx.strokeStyle = 'rgba(0,0,0,0.75)'; ctx.strokeText('43', 6, 6);
      ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(225,215,190,0.95)'; ctx.strokeText('43', 0, 0);
      ctx.strokeStyle = 'rgba(225,215,190,0.55)'; ctx.lineWidth = 2;
      for (let i = 0; i < 40; i++) { const x = -150 + hash(i * 1.7) * 300, y = -220 + hash(i * 3.3) * 220; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 10 + hash(i) * 30, y + 6 + hash(i * 2) * 20); ctx.stroke(); }
      ctx.restore();
    }
    // dust in the beam
    ctx.fillStyle = 'rgba(240,235,215,0.7)';
    for (let i = 0; i < 40; i++) { const x = 60 + hash(i * 5.1) * 960 + Math.sin(t * 0.4 + i) * 20, y = 820 + hash(i * 9.7) * 340 + Math.cos(t * 0.5 + i * 2) * 14; ctx.fillRect(x, y, 3, 3); }
    // darkness with a torch-shaped hole
    const tx = st.tx ?? 540, ty = st.ty ?? 1060, R = (st.tr ?? 420) * (0.6 + 0.4 * tr);
    const fl = tr * (st.flick ? (0.55 + 0.45 * noise1(t * 30)) : 1);
    const mg = ctx.createRadialGradient(tx, ty, R * 0.15, tx, ty, R);
    mg.addColorStop(0, `rgba(0,0,0,${1 - fl})`); mg.addColorStop(0.6, `rgba(0,0,0,${1 - 0.75 * fl})`); mg.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = mg; ctx.fillRect(54, 642, 972, 538);
    ctx.globalCompositeOperation = 'lighter';
    const wg = ctx.createRadialGradient(tx, ty, 0, tx, ty, R * 0.8); wg.addColorStop(0, `rgba(255,240,200,${0.16 * fl})`); wg.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = wg; ctx.fillRect(54, 642, 972, 538);
    ctx.restore();
    // the blanket edge stays on top (redraw over the beam)
    ctx.beginPath(); ctx.moveTo(-600, 600);
    for (let i = 0; i <= 24; i++) { const x = -600 + i * (W + 1200) / 24; ctx.lineTo(x, 770 + Math.sin(i * 1.3) * 24 + noise1(i * 0.7) * 30 + br * 22 * Math.sin(i * 0.4 + 1)); }
    ctx.lineTo(W + 600, 600); ctx.closePath(); ctx.fillStyle = '#273163'; ctx.fill();
    ctx.lineWidth = 26; ctx.strokeStyle = '#3a4469'; for (const x of [40, 1040]) { ctx.beginPath(); ctx.moveTo(x, 630); ctx.lineTo(x, 1180); ctx.stroke(); }
  }
  if (st.dark) { ctx.fillStyle = `rgba(0,0,2,${st.dark})`; ctx.fillRect(-600, -600, W + 1200, H + 1200); }
  // the hand: long pale fingers sliding out of the dark onto the lit floor
  const h = clamp(st.hand || 0);
  if (h > 0) {
    ctx.save(); ctx.translate(560, 1160 + 120 * E.out(h)); ctx.globalAlpha = clamp(h * 3);
    ctx.strokeStyle = '#b9c2dc'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.lineWidth = 30; ctx.beginPath(); ctx.moveTo(-30, -260); ctx.lineTo(-10, -40); ctx.stroke();
    ctx.lineWidth = 9;
    const fl = [[-58, 1.0], [-22, 1.25], [14, 1.2], [46, 1.0]];
    for (const [ox, k] of fl) { const L = (90 + 70 * h) * k; ctx.beginPath(); ctx.moveTo(ox * 0.6, -30); ctx.quadraticCurveTo(ox, L * 0.5, ox * 1.3 + (noise1(t * 1.5 + ox) - 0.5) * 8, L); ctx.stroke(); }
    ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-50, -60); ctx.quadraticCurveTo(-110, -20, -120, 30); ctx.stroke();
    ctx.restore();
    // the rest of the arm stays in the dark
    g = ctx.createLinearGradient(0, 640, 0, 1250); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.75, 'rgba(0,0,0,0.85)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    if (!tr) { ctx.fillStyle = g; ctx.fillRect(54, 790, 972, 400); }
  }
}


// ---------- MESS HALL AT 3 AM (front elevation, bright tube lights; students seen from behind) ----------
// st: {lights 0..1, lift (fn i->0..1 or number), stop (0..1 freezes spoons), turn 0..1 (heads turn: pale blank faces),
//      warden 0..1, book 0..1, page, emptyHL 0..1 (glow on the empty chair), steam 0..1, me {x,y,s}, dark}
const MROWS = [ { y: 1035, s: 0.46, n: 15, x0: 70, dx: 66 }, { y: 1240, s: 0.64, n: 12, x0: 40, dx: 92 }, { y: 1530, s: 0.92, n: 8, x0: 0, dx: 134 } ];
const MEMPTY = { row: 2, i: 7 };
function messSeat(r, i) { const R = MROWS[r]; return [R.x0 + R.dx * (i + 0.5) + (r === 1 ? 20 : 0), R.y]; }
function drawStudentBack(ctx, x, y, s, st) {
  const lw = 8.5; const col = st.col || C.white;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const rise = clamp(st.rise || 0);
  if (rise > 0) { // standing up: body lifts off the bench, legs straighten
    ctx.translate(0, -105 * rise);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-18, 105 * rise); ctx.moveTo(0, 0); ctx.lineTo(18, 105 * rise); ctx.stroke();
  }
  const lift = clamp(st.lift ?? 0) * (1 - rise);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -142);
  // resting arm
  ctx.moveTo(0, -130); ctx.lineTo(-30, -72); ctx.lineTo(-22, -40);
  // spoon arm: elbow out, hand up to the mouth and back down to the plate
  const ex = 40 + 10 * lift, ey = lerp(-78, -150, lift), hx = lerp(26, 12, lift), hy = lerp(-40, -176, lift);
  ctx.moveTo(0, -130); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy);
  ctx.stroke();
  ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx - 6, hy - 22); ctx.stroke();
  const turn = clamp(st.turn || 0);
  const hx0 = lerp(0, -4, turn), hy0 = -188;
  ctx.beginPath(); ctx.arc(hx0, hy0, 40, 0, Math.PI * 2);
  ctx.fillStyle = turn > 0 ? `rgb(${Math.round(lerp(11, 214, turn))},${Math.round(lerp(16, 219, turn))},${Math.round(lerp(34, 232, turn))})` : C.navy1;
  ctx.fill(); ctx.lineWidth = lw; ctx.stroke();
  if (turn > 0.6) { ctx.save(); ctx.globalAlpha = (turn - 0.6) / 0.4 * 0.35; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(hx0 - 12, hy0 - 14, 12, 8, -0.5, 0, 7); ctx.fill(); ctx.restore(); }
  ctx.restore();
}
function steamLines(ctx, x, y, s, t, a, seed = 0) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a * 0.35; ctx.strokeStyle = '#dfe8ff'; ctx.lineWidth = 4 * s; ctx.lineCap = 'round';
  for (let k = 0; k < 3; k++) {
    const ph = ((t * 0.6 + k / 3 + hash(seed)) % 1);
    ctx.globalAlpha = a * 0.35 * Math.sin(ph * Math.PI);
    ctx.beginPath();
    for (let j = 0; j <= 10; j++) { const yy = y - j * 9 * s - ph * 40 * s; const xx = x + (k - 1) * 16 * s + Math.sin(j * 0.8 + t * 3 + k) * 7 * s; j ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
    ctx.stroke();
  }
  ctx.restore();
}
function drawMess(ctx, t, st = {}) {
  const Lt = (st.lights ?? 1) * flicker(t, 33, 0.03);
  // wall
  const wg = ctx.createLinearGradient(0, -600, 0, 1000); wg.addColorStop(0, '#1f2a5c'); wg.addColorStop(0.55, '#33458e'); wg.addColorStop(1, '#2c3c7c');
  ctx.fillStyle = wg; ctx.fillRect(-700, -700, W + 1400, 1700);
  // tiled wainscot
  ctx.fillStyle = '#26346c'; ctx.fillRect(-700, 690, W + 1400, 320);
  ctx.strokeStyle = 'rgba(10,16,40,0.35)'; ctx.lineWidth = 2;
  for (let x = -700; x < W + 700; x += 60) { ctx.beginPath(); ctx.moveTo(x, 690); ctx.lineTo(x, 1010); ctx.stroke(); }
  for (let y = 690; y < 1010; y += 60) { ctx.beginPath(); ctx.moveTo(-700, y); ctx.lineTo(W + 700, y); ctx.stroke(); }
  ctx.fillStyle = '#1a2452'; ctx.fillRect(-700, 682, W + 1400, 10);
  // notice board + wall clock (3:00)
  rrect(ctx, 820, 330, 190, 250, 6); ctx.fillStyle = '#5b4a32'; ctx.fill();
  ctx.fillStyle = '#d9d4c2'; ctx.fillRect(842, 352, 146, 96); ctx.fillStyle = '#c9c4b0'; ctx.fillRect(850, 460, 120, 100);
  ctx.font = '22px Mono700'; ctx.fillStyle = '#1a2140'; ctx.textAlign = 'center'; ctx.fillText('MESS', 915, 390); ctx.font = '16px Mono500'; ctx.fillText('MENU · SUN', 915, 418);
  ctx.save(); ctx.translate(915, 632); ctx.scale(0.75, 0.75); ctx.beginPath(); ctx.arc(0, 0, 70, 0, 7); ctx.fillStyle = '#e8ebf2'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#141a33'; ctx.stroke();
  ctx.strokeStyle = '#141a33'; ctx.lineCap = 'round'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -50); ctx.stroke();
  ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(36, 0); ctx.stroke(); ctx.restore();
  ctx.textAlign = 'left';
  // serving counter + the warden behind it
  const wa = st.warden ?? 1;
  if (wa > 0) { ctx.save(); ctx.globalAlpha = wa; drawWarden(ctx, 600, 1000, 0.66, { t, book: st.book ?? 0.3, page: st.page || 0, rim: 0.9, rimCol: '#7f92d6', col: '#03050b' }); ctx.restore(); }
  const cg = ctx.createLinearGradient(0, 820, 0, 1000); cg.addColorStop(0, '#5a679a'); cg.addColorStop(1, '#3a4573');
  ctx.fillStyle = cg; ctx.fillRect(330, 830, 440, 175); ctx.fillStyle = '#7d8bc0'; ctx.fillRect(316, 818, 468, 16);
  for (const [px, pw] of [[380, 90], [500, 110], [640, 90]]) {
    rrect(ctx, px, 760, pw, 64, 14); ctx.fillStyle = '#9aa3c0'; ctx.fill(); ctx.fillStyle = '#6c7596'; ctx.fillRect(px, 760, pw, 10);
    steamLines(ctx, px + pw / 2, 752, 1.2, t, st.steam ?? 1, px);
  }
  // floor
  const fg = ctx.createLinearGradient(0, 1000, 0, 2000); fg.addColorStop(0, '#24306a'); fg.addColorStop(1, '#0f1534');
  ctx.fillStyle = fg; ctx.fillRect(-700, 1000, W + 1400, 1300);
  // rows of tables, back to front
  const liftOf = (r, i) => typeof st.lift === 'function' ? st.lift(r, i) : (st.lift ?? 0);
  MROWS.forEach((R, r) => {
    const s = R.s;
    // table top beyond the students (they face the counter)
    ctx.fillStyle = '#5d6a9e'; ctx.fillRect(-700, R.y - 150 * s, W + 1400, 26 * s);
    ctx.fillStyle = '#3d4878'; ctx.fillRect(-700, R.y - 124 * s, W + 1400, 50 * s);
    // plates on the table between the students
    for (let i = 0; i < R.n; i++) {
      const [x] = messSeat(r, i);
      ctx.beginPath(); ctx.ellipse(x + R.dx * 0.5 * (i % 2 ? -0.1 : 0.1), R.y - 146 * s, 38 * s, 9 * s, 0, 0, 7); ctx.fillStyle = '#c6cbd8'; ctx.fill();
      steamLines(ctx, x, R.y - 156 * s, s, t, (st.steam ?? 1) * 0.6, r * 31 + i);
    }
    // bench
    ctx.fillStyle = '#141b3c'; ctx.fillRect(-700, R.y + 2 * s, W + 1400, 26 * s);
    for (let i = 0; i < R.n; i++) {
      const [x, y] = messSeat(r, i);
      if (r === MEMPTY.row && i === MEMPTY.i) {
        // the empty place: covered plate with a white card, a stool, a glow
        const hl = st.emptyHL || 0;
        if (hl > 0) glow(ctx, x, y - 120 * s, 260 * s, 'rgba(198,255,58,A)', 0.22 * hl);
        rrect(ctx, x - 50 * s, y - 182 * s, 100 * s, 40 * s, 20 * s); ctx.fillStyle = '#d6dbe6'; ctx.fill();
        ctx.beginPath(); ctx.arc(x, y - 186 * s, 6 * s, 0, 7); ctx.fill();
        ctx.save(); ctx.translate(x + 4 * s, y - 196 * s); ctx.rotate(-0.08); ctx.fillStyle = '#ffffff'; ctx.fillRect(-26 * s, -16 * s, 52 * s, 30 * s); ctx.restore();
        ctx.strokeStyle = hl > 0 ? C.lime : 'rgba(238,241,247,0.5)'; ctx.lineWidth = 5 * s;
        ctx.strokeRect(x - 40 * s, y - 96 * s, 80 * s, 96 * s);
        continue;
      }
      const lift = (st.stop ? lerp(liftOf(r, i), 0.15, clamp(st.stop)) : liftOf(r, i));
      const tt = clamp((st.turn || 0) * 1.0 - hash(r * 50 + i) * 0.06);
      const rr = st.rise ? clamp(st.rise * 1.25 - hash(r * 70 + i) * 0.25) : 0;
      drawStudentBack(ctx, x, y, s, { lift, turn: tt, rise: rr });
    }
  });
  // you: in the doorway, foreground left
  if (st.me) drawStick(ctx, { x: st.me.x, y: st.me.y, s: st.me.s, arm: st.me.arm, lit: st.me.lit, view: 'back', walk: st.me.walk });
  // tube lights (bright, cold)
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const [y, w, xs] of [[90, 260, [130, 540, 950]], [230, 200, [180, 540, 900]], [340, 160, [230, 540, 850]]]) {
    for (const x of xs) {
      const g = ctx.createRadialGradient(x, y, 10, x, y, w * 1.6); g.addColorStop(0, `rgba(190,240,215,${0.28 * Lt})`); g.addColorStop(1, 'rgba(190,240,215,0)');
      ctx.fillStyle = g; ctx.fillRect(x - w * 1.6, y - w * 1.6, w * 3.2, w * 3.2);
    }
  }
  const lg = ctx.createLinearGradient(0, 0, 0, 1900); lg.addColorStop(0, `rgba(150,215,190,${0.16 * Lt})`); lg.addColorStop(1, 'rgba(150,215,190,0)');
  ctx.fillStyle = lg; ctx.fillRect(-700, -700, W + 1400, 2700);
  ctx.restore();
  for (const [y, w, xs] of [[90, 260, [130, 540, 950]], [230, 200, [180, 540, 900]], [340, 160, [230, 540, 850]]]) for (const x of xs) {
    rrect(ctx, x - w / 2, y - 7, w, 14, 7); ctx.fillStyle = `rgba(240,255,248,${0.35 + 0.65 * Lt})`; ctx.fill();
  }
  if (Lt < 1) { ctx.fillStyle = `rgba(0,0,6,${(1 - Lt) * 0.7})`; ctx.fillRect(-700, -700, W + 1400, 2900); }
  if (st.dark > 0) { ctx.fillStyle = `rgba(2,3,10,${st.dark})`; ctx.fillRect(-700, -700, W + 1400, 2900); }
}
const messEmpty = () => { const [x, y] = messSeat(MEMPTY.row, MEMPTY.i); return [x, y, MROWS[MEMPTY.row].s]; };

// ---------- COVERED PLATE close-up: steel thali under a dome, a folded card: ROOM 13 + tomorrow's date ----------
// st: {room 0..1 (card readable/lime), date 0..1 (date written in red), steam, lift (dome lift 0..1), dark}
function drawCoveredPlate(ctx, t, st = {}) {
  const Lt = flicker(t, 41, 0.03);
  const tg = ctx.createLinearGradient(0, -600, 0, 2400); tg.addColorStop(0, '#2c3a78'); tg.addColorStop(0.45, '#4b5893'); tg.addColorStop(1, '#273266');
  ctx.fillStyle = tg; ctx.fillRect(-700, -700, W + 1400, 3300);
  ctx.strokeStyle = 'rgba(10,14,36,0.35)'; ctx.lineWidth = 3; for (let y = 300; y < 2400; y += 220) { ctx.beginPath(); ctx.moveTo(-700, y); ctx.lineTo(W + 700, y); ctx.stroke(); }
  // thali
  ctx.beginPath(); ctx.ellipse(540, 1180, 430, 150, 0, 0, 7); ctx.fillStyle = '#9ea6bf'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(540, 1170, 400, 132, 0, 0, 7); ctx.fillStyle = '#c3c9da'; ctx.fill();
  // dome
  const lift = clamp(st.lift || 0);
  ctx.save(); ctx.translate(0, -lift * 30);
  ctx.beginPath(); ctx.moveTo(190, 1160); ctx.bezierCurveTo(200, 830, 880, 830, 890, 1160); ctx.closePath();
  const dg = ctx.createLinearGradient(190, 0, 890, 0); dg.addColorStop(0, '#8d96b3'); dg.addColorStop(0.35, '#e3e7f1'); dg.addColorStop(1, '#7c86a6');
  ctx.fillStyle = dg; ctx.fill();
  ctx.beginPath(); ctx.ellipse(540, 1160, 350, 40, 0, 0, Math.PI); ctx.fillStyle = '#6f7998'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(540, 866, 38, 18, 0, 0, 7); ctx.fillStyle = '#b9c0d4'; ctx.fill();
  ctx.restore();
  steamLines(ctx, 230, 1150, 2.2, t, st.steam ?? 1, 3); steamLines(ctx, 850, 1150, 2.2, t, st.steam ?? 1, 7);
  // folded card leaning on the dome
  ctx.save(); ctx.translate(540, 960); ctx.rotate(-0.05);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(-250, -150, 510, 310);
  ctx.fillStyle = '#f4f2ea'; ctx.fillRect(-260, -160, 520, 310);
  ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.fillRect(-260, 92, 520, 58);
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.font = '30px Mono700'; ctx.fillStyle = '#1a2140'; spaced(ctx, 'BLOCK C · MESS', 0, -100, 6, 'center');
  ctx.font = '120px Osw700'; ctx.fillStyle = st.room > 0 ? '#1a2140' : '#1a2140'; ctx.fillText('ROOM 13', 0, 30);
  const da = clamp(st.date || 0);
  if (da > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(-240, 50, 480 * da, 90); ctx.clip();
    ctx.font = '62px Osw600'; ctx.fillStyle = '#c4102a'; ctx.fillText('16 / 11', 0, 122); ctx.restore();
  }
  ctx.restore();
  if (st.room > 0) { ctx.save(); ctx.globalAlpha = clamp(st.room); ctx.strokeStyle = C.lime; ctx.lineWidth = 7; ctx.beginPath(); ctx.ellipse(540, 945, 290, 105, -0.05, 0, Math.PI * 2 * clamp(st.room * 1.3)); ctx.stroke(); ctx.restore(); }
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const lg = ctx.createRadialGradient(540, 400, 50, 540, 400, 1400); lg.addColorStop(0, `rgba(170,225,205,${0.22 * Lt})`); lg.addColorStop(1, 'rgba(170,225,205,0)');
  ctx.fillStyle = lg; ctx.fillRect(-700, -700, W + 1400, 3300); ctx.restore();
  if (st.dark > 0) { ctx.fillStyle = `rgba(2,3,10,${st.dark})`; ctx.fillRect(-700, -700, W + 1400, 3300); }
}

module.exports = { drawMemberInfo, drawMess, drawCoveredPlate, drawStudentBack, messSeat, messEmpty, MROWS,  drawDoorway, drawUnderBed, drawWarden, drawRoom, drawList, listLayout, drawGroupChat, drawHostelCorridor, doorDepth, corrP: P, drawDoorGap, drawRegister, drawPlate, RD, FL };
