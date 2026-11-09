// FLOOR 0 — scene painters (world space 1080x1920)
const { createCanvas } = require('@napi-rs/canvas');
const D = require('./draw');
const { W, H, C, clamp, lerp, inv, E, hash, noise1, flicker, rrect, glow, spaced, drawIndicator, drawStick, drawEntity } = D;

// ---------- LOBBY (front elevation) ----------
const DOOR = { x0: 330, x1: 750, y0: 770, y1: 1440 };
const BACK = { x0: 392, x1: 688, y0: 826, y1: 1336 };

function poly(ctx, pts, fill) { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); }

function elevatorInterior(ctx, dark, lit) {
  const d = DOOR, b = BACK;
  // dark
  poly(ctx, [[d.x0, d.y0], [d.x1, d.y0], [d.x1, d.y1], [d.x0, d.y1]], '#020306');
  // threshold spill from lobby light
  const g = ctx.createLinearGradient(0, d.y1, 0, b.y1 - 20);
  g.addColorStop(0, `rgba(120,140,190,${0.16 * dark})`); g.addColorStop(1, 'rgba(120,140,190,0)');
  poly(ctx, [[b.x0, b.y1], [b.x1, b.y1], [d.x1, d.y1], [d.x0, d.y1]], g);
  if (lit > 0) {
    ctx.save(); ctx.globalAlpha = lit;
    poly(ctx, [[d.x0, d.y0], [d.x1, d.y0], [b.x1, b.y0], [b.x0, b.y0]], '#eef2fb'); // ceiling
    poly(ctx, [[d.x0, d.y0], [b.x0, b.y0], [b.x0, b.y1], [d.x0, d.y1]], '#9aa6c4'); // left
    poly(ctx, [[d.x1, d.y0], [b.x1, b.y0], [b.x1, b.y1], [d.x1, d.y1]], '#8e9abb'); // right
    const bg = ctx.createLinearGradient(0, b.y0, 0, b.y1); bg.addColorStop(0, '#d9e1f2'); bg.addColorStop(1, '#b3bed8');
    poly(ctx, [[b.x0, b.y0], [b.x1, b.y0], [b.x1, b.y1], [b.x0, b.y1]], bg); // back
    poly(ctx, [[b.x0, b.y1], [b.x1, b.y1], [d.x1, d.y1], [d.x0, d.y1]], '#7c88a8'); // floor
    // ceiling light panel
    poly(ctx, [[440, 790], [640, 790], [622, 812], [458, 812]], '#ffffff');
    // handrail
    ctx.strokeStyle = '#6d7898'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(b.x0, 1150); ctx.lineTo(b.x1, 1150); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(d.x0 + 8, 1214); ctx.lineTo(b.x0, 1150); ctx.moveTo(d.x1 - 8, 1214); ctx.lineTo(b.x1, 1150); ctx.stroke();
    ctx.restore();
  }
}

