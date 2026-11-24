// NIGHT SHIFT Season 2 Ep 1 — the railway level crossing (v4 look). Palette: cold LED floodlight (white-mint) over violet night,
// red-and-white boom barrier, red crossing lamps, one warm hut bulb, signal green. World = 1080x1920 frame looking down the road at
// the crossing: the tracks run left-right at y ~1000-1060, the near barrier spans the road at y ~1250, hut right, signal post left.
const D = require('./draw');
const L = require('./look4');
const Wd = require('./sets_wedding');
const { clamp, lerp, E, hash, noise1 } = D;
const { mix, rgba, dust, beam } = L;

const RAIL_Y = 1046;            // ground line of the track bed (feet of anything on the rails)
const GATE = { px: 128, py: 1236, len: 880 };
const SIGNAL = { x: 214, base: 1004, top: 556 };
const FLOOD = { x: 772, top: 360, base: 996 };
const COL = { body: '#07080c', rim: '#d6ecff', skin: '#9a9690', red: '#d9232c', white: '#f1eee6', warm: '#ffc46a', green: '#45ff97' };

// ------------------------------------------------------------------ helpers
function limb(ctx, pts, w0, w1, col) {
  // tapered limb through joints pts=[[x,y],...]: stroke each segment with decreasing width
  ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let i = 0; i < pts.length - 1; i++) {
    ctx.lineWidth = lerp(w0, w1, i / Math.max(1, pts.length - 2));
    ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[i + 1][0], pts[i + 1][1]); ctx.stroke();
  }
  ctx.fillStyle = col; const e = pts[pts.length - 1]; ctx.beginPath(); ctx.arc(e[0], e[1], w1 * 0.75, 0, Math.PI * 2); ctx.fill();
}
const LJ = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

