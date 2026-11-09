// FLOOR 0 — sets for Parts 2 and 3
const { createCanvas } = require('@napi-rs/canvas');
const D = require('./draw');
const S = require('./scenes');
const { W, H, C, clamp, lerp, inv, E, hash, noise1, flicker, rrect, glow, spaced, drawIndicator, drawStick, drawEntity, camera } = D;
const { poly } = S;

// ---------- STAIRWELL (building cross-section) ----------
const FLOOR_H = 560, BASE_Y = 1820;
const landY = k => BASE_Y - (k - 1) * FLOOR_H; // floor k landing
// path for climbing from floor 1 to floor 8: list of segments
function stairPath() {
  const pts = [];
  for (let k = 1; k < 8; k++) {
    const y = landY(k);
    pts.push([230, y], [850, y - FLOOR_H / 2], [850, y - FLOOR_H / 2]);
  }
  pts.push([230, landY(8)]);
  return pts;
}
const SP = stairPath();
function stairPos(u) { // u in [0,1] along the whole climb
  const segs = []; let tot = 0;
  for (let i = 0; i < SP.length - 1; i++) { const l = Math.hypot(SP[i + 1][0] - SP[i][0], SP[i + 1][1] - SP[i][1]); segs.push(l); tot += l; }
  let d = clamp(u) * tot;
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i] || i === segs.length - 1) { const k = segs[i] ? d / segs[i] : 0; return [lerp(SP[i][0], SP[i + 1][0], k), lerp(SP[i][1], SP[i + 1][1], k)]; }
    d -= segs[i];
  }
  return SP[SP.length - 1];
}
function drawStairwell(ctx, t, st) {
  ctx.fillStyle = '#080c1b'; ctx.fillRect(-600, -4000, W + 1200, 7000);
  // shaft walls
  ctx.fillStyle = '#0d1329'; ctx.fillRect(40, landY(8) - 700, 1000, BASE_Y - landY(8) + 900);
  for (let k = 1; k <= 8; k++) {
    const y = landY(k);
    // floor slab + landings
    ctx.fillStyle = '#1a2142'; ctx.fillRect(40, y, 230, 26); ctx.fillRect(810, y - FLOOR_H / 2, 230, 22);
    // painted floor number
    ctx.font = '170px Osw700'; ctx.fillStyle = 'rgba(200,210,240,0.10)'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(String(k), 82, y - 150);
    ctx.font = '22px Mono700'; ctx.fillStyle = 'rgba(200,210,240,0.22)'; spaced(ctx, `FLOOR ${k}`, 86, y - 116, 3);
    // door to the floor
    ctx.fillStyle = '#151c3a'; ctx.fillRect(60, y - 300, 130, 300); ctx.fillStyle = '#39436a'; ctx.fillRect(170, y - 160, 10, 30);
    // emergency lamp
    const on = 0.7 + 0.3 * flicker(t, k * 3.3, 0.12);
    ctx.fillStyle = `rgba(255,70,80,${on})`; ctx.fillRect(214, y - 370, 34, 14);
    glow(ctx, 231, y - 360, 260, 'rgba(255,60,70,A)', 0.16 * on);
    if (k < 8) {
      // flights: up-right then up-left
      const drawFlight = (x0, y0, x1, y1) => {
        const n = 12, dx = (x1 - x0) / n, dy = (y1 - y0) / n;
        ctx.beginPath(); ctx.moveTo(x0, y0);
        for (let i = 0; i < n; i++) { ctx.lineTo(x0 + dx * i, y0 + dy * (i + 1)); ctx.lineTo(x0 + dx * (i + 1), y0 + dy * (i + 1)); }
        ctx.lineTo(x1, y1 + 40); ctx.lineTo(x0, y0 + 40); ctx.closePath();
        ctx.fillStyle = '#1b2346'; ctx.fill();
        ctx.strokeStyle = 'rgba(160,175,220,0.25)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y0 - 90); ctx.lineTo(x1, y1 - 90); ctx.stroke();
      };
      drawFlight(270, y, 810, y - FLOOR_H / 2);
      drawFlight(810, y - FLOOR_H / 2, 270, y - FLOOR_H);
    }
  }
  if (st.char) drawStick(ctx, st.char);
}

