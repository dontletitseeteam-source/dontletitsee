// FLOOR 0 — drawing primitives (2D minimalist horror, 1080x1920)
const { GlobalFonts } = require('@napi-rs/canvas');
const path = require('path');

const FD = path.join(__dirname, '..', 'fonts');
const reg = (f, a) => GlobalFonts.registerFromPath(path.join(FD, f), a);
reg('montserrat-latin-900-normal.ttf', 'Mont900');
reg('montserrat-latin-800-normal.ttf', 'Mont800');
reg('inter-latin-400-normal.ttf', 'Inter400');
reg('inter-latin-500-normal.ttf', 'Inter500');
reg('inter-latin-600-normal.ttf', 'Inter600');
reg('inter-latin-700-normal.ttf', 'Inter700');
reg('jetbrains-mono-latin-500-normal.ttf', 'Mono500');
reg('jetbrains-mono-latin-700-normal.ttf', 'Mono700');
reg('oswald-latin-700-normal.ttf', 'Osw700');
reg('oswald-latin-600-normal.ttf', 'Osw600');

const W = 1080, H = 1920;
const C = {
  ink: '#04060b', navy0: '#070a14', navy1: '#0b1022', navy2: '#111832', wall: '#131a35', wall2: '#172045',
  steel: '#2a3253', steel2: '#3a4469', steelD: '#1b2140', white: '#eef1f7', red: '#ff3347', led: '#ff2e2e',
  lime: '#c6ff3a', blue: '#a9c8ff', gray: '#8a93ab', gray2: '#5d6680',
};

// ---------- math ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const inv = (a, b, x) => clamp((x - a) / (b - a));
const E = {
  inOut: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  out: t => 1 - Math.pow(1 - t, 3),
  in: t => t * t * t,
  outBack: t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  outExpo: t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  sine: t => 0.5 - 0.5 * Math.cos(Math.PI * t),
};
function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function noise1(x) { const i = Math.floor(x), f = x - i; const u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u); }
// fluorescent flicker: mostly steady, occasional dips
function flicker(t, seed = 0, rate = 0.07) {
  const base = 0.93 + 0.07 * noise1(t * 9 + seed);
  const k = Math.floor(t * 14 + seed * 7);
  const dip = hash(k * 1.37 + seed * 91.1) < rate ? 0.25 + 0.35 * hash(k * 3.1 + seed) : 1;
  return base * dip;
}
function shake(t, t0, amp, dur = 0.35, freq = 38) {
  if (t < t0 || t > t0 + dur) return [0, 0];
  const k = 1 - (t - t0) / dur;
  const a = amp * k * k;
  return [a * (noise1(t * freq) - 0.5) * 2, a * (noise1(t * freq + 77) - 0.5) * 2];
}

// ---------- shapes ----------
function rrect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function glow(ctx, x, y, r, color, a = 1, comp = 'lighter') {
  ctx.save();
  ctx.globalCompositeOperation = comp;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color.replace('A', a.toFixed(3)));
  g.addColorStop(0.35, color.replace('A', (a * 0.45).toFixed(3)));
  g.addColorStop(1, color.replace('A', '0'));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
}
function spaced(ctx, s, x, y, sp, align = 'left') {
  let w = 0; for (const ch of s) w += ctx.measureText(ch).width + sp; w -= sp;
  let cx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  const old = ctx.textAlign; ctx.textAlign = 'left';
  for (const ch of s) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + sp; }
  ctx.textAlign = old;
  return w;
}

