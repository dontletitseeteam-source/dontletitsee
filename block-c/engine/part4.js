// BLOCK C — Part 4 "Under the bed" shot list (branch A: you look under the bed; no votes -> the scarier branch)
// Test #3 (ANALYTICS): frame 1 = the threat MOVING + a max-6-word burned-in hook ("DON'T LOOK / UNDER HIS BED").
const { createCanvas } = require('@napi-rs/canvas');
const D = require('./draw');
const S = require('./scenes');
const X = require('./sets');
const { W, H, C, clamp, lerp, inv, E, hash, noise1, shake, rrect, spaced, camera } = D;

module.exports = function build(TL) {
const Ln = id => TL.lines[id - 1];
const Wd = (id, k) => Ln(id).words[k].start;
const R = X.listLayout();
const K = {
  look: Ln(2).start - 0.06, lookW: Wd(2, 4),
  kneel: Ln(3).start - 0.06, torchW: Wd(3, 6),
  hand: Ln(4).start - 0.06, darkW: Wd(4, 6),
  fast: Ln(5).start - 0.06, fastW: Wd(5, 0), lightW: Wd(5, 5),
  beam: Ln(6).start - 0.06, dust: Wd(6, 4), slipper: Wd(6, 5), plate: Wd(6, 8),
  shape: Ln(7).start - 0.06, shapeW: Wd(7, 2), kabirW: Wd(7, 7),
  long: Ln(8).start - 0.06, longW: Wd(8, 1),
  feetW: Ln(9).start - 0.06, headW: Wd(9, 7), hereW: Wd(9, 9),
  turned: Ln(10).start - 0.06, towardW: Wd(10, 1),
  noface: Ln(11).start - 0.06, faceW: Wd(11, 1), circleW: Wd(11, 6),
  whisper: Ln(12).start - 0.06, voiceW: Wd(12, 5),
  present: Ln(13).start - 0.04,
  dies: Ln(14).start - 0.06, diesW: Wd(14, 2),
  black: Ln(15).start - 0.06,
  count: Ln(16).start - 0.06, c1: Wd(16, 2), c2: Wd(16, 3), c3: Wd(16, 4),
  back: Ln(17).start - 0.06, nothingW: Wd(17, 4),
  number: Ln(18).start - 0.06, scratchW: Wd(18, 3),
  n43: Ln(19).start - 0.04,
  phone: Ln(20).start - 0.06, phoneW: Wd(20, 3),
  t259: Ln(21).start - 0.06,
  gone: Ln(22).start - 0.06, goneW: Wd(22, 2),
  bell: Ln(23).start - 0.06, bellW: Wd(23, 2),
  mess: Ln(24).start - 0.06, threeW: Wd(24, 3),
  doors: Ln(25).start - 0.06, onceW: Wd(25, 6),
  steps: Ln(26).start - 0.06, stepsW: Wd(26, 0), nobodyW: Wd(26, 8),
  rule: Ln(27).start - 0.06, notYou: Wd(27, 10),
  buzz: Ln(28).start - 0.06, buzzW: Wd(28, 2), m1: Wd(28, 4), m2: Wd(28, 6),
  told: Ln(29).start - 0.06, voices: Ln(30).start - 0.05, voicesW: Wd(30, 2),
  choice: Ln(31).start - 0.1, optA: Wd(32, 0), optB: Wd(33, 0), cta: Ln(34).start, ctaA: Wd(34, 1), ctaB: Wd(34, 3),
};

// ---------- HUD ----------
function hudState(t) {
  const time = t < K.torchW ? '1:05' : t < K.t259 ? '1:06' : t < K.threeW ? '2:59' : '3:00';
  const blink = (t0) => t < t0 + 0.6 ? (Math.floor(t * 12) % 2 ? C.red : C.white) : C.red;
  let r4 = ['UNDER BED', 'BREATHING', C.red];
  if (t >= K.shape) r4 = ['UNDER BED', 'NOT KABIR', blink(K.shape)];
  if (t >= K.nothingW) r4 = ['UNDER BED', 'EMPTY', t < K.nothingW + 0.6 ? blink(K.nothingW) : C.lime];
  if (t >= K.goneW) r4 = ['LOST TIME', '1 H 53 M', blink(K.goneW)];
  if (t >= K.bellW) r4 = ['MESS', 'OPEN', blink(K.bellW)];
  if (t >= K.m1) r4 = ['KABIR', 'WASHROOM?', t < K.m1 + 0.6 ? blink(K.m1) : C.lime];
  if (t >= K.voicesW) r4 = ['KABIR', 'VOICE?', blink(K.voicesW)];
  return {
    t, part: 'PART 4', time, ampm: 'AM',
    rows: [t >= K.t259 ? ['BATTERY', '19%', C.red] : ['BATTERY', t < K.torchW ? '26%' : '25%'],
      ['ROOM', '13 · LEFT', C.red],
      ['HEADCOUNT', '43', t >= K.n43 && t < K.n43 + 0.6 ? blink(K.n43) : C.red],
      r4],
  };
}

const shots = [];
const shot = (name, start, draw, meta) => shots.push({ name, start, draw, meta });
const hudShade = (ctx, a = 0.85) => { const g = ctx.createRadialGradient(170, 250, 60, 170, 250, 560); g.addColorStop(0, `rgba(2,3,8,${a})`); g.addColorStop(1, 'rgba(2,3,8,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 760, 820); };
const capShade = (ctx, a = 0.72) => { const g = ctx.createLinearGradient(0, 1250, 0, 1720); g.addColorStop(0, 'rgba(2,3,8,0)'); g.addColorStop(0.35, `rgba(2,3,8,${a})`); g.addColorStop(0.75, `rgba(2,3,8,${a})`); g.addColorStop(1, 'rgba(2,3,8,0)'); ctx.fillStyle = g; ctx.fillRect(0, 1250, W, 470); };
const redPulse = (ctx, a) => { if (a < 0.01) return; const g = ctx.createRadialGradient(540, 960, 300, 540, 960, 1200); g.addColorStop(0, 'rgba(255,40,60,0)'); g.addColorStop(1, `rgba(255,40,60,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
const flash = (ctx, t, t0, a = 0.8) => { if (t < t0 || t > t0 + 0.4) return; ctx.fillStyle = `rgba(235,240,255,${a * (1 - (t - t0) / 0.4)})`; ctx.fillRect(0, 0, W, H); };
const UB = (ctx, t, st) => X.drawUnderBed(ctx, t, st);

// 1. HOOK (frame 1, moving): the pale hand already crawling out at you, fast push-in, shake
shot('hook', 0, (ctx, t, lt) => {
  const z = lerp(1.35, 1.75, E.out(clamp(t / 3.0)));
  const [sx, sy] = shake(t, 0, 14, 0.6);
  const h = lerp(0.35, 1, E.out(clamp(t / 2.4)));
  ctx.save(); camera(ctx, 560, lerp(1080, 1170, E.out(clamp(t / 3))), z, sx + Math.sin(t * 9) * 3, sy);
  UB(ctx, t, { breath: 1.4, hand: h });
  ctx.restore();
  redPulse(ctx, 0.22 + 0.12 * Math.sin(t * 6));
}, { vignette: 0.8 });
// 2. And you're going to look. — wide, the hand resting on the floor (recap stamp over it)
shot('look', K.look, (ctx, t, lt) => {
  const k = E.sine(clamp(lt / (K.kneel - K.look)));
  ctx.save(); camera(ctx, 540, lerp(980, 960, k), lerp(1.0, 0.92, k));
  UB(ctx, t, { breath: 1, hand: 1 });
  ctx.restore();
  if (t > K.lookW) redPulse(ctx, 0.25 * Math.exp(-(t - K.lookW) * 2.5));
}, { vignette: 0.75 });
// 3. You kneel on the cold floor. Torch on. — dropping to floor level, click
shot('kneel', K.kneel, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.torchW - K.kneel)));
  const tr = t > K.torchW ? E.out(clamp((t - K.torchW) / 0.15)) : 0;
  ctx.save(); camera(ctx, 540, lerp(820, 1000, k), lerp(0.95, 1.15, k));
  UB(ctx, t, { breath: 1, hand: 1, torch: tr, tx: 560, ty: 1120, tr: 360 });
  ctx.restore();
  flash(ctx, t, K.torchW, 0.55);
}, { vignette: 0.75 });
// 4. The hand slides back into the dark. 5. Fast. Like it knows the light.
shot('hand', K.hand, (ctx, t, lt) => {
  const h = 1 - E.in(inv(K.hand + 0.25, K.darkW + 0.1, t));
  const [sx, sy] = shake(t, K.fastW, 18, 0.4);
  const k = E.sine(clamp(lt / (K.beam - K.hand)));
  const tx = t < K.fast ? 560 : lerp(560, 640, E.inOut(inv(K.fast, K.lightW + 0.3, t)));
  ctx.save(); camera(ctx, 560, lerp(1050, 1020, k), lerp(1.3, 1.4, k), sx, sy);
  UB(ctx, t, { breath: 1, hand: h, torch: 1, tx, ty: 1110, tr: 360 });
  ctx.restore();
  if (t > K.fastW) redPulse(ctx, 0.22 * Math.exp(-(t - K.fastW) * 3));
}, { vignette: 0.75 });
// 6. The beam crawls in. Dust. One slipper. A steel mess plate. — the beam sweeps left to right
shot('beam', K.beam, (ctx, t, lt) => {
  let tx = lerp(600, 420, E.inOut(inv(K.beam, K.dust, t)));
  if (t > K.dust) tx = lerp(420, 220, E.inOut(inv(K.dust, K.slipper + 0.2, t)));
  if (t > K.slipper + 0.2) tx = lerp(220, 860, E.inOut(inv(K.slipper + 0.2, K.plate + 0.1, t)));
  const ty = lerp(1000, 1110, E.out(inv(K.beam, K.dust + 0.3, t)));
  const cx = lerp(540, tx, 0.5);
  ctx.save(); camera(ctx, cx, 1040, 1.45);
  UB(ctx, t, { breath: 0.6, torch: 1, items: 1, tx, ty, tr: 330 });
  ctx.restore();
  if (t > K.plate) redPulse(ctx, 0.12 * Math.exp(-(t - K.plate) * 3));
}, { vignette: 0.75 });
// 7. Then a shape, lying flat, wrapped in Kabir's blanket.
shot('shape', K.shape, (ctx, t, lt) => {
  const k = E.inOut(inv(K.shape + 0.1, K.kabirW, t));
  const tx = lerp(860, 420, k), ty = lerp(1110, 1030, k);
  const [sx, sy] = shake(t, K.shapeW, 16, 0.4);
  ctx.save(); camera(ctx, lerp(700, 520, k), lerp(1060, 1030, k), lerp(1.45, 1.3, k), sx, sy);
  UB(ctx, t, { breath: 1, torch: 1, items: 1, shape: 1, tx, ty, tr: 360 });
  ctx.restore();
  if (t > K.shapeW) redPulse(ctx, 0.25 * Math.exp(-(t - K.shapeW) * 2.5));
}, { vignette: 0.75 });
// 8. Too long to be a person. — pull back: it runs past the bed's end, into the wall
shot('long', K.long, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.feetW - K.long)));
  ctx.save(); camera(ctx, lerp(620, 600, k), lerp(1010, 980, k), lerp(1.3, 0.95, k));
  UB(ctx, t, { breath: 1, torch: 1, items: 1, shape: 1, tx: lerp(600, 760, k), ty: lerp(990, 930, k), tr: lerp(360, 560, k) });
  ctx.restore();
  if (t > K.longW) redPulse(ctx, 0.2 * Math.exp(-(t - K.longW) * 2.5));
}, { vignette: 0.75 });
// 9. Its feet reach the far wall. Its head is right here. — torch slides along it to the head
shot('feet', K.feetW, (ctx, t, lt) => {
  const k = E.inOut(inv(K.headW - 0.6, K.hereW + 0.2, t));
  const tx = lerp(1000, 230, k), ty = lerp(880, 1080, k);
  const [sx, sy] = shake(t, K.hereW, 18, 0.4);
  ctx.save(); camera(ctx, lerp(880, 300, k), lerp(900, 1070, k), lerp(1.6, 2.0, k), sx, sy);
  UB(ctx, t, { breath: 1, torch: 1, items: 1, shape: 1, tx, ty, tr: 340 });
  ctx.restore();
  if (t > K.hereW) redPulse(ctx, 0.3 * Math.exp(-(t - K.hereW) * 2.5));
}, { vignette: 0.8 });
// 10. Turned toward you. — the head turns
shot('turned', K.turned, (ctx, t, lt) => {
  const ht = E.inOut(inv(K.turned + 0.15, K.towardW + 0.5, t));
  ctx.save(); camera(ctx, 280, 1075, lerp(2.2, 2.6, E.sine(clamp(lt / 1.6))));
  UB(ctx, t, { breath: 0.5, torch: 1, items: 1, shape: 1, headTurn: ht, tx: 230, ty: 1080, tr: 320 });
  ctx.restore();
}, { vignette: 0.85 });
// 11. No face. Just a smooth, pale circle. — extreme close-up
shot('noface', K.noface, (ctx, t, lt) => {
  const k = E.sine(clamp(lt / (K.whisper - K.noface)));
  const [sx, sy] = shake(t, K.faceW, 22, 0.45);
  ctx.save(); camera(ctx, 210, 1088, lerp(3.4, 4.0, k), sx, sy);
  UB(ctx, t, { breath: 0.3, torch: 1, items: 1, shape: 1, headTurn: 1, tx: 205, ty: 1088, tr: 300 });
  ctx.restore();
  if (t > K.faceW) redPulse(ctx, 0.35 * Math.exp(-(t - K.faceW) * 2));
}, { vignette: 0.85 });
// 12. Then it whispers, in your voice. — voice match (callback to Part 3)
shot('whisper', K.whisper, (ctx, t, lt) => {
  ctx.save(); camera(ctx, 260, 1080, 2.4);
  UB(ctx, t, { breath: 0.3, torch: 1, items: 1, shape: 1, headTurn: 1, tx: 205, ty: 1088, tr: 300 });
  ctx.restore();
  ctx.fillStyle = 'rgba(2,3,8,0.6)'; ctx.fillRect(0, 0, W, H);
  const a = clamp(lt / 0.4);
  ctx.save(); ctx.globalAlpha = a * 0.9; ctx.strokeStyle = t > K.voiceW ? C.red : 'rgba(220,232,255,0.85)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  for (let i = 0; i < 44; i++) {
    const x = 160 + i * 18; const amp = (0.2 + noise1(i * 0.7 + t * 7) * 0.7) * 90 * (0.5 + 0.5 * Math.sin(i / 43 * Math.PI));
    ctx.beginPath(); ctx.moveTo(x, 860 - amp); ctx.lineTo(x, 860 + amp); ctx.stroke();
  }
  ctx.font = '26px Mono700'; ctx.fillStyle = 'rgba(238,241,247,0.75)';
  spaced(ctx, t > K.voiceW ? 'VOICE MATCH · YOU · 100%' : 'MATCHING VOICE…', 540, 1040, 4, 'center');
  ctx.restore();
  if (t > K.voiceW) redPulse(ctx, 0.25 * Math.exp(-(t - K.voiceW) * 2));
});
// 13. Present. — slam back to the face, red
shot('present', K.present, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.present + 0.05, 26, 0.5);
  ctx.save(); camera(ctx, 210, 1088, lerp(4.4, 4.1, E.out(clamp(lt / 0.6))), sx, sy);
  UB(ctx, t, { breath: 0, torch: 1, items: 1, shape: 1, headTurn: 1, tx: 205, ty: 1088, tr: 300 });
  ctx.restore();
  ctx.fillStyle = 'rgba(160,10,25,0.25)'; ctx.fillRect(0, 0, W, H);
  redPulse(ctx, 0.5 * Math.exp(-lt * 1.5));
}, { vignette: 0.85 });
// 14. Your torch dies. 15. Black. 16. You count. One. Two. Three.
shot('dies', K.dies, (ctx, t, lt) => {
  const off = t > K.diesW ? 1 : 0;
  const fl = t < K.diesW ? (noise1(t * 25) > 0.45 ? 1 : 0.25) : 0;
  ctx.save(); camera(ctx, 300, 1060, 2.0);
  UB(ctx, t, { breath: 0.5, torch: off ? 0 : fl, items: 1, shape: 1, headTurn: 1, tx: 220, ty: 1080, tr: 320 });
  ctx.restore();
  if (off) { ctx.fillStyle = 'rgba(0,0,2,0.94)'; ctx.fillRect(0, 0, W, H); }
}, { vignette: 0.9 });
shot('black', K.black, (ctx, t, lt) => {
  ctx.save(); camera(ctx, 540, 1000, 1.0);
  UB(ctx, t, { breath: 1.2, dark: 0.86 });
  ctx.restore();
  // your heartbeat on each count
  for (const c of [K.c1, K.c2, K.c3]) if (t > c) redPulse(ctx, 0.3 * Math.exp(-(t - c) * 3));
}, { vignette: 0.9 });
// 17. The light comes back. Nothing under the bed.
shot('back', K.back, (ctx, t, lt) => {
  const tr = t < K.back + 0.5 ? (noise1(t * 30) > 0.5 ? 1 : 0.15) : 1;
  const k = E.sine(clamp(lt / (K.number - K.back)));
  ctx.save(); camera(ctx, 540, 1040, lerp(1.25, 1.1, k));
  UB(ctx, t, { breath: 0, torch: tr, items: 1, shape: 0, tx: lerp(300, 700, k), ty: 1040, tr: 420 });
  ctx.restore();
  flash(ctx, t, K.back + 0.5, 0.3);
}, { vignette: 0.75 });
// 18. Only a number, scratched deep into the floor. 19. Forty-three.
shot('number', K.number, (ctx, t, lt) => {
  const sc = E.inOut(inv(K.scratchW - 0.1, K.n43 - 0.1, t));
  const k = E.sine(clamp(lt / (K.phone - K.number)));
  const [sx, sy] = shake(t, K.n43, 24, 0.5);
  ctx.save(); camera(ctx, 540, lerp(1080, 1060, k), lerp(1.6, 2.1, k), sx, sy);
  UB(ctx, t, { breath: 0, torch: 1, items: 1, shape: 0, scratch: Math.max(0.05, sc), tx: 540, ty: 1060, tr: 380 });
  ctx.restore();
  if (t > K.n43) redPulse(ctx, 0.4 * Math.exp(-(t - K.n43) * 1.8));
}, { vignette: 0.8 });
// 20-22. Phone: 2:59 (two hours gone)
const roomBG = (ctx, t) => {
  ctx.fillStyle = '#070a16'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.filter = 'blur(26px)'; ctx.globalAlpha = 0.8; camera(ctx, 540, 1000, 1.0); UB(ctx, t, { torch: 1, items: 1, tx: 540, ty: 1060 }); ctx.restore();
  ctx.fillStyle = 'rgba(3,4,10,0.45)'; ctx.fillRect(0, 0, W, H);
};
shot('phone', K.phone, (ctx, t, lt) => {
  const time = t < K.t259 + 0.1 ? '1:06' : '2:59';
  const z = lerp(1.05, 1.25, E.sine(clamp(lt / (K.bell - K.phone))));
  const glitch = t > K.t259 && t < K.t259 + 0.35;
  S.drawPhone(ctx, t, { screen: 'lock', time, date: 'Sunday, November 15', bg: roomBG, scale: z + (glitch ? (hash(Math.floor(t * 60)) - 0.5) * 0.03 : 0) });
  if (glitch) { ctx.fillStyle = 'rgba(255,40,60,0.18)'; ctx.fillRect(0, (hash(Math.floor(t * 40)) * H) | 0, W, 90); }
  if (t > K.t259 + 0.1) redPulse(ctx, 0.3 * Math.exp(-(t - K.t259 - 0.1) * 2));
  if (t > K.goneW) redPulse(ctx, 0.25 * Math.exp(-(t - K.goneW) * 2));
}, { vignette: 0.6 });
// 23. Then the bell. — the room door, the bell shakes the frame, corridor light snaps on under it
shot('bell', K.bell, (ctx, t, lt) => {
  const on = t > K.bellW ? 1 : 0.15;
  const ring = t > K.bellW ? Math.sin((t - K.bellW) * 60) * 8 * Math.exp(-(t - K.bellW) * 1.2) : 0;
  ctx.save(); camera(ctx, 540, 1000, lerp(0.95, 1.05, clamp(lt / 1.5)), ring, ring * 0.4);
  X.drawDoorGap(ctx, t, { light: on, handle: 0 });
  ctx.restore();
  flash(ctx, t, K.bellW, 0.45);
}, { vignette: 0.7 });
// 24. The mess bell. Three o'clock. — the corridor, lights stuttering on
shot('mess', K.mess, (ctx, t, lt) => {
  const L = [0, 1, 2, 3, 4].map(i => t > K.mess + 0.15 * i ? (noise1(t * 20 + i) > 0.3 ? 1 : 0.2) : 0);
  const ring = Math.sin(t * 55) * 5 * Math.exp(-lt * 0.8);
  ctx.save(); camera(ctx, 540, 880, lerp(1.0, 1.15, E.sine(clamp(lt / 2))), ring, 0);
  X.drawHostelCorridor(ctx, t, { lights: L, moon: 0.6 });
  ctx.restore();
  if (t > K.threeW) redPulse(ctx, 0.25 * Math.exp(-(t - K.threeW) * 2));
});
// 25. Every door in Block C opens at once. — every room glows at the same instant
shot('doors', K.doors, (ctx, t, lt) => {
  const g = t > K.onceW - 0.05 ? 1 : 0;
  const glowD = { 9: g, 10: g, 11: g, 12: g, 14: g, 13: 0 };
  const [sx, sy] = shake(t, K.onceW, 20, 0.45);
  ctx.save(); camera(ctx, 540, 900, lerp(1.25, 1.05, E.sine(clamp(lt / (K.steps - K.doors)))), sx, sy);
  X.drawHostelCorridor(ctx, t, { lights: [1, 1, 1, 1, 1], doorGlow: glowD, moon: 0.5 });
  ctx.restore();
  flash(ctx, t, K.onceW, 0.35);
});
// 26. Footsteps. All of them, walking to the mess. Nobody talking. — feet pass your door, endless
shot('steps', K.steps, (ctx, t, lt) => {
  const walkers = []; for (let i = 0; i < 12; i++) walkers.push(-200 + ((lt * 260 + i * 330) % 1500));
  ctx.save(); camera(ctx, 540, 1180, lerp(1.25, 1.4, E.sine(clamp(lt / (K.rule - K.steps)))));
  X.drawDoorGap(ctx, t, { light: 1, walkers });
  ctx.restore();
  if (t > K.nobodyW) redPulse(ctx, 0.18 * Math.exp(-(t - K.nobodyW) * 2));
}, { vignette: 0.75 });
// 27. Rule four
shot('rule', K.rule, (ctx, t, lt) => {
  const y4 = R[3].y + 40;
  const z = lerp(1.25, 1.5, E.sine(clamp(lt / (K.buzz - K.rule)))) * 0.84;
  const [sx, sy] = shake(t, K.notYou, 22, 0.45);
  ctx.save(); camera(ctx, 556, y4 + 170 / z, z, sx, sy);
  X.drawList(ctx, t, { hl: 3, hlA: E.out(inv(K.rule + 0.1, K.rule + 0.7, t)), done: 3, tx: 520 + (noise1(t) - 0.5) * 40, ty: y4 + 60, tr: 600, dark: 0.9 });
  ctx.restore();
  capShade(ctx); hudShade(ctx);
  if (t > K.notYou) redPulse(ctx, 0.3 * Math.exp(-(t - K.notYou) * 2.5));
});
// 28-30. Kabir: "washroom. now." — and his own warning from 12:58, ringed in red
const chatBG = (ctx, t) => {
  ctx.fillStyle = '#070a16'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.filter = 'blur(26px)'; ctx.globalAlpha = 0.8; camera(ctx, 540, 1100, 1.0); X.drawDoorGap(ctx, t, { light: 1 }); ctx.restore();
  ctx.fillStyle = 'rgba(3,4,10,0.4)'; ctx.fillRect(0, 0, W, H);
};
const kMsgs = (t) => [
  { from: 'Kabir', col: '#9fe870', text: 'don\'t open the door for anyone. it does voices.', a: 1, time: '1:05 AM', fg: t > K.voices ? '#ff9aa5' : '#f0f2f8' },
  { from: 'Kabir', col: '#9fe870', text: 'washroom. now.', a: (t - K.m1) / 0.25, time: '3:00 AM' },
  { from: 'Kabir', col: '#9fe870', text: 'don\'t go with them', a: (t - K.m2) / 0.25, time: '3:00 AM' },
];
shot('chat', K.buzz, (ctx, t, lt) => {
  const b = t - K.buzzW; const buzzing = b > 0 && b < 0.35;
  const sh = buzzing ? (hash(Math.floor(t * 60)) - 0.5) * 0.02 : 0;
  const z = t < K.voices ? lerp(1.05, 1.12, E.sine(clamp(lt / (K.voices - K.buzz)))) + sh : lerp(1.12, 1.45, E.inOut(clamp((t - K.voices) / 0.9)));
  const [sx, sy] = shake(t, K.voicesW, 14, 0.4);
  X.drawGroupChat(ctx, t, { name: 'Kabir', initial: 'K', sub: 'online', scale: z, shake: [sx, sy], bg: chatBG, msgs: kMsgs(t) });
  if (t > K.told) {
    const a = clamp((t - K.told) / 0.3);
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = C.red; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.ellipse(470, 795, 380, 125, -0.04, 0, Math.PI * 2 * clamp((t - K.told) / 0.6)); ctx.stroke(); ctx.restore();
  }
  if (t > K.voicesW) redPulse(ctx, 0.3 * Math.exp(-(t - K.voicesW) * 2));
});
// 31-34. Choice card over the feet passing the door
let choiceBG = null;
shot('choice', K.choice, (ctx, t, lt) => {
  const walkers = []; for (let i = 0; i < 12; i++) walkers.push(-200 + ((t * 260 + i * 330) % 1500));
  ctx.save(); ctx.filter = `blur(${(9 * clamp(lt / 0.4)).toFixed(1)}px)`;
  ctx.save(); camera(ctx, 540, 1180, 1.3); X.drawDoorGap(ctx, t, { light: 1, walkers }); ctx.restore();
  ctx.restore();
  ctx.fillStyle = `rgba(3,5,12,${0.72 * clamp(lt / 0.35)})`; ctx.fillRect(0, 0, W, H);
  const q = ['WHAT', 'DO', 'YOU', 'DO?'];
  ctx.save(); ctx.font = '124px Osw700'; ctx.textBaseline = 'middle';
  const sp = 30; const ws = q.map(w => ctx.measureText(w).width); const tot = ws.reduce((a, b) => a + b, 0) + sp * 3;
  let x = 540 - tot / 2;
  q.forEach((w, i) => {
    const a = clamp((t - Wd(31, i) + 0.03) / 0.12);
    if (a > 0) { ctx.save(); ctx.globalAlpha = a; const s = lerp(1.3, 1, E.outBack(a)); ctx.translate(x + ws[i] / 2, 720); ctx.scale(s, s); ctx.fillStyle = C.white; ctx.textAlign = 'center'; ctx.fillText(w, 0, 0); ctx.restore(); }
    x += ws[i] + sp;
  });
  ctx.restore();
  const opt = (letter, label, y, ta, tEnd, sub) => {
    const a = E.out(clamp((t - ta + 0.05) / 0.3)); if (a <= 0) return;
    const live = t >= ta - 0.05 && t < tEnd;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(lerp(-60, 0, a), 0);
    const s = live ? 1.04 : 1; ctx.translate(540, y); ctx.scale(s, s); ctx.translate(-540, -y);
    rrect(ctx, 130, y - 70, 820, 140, 26); ctx.fillStyle = live ? 'rgba(30,40,24,0.9)' : 'rgba(18,24,48,0.85)'; ctx.fill();
    ctx.lineWidth = live ? 6 : 3; ctx.strokeStyle = live ? C.lime : 'rgba(238,241,247,0.75)'; ctx.stroke();
    ctx.beginPath(); ctx.arc(214, y, 44, 0, 7); ctx.fillStyle = live ? C.lime : C.white; ctx.fill();
    ctx.font = '58px Osw700'; ctx.fillStyle = '#0b1022'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(letter, 214, y + 2);
    ctx.textAlign = 'left'; ctx.fillStyle = C.white; ctx.font = (label.length > 20 ? '52px' : '60px') + ' Osw700'; ctx.fillText(label, 286, y - 4);
    ctx.font = '23px Mono500'; ctx.fillStyle = 'rgba(238,241,247,0.55)'; spaced(ctx, sub, 288, y + 40, 1.5);
    ctx.restore();
  };
  opt('A', 'FOLLOW THEM TO THE MESS', 960, K.optA, K.optB - 0.1, 'RULE 4: NOT FOR YOU');
  opt('B', 'HIDE IN THE WASHROOM', 1150, K.optB, K.cta - 0.1, 'IF THAT IS REALLY KABIR');
  const ca = clamp((t - K.cta + 0.05) / 0.2);
  if (ca > 0) {
    ctx.save(); ctx.globalAlpha = ca; ctx.textBaseline = 'middle'; ctx.font = '80px Osw700';
    const pa = t > K.ctaA ? Math.exp(-(t - K.ctaA) * 5) : 0, pb = t > K.ctaB ? Math.exp(-(t - K.ctaB) * 5) : 0;
    const parts = [['COMMENT ', C.white, 0], ['A', C.lime, pa], [' OR ', C.white, 0], ['B', C.lime, pb]];
    const tw = parts.reduce((s, [p]) => s + ctx.measureText(p).width, 0);
    let xx = 540 - tw / 2;
    for (const [p, c, pop] of parts) {
      const w = ctx.measureText(p).width;
      ctx.save(); ctx.translate(xx + w / 2, 1350); ctx.scale(1 + 0.35 * pop, 1 + 0.35 * pop); ctx.fillStyle = c; ctx.textAlign = 'center'; ctx.fillText(p, 0, 0); ctx.restore();
      xx += w;
    }
    const by = 1440 + Math.sin(t * 6) * 10;
    ctx.strokeStyle = C.lime; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(540, by); ctx.lineTo(540, by + 60); ctx.moveTo(510, by + 32); ctx.lineTo(540, by + 62); ctx.lineTo(570, by + 32); ctx.stroke();
    ctx.font = '24px Mono500'; ctx.fillStyle = 'rgba(238,241,247,0.55)'; ctx.textAlign = 'center';
    spaced(ctx, 'MOST VOTES DECIDE PART 5 · TOMORROW 3 PM', 540, 1580, 3, 'center');
    ctx.restore();
  }
}, { captions: false, vignette: 0.4 });

// ---------- overlay: short burned-in hook (frame 1, max 6 words) + recap stamp ----------
function overlay(ctx, t) {
  const ha = t < 2.7 ? 1 : clamp(1 - (t - 2.7) / 0.35);
  if (ha > 0) {
    const pop = lerp(1.15, 1, E.outBack(clamp(t / 0.35)));
    ctx.save(); ctx.globalAlpha = ha; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.translate(540, 700); ctx.scale(pop, pop); ctx.translate(-540, -700);
    ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 28;
    ctx.font = '150px Osw700'; ctx.fillStyle = C.white; ctx.fillText('DON\'T LOOK', 540, 660);
    ctx.font = '118px Osw700'; ctx.fillStyle = C.red; ctx.fillText('UNDER HIS BED', 540, 790);
    ctx.restore();
  }
  const r0 = K.look + 0.05, r1 = K.torchW - 0.2;
  if (t > r0 && t < r1 + 0.3) {
    const a = clamp((t - r0) / 0.18) * clamp((r1 + 0.3 - t) / 0.3);
    const s = lerp(1.4, 1, E.outBack(clamp((t - r0) / 0.3)));
    ctx.save(); ctx.globalAlpha = a; ctx.translate(540, 520); ctx.rotate(-0.06); ctx.scale(s, s);
    rrect(ctx, -280, -70, 560, 140, 18); ctx.fillStyle = 'rgba(8,12,26,0.82)'; ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = C.lime; ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.lime;
    ctx.font = '70px Osw700'; ctx.fillText('YOU CHOSE A', 0, -8);
    ctx.font = '22px Mono700'; ctx.fillStyle = 'rgba(238,241,247,0.8)'; spaced(ctx, 'YOU LOOKED UNDER THE BED', 0, 46, 3, 'center');
    ctx.restore();
  }
}

shots.sort((a, b) => a.start - b.start);
return { shots, K, hudState, overlay, coverTitle: 'NO [FACE]', coverSize: 112 };
};