function drawLobby(ctx, t, st) {
  const L = st.light ?? flicker(t, 1);
  // ceiling + wall + floor
  ctx.fillStyle = '#04060c'; ctx.fillRect(-400, -400, W + 800, 800);
  let g = ctx.createLinearGradient(0, 380, 0, 1440);
  g.addColorStop(0, '#141b38'); g.addColorStop(1, '#0d1329');
  ctx.fillStyle = g; ctx.fillRect(-400, 380, W + 800, 1060);
  // wall panel seams
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  for (const x of [-180, 0, 160, 920, 1080, 1240]) ctx.fillRect(x, 380, 3, 1060);
  // skirting
  ctx.fillStyle = '#0a0f22'; ctx.fillRect(-400, 1408, W + 800, 32);
  g = ctx.createLinearGradient(0, 1440, 0, 1920);
  g.addColorStop(0, '#0c1126'); g.addColorStop(1, '#04060c');
  ctx.fillStyle = g; ctx.fillRect(-400, 1440, W + 800, 900);
  // directory plaque (small)
  rrect(ctx, 104, 980, 150, 210, 8); ctx.fillStyle = '#1b2244'; ctx.fill();
  ctx.fillStyle = 'rgba(220,228,245,0.35)';
  for (let i = 0; i < 9; i++) ctx.fillRect(124, 1004 + i * 18, 18 + (i === 8 ? 0 : 0), 6), ctx.fillRect(152, 1004 + i * 18, 80, 6);
  if (st.stairDoor) {
    ctx.fillStyle = '#2a3253'; ctx.fillRect(-150, 990, 200, 450);
    ctx.fillStyle = '#1a2142'; ctx.fillRect(-136, 1004, 172, 436);
    ctx.fillStyle = '#39436a'; ctx.fillRect(14, 1210, 12, 40);
    rrect(ctx, -110, 912, 120, 52, 6); ctx.fillStyle = '#16070a'; ctx.fill();
    ctx.font = '36px Osw700'; ctx.fillStyle = '#ff4155'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillText('EXIT', -50, 952); ctx.textAlign = 'left';
    glow(ctx, -50, 938, 160, 'rgba(255,50,70,A)', 0.35);
  }
  // light cone + pool (scaled by flicker)
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  g = ctx.createLinearGradient(0, 440, 0, 1500);
  g.addColorStop(0, `rgba(150,175,235,${0.13 * L})`); g.addColorStop(1, 'rgba(150,175,235,0)');
  poly(ctx, [[400, 440], [680, 440], [1180, 1500], [-100, 1500]], g);
  ctx.restore();
  glow(ctx, 540, 1520, 560, 'rgba(110,135,200,A)', 0.14 * L);

  // elevator frame
  ctx.fillStyle = C.steel; ctx.fillRect(292, 732, 496, 708);
  ctx.fillStyle = C.steel2; ctx.fillRect(292, 732, 496, 6);
  ctx.fillStyle = '#20263f'; ctx.fillRect(320, 760, 440, 680);
  // interior / doors
  const op = clamp(st.door ?? 0);
  ctx.save(); ctx.beginPath(); ctx.rect(DOOR.x0, DOOR.y0, DOOR.x1 - DOOR.x0, DOOR.y1 - DOOR.y0); ctx.clip();
  if (op > 0.001) elevatorInterior(ctx, 1, st.lit || 0);
  const pw = 210, slide = pw * op;
  for (const side of [-1, 1]) {
    const x = side < 0 ? DOOR.x0 - slide : 540 + slide;
    const dg = ctx.createLinearGradient(x, 0, x + pw, 0);
    dg.addColorStop(0, side < 0 ? '#2f375a' : '#39436a'); dg.addColorStop(1, side < 0 ? '#39436a' : '#2f375a');
    ctx.fillStyle = dg; ctx.fillRect(x, DOOR.y0, pw, DOOR.y1 - DOOR.y0);
    ctx.fillStyle = 'rgba(255,255,255,0.035)';
    for (let i = 0; i < 6; i++) ctx.fillRect(x + 20 + i * 32, DOOR.y0, 2, DOOR.y1 - DOOR.y0);
    ctx.fillStyle = 'rgba(160,185,240,0.07)'; ctx.fillRect(x + (side < 0 ? 140 : 40), DOOR.y0, 30, DOOR.y1 - DOOR.y0);
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(side < 0 ? x + pw - 2 : x, DOOR.y0, 2, DOOR.y1 - DOOR.y0);
  }
  ctx.restore();
  // frame inner shadow
  ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 4; ctx.strokeRect(DOOR.x0, DOOR.y0, DOOR.x1 - DOOR.x0, DOOR.y1 - DOOR.y0);
  // call panel
  rrect(ctx, 832, 1060, 56, 140, 10); ctx.fillStyle = C.steel; ctx.fill();
  for (const [yy, up] of [[1100, true], [1160, false]]) {
    ctx.beginPath(); ctx.arc(860, yy, 15, 0, Math.PI * 2); ctx.fillStyle = '#151a30'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = (up ? st.callUp : st.callDown) ? '#ffd9a0' : '#4a5378'; ctx.stroke();
  }
  if (st.callDown) glow(ctx, 860, 1160, 40, 'rgba(255,200,140,A)', 0.5);
  // floor reflection of door
  ctx.save(); ctx.globalAlpha = 0.10; ctx.fillStyle = op > 0 ? (st.lit ? '#b8c3de' : '#000') : '#39436a';
  ctx.fillRect(DOOR.x0, 1440, DOOR.x1 - DOOR.x0, 150); ctx.restore();

  // lighting dip overlay
  if (L < 1) { ctx.fillStyle = `rgba(0,0,5,${(1 - L) * 0.55})`; ctx.fillRect(-400, -400, W + 800, H + 800); }

  // lit interior spill onto lobby floor
  if (st.lit > 0 && op > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const sg = ctx.createLinearGradient(0, 1440, 0, 1920);
    sg.addColorStop(0, `rgba(200,212,240,${0.30 * st.lit * op})`); sg.addColorStop(1, 'rgba(200,212,240,0)');
    poly(ctx, [[DOOR.x0, 1440], [DOOR.x1, 1440], [DOOR.x1 + 260, 1920], [DOOR.x0 - 260, 1920]], sg);
    ctx.restore();
    glow(ctx, 540, 1100, 420, 'rgba(200,215,255,A)', 0.12 * st.lit * op);
  }
  // fluorescent tube
  ctx.fillStyle = '#1a1f33'; ctx.fillRect(380, 412, 320, 22);
  ctx.fillStyle = `rgba(225,235,255,${0.25 + 0.75 * L})`; ctx.fillRect(392, 424, 296, 10);
  glow(ctx, 540, 432, 260, 'rgba(170,195,255,A)', 0.30 * L);
  // indicator
  drawIndicator(ctx, 540, 676, 9, st.ind || {});
  // character
  if (st.char) drawStick(ctx, st.char);
}