// ---------- dot-matrix display ----------
const GLYPH = {
  '0': ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  '1': ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  '2': ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  '3': ['#####', '...#.', '..#..', '...#.', '....#', '#...#', '.###.'],
  '4': ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  '5': ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  '6': ['..##.', '.#...', '#....', '####.', '#...#', '#...#', '.###.'],
  '7': ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
  '8': ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  '9': ['.###.', '#...#', '#...#', '.####', '....#', '...#.', '.##..'],
  'L': ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  'U': ['..#..', '.###.', '#.#.#', '..#..', '..#..', '..#..', '..#..'],
  'D': ['..#..', '..#..', '..#..', '..#..', '#.#.#', '.###.', '..#..'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
};
// draws the floor indicator: arrow glyph + one character. (cx,cy) center, p = dot pitch
function drawIndicator(ctx, cx, cy, p, st) {
  const { ch = ' ', arrow = ' ', on = 1, color = [255, 46, 46], arrowBlink = 1 } = st;
  const cols = 5 + 2 + 5, rows = 7;
  const bw = cols * p + p * 2.6, bh = rows * p + p * 2.6;
  // housing
  ctx.save();
  rrect(ctx, cx - bw / 2 - p * 0.6, cy - bh / 2 - p * 0.6, bw + p * 1.2, bh + p * 1.2, p * 1.2);
  ctx.fillStyle = C.steel; ctx.fill();
  rrect(ctx, cx - bw / 2, cy - bh / 2, bw, bh, p * 0.8);
  ctx.fillStyle = '#030305'; ctx.fill();
  const ox = cx - (cols * p) / 2 + p / 2, oy = cy - (rows * p) / 2 + p / 2;
  const [r, g, b] = color;
  const drawGlyph = (gl, col0, alpha) => {
    for (let y = 0; y < 7; y++) for (let x = 0; x < 5; x++) {
      const lit = gl[y][x] === '#';
      ctx.beginPath();
      ctx.arc(ox + (col0 + x) * p, oy + y * p, p * 0.36, 0, Math.PI * 2);
      if (lit && alpha > 0) { ctx.fillStyle = `rgba(${r},${g},${b},${(0.25 + 0.75 * alpha).toFixed(3)})`; }
      else ctx.fillStyle = `rgba(${r >> 2},${g >> 3},${b >> 3},0.22)`;
      ctx.fill();
    }
  };
  drawGlyph(GLYPH[arrow] || GLYPH[' '], 0, on * arrowBlink);
  drawGlyph(GLYPH[ch] || GLYPH[' '], 7, on);
  ctx.restore();
  if (on > 0 && ch !== ' ') glow(ctx, cx + p * 3.5, cy, p * 9, `rgba(${r},${g},${b},A)`, 0.32 * on);
}

// ---------- stick figure (our character) ----------
// o: {x, y (ground), s, view:'back'|'front', headDX, headDY, arm:'down'|'phone'|'raise'|'shield', lit, fill, color,
//     walk (phase rad), stretch (0..1), grin (0..1), headSX (turn squash), rim, bust (head+shoulders only)}
function drawStick(ctx, o) {
  const s = o.s || 1;
  ctx.save();
  ctx.translate(o.x, o.y);
  ctx.scale(s, s);
  const lw = 8.5;
  const col = o.color || C.white;
  const st = o.stretch || 0;
  const legL = 150 * (1 + 0.55 * st), torso = 142 * (1 + 0.4 * st), neckL = 46 * (1 + 1.6 * st), armK = 1 + 0.75 * st;
  const hipY = -legL, neckY = hipY - torso, shY = neckY + 12;
  if (o.arm === 'phone' && o.lit > 0) glow(ctx, 0, shY + 34, 260, 'rgba(150,190,255,A)', 0.28 * o.lit);
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  if (!o.bust) {
    const ph = o.walk;
    let fl = -30, fr = 30, ll = 0, lr = 0;
    if (ph !== undefined) { fl = -10 + 30 * Math.sin(ph); fr = 10 - 30 * Math.sin(ph); ll = Math.max(0, -Math.cos(ph)) * 14; lr = Math.max(0, Math.cos(ph)) * 14; }
    ctx.moveTo(fl, -ll); ctx.lineTo(0, hipY); ctx.lineTo(fr, -lr);
  }
  ctx.moveTo(0, o.bust ? shY + 60 : hipY); ctx.lineTo(0, neckY);
  const sw = o.walk !== undefined ? Math.sin(o.walk) * 18 : 0;
  const armDown = (side) => { ctx.moveTo(0, shY); ctx.lineTo(side * 30 - (side < 0 ? sw : -sw) * 0.5, shY + 62 * armK); ctx.lineTo(side * 40 - (side < 0 ? sw : -sw), shY + 128 * armK); };
  if (o.arm === 'phone') { armDown(-1); ctx.moveTo(0, shY); ctx.lineTo(26, shY + 65); ctx.lineTo(o.view === 'back' ? -2 : 6, shY + 34); }
  else if (o.arm === 'raise') { armDown(-1); ctx.moveTo(0, shY); ctx.lineTo(44, shY - 20); ctx.lineTo(30, shY - 92); }
  else if (o.arm === 'shield') { ctx.moveTo(0, shY); ctx.lineTo(-40, shY - 10); ctx.lineTo(-14, shY - 70); ctx.moveTo(0, shY); ctx.lineTo(40, shY - 10); ctx.lineTo(14, shY - 70); }
  else { armDown(-1); armDown(1); }
  ctx.stroke();
  if (o.arm === 'phone' && o.view !== 'back') {
    ctx.save(); ctx.translate(8, shY + 24); ctx.rotate(-0.15);
    rrect(ctx, -13, -22, 26, 44, 5); ctx.fillStyle = '#0a0c12'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = col; ctx.stroke();
    ctx.restore();
  }
  const hx = (o.headDX || 0), hy = neckY - neckL + (o.headDY || 0);
  const hsx = o.headSX ?? 1;
  ctx.save(); ctx.translate(hx, hy); ctx.scale(hsx, 1);
  ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI * 2);
  ctx.fillStyle = o.fill || C.navy1; ctx.fill();
  ctx.lineWidth = lw / Math.max(0.2, hsx); ctx.stroke();
  if (o.grin > 0) {
    const g = o.grin, w = lerp(10, 64, E.out(clamp(g * 1.4))), dip = lerp(4, 22, g);
    ctx.lineWidth = 4.5; ctx.strokeStyle = col; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.moveTo(-w, 6); ctx.quadraticCurveTo(0, 6 + dip * 2.2, w, 6);
    ctx.quadraticCurveTo(0, 6 + dip * 0.9, -w, 6); ctx.closePath(); ctx.fill(); ctx.stroke();
    const teeth = Math.floor(lerp(0, 13, clamp(g * 1.3)));
    ctx.lineWidth = 2.2;
    for (let i = 1; i < teeth; i++) {
      const u = i / teeth, x = lerp(-w, w, u), k = 4 * u * (1 - u);
      const yTop = 6 + dip * 0.9 * k * 0.95, yBot = 6 + dip * 2.2 * k * 0.95;
      ctx.beginPath(); ctx.moveTo(x, yTop + 1); ctx.lineTo(x, yTop + (yBot - yTop) * 0.55); ctx.stroke();
    }
  }
  ctx.restore();
  if (o.rim > 0) {
    ctx.save(); ctx.globalAlpha = o.rim; ctx.strokeStyle = '#dfe8ff'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(hx, hy, 46, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); ctx.restore();
  }
  ctx.restore();
}

