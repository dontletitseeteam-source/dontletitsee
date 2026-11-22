// NIGHT SHIFT — Episode 7 set painters: the highway toll plaza at 3 AM. THE BACKWARDS MAN: a too-tall truck driver in an
// orange toll-staff vest whose head is on backwards (chest and toes one way, face the other: the silhouette reads at once).
// drawPlaza (side view: bright canopy, the truck cab facing LEFT with him in the window, the barrier, your lit booth on the
// right; he can step out and walk BACKWARDS to the booth), drawGlass (from inside your booth, looking out through the glass:
// his arm bent the wrong way paying, or his BACK with his FACE on top = the POSTER), drawConsole (barrier button), drawNote
// (2 rules), drawMirror (the truck's side mirror: your head turning around). World space 1080x1920, same conventions.
const D = require('./draw');
const { W, H, C, clamp, lerp, inv, E, hash, flicker, rrect, glow, spaced, drawStick, drawFace } = D;

const VEST = '#ff7a1a', VEST_D = '#c4520a', STRIPE = '#e4ebf5', PANTS = '#1a2038', SHIRT = '#2a3150';
const SKIN = '#c3c8d2', SKIN_D = '#8d94a6', HAIR = '#0b0e1c', CAB = '#e9e3d2', CAB_D = '#b3ab96', TRAILER = '#3a4466';
const INK = '#141a36', REDINK = '#c4202c';
const G = 1300;                              // ground line of the plaza
const BOOTH = { x0: 640, x1: 1040, top: G - 660, win0: G - 560, win1: G - 230, meX: 850 };
const CABX = 200;                            // front (nose) of the cab
const DOOR = { x0: 310, x1: 540, y0: G - 490, y1: G - 120 };
const poly = (ctx, pts, fill) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } };
const mix = (a, b, k) => { const p = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(k)))).join(',')})`; };
const darken = (ctx, a) => { if (a > 0.005) { ctx.fillStyle = `rgba(2,3,8,${a})`; ctx.fillRect(-2000, -2000, W + 4000, H + 4000); } };

// ---------- his head, side view: the FACE points +x (right) while the body faces -x (left) ----------
// local origin = head centre. o: {blink, look, smile, eyeGlow}
function headSide(ctx, t, o = {}) {
  ctx.save();
  ctx.beginPath(); ctx.ellipse(0, 0, 62, 74, 0, 0, 7); ctx.fillStyle = SKIN; ctx.fill();
  // hair: the back of the skull is now on the LEFT (the side his chest faces)
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 62, 74, 0, 0, 7); ctx.clip();
  ctx.beginPath(); ctx.ellipse(-26, -22, 60, 70, -0.35, 0, 7); ctx.fillStyle = HAIR; ctx.fill();
  ctx.restore();
  ctx.lineWidth = 5; ctx.strokeStyle = '#0b1022'; ctx.beginPath(); ctx.ellipse(0, 0, 62, 74, 0, 0, 7); ctx.stroke();
  // ear in the middle
  ctx.beginPath(); ctx.ellipse(-6, 4, 12, 18, 0, 0, 7); ctx.fillStyle = SKIN_D; ctx.fill(); ctx.lineWidth = 3; ctx.stroke();
  // nose to the RIGHT
  poly(ctx, [[58, -16], [84, 12], [58, 18]], SKIN); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(58, -16); ctx.lineTo(84, 12); ctx.lineTo(58, 18); ctx.stroke();
  // eye: wide, white, a small pupil looking right
  const bl = clamp(o.blink || 0);
  ctx.beginPath(); ctx.ellipse(36, -16, 14, 12 * (1 - bl * 0.9), 0, 0, 7); ctx.fillStyle = '#f4f6fb'; ctx.fill(); ctx.lineWidth = 3; ctx.stroke();
  if (bl < 0.6) { ctx.beginPath(); ctx.arc(42 + (o.look || 0) * 3, -15, 5, 0, 7); ctx.fillStyle = '#05060c'; ctx.fill(); }
  if (o.eyeGlow) glow(ctx, 38, -16, 60, 'rgba(255,240,200,A)', 0.4 * o.eyeGlow);
  ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(22, -38); ctx.lineTo(50, -34); ctx.stroke();
  // mouth: thin, long, a slight smile
  const sm = o.smile ?? 0.3;
  ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(34, 40); ctx.quadraticCurveTo(48, 44 + sm * 8, 60, 34 - sm * 4); ctx.stroke();
  ctx.restore();
}

// twisted neck: skin column with spiral creases
function neck(ctx, x0, y0, x1, y1, w) {
  ctx.save(); ctx.strokeStyle = SKIN; ctx.lineWidth = w; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.strokeStyle = SKIN_D; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) { const u = 0.15 + i * 0.22; const x = lerp(x0, x1, u), y = lerp(y0, y1, u); ctx.beginPath(); ctx.moveTo(x - w * 0.45, y + 8); ctx.quadraticCurveTo(x, y - 4, x + w * 0.45, y - 12); ctx.stroke(); }
  ctx.restore();
}

// vest on a side-view torso (front = left)
function torsoSide(ctx, top, bot) {
  ctx.beginPath(); ctx.moveTo(-66, bot); ctx.lineTo(-70, top + 60); ctx.quadraticCurveTo(-72, top, -20, top); ctx.lineTo(40, top); ctx.quadraticCurveTo(66, top + 10, 60, top + 80); ctx.lineTo(56, bot); ctx.closePath();
  ctx.fillStyle = VEST; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#0b1022'; ctx.stroke();
  ctx.fillStyle = STRIPE; ctx.fillRect(-70, lerp(top, bot, 0.45), 128, 18); ctx.fillRect(-68, lerp(top, bot, 0.72), 126, 18);
  ctx.fillStyle = SHIRT; ctx.fillRect(-10, top - 2, 36, 18);
}

// ---------- THE BACKWARDS MAN, side view, standing. Origin = feet. Body faces LEFT, face looks RIGHT ----------
// o: {walk phase, bob, lean (neck bends toward +x / down), blink, look, smile, arm 'hang'|'tap'|'point', tap 0..1}
function manSide(ctx, t, o = {}) {
  const ph = o.walk;
  ctx.save();
  // legs: thighs+shins, boots with toes pointing LEFT
  const leg = (sw, lift) => {
    const hx = 0, hy = -400; const fx = -sw * 60, fy = -lift;
    const kx = lerp(hx, fx, 0.5) - 16, ky = -200 - lift * 0.5;
    ctx.strokeStyle = PANTS; ctx.lineWidth = 40; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy - 20); ctx.stroke();
    ctx.fillStyle = '#05060c'; rrect(ctx, fx - 56, fy - 30, 82, 30, 12); ctx.fill();
  };
  const s1 = ph !== undefined ? Math.sin(ph) : 0.3, s2 = ph !== undefined ? -Math.sin(ph) : -0.3;
  const l1 = ph !== undefined ? Math.max(0, Math.cos(ph)) * 26 : 0, l2 = ph !== undefined ? Math.max(0, -Math.cos(ph)) * 26 : 0;
  leg(s2, l2); leg(s1, l1);
  const bob = o.bob || 0;
  ctx.translate(0, bob);
  // back arm
  ctx.strokeStyle = SHIRT; ctx.lineWidth = 30; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, -690); ctx.lineTo(20 + s1 * 10, -560); ctx.lineTo(10 + s1 * 20, -440); ctx.stroke();
  torsoSide(ctx, -720, -380);
  // front arm (or tapping / pointing BACKWARD, toward +x)
  ctx.strokeStyle = SHIRT; ctx.lineWidth = 32;
  let hx = -20 + s2 * 20, hy = -430;
  ctx.beginPath(); ctx.moveTo(-10, -690);
  if (o.arm === 'tap' || o.arm === 'point') {   // elbow bends the WRONG way: points down-left while the hand goes back (+x)
    const k = o.arm === 'tap' ? 1 : 1;
    ctx.lineTo(-40, -560); hx = 120 + (o.arm === 'tap' ? Math.sin((o.tap || 0) * Math.PI * 6) * 18 : 60); hy = o.arm === 'tap' ? -640 : -700;
    ctx.lineTo(hx, hy); void k;
  } else { ctx.lineTo(-30 + s2 * 10, -560); ctx.lineTo(hx, hy); }
  ctx.stroke();
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(hx, hy, 20, 0, 7); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#0b1022'; ctx.stroke();
  if (o.arm === 'point') { ctx.strokeStyle = SKIN; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(hx + 10, hy); ctx.lineTo(hx + 52, hy - 6); ctx.stroke(); }
  // neck (twisted) + head, the head leaning toward +x when he looks down at you
  const ln = o.lean || 0;
  const nx = 10, ny = -720; const hdx = nx + 10 + ln * 60, hdy = ny - 110 + ln * 30;
  neck(ctx, nx + 4, ny + 6, hdx - 4, hdy + 50, 40);
  ctx.save(); ctx.translate(hdx, hdy); ctx.rotate(ln * 0.5); headSide(ctx, t, o); ctx.restore();
  ctx.restore();
}

// ---------- his upper body seated in the cab (the door hides the legs). Origin = seat (hip) point ----------
// o: {pay 0..1 (arm out through the window toward +x, elbow bent the wrong way), coins, blink, look}
function manSeated(ctx, t, o = {}) {
  ctx.save();
  ctx.translate(0, 380);
  ctx.strokeStyle = SHIRT; ctx.lineWidth = 30; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // hands on the wheel (to the LEFT, the way the truck faces)
  const pay = clamp(o.pay || 0);
  ctx.beginPath(); ctx.moveTo(-14, -690); ctx.lineTo(-80, -580); ctx.lineTo(-150, -610); ctx.stroke();
  torsoSide(ctx, -720, -380);
  ctx.strokeStyle = SHIRT; ctx.lineWidth = 32; ctx.beginPath(); ctx.moveTo(-6, -690);
  let hx, hy;
  if (pay > 0) { const ex = lerp(-70, -30, pay), ey = lerp(-580, -540, pay); hx = lerp(-150, 330, E.inOut(pay)); hy = lerp(-610, -650, pay); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); }
  else { ctx.lineTo(-70, -580); hx = -150; hy = -620; ctx.lineTo(hx, hy); }
  ctx.stroke();
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(hx, hy, 20, 0, 7); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#0b1022'; ctx.stroke();
  if (pay > 0.6 && o.coins !== false) for (let i = 0; i < 3; i++) { ctx.fillStyle = '#e8c95a'; ctx.beginPath(); ctx.ellipse(hx - 8 + i * 9, hy - 18 - i * 3, 12, 6, 0, 0, 7); ctx.fill(); ctx.strokeStyle = '#8a6d1a'; ctx.lineWidth = 2; ctx.stroke(); }
  neck(ctx, 14, -714, 20, -770, 40);
  ctx.save(); ctx.translate(22, -830); headSide(ctx, t, o); ctx.restore();
  ctx.restore();
}

// ---------- the truck: cab facing LEFT (nose at CABX), trailer behind to the right ----------
// st: {L light, door 0..1 (open), driver bool, pay, blink, look, exhaust}
function truck(ctx, t, st = {}) {
  const L = st.L ?? 1;
  // trailer
  ctx.fillStyle = mix('#151a30', TRAILER, L); ctx.fillRect(560, G - 640, 1500, 520);
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 4; for (let x = 600; x < 2000; x += 90) { ctx.beginPath(); ctx.moveTo(x, G - 630); ctx.lineTo(x, G - 130); ctx.stroke(); }
  ctx.fillStyle = mix('#3a0c12', '#e3242f', L); ctx.fillRect(560, G - 170, 1500, 22);
  ctx.font = '64px Osw700'; ctx.fillStyle = mix('#2a3050', '#cfd6e6', L); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('NH 48 CARGO', 640, G - 420);
  // chassis + wheels
  ctx.fillStyle = '#0b0e1c'; ctx.fillRect(CABX + 20, G - 150, 1900, 50);
  for (const wx of [CABX + 110, 760, 900]) {
    ctx.beginPath(); ctx.arc(wx, G - 70, 70, 0, 7); ctx.fillStyle = '#05060c'; ctx.fill();
    ctx.beginPath(); ctx.arc(wx, G - 70, 34, 0, 7); ctx.fillStyle = mix('#3b4466', '#9aa3b8', L); ctx.fill();
  }
  // cab body
  ctx.beginPath(); ctx.moveTo(CABX, G - 140); ctx.lineTo(CABX, G - 380); ctx.quadraticCurveTo(CABX + 6, G - 540, CABX + 110, G - 560); ctx.lineTo(545, G - 560); ctx.lineTo(545, G - 140); ctx.closePath();
  ctx.fillStyle = mix('#2a2f44', CAB, L); ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = '#0b1022'; ctx.stroke();
  ctx.fillStyle = mix('#1b2034', CAB_D, L); ctx.fillRect(CABX, G - 230, 345, 90);
  // grille + headlight on the nose
  ctx.fillStyle = '#0b0e1c'; ctx.fillRect(CABX - 8, G - 330, 26, 170);
  ctx.fillStyle = '#fff6d0'; rrect(ctx, CABX - 14, G - 300, 24, 46, 6); ctx.fill();
  glow(ctx, CABX - 60, G - 276, 260, 'rgba(255,240,190,A)', 0.55 * L + 0.3);
  // windscreen edge (front)
  poly(ctx, [[CABX + 14, G - 390], [CABX + 40, G - 520], [CABX + 110, G - 530], [CABX + 110, G - 390]], '#0a1024');
  // the cab interior behind the door window: dark, a dash light
  const wy0 = G - 470, wy1 = G - 290;
  ctx.fillStyle = '#0a1024'; rrect(ctx, DOOR.x0 + 14, wy0, DOOR.x1 - DOOR.x0 - 28, wy1 - wy0, 12); ctx.fill();
  glow(ctx, DOOR.x0 + 60, wy1 - 20, 180, 'rgba(120,200,255,A)', 0.25);
  // steering wheel
  ctx.save(); ctx.lineWidth = 12; ctx.strokeStyle = '#2c3350'; ctx.beginPath(); ctx.ellipse(DOOR.x0 + 40, G - 310, 14, 50, 0.4, 0, 7); ctx.stroke(); ctx.restore();
  // the driver (clipped to the window unless the door is open or he pays)
  if (st.driver !== false) {
    ctx.save();
    if ((st.door || 0) < 0.05) { ctx.beginPath(); ctx.rect(DOOR.x0 + 14, wy0, DOOR.x1 - DOOR.x0 - 28, wy1 - wy0); if ((st.pay || 0) > 0) ctx.rect(DOOR.x1 - 30, wy0 - 40, 600, 200); ctx.clip(); }
    ctx.translate(DOOR.x0 + 120, G - 180); ctx.scale(0.5, 0.5);
    manSeated(ctx, t, { pay: st.pay, blink: st.blink, look: st.look, eyeGlow: st.eyeGlow });
    ctx.restore();
  }
  // the door (swings open toward the camera: narrows to the left hinge... drawn as a panel that slides out and darkens)
  const dr = clamp(st.door || 0);
  if (dr < 0.98) {
    ctx.save();
    const w = (DOOR.x1 - DOOR.x0) * (1 - dr * 0.85);
    ctx.translate(DOOR.x1, 0); ctx.scale(-1, 1); ctx.translate(-DOOR.x1, 0);   // hinge at the back edge (x1)
    ctx.beginPath(); ctx.rect(DOOR.x0 + (DOOR.x1 - DOOR.x0 - w), DOOR.y0, w, DOOR.y1 - DOOR.y0);
    ctx.restore();
    // frame + panel below the window
    ctx.lineWidth = 6; ctx.strokeStyle = '#0b1022';
    if (dr < 0.05) {
      ctx.strokeRect(DOOR.x0, DOOR.y0, DOOR.x1 - DOOR.x0, DOOR.y1 - DOOR.y0);
      ctx.fillStyle = '#0b1022'; ctx.fillRect(DOOR.x0 + 20, G - 270, 40, 10);
    } else {
      // the opening: dark interior with the dome light, the door panel swung out (seen edge-on, a thin slab)
      ctx.fillStyle = '#05070f'; ctx.fillRect(DOOR.x0, DOOR.y0, DOOR.x1 - DOOR.x0, DOOR.y1 - DOOR.y0);
      glow(ctx, (DOOR.x0 + DOOR.x1) / 2, DOOR.y0 + 30, 260, 'rgba(255,230,170,A)', 0.5 * dr);
      const sx = DOOR.x0 - dr * 70;
      poly(ctx, [[DOOR.x0, DOOR.y0], [sx, DOOR.y0 + 20], [sx, DOOR.y1 + 10], [DOOR.x0, DOOR.y1]], mix('#2a2f44', CAB, L * 0.8));
      ctx.stroke();
    }
  }
  // steps
  ctx.fillStyle = '#0b0e1c'; ctx.fillRect(DOOR.x0 + 20, G - 120, 120, 14); ctx.fillRect(DOOR.x0 + 20, G - 70, 120, 14);
  // the side mirror on its bracket at the front of the door (it faces back, toward your booth)
  ctx.strokeStyle = '#0b0e1c'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(DOOR.x0, G - 440); ctx.lineTo(DOOR.x0 - 60, G - 470); ctx.lineTo(DOOR.x0 - 60, G - 420); ctx.stroke();
  rrect(ctx, DOOR.x0 - 92, G - 560, 46, 150, 12); ctx.fillStyle = '#10142a'; ctx.fill(); ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = `rgba(190,215,255,${0.35 + 0.4 * (st.mirrorGlow || 0)})`; rrect(ctx, DOOR.x0 - 86, G - 552, 34, 134, 8); ctx.fill();
  if (st.mirrorGlow) glow(ctx, DOOR.x0 - 69, G - 485, 200, 'rgba(200,225,255,A)', 0.6 * st.mirrorGlow);
  // exhaust stack + idle smoke
  ctx.fillStyle = '#1b2034'; ctx.fillRect(548, G - 720, 22, 190);
  if (st.exhaust !== false) for (let i = 0; i < 6; i++) { const u = (t * 0.6 + i / 6) % 1; ctx.fillStyle = `rgba(180,190,215,${0.22 * (1 - u)})`; ctx.beginPath(); ctx.arc(559 + u * 60, G - 730 - u * 220, 20 + u * 50, 0, 7); ctx.fill(); }
}

// ---------- your booth (foreground right): lit window, you inside ----------
// st.me: drawStick options for you (x defaults to BOOTH.meX), st.meHead: 0..1 your head turning around (0 face, 1 back of head)
function booth(ctx, t, st = {}) {
  const L = st.L ?? 1, B = BOOTH;
  // interior
  ctx.fillStyle = mix('#151a2e', '#f0dfb8', L * 0.9); ctx.fillRect(B.x0, B.top + 60, B.x1 - B.x0, G - B.top - 60);
  glow(ctx, (B.x0 + B.x1) / 2, B.win0 + 40, 360, 'rgba(255,225,160,A)', 0.4 * L);
  // a photo on the back wall: the last toll man (normal face), "NIGHT STAFF"
  ctx.save(); ctx.translate(B.x1 - 80, B.win0 + 70); ctx.rotate(0.05); ctx.fillStyle = '#efe6c8'; ctx.fillRect(-40, -50, 80, 100); ctx.fillStyle = '#8a92a6'; ctx.fillRect(-32, -42, 64, 62);
  ctx.fillStyle = '#c3c8d2'; ctx.beginPath(); ctx.arc(0, -16, 14, 0, 7); ctx.fill(); ctx.fillStyle = VEST; ctx.fillRect(-18, 0, 36, 20); ctx.restore();
  if (st.me !== null) {
    const me = { x: B.meX, y: G - 40, s: 1.1, view: 'front', jacket: VEST, ...(st.me || {}) };
    const k = clamp(st.meHead || 0);
    if (k > 0) { drawStick(ctx, { ...me, face: undefined }); meHead(ctx, me.x + (me.headDX || 0) * me.s, me.y - 338 * me.s + (me.headDY || 0) * me.s, me.s, k, me.face || { fear: 0.9 }); }
    else drawStick(ctx, me);
  }
  // walls around the window, the lower panel hides the legs
  ctx.fillStyle = mix('#1b2140', '#e9edf3', L); ctx.fillRect(B.x0, B.win1, B.x1 - B.x0, G - B.win1);
  ctx.fillStyle = mix('#3a0c12', '#e3242f', L); for (let i = 0; i < 5; i++) poly(ctx, [[B.x0 + i * 90, G], [B.x0 + i * 90 + 45, G], [B.x0 + i * 90 + 95, G - 70], [B.x0 + i * 90 + 50, G - 70]]);
  ctx.fillStyle = mix('#1b2140', '#e9edf3', L); ctx.fillRect(B.x0, B.top, B.x1 - B.x0, B.win0 - B.top); ctx.fillRect(B.x0, B.top, 26, G - B.top); ctx.fillRect(B.x1 - 26, B.top, 26, G - B.top);
  ctx.lineWidth = 6; ctx.strokeStyle = '#0b1022'; ctx.strokeRect(B.x0, B.top, B.x1 - B.x0, G - B.top); ctx.strokeRect(B.x0 + 26, B.win0, B.x1 - B.x0 - 52, B.win1 - B.win0);
  // counter + glass sheen
  ctx.fillStyle = mix('#0b1022', '#8a7a5a', L); ctx.fillRect(B.x0 + 26, B.win1 - 18, B.x1 - B.x0 - 52, 18);
  ctx.save(); ctx.globalAlpha = 0.16; poly(ctx, [[B.x0 + 60, B.win0], [B.x0 + 140, B.win0], [B.x0 + 60, B.win1], [B.x0 + 26, B.win1]], '#ffffff'); ctx.restore();
  // roof: lane sign + signal (red X -> green arrow)
  rrect(ctx, B.x0 - 20, B.top - 90, B.x1 - B.x0 + 40, 90, 10); ctx.fillStyle = mix('#0e1430', '#1d2a5c', L); ctx.fill(); ctx.lineWidth = 5; ctx.stroke();
  ctx.font = '50px Osw700'; ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('LANE 3', B.x0 + 20, B.top - 45);
  ctx.save(); ctx.translate(B.x1 - 70, B.top - 45); ctx.lineWidth = 12; ctx.lineCap = 'round';
  if (st.green) { ctx.strokeStyle = '#3dff6a'; ctx.beginPath(); ctx.moveTo(18, -18); ctx.lineTo(-18, 0); ctx.lineTo(18, 18); ctx.moveTo(-18, 0); ctx.lineTo(26, 0); ctx.stroke(); glow(ctx, 0, 0, 90, 'rgba(60,255,110,A)', 0.5); }
  else { ctx.strokeStyle = C.red; ctx.beginPath(); ctx.moveTo(-18, -18); ctx.lineTo(18, 18); ctx.moveTo(18, -18); ctx.lineTo(-18, 18); ctx.stroke(); glow(ctx, 0, 0, 90, 'rgba(255,50,70,A)', 0.5); }
  ctx.restore();
  ctx.font = '26px Mono700'; ctx.fillStyle = mix('#5a5f70', INK, L); ctx.textAlign = 'center'; spaced(ctx, 'TOLL · RS 340', (B.x0 + B.x1) / 2, B.win1 + 60, 3, 'center');
}

// your head turning around (k 0 = face, 1 = the back of your head with hair). Centre (x, y), scale s
function meHead(ctx, x, y, s, k, face) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.arc(0, 0, 40, 0, 7); ctx.fillStyle = C.navy1; ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 39, 0, 7); ctx.clip();
  const off = k * 80;  // the face slides off to the right, the hair comes in from the left
  ctx.save(); ctx.translate(off, 0); ctx.scale(Math.max(0.15, 1 - k * 0.8), 1); drawFace(ctx, face); ctx.restore();
  ctx.save(); ctx.translate(off - 80, 0);
  ctx.beginPath(); ctx.ellipse(0, -6, 40, 44, 0, 0, 7); ctx.fillStyle = HAIR; ctx.fill();
  ctx.strokeStyle = 'rgba(120,135,170,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(2, -10, 10, 0, 5); ctx.stroke(); ctx.beginPath(); ctx.arc(2, -10, 20, 0.5, 4); ctx.stroke();
  ctx.restore();
  ctx.restore();
  ctx.lineWidth = 8.5; ctx.strokeStyle = C.white; ctx.beginPath(); ctx.arc(0, 0, 40, 0, 7); ctx.stroke();
  ctx.restore();
}

// ---------- THE PLAZA ----------
// st: {light, barrier 0..1 (lift), green, door, driver (in cab), pay, walker {x, walk, lean, arm, tap, blink}, me, meHead, mirrorGlow, dark}
function drawPlaza(ctx, t, st = {}) {
  const L = (st.light ?? 1) * flicker(t, 3, 0.012);
  const sg = ctx.createLinearGradient(0, -600, 0, 900); sg.addColorStop(0, '#060b22'); sg.addColorStop(1, '#18265a');
  ctx.fillStyle = sg; ctx.fillRect(-2000, -2000, W + 4000, H + 4000);
  for (let i = 0; i < 30; i++) { const x = hash(i * 7.1) * 2400 - 700, y = hash(i * 2.3) * 500 - 300; ctx.fillStyle = `rgba(230,236,255,${0.3 + 0.5 * hash(i)})`; ctx.fillRect(x, y, 3, 3); }
  // far hills + highway lamps receding to the right ("back down the road")
  ctx.fillStyle = '#070b1e'; for (let i = -8; i < 18; i++) { const x = i * 130, h = 70 + hash(i * 1.9) * 110; ctx.beginPath(); ctx.ellipse(x, 640, 100, h, 0, Math.PI, 0); ctx.fill(); }
  ctx.fillStyle = '#070b1e'; ctx.fillRect(-2000, 640, W + 4000, 80);
  for (let i = 0; i < 7; i++) { const x = 1150 + i * 160, h = 260 - i * 26; ctx.fillStyle = '#0b1022'; ctx.fillRect(x, 700 - h, 6, h); ctx.fillStyle = '#ffe9b0'; ctx.fillRect(x - 14, 700 - h, 24, 6); glow(ctx, x, 700 - h + 6, 80 - i * 6, 'rgba(255,220,150,A)', 0.5); }
  // road (bright under the canopy)
  const fg = ctx.createLinearGradient(0, 700, 0, 1920); fg.addColorStop(0, mix('#0d1430', '#6f7c9c', L)); fg.addColorStop(0.45, mix('#121a3a', '#aab4ca', L)); fg.addColorStop(1, mix('#0b1128', '#7d8aa8', L));
  ctx.fillStyle = fg; ctx.fillRect(-2000, 700, W + 4000, 2000);
  ctx.fillStyle = 'rgba(255,214,90,0.6)'; for (let x = -1200; x < 2400; x += 240) ctx.fillRect(x, G + 120, 130, 12);
  ctx.fillStyle = 'rgba(11,16,34,0.2)'; ctx.fillRect(-2000, G - 6, W + 4000, 12);
  // canopy + lights
  ctx.fillStyle = mix('#0e1430', '#dfe4ee', L * 0.9); ctx.fillRect(-2000, 170, W + 4000, 140);
  ctx.fillStyle = mix('#3a0c12', '#e3242f', L); ctx.fillRect(-2000, 270, W + 4000, 40);
  ctx.font = '46px Osw700'; ctx.fillStyle = mix('#5a5f70', '#0b1022', L); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('TOLL PLAZA · NH 48', 540, 222);
  ctx.fillStyle = mix('#151a30', '#fffbe8', L); for (let x = -500; x < 1800; x += 260) ctx.fillRect(x, 310, 160, 14);
  if (L > 0.05) for (let x = -420; x < 1800; x += 260) glow(ctx, x + 80, 380, 560, 'rgba(255,248,225,A)', 0.2 * L);
  ctx.fillStyle = mix('#151c3a', '#d9dde6', L); ctx.fillRect(590, 310, 40, G - 310);
  // the truck
  truck(ctx, t, { L, door: st.door, driver: st.driver, pay: st.pay, blink: st.blink, look: st.look, mirrorGlow: st.mirrorGlow, eyeGlow: st.eyeGlow });
  // barrier at the nose: post + striped arm (lifts up)
  const bx = CABX - 60, by = G - 200, k = E.inOut(clamp(st.barrier || 0));
  ctx.fillStyle = '#e9edf3'; ctx.fillRect(bx - 24, by - 20, 48, G - by + 20); ctx.fillStyle = C.red; ctx.fillRect(bx - 24, by + 40, 48, 30);
  ctx.save(); ctx.translate(bx, by); ctx.rotate(Math.PI + k * Math.PI / 2 * 0.96);
  for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? '#e9edf3' : C.red; ctx.fillRect(20 + i * 90, -12, 90, 24); }
  ctx.restore();
  ctx.beginPath(); ctx.arc(bx, by, 18, 0, 7); ctx.fillStyle = '#0b1022'; ctx.fill();
  // the Backwards Man, out of the cab
  if (st.walker) { const w = st.walker; ctx.save(); ctx.translate(w.x, G + 10); ctx.scale(w.s ?? 0.95, w.s ?? 0.95); manSide(ctx, t, w); ctx.restore(); }
  booth(ctx, t, { L, me: st.me, meHead: st.meHead, green: st.green });
  if (st.walkerFront) { const w = st.walkerFront; ctx.save(); ctx.translate(w.x, G + 10); ctx.scale(w.s ?? 0.95, w.s ?? 0.95); manSide(ctx, t, w); ctx.restore(); }
  if (st.dark) darken(ctx, st.dark);
}

// ---------- his BACK, seen from inside your booth through the glass: vest "TOLL STAFF", face on top = THE POSTER ----------
// local origin = the middle of his shoulders. o: {blink, smile, eyeGlow, lean}
function manBack(ctx, t, o = {}) {
  ctx.save();
  // shoulders + vest back
  ctx.beginPath(); ctx.moveTo(-330, 900); ctx.lineTo(-300, 120); ctx.quadraticCurveTo(-290, 20, -180, 0); ctx.lineTo(180, 0); ctx.quadraticCurveTo(290, 20, 300, 120); ctx.lineTo(330, 900); ctx.closePath();
  ctx.fillStyle = VEST; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#0b1022'; ctx.stroke();
  ctx.fillStyle = VEST_D; ctx.fillRect(-8, 60, 16, 840);   // the back seam
  ctx.fillStyle = STRIPE; ctx.fillRect(-318, 420, 636, 44); ctx.fillRect(-326, 640, 652, 44);
  rrect(ctx, -250, 150, 500, 170, 14); ctx.fillStyle = '#f4f1e6'; ctx.fill();
  ctx.font = '112px Osw700'; ctx.fillStyle = '#0b1022'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('TOLL STAFF', 0, 240);
  // shirt collar seen from behind: it folds UNDER his chin (wrong)
  poly(ctx, [[-120, 10], [0, -30], [120, 10], [0, 40]], SHIRT);
  // twisted neck
  neck(ctx, 0, 0, 0, -150, 150);
  // the head, FACE toward you; hair only around the edge (the back of the head is behind)
  ctx.save(); ctx.translate(0, -330 + (o.lean || 0) * 40); ctx.rotate((o.tilt || 0));
  ctx.beginPath(); ctx.ellipse(0, 0, 175, 215, 0, 0, 7); ctx.fillStyle = HAIR; ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, 30, 160, 190, 0, 0, 7); ctx.fillStyle = SKIN; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#0b1022'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-160, -10); ctx.quadraticCurveTo(0, -150, 160, -10); ctx.quadraticCurveTo(80, -60, 0, -50); ctx.quadraticCurveTo(-80, -60, -160, -10); ctx.fillStyle = HAIR; ctx.fill();
  const bl = clamp(o.blink || 0);
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(s * 62, 20, 40, 32 * (1 - bl * 0.9), 0, 0, 7); ctx.fillStyle = '#f4f6fb'; ctx.fill(); ctx.lineWidth = 6; ctx.stroke();
    if (bl < 0.6) { ctx.beginPath(); ctx.arc(s * 62, 24, 11, 0, 7); ctx.fillStyle = '#05060c'; ctx.fill(); }
    ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(s * 100, -26); ctx.lineTo(s * 28, -20); ctx.stroke();
  }
  if (o.eyeGlow) { glow(ctx, -62, 20, 120, 'rgba(255,240,200,A)', 0.35 * o.eyeGlow); glow(ctx, 62, 20, 120, 'rgba(255,240,200,A)', 0.35 * o.eyeGlow); }
  ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(-14, 100); ctx.lineTo(10, 104); ctx.stroke();
  const sm = o.smile ?? 0.4;
  ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-70, 150); ctx.quadraticCurveTo(0, 150 + sm * 40, 70, 150); ctx.stroke();
  ctx.restore();
  ctx.restore();
}

// ---------- inside your booth, looking OUT through the glass ----------
// st: {out: 'cab'|'back'|'arm', pay, backX, backY, backS, blink, smile, tap 0..1 (knuckle on glass), crack, light, hand (your hand on the console), eyeGlow}
function drawGlass(ctx, t, st = {}) {
  const L = st.light ?? 1;
  // outside
  ctx.save(); ctx.beginPath(); ctx.rect(70, 300, 940, 1250); ctx.clip();
  if (st.out === 'back') {
    drawPlaza(ctx, t, { light: L * 0.8, driver: false, door: 1, me: null, barrier: 1, green: true });
    ctx.fillStyle = 'rgba(4,6,14,0.45)'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(st.backX ?? 540, st.backY ?? 1180); ctx.scale(st.backS ?? 1, st.backS ?? 1); manBack(ctx, t, st); ctx.restore();
  } else {
    ctx.save(); ctx.translate(540, 900); ctx.scale(1.9, 1.9); ctx.translate(-(DOOR.x0 + 200), -(G - 360));
    drawPlaza(ctx, t, { light: L, driver: true, pay: st.pay, blink: st.blink, me: null, barrier: st.barrier, green: st.green, eyeGlow: st.eyeGlow });
    ctx.restore();
  }
  ctx.restore();
  // glass: sheen, smudges, knuckle tap ripple
  ctx.save(); ctx.globalAlpha = 0.12; poly(ctx, [[160, 300], [330, 300], [120, 1550], [70, 1550]], '#ffffff'); poly(ctx, [[420, 300], [470, 300], [260, 1550], [230, 1550]], '#ffffff'); ctx.restore();
  if (st.tap > 0) { const k = st.tap; for (let i = 0; i < 3; i++) { const r = ((k * 3 + i / 3) % 1) * 160; ctx.strokeStyle = `rgba(220,235,255,${0.5 * (1 - r / 160)})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(st.tapX ?? 640, st.tapY ?? 760, r, 0, 7); ctx.stroke(); } }
  // booth frame (inside): warm lit walls, the window frame, the counter + the note taped to the glass
  ctx.fillStyle = mix('#151a2e', '#cdb98f', L * 0.85);
  ctx.fillRect(0, 0, W, 300); ctx.fillRect(0, 0, 70, H); ctx.fillRect(1010, 0, 70, H); ctx.fillRect(0, 1550, W, 400);
  ctx.lineWidth = 16; ctx.strokeStyle = '#0b1022'; ctx.strokeRect(70, 300, 940, 1250);
  ctx.fillStyle = mix('#0b1022', '#6d5f45', L); ctx.fillRect(0, 1550, W, 40);
  glow(ctx, 540, 120, 700, 'rgba(255,225,160,A)', 0.25 * L);
  // the note, taped at the top corner of the glass
  ctx.save(); ctx.translate(880, 400); ctx.rotate(0.06); ctx.fillStyle = '#efe6c8'; ctx.fillRect(-70, -50, 140, 110); ctx.fillStyle = 'rgba(20,26,54,0.6)'; for (let i = 0; i < 5; i++) ctx.fillRect(-56, -32 + i * 18, 110 - i * 10, 5); ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(-30, -58, 60, 16); ctx.restore();
}