// ---------- CORRIDOR (1-point perspective) ----------
const VX = 540, VY = 880, HW = 430, CEIL = -620, FLR = 820, FAR = 8;
const P = (X, Y, d) => [VX + X / d, VY + Y / d];
function quad(ctx, pts, fill) { poly(ctx, pts, fill); }
function drawCorridor(ctx, t, st) {
  const dn = 0.5;
  const lights = st.lights || [1, 1, 1, 1, 1];
  const amb = lights.reduce((a, b) => a + b, 0) / lights.length;
  ctx.fillStyle = '#05070f'; ctx.fillRect(-600, -600, W + 1200, H + 1200);
  const wallG = (x0, x1) => { const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, `rgb(${18 + 8 * amb},${24 + 10 * amb},${48 + 14 * amb})`); g.addColorStop(1, '#070a16'); return g; };
  quad(ctx, [P(-HW, CEIL, dn), P(-HW, CEIL, FAR), P(-HW, FLR, FAR), P(-HW, FLR, dn)], wallG(P(-HW, 0, dn)[0], P(-HW, 0, FAR)[0]));
  quad(ctx, [P(HW, CEIL, dn), P(HW, CEIL, FAR), P(HW, FLR, FAR), P(HW, FLR, dn)], wallG(P(HW, 0, dn)[0], P(HW, 0, FAR)[0]));
  quad(ctx, [P(-HW, CEIL, dn), P(HW, CEIL, dn), P(HW, CEIL, FAR), P(-HW, CEIL, FAR)], '#070913');
  let g = ctx.createLinearGradient(0, P(0, FLR, dn)[1], 0, P(0, FLR, FAR)[1]);
  g.addColorStop(0, `rgb(${10 + 6 * amb},${14 + 8 * amb},${30 + 10 * amb})`); g.addColorStop(1, '#06080f');
  quad(ctx, [P(-HW, FLR, dn), P(HW, FLR, dn), P(HW, FLR, FAR), P(-HW, FLR, FAR)], g);
  // carpet runner
  quad(ctx, [P(-170, FLR, dn), P(170, FLR, dn), P(170, FLR, FAR), P(-170, FLR, FAR)], 'rgba(40,10,20,0.35)');
  // skirting lines
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 3;
  for (const X of [-HW, HW]) { ctx.beginPath(); ctx.moveTo(...P(X, FLR - 40, dn)); ctx.lineTo(...P(X, FLR - 40, FAR)); ctx.stroke(); }
  // far wall + elevator
  const fw = [P(-HW, CEIL, FAR), P(HW, CEIL, FAR), P(HW, FLR, FAR), P(-HW, FLR, FAR)];
  quad(ctx, fw, '#0b0f20');
  const eo = clamp(st.elevOpen || 0), el = clamp(st.elevLit || 0);
  const ex0 = P(-150, -260, FAR), ex1 = P(150, FLR, FAR);
  ctx.fillStyle = '#2a3253'; ctx.fillRect(ex0[0] - 4, ex0[1] - 4, ex1[0] - ex0[0] + 8, ex1[1] - ex0[1] + 4);
  if (eo > 0) { ctx.fillStyle = el > 0 ? `rgb(${Math.round(lerp(2, 225, el))},${Math.round(lerp(3, 232, el))},${Math.round(lerp(6, 248, el))})` : '#020306'; ctx.fillRect(ex0[0], ex0[1], ex1[0] - ex0[0], ex1[1] - ex0[1]); }
  const pw = (ex1[0] - ex0[0]) / 2 * (1 - eo);
  ctx.fillStyle = '#39436a'; ctx.fillRect(ex0[0], ex0[1], pw, ex1[1] - ex0[1]); ctx.fillRect(ex1[0] - pw, ex0[1], pw, ex1[1] - ex0[1]);
  drawIndicator(ctx, VX, P(0, -360, FAR)[1], 1.6, { ch: st.indCh || '0', arrow: ' ' });
  // floor plaque beside the elevator
  {
    const [px0, py0] = P(215, -440, FAR), [px1, py1] = P(395, -250, FAR);
    rrect(ctx, px0, py0, px1 - px0, py1 - py0, 2); ctx.fillStyle = '#e3e8f5'; ctx.fill();
    ctx.fillStyle = '#0b1022'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.font = `${((py1 - py0) * 0.2).toFixed(2)}px Mono700`; ctx.fillText('FLOOR', (px0 + px1) / 2, py0 + (py1 - py0) * 0.28);
    ctx.font = `${((py1 - py0) * 0.62).toFixed(2)}px Osw700`; ctx.fillText('8', (px0 + px1) / 2, py0 + (py1 - py0) * 0.9);
  }
  // lit elevator spill down the floor
  if (el > 0 && eo > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    g = ctx.createLinearGradient(0, P(0, FLR, FAR)[1], 0, P(0, FLR, 1.2)[1]);
    g.addColorStop(0, `rgba(200,212,245,${0.55 * el * eo})`); g.addColorStop(1, 'rgba(200,212,245,0)');
    quad(ctx, [P(-150, FLR, FAR), P(150, FLR, FAR), P(330, FLR, 1.2), P(-330, FLR, 1.2)], g);
    ctx.restore();
    glow(ctx, VX, P(0, 280, FAR)[1], 260, 'rgba(210,222,255,A)', 0.35 * el * eo);
  }
  // doors
  const doors = [[-1, 1.25, 1.85, '8A'], [-1, 3.0, 3.6, '8B'], [1, 2.0, 2.7, '8C'], [1, 4.3, 4.9, '8D']];
  for (const [side, d1, d2, label] of doors) {
    const X = side * HW;
    quad(ctx, [P(X, -150, d1), P(X, -150, d2), P(X, FLR, d2), P(X, FLR, d1)], '#1b2246');
    ctx.strokeStyle = 'rgba(60,70,110,0.8)'; ctx.lineWidth = 3;
    ctx.beginPath(); [P(X, -150, d1), P(X, -150, d2), P(X, FLR, d2), P(X, FLR, d1)].forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.closePath(); ctx.stroke();
    const dm = (d1 + d2) / 2, [nx, ny] = P(X, -80, dm);
    ctx.font = `${Math.round(54 / dm)}px Osw600`; ctx.fillStyle = 'rgba(220,228,245,0.7)'; ctx.textAlign = 'center'; ctx.fillText(label, nx, ny);
    if (label === '8C' && st.ajar > 0) {
      // the gap at the hinge-far edge, TV light pouring out
      const tv = st.tv ?? 1;
      const gd = lerp(d2, d2 - 0.12, st.ajar);
      quad(ctx, [P(X, -150, gd), P(X, -150, d2), P(X, FLR, d2), P(X, FLR, gd)], `rgba(${Math.round(120 + 90 * tv)},${Math.round(150 + 80 * tv)},255,${0.85})`);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      g = ctx.createLinearGradient(...P(X, FLR, d2), ...P(0, FLR, d2 + 0.3));
      g.addColorStop(0, `rgba(130,170,255,${0.45 * tv * st.ajar})`); g.addColorStop(1, 'rgba(130,170,255,0)');
      quad(ctx, [P(X, FLR, gd), P(X, FLR, d2), P(-60, FLR, d2 + 0.9), P(-60, FLR, gd - 0.5)], g);
      ctx.restore();
    }
  }
  // ceiling lights
  const LD = [1.0, 1.9, 3.0, 4.4, 6.2];
  LD.forEach((d, i) => {
    const on = lights[i] ?? 1;
    quad(ctx, [P(-90, CEIL, d), P(90, CEIL, d), P(90, CEIL, d + 0.22), P(-90, CEIL, d + 0.22)], on > 0.05 ? `rgba(225,235,255,${0.25 + 0.75 * on})` : '#11141f');
    if (on > 0.05) {
      const [lx, ly] = P(0, FLR, d + 0.1);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const gg = ctx.createRadialGradient(lx, ly, 0, lx, ly, 520 / d);
      gg.addColorStop(0, `rgba(140,160,215,${0.22 * on})`); gg.addColorStop(1, 'rgba(140,160,215,0)');
      ctx.fillStyle = gg; ctx.save(); ctx.translate(lx, ly); ctx.scale(1, 0.35); ctx.translate(-lx, -ly); ctx.fillRect(lx - 600, ly - 600, 1200, 1200); ctx.restore();
      ctx.restore();
      glow(ctx, ...P(0, CEIL, d + 0.1), 260 / d, 'rgba(170,190,255,A)', 0.3 * on);
    }
  });
  // character standing on the floor at depth cd
  if (st.char) {
    const cd = st.char.d, [cx, cy] = P(st.char.X || 0, FLR, cd);
    drawStick(ctx, { ...st.char, x: cx, y: cy, s: (st.char.k || 2.3) / cd });
  }
}
const corridorPoint = (X, Y, d) => P(X, Y, d);