// ---------- the entity ----------
// back view standing (facing wall), or front view with phone raised (flash frame)
function entityParts(t, mode) {
  const j = (i, a = 3) => (noise1(t * 2.3 + i * 13.7) - 0.5) * a; // edge distortion
  const parts = [];
  // legs
  parts.push([[-30, 0], [-12, 0], [-14 + j(1), -340], [-36 + j(2), -340]]);
  parts.push([[12, 0], [30, 0], [36 + j(3), -340], [14 + j(4), -340]]);
  // torso (narrow, slightly hunched)
  parts.push([[-38 + j(5), -330], [38 + j(6), -330], [50 + j(7), -598], [8, -628], [-50 + j(8), -598]]);
  // neck bending forward/sideways
  parts.push([[-12, -600], [12, -604], [24 + j(9), -662], [2 + j(10), -664]]);
  // left arm: hangs far below the knees
  parts.push([[-50, -596], [-38, -590], [-50 + j(11, 4), -380], [-62 + j(12, 4), -210], [-74 + j(13, 4), -212], [-64 + j(14, 4), -384]]);
  if (mode === 'raise') {
    // right arm raised, hand at face
    parts.push([[38, -590], [52, -598], [96 + j(15), -520], [44 + j(16), -690], [28, -684], [78 + j(17), -528]]);
  } else {
    parts.push([[38, -590], [50, -596], [64 + j(15, 4), -384], [74 + j(16, 4), -212], [62 + j(17, 4), -210], [50 + j(18, 4), -380]]);
  }
  return parts;
}
function drawEntity(ctx, x, y, s, st) {
  const { t = 0, mode = 'back', col = '#0c0f1c', rim = 0.0, tilt = 0.2, phone = 0, flash = 0 } = st;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const parts = entityParts(t, mode);
  ctx.fillStyle = col;
  for (const p of parts) { ctx.beginPath(); p.forEach(([a, b], i) => (i ? ctx.lineTo(a, b) : ctx.moveTo(a, b))); ctx.closePath(); ctx.fill(); }
  // fingers
  ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineWidth = 5;
  const fingers = (hx, hy, dir) => {
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(hx + (i - 1.5) * 4, hy);
      ctx.quadraticCurveTo(hx + (i - 1.5) * 6 + dir * 4, hy + 40, hx + (i - 1.5) * 5 + dir * 8, hy + 66 + (i === 1 || i === 2 ? 10 : 0));
      ctx.stroke();
    }
  };
  fingers(-68, -212, -1);
  if (mode !== 'raise') fingers(68, -212, 1);
  // head (tilted, too small)
  ctx.save(); ctx.translate(16, -704); ctx.rotate(tilt);
  ctx.beginPath(); ctx.ellipse(0, 0, 40, 54, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // rim light (left edge catches lobby light)
  if (rim > 0) {
    ctx.save(); ctx.globalAlpha = rim; ctx.strokeStyle = '#4a5784'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-50, -596); ctx.lineTo(-64, -384); ctx.lineTo(-74, -212); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-36, -340); ctx.lineTo(-30, -2); ctx.stroke();
    ctx.save(); ctx.translate(16, -704); ctx.rotate(tilt); ctx.beginPath(); ctx.ellipse(0, 0, 40, 54, 0, Math.PI * 0.75, Math.PI * 1.45); ctx.stroke(); ctx.restore();
    ctx.restore();
  }
  // phone in its right hand (back view: hand low at its side)
  if (phone > 0 && mode !== 'raise') {
    const px = 70, py = -238;
    glow(ctx, px + 10, py, 110, 'rgba(210,228,255,A)', 0.55 * phone);
    ctx.save(); ctx.translate(px, py); ctx.rotate(-0.2);
    rrect(ctx, -14, -26, 28, 52, 6); ctx.fillStyle = `rgba(220,234,255,${phone})`; ctx.fill();
    ctx.restore();
    // lit fingers wrapped around it
    ctx.save(); ctx.globalAlpha = phone * 0.85; ctx.strokeStyle = '#6f84c0'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(px - 10, py - 18 + i * 13); ctx.quadraticCurveTo(px + 6, py - 26 + i * 13, px + 18, py - 12 + i * 13); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(52, -330); ctx.lineTo(px - 6, py - 20); ctx.stroke();
    ctx.restore();
  }
  if (mode === 'raise') {
    // phone held in front of its face; the flash
    ctx.save(); ctx.translate(30, -700); ctx.rotate(-0.08);
    rrect(ctx, -34, -60, 68, 120, 10); ctx.fillStyle = '#000'; ctx.fill();
    ctx.restore();
    if (flash > 0) {
      glow(ctx, 20, -742, 520, 'rgba(255,255,255,A)', flash);
      ctx.save(); ctx.globalAlpha = flash; ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(20, -742, 9, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = '#fff';
      for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4 + 0.3; ctx.beginPath(); ctx.moveTo(20 - Math.cos(a) * 80, -742 - Math.sin(a) * 80); ctx.lineTo(20 + Math.cos(a) * 80, -742 + Math.sin(a) * 80); ctx.stroke(); }
      ctx.restore();
    }
  }
  ctx.restore();
}