// ---------- DIRECTORY PLAQUE ----------
function drawDirectory(ctx, t, st) {
  ctx.fillStyle = '#0b1022'; ctx.fillRect(-400, -400, W + 800, 3200);
  rrect(ctx, 110, 180, 860, 2190, 24); ctx.fillStyle = '#2a3253'; ctx.fill();
  rrect(ctx, 130, 200, 820, 2150, 16);
  const g = ctx.createLinearGradient(0, 200, 0, 2350); g.addColorStop(0, '#1a2246'); g.addColorStop(1, '#121833');
  ctx.fillStyle = g; ctx.fill();
  // screws
  for (const [x, y] of [[160, 230], [920, 230], [160, 2320], [920, 2320]]) { ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.fillStyle = '#39436a'; ctx.fill(); }
  ctx.textBaseline = 'alphabetic';
  ctx.font = '34px Mono700'; ctx.fillStyle = 'rgba(220,228,245,0.72)';
  spaced(ctx, 'RESIDENT DIRECTORY', 540, 330, 6, 'center');
  ctx.fillStyle = 'rgba(220,228,245,0.18)'; ctx.fillRect(200, 372, 680, 3);
  const rows = ['8', '7', '6', '5', '4', '3', '2', '1', 'L'];
  rows.forEach((r, i) => {
    const y = 520 + i * 186;
    ctx.font = '128px Osw700'; ctx.fillStyle = '#e3e8f5'; ctx.textAlign = 'left';
    ctx.fillText(r, 200, y + 44);
    ctx.fillStyle = 'rgba(220,228,245,0.22)';
    for (let x = 330; x < 560; x += 22) ctx.fillRect(x, y + 10, 6, 6);
    ctx.font = '36px Mono500'; ctx.fillStyle = r === 'L' ? '#c9d0e4' : '#9aa3bd';
    spaced(ctx, r === 'L' ? 'LOBBY · MAIL' : `${r}A · ${r}B · ${r}C · ${r}D`, 880, y + 24, 1.5, 'right');
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(200, y + 86, 680, 2);
  });
  // removed label: lighter patch, empty screw holes, scratches, ghost of a 0
  const py = 520 + 9 * 186 - 70;
  rrect(ctx, 186, py, 708, 150, 6); ctx.fillStyle = '#212a52'; ctx.fill();
  for (const [x, y] of [[206, py + 20], [874, py + 20], [206, py + 130], [874, py + 130]]) { ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fillStyle = '#05070f'; ctx.fill(); }
  ctx.strokeStyle = 'rgba(200,210,240,0.10)'; ctx.lineWidth = 2;
  for (let i = 0; i < 7; i++) { const x = 300 + hash(i) * 480, y = py + 30 + hash(i + 9) * 90; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 40 + hash(i + 3) * 80, y + (hash(i + 5) - 0.5) * 30); ctx.stroke(); }
  ctx.font = '128px Osw700'; ctx.fillStyle = `rgba(230,236,250,${0.05 + 0.06 * (st.ghost || 0)})`; ctx.fillText('0', 200, py + 118);
  // light sweep
  glow(ctx, 380, st.lightY || 700, 900, 'rgba(140,165,230,A)', 0.10);
}