// ---------- APARTMENT through the door ----------
// gap: 0 closed .. 1 fully open; who: {mode:'couch'|'stand', headSX, grin, headDY}
function drawApartment(ctx, t, st) {
  const tv = st.tv ?? (0.75 + 0.25 * noise1(t * 11) + (hash(Math.floor(t * 18)) > 0.85 ? -0.3 : 0));
  // room
  ctx.fillStyle = '#0a0e1f'; ctx.fillRect(-400, -400, W + 800, H + 800);
  let g = ctx.createLinearGradient(0, 420, 0, 1250); g.addColorStop(0, '#0d1226'); g.addColorStop(1, '#121a36');
  ctx.fillStyle = g; ctx.fillRect(-400, 420, W + 800, 830);
  ctx.fillStyle = '#080b18'; ctx.fillRect(-400, 1250, W + 800, 900);
  // window with blinds (left)
  ctx.fillStyle = '#0f1630'; ctx.fillRect(70, 520, 230, 330);
  ctx.fillStyle = 'rgba(160,180,230,0.10)'; for (let i = 0; i < 10; i++) ctx.fillRect(70, 530 + i * 32, 230, 10);
  // TV on the far wall
  const tx = 540, ty = 860;
  ctx.fillStyle = '#05060b'; ctx.fillRect(tx - 190, ty - 120, 380, 230);
  ctx.fillStyle = `rgba(${Math.round(140 + 80 * tv)},${Math.round(170 + 60 * tv)},255,${0.55 + 0.45 * tv})`; ctx.fillRect(tx - 176, ty - 106, 352, 202);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  for (let i = 0; i < 26; i++) { const yy = ty - 106 + ((i * 37 + Math.floor(t * 40) * 13) % 202); ctx.fillRect(tx - 176, yy, 352, 2); }
  ctx.fillStyle = '#05060b'; ctx.fillRect(tx - 120, ty + 110, 240, 30);
  glow(ctx, tx, ty, 900, 'rgba(120,160,255,A)', 0.28 * tv);
  // couch (back view)
  const w = st.who || { mode: 'couch' };
  if (w.mode === 'stand') {
    drawStick(ctx, { x: 540 + (w.dx || 0), y: 1470, s: 1.45, view: 'front', arm: 'down', fill: '#0b1022', grin: w.grin || 0, headSX: w.headSX ?? 1, rim: 0.35 * tv, headDY: w.headDY || 0 });
  }
  if (w.mode === 'couch') {
    drawStick(ctx, { x: 540, y: 1520, s: 1.25, view: 'back', arm: 'down', bust: true, fill: '#0b1022', headSX: w.headSX ?? 1, headDY: w.headDY || 0, headDX: w.headDX || 0 });
    glow(ctx, 540, 1030, 120, 'rgba(150,185,255,A)', 0.12 * tv);
  }
  rrect(ctx, 250, 1150, 580, 210, 40); ctx.fillStyle = '#151b38'; ctx.fill();
  rrect(ctx, 220, 1250, 640, 170, 30); ctx.fillStyle = '#10152e'; ctx.fill();
  ctx.fillStyle = 'rgba(120,160,255,0.12)'; ctx.fillRect(270, 1152, 540, 6);
  // door + frame covering everything except the gap
  const gap = clamp(st.gap ?? 0.1);
  const gx0 = lerp(512, 40, gap), gx1 = lerp(568, 1040, gap);
  ctx.fillStyle = '#141a33';
  ctx.fillRect(-400, -400, gx0 + 400, H + 800);  // frame + wall left
  ctx.fillRect(-400, -400, W + 800, 260 + 400); // header
  // door panel to the right (swinging in, foreshortened)
  const dg = ctx.createLinearGradient(gx1, 0, W + 200, 0); dg.addColorStop(0, '#2a3256'); dg.addColorStop(1, '#1a2042');
  ctx.fillStyle = dg; ctx.fillRect(gx1, -400, W + 600, H + 800);
  ctx.fillStyle = `rgba(150,185,255,${0.35 * tv})`; ctx.fillRect(gx1, 260, 6, 1700);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(gx0 - 8, 260, 8, 1700);
  if (gap < 0.25) {
    // door details: 8C plaque + peephole, visible when nearly closed
    const k = 1 - gap * 4;
    ctx.save(); ctx.globalAlpha = k;
    rrect(ctx, gx1 + 160, 620, 150, 80, 10); ctx.fillStyle = '#39436a'; ctx.fill();
    ctx.font = '56px Osw700'; ctx.fillStyle = '#e3e8f5'; ctx.textAlign = 'center'; ctx.fillText('8C', gx1 + 235, 682);
    ctx.beginPath(); ctx.arc(gx1 + 235, 820, 14, 0, 7); ctx.fillStyle = '#05060b'; ctx.fill();
    ctx.fillStyle = '#39436a'; ctx.fillRect(gx1 + 40, 1120, 90, 26);
    ctx.restore();
  }
}