// ---------- HUD ----------
function drawHUD(ctx, h) {
  const x = 64, y = 168;
  ctx.save();
  const bg = ctx.createRadialGradient(150, 250, 40, 150, 250, 420);
  bg.addColorStop(0, 'rgba(2,3,8,0.62)'); bg.addColorStop(1, 'rgba(2,3,8,0)');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 600, 700);
  ctx.textBaseline = 'alphabetic';
  // red dot + series tag
  const blink = 0.55 + 0.45 * Math.round(0.5 + 0.5 * Math.sin(h.t * Math.PI * 1.6));
  ctx.fillStyle = `rgba(255,51,71,${blink})`;
  ctx.beginPath(); ctx.arc(x + 7, y - 9, 7, 0, Math.PI * 2); ctx.fill();
  ctx.font = '24px Mono700'; ctx.fillStyle = C.red;
  spaced(ctx, h.part || 'PART 1', x + 24, y, 2.5);
  // time
  ctx.font = '86px Osw700'; ctx.fillStyle = C.white;
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 18;
  const tw = ctx.measureText(h.time).width;
  ctx.fillText(h.time, x - 2, y + 92);
  ctx.font = '30px Osw600'; ctx.fillText(h.ampm || 'AM', x + tw + 8, y + 92);
  ctx.shadowBlur = 0;
  // rule
  ctx.fillStyle = 'rgba(238,241,247,0.22)'; ctx.fillRect(x, y + 112, 290, 2);
  ctx.font = '22px Mono500';
  const row = (label, val, yy, vcol) => {
    ctx.fillStyle = 'rgba(238,241,247,0.62)'; spaced(ctx, label, x, yy, 2.2);
    ctx.fillStyle = vcol || 'rgba(238,241,247,0.92)'; ctx.font = '22px Mono700';
    let vx = x + (h.labelW || 158);
    if (val[0] === '▲' || val[0] === '▼') {
      const up = val[0] === '▲';
      ctx.beginPath();
      if (up) { ctx.moveTo(vx, yy); ctx.lineTo(vx + 16, yy); ctx.lineTo(vx + 8, yy - 15); }
      else { ctx.moveTo(vx, yy - 15); ctx.lineTo(vx + 16, yy - 15); ctx.lineTo(vx + 8, yy); }
      ctx.closePath(); ctx.fill();
      vx += 26; val = val.slice(2);
    }
    spaced(ctx, val, vx, yy, 2.2); ctx.font = '22px Mono500';
  };
  if (h.rows) h.rows.forEach(([lab, val, col], i) => row(lab, val, y + 146 + i * 32, col));
  else {
    row('BATTERY', h.battery, y + 146);
    row('ELEVATOR', h.elevator, y + 178, h.elevatorCol);
    row('LOCATION', h.location, y + 210, h.locationCol);
  }
  ctx.restore();
}