// ------------------------------------------------------------------ the crawler
// SIDE view, facing +x (dir), belly up, feet on y. s = px per unit (~60 units tall arch, knees to -112).
function crawlerSide(ctx, x, y, s, t, o = {}) {
  const p = o.phase ?? t * 4.2, dir = o.dir ?? 1, rim = o.rim || COL.rim, lt = o.light ?? 1;
  const bob = Math.sin(p * 2) * 2;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  const leg = (ph, far) => {
    const sw = Math.sin(ph), lift = Math.max(0, Math.cos(ph)) * 7;
    const H = [-24, -58 + bob], K = [-8 + sw * 5, -114 + bob - lift * 0.6], F = [-36 + sw * 13, -lift];
    return [H, K, F];
  };
  const arm = (ph) => {
    const sw = Math.sin(ph), lift = Math.max(0, Math.cos(ph)) * 6;
    const S = [22, -62 + bob], El = [12 + sw * 3, -30 + bob * 0.5 - lift * 0.4], Hd = [40 + sw * 12, -lift];
    return [S, El, Hd];
  };
  const torso = (c) => {
    ctx.fillStyle = c; ctx.beginPath();
    ctx.moveTo(-30, -52 + bob); ctx.quadraticCurveTo(-4, -92 + bob, 28, -68 + bob);
    ctx.lineTo(30, -56 + bob); ctx.quadraticCurveTo(0, -62 + bob, -26, -46 + bob); ctx.closePath(); ctx.fill();
  };
  const head = (c) => {
    ctx.strokeStyle = c; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(26, -62 + bob); ctx.quadraticCurveTo(40, -62 + bob, 42, -50 + bob); ctx.stroke();
    ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(44 + (o.jerk || 0) * 4, -40 + bob, 9, 11, 0.25 + (o.jerk || 0), 0, Math.PI * 2); ctx.fill();
  };
  const draw = (c, cf) => {
    limb(ctx, leg(p + Math.PI), 8.5, 5.5, cf); limb(ctx, arm(p), 6, 4.5, cf);
    torso(c); head(c);
    limb(ctx, leg(p), 9.5, 6, c); limb(ctx, arm(p + Math.PI), 6.5, 4.8, c);
  };
  // rim pass (offset toward the light: up), then the body
  ctx.save(); ctx.translate(0, -1.6); draw(rgba(rim, 0.85 * lt), rgba(rim, 0.4 * lt)); ctx.restore();
  draw(COL.body, '#030305');
  // eyes in the upside-down face (they sit LOW on the head)
  const ea = o.eyes ?? 1;
  if (ea > 0) for (const e of [[-2.5, 0], [3.5, 0]]) {
    ctx.fillStyle = rgba('#f4fbff', 0.95 * ea); ctx.beginPath(); ctx.ellipse(46 + e[0] + (o.jerk || 0) * 4, -34 + bob + e[1], 1.6, 1.3, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  if (ea > 0) D.glow(ctx, x + 46 * s * dir, y + (-34 + bob) * s, 9 * s, 'rgba(220,240,255,A)', 0.18 * ea);
}

// FRONT view, facing the camera. k = 0 crawling (bridge pose: upside-down head between the hands, knees up past the head)
// .. 1 standing (very tall, the upside-down head hanging in front of his chest). feet at y, s px per unit.
function crawlerFront(ctx, x, y, s, t, o = {}) {
  const k = E.inOut(clamp(o.stand || 0)), p = o.phase ?? t * 4, rim = o.rim || COL.rim, lt = o.light ?? 1;
  const g = (ph) => Math.max(0, Math.sin(ph)) * 6 * (1 - k);
  const sway = Math.sin(t * 0.9) * 2 * k;
  const J = (side) => {
    const ph = p + (side > 0 ? 0 : Math.PI);
    return {
      hand: LJ([side * 31, -g(ph)], [side * 28 + sway, -84], k),
      elbow: LJ([side * 44, -30 - g(ph) * 0.5], [side * 30 + sway, -132], k),
      shoulder: LJ([side * 18, -50], [side * 21 + sway, -182], k),
      hip: LJ([side * 12, -64], [side * 9, -120], k),
      knee: LJ([side * 41, -120 - g(ph + Math.PI) * 0.6], [side * 12, -62], k),
      foot: LJ([side * 25, -2 - g(ph + Math.PI)], [side * 10, 0], k),
    };
  };
  const A = J(-1), B = J(1);
  const headC = LJ([0, -30], [sway * 1.2, -150], k), neckTop = LJ([0, -48], [sway, -190], k);
  const jerk = o.jerk || 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const draw = (c, cf) => {
    // far bits first: legs behind (in the crawl the knees stick up behind the head)
    for (const Q of [A, B]) limb(ctx, [Q.hip, Q.knee, Q.foot], 9, 6, cf);
    // torso
    ctx.fillStyle = c; ctx.beginPath();
    ctx.moveTo(A.shoulder[0], A.shoulder[1]); ctx.lineTo(B.shoulder[0], B.shoulder[1]);
    ctx.lineTo(B.hip[0] + 2, B.hip[1]); ctx.lineTo(A.hip[0] - 2, A.hip[1]); ctx.closePath(); ctx.fill();
    // neck: from between the shoulders bending over/down to the head
    ctx.strokeStyle = c; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo((A.shoulder[0] + B.shoulder[0]) / 2, (A.shoulder[1] + B.shoulder[1]) / 2);
    ctx.quadraticCurveTo(neckTop[0], neckTop[1] - 6 * k, headC[0], headC[1] - 10); ctx.stroke();
    for (const Q of [A, B]) limb(ctx, [Q.shoulder, Q.elbow, Q.hand], 6.5, 4.5, c);
    ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(headC[0], headC[1], 10, 12.5, jerk, 0, Math.PI * 2); ctx.fill();
  };
  ctx.save(); ctx.translate(0, -1.8); draw(rgba(rim, 0.8 * lt), rgba(rim, 0.35 * lt)); ctx.restore();
  draw(COL.body, '#030305');
  // the upside-down face: a pale smear, mouth ABOVE the eyes
  const fa = o.face ?? 1;
  if (fa > 0) {
    ctx.save(); ctx.translate(headC[0], headC[1]); ctx.rotate(Math.PI + jerk);
    ctx.fillStyle = rgba('#b9c3cc', 0.16 * fa); ctx.beginPath(); ctx.ellipse(0, 1, 7.5, 9.5, 0, 0, Math.PI * 2); ctx.fill();
    for (const sx of [-3.4, 3.4]) { ctx.fillStyle = rgba('#f4fbff', 0.96 * fa); ctx.beginPath(); ctx.ellipse(sx, -2.5, 1.9, 1.5, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = rgba('#000000', 0.8 * fa); ctx.beginPath(); ctx.ellipse(0, 5.5, 3.2, 0.9 + (o.mouth || 0) * 2.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
  if (fa > 0) D.glow(ctx, x + headC[0] * s, y + (headC[1] + 2.5) * s, 10 * s, 'rgba(220,240,255,A)', 0.2 * fa);
}

// ------------------------------------------------------------------ props
function barrier(ctx, ang, lt, t, o = {}) {
  // near boom barrier: post + counterweight at the pivot, striped arm. ang 0 = closed (across the road), 1 = raised
  const a = -E.inOut(clamp(ang)) * 1.38;
  const { px, py, len } = GATE;
  ctx.save();
  // post
  ctx.fillStyle = mix('#3a3d44', '#1a1c22', 1 - lt); ctx.fillRect(px - 26, py - 30, 52, 330);
  ctx.fillStyle = mix('#f1eee6', '#5a6070', 1 - lt); for (let i = 0; i < 4; i++) ctx.fillRect(px - 26, py + 20 + i * 70, 52, 34);
  // twin red crossing lamps on a crossbar above the post
  ctx.fillStyle = '#121318'; ctx.fillRect(px - 120, py - 250, 240, 26); ctx.fillRect(px - 10, py - 250, 20, 220);
  const fl = o.flash ? (Math.floor(t * 2.6) % 2) : -1;
  for (const [i, lx] of [[0, px - 82], [1, px + 82]]) {
    ctx.fillStyle = '#0b0b0e'; ctx.beginPath(); ctx.arc(lx, py - 237, 44, 0, Math.PI * 2); ctx.fill();
    const on = fl === i;
    ctx.fillStyle = on ? '#ff3a30' : '#4a1210'; ctx.beginPath(); ctx.arc(lx, py - 237, 30, 0, Math.PI * 2); ctx.fill();
    if (on) D.glow(ctx, lx, py - 237, 220, 'rgba(255,50,40,A)', 0.55);
  }
  // arm
  ctx.translate(px, py); ctx.rotate(a);
  ctx.fillStyle = '#1a1b20'; D.rrect(ctx, -150, -34, 150, 68, 10); ctx.fill();      // counterweight
  const st = 12;
  for (let i = 0; i < st; i++) {
    ctx.fillStyle = i % 2 ? mix(COL.white, '#4a5262', 1 - lt) : mix(COL.red, '#3a1418', 1 - lt);
    ctx.fillRect(i * len / st, -17, len / st + 1, 34);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, 8, len, 9);
  // a red reflector disc hanging at the tip
  ctx.fillStyle = '#ff4036'; ctx.beginPath(); ctx.arc(len - 30, 32, 16, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function farBarrier(ctx, ang, lt) {
  const a = -E.inOut(clamp(ang)) * 1.38;
  ctx.save(); ctx.translate(930, 930);
  ctx.fillStyle = '#2a2c33'; ctx.fillRect(-7, -10, 14, 90);
  ctx.rotate(Math.PI - a);
  for (let i = 0; i < 10; i++) { ctx.fillStyle = i % 2 ? mix(COL.white, '#4a5262', 1 - lt) : mix(COL.red, '#3a1418', 1 - lt); ctx.fillRect(i * 38, -5, 39, 10); }
  ctx.restore();
}
function signalPost(ctx, lt, t, col = 'green') {
  const { x, base, top } = SIGNAL;
  ctx.fillStyle = '#16181e'; ctx.fillRect(x - 9, top, 18, base - top);
  ctx.fillStyle = '#0c0d11'; D.rrect(ctx, x - 34, top - 10, 68, 140, 14); ctx.fill();
  for (const [i, c] of [[0, '#ff3a30'], [1, '#45ff97']]) {
    const on = (col === 'red' && i === 0) || (col === 'green' && i === 1);
    ctx.fillStyle = on ? c : '#1c1f22'; ctx.beginPath(); ctx.arc(x, top + 30 + i * 62, 20, 0, Math.PI * 2); ctx.fill();
    if (on) D.glow(ctx, x, top + 30 + i * 62, 120, i ? 'rgba(70,255,150,A)' : 'rgba(255,60,50,A)', 0.45);
  }
  ctx.fillStyle = '#0c0d11'; ctx.fillRect(x - 60, top + 150, 120, 10);   // ladder rest
  for (let i = 0; i < 9; i++) ctx.fillRect(x + 10, top + 200 + i * 28, 22, 4);
}
function hut(ctx, lt, t, o = {}) {
  ctx.save(); ctx.translate(900, 1010);
  const wall = mix('#cdb184', '#3b4252', 1 - lt * 0.7);
  ctx.fillStyle = wall; ctx.fillRect(-120, -250, 330, 250);
  ctx.fillStyle = '#5c2a20'; ctx.beginPath(); ctx.moveTo(-150, -240); ctx.lineTo(45, -330); ctx.lineTo(240, -240); ctx.closePath(); ctx.fill();
  // lit window + door
  ctx.fillStyle = '#ffd58a'; ctx.fillRect(-80, -190, 110, 90); D.glow(ctx, -25, -145, 160, 'rgba(255,200,110,A)', 0.5);
  ctx.strokeStyle = '#3a2418'; ctx.lineWidth = 6; ctx.strokeRect(-80, -190, 110, 90); ctx.beginPath(); ctx.moveTo(-25, -190); ctx.lineTo(-25, -100); ctx.stroke();
  ctx.fillStyle = o.doorOpen ? '#ffcf7a' : '#3a2418'; ctx.fillRect(70, -170, 80, 170);
  // the bell above the door
  ctx.fillStyle = '#c8952e'; ctx.beginPath(); ctx.arc(110, -205, 18, Math.PI, 0); ctx.fill();
  // painted name board
  ctx.fillStyle = '#f2e9d0'; ctx.fillRect(-110, -236, 160, 34); ctx.fillStyle = '#1a2a6a'; ctx.font = '22px Serif4'; ctx.textAlign = 'center'; ctx.fillText('L.C. No. 41', -30, -211);
  ctx.restore();
}
function lantern(ctx, x, y, s, t, o = {}) {
  // old hurricane lantern; o.side = lying on its side, o.lit
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); if (o.side) ctx.rotate(-1.45);
  const lit = o.lit ?? 1, fl = 0.85 + 0.15 * noise1(t * 9);
  ctx.fillStyle = '#5a2c1c'; D.rrect(ctx, -34, -12, 68, 14, 4); ctx.fill();        // base tank
  ctx.fillStyle = rgba('#ffcf80', 0.25 + 0.35 * lit * fl); ctx.beginPath(); ctx.ellipse(0, -46, 24, 34, 0, 0, Math.PI * 2); ctx.fill();   // glass
  ctx.strokeStyle = '#3a2418'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(0, -46, 24, 34, 0, 0, Math.PI * 2); ctx.stroke();
  if (lit) { ctx.fillStyle = rgba('#fff1c0', fl); ctx.beginPath(); ctx.ellipse(0, -44, 5, 11 * fl, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-8, -70); ctx.lineTo(4, -52); ctx.lineTo(-4, -36); ctx.stroke();   // crack
  ctx.fillStyle = '#3a2418'; ctx.fillRect(-26, -84, 52, 8); ctx.beginPath(); ctx.arc(0, -84, 30, Math.PI, 0); ctx.lineWidth = 4; ctx.stroke();
  ctx.restore();
  if (lit) D.glow(ctx, x + (o.side ? -44 * s : 0), y + (o.side ? -4 * s : -44 * s), 140 * s, 'rgba(255,190,90,A)', 0.45 * lit * fl);
}

// ------------------------------------------------------------------ the whole crossing
function crossing(ctx, t, o = {}) {
  const lt = o.light ?? 1;
  // sky
  const sk = ctx.createLinearGradient(0, -300, 0, 900);
  sk.addColorStop(0, '#070a1c'); sk.addColorStop(0.65, '#1b2350'); sk.addColorStop(1, '#3a3f6e');
  ctx.fillStyle = sk; ctx.fillRect(-400, -400, 1880, 1340);
  D.glow(ctx, 300, 250, 260, 'rgba(200,215,255,A)', 0.18);
  ctx.fillStyle = '#e8ecff'; ctx.beginPath(); ctx.arc(300, 250, 30, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 60; i++) { ctx.fillStyle = `rgba(230,235,255,${0.25 + hash(i) * 0.5})`; ctx.fillRect(hash(i * 3.1) * 1480 - 200, hash(i * 7.3) * 700 - 200, 2, 2); }
  // tree line + distant village lights
  ctx.fillStyle = '#0a0d1a'; ctx.beginPath(); ctx.moveTo(-400, 900);
  for (let x = -400; x <= 1480; x += 30) ctx.lineTo(x, 860 - noise1(x * 0.01) * 90 - hash(x) * 14);
  ctx.lineTo(1480, 940); ctx.lineTo(-400, 940); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 9; i++) D.glow(ctx, 40 + hash(i * 5.5) * 1000, 905 + hash(i) * 12, 8, 'rgba(255,200,120,A)', 0.7);
  // ground
  const gr = ctx.createLinearGradient(0, 900, 0, 2200); gr.addColorStop(0, '#1c2230'); gr.addColorStop(1, '#0c0f16');
  ctx.fillStyle = gr; ctx.fillRect(-400, 900, 1880, 1400);
  // the road (to the crossing and beyond)
  ctx.fillStyle = '#272b34'; ctx.beginPath(); ctx.moveTo(470, 905); ctx.lineTo(610, 905); ctx.lineTo(1060, 2200); ctx.lineTo(20, 2200); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(240,235,220,0.55)'; for (let i = 0; i < 9; i++) { const y0 = 930 + Math.pow(i / 8, 1.8) * 1200, y1 = y0 + 20 + i * 14; ctx.beginPath(); ctx.moveTo(538, y0); ctx.lineTo(542, y0); ctx.lineTo(546 + i, y1); ctx.lineTo(534 - i, y1); ctx.closePath(); ctx.fill(); }
  if (o.prints) prints(ctx, lt);
  farBarrier(ctx, o.bar ?? 0, lt);
  // the track bed (left-right), ballast, sleepers, two rails
  ctx.fillStyle = '#2f2b2a'; ctx.beginPath(); ctx.moveTo(-400, 990); ctx.lineTo(1480, 988); ctx.lineTo(1480, 1074); ctx.lineTo(-400, 1078); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 70; i++) { const x = -400 + i * 28; ctx.fillStyle = '#3d2e25'; ctx.fillRect(x, 1000, 16, 60); }
  for (const [ry, w] of [[1012, 7], [1044, 9]]) {
    ctx.fillStyle = '#5e6670'; ctx.fillRect(-400, ry, 1880, w);
    ctx.fillStyle = rgba('#e6f3ff', 0.55 * lt + 0.15); ctx.fillRect(-400, ry, 1880, 2);
  }
  signalPost(ctx, lt, t, o.signal || 'green');
  hut(ctx, lt, t, o);
  // floodlight mast
  ctx.fillStyle = '#15171d'; ctx.fillRect(FLOOD.x - 8, FLOOD.top, 16, FLOOD.base - FLOOD.top);
  ctx.fillStyle = '#0c0d11'; D.rrect(ctx, FLOOD.x - 70, FLOOD.top - 26, 120, 34, 8); ctx.fill();
  ctx.fillStyle = lt > 0.1 ? '#f2fbff' : '#2a3038'; ctx.fillRect(FLOOD.x - 62, FLOOD.top + 4, 104, 8);
  if (o.lantern) lantern(ctx, o.lantern.x ?? 610, o.lantern.y ?? 1040, o.lantern.s ?? 0.9, t, { side: true, lit: 1 });
  if (o.crawler) {
    const c = o.crawler;
    if (c.view === 'front') crawlerFront(ctx, c.x, c.y ?? RAIL_Y, c.s, t, { ...c, light: lt });
    else crawlerSide(ctx, c.x, c.y ?? RAIL_Y, c.s, t, { ...c, light: lt });
  }
  if (o.you) Wd.person(ctx, o.you.x, o.you.y, o.you.h, { rim: o.you.rim || '#ffc46a', rimSide: o.you.rimSide ?? 1, view: o.you.view || 'back', fear: o.you.fear || 0, walk: o.you.walk ?? null, col: '#101014' });
  if (o.crawlerNear) { const c = o.crawlerNear; crawlerFront(ctx, c.x, c.y, c.s, t, { ...c, light: lt }); }
  barrier(ctx, o.bar ?? 0, lt, t, { flash: o.flash });
  // floodlight: cone + pool on the crossing (additive)
  if (lt > 0.02) {
    beam(ctx, FLOOD.x - 10, FLOOD.top + 10, 0.32, 760, 90, 760, '#e9f6ff', 0.2 * lt);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const pg = ctx.createRadialGradient(560, 1040, 40, 560, 1060, 620); pg.addColorStop(0, rgba('#cfe8ff', 0.3 * lt)); pg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = pg; ctx.fillRect(-100, 600, 1300, 1000); ctx.restore();
    dust(ctx, t, 420, 400, 500, 640, 34, '#e6f4ff', 0.45 * lt, 3);
    D.glow(ctx, FLOOD.x - 10, FLOOD.top + 8, 120, 'rgba(240,250,255,A)', 0.8 * lt);
  }
  // red crossing lamps wash the scene when flashing
  if (o.flash && Math.floor(t * 2.6) % 2 >= 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,40,30,${0.05 + 0.04 * Math.sin(t * 16.3)})`; ctx.fillRect(-400, -400, 1880, 2700); ctx.restore(); }
}
// hand-and-foot prints in the road dust beyond the barrier (four limbs, wrong spacing)
function prints(ctx, lt) {
  ctx.save(); ctx.fillStyle = rgba('#0a0b0f', 0.7);
  for (let i = 0; i < 7; i++) {
    const y = 1110 + i * 34 + i * i * 4, x = 520 + Math.sin(i * 1.7) * 14, sc = 0.6 + i * 0.12;
    for (const [dx, w, h] of [[-26, 7, 10], [26, 7, 10], [-14, 5, 13], [14, 5, 13]]) { ctx.beginPath(); ctx.ellipse(x + dx * sc, y + (dx > 0 ? 6 : 0), w * sc, h * sc * 0.5, 0, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore();
}

// ------------------------------------------------------------------ inserts
// the note in your hand (2 rules)
function note(ctx, t, o = {}) {
  ctx.save(); ctx.translate(560, 930); ctx.rotate(-0.08 + Math.sin(t * 0.8) * 0.01);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(-400, -230, 820, 500);
  const pg = ctx.createLinearGradient(-420, 0, 420, 0); pg.addColorStop(0, '#efe6cc'); pg.addColorStop(0.65, '#d9cba8'); pg.addColorStop(1, '#6a5c44');
  ctx.fillStyle = pg; ctx.beginPath(); ctx.moveTo(-420, -250); ctx.lineTo(410, -240); ctx.lineTo(420, 240); ctx.lineTo(-410, 255); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(80,50,20,0.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-10, -245); ctx.lineTo(5, 250); ctx.stroke();
  ctx.fillStyle = '#1e1a40'; ctx.font = '60px Serif4i'; ctx.textAlign = 'left';
  const a1 = clamp((t - (o.l1 || 0)) / 0.25), a2 = clamp((t - (o.l2 || 0)) / 0.25);
  ctx.globalAlpha = 0.25 + 0.75 * a1; ctx.fillText('1. Bell rings: close the gate.', -370, -90);
  ctx.globalAlpha = 0.25 + 0.75 * a2; ctx.fillText('2. Never open it for', -370, 20); ctx.fillText('    anyone on foot.', -370, 92);
  ctx.globalAlpha = 0.8; ctx.font = '40px Serif4i'; ctx.fillStyle = '#4a3a1c'; ctx.fillText('— the old gatekeeper', -40, 190);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#2a1a12'; ctx.beginPath(); ctx.ellipse(-400, 150, 60, 36, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a100b'; ctx.fillRect(-600, 130, 200, 200);
  ctx.restore();
  const sh = ctx.createLinearGradient(760, 0, 1080, 0); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = sh; ctx.fillRect(0, 0, 1080, 1920);
}
// the electric bell on the hut wall + the clock (the only time in the episode: 2:40). ring 0..1 hammer blur
function bellWall(ctx, t, o = {}) {
  const ring = o.ring || 0;
  ctx.fillStyle = '#7c6a4c'; ctx.fillRect(-300, -300, 1680, 2520);
  ctx.strokeStyle = 'rgba(0,0,0,0.16)'; ctx.lineWidth = 3; for (let i = 0; i < 30; i++) { ctx.beginPath(); ctx.moveTo(-100, i * 80 + noise1(i) * 30); ctx.lineTo(1200, i * 80 + noise1(i + 5) * 30); ctx.stroke(); }
  D.glow(ctx, 300, 300, 900, 'rgba(255,200,120,A)', 0.25);
  // clock
  ctx.save(); ctx.translate(820, 420);
  ctx.fillStyle = '#efe6d2'; ctx.beginPath(); ctx.arc(0, 0, 120, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#2a2a30'; ctx.lineWidth = 12; ctx.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(Math.sin(a) * 92, -Math.cos(a) * 92); ctx.lineTo(Math.sin(a) * 106, -Math.cos(a) * 106); ctx.stroke(); }
  const hh = (2 + 40 / 60) / 12 * Math.PI * 2, mm = 40 / 60 * Math.PI * 2;
  ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(hh) * 56, -Math.cos(hh) * 56); ctx.stroke();
  ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(mm) * 90, -Math.cos(mm) * 90); ctx.stroke();
  const sa = (Math.floor(t) % 60) / 60 * Math.PI * 2; ctx.strokeStyle = '#b3141c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(sa) * 98, -Math.cos(sa) * 98); ctx.stroke();
  ctx.restore();
  // bell
  ctx.save(); ctx.translate(440, 980);
  ctx.fillStyle = '#2a2a30'; ctx.fillRect(-30, -260, 60, 200);
  const bg = ctx.createRadialGradient(-60, -60, 20, 0, 0, 240); bg.addColorStop(0, '#ffe39a'); bg.addColorStop(0.5, '#c8952e'); bg.addColorStop(1, '#5a3a10');
  ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(0, 40, 220, Math.PI, 0); ctx.lineTo(220, 60); ctx.lineTo(-220, 60); ctx.closePath(); ctx.fill();
  const ha = ring ? Math.sin(t * 90) * 0.35 * ring : 0;
  ctx.save(); ctx.translate(0, 140); ctx.rotate(ha);
  ctx.strokeStyle = '#1a1a1e'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -60); ctx.stroke();
  ctx.fillStyle = '#1a1a1e'; ctx.beginPath(); ctx.arc(0, -70, 26, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  if (ring) { ctx.strokeStyle = `rgba(255,230,160,${0.4 * ring})`; ctx.lineWidth = 6; for (let r = 1; r <= 3; r++) { const rr = 240 + r * 40 + ((t * 300) % 40); ctx.beginPath(); ctx.arc(0, 40, rr, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); } }
  ctx.restore();
}
// the winch wheel that lowers/raises the barrier, your hand on the handle. rot = turns
function winch(ctx, t, o = {}) {
  ctx.fillStyle = '#10131a'; ctx.fillRect(-300, -300, 1680, 2520);
  if (o.bg) o.bg(ctx);
  ctx.save(); ctx.translate(540, 1000); ctx.rotate(o.rot || 0);
  ctx.strokeStyle = '#8a2a24'; ctx.lineWidth = 34; ctx.beginPath(); ctx.arc(0, 0, 330, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,220,200,0.35)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 342, -2.4, -1.2); ctx.stroke();
  ctx.strokeStyle = '#5a1a16'; ctx.lineWidth = 22; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 320, Math.sin(a) * 320); ctx.stroke(); }
  ctx.fillStyle = '#2a2a30'; ctx.beginPath(); ctx.arc(0, 0, 60, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c8b48a'; ctx.beginPath(); ctx.arc(300, 0, 34, 0, Math.PI * 2); ctx.fill();   // handle
  const hp = [300, 0];
  ctx.restore();
  const r = o.rot || 0, hx = 540 + Math.cos(r) * hp[0], hy = 1000 + Math.sin(r) * hp[0];
  Wd.myHand(ctx, hx + 20, hy + 60, 0.15 + Math.sin(r) * 0.2, 1.05, { curl: 0.75 });
}
// close on the upside-down face behind the barrier: mouth moving (talk 0..1), eyes on you
function faceClose(ctx, t, o = {}) {
  if (!o.bgClear) { ctx.fillStyle = '#05070c'; ctx.fillRect(-300, -300, 1680, 2520); }
  if (o.bg) o.bg(ctx);
  ctx.save(); ctx.translate(560, 820); ctx.rotate(Math.PI + Math.sin(t * 0.7) * 0.05 + (o.jerk || 0)); ctx.scale(o.s || 1, o.s || 1);
  // neck coming down from above (it hangs from the bent body)
  ctx.fillStyle = '#0c0d12'; ctx.fillRect(-120, 300, 240, 900);
  const sk = ctx.createLinearGradient(-300, 0, 300, 0); sk.addColorStop(0, '#121419'); sk.addColorStop(0.5, '#4d535b'); sk.addColorStop(1, '#8b97a3');
  ctx.fillStyle = sk; ctx.beginPath(); ctx.moveTo(-230, -200); ctx.bezierCurveTo(-280, 60, -190, 330, 0, 400); ctx.bezierCurveTo(190, 330, 280, 60, 230, -200); ctx.bezierCurveTo(150, -360, -150, -360, -230, -200); ctx.fill();
  // hollow cheeks + sunken eye sockets
  ctx.fillStyle = 'rgba(5,6,10,0.45)'; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * 150, 150, 60, 120, sx * 0.2, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(sx * 105, -40, 95, 62, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#08090c'; ctx.beginPath(); ctx.ellipse(0, -250, 290, 170, 0, Math.PI, 0); ctx.fill();   // hair (shows at the bottom)
  for (const sx of [-105, 105]) {
    ctx.fillStyle = '#e4ebef'; ctx.beginPath(); ctx.ellipse(sx, -40, 58, 30, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0a0a0c'; ctx.beginPath(); ctx.arc(sx + (o.look || 0) * 10, -40, 9, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(150,20,30,0.5)'; ctx.lineWidth = 2; for (let v = 0; v < 4; v++) { ctx.beginPath(); ctx.moveTo(sx + (v - 1.5) * 26, -66); ctx.lineTo(sx + (v - 1.5) * 18, -48); ctx.stroke(); }
  }
  ctx.strokeStyle = 'rgba(20,20,24,0.7)'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(10, 10); ctx.quadraticCurveTo(46, 100, 4, 128); ctx.stroke();
  const m = o.talk ? (0.3 + 0.7 * Math.abs(Math.sin(t * 11))) * o.talk : 0;
  ctx.fillStyle = '#120608'; ctx.beginPath(); ctx.ellipse(0, 230, 70, 8 + m * 50, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(220,214,190,0.8)'; for (let i = -3; i <= 3; i++) ctx.fillRect(i * 16 - 5, 230 - 8 - m * 40, 10, 12 + m * 6);
  ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const rg = ctx.createLinearGradient(760, 0, 960, 0); rg.addColorStop(0, 'rgba(200,230,255,0)'); rg.addColorStop(1, 'rgba(200,230,255,0.2)'); ctx.fillStyle = rg; ctx.fillRect(560, 300, 500, 1100); ctx.restore();
}

module.exports = { crossing, crawlerSide, crawlerFront, barrier, lantern, note, bellWall, winch, faceClose, prints, RAIL_Y, GATE, SIGNAL, FLOOD, COL };
