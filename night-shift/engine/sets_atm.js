// NIGHT SHIFT Season 2 Ep 2 — the ATM booth (v4 look). Palette: hard cold-white tube light inside a glass booth (ice cyan),
// a cobalt sign band, one sodium streetlight (amber) over a wet black road, teal-black night, threat red.
// World = 1080x1920 frame from the road, looking at the booth front: glass x 230..900, floor y 1290, ceiling y 590.
// Inside: the ATM on the back wall (x 590..770), the long security mirror above it, a CCTV monitor top-left.
const D = require('./draw');
const L = require('./look4');
const Wd = require('./sets_wedding');
const { clamp, lerp, E, hash, noise1 } = D;
const { mix, rgba, dust, beam } = L;

const FLOOR = 1290, CEIL = 590;
const BOOTH = { x0: 230, x1: 900 };
const ATM = { x0: 600, x1: 770, top: 900 };
const MIRROR = { x0: 560, x1: 820, y0: 790, y1: 860 };
const COL = { body: '#06080b', rim: '#dff6ff', tube: '#eefaff', wall: '#d5e6ee', sign: '#1d47c8', amber: '#ff9a3c', red: '#ff3d34', mint: '#7fe8d0' };

function limb(ctx, pts, w0, w1, col) {
  ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let i = 0; i < pts.length - 1; i++) {
    ctx.lineWidth = lerp(w0, w1, i / Math.max(1, pts.length - 2));
    ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[i + 1][0], pts[i + 1][1]); ctx.stroke();
  }
}