// ---------- RULE CARD ----------
function drawRuleCard(ctx, t, lt, st) {
  if (st.bg) { ctx.save(); ctx.filter = 'blur(14px)'; ctx.drawImage(st.bg, 0, 0); ctx.restore(); }
  ctx.fillStyle = `rgba(3,5,12,${0.78 * clamp(lt / 0.3)})`; ctx.fillRect(0, 0, W, H);
  // stamp
  const sa = E.outBack(clamp(lt / 0.25));
  if (lt > 0) {
    ctx.save(); ctx.translate(540, 640); ctx.rotate(-0.06); ctx.scale(lerp(1.6, 1, sa), lerp(1.6, 1, sa)); ctx.globalAlpha = clamp(lt / 0.08);
    rrect(ctx, -230, -78, 460, 156, 10); ctx.fillStyle = C.red; ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = '#ffffff'; rrect(ctx, -218, -66, 436, 132, 6); ctx.stroke();
    ctx.font = '112px Osw700'; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(st.title, 0, 6);
    ctx.restore();
  }
  (st.lines || []).forEach((ln, i) => {
    const a = clamp((t - ln.t) / 0.14);
    if (a <= 0) return;
    D.drawCaption(ctx, ln.text, t - ln.t, { y: 900 + i * 112, size: 86 });
  });
  if (st.footer && t > st.footerT) {
    ctx.save(); ctx.globalAlpha = clamp((t - st.footerT) / 0.3);
    ctx.font = '30px Mono700'; ctx.fillStyle = 'rgba(238,241,247,0.75)'; ctx.textBaseline = 'alphabetic';
    spaced(ctx, st.footer, 540, 1330, 6, 'center');
    if (st.footer2) { ctx.font = '22px Mono500'; ctx.fillStyle = 'rgba(238,241,247,0.45)'; spaced(ctx, st.footer2, 540, 1380, 4, 'center'); }
    ctx.restore();
  }
}