// ---------- INTERIOR POV ----------
const OP = { x0: 96, x1: 984, y0: 240, y1: 1780 };
const BK = { x0: 336, x1: 744, y0: 560, y1: 1356 };
function drawInterior(ctx, t, st) {
  const o = OP, b = BK;
  const rv = st.reveal || 0;          // eyes adjusting
  const fl = st.flash || 0;           // camera flash lighting
  const panel = st.panel || 0;        // ceiling light flicker on
  // lobby wall around the doorway
  ctx.fillStyle = '#10162e'; ctx.fillRect(-400, -400, W + 800, H + 800);
  ctx.fillStyle = C.steel; ctx.fillRect(o.x0 - 64, o.y0 - 64, o.x1 - o.x0 + 128, o.y1 - o.y0 + 64);
  ctx.fillStyle = '#20263f'; ctx.fillRect(o.x0 - 20, o.y0 - 20, o.x1 - o.x0 + 40, o.y1 - o.y0 + 20);
  // door edges (retracted panels visible at sides)
  ctx.fillStyle = '#2f375a'; ctx.fillRect(o.x0 - 20, o.y0, 20, o.y1 - o.y0); ctx.fillRect(o.x1, o.y0, 20, o.y1 - o.y0);
  ctx.save(); ctx.beginPath(); ctx.rect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0); ctx.clip();
  const sh = (hex, k) => hex; // placeholder for readability
  const base = (a, bb) => `rgb(${Math.round(lerp(a[0], bb[0], rv))},${Math.round(lerp(a[1], bb[1], rv))},${Math.round(lerp(a[2], bb[2], rv))})`;
  poly(ctx, [[o.x0, o.y0], [o.x1, o.y0], [b.x1, b.y0], [b.x0, b.y0]], base([3, 4, 8], [7, 9, 16]));
  poly(ctx, [[o.x0, o.y0], [b.x0, b.y0], [b.x0, b.y1], [o.x0, o.y1]], base([3, 4, 8], [9, 11, 21]));
  poly(ctx, [[o.x1, o.y0], [b.x1, b.y0], [b.x1, b.y1], [o.x1, o.y1]], base([3, 4, 8], [8, 10, 19]));
  poly(ctx, [[b.x0, b.y0], [b.x1, b.y0], [b.x1, b.y1], [b.x0, b.y1]], base([4, 5, 10], [17, 21, 38]));
  poly(ctx, [[b.x0, b.y1], [b.x1, b.y1], [o.x1, o.y1], [o.x0, o.y1]], base([3, 4, 7], [8, 9, 16]));
  // threshold spill
  let g = ctx.createLinearGradient(0, o.y1, 0, o.y1 - 380);
  g.addColorStop(0, 'rgba(120,140,195,0.20)'); g.addColorStop(1, 'rgba(120,140,195,0)');
  poly(ctx, [[b.x0, b.y1], [b.x1, b.y1], [o.x1, o.y1], [o.x0, o.y1]], g);
  // handrails
  ctx.strokeStyle = `rgba(60,70,105,${0.15 + 0.5 * rv})`; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(b.x0, 1110); ctx.lineTo(b.x1, 1110);
  ctx.moveTo(o.x0, 1270); ctx.lineTo(b.x0, 1110); ctx.moveTo(o.x1, 1270); ctx.lineTo(b.x1, 1110); ctx.stroke();
  // car operating panel on right wall, "0" lit
  ctx.save(); ctx.globalAlpha = 0.35 + 0.65 * rv;
  poly(ctx, [[880, 900], [910, 930], [910, 1240], [880, 1268]], '#141a30');
  for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.arc(895, 950 + i * 30, 6, 0, 7); ctx.fillStyle = i === 9 ? 'rgba(255,60,60,0.9)' : '#2a3150'; ctx.fill(); }
  ctx.restore();
  glow(ctx, 895, 1220, 40, 'rgba(255,50,50,A)', 0.35);
  // ceiling light panel (off / flicker on)
  poly(ctx, [[430, 300], [650, 300], [610, 360], [470, 360]], panel > 0 ? `rgba(220,230,255,${0.2 + 0.8 * panel})` : '#0c0f19');
  if (panel > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    g = ctx.createLinearGradient(0, 300, 0, 1500); g.addColorStop(0, `rgba(170,190,240,${0.22 * panel})`); g.addColorStop(1, 'rgba(170,190,240,0)');
    ctx.fillStyle = g; ctx.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0); ctx.restore();
  }
  // phone glow on walls (before entity so it stays a silhouette)
  if (st.phone > 0) {
    glow(ctx, 770, 1110, 520, 'rgba(120,160,255,A)', 0.30 * st.phone);
    glow(ctx, 760, 1120, 200, 'rgba(170,200,255,A)', 0.25 * st.phone);
  }
  // camera flash: everything blown out
  if (fl > 0) {
    ctx.save(); ctx.globalAlpha = fl;
    poly(ctx, [[o.x0, o.y0], [o.x1, o.y0], [b.x1, b.y0], [b.x0, b.y0]], '#dfe6f6');
    poly(ctx, [[o.x0, o.y0], [b.x0, b.y0], [b.x0, b.y1], [o.x0, o.y1]], '#c2cbe3');
    poly(ctx, [[o.x1, o.y0], [b.x1, b.y0], [b.x1, b.y1], [o.x1, o.y1]], '#b7c1db');
    poly(ctx, [[b.x0, b.y0], [b.x1, b.y0], [b.x1, b.y1], [b.x0, b.y1]], '#f4f7ff');
    poly(ctx, [[b.x0, b.y1], [b.x1, b.y1], [o.x1, o.y1], [o.x0, o.y1]], '#a9b3cc');
    ctx.restore();
  }
  // the entity
  if (st.entity !== false) {
    const vis = st.entityVis ?? 1;
    if (vis > 0) {
      ctx.save(); ctx.globalAlpha = vis;
      drawEntity(ctx, st.ex ?? 668, st.ey ?? 1350, st.es ?? 1.0, {
        t, mode: st.mode || 'back', col: fl > 0 ? '#020205' : '#020308', rim: (st.rim ?? 0.6) * rv,
        tilt: st.tilt ?? 0.22, phone: st.phone || 0, flash: fl,
      });
      ctx.restore();
    }
  }
  ctx.restore();
  // lobby light falloff on frame
  glow(ctx, 540, 120, 700, 'rgba(120,145,210,A)', 0.10);
}