// ---------- the console: big barrier button, your finger ----------
// st: {press 0..1, hover}
function drawConsole(ctx, t, st = {}) {
  ctx.fillStyle = '#20263e'; ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  const g = ctx.createRadialGradient(540, 900, 50, 540, 900, 900); g.addColorStop(0, '#4a5375'); g.addColorStop(1, '#141a30'); ctx.fillStyle = g; ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  rrect(ctx, 120, 560, 840, 760, 40); ctx.fillStyle = '#2d344e'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#0b1022'; ctx.stroke();
  ctx.font = '40px Mono700'; ctx.fillStyle = 'rgba(238,241,247,0.7)'; spaced(ctx, 'BARRIER · LANE 3', 540, 650, 4, 'center');
  const pr = clamp(st.press || 0);
  // UP button (green) + DOWN (red)
  ctx.save(); ctx.translate(380, 940);
  ctx.beginPath(); ctx.arc(0, 10, 150, 0, 7); ctx.fillStyle = '#0b1022'; ctx.fill();
  ctx.beginPath(); ctx.arc(0, pr * 10, 136, 0, 7); ctx.fillStyle = pr > 0.5 ? '#3dff6a' : '#1f9e40'; ctx.fill(); ctx.lineWidth = 6; ctx.stroke();
  if (pr > 0.5) glow(ctx, 0, 0, 300, 'rgba(60,255,110,A)', 0.5);
  ctx.fillStyle = '#0b1022'; poly(ctx, [[-50, 40 + pr * 10], [50, 40 + pr * 10], [0, -50 + pr * 10]]); ctx.fill();
  ctx.restore();
  ctx.font = '50px Osw700'; ctx.fillStyle = C.white; ctx.textAlign = 'center'; ctx.fillText('UP', 380, 1160);
  ctx.save(); ctx.translate(720, 940);
  ctx.beginPath(); ctx.arc(0, 10, 110, 0, 7); ctx.fillStyle = '#0b1022'; ctx.fill();
  ctx.beginPath(); ctx.arc(0, 0, 98, 0, 7); ctx.fillStyle = '#b3202e'; ctx.fill(); ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = '#0b1022'; poly(ctx, [[-36, -26], [36, -26], [0, 36]]); ctx.fill();
  ctx.restore();
  ctx.fillStyle = C.white; ctx.fillText('DOWN', 720, 1160);
  // your hand: white outline finger coming from the bottom
  const fy = lerp(1500, 960 + pr * 10, E.out(clamp(st.hand ?? 1)));
  const fx = 380 + (st.tremble ? Math.sin(t * 40) * 4 : 0);
  ctx.save(); ctx.translate(fx, fy);
  ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(-34, -40); ctx.quadraticCurveTo(-34, -80, 0, -80); ctx.quadraticCurveTo(34, -80, 34, -40); ctx.lineTo(34, 120); ctx.quadraticCurveTo(110, 120, 120, 200); ctx.lineTo(130, 900); ctx.lineTo(-160, 900); ctx.lineTo(-150, 220); ctx.quadraticCurveTo(-120, 120, -34, 110); ctx.closePath();
  ctx.fillStyle = C.navy1; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = C.white; ctx.stroke();
  ctx.fillStyle = VEST; ctx.fillRect(-170, 600, 310, 400);
  ctx.restore();
}

