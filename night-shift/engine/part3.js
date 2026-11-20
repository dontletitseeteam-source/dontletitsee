// NIGHT SHIFT — Episode 3 "The last delivery" (the woman with seven fingers behind the door chain). Standalone, ~70 s.
// Standard (ANALYTICS): frame 1 = a BRIGHT, readable wide shot: the lit house at 47 Lantern Lane, a grey seven-fingered
// hand reaching out of the chained door, you and your scooter at the gate.
const D = require('./draw');
const X = require('./sets_delivery');
const { W, H, C, clamp, lerp, inv, E, noise1, shake, rrect, spaced, camera } = D;

module.exports = function build(TL) {
const Ln = id => TL.lines[id - 1];
const Wd = (id, k) => Ln(id).words[k].start;
const S0 = id => Ln(id).start - 0.06;
const K = {
  handW: Wd(1, 3), chainW: Wd(1, 8),
  seven: S0(2), sevenW: Wd(2, 2), fingersW: Wd(2, 3),
  me: S0(3), deliverW: Wd(3, 3), msgW: Wd(3, 9),
  r1: S0(4), r2: S0(5), r3: S0(6),
  last: S0(7), phoneW: Wd(7, 3), notW: Wd(7, 6),
  order: S0(8), popW: Wd(8, 4), acceptW: Wd(8, 7),
  map: S0(9), mapW: Wd(9, 5), yestW: Wd(9, 6),
  house: S0(10), litW: Wd(10, 1), opensW: Wd(10, 5), chain10W: Wd(10, 8),
  rule2: S0(11), stepW: Wd(11, 7),
  whisper: S0(12), whisperW: Wd(12, 1), handItW: Wd(12, 2), pleaseW: Wd(12, 6),
  lift: S0(13), liftW: Wd(13, 1), chain13W: Wd(13, 5),
  hand: S0(14), greyW: Wd(14, 1), slidesW: Wd(14, 3), knucklesW: Wd(14, 7),
  rule3: S0(15), dontW: Wd(15, 2),
  count: S0(16), countW: Wd(16, 1), n5: Wd(16, 2), n6: Wd(16, 3), n7: Wd(16, 4),
  face: S0(17), faceW: Wd(17, 1), gapW: Wd(17, 5), smilingW: Wd(17, 6),
  take: S0(18), takeW: Wd(18, 2), seeW: Wd(18, 5), tomorrowW: Wd(18, 7),
  shut: S0(19), shutsW: Wd(19, 2), outW: Wd(19, 6),
  buzz: S0(20), buzzW: Wd(20, 2), deliveredW: Wd(20, 4),
  placed: S0(21), yourW: Wd(21, 4), phone21W: Wd(21, 5),
  tmr: S0(22), tmrW: Wd(22, 0), addrW: Wd(22, 5), yoursW: Wd(22, 7),
  choice: Ln(23).start - 0.1, optA: Wd(23, 5), optB: Wd(23, 7), cta: Ln(24).start, ctaA: Wd(24, 1), ctaB: Wd(24, 3),
};

// ---------- HUD ----------
function hudState(t) {
  const blink = (t0, end = C.red) => t < t0 + 0.6 ? (Math.floor(t * 12) % 2 ? C.red : C.white) : end;
  const time = t < K.order ? '2:41' : t < K.house ? '2:47' : t < K.shut ? '2:51' : '2:52';
  let ord = ['ORDERS', '0 TONIGHT', C.white];
  if (t >= K.acceptW) ord = ['ORDER', '#2147 ACCEPTED', blink(K.acceptW, C.lime)];
  if (t >= K.yestW) ord = ['ORDER', 'NEW ROAD', blink(K.yestW)];
  if (t >= K.deliveredW) ord = ['ORDER', 'DELIVERED', C.lime];
  if (t >= K.phone21W) ord = ['PLACED BY', 'YOUR PHONE', blink(K.phone21W)];
  if (t >= K.yoursW) ord = ['NEXT DROP', 'YOUR ROOM', blink(K.yoursW)];
  let rl = ['RULES', '3', C.white];
  if (t >= K.acceptW) rl = ['RULE 1', 'KEPT', blink(K.acceptW, C.lime)];
  if (t >= K.stepW) rl = ['RULE 2', 'KEPT', blink(K.stepW, C.lime)];
  if (t >= K.chain13W) rl = ['RULE 2', 'BENT', blink(K.chain13W)];
  if (t >= K.countW) rl = ['RULE 3', 'BROKEN', blink(K.countW)];
  let fg = ['FINGERS', '?', C.white];
  if (t >= K.n5) fg = ['FINGERS', '5', C.white];
  if (t >= K.n6) fg = ['FINGERS', '6', blink(K.n6)];
  if (t >= K.n7) fg = ['FINGERS', '7', blink(K.n7)];
  return { t, part: 'SHIFT 3', time, ampm: 'AM', labelW: 170, rows: [['RIDER', 'FIRST NIGHT', C.white], ord, rl, fg] };
}

const shots = [];
const shot = (name, start, draw, meta) => shots.push({ name, start, draw, meta });
const capShade = (ctx, a = 0.72) => { const g = ctx.createLinearGradient(0, 1250, 0, 1720); g.addColorStop(0, 'rgba(2,3,8,0)'); g.addColorStop(0.35, `rgba(2,3,8,${a})`); g.addColorStop(0.75, `rgba(2,3,8,${a})`); g.addColorStop(1, 'rgba(2,3,8,0)'); ctx.fillStyle = g; ctx.fillRect(0, 1250, W, 470); };
const hudShade = (ctx, a = 1) => { const g = ctx.createRadialGradient(170, 230, 180, 170, 230, 720); g.addColorStop(0, `rgba(2,3,8,${a})`); g.addColorStop(1, 'rgba(2,3,8,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 760, 820); };
const redPulse = (ctx, a) => { if (a < 0.01) return; const g = ctx.createRadialGradient(540, 960, 300, 540, 960, 1200); g.addColorStop(0, 'rgba(255,40,60,0)'); g.addColorStop(1, `rgba(255,40,60,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
const flash = (ctx, t, t0, a = 0.8) => { if (t < t0 || t > t0 + 0.4) return; ctx.fillStyle = `rgba(235,240,255,${a * (1 - (t - t0) / 0.4)})`; ctx.fillRect(0, 0, W, H); };
const pulseAt = (ctx, t, t0, a = 0.3, k = 2.5) => { if (t > t0) redPulse(ctx, a * Math.exp(-(t - t0) * k)); };
const GAPX = X.DR.x1 - 82;   // door edge when open on the chain

// 1. HOOK (frame 1): the bright house, the hand out of the chained door, you at the gate
shot('hook', 0, (ctx, t, lt) => {
  const k = E.inOut(clamp(t / K.seven));
  ctx.save(); camera(ctx, lerp(560, 600, k), lerp(980, 900, k), lerp(0.98, 1.25, k));
  X.drawHouse(ctx, t, { open: 1, hand: 0.75 + 0.25 * E.out(inv(0, K.chainW, t)), scooter: true });
  ctx.restore();
  hudShade(ctx, 0.5);
}, { vignette: 0.25 });
// 2. It has seven fingers. — close on the hand, fingers flex
shot('seven', K.seven, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.sevenW, 14, 0.35);
  ctx.save(); camera(ctx, 700, lerp(880, 920, E.out(clamp(lt / 1.6))), lerp(0.95, 1.08, clamp(lt / 1.6)), sx, sy);
  X.drawHandClose(ctx, t, { reach: 1, curl: 0.1 + 0.15 * Math.sin(t * 3) ** 2 });
  ctx.restore();
  hudShade(ctx, 0.6); flash(ctx, t, K.seven, 0.3); pulseAt(ctx, t, K.sevenW, 0.35, 2);
}, { vignette: 0.4 });
// 3. Your first night delivering. — earlier: you on the scooter under the streetlamp, phone lit, porch dark
shot('me', K.me, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.msgW - K.me)));
  ctx.save(); camera(ctx, lerp(520, 470, k), lerp(1500, 1560, k), lerp(1.1, 1.35, k));
  X.drawHouse(ctx, t, { light: 0, open: 0, street: 1, scooter: true, me: { x: 470, y: 1840, s: 1.05, view: 'front', arm: 'phone', lit: 1, helmet: 1 } });
  ctx.restore();
  hudShade(ctx, 0.6);
}, { vignette: 0.45 });
// 3b-7. the pinned message + the three rules + the last line
const chatBG = (c, t) => X.streetBG(c, t, 0);
shot('msg', K.msgW - 0.05, (ctx, t, lt) => {
  ctx.save(); camera(ctx, 540, lerp(820, 860, E.out(clamp(lt / 0.6))), lerp(1.08, 1.0, E.out(clamp(lt / 0.5))));
  X.drawPhone(ctx, t, { mode: 'chat', bg: chatBG, clock: '2:41' });
  ctx.restore();
  hudShade(ctx, 0.7); flash(ctx, t, K.msgW - 0.05, 0.25);
}, { vignette: 0.4 });
const R = X.CHAT_RULES;
const ruleShot = (i, t0, t1, hlW) => shot('rule' + (i + 1), t0, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / 0.5));
  const prevY = i ? R[i - 1].y : 760;
  ctx.save(); camera(ctx, 560, lerp(prevY, R[i].y, k) + 40, lerp(1.5, 1.62, clamp(lt / (t1 - t0))));
  X.drawPhone(ctx, t, { mode: 'chat', bg: chatBG, hl: i, hlA: E.out(inv(hlW - 0.1, hlW + 0.5, t)), dim: 1, clock: '2:41' });
  ctx.restore();
  capShade(ctx, 0.62); hudShade(ctx);
  const a = E.outBack(clamp(lt / 0.3));
  ctx.save(); ctx.globalAlpha = clamp(lt / 0.12) * clamp((t1 - t) / 0.2); ctx.translate(880, 520); ctx.rotate(0.08); ctx.scale(lerp(1.5, 1, a), lerp(1.5, 1, a));
  rrect(ctx, -110, -70, 220, 140, 14); ctx.fillStyle = C.red; ctx.fill(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '96px Osw700'; ctx.fillStyle = '#fff'; ctx.fillText(`#${i + 1}`, 0, 6);
  ctx.restore();
}, {});
ruleShot(0, K.r1, K.r2, Wd(4, 1));
ruleShot(1, K.r2, K.r3, Wd(5, 1));
ruleShot(2, K.r3, K.last, Wd(6, 1));
shot('last', K.last, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.order - K.last)));
  const [sx, sy] = shake(t, K.notW, 12, 0.35);
  ctx.save(); camera(ctx, 560, lerp(1200, 1250, k), lerp(1.45, 1.65, k), sx, sy);
  X.drawPhone(ctx, t, { mode: 'chat', bg: chatBG, last: E.inOut(inv(K.phoneW - 0.5, K.notW + 0.3, t)), dim: 0.5, hl: -1, clock: '2:41' });
  ctx.restore();
  capShade(ctx, 0.5); hudShade(ctx);
  pulseAt(ctx, t, K.phoneW, 0.2); pulseAt(ctx, t, K.notW, 0.3);
}, {});
// 8. Two forty-seven. The order pops up. You accept.
shot('order', K.order, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.map - K.order)));
  const [sx, sy] = shake(t, K.popW, 16, 0.35);
  ctx.save(); camera(ctx, 540, lerp(840, 900, k), lerp(1.0, 1.12, k), sx, sy);
  X.drawPhone(ctx, t, { mode: 'order', bg: chatBG, pop: inv(K.order, K.order + 0.35, t), accept: inv(K.acceptW, K.acceptW + 0.35, t), timer: inv(K.popW, K.acceptW, t), clock: '2:47' });
  ctx.restore();
  hudShade(ctx, 0.7); flash(ctx, t, K.order, 0.35); pulseAt(ctx, t, K.order + 0.05, 0.3);
}, { vignette: 0.4 });
// 9. The address wasn't on the map yesterday.
shot('map', K.map, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.house - K.map)));
  ctx.save(); camera(ctx, lerp(540, 620, k), lerp(860, 700, k), lerp(1.0, 1.3, k));
  X.drawPhone(ctx, t, { mode: 'map', bg: chatBG, street: E.inOut(inv(K.mapW - 0.3, K.yestW + 0.3, t)), clock: '2:48' });
  ctx.restore();
  hudShade(ctx, 0.7); pulseAt(ctx, t, K.yestW, 0.3);
}, { vignette: 0.4 });
// 10. One lit house. The door opens on a chain.
shot('house', K.house, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.rule2 - K.house)));
  const op = E.out(inv(K.opensW - 0.1, K.chain10W + 0.2, t));
  const [sx, sy] = shake(t, K.chain10W, 10, 0.3);
  ctx.save(); camera(ctx, lerp(560, 560, k), lerp(1000, 900, k), lerp(0.98, 1.3, k), sx, sy);
  X.drawHouse(ctx, t, { open: op, light: inv(K.house - 0.1, K.litW + 0.1, t) * 0.75 + 0.25, scooter: true, me: { x: lerp(330, 760, k), y: 1800, s: 1.05, view: 'back', walk: t * 6, helmet: 1, holdBag: true, bagDX: 40, bagDY: -160 } });
  ctx.restore();
  hudShade(ctx, 0.5); flash(ctx, t, K.litW, 0.2);
}, { vignette: 0.3 });
// 11. Rule two. You leave it on the step. — the bag on the lit step, the dark gap above it
shot('step', K.rule2, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.whisper - K.rule2)));
  ctx.save(); camera(ctx, lerp(560, 580, k), lerp(1050, 1000, k), lerp(1.5, 1.75, k));
  X.drawHouse(ctx, t, { open: 1, bag: t >= K.stepW - 0.2 ? 'step' : null, me: { x: 740, y: 1560, s: 1.0, view: 'back', helmet: 1, holdBag: t < K.stepW - 0.2, bagDX: -60, bagDY: -170 }, scooter: false });
  ctx.restore();
  hudShade(ctx, 0.6);
}, { vignette: 0.4 });
// 12. A whisper: Hand it to me. Please. — an eye in the gap
shot('whisper', K.whisper, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.lift - K.whisper)));
  ctx.save(); camera(ctx, lerp(610, 600, k), lerp(760, 720, k), lerp(2.0, 2.5, k));
  X.drawHouse(ctx, t, { open: 1, bag: 'step', eye: E.out(inv(K.whisperW, K.handItW + 0.3, t)), face: 0.6 * inv(K.handItW, K.pleaseW, t) });
  ctx.restore();
  hudShade(ctx, 0.6); pulseAt(ctx, t, K.pleaseW, 0.25);
}, { vignette: 0.55 });
// 13. You lift it to the chain.
shot('lift', K.lift, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.hand - K.lift)));
  const up = E.inOut(inv(K.liftW, K.chain13W + 0.2, t));
  ctx.save(); camera(ctx, 600, lerp(960, 900, k), lerp(1.4, 1.6, k));
  X.drawHouse(ctx, t, { open: 1, me: { x: 760, y: 1440, s: 1.0, view: 'back', arm: up > 0.5 ? 'raise' : 'down', helmet: 1, holdBag: true, bagDX: lerp(40, -20, up), bagDY: lerp(-160, -560, up) } });
  ctx.restore();
  hudShade(ctx, 0.6);
}, { vignette: 0.45 });
// 14. A grey hand slides out. Too many knuckles.
shot('hand', K.hand, (ctx, t, lt) => {
  const r = E.inOut(inv(K.greyW - 0.1, K.slidesW + 0.6, t));
  const [sx, sy] = shake(t, K.knucklesW, 12, 0.35);
  ctx.save(); camera(ctx, 700, lerp(860, 900, E.inOut(clamp(lt / 2.6))), lerp(1.0, 1.15, clamp(lt / 2.6)), sx, sy);
  X.drawHandClose(ctx, t, { reach: r, curl: 0.25 - 0.15 * r });
  ctx.restore();
  hudShade(ctx, 0.6); pulseAt(ctx, t, K.greyW, 0.25); pulseAt(ctx, t, K.knucklesW, 0.3);
}, { vignette: 0.45 });
// 15. Rule three. Don't count. — rule 3 lit again, phone in the dark
shot('rule3', K.rule3, (ctx, t, lt) => {
  ctx.save(); camera(ctx, 560, R[2].y + 40, lerp(1.6, 1.85, clamp(lt / (K.count - K.rule3))));
  X.drawPhone(ctx, t, { mode: 'chat', bg: chatBG, hl: 2, hlA: E.out(inv(K.dontW - 0.1, K.dontW + 0.4, t)), dim: 1, dark: 0.25, clock: '2:51' });
  ctx.restore();
  capShade(ctx, 0.6); hudShade(ctx); pulseAt(ctx, t, K.dontW, 0.3);
}, {});
// 16. You count. Five. Six. Seven. — numbers pop on her fingertips
shot('count', K.count, (ctx, t, lt) => {
  const n = t < K.countW + 0.2 ? 0 : t < K.n5 ? Math.min(4, 1 + Math.floor((t - K.countW - 0.2) / 0.15)) : t < K.n6 ? 5 : t < K.n7 ? 6 : 7;
  const times = [K.countW + 0.2, K.countW + 0.35, K.countW + 0.5, K.countW + 0.65, K.n5, K.n6, K.n7];
  const [sx, sy] = shake(t, K.n7, 18, 0.45);
  const z = t < K.n6 ? 0.98 : t < K.n7 ? 1.06 : 1.14;
  ctx.save(); camera(ctx, 720, 930, z, sx, sy);
  X.drawHandClose(ctx, t, { reach: 1, n, times, curl: 0.08 });
  ctx.restore();
  hudShade(ctx, 0.6); pulseAt(ctx, t, K.n6, 0.3); pulseAt(ctx, t, K.n7, 0.5, 1.8); flash(ctx, t, K.n7, 0.25);
}, { vignette: 0.45 });
// 17. Her face slides into the gap. Smiling. — THE POSTER IMAGE
shot('face', K.face, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.take - K.face)));
  const [sx, sy] = shake(t, K.smilingW, 14, 0.4);
  ctx.save(); camera(ctx, 540, lerp(960, 900, k), lerp(1.0, 1.12, k), sx, sy);
  X.drawGapFace(ctx, t, { slide: inv(K.faceW - 0.2, K.gapW + 0.2, t), smile: E.out(inv(K.smilingW - 0.1, K.smilingW + 0.7, t)) });
  ctx.restore();
  hudShade(ctx, 0.7); pulseAt(ctx, t, K.smilingW, 0.4, 1.8);
}, { vignette: 0.5 });
// 18. Seven fingers take the bag. See you tomorrow.
shot('take', K.take, (ctx, t, lt) => {
  const bt = E.inOut(inv(K.takeW, K.seeW, t));
  ctx.save(); camera(ctx, 700, 960, lerp(1.0, 1.12, clamp(lt / 1.6)));
  X.drawHandClose(ctx, t, { reach: 1, curl: lerp(0.1, 0.75, E.out(inv(K.take, K.takeW + 0.2, t))), bagT: bt });
  ctx.restore();
  hudShade(ctx, 0.6);
}, { vignette: 0.45 });
shot('see', K.seeW - 0.08, (ctx, t, lt) => {
  ctx.save(); camera(ctx, 540, 930, lerp(1.25, 1.45, E.out(clamp(lt / 1.2))));
  X.drawGapFace(ctx, t, { slide: 1, smile: 1, light: 0.85 });
  ctx.restore();
  hudShade(ctx, 0.7); pulseAt(ctx, t, K.tomorrowW, 0.35);
}, { vignette: 0.55 });
// 19. The door shuts. The light goes out.
shot('shut', K.shut, (ctx, t, lt) => {
  const op = 1 - E.in(inv(K.shutsW - 0.15, K.shutsW + 0.05, t));
  const off = t >= K.outW;
  const [sx, sy] = shake(t, K.shutsW, 16, 0.35);
  ctx.save(); camera(ctx, 560, 1000, lerp(1.05, 0.98, clamp(lt / 2)), sx, sy);
  X.drawHouse(ctx, t, { open: op, light: off ? 0.04 * Math.abs(Math.sin(t * 30)) * Math.exp(-(t - K.outW) * 4) : 1, street: off ? 0.35 : 1, scooter: true, me: { x: 760, y: 1560, s: 1.0, view: 'back', helmet: 1 } });
  ctx.restore();
  hudShade(ctx, 0.6);
}, { vignette: 0.5 });
// 20. Your phone buzzes. Order delivered.
const darkBG = (c, t) => X.streetBG(c, t, 0);
shot('buzz', K.buzz, (ctx, t, lt) => {
  const bz = t > K.buzzW - 0.1 && t < K.buzzW + 0.5 ? [Math.sin(t * 90) * 10, 0] : [0, 0];
  ctx.save(); camera(ctx, 540, 860, lerp(1.0, 1.08, clamp(lt / 2)));
  X.drawPhone(ctx, t, { mode: 'delivered', bg: darkBG, pop: inv(K.buzzW - 0.1, K.buzzW + 0.3, t), from: 0, shake: bz, clock: '2:52' });
  ctx.restore();
  hudShade(ctx, 0.7); flash(ctx, t, K.buzzW - 0.1, 0.2);
}, { vignette: 0.45 });
// 21. It was placed from your phone.
shot('placed', K.placed, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.phone21W, 14, 0.4);
  ctx.save(); camera(ctx, 540, lerp(1060, 1140, E.inOut(clamp(lt / 1.3))), lerp(1.2, 1.5, E.inOut(clamp(lt / 1.3))), sx, sy);
  X.drawPhone(ctx, t, { mode: 'delivered', bg: darkBG, from: E.out(inv(K.yourW - 0.2, K.phone21W + 0.1, t)), clock: '2:52' });
  ctx.restore();
  hudShade(ctx, 0.7); pulseAt(ctx, t, K.phone21W, 0.45, 1.8);
}, { vignette: 0.5 });
// 22. Tomorrow's order is placed. The address is yours.
shot('tomorrow', K.tmr, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.choice - K.tmr)));
  const [sx, sy] = shake(t, K.yoursW, 16, 0.45);
  ctx.save(); camera(ctx, 540, lerp(1000, 1150, k), lerp(1.0, 1.2, k), sx, sy);
  X.drawPhone(ctx, t, { mode: 'tomorrow', bg: darkBG, addr: E.out(inv(K.addrW - 0.1, K.yoursW + 0.1, t)), clock: '2:53' });
  ctx.restore();
  hudShade(ctx, 0.7); flash(ctx, t, K.tmr, 0.2); pulseAt(ctx, t, K.yoursW, 0.5, 1.6);
}, { vignette: 0.5 });
// 23-24. Choice card over the dark chained door
shot('choice', K.choice, (ctx, t, lt) => {
  ctx.save(); ctx.filter = `blur(${(9 * clamp(lt / 0.4)).toFixed(1)}px)`;
  ctx.save(); camera(ctx, 580, 900, 1.3); X.drawHouse(ctx, t, { open: 1, light: 0.5, eye: 1 }); ctx.restore();
  ctx.restore();
  ctx.fillStyle = `rgba(3,5,12,${0.76 * clamp(lt / 0.35)})`; ctx.fillRect(0, 0, W, H);
  const q = [['WHICH', 'RULE'], ['WOULD', 'YOU', 'BREAK?']];
  ctx.save(); ctx.font = '112px Osw700'; ctx.textBaseline = 'middle';
  let wi = 0;
  q.forEach((row, ri) => {
    const sp = 30; const ws = row.map(w => ctx.measureText(w).width); const tot = ws.reduce((a, b) => a + b, 0) + sp * (row.length - 1);
    let x = 540 - tot / 2;
    row.forEach((w, i) => {
      const a = clamp((t - Wd(23, wi) + 0.03) / 0.12); wi++;
      if (a > 0) { ctx.save(); ctx.globalAlpha = a; const s = lerp(1.3, 1, E.outBack(a)); ctx.translate(x + ws[i] / 2, 520 + ri * 125); ctx.scale(s, s); ctx.fillStyle = ri === 1 && i === 2 ? C.red : C.white; ctx.textAlign = 'center'; ctx.fillText(w, 0, 0); ctx.restore(); }
      x += ws[i] + sp;
    });
  });
  ctx.restore();
  const opt = (letter, label, y, ta, tEnd, sub) => {
    const a = E.out(clamp((t - ta + 0.05) / 0.3)); if (a <= 0) return;
    const live = t >= ta - 0.05 && t < tEnd;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(lerp(-60, 0, a), 0);
    const s = live ? 1.04 : 1; ctx.translate(540, y); ctx.scale(s, s); ctx.translate(-540, -y);
    rrect(ctx, 110, y - 76, 860, 152, 26); ctx.fillStyle = live ? 'rgba(30,40,24,0.9)' : 'rgba(18,24,48,0.85)'; ctx.fill();
    ctx.lineWidth = live ? 6 : 3; ctx.strokeStyle = live ? C.lime : 'rgba(238,241,247,0.75)'; ctx.stroke();
    ctx.beginPath(); ctx.arc(194, y, 44, 0, 7); ctx.fillStyle = live ? C.lime : C.white; ctx.fill();
    ctx.font = '58px Osw700'; ctx.fillStyle = '#0b1022'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(letter, 194, y + 2);
    ctx.textAlign = 'left'; ctx.fillStyle = C.white; ctx.font = '54px Osw700'; ctx.fillText(label, 266, y - 8);
    ctx.font = '24px Mono500'; ctx.fillStyle = 'rgba(238,241,247,0.6)'; spaced(ctx, sub, 268, y + 42, 1.5);
    ctx.restore();
  };
  opt('A', 'RULE 2 · HAND IT OVER', 840, K.optA, K.optB - 0.1, 'THROUGH THE CHAIN, INTO HER HAND');
  opt('B', 'RULE 3 · COUNT HER FINGERS', 1030, K.optB, K.cta - 0.1, 'AND WATCH HER SMILE');
  const ca = clamp((t - K.cta + 0.05) / 0.2);
  if (ca > 0) {
    ctx.save(); ctx.globalAlpha = ca; ctx.textBaseline = 'middle'; ctx.font = '84px Osw700';
    const pa = t > K.ctaA ? Math.exp(-(t - K.ctaA) * 5) : 0, pb = t > K.ctaB ? Math.exp(-(t - K.ctaB) * 5) : 0;
    const parts = [['COMMENT ', C.white, 0], ['A', C.lime, pa], [' OR ', C.white, 0], ['B', C.lime, pb]];
    const tw = parts.reduce((s, [p]) => s + ctx.measureText(p).width, 0);
    let xx = 540 - tw / 2;
    for (const [p, c, pop] of parts) {
      const w = ctx.measureText(p).width;
      ctx.save(); ctx.translate(xx + w / 2, 1240); ctx.scale(1 + 0.35 * pop, 1 + 0.35 * pop); ctx.fillStyle = c; ctx.textAlign = 'center'; ctx.fillText(p, 0, 0); ctx.restore();
      xx += w;
    }
    const by = 1310 + Math.sin(t * 6) * 10;
    ctx.strokeStyle = C.lime; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(540, by); ctx.lineTo(540, by + 60); ctx.moveTo(510, by + 32); ctx.lineTo(540, by + 62); ctx.lineTo(570, by + 32); ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.font = '72px Osw700'; ctx.fillStyle = C.red; ctx.fillText('NIGHT SHIFT', 540, 1560);
    ctx.font = '26px Mono700'; ctx.fillStyle = 'rgba(238,241,247,0.75)'; spaced(ctx, 'A NEW SHIFT TOMORROW · 3 PM', 540, 1625, 3, 'center');
    ctx.restore();
  }
}, { captions: false, vignette: 0.4 });

// ---------- overlay: small burned-in hook (frame 1) ----------
function overlay(ctx, t) {
  const ha = t < K.seven - 0.1 ? 1 : clamp(1 - (t - K.seven + 0.1) / 0.25);
  if (ha > 0) {
    const pop = lerp(1.12, 1, E.outBack(clamp(t / 0.35)));
    ctx.save(); ctx.globalAlpha = ha; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.translate(540, 1130); ctx.scale(pop, pop); ctx.translate(-540, -1130);
    ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 28;
    rrect(ctx, 150, 1005, 780, 250, 26); ctx.fillStyle = 'rgba(6,8,18,0.78)'; ctx.fill();
    ctx.shadowBlur = 0;
    ctx.font = '96px Osw700'; ctx.fillStyle = C.white; ctx.fillText('2:47 AM DELIVERY.', 540, 1115);
    ctx.fillStyle = C.red; ctx.fillText('7 FINGERS.', 540, 1220);
    ctx.restore();
  }
}

shots.sort((a, b) => a.start - b.start);
return { shots, K, hudState, overlay, coverTitle: 'SHE HAS {7 FINGERS}', coverSize: 92, coverSub: 'NIGHT SHIFT · 2:47 AM' };
};