// ------------------------------------------------------------------ HER, bent fully backwards (side view)
// feet at (x,y), she faces -x (away from the machine); her body arches back over +x and her head hangs at her heels,
// upside down, face to camera; her arms climb back up the machine front to the keypad. s = px per unit (hips at -100).
function arch(ctx, x, y, s, t, o = {}) {
  const dir = o.dir ?? 1, rim = o.rim || COL.rim, lt = o.light ?? 1, jerk = o.jerk || 0;
  const br = Math.sin(t * 1.3) * 1.2;                    // slow breathing of the arch
  const ty = o.type ?? 1;                                // typing: fingers twitch
  const tap = (k) => ty ? Math.max(0, Math.sin(t * 9 + k * 2.1)) * 3 : 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  const hip = [8, -100 + br * 0.3], top = [40, -150 + br], sh = [70, -46 + br * 0.5], head = [56 + jerk * 3, -13];
  const draw = (c, cf) => {
    // far leg + far arm
    limb(ctx, [[2, -98], [0, -50], [-4, -2]], 9, 6, cf);
    limb(ctx, [[sh[0] + 2, sh[1] - 2], [96, -64], [84 + tap(1), -84]], 5.5, 4, cf);
    // skirt over the near leg (a long dark kameez), legs
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-6, -104); ctx.quadraticCurveTo(-14, -60, -16, -24); ctx.lineTo(16, -24); ctx.quadraticCurveTo(20, -64, 22, -104); ctx.closePath(); ctx.fill();
    limb(ctx, [[8, -40], [6, -14], [4, -2]], 9, 6.5, c);
    ctx.beginPath(); ctx.ellipse(-2, -2, 9, 3.2, 0, 0, Math.PI * 2); ctx.fill();
    // the arch: hips -> up and back -> down to the shoulders near the floor
    ctx.beginPath(); ctx.moveTo(hip[0] - 12, hip[1] + 6);
    ctx.bezierCurveTo(10, -168, 74, -170, sh[0] + 10, sh[1] + 2);
    ctx.lineTo(sh[0] - 8, sh[1] + 4);
    ctx.bezierCurveTo(60, -140, 22, -138, hip[0] + 12, hip[1] + 10); ctx.closePath(); ctx.fill();
    // neck + upside-down head
    ctx.strokeStyle = c; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(sh[0], sh[1]); ctx.quadraticCurveTo(sh[0] - 2, -26, head[0], head[1] - 9); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(head[0], head[1], 9, 11, 0.15 + jerk, 0, Math.PI * 2); ctx.fill();
    // hair: falls from the crown (now at the bottom) and pools on the floor
    ctx.beginPath(); ctx.moveTo(head[0] - 9, head[1] + 2); ctx.quadraticCurveTo(head[0] - 14, -2, head[0] - 26, 0); ctx.lineTo(head[0] + 24, 0); ctx.quadraticCurveTo(head[0] + 12, -2, head[0] + 9, head[1] + 2); ctx.closePath(); ctx.fill();
    // near arm up the machine
    limb(ctx, [[sh[0] - 2, sh[1]], [90, -60], [76 + tap(0), -80]], 6, 4.5, c);
    for (let f = 0; f < 3; f++) { ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(76 + tap(0), -80); ctx.lineTo(72 + f * 3 + tap(0), -89 - (f === 1 ? 2 : 0) + tap(f) * 0.6); ctx.stroke(); }
  };
  ctx.save(); ctx.translate(-1.6, -1.2); draw(rgba(rim, 0.85 * lt), rgba(rim, 0.4 * lt)); ctx.restore();
  draw(COL.body, '#030405');
  // the upside-down face: eyes LOW, mouth above them
  const ea = o.eyes ?? 1;
  if (ea > 0) {
    ctx.save(); ctx.translate(head[0], head[1]); ctx.rotate(Math.PI + 0.15 + jerk); ctx.scale(dir, 1);
    ctx.fillStyle = rgba('#c9d2d8', 0.2 * ea); ctx.beginPath(); ctx.ellipse(0, 1, 7, 9, 0, 0, Math.PI * 2); ctx.fill();
    for (const sx of [-3.2, 3.2]) { ctx.fillStyle = rgba('#f6fbff', 0.95 * ea); ctx.beginPath(); ctx.ellipse(sx, -2.5, 1.8, 1.4, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = rgba('#000', 0.8 * ea); ctx.beginPath(); ctx.ellipse(0, 5, 3, 1 + (o.mouth || 0) * 2.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
  if (ea > 0) D.glow(ctx, x + head[0] * s * dir, y + head[1] * s, 9 * s, 'rgba(225,245,255,A)', 0.16 * ea);
}

// ------------------------------------------------------------------ HER, standing straight (the mirror / CCTV / the end)
// very tall, neck bent under the ceiling, hair hanging over the face, one pale eye. feet at (x,y), h = px height.
function tall(ctx, x, y, h, t, o = {}) {
  const u = h / 100, rim = o.rim || COL.rim, lt = o.light ?? 1, sway = Math.sin(t * 0.8) * 0.6;
  ctx.save(); ctx.translate(x, y); ctx.scale(u, u);
  const tilt = o.tilt ?? 0.35;
  const draw = (c) => {
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.moveTo(-9, -80); ctx.quadraticCurveTo(-13, -40, -15, -2); ctx.lineTo(15, -2); ctx.quadraticCurveTo(13, -40, 9, -80); ctx.closePath(); ctx.fill();   // long kameez
    ctx.fillRect(-3, -2, 2.6, 2); ctx.fillRect(1, -2, 2.6, 2);
    ctx.beginPath(); ctx.moveTo(-10, -80); ctx.quadraticCurveTo(0, -84, 10, -80); ctx.lineTo(8, -64); ctx.lineTo(-8, -64); ctx.closePath(); ctx.fill();
    // arms hanging too long (hands past the knees)
    for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * 9, -79); ctx.lineTo(sd * 12.5 + sway * sd * 0.3, -22); ctx.lineTo(sd * 10.5 + sway * sd * 0.3, -21); ctx.lineTo(sd * 7, -76); ctx.closePath(); ctx.fill(); }
    // neck bent forward/sideways, head
    ctx.save(); ctx.translate(0, -84); ctx.rotate(tilt + sway * 0.02);
    ctx.fillRect(-2, -6, 4, 7);
    ctx.beginPath(); ctx.ellipse(0, -12, 5.6, 7, 0, 0, Math.PI * 2); ctx.fill();
    // hair: a curtain over the face, down to the chest
    ctx.beginPath(); ctx.moveTo(-6.5, -16); ctx.quadraticCurveTo(-8, 4, -7, 14); ctx.lineTo(7, 14); ctx.quadraticCurveTo(8, 4, 6.5, -16); ctx.quadraticCurveTo(0, -22, -6.5, -16); ctx.fill();
    ctx.restore();
  };
  ctx.save(); ctx.translate(-0.5, -0.3); draw(rgba(rim, 0.7 * lt)); ctx.restore();
  draw(o.col || COL.body);
  const ea = o.eyes ?? 1;
  if (ea > 0) {
    ctx.save(); ctx.translate(0, -84); ctx.rotate(tilt);
    ctx.fillStyle = rgba('#c9d2d8', 0.35 * ea); ctx.fillRect(-1.2, -14, 2.4, 9);                  // a strip of face between the hair
    ctx.fillStyle = rgba('#f6fbff', ea); ctx.beginPath(); ctx.ellipse(0.2, -11, 0.9, 0.7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

// ------------------------------------------------------------------ the guard ("you") and the man
function guard(ctx, x, y, h, o = {}) {
  Wd.person(ctx, x, y, h, { col: '#0d1016', rim: o.rim || COL.rim, rimSide: o.rimSide ?? -1, view: o.view || 'front', fear: o.fear || 0, look: o.look || 0, walk: o.walk ?? null, armL: o.armL, armR: o.armR, eyes: o.eyes });
  // peaked cap
  const u = h / 100; ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#0a0c12'; ctx.beginPath(); ctx.ellipse(0, -97 * u, 7 * u, 3.2 * u, 0, Math.PI, 0); ctx.fill();
  ctx.fillRect(-7 * u, -97.5 * u, 14 * u, 2 * u); ctx.fillStyle = rgba(o.rim || COL.rim, 0.5); ctx.fillRect(-7 * u, -96 * u, 14 * u, 0.7 * u);
  ctx.restore();
}

// ------------------------------------------------------------------ the booth
function signBand(ctx, lt, t) {
  ctx.fillStyle = mix(COL.sign, '#0c1430', 1 - lt); ctx.fillRect(BOOTH.x0 - 30, 470, BOOTH.x1 - BOOTH.x0 + 60, 120);
  ctx.fillStyle = rgba('#ffffff', 0.12 * lt); ctx.fillRect(BOOTH.x0 - 30, 470, BOOTH.x1 - BOOTH.x0 + 60, 10);
  ctx.save(); ctx.font = '74px Serif4'; ctx.textAlign = 'center'; ctx.fillStyle = mix('#ffffff', '#5a6890', 1 - lt);
  ctx.fillText('ATM', 470, 555); ctx.font = '40px Serif4i'; ctx.fillText('open 24 hours', 720, 548); ctx.restore();
  if (lt > 0.1) D.glow(ctx, 565, 530, 380, 'rgba(70,120,255,A)', 0.35 * lt);
}
function machine(ctx, lt, t, o = {}) {
  const { x0, x1, top } = ATM, w = x1 - x0;
  ctx.fillStyle = mix('#8f9aa3', '#2a3038', 1 - lt); D.rrect(ctx, x0, top, w, FLOOR - top, 10); ctx.fill();
  ctx.fillStyle = mix('#5c6770', '#1a1e24', 1 - lt); ctx.fillRect(x0 + 10, top + 140, w - 20, 120);
  // screen
  const sc = o.screen || 'ENTER PIN';
  ctx.fillStyle = '#0e2a3a'; ctx.fillRect(x0 + 22, top + 28, w - 44, 86);
  ctx.fillStyle = rgba('#7fe8ff', 0.9); ctx.font = '20px Serif4'; ctx.textAlign = 'center'; ctx.fillText(sc, (x0 + x1) / 2, top + 78);
  D.glow(ctx, (x0 + x1) / 2, top + 70, 90, 'rgba(110,220,255,A)', 0.35);
  // keypad
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { ctx.fillStyle = '#c9d1d6'; ctx.fillRect(x0 + 44 + c * 30, top + 160 + r * 22, 22, 15); }
  ctx.fillStyle = '#141820'; ctx.fillRect(x0 + 30, top + 290, w - 60, 12);           // cash slot
  ctx.fillStyle = '#1a2a1a'; ctx.fillRect(x1 - 40, top + 170, 18, 40);                // card slot
  ctx.fillStyle = '#4cff8a'; ctx.fillRect(x1 - 36, top + 176, 10, 3);
}
function mirror(ctx, lt, t, o = {}) {
  const { x0, x1, y0, y1 } = MIRROR;
  ctx.fillStyle = '#1a242c'; ctx.fillRect(x0 - 8, y0 - 8, x1 - x0 + 16, y1 - y0 + 16);
  const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, '#5e7484'); g.addColorStop(0.5, '#2c3c48'); g.addColorStop(1, '#6e8696');
  ctx.fillStyle = g; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  // reflection hint: a dark tall shape in the mirror when o.ghost
  if (o.ghost) { ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip(); tall(ctx, 650, y1 + 120, 210, t, { tilt: 0.3, light: 0.4, eyes: o.ghost }); ctx.restore(); }
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.moveTo(x0 + 20, y0); ctx.lineTo(x0 + 60, y0); ctx.lineTo(x0 + 30, y1); ctx.lineTo(x0 - 10, y1); ctx.closePath(); ctx.fill();
}
function monitorSmall(ctx, lt, t) {
  ctx.fillStyle = '#15181c'; ctx.fillRect(262, 632, 140, 98);
  ctx.fillStyle = '#2b3a33'; ctx.fillRect(270, 640, 124, 80);
  ctx.fillStyle = 'rgba(180,230,200,0.5)'; ctx.fillRect(280, 700, 30, 3); ctx.fillRect(330, 660, 8, 50);
  D.glow(ctx, 332, 680, 70, 'rgba(150,230,190,A)', 0.25 * lt);
}
function booth(ctx, t, o = {}) {
  const lt = o.light ?? 1;
  // night sky + far city
  const sk = ctx.createLinearGradient(0, -300, 0, 1300); sk.addColorStop(0, '#02080c'); sk.addColorStop(1, '#0c2228');
  ctx.fillStyle = sk; ctx.fillRect(-400, -400, 1880, 1800);
  for (let i = 0; i < 14; i++) { const bx = -300 + i * 140 + hash(i) * 50, bh = 180 + hash(i * 3.3) * 380; ctx.fillStyle = '#040c10'; ctx.fillRect(bx, 1250 - bh, 120, bh); for (let k = 0; k < 6; k++) if (hash(i * 9 + k) > 0.7) { ctx.fillStyle = 'rgba(255,190,110,0.5)'; ctx.fillRect(bx + 20 + (k % 3) * 30, 1250 - bh + 30 + Math.floor(k / 3) * 50, 10, 14); } }
  // wet road + pavement
  const gr = ctx.createLinearGradient(0, 1290, 0, 2300); gr.addColorStop(0, '#11181c'); gr.addColorStop(1, '#050708');
  ctx.fillStyle = gr; ctx.fillRect(-400, 1290, 1880, 1100);
  ctx.fillStyle = '#1b2226'; ctx.fillRect(-400, 1290, 1880, 70);
  // sodium streetlight, left
  ctx.fillStyle = '#0d1114'; ctx.fillRect(66, 380, 14, 960); ctx.fillRect(66, 380, 120, 10);
  ctx.fillStyle = '#ffcf8a'; ctx.fillRect(150, 388, 48, 10);
  if (lt > 0.05) { beam(ctx, 174, 396, 0.06, 980, 50, 520, COL.amber, 0.16); D.glow(ctx, 174, 394, 120, 'rgba(255,160,70,A)', 0.7); }
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const sp = ctx.createRadialGradient(170, 1400, 30, 170, 1400, 420); sp.addColorStop(0, 'rgba(255,150,60,0.22)'); sp.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = sp; ctx.fillRect(-300, 1000, 900, 800); ctx.restore();
  // booth box
  ctx.fillStyle = '#0d1418'; ctx.fillRect(BOOTH.x0 - 30, 460, BOOTH.x1 - BOOTH.x0 + 60, FLOOR - 460 + 14);
  // interior back wall + floor
  ctx.fillStyle = mix(COL.wall, '#18222a', 1 - lt); ctx.fillRect(BOOTH.x0, CEIL, BOOTH.x1 - BOOTH.x0, FLOOR - CEIL);
  ctx.fillStyle = mix('#a9b8be', '#141c20', 1 - lt); ctx.fillRect(BOOTH.x0, FLOOR - 70, BOOTH.x1 - BOOTH.x0, 70);
  for (let i = 0; i < 8; i++) { ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.fillRect(BOOTH.x0 + i * 84, FLOOR - 70, 2, 70); }
  // tubes
  for (const tx of [330, 600]) { ctx.fillStyle = lt > 0.1 ? COL.tube : '#3a4448'; ctx.fillRect(tx, CEIL + 8, 200, 10); if (lt > 0.1) D.glow(ctx, tx + 100, CEIL + 14, 260, 'rgba(225,248,255,A)', 0.4 * lt); }
  monitorSmall(ctx, lt, t);
  // CCTV dome, top-right
  ctx.fillStyle = '#20262c'; ctx.beginPath(); ctx.arc(860, CEIL + 24, 22, 0, Math.PI); ctx.fill(); ctx.fillStyle = '#ff3d34'; ctx.fillRect(858, CEIL + 34, 4, 4);
  mirror(ctx, lt, t, { ghost: o.ghost });
  machine(ctx, lt, t, { screen: o.screen });
  // dustbin of receipts
  ctx.fillStyle = mix('#6c7880', '#1a2024', 1 - lt); ctx.fillRect(320, FLOOR - 110, 70, 110);
  if (o.her) arch(ctx, o.her.x ?? 520, FLOOR - 4, o.her.s ?? 2.5, t, { ...o.her, light: lt });
  if (o.tallIn) tall(ctx, o.tallIn.x, FLOOR - 2, o.tallIn.h, t, { ...o.tallIn, light: lt });
  // glass front: tint, frame, door
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(120,190,220,0.05)'; ctx.fillRect(BOOTH.x0, CEIL, BOOTH.x1 - BOOTH.x0, FLOOR - CEIL); ctx.restore();
  ctx.strokeStyle = '#2a3238'; ctx.lineWidth = 16; ctx.strokeRect(BOOTH.x0, CEIL, BOOTH.x1 - BOOTH.x0, FLOOR - CEIL);
  ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(560, CEIL); ctx.lineTo(560, FLOOR); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(BOOTH.x0, 1080); ctx.lineTo(560, 1080); ctx.stroke();
  ctx.fillStyle = '#b9c4c8'; ctx.fillRect(520, 940, 12, 120);                    // door handle
  // the sticker on the door glass
  ctx.fillStyle = 'rgba(255,240,200,0.9)'; ctx.fillRect(300, 1010, 200, 48); ctx.fillStyle = '#1d2a6a'; ctx.font = '19px Serif4'; ctx.textAlign = 'center'; ctx.fillText('One customer at a time', 400, 1041);
  // reflections streak on the glass
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.beginPath(); ctx.moveTo(620, CEIL); ctx.lineTo(700, CEIL); ctx.lineTo(560, FLOOR); ctx.lineTo(480, FLOOR); ctx.closePath(); ctx.fill();
  signBand(ctx, lt, t);
  // light spill out of the booth onto the pavement
  if (lt > 0.05) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const pg = ctx.createLinearGradient(0, FLOOR, 0, FLOOR + 600); pg.addColorStop(0, rgba('#cdeeff', 0.28 * lt)); pg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = pg; ctx.beginPath(); ctx.moveTo(BOOTH.x0, FLOOR); ctx.lineTo(BOOTH.x1, FLOOR); ctx.lineTo(BOOTH.x1 + 260, FLOOR + 620); ctx.lineTo(BOOTH.x0 - 260, FLOOR + 620); ctx.closePath(); ctx.fill();
    ctx.restore();
    dust(ctx, t, BOOTH.x0, CEIL, BOOTH.x1 - BOOTH.x0, FLOOR - CEIL, 26, '#e8f8ff', 0.3 * lt, 4);
  }
  // guard's plastic chair, right of the door
  ctx.fillStyle = '#7a1a1a'; ctx.fillRect(940, 1380, 80, 10); ctx.fillRect(946, 1300, 10, 160); ctx.fillRect(1004, 1390, 8, 70); ctx.fillRect(946, 1390, 8, 70); ctx.fillRect(946, 1300, 70, 12);
  if (o.tallOut) tall(ctx, o.tallOut.x, o.tallOut.y, o.tallOut.h, t, { ...o.tallOut, light: lt });
  if (o.you) guard(ctx, o.you.x, o.you.y, o.you.h, o.you);
  if (o.man) Wd.person(ctx, o.man.x, o.man.y, o.man.h, { col: '#0b0d10', rim: COL.amber, rimSide: -1, view: o.man.view || 'front', walk: o.man.walk ?? null, fear: o.man.fear || 0, look: o.man.look || 0, lean: o.man.lean || 0 });
  // tube flicker wash
  if (o.flick) { ctx.save(); ctx.fillStyle = `rgba(0,0,0,${o.flick})`; ctx.fillRect(-400, -400, 1880, 2800); ctx.restore(); }
}

// ------------------------------------------------------------------ inserts
function note(ctx, t, o = {}) {
  ctx.save(); ctx.translate(560, 930); ctx.rotate(0.06 + Math.sin(t * 0.8) * 0.01);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(-400, -230, 820, 500);
  const pg = ctx.createLinearGradient(-420, 0, 420, 0); pg.addColorStop(0, '#f2efe4'); pg.addColorStop(0.7, '#d7d6cc'); pg.addColorStop(1, '#5a6066');
  ctx.fillStyle = pg; ctx.beginPath(); ctx.moveTo(-420, -240); ctx.lineTo(420, -250); ctx.lineTo(410, 250); ctx.lineTo(-415, 240); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(40,80,160,0.25)'; ctx.lineWidth = 2; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-410, -150 + i * 72); ctx.lineTo(405, -152 + i * 72); ctx.stroke(); }
  ctx.fillStyle = '#16205a'; ctx.font = '60px Serif4i'; ctx.textAlign = 'left';
  const a1 = clamp((t - (o.l1 || 0)) / 0.25), a2 = clamp((t - (o.l2 || 0)) / 0.25);
  ctx.globalAlpha = 0.25 + 0.75 * a1; ctx.fillText('1. One customer at a time.', -370, -95);
  ctx.globalAlpha = 0.25 + 0.75 * a2; ctx.fillText('2. Never look at the', -370, 15); ctx.fillText('    mirror.', -370, 87);
  ctx.globalAlpha = 0.8; ctx.font = '40px Serif4i'; ctx.fillStyle = '#4a3a1c'; ctx.fillText('— night supervisor', -20, 190);
  ctx.globalAlpha = 1; ctx.restore();
  Wd.myHand(ctx, 140, 1220, -0.35, 1.0, { curl: 0.6 });
  const sh = ctx.createLinearGradient(760, 0, 1080, 0); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = sh; ctx.fillRect(0, 0, 1080, 1920);
}
// the machine front, close: screen text, keypad, her long pale fingers coming UP from below, wrists bent back
function keypad(ctx, t, o = {}) {
  ctx.fillStyle = '#7f8b93'; ctx.fillRect(-300, -300, 1680, 2520);
  const g = ctx.createLinearGradient(0, 0, 1080, 0); g.addColorStop(0, 'rgba(0,0,0,0.35)'); g.addColorStop(0.5, 'rgba(255,255,255,0.08)'); g.addColorStop(1, 'rgba(0,0,0,0.4)'); ctx.fillStyle = g; ctx.fillRect(-300, -300, 1680, 2520);
  // screen
  ctx.fillStyle = '#0a1e2a'; D.rrect(ctx, 170, 260, 740, 460, 20); ctx.fill();
  ctx.fillStyle = '#7fe8ff'; ctx.font = '64px Serif4'; ctx.textAlign = 'center'; ctx.fillText(o.screen || 'Enter PIN', 540, 470);
  ctx.font = '40px Serif4i'; ctx.fillStyle = 'rgba(127,232,255,0.75)'; ctx.fillText(o.sub || '* * * *', 540, 560);
  D.glow(ctx, 540, 490, 420, 'rgba(110,220,255,A)', 0.3);
  // keys
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ''];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
    const kx = 300 + c * 170, ky = 860 + r * 130, pr = o.press === r * 3 + c ? 6 : 0;
    ctx.fillStyle = '#2a3036'; D.rrect(ctx, kx - 4, ky - 4 + pr, 138, 104, 14); ctx.fill();
    ctx.fillStyle = '#d6dde1'; D.rrect(ctx, kx, ky + pr, 130, 92, 12); ctx.fill();
    ctx.fillStyle = '#20262c'; ctx.font = '50px Serif4'; ctx.fillText(keys[r * 3 + c], kx + 65, ky + 64 + pr);
  }
  ctx.fillStyle = '#0c1014'; ctx.fillRect(220, 1440, 640, 26);           // cash slot, shut
  if (o.hands) for (const [hx, ph] of [[420, 0], [700, 1.7]]) paleHand(ctx, hx + Math.sin(t * 2 + ph) * 30, 1250 - Math.max(0, Math.sin(t * 7 + ph)) * 40, t + ph, o.hands);
}
function paleHand(ctx, x, y, t, a = 1) {
  // forearm from the bottom edge, wrist bent BACK so the fingers point down onto the keys (the hand is upside down)
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(1.6, 1.6);
  const sk = ctx.createLinearGradient(-40, 0, 40, 0); sk.addColorStop(0, '#5f6870'); sk.addColorStop(0.6, '#a9b2b8'); sk.addColorStop(1, '#4c545a');
  ctx.fillStyle = '#0b0d10'; ctx.fillRect(-46, 120, 92, 900);
  ctx.fillStyle = sk; ctx.fillRect(-34, 60, 68, 120);
  ctx.beginPath(); ctx.ellipse(0, 20, 50, 70, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = sk; ctx.lineCap = 'round'; ctx.lineWidth = 16;
  for (let f = 0; f < 4; f++) { const fx = -30 + f * 20, tw = Math.sin(t * 9 + f * 1.3) * 8; ctx.beginPath(); ctx.moveTo(fx, -30); ctx.quadraticCurveTo(fx - 6, -150, fx + tw, -190 - (f === 1 || f === 2 ? 30 : 0)); ctx.stroke(); }
  ctx.fillStyle = '#3a2a2a'; for (let f = 0; f < 4; f++) { const fx = -30 + f * 20; ctx.beginPath(); ctx.arc(fx + Math.sin(t * 9 + f * 1.3) * 8, -190 - (f === 1 || f === 2 ? 30 : 0), 7, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
// the CCTV monitor, full frame: a grey-green feed of the booth door from the ceiling corner, timestamp burned in.
// o.her = 0..1 shows her standing behind the guard; o.man shows the man at the door; o.stamp = time string
function cctv(ctx, t, o = {}) {
  ctx.fillStyle = '#0b0d0f'; ctx.fillRect(-300, -300, 1680, 2520);
  ctx.fillStyle = '#1c2024'; D.rrect(ctx, 60, 420, 960, 1080, 40); ctx.fill();
  ctx.save(); ctx.beginPath(); D.rrect(ctx, 110, 470, 860, 860, 26); ctx.clip();
  ctx.fillStyle = '#1a2620'; ctx.fillRect(110, 470, 860, 860);
  // high-angle view: floor plane, the door frame, the guard by the door, the road outside
  ctx.fillStyle = '#25352c'; ctx.beginPath(); ctx.moveTo(110, 900); ctx.lineTo(970, 820); ctx.lineTo(970, 1330); ctx.lineTo(110, 1330); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#0f1713'; ctx.fillRect(560, 470, 410, 380);                       // the dark road through the glass
  ctx.strokeStyle = '#4a5f52'; ctx.lineWidth = 12; ctx.strokeRect(560, 470, 410, 380);
  const gx = 700, gy = 1180;
  if (o.man) Wd.person(ctx, 860, 860, 300, { col: '#0a100c', rim: '#9fd8b0', rimSide: -1, view: 'front', fear: o.man.fear || 0, look: -1, walk: o.man.walk ?? null });
  if (o.her) { ctx.save(); ctx.globalAlpha = clamp(o.her); tall(ctx, gx - 130, gy - 10, 560, t, { col: '#08100b', rim: '#bfe8cc', tilt: 0.45, light: 0.8, eyes: 1 }); ctx.restore(); }
  guard(ctx, gx, gy, 330, { rim: '#bfe8cc', view: 'back' });
  // the feed look: green mono, scanlines, roll bar, noise
  ctx.globalCompositeOperation = 'source-over';
  for (let y = 470; y < 1330; y += 6) { ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(110, y, 860, 2); }
  const rb = 470 + ((t * 140) % 900); ctx.fillStyle = 'rgba(190,255,210,0.06)'; ctx.fillRect(110, rb, 860, 70);
  ctx.fillStyle = 'rgba(140,255,180,0.1)'; ctx.fillRect(110, 470, 860, 860);
  ctx.fillStyle = '#e9ffe9'; ctx.font = '40px Serif4'; ctx.textAlign = 'left'; ctx.fillText('CAM 1', 140, 530);
  ctx.textAlign = 'right'; ctx.fillText(o.stamp || '03:10:42', 940, 530);
  ctx.fillStyle = '#ff3d34'; ctx.beginPath(); ctx.arc(250, 518, 10, 0, Math.PI * 2); if (Math.floor(t * 2) % 2) ctx.fill();
  ctx.restore();
  D.glow(ctx, 540, 900, 600, 'rgba(140,255,180,A)', 0.12);
  ctx.fillStyle = '#2a2f34'; ctx.fillRect(500, 1500, 80, 120); ctx.fillRect(380, 1600, 320, 30);
}
// the mirror, full frame: the booth seen in the strip mirror (left-right flipped). The machine at the right with NOBODY at
// it; you in the doorway looking up at us; o.her 0..1: her, standing straight, right behind you
function mirrorView(ctx, t, o = {}) {
  ctx.fillStyle = '#0a0e12'; ctx.fillRect(-300, -300, 1680, 2520);
  ctx.save(); ctx.beginPath(); ctx.rect(40, 300, 1000, 1320); ctx.clip();
  // reflected interior: the glass front with the night road, the tubes, the floor
  ctx.fillStyle = '#c9dbe2'; ctx.fillRect(40, 300, 1000, 1320);
  ctx.fillStyle = '#081217'; ctx.fillRect(380, 520, 320, 900);                         // the dark door glass + road
  for (let i = 0; i < 4; i++) if (hash(i * 3) > 0.3) { ctx.fillStyle = 'rgba(255,170,90,0.6)'; ctx.fillRect(420 + i * 70, 620 + hash(i) * 120, 10, 14); }
  D.glow(ctx, 640, 640, 140, 'rgba(255,150,60,A)', 0.4);                               // the streetlight, flipped
  ctx.strokeStyle = '#2a3238'; ctx.lineWidth = 18; ctx.strokeRect(380, 520, 320, 900); ctx.fillStyle = '#7a8890'; ctx.fillRect(150, 1180, 70, 240); ctx.fillStyle = '#15181c'; ctx.fillRect(820, 400, 140, 98);
  ctx.fillStyle = '#eefaff'; ctx.fillRect(220, 330, 260, 14); ctx.fillRect(600, 330, 260, 14); D.glow(ctx, 540, 340, 400, 'rgba(225,248,255,A)', 0.4);
  ctx.fillStyle = '#9fb0b8'; ctx.fillRect(40, 1420, 1000, 200);
  // you, in the doorway, looking up into the mirror (front view, lit by the tubes)
  if (o.her) tall(ctx, 600, 1440, lerp(820, 1000, E.out(clamp(o.her))), t, { rim: '#eaf8ff', tilt: 0.55, light: 1, eyes: o.her, col: rgba('#05070a', clamp(o.her * 1.4)) });
  guard(ctx, 520, 1440, 560, { view: 'front', fear: o.fear ?? 0.5, look: 0, rim: '#eaf8ff', rimSide: 1 });
  ctx.restore();
  // mirror body: tint, curvature, edge, scratches
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#a9bfcc'; ctx.fillRect(40, 300, 1000, 1320); ctx.restore();
  const vg = ctx.createRadialGradient(540, 960, 300, 540, 960, 820); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)'); ctx.fillStyle = vg; ctx.fillRect(40, 300, 1000, 1320);
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.moveTo(120, 300); ctx.lineTo(260, 300); ctx.lineTo(100, 1620); ctx.lineTo(-40, 1620); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 2; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(100 + hash(i) * 880, 320 + hash(i * 2) * 1200); ctx.lineTo(160 + hash(i) * 880, 340 + hash(i * 2) * 1200); ctx.stroke(); }
  ctx.strokeStyle = '#1a242c'; ctx.lineWidth = 40; ctx.strokeRect(40, 300, 1000, 1320);
}

module.exports = { booth, arch, tall, guard, machine, mirror, note, keypad, cctv, mirrorView, paleHand, FLOOR, CEIL, BOOTH, ATM, MIRROR, COL };