// ---------- the handover note: 2 rules ----------
const NOTE_RULES = [
  { y: 900, lines: ['ALWAYS LIFT', 'THE BARRIER.'] },
  { y: 1200, lines: ['NEVER LOOK IN', 'HIS MIRROR.'] },
];
function drawNote(ctx, t, st = {}) {
  ctx.fillStyle = '#2d344e'; ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  ctx.fillStyle = 'rgba(190,215,255,0.06)'; ctx.fillRect(-300, 300, 1700, 1300);
  ctx.save(); ctx.translate(540, 960); ctx.rotate(-0.02); ctx.translate(-540, -960);
  const x0 = 150, x1 = 930, y0 = 470, y1 = 1600;
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  ctx.fillStyle = '#efe6c8'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.save(); ctx.translate(540, y0); ctx.rotate(0.04); ctx.fillRect(-90, -24, 180, 48); ctx.restore();
  ctx.fillStyle = 'rgba(70,100,170,0.22)'; for (let y = y0 + 200; y < y1 - 30; y += 70) ctx.fillRect(x0 + 10, y, x1 - x0 - 20, 2);
  ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.font = '64px Osw700'; ctx.fillText('NIGHT TOLL · LANE 3', 540, 600);
  ctx.font = '30px Mono700'; spaced(ctx, 'FOR THE NEW TOLL MAN', 540, 660, 4, 'center');
  ctx.fillRect(300, 690, 480, 5);
  ctx.textAlign = 'left';
  NOTE_RULES.forEach((r, i) => {
    const hl = st.hl === i ? clamp(st.hlA ?? 1) : 0;
    if (hl > 0) { ctx.save(); ctx.globalAlpha = 0.55; ctx.fillStyle = C.lime; ctx.fillRect(x0 + 20, r.y - 70, 740 * hl, 180); ctx.restore(); }
    ctx.globalAlpha = (st.dim > 0 && st.hl !== i) ? 1 - 0.55 * st.dim : 1;
    ctx.fillStyle = INK; ctx.font = '90px Osw700'; ctx.fillText(`${i + 1}.`, x0 + 30, r.y + 10);
    ctx.font = '64px Inter700';
    r.lines.forEach((ln, k) => { ctx.fillStyle = k === 1 ? REDINK : INK; ctx.fillText(ln, x0 + 160, r.y + k * 86); });
    ctx.globalAlpha = 1;
  });
  ctx.font = '50px Inter700'; ctx.fillStyle = INK; ctx.fillText('— R.', x1 - 220, 1530);
  ctx.restore();
}