// ---------- PHONE ----------
const PH = { cx: 572, cy: 1000, w: 620, h: 1250 };
function phoneBG(ctx, t, st) {
  // out-of-focus lobby: dark doorway, red indicator, tube light
  ctx.fillStyle = '#080c1a'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.filter = 'blur(28px)';
  ctx.fillStyle = '#141b38'; ctx.fillRect(-100, 300, W + 200, 1250);
  ctx.fillStyle = '#2a3253'; ctx.fillRect(170, 520, 740, 1200);
  ctx.fillStyle = st.doorOpen === false ? '#343d62' : '#010204'; ctx.fillRect(230, 580, 620, 1140);
  ctx.fillStyle = '#ff2e2e'; ctx.fillRect(500, 360, 80, 50);
  ctx.fillStyle = 'rgba(220,230,255,0.8)'; ctx.fillRect(330, 120, 420, 26);
  if (st.farGlow > 0) { ctx.fillStyle = `rgba(190,215,255,${st.farGlow})`; ctx.fillRect(700, 1150, 40, 70); }
  ctx.restore();
  if (st.farGlow > 0) glow(ctx, 720, 1185, 160, 'rgba(140,180,255,A)', 0.4 * st.farGlow);
  ctx.fillStyle = 'rgba(3,4,10,0.35)'; ctx.fillRect(0, 0, W, H);
}
function bubble(ctx, x, y, text, a, mine = false) {
  ctx.font = '42px Inter500';
  const tw = ctx.measureText(text).width;
  const bw = tw + 60, bh = 92;
  ctx.save();
  const s = lerp(0.6, 1, E.outBack(clamp(a))); ctx.globalAlpha = clamp(a * 2);
  ctx.translate(x, y + bh / 2); ctx.scale(s, s); ctx.translate(-x, -(y + bh / 2));
  rrect(ctx, x, y, bw, bh, 38); ctx.fillStyle = mine ? '#2f6bff' : '#2a2f40'; ctx.fill();
  ctx.fillStyle = '#f2f4f9'; ctx.textBaseline = 'middle'; ctx.fillText(text, x + 30, y + bh / 2 + 1);
  ctx.restore();
  return bh;
}
function lockIcon(ctx, x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, -8, 11, Math.PI, 0); ctx.lineTo(11, -2); ctx.moveTo(-11, -8); ctx.lineTo(-11, -2); ctx.stroke();
  rrect(ctx, -16, -2, 32, 24, 5); ctx.fillStyle = col; ctx.fill();
  ctx.restore();
}
function drawPhone(ctx, t, st) {
  if (st.bg) st.bg(ctx, t); else phoneBG(ctx, t, st);
  const p = PH;
  ctx.save();
  const bob = Math.sin(t * 1.3) * 6;
  const [sx, sy] = st.shake || [0, 0];
  ctx.translate(p.cx + sx, p.cy + bob + sy);
  ctx.rotate((st.rot ?? -0.035) + (st.shakeRot || 0));
  ctx.scale(st.scale || 1, st.scale || 1);
  ctx.translate(-p.cx, -p.cy);
  const x0 = p.cx - p.w / 2, y0 = p.cy - p.h / 2;
  // screen light on surroundings
  glow(ctx, p.cx, p.cy, 900, 'rgba(110,140,220,A)', 0.16 * (st.screenOn ?? 1));
  // body
  ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 20;
  rrect(ctx, x0, y0, p.w, p.h, 92); ctx.fillStyle = '#0a0c13'; ctx.fill();
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.lineWidth = 4; ctx.strokeStyle = '#30364d'; ctx.stroke();
  const sx0 = x0 + 20, sy0 = y0 + 20, sw = p.w - 40, sh = p.h - 40;
  rrect(ctx, sx0, sy0, sw, sh, 74);
  const sg = ctx.createLinearGradient(0, sy0, 0, sy0 + sh);
  sg.addColorStop(0, '#11152a'); sg.addColorStop(1, '#070911');
  ctx.fillStyle = sg; ctx.fill();
  ctx.save(); ctx.clip();
  // dynamic island
  rrect(ctx, p.cx - 80, sy0 + 26, 160, 46, 23); ctx.fillStyle = '#000'; ctx.fill();
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  if (st.screen === 'lock') {
    ctx.font = '34px Inter500'; ctx.fillStyle = 'rgba(225,232,248,0.82)';
    ctx.fillText(st.date || 'Sunday, November 9', p.cx, sy0 + 170);
    ctx.font = '196px Inter600'; ctx.fillStyle = '#eef2fb';
    ctx.fillText(st.time || '12:08', p.cx, sy0 + 370);
    let ny = sy0 + 430;
    for (const n of st.notifs || []) {
      const a = clamp(n.a); if (a <= 0) continue;
      const nh = n.h || 140;
      ctx.save(); ctx.globalAlpha = clamp(a * 1.6);
      const dy = (1 - E.outBack(a)) * -60;
      ctx.translate(0, dy);
      rrect(ctx, sx0 + 22, ny, sw - 44, nh, 36); ctx.fillStyle = n.hl ? 'rgba(58,66,92,0.96)' : 'rgba(40,46,66,0.92)'; ctx.fill();
      // icon
      rrect(ctx, sx0 + 46, ny + 26, 70, 70, 18); ctx.fillStyle = n.iconBg || '#3a4057'; ctx.fill();
      if (n.icon === 'lock') lockIcon(ctx, sx0 + 81, ny + 58, 1.1, '#151b34');
      else if (n.icon === 'me') { ctx.strokeStyle = '#eef1f7'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(sx0 + 81, ny + 50, 11, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(sx0 + 81, ny + 61); ctx.lineTo(sx0 + 81, ny + 84); ctx.moveTo(sx0 + 68, ny + 84); ctx.lineTo(sx0 + 81, ny + 70); ctx.lineTo(sx0 + 94, ny + 84); ctx.stroke(); }
      else { ctx.font = '40px Inter700'; ctx.fillStyle = '#d9deec'; ctx.fillText('?', sx0 + 81, ny + 75); }
      ctx.textAlign = 'left';
      ctx.font = '30px Inter600'; ctx.fillStyle = '#eef1f8'; ctx.fillText(n.title, sx0 + 138, ny + 56);
      ctx.font = '26px Inter400'; ctx.fillStyle = 'rgba(210,216,232,0.7)'; ctx.textAlign = 'right'; ctx.fillText('now', sx0 + sw - 50, ny + 56);
      ctx.textAlign = 'left'; ctx.font = '30px Inter400'; ctx.fillStyle = 'rgba(232,236,246,0.9)';
      (n.lines || []).forEach((ln, i) => {
        const la = ln.a === undefined ? 1 : clamp(ln.a);
        if (la <= 0) return;
        ctx.save(); ctx.globalAlpha *= la;
        ctx.font = ln.font || '30px Inter400'; ctx.fillStyle = ln.col || 'rgba(232,236,246,0.9)';
        ctx.fillText(ln.text, sx0 + 138, ny + 100 + i * 42); ctx.restore();
      });
      if (n.thumb > 0) {
        // the flash photo — your face, overexposed
        const tx = sx0 + sw - 178, ty = ny + 96, ts = 136;
        ctx.save(); ctx.globalAlpha *= clamp(n.thumb);
        rrect(ctx, tx, ty, ts, ts, 20); ctx.save(); ctx.clip();
        ctx.fillStyle = '#0d1226'; ctx.fillRect(tx, ty, ts, ts);
        glow(ctx, tx + ts / 2, ty + ts / 2, 140, 'rgba(255,255,255,A)', 0.85, 'source-over');
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 7;
        ctx.beginPath(); ctx.arc(tx + ts / 2, ty + 62, 30, 0, 7); ctx.fillStyle = '#f4f6fb'; ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(tx + ts / 2, ty + 92); ctx.lineTo(tx + ts / 2, ty + 160); ctx.moveTo(tx + 30, ty + 160); ctx.lineTo(tx + ts / 2, ty + 104); ctx.lineTo(tx + ts - 30, ty + 160); ctx.stroke();
        ctx.restore();
        ctx.lineWidth = 3; ctx.strokeStyle = n.thumbCol || 'rgba(198,255,58,0.9)'; rrect(ctx, tx, ty, ts, ts, 20); ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
      ctx.textAlign = 'center';
      ny += nh + 18;
    }
    // bottom shortcuts
    for (const xx of [sx0 + 90, sx0 + sw - 90]) { ctx.beginPath(); ctx.arc(xx, sy0 + sh - 110, 44, 0, 7); ctx.fillStyle = 'rgba(60,66,90,0.7)'; ctx.fill(); }
    rrect(ctx, p.cx - 110, sy0 + sh - 26, 220, 9, 5); ctx.fillStyle = 'rgba(240,244,252,0.8)'; ctx.fill();
  } else if (st.screen === 'chat') {
    // header
    ctx.fillStyle = 'rgba(20,24,40,0.9)'; ctx.fillRect(sx0, sy0, sw, 300);
    ctx.font = '54px Inter400'; ctx.fillStyle = '#5b8cff'; ctx.textAlign = 'left'; ctx.fillText('‹', sx0 + 40, sy0 + 170);
    ctx.textAlign = 'center';
    const ct = st.contact || { name: 'Unknown Number', avatar: 'q' };
    ctx.beginPath(); ctx.arc(p.cx, sy0 + 150, 50, 0, 7); ctx.fillStyle = ct.avatar === 'me' ? '#26304f' : '#3a4057'; ctx.fill();
    if (ct.avatar === 'me') {
      ctx.strokeStyle = '#eef1f7'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(p.cx, sy0 + 138, 15, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p.cx, sy0 + 153); ctx.lineTo(p.cx, sy0 + 186); ctx.moveTo(p.cx - 18, sy0 + 186); ctx.lineTo(p.cx, sy0 + 166); ctx.lineTo(p.cx + 18, sy0 + 186); ctx.stroke();
    } else { ctx.font = '50px Inter600'; ctx.fillStyle = '#d9deec'; ctx.fillText(ct.initial || '?', p.cx, sy0 + 168); }
    ctx.font = '30px Inter600'; ctx.fillStyle = ct.hl ? C.lime : '#eef1f8'; ctx.fillText(ct.name, p.cx, sy0 + 246);
    ctx.font = '23px Inter400'; ctx.fillStyle = 'rgba(200,206,224,0.6)'; if (st.sub !== '') ctx.fillText(st.sub || 'Text Message · Today 12:08 AM', p.cx, sy0 + 344);
    ctx.textAlign = 'left';
    let by = sy0 + 380;
    for (const b of st.bubbles || []) {
      if (b.a <= 0) continue;
      let bx = sx0 + 34;
      if (b.mine) { ctx.font = '42px Inter500'; bx = sx0 + sw - 34 - (ctx.measureText(b.text).width + 60); }
      const bh = bubble(ctx, bx, by, b.text, b.a, b.mine);
      by += bh + 16;
      if (b.delivered > 0) { ctx.save(); ctx.globalAlpha = clamp(b.delivered); ctx.font = '22px Inter500'; ctx.fillStyle = 'rgba(200,206,224,0.6)'; ctx.textAlign = 'right'; ctx.fillText('Delivered', sx0 + sw - 40, by + 6); ctx.restore(); by += 34; }
    }
    if (st.compose) {
      const cp = st.compose;
      const ky = sy0 + sh - 520;
      ctx.fillStyle = 'rgba(28,32,48,0.96)'; ctx.fillRect(sx0, ky - 120, sw, 500);
      rrect(ctx, sx0 + 30, ky - 100, sw - 60, 76, 38); ctx.fillStyle = 'rgba(48,54,78,0.95)'; ctx.fill();
      ctx.font = '34px Inter500'; ctx.fillStyle = '#eef1f8'; ctx.fillText(cp.text, sx0 + 62, ky - 50);
      if (Math.floor(t * 3) % 2 === 0) { const cw = ctx.measureText(cp.text).width; ctx.fillStyle = '#5b8cff'; ctx.fillRect(sx0 + 64 + cw, ky - 82, 4, 42); }
      const rows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
      rows.forEach((r, ri) => {
        const kw = (sw - 40) / 10, x0 = sx0 + 20 + (10 - r.length) * kw / 2;
        [...r].forEach((ch, ci) => {
          const pressed = cp.key === ch;
          rrect(ctx, x0 + ci * kw + 4, ky + 24 + ri * 100, kw - 8, 80, 10); ctx.fillStyle = pressed ? '#8b93b3' : '#3a4057'; ctx.fill();
          ctx.font = '30px Inter500'; ctx.fillStyle = '#e6e9f2'; ctx.textAlign = 'center'; ctx.fillText(ch, x0 + ci * kw + kw / 2, ky + 74 + ri * 100); ctx.textAlign = 'left';
        });
      });
    }
    if (st.typing > 0) {
      ctx.save(); ctx.globalAlpha = clamp(st.typing * 2);
      rrect(ctx, sx0 + 34, by, 132, 82, 38); ctx.fillStyle = '#2a2f40'; ctx.fill();
      for (let i = 0; i < 3; i++) {
        const k = 0.5 + 0.5 * Math.sin(t * 9 - i * 0.9);
        ctx.beginPath(); ctx.arc(sx0 + 70 + i * 30, by + 41 - k * 6, 9, 0, 7); ctx.fillStyle = `rgba(160,166,186,${0.45 + 0.55 * k})`; ctx.fill();
      }
      ctx.restore();
    }
    if (!st.compose) {
      rrect(ctx, sx0 + 30, sy0 + sh - 130, sw - 60, 76, 38); ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(150,158,182,0.4)'; ctx.stroke();
      ctx.font = '28px Inter400'; ctx.fillStyle = 'rgba(150,158,182,0.6)'; ctx.fillText('Text Message', sx0 + 62, sy0 + sh - 82);
    }
  }
  ctx.restore();
  // glass highlight
  ctx.save(); rrect(ctx, sx0, sy0, sw, sh, 74); ctx.clip();
  const hg = ctx.createLinearGradient(sx0, sy0, sx0 + sw, sy0 + sh * 0.6);
  hg.addColorStop(0, 'rgba(255,255,255,0.05)'); hg.addColorStop(0.5, 'rgba(255,255,255,0)');
  ctx.fillStyle = hg; ctx.fillRect(sx0, sy0, sw, sh); ctx.restore();
  ctx.restore();
}

module.exports = { drawLobby, drawDirectory, drawInterior, drawPhone, phoneBG, elevatorInterior, poly, lockIcon, DOOR, OP, BK, PH };