// ---------- CAR PANEL (one button) ----------
function drawCarPanel(ctx, t, st) {
  const lit = st.light ?? 1;
  let g = ctx.createLinearGradient(0, 0, W, 0); g.addColorStop(0, '#8792b2'); g.addColorStop(1, '#6b7697');
  ctx.fillStyle = g; ctx.fillRect(-400, -400, W + 800, H + 800);
  rrect(ctx, 200, 260, 680, 1400, 30);
  g = ctx.createLinearGradient(200, 0, 880, 0); g.addColorStop(0, '#b9c2d9'); g.addColorStop(0.5, '#d4dbeb'); g.addColorStop(1, '#a8b2cc');
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(40,50,80,0.4)'; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; for (let i = 0; i < 40; i++) ctx.fillRect(210, 280 + i * 34, 660, 1);
  for (const [x, y] of [[240, 300], [840, 300], [240, 1620], [840, 1620]]) { ctx.beginPath(); ctx.arc(x, y, 10, 0, 7); ctx.fillStyle = '#7b86a6'; ctx.fill(); }
  ctx.font = '28px Mono700'; ctx.fillStyle = 'rgba(40,48,78,0.6)'; spaced(ctx, 'CAR 1', 540, 380, 6, 'center');
  // empty sockets where buttons used to be
  for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) {
    const x = 420 + c * 240, y = 560 + r * 200;
    ctx.beginPath(); ctx.arc(x, y, 58, 0, 7); ctx.fillStyle = '#9aa4c0'; ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, 46, 0, 7); ctx.fillStyle = '#2a3150'; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 30, y - 10); ctx.lineTo(x + 26, y + 18); ctx.stroke();
  }
  // the only button
  const bx = 540, by = 1380, pr = st.press || 0;
  ctx.beginPath(); ctx.arc(bx, by, 92, 0, 7); ctx.fillStyle = '#8c96b3'; ctx.fill();
  ctx.beginPath(); ctx.arc(bx, by, 74 - pr * 4, 0, 7); ctx.fillStyle = '#1a0608'; ctx.fill();
  ctx.lineWidth = 8; ctx.strokeStyle = `rgba(255,${Math.round(46 + 40 * pr)},${Math.round(60 + 30 * pr)},${0.6 + 0.4 * pr})`; ctx.stroke();
  ctx.font = '96px Osw700'; ctx.fillStyle = `rgba(255,70,80,${0.7 + 0.3 * pr})`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('0', bx, by + 4);
  glow(ctx, bx, by, 260 + 160 * pr, 'rgba(255,40,60,A)', (0.35 + 0.45 * pr) * lit);
  // finger (stick arm) pressing
  if (st.finger > 0) {
    const k = E.out(clamp(st.finger));
    ctx.strokeStyle = C.white; ctx.lineWidth = 16; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(lerp(1300, 1100, k), lerp(2300, 2100, k)); ctx.lineTo(lerp(1000, bx + 40, k), lerp(2000, by + 50, k)); ctx.stroke();
  }
  if (lit < 1) { ctx.fillStyle = `rgba(0,0,6,${(1 - lit) * 0.7})`; ctx.fillRect(-400, -400, W + 800, H + 800); }
}