// ---------- the truck's side mirror, close: in it, your booth and you; your head turning around ----------
// st: {k 0..1 head turn, glow, fear}
function drawMirror(ctx, t, st = {}) {
  ctx.fillStyle = '#05060c'; ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  const g = ctx.createRadialGradient(540, 900, 100, 540, 900, 1100); g.addColorStop(0, '#2a3150'); g.addColorStop(1, '#05060c'); ctx.fillStyle = g; ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  // the cab's door edge on the right, bracket arm
  ctx.fillStyle = '#9a927e'; ctx.fillRect(900, -200, 400, 2400); ctx.fillStyle = '#0b1022'; ctx.fillRect(895, -200, 12, 2400);
  ctx.strokeStyle = '#141a30'; ctx.lineWidth = 40; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(900, 1100); ctx.lineTo(760, 1150); ctx.lineTo(760, 1260); ctx.stroke();
  // housing
  rrect(ctx, 190, 260, 600, 1100, 70); ctx.fillStyle = '#10142a'; ctx.fill(); ctx.lineWidth = 12; ctx.strokeStyle = '#0b1022'; ctx.stroke();
  // reflection (mirrored): your lit booth, you in it
  ctx.save(); rrect(ctx, 225, 295, 530, 1030, 50); ctx.clip();
  ctx.translate(490, 760); ctx.scale(-1, 1); ctx.scale(2.6, 2.6); ctx.translate(-BOOTH.meX, -(G - 40 - 372 + 70));
  drawPlaza(ctx, t, { light: 0.9, driver: false, door: 1, me: { face: { fear: st.fear ?? 0.9, look: 1 } }, meHead: st.k || 0, barrier: 1, green: true });
  ctx.restore();
  ctx.save(); rrect(ctx, 225, 295, 530, 1030, 50); ctx.clip();
  ctx.fillStyle = 'rgba(150,180,255,0.12)'; ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 0.18; poly(ctx, [[300, 295], [420, 295], [250, 1325], [225, 1325]], '#ffffff'); ctx.restore();
  if (st.glow) glow(ctx, 490, 800, 500, 'rgba(200,225,255,A)', 0.25 * st.glow);
  ctx.font = '26px Mono700'; ctx.fillStyle = 'rgba(238,241,247,0.5)'; spaced(ctx, 'OBJECTS IN MIRROR ARE CLOSER', 490, 1290, 2, 'center');
}

module.exports = { drawPlaza, drawGlass, drawConsole, drawNote, drawMirror, manSide, manBack, manSeated, meHead, darken, NOTE_RULES, BOOTH, G, CABX, DOOR, VEST };
