// BLOCK C — Part 5 "The mess at 3 AM" shot list (branch A: you follow them to the mess; no votes -> the scarier branch)
// Test #4 (ANALYTICS): frame 1 = a BRIGHT, recognizable wide set (the lit mess hall, 40 students eating in unison), small hook.
const D = require('./draw');
const S = require('./scenes');
const X = require('./sets');
const { W, H, C, clamp, lerp, inv, E, hash, noise1, shake, rrect, spaced, camera } = D;

module.exports = function build(TL) {
const Ln = id => TL.lines[id - 1];
const Wd = (id, k) => Ln(id).words[k].start;
const R = X.listLayout();
const [EX, EY, ES] = X.messEmpty();
const K = {
  chair: Ln(2).start - 0.06, chairW: Wd(2, 2),
  stairs: Ln(3).start - 0.06,
  backs: Ln(4).start - 0.06, spokeW: Wd(4, 4),
  lights: Ln(5).start - 0.06, onW: Wd(5, 5),
  plates: Ln(6).start - 0.06, rice: Wd(6, 5), dal: Wd(6, 6), steamW: Wd(6, 7),
  straight: Ln(7).start - 0.06, straightW: Wd(7, 3),
  lift1: Wd(8, 1), down1: Wd(8, 4), lift2: Wd(8, 6), down2: Wd(8, 7), spoon: Ln(8).start - 0.06,
  chew: Ln(9).start - 0.06, chewW: Wd(9, 2),
  practise: Ln(10).start - 0.06, practiseW: Wd(10, 2),
  counter: Ln(11).start - 0.06, tallW: Wd(11, 4),
  coat: Ln(12).start - 0.06, regW: Wd(12, 3),
  warden: Ln(13).start - 0.06, wardenW: Wd(13, 1),
  empty: Ln(14).start - 0.06, emptyW: Wd(14, 8),
  plate: Ln(15).start - 0.06, cardW: Wd(15, 4),
  room: Ln(16).start - 0.04, roomW: Wd(16, 1),
  date: Ln(17).start - 0.06, dateW: Wd(17, 2), tomW: Wd(17, 3),
  rule: Ln(18).start - 0.06, someoneW: Wd(18, 8),
  notYou: Ln(19).start - 0.04, whyW: Wd(19, 4), hereW: Wd(19, 8),
  sit: Ln(20).start - 0.06,
  stop: Ln(21).start - 0.06, stopW: Wd(21, 3),
  turn: Ln(22).start - 0.06, turnW: Wd(22, 2), onceW: Wd(22, 4),
  toward: Ln(23).start - 0.04,
  reg: Ln(24).start - 0.06, regOpenW: Wd(24, 2),
  pen: Ln(25).start - 0.06, penW: Wd(25, 3), rowW: Wd(25, 6),
  buzz: Ln(26).start - 0.06, buzzW: Wd(26, 2),
  group: Ln(27).start - 0.06, n43W: Wd(27, 4),
  rule5: Ln(28).start - 0.06, leaveW: Wd(28, 6),
  typing: Ln(29).start - 0.06, typingW: Wd(29, 5),
  now: Ln(30).start - 0.04,
  choice: Ln(31).start - 0.1, optA: Wd(32, 0), optB: Wd(33, 0), cta: Ln(34).start, ctaA: Wd(34, 1), ctaB: Wd(34, 3),
};

// spoons: everyone in unison (slow), driven by the words in line 8, frozen from "spoon stops"
function liftAt(t) {
  let v = 0.5 + 0.5 * Math.sin(t * 2.4 - 1.2);
  if (t > K.spoon && t < K.chew) {
    const k = (a, b) => E.inOut(inv(a - 0.12, b, t));
    v = 0.15 + 0.85 * (k(K.lift1, K.lift1 + 0.45) - k(K.down1, K.down1 + 0.4) + k(K.lift2, K.lift2 + 0.35) - k(K.down2, K.down2 + 0.35));
  }
  if (t > K.practise) v = 0.5 + 0.5 * Math.sin(t * 5.2);
  return clamp(v);
}
const lift = t => () => liftAt(t);
const stopAt = t => E.out(inv(K.stopW - 0.05, K.stopW + 0.12, t));
const turnAt = t => E.inOut(inv(K.turnW - 0.1, K.onceW + 0.1, t));

// ---------- HUD ----------
function hudState(t) {
  const time = t < K.empty ? '3:00' : '3:01';
  const blink = (t0) => t < t0 + 0.6 ? (Math.floor(t * 12) % 2 ? C.red : C.white) : C.red;
  let r4 = ['MESS', 'OPEN', C.red];
  if (t >= K.straight) r4 = ['SPOONS', 'IN SYNC', blink(K.straight)];
  if (t >= K.tallW) r4 = ['SERVING', 'WARDEN', blink(K.tallW)];
  if (t >= K.empty) r4 = ['EMPTY CHAIR', '1', t < K.empty + 0.6 ? blink(K.empty) : C.lime];
  if (t >= K.roomW) r4 = ['PLATE', 'ROOM 13', t < K.roomW + 0.6 ? blink(K.roomW) : C.lime];
  if (t >= K.tomW) r4 = ['PLATE DATE', '16 / 11', blink(K.tomW)];
  if (t >= K.turnW) r4 = ['HEADS', 'TURNED', blink(K.turnW)];
  if (t >= K.n43W) r4 = ['GROUP', '43 MEMBERS', blink(K.n43W)];
  if (t >= K.typingW) r4 = ['MEMBER 43', 'TYPING…', blink(K.typingW)];
  return {
    t, part: 'PART 5', time, ampm: 'AM',
    rows: [t >= K.buzz ? ['BATTERY', '18%', C.red] : ['BATTERY', '19%', C.red],
      ['ROOM', '13 · LEFT', C.red],
      ['HEADCOUNT', '43', C.red],
      r4],
  };
}

const shots = [];
const shot = (name, start, draw, meta) => shots.push({ name, start, draw, meta });
const hudShade = (ctx, a = 0.85) => { const g = ctx.createRadialGradient(170, 250, 60, 170, 250, 560); g.addColorStop(0, `rgba(2,3,8,${a})`); g.addColorStop(1, 'rgba(2,3,8,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 760, 820); };
const capShade = (ctx, a = 0.72) => { const g = ctx.createLinearGradient(0, 1250, 0, 1720); g.addColorStop(0, 'rgba(2,3,8,0)'); g.addColorStop(0.35, `rgba(2,3,8,${a})`); g.addColorStop(0.75, `rgba(2,3,8,${a})`); g.addColorStop(1, 'rgba(2,3,8,0)'); ctx.fillStyle = g; ctx.fillRect(0, 1250, W, 470); };
const redPulse = (ctx, a) => { if (a < 0.01) return; const g = ctx.createRadialGradient(540, 960, 300, 540, 960, 1200); g.addColorStop(0, 'rgba(255,40,60,0)'); g.addColorStop(1, `rgba(255,40,60,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
const flash = (ctx, t, t0, a = 0.8) => { if (t < t0 || t > t0 + 0.4) return; ctx.fillStyle = `rgba(235,240,255,${a * (1 - (t - t0) / 0.4)})`; ctx.fillRect(0, 0, W, H); };
const SUBY = 715;
const M = (ctx, t, st = {}) => X.drawMess(ctx, t, { lift: lift(t), ...st });
const lowShade = (ctx) => capShade(ctx, 0.5);

// 1. HOOK (frame 1): the bright mess hall, everyone lifting spoons in unison, slow push-in
shot('hook', 0, (ctx, t, lt) => {
  const z = lerp(1.0, 1.12, E.out(clamp(t / 3.6)));
  ctx.save(); camera(ctx, 540, lerp(980, 1010, E.out(clamp(t / 3.6))), z);
  M(ctx, t, {});
  ctx.restore();
  lowShade(ctx);
}, { vignette: 0.45 });
// 2. And one chair is waiting for you. — push to the empty place, lime glow
shot('chair', K.chair, (ctx, t, lt) => {
  const k = E.inOut(inv(K.chair, K.chairW + 0.6, t));
  ctx.save(); camera(ctx, lerp(560, EX - 40, k), lerp(1010, EY - 120, k), lerp(1.12, 2.0, k));
  M(ctx, t, { emptyHL: E.out(inv(K.chairW - 0.1, K.chairW + 0.5, t)) });
  ctx.restore();
  if (t > K.chairW) redPulse(ctx, 0.18 * Math.exp(-(t - K.chairW) * 3));
}, { vignette: 0.55 });
// 3. You followed them down the stairs. — feet passing your door (callback to Part 4), recap stamp over it
shot('stairs', K.stairs, (ctx, t, lt) => {
  const walkers = []; for (let i = 0; i < 12; i++) walkers.push(-200 + ((t * 260 + i * 330) % 1500));
  ctx.save(); camera(ctx, 540, 1180, lerp(1.2, 1.32, E.sine(clamp(lt / 2))));
  X.drawDoorGap(ctx, t, { light: 1, walkers });
  ctx.restore();
}, { vignette: 0.7 });
// 4. Nobody looked back. Nobody spoke. — you in the doorway, their backs to you
shot('backs', K.backs, (ctx, t, lt) => {
  const k = E.sine(clamp(lt / (K.lights - K.backs)));
  const wk = clamp(lt / 1.6);
  ctx.save(); camera(ctx, lerp(420, 480, k), lerp(1180, 1120, k), lerp(1.35, 1.25, k));
  M(ctx, t, { me: { x: lerp(60, 170, E.out(wk)), y: 1990, s: 1.35, walk: wk < 1 ? t * 7 : undefined } });
  ctx.restore();
  if (t > K.spokeW) redPulse(ctx, 0.15 * Math.exp(-(t - K.spokeW) * 3));
}, { vignette: 0.55 });
// 5. The mess hall lights are already on. — tilt down from the tubes
shot('lights', K.lights, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.plates - K.lights)));
  ctx.save(); camera(ctx, 540, lerp(330, 900, k), lerp(1.7, 1.08, k));
  M(ctx, t, {});
  ctx.restore();
  flash(ctx, t, K.onW, 0.25);
}, { vignette: 0.5 });
// 6. Steel plates on every table. Rice. Dal. Still steaming. — along the middle table
shot('plates', K.plates, (ctx, t, lt) => {
  let cx = lerp(200, 520, E.inOut(inv(K.plates, K.rice, t)));
  if (t > K.rice) cx = lerp(520, 760, E.inOut(inv(K.rice, K.steamW, t)));
  const z = t < K.steamW ? 2.5 : lerp(2.5, 2.9, E.out(inv(K.steamW, K.straight, t)));
  ctx.save(); camera(ctx, cx, 1240 - 140 * 0.64, z);
  M(ctx, t, { steam: t > K.steamW ? 1.6 : 1 });
  ctx.restore();
}, { vignette: 0.55 });
// 7. Everyone sits perfectly straight. 8. Lift / down — mid shot of backs, spoons on the words
shot('straight', K.straight, (ctx, t, lt) => {
  const k = E.sine(clamp(lt / (K.chew - K.straight)));
  ctx.save(); camera(ctx, lerp(380, 460, k), 1240 - 120, lerp(1.7, 1.85, k));
  M(ctx, t, {});
  ctx.restore();
  for (const w of [K.lift1, K.down1, K.lift2, K.down2]) if (t > w) redPulse(ctx, 0.08 * Math.exp(-(t - w) * 5));
}, { vignette: 0.55 });
// 9. Nobody is chewing. — one head from behind, very close, dead still
shot('chew', K.chew, (ctx, t, lt) => {
  const [x, y] = X.messSeat(2, 3);
  ctx.save(); camera(ctx, x + 10, y - 210 * 0.92, lerp(3.0, 3.4, E.sine(clamp(lt / 1.6))));
  M(ctx, t, {});
  ctx.restore();
  if (t > K.chewW) redPulse(ctx, 0.2 * Math.exp(-(t - K.chewW) * 2.5));
}, { vignette: 0.7 });
// 10. Like they're practising how to eat. — wide, the whole hall in mechanical unison, faster
shot('practise', K.practise, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.practiseW, 10, 0.4);
  ctx.save(); camera(ctx, 540, 1080, lerp(1.25, 1.15, E.sine(clamp(lt / 1.7))), sx, sy);
  M(ctx, t, {});
  ctx.restore();
}, { vignette: 0.5 });
// 11. Behind the counter, someone very tall is serving. — tilt up the warden
shot('counter', K.counter, (ctx, t, lt) => {
  const k = E.inOut(inv(K.counter + 0.3, K.tallW + 0.6, t));
  ctx.save(); camera(ctx, 560, lerp(930, 760, k), lerp(1.8, 1.65, k));
  M(ctx, t, { book: 0.3 });
  ctx.restore();
  if (t > K.tallW) redPulse(ctx, 0.2 * Math.exp(-(t - K.tallW) * 2.5));
}, { vignette: 0.6 });
// 12. Long coat. The register under one arm.
shot('coat', K.coat, (ctx, t, lt) => {
  const k = E.inOut(inv(K.coat, K.regW + 0.4, t));
  ctx.save(); camera(ctx, lerp(600, 620, k), lerp(820, 710, k), lerp(2.3, 3.0, k));
  M(ctx, t, { book: 0.3 });
  ctx.restore();
}, { vignette: 0.65 });
// 13. The warden. — the small tilted head, slam in, red
shot('warden', K.warden, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.wardenW, 20, 0.45);
  ctx.save(); camera(ctx, 620, lerp(560, 545, E.out(clamp(lt / 0.8))), lerp(3.6, 3.9, E.out(clamp(lt / 0.8))), sx, sy);
  M(ctx, t, { book: 0.3 });
  ctx.restore();
  ctx.fillStyle = 'rgba(120,10,25,0.18)'; ctx.fillRect(0, 0, W, H);
  if (t > K.wardenW) redPulse(ctx, 0.35 * Math.exp(-(t - K.wardenW) * 2));
}, { vignette: 0.75 });
// 14. At the end of the last table, one empty chair.
shot('empty', K.empty, (ctx, t, lt) => {
  const k = E.inOut(inv(K.empty, K.emptyW + 0.3, t));
  ctx.save(); camera(ctx, lerp(300, EX - 60, k), EY - 110, lerp(1.6, 2.6, k));
  M(ctx, t, { emptyHL: E.out(inv(K.emptyW - 0.2, K.emptyW + 0.4, t)) });
  ctx.restore();
}, { vignette: 0.6 });
// 15-17. A covered plate. A card on top. Room thirteen. And a date. Tomorrow's.
shot('plate', K.plate, (ctx, t, lt) => {
  const z = lerp(0.95, 1.12, E.sine(clamp(lt / (K.rule - K.plate))));
  const zz = t > K.tomW ? z + 0.25 * E.out(clamp((t - K.tomW) / 0.5)) : z;
  const [sx, sy] = shake(t, K.tomW, 18, 0.45);
  ctx.save(); camera(ctx, 540, t > K.dateW ? lerp(1000, 1060, E.inOut(inv(K.dateW, K.tomW, t))) : 1000, zz, sx, sy);
  X.drawCoveredPlate(ctx, t, { room: E.out(inv(K.roomW - 0.05, K.roomW + 0.6, t)), date: E.inOut(inv(K.dateW - 0.1, K.tomW, t)) });
  ctx.restore();
  if (t > K.roomW) redPulse(ctx, 0.12 * Math.exp(-(t - K.roomW) * 3));
  if (t > K.tomW) redPulse(ctx, 0.35 * Math.exp(-(t - K.tomW) * 2));
}, { vignette: 0.5 });
// 18. Rule four.
shot('rule', K.rule, (ctx, t, lt) => {
  const y4 = R[3].y + 40;
  const z = lerp(1.25, 1.5, E.sine(clamp(lt / (K.notYou - K.rule)))) * 0.84;
  ctx.save(); camera(ctx, 556, y4 + 170 / z, z);
  X.drawList(ctx, t, { hl: 3, hlA: E.out(inv(K.rule + 0.1, K.rule + 0.7, t)), done: 3, tx: 520 + (noise1(t) - 0.5) * 40, ty: y4 + 60, tr: 600, dark: 0.9 });
  ctx.restore();
  capShade(ctx); hudShade(ctx);
}, {});
// 19. Not for you. So why is your plate here? — back on the card, red
shot('why', K.notYou, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.notYou + 0.05, 22, 0.45);
  ctx.save(); camera(ctx, 540, 980, lerp(1.25, 1.45, E.sine(clamp(lt / (K.sit - K.notYou)))), sx, sy);
  X.drawCoveredPlate(ctx, t, { room: 1, date: 1, steam: 1.4 });
  ctx.restore();
  redPulse(ctx, 0.3 * Math.exp(-lt * 2));
  if (t > K.hereW) redPulse(ctx, 0.25 * Math.exp(-(t - K.hereW) * 2.5));
}, { vignette: 0.55 });
// 20. You don't sit. — you, from behind, standing still at the end of the hall
shot('sit', K.sit, (ctx, t, lt) => {
  ctx.save(); camera(ctx, 520, 1260, lerp(1.25, 1.3, clamp(lt / 1.5)));
  M(ctx, t, { me: { x: 170, y: 1990, s: 1.35 } });
  ctx.restore();
}, { vignette: 0.55 });
// 21. And every spoon stops.
shot('stop', K.stop, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.stopW, 14, 0.35);
  ctx.save(); camera(ctx, 460, 1240 - 120, 1.75, sx, sy);
  M(ctx, t, { stop: stopAt(t) });
  ctx.restore();
  if (t > K.stopW) redPulse(ctx, 0.2 * Math.exp(-(t - K.stopW) * 2.5));
}, { vignette: 0.6 });
// 22. Forty-two heads turn. At once. — wide, every head becomes a pale blank face
shot('turn', K.turn, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.onceW, 22, 0.45);
  ctx.save(); camera(ctx, 540, 1150, lerp(1.2, 1.3, E.out(clamp(lt / 2))), sx, sy);
  M(ctx, t, { stop: 1, turn: turnAt(t) });
  ctx.restore();
  if (t > K.onceW) redPulse(ctx, 0.3 * Math.exp(-(t - K.onceW) * 2));
}, { vignette: 0.55 });
// 23. Toward you. — slam in on the front row of pale faces
shot('toward', K.toward, (ctx, t, lt) => {
  const [x, y] = X.messSeat(2, 4);
  ctx.save(); camera(ctx, x, y - 200, lerp(2.2, 2.6, E.out(clamp(lt / 0.8))));
  M(ctx, t, { stop: 1, turn: 1 });
  ctx.restore();
  ctx.fillStyle = 'rgba(120,10,25,0.15)'; ctx.fillRect(0, 0, W, H);
  redPulse(ctx, 0.35 * Math.exp(-lt * 2));
}, { vignette: 0.7 });
// 24. The warden opens the register.
shot('reg', K.reg, (ctx, t, lt) => {
  const bk = lerp(0.3, 1, E.out(inv(K.regOpenW - 0.2, K.regOpenW + 0.4, t)));
  ctx.save(); camera(ctx, 600, lerp(760, 700, E.sine(clamp(lt / 1.6))), 2.3);
  M(ctx, t, { stop: 1, turn: 1, book: bk, page: t > K.regOpenW ? clamp((t - K.regOpenW) * 2) % 1 : 0 });
  ctx.restore();
}, { vignette: 0.65 });
// 25. You hear a pen. Writing your row. — the register: row 13, red ink
shot('pen', K.pen, (ctx, t, lt) => {
  const z = lerp(1.35, 1.6, E.sine(clamp(lt / (K.buzz - K.pen))));
  ctx.save(); camera(ctx, 560, lerp(1240, 1330, E.sine(clamp(lt / 2))), z);
  X.drawRegister(ctx, t, { date: '16 / 11', write: E.inOut(inv(K.penW, K.buzz + 0.1, t)), lx: 540, ly: 1300 });
  ctx.restore();
  hudShade(ctx, 0.92);
  if (t > K.rowW) redPulse(ctx, 0.2 * Math.exp(-(t - K.rowW) * 2.5));
}, { vignette: 0.55 });
// 26-30. Phone: BLOCK C group, 43 members, member 43 typing
const chatBG = (ctx, t) => {
  ctx.fillStyle = '#070a16'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.filter = 'blur(24px)'; ctx.globalAlpha = 0.85; camera(ctx, 540, 1150, 1.2); X.drawMess(ctx, t, { lift: 0.15, turn: 1 }); ctx.restore();
  ctx.fillStyle = 'rgba(3,4,10,0.45)'; ctx.fillRect(0, 0, W, H);
};
const gMsgs = (t) => [
  { from: 'Arjun', col: '#7fb0ff', text: 'mess bell?? at 3??', a: 1, time: '3:00 AM' },
  { from: 'Rohan', col: '#f0a35e', text: 'whos walking in the corridor', a: 1, time: '3:00 AM' },
];
shot('phone', K.buzz, (ctx, t, lt) => {
  const b = t - K.buzzW; const buzzing = b > 0 && b < 0.35;
  const sh = buzzing ? (hash(Math.floor(t * 60)) - 0.5) * 0.03 : 0;
  let z = lerp(1.0, 1.08, E.sine(clamp(lt / (K.rule5 - K.buzz)))) + sh;
  const [sx, sy] = shake(t, K.n43W, 14, 0.4);
  X.drawGroupChat(ctx, t, { sub: '43 members · muted', scale: z, shake: [sx, sy], bg: chatBG, msgs: gMsgs(t) });
  if (t > K.n43W - 0.05) {
    const a = clamp((t - K.n43W + 0.05) / 0.3);
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = C.red; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.ellipse(556, SUBY, 165, 40, -0.03, 0, Math.PI * 2 * clamp((t - K.n43W) / 0.5)); ctx.stroke(); ctx.restore();
    redPulse(ctx, 0.3 * Math.exp(-(t - K.n43W) * 2));
  }
}, { vignette: 0.5 });
// 28. Rule five.
shot('rule5', K.rule5, (ctx, t, lt) => {
  const y5 = R[4].y + 40;
  const z = lerp(1.25, 1.5, E.sine(clamp(lt / (K.typing - K.rule5)))) * 0.84;
  const [sx, sy] = shake(t, K.leaveW, 18, 0.4);
  ctx.save(); camera(ctx, 556, y5 + 170 / z, z, sx, sy);
  X.drawList(ctx, t, { hl: 4, hlA: E.out(inv(K.rule5 + 0.1, K.rule5 + 0.7, t)), done: 4, tx: 520 + (noise1(t) - 0.5) * 40, ty: y5 + 60, tr: 600, dark: 0.9 });
  ctx.restore();
  capShade(ctx); hudShade(ctx);
  if (t > K.leaveW) redPulse(ctx, 0.2 * Math.exp(-(t - K.leaveW) * 2.5));
}, {});
// 29-30. But the forty-third member is typing. Right now.
shot('typing', K.typing, (ctx, t, lt) => {
  const z = t < K.now ? lerp(1.08, 1.22, E.sine(clamp(lt / (K.now - K.typing)))) : lerp(1.22, 1.55, E.inOut(clamp((t - K.now) / 0.9)));
  const [sx, sy] = shake(t, K.now + 0.05, 16, 0.4);
  X.drawGroupChat(ctx, t, { sub: '43 members · muted', scale: z, shake: [sx, sy], bg: chatBG, msgs: gMsgs(t), typing: clamp((t - K.typingW + 0.2) / 0.3) });
  if (t > K.typingW) redPulse(ctx, 0.22 * Math.exp(-(t - K.typingW) * 2));
  if (t > K.now) redPulse(ctx, 0.3 * Math.exp(-(t - K.now) * 2));
}, { vignette: 0.5 });
// 31-34. Choice card over the hall of pale faces
shot('choice', K.choice, (ctx, t, lt) => {
  ctx.save(); ctx.filter = `blur(${(9 * clamp(lt / 0.4)).toFixed(1)}px)`;
  ctx.save(); camera(ctx, 540, 1150, 1.25); X.drawMess(ctx, t, { lift: 0.15, turn: 1 }); ctx.restore();
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
  opt('A', 'LEAVE THE GROUP', 960, K.optA, K.optB - 0.1, 'RULE 5 SAYS LEAVE IT');
  opt('B', 'SCROLL UP · SEE WHO IT IS', 1150, K.optB, K.cta - 0.1, 'WHO IS MEMBER NUMBER 43?');
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
    spaced(ctx, 'MOST VOTES DECIDE PART 6 · TOMORROW 3 PM', 540, 1580, 3, 'center');
    ctx.restore();
  }
}, { captions: false, vignette: 0.4 });

// ---------- overlay: small burned-in hook (frame 1, 4 words, picture dominates) + recap stamp ----------
function overlay(ctx, t) {
  const ha = t < 2.7 ? 1 : clamp(1 - (t - 2.7) / 0.35);
  if (ha > 0) {
    const pop = lerp(1.12, 1, E.outBack(clamp(t / 0.35)));
    ctx.save(); ctx.globalAlpha = ha; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.translate(540, 560); ctx.scale(pop, pop); ctx.translate(-540, -560);
    ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = 24;
    ctx.font = '96px Osw700'; ctx.fillStyle = C.white; ctx.fillText('DINNER AT', 540, 520);
    ctx.font = '110px Osw700'; ctx.fillStyle = C.red; ctx.fillText('3 AM', 540, 630);
    ctx.restore();
  }
  const r0 = K.stairs + 0.05, r1 = K.backs + 0.6;
  if (t > r0 && t < r1 + 0.3) {
    const a = clamp((t - r0) / 0.18) * clamp((r1 + 0.3 - t) / 0.3);
    const s = lerp(1.4, 1, E.outBack(clamp((t - r0) / 0.3)));
    ctx.save(); ctx.globalAlpha = a; ctx.translate(540, 560); ctx.rotate(-0.06); ctx.scale(s, s);
    rrect(ctx, -280, -70, 560, 140, 18); ctx.fillStyle = 'rgba(8,12,26,0.82)'; ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = C.lime; ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.lime;
    ctx.font = '70px Osw700'; ctx.fillText('YOU CHOSE A', 0, -8);
    ctx.font = '22px Mono700'; ctx.fillStyle = 'rgba(238,241,247,0.8)'; spaced(ctx, 'YOU FOLLOWED THEM TO THE MESS', 0, 46, 2.5, 'center');
    ctx.restore();
  }
}

shots.sort((a, b) => a.start - b.start);
return { shots, K, hudState, overlay, coverTitle: 'DINNER AT [3 AM]', coverSize: 104 };
};