// ---------- CAR INSIDE, facing the doors ----------
// st: {open 0..1, outside(ctx) painter for what's beyond, light, red (0..1 tint), char, ind}
function drawCarInside(ctx, t, st) {
  const L = st.light ?? 1;
  // side walls in perspective + front wall
  const fx0 = 150, fx1 = 930, fy0 = 300, fy1 = 1720;
  ctx.fillStyle = '#5d6889'; ctx.fillRect(-400, -400, W + 800, H + 800);
  poly(ctx, [[-200, -200], [fx0, fy0], [fx0, fy1], [-200, 2300]], '#7d89aa');
  poly(ctx, [[1280, -200], [fx1, fy0], [fx1, fy1], [1280, 2300]], '#7380a2');
  poly(ctx, [[-200, -200], [1280, -200], [fx1, fy0], [fx0, fy0]], '#dfe5f3');
  poly(ctx, [[-200, 2300], [1280, 2300], [fx1, fy1], [fx0, fy1]], '#5b6684');
  // ceiling light
  poly(ctx, [[360, 120], [720, 120], [680, 230], [400, 230]], '#ffffff');
  const fg = ctx.createLinearGradient(0, fy0, 0, fy1); fg.addColorStop(0, '#b6c0d8'); fg.addColorStop(1, '#929dbb');
  ctx.fillStyle = fg; ctx.fillRect(fx0, fy0, fx1 - fx0, fy1 - fy0);
  // handrails
  ctx.strokeStyle = '#59647f'; ctx.lineWidth = 12;
  ctx.beginPath(); ctx.moveTo(-120, 1360); ctx.lineTo(fx0, 1180); ctx.moveTo(1200, 1360); ctx.lineTo(fx1, 1180); ctx.stroke();
  // doors
  const dx0 = 300, dx1 = 780, dy0 = 560, dy1 = 1720;
  const op = clamp(st.open || 0);
  ctx.save(); ctx.beginPath(); ctx.rect(dx0, dy0, dx1 - dx0, dy1 - dy0); ctx.clip();
  if (op > 0.001 && st.outside) st.outside(ctx, dx0, dy0, dx1, dy1);
  const pw = (dx1 - dx0) / 2, sl = pw * op;
  for (const side of [-1, 1]) {
    const x = side < 0 ? dx0 - sl : 540 + sl;
    const g2 = ctx.createLinearGradient(x, 0, x + pw, 0); g2.addColorStop(0, '#a5afc9'); g2.addColorStop(1, '#c3cbe0');
    ctx.fillStyle = g2; ctx.fillRect(x, dy0, pw, dy1 - dy0);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(side < 0 ? x + pw - 3 : x, dy0, 3, dy1 - dy0);
  }
  ctx.restore();
  ctx.strokeStyle = '#6c7796'; ctx.lineWidth = 10; ctx.strokeRect(dx0, dy0, dx1 - dx0, dy1 - dy0);
  // indicator inside the car
  drawIndicator(ctx, 540, 440, 8, st.ind || { ch: '0', arrow: ' ' });
  // lighting
  if (st.red > 0) { ctx.fillStyle = `rgba(120,0,10,${0.45 * st.red})`; ctx.fillRect(-400, -400, W + 800, H + 800); }
  if (L < 1) { ctx.fillStyle = `rgba(0,0,6,${(1 - L) * 0.8})`; ctx.fillRect(-400, -400, W + 800, H + 800); }
  if (st.char) drawStick(ctx, st.char);
}