// ---------- captions ----------
function parseMarkup(s) {
  // returns [{w, col}]
  const out = []; let col = C.white;
  const toks = s.match(/\[|\]|\{|\}|[^\s\[\]\{\}]+|\s+/g) || [];
  let cur = null;
  for (const tk of toks) {
    if (tk === '[') { col = C.lime; continue; }
    if (tk === '{') { col = C.red; continue; }
    if (tk === ']' || tk === '}') { col = C.white; continue; }
    if (/^\s+$/.test(tk)) { cur = null; continue; }
    if (cur && cur.col === col) cur.w += tk; else if (cur) { cur = { w: tk, col, join: true }; out.push(cur); } else { cur = { w: tk, col }; out.push(cur); }
  }
  return out;
}
function drawCaption(ctx, text, lt, opt = {}) {
  const cy = opt.y || 1480, size = opt.size || 92, maxW = 930;
  const words = parseMarkup(text);
  ctx.save();
  ctx.font = `${size}px Mont900`;
  const space = size * 0.26;
  // layout lines
  const lines = []; let line = [], lw = 0;
  for (const w of words) {
    const ww = ctx.measureText(w.w).width;
    const add = (line.length && !w.join ? space : 0) + ww;
    if (line.length && lw + add > maxW && !w.join) { lines.push({ line, lw }); line = []; lw = 0; }
    line.push({ ...w, ww }); lw += (line.length > 1 && !w.join ? space : 0) + ww;
  }
  if (line.length) lines.push({ line, lw });
  const lh = size * 1.08;
  const a = E.outBack(clamp(lt / 0.16));
  const sc = lerp(1.22, 1, a);
  const alpha = clamp(lt / 0.05);
  ctx.translate(540, cy); ctx.scale(sc, sc);
  ctx.globalAlpha = alpha;
  ctx.textBaseline = 'middle';
  const y0 = -((lines.length - 1) * lh) / 2;
  lines.forEach(({ line, lw }, li) => {
    let x = -lw / 2; const y = y0 + li * lh;
    line.forEach((w, i) => {
      if (i && !w.join) x += space;
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(0,0,0,0.75)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 4;
      ctx.lineWidth = 12; ctx.strokeStyle = 'rgba(2,3,8,0.55)'; ctx.strokeText(w.w, x, y);
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.fillStyle = w.col; ctx.fillText(w.w, x, y);
      x += w.ww;
    });
  });
  ctx.restore();
}

function camera(ctx, cx, cy, z, sx = 0, sy = 0, rot = 0) {
  ctx.translate(540 + sx, 960 + sy);
  if (rot) ctx.rotate(rot);
  ctx.scale(z, z);
  ctx.translate(-cx, -cy);
}

function vignette(ctx, strength = 0.6) {
  const g = ctx.createRadialGradient(540, 900, 380, 540, 960, 1250);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

module.exports = { W, H, C, clamp, lerp, inv, E, hash, noise1, flicker, shake, rrect, glow, spaced, drawIndicator, drawStick, drawEntity, drawHUD, drawCaption, vignette, parseMarkup, camera };