// ---------- FLOOR 0: mirrored, inverted lobby ----------
const off = createCanvas(W, H), offx = off.getContext('2d');
function drawFloor0(ctx, t, st) {
  // st.cam = [cx, cy, z] in mirrored screen-world coordinates; lobby rendered with all lights on, then flipped + inverted
  const [cx, cy, z] = st.cam || [540, 1100, 1];
  offx.setTransform(1, 0, 0, 1, 0, 0); offx.globalAlpha = 1; offx.filter = 'none';
  offx.fillStyle = '#000'; offx.fillRect(0, 0, W, H);
  offx.save(); camera(offx, 1080 - cx, cy, z);
  S.drawLobby(offx, t, { light: st.light ?? 1, door: st.door ?? 0, lit: st.lit || 0, ind: { ch: '0', arrow: ' ' }, stairDoor: true });
  offx.restore();
  ctx.save();
  ctx.filter = 'invert(1) hue-rotate(180deg) saturate(0.6) brightness(1.02)';
  ctx.translate(W, 0); ctx.scale(-1, 1); ctx.drawImage(off, 0, 0);
  ctx.restore();
  ctx.filter = 'none';
  // crowd + characters in the same (mirrored) world
  ctx.save(); camera(ctx, cx, cy, z);
  for (const e of (st.crowd || [])) {
    if (e.vis === 0) continue;
    ctx.save(); ctx.globalAlpha = e.vis ?? 1;
    drawEntity(ctx, e.x, e.y, e.s, { t: t + e.seed, mode: 'back', col: '#07080e', tilt: e.tilt ?? 0.2, rim: 0 });
    ctx.restore();
  }
  if (st.char) drawStick(ctx, st.char);
  ctx.restore();
}
// fixed crowd layout (mirrored lobby world coordinates)
const CROWD = [
  { x: 120, y: 1440, s: 0.82, tilt: 0.25, seed: 1 }, { x: 255, y: 1440, s: 0.78, tilt: -0.15, seed: 2 },
  { x: 830, y: 1440, s: 0.8, tilt: 0.3, seed: 3 }, { x: 965, y: 1440, s: 0.84, tilt: -0.2, seed: 4 },
  { x: -120, y: 1480, s: 0.95, tilt: 0.1, seed: 5 }, { x: 1200, y: 1480, s: 0.95, tilt: 0.35, seed: 6 },
  { x: 40, y: 1560, s: 1.02, tilt: -0.3, seed: 7 }, { x: 1040, y: 1560, s: 1.02, tilt: 0.18, seed: 8 },
  { x: -260, y: 1660, s: 1.15, tilt: 0.22, seed: 9 }, { x: 1340, y: 1660, s: 1.15, tilt: -0.25, seed: 10 },
  { x: 360, y: 1440, s: 0.74, tilt: 0.12, seed: 11 }, { x: 720, y: 1440, s: 0.74, tilt: -0.1, seed: 12 },
  { x: -400, y: 1800, s: 1.3, tilt: 0.2, seed: 13 }, { x: 1480, y: 1800, s: 1.3, tilt: -0.18, seed: 14 },
];

module.exports = { drawStairwell, stairPos, landY, drawCorridor, corridorPoint, drawApartment, drawRuleCard, drawCarPanel, drawCarInside, drawFloor0, CROWD };
