// BLOCK C — Part 6 "43" shot list (branch A: you leave the group; 1 vote, YouTube "Leave the group!")
// Standard (ANALYTICS): frame 1 = a BRIGHT, recognizable wide set (the lit mess hall, 42 pale faces turned to you), small hook.
const D = require('./draw');
const X = require('./sets');
const { W, H, C, clamp, lerp, inv, E, hash, noise1, shake, rrect, spaced, camera } = D;

module.exports = function build(TL) {
const Ln = id => TL.lines[id - 1];
const Wd = (id, k) => Ln(id).words[k].start;
const R = X.listLayout();
const S0 = id => Ln(id).start - 0.06;
const K = {
  number: S0(2), numberW: Wd(2, 2),
  tap: S0(3), leaveW: Wd(3, 2),
  left: S0(4), leftW: Wd(4, 1),
  quiet: S0(5), quietW: Wd(5, 4),
  heads: S0(6), towardW: Wd(6, 5),
  eyes: S0(7), eyesW: Wd(7, 4),
  buzz: S0(8), buzzW: Wd(8, 3),
  added: S0(9), addedW: Wd(9, 2), backW: Wd(9, 4),
  tapName: S0(10), nameW: Wd(10, 3),
  info: S0(11), n43W: Wd(11, 3),
  photo: S0(12), isYouW: Wd(12, 4),
  taken: S0(13), behindW: Wd(13, 5),
  head: S0(14), ownW: Wd(14, 7),
  turn: S0(15), turnW: Wd(15, 2),
  num: S0(16), yoursW: Wd(16, 3),
  name: S0(17), nameW2: Wd(17, 1), roomW: Wd(17, 3), thirteenW: Wd(17, 4),
  typing: S0(18), typingW: Wd(18, 3),
  msg1: S0(19), msg1W: Wd(19, 0),
  msg2: S0(20) + 0.02, msg2W: Wd(20, 0), doorW: Wd(20, 7),
  never: S0(21), neverW: Wd(21, 1),
  hand: S0(22), handW: Wd(22, 6),
  dev: S0(23), upW: Wd(23, 5),
  reply: S0(24), replyW: Wd(24, 1),
  coming: S0(25), comingW: Wd(25, 0), myDoorW: Wd(25, 3),
  rule: S0(26), ownNameW: Wd(26, 7),
  yours: S0(27), yoursW2: Wd(27, 4),
  bolt: S0(28), boltW: Wd(28, 4), openW: Wd(28, 6),
  stand: S0(29), standW: Wd(29, 3), onceW: Wd(29, 6),
  going: S0(30), elevenW: Wd(30, 4),
  type: S0(31), typeW: Wd(31, 3),
  choice: Ln(32).start - 0.1, optA: Wd(33, 0), optB: Wd(34, 0), cta: Ln(35).start, ctaA: Wd(35, 1), ctaB: Wd(35, 3),
};

// ---------- HUD ----------
function hudState(t) {
  const time = t < K.added ? '3:01' : '3:02';
  const blink = (t0) => t < t0 + 0.6 ? (Math.floor(t * 12) % 2 ? C.red : C.white) : C.red;
  let r4 = ['GROUP', '43 MEMBERS', C.red];
  if (t >= K.leftW) r4 = ['GROUP', 'LEFT', t < K.leftW + 0.6 ? blink(K.leftW) : C.lime];
  if (t >= K.addedW) r4 = ['GROUP', 'ADDED BACK', blink(K.addedW)];
  if (t >= K.isYouW) r4 = ['MEMBER 43', '= YOU', blink(K.isYouW)];
  if (t >= K.yoursW) r4 = ['NUMBER', 'MATCH 100%', blink(K.yoursW)];
  if (t >= K.msg1W) r4 = ['SENT AS', 'YOU', blink(K.msg1W)];
  if (t >= K.upW) r4 = ['DEV', 'ROOM 11', t < K.upW + 0.6 ? blink(K.upW) : C.lime];
  if (t >= K.yoursW2) r4 = ['DEV', 'ANSWERED', blink(K.yoursW2)];
  if (t >= K.openW) r4 = ['ROOM 11', 'OPEN', blink(K.openW)];
  if (t >= K.standW) r4 = ['HEADCOUNT', 'MOVING', blink(K.standW)];
  return {
    t, part: 'PART 6', time, ampm: 'AM',
    rows: [t >= K.buzz ? ['BATTERY', '17%', C.red] : ['BATTERY', '18%', C.red],
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
const M = (ctx, t, st = {}) => X.drawMess(ctx, t, { lift: 0.15, stop: 1, turn: 1, ...st });
const ME = { x: 540, y: 2120, s: 1.75 };

// phone backgrounds: the bright hall out of focus behind the phone
const chatBG = (ctx, t) => {
  ctx.fillStyle = '#070a16'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.filter = 'blur(24px)'; ctx.globalAlpha = 0.9; camera(ctx, 540, 1150, 1.2); X.drawMess(ctx, t, { lift: 0.15, turn: 1, stop: 1 }); ctx.restore();
  ctx.fillStyle = 'rgba(3,4,10,0.42)'; ctx.fillRect(0, 0, W, H);
};
const T43 = '+91 ••••• •••43';
// the chat state over time
function msgs(t) {
  const m = [
    { from: 'Arjun', col: '#7fb0ff', text: 'mess bell?? at 3??', a: 1, time: '3:00 AM' },
    { from: 'Rohan', col: '#f0a35e', text: 'whos walking in the corridor', a: 1, time: '3:00 AM' },
  ];
  if (t > K.leftW - 0.1) m.push({ sys: true, text: 'You left', a: clamp((t - K.leftW + 0.1) / 0.3) });
  if (t > K.addedW - 0.1) m.push({ sys: true, text: `${T43} added you`, fg: '#ff8a94', a: clamp((t - K.addedW + 0.1) / 0.3), ring: t > K.backW ? clamp((t - K.backW) / 0.3) : 0, tap: t > K.nameW ? clamp((t - K.nameW) / 0.5) : 0 });
  if (t > K.msg1W - 0.05) m.push({ mine: true, text: 'guys its me. room 13', a: clamp((t - K.msg1W + 0.05) / 0.3), time: '3:02', ring: t > K.neverW ? clamp((t - K.neverW) / 0.3) : 0 });
  if (t > K.msg2W - 0.05) m.push({ mine: true, text: "im locked out. can someone open their door?", a: clamp((t - K.msg2W + 0.05) / 0.3), time: '3:02', ring: t > K.neverW ? clamp((t - K.neverW - 0.15) / 0.3) : 0 });
  if (t > K.comingW - 0.05) m.push({ from: 'Dev · Room 11', col: '#c6ff3a', text: 'coming. opening my door', a: clamp((t - K.comingW + 0.05) / 0.3), time: '3:02 AM', bg: t > K.yoursW2 ? '#4a1420' : undefined });
  // keep the newest on screen: drop the oldest when long
  while (m.length > 4) m.shift();
  return m;
}
const chat = (ctx, t, o = {}) => X.drawGroupChat(ctx, t, { sub: t > K.leftW && t < K.addedW ? 'You left this group' : '43 members · muted', bg: chatBG, msgs: msgs(t), ...o });

// 1. HOOK (frame 1): the bright mess hall, 42 pale blank faces turned to camera, slow push-in
shot('hook', 0, (ctx, t, lt) => {
  const z = lerp(1.06, 1.2, E.out(clamp(t / 3.4)));
  ctx.save(); camera(ctx, 540, lerp(1060, 1100, E.out(clamp(t / 3.4))), z);
  M(ctx, t, {});
  ctx.restore();
  capShade(ctx, 0.45);
}, { vignette: 0.45 });
// 2. And your number. — phone up: member 43 typing
shot('number', K.number, (ctx, t, lt) => {
  const z = lerp(1.0, 1.08, E.sine(clamp(lt / 1.4)));
  const [sx, sy] = shake(t, K.numberW, 14, 0.35);
  chat(ctx, t, { scale: z, shake: [sx, sy], typing: 1, typingFrom: `${T43}  ·  YOUR NUMBER` });
  if (t > K.numberW) redPulse(ctx, 0.25 * Math.exp(-(t - K.numberW) * 2.5));
}, { vignette: 0.5 });
// 3. You tap leave group. — the action sheet, tap on "Exit group"
shot('tap', K.tap, (ctx, t, lt) => {
  chat(ctx, t, { scale: lerp(1.02, 1.1, E.sine(clamp(lt / 1.8))), sheet: clamp(lt / 0.35), tap: t > K.leaveW ? clamp((t - K.leaveW) / 0.5) : 0 });
}, { vignette: 0.5 });
// 4. You left.
shot('left', K.left, (ctx, t, lt) => {
  chat(ctx, t, { scale: lerp(1.1, 1.2, E.out(clamp(lt / 1.2))), footer: "You can't send messages to this group", footerCol: C.lime });
  flash(ctx, t, K.leftW, 0.15);
}, { vignette: 0.5 });
// 5. For one second, it's quiet. — the hall, perfectly still, wide
shot('quiet', K.quiet, (ctx, t, lt) => {
  ctx.save(); camera(ctx, 540, 1080, lerp(1.0, 1.04, clamp(lt / 2.3)));
  M(ctx, t, { me: { x: 170, y: 1990, s: 1.35 } });
  ctx.restore();
}, { vignette: 0.45 });
// 6. Forty-two heads are still turned toward you. — slow push over the rows
shot('heads', K.heads, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.eyes - K.heads)));
  ctx.save(); camera(ctx, lerp(540, 460, k), lerp(1060, 1180, k), lerp(1.2, 1.7, k));
  M(ctx, t, {});
  ctx.restore();
  if (t > K.towardW) redPulse(ctx, 0.15 * Math.exp(-(t - K.towardW) * 3));
}, { vignette: 0.55 });
// 7. Nobody moves. Nobody has eyes. — one pale blank face, very close
shot('eyes', K.eyes, (ctx, t, lt) => {
  const [x, y] = X.messSeat(2, 3);
  const [sx, sy] = shake(t, K.eyesW, 16, 0.4);
  ctx.save(); camera(ctx, x - 4, y - 188 * 0.92, lerp(3.4, 3.9, E.sine(clamp(lt / 3))), sx, sy);
  M(ctx, t, {});
  ctx.restore();
  ctx.fillStyle = 'rgba(120,10,25,0.12)'; ctx.fillRect(0, 0, W, H);
  if (t > K.eyesW) redPulse(ctx, 0.3 * Math.exp(-(t - K.eyesW) * 2));
}, { vignette: 0.7 });
// 8-9. Then your phone buzzes again. Member 43 added you back.
shot('buzz', K.buzz, (ctx, t, lt) => {
  const b = t - K.buzzW; const sh = b > 0 && b < 0.35 ? (hash(Math.floor(t * 60)) - 0.5) * 0.03 : 0;
  const z = (t < K.added ? lerp(1.0, 1.06, clamp(lt / 2)) : lerp(1.06, 1.25, E.inOut(inv(K.added, K.backW + 0.4, t)))) + sh;
  const [sx, sy] = shake(t, K.addedW, 16, 0.4);
  chat(ctx, t, { scale: z, shake: [sx, sy] });
  if (t > K.addedW) redPulse(ctx, 0.3 * Math.exp(-(t - K.addedW) * 2));
}, { vignette: 0.5 });
// 10. You tap the name. — close on the pill, tap ripple
shot('tapName', K.tapName, (ctx, t, lt) => {
  chat(ctx, t, { scale: lerp(1.3, 1.42, E.out(clamp(lt / 1.2))) });
}, { vignette: 0.5 });
// 11-13. Group info. Member 43. The profile photo is you. Taken a second ago. From behind you.
shot('info', K.info, (ctx, t, lt) => {
  const photo = E.inOut(inv(K.photo, K.isYouW + 0.1, t));
  let z = lerp(1.0, 1.06, E.sine(clamp(lt / 3)));
  if (t > K.isYouW) z = lerp(1.06, 1.3, E.inOut(inv(K.isYouW, K.behindW + 0.3, t)));
  const [sx, sy] = shake(t, K.isYouW, 16, 0.45);
  X.drawMemberInfo(ctx, t, { bg: chatBG, scale: z, shake: [sx, sy], photo: t < K.photo ? 0.08 : lerp(0.08, 1, photo), rec: t > K.taken ? clamp((t - K.taken) / 0.3) : 0, hlNum: 0 });
  if (t > K.isYouW) redPulse(ctx, 0.3 * Math.exp(-(t - K.isYouW) * 2));
  if (t > K.behindW) redPulse(ctx, 0.25 * Math.exp(-(t - K.behindW) * 2.5));
}, { vignette: 0.5 });
// 14. You can see the back of your own head. — the photo IS the shot: you from behind, in the hall
shot('head', K.head, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.turn - K.head)));
  ctx.save(); camera(ctx, 540, lerp(1360, 1440, k), lerp(1.05, 1.35, k));
  M(ctx, t, { me: ME });
  ctx.restore();
  // camera-photo look: corners + REC
  ctx.save(); ctx.strokeStyle = 'rgba(238,241,247,0.8)'; ctx.lineWidth = 6;
  for (const [x, y, dx, dy] of [[80, 330, 1, 1], [1000, 330, -1, 1], [80, 1820, 1, -1], [1000, 1820, -1, -1]]) { ctx.beginPath(); ctx.moveTo(x, y + dy * 70); ctx.lineTo(x, y); ctx.lineTo(x + dx * 70, y); ctx.stroke(); }
  if (Math.floor(t * 2) % 2) { ctx.beginPath(); ctx.arc(860, 400, 14, 0, 7); ctx.fillStyle = C.red; ctx.fill(); }
  ctx.font = '30px Mono700'; ctx.fillStyle = 'rgba(238,241,247,0.85)'; ctx.textAlign = 'right'; ctx.fillText('3:01', 960, 411);
  ctx.restore();
  if (t > K.ownW) redPulse(ctx, 0.3 * Math.exp(-(t - K.ownW) * 2));
}, { vignette: 0.55 });
// 15. You don't turn around. — closer on the back of your head, heartbeat, the faces beyond
shot('turn', K.turn, (ctx, t, lt) => {
  const z = lerp(1.6, 1.75, E.sine(clamp(lt / 1.8)));
  const hb = Math.exp(-((lt % 0.8) * 8)) * 0.02;
  ctx.save(); camera(ctx, 540, 1500, z + hb);
  M(ctx, t, { me: ME });
  ctx.restore();
  ctx.fillStyle = 'rgba(2,3,10,0.2)'; ctx.fillRect(0, 0, W, H);
}, { vignette: 0.75 });
// 16-17. The number is yours. Your name. Your room. Thirteen. — back on the info rows
shot('num', K.num, (ctx, t, lt) => {
  const z = lerp(1.25, 1.4, E.sine(clamp(lt / (K.typing - K.num))));
  const [sx, sy] = shake(t, K.thirteenW, 14, 0.4);
  X.drawMemberInfo(ctx, t, { bg: chatBG, scale: z, photo: 1, rec: 1, shake: [sx, sy - 330], hlNum: E.out(inv(K.yoursW - 0.1, K.yoursW + 0.3, t)), hlAbout: E.out(inv(K.roomW - 0.1, K.roomW + 0.3, t)) });
  if (t > K.yoursW) redPulse(ctx, 0.25 * Math.exp(-(t - K.yoursW) * 2.5));
  if (t > K.thirteenW) redPulse(ctx, 0.3 * Math.exp(-(t - K.thirteenW) * 2.5));
}, { vignette: 0.5 });
// 18-20. And it is typing. "Guys. It's me. Room 13. I'm locked out..." — on YOUR side of the chat
shot('typing', K.typing, (ctx, t, lt) => {
  const z = t < K.msg1 ? lerp(1.0, 1.08, clamp(lt / 1.5)) : lerp(1.08, 1.18, E.sine(clamp((t - K.msg1) / (K.never - K.msg1))));
  chat(ctx, t, { scale: z, shake: [0, -lerp(0, 160, E.inOut(inv(K.msg1, K.msg2W, t)))], typing: t < K.msg1W ? clamp((t - K.typingW + 0.2) / 0.3) : 0, typingFrom: `${T43} (You)` });
  if (t > K.typingW) redPulse(ctx, 0.2 * Math.exp(-(t - K.typingW) * 2.5));
  if (t > K.doorW) redPulse(ctx, 0.2 * Math.exp(-(t - K.doorW) * 2.5));
}, { vignette: 0.5 });
// 21. You never sent that. — slam in on the bubbles, red rings
shot('never', K.never, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.neverW, 20, 0.45);
  chat(ctx, t, { scale: lerp(1.3, 1.45, E.out(clamp(lt / 1))), shake: [sx, sy - 240] });
  redPulse(ctx, 0.3 * Math.exp(-lt * 2));
}, { vignette: 0.55 });
// 22. Your phone has been in your hand the whole time. — you from behind, phone glowing, the faces beyond
shot('hand', K.hand, (ctx, t, lt) => {
  ctx.save(); camera(ctx, 540, lerp(1420, 1360, clamp(lt / 2.6)), lerp(1.0, 1.1, clamp(lt / 2.6)));
  M(ctx, t, { me: { ...ME, arm: 'phone', lit: 1 } });
  ctx.restore();
  if (t > K.handW) redPulse(ctx, 0.15 * Math.exp(-(t - K.handW) * 3));
}, { vignette: 0.55 });
// 23. Dev is in his room. Upstairs. — the dark corridor upstairs, light under door 11
shot('dev', K.dev, (ctx, t, lt) => {
  const d11 = X.doorDepth(11); const [nx, ny] = X.corrP(-430, 200, d11);
  ctx.save(); camera(ctx, lerp(540, nx + 120, E.inOut(clamp(lt / 2.6))), lerp(900, ny + 60, E.inOut(clamp(lt / 2.6))), lerp(1.0, 1.6, E.inOut(clamp(lt / 2.6))));
  X.drawHostelCorridor(ctx, t, { lights: [0, 0, 0, 0, 0], doorGlow: { '11': 0.8 } });
  ctx.restore();
}, { vignette: 0.6 });
// 24-25. Dev replies. "Coming. Opening my door."
shot('reply', K.reply, (ctx, t, lt) => {
  const z = lerp(1.1, 1.22, E.sine(clamp(lt / (K.rule - K.reply))));
  const [sx, sy] = shake(t, K.myDoorW, 12, 0.35);
  chat(ctx, t, { scale: z, shake: [sx, sy - 200], typing: t < K.comingW ? clamp((t - K.replyW + 0.3) / 0.3) : 0, typingFrom: 'Dev · Room 11', typingCol: C.lime });
  if (t > K.myDoorW) redPulse(ctx, 0.25 * Math.exp(-(t - K.myDoorW) * 2.5));
}, { vignette: 0.5 });
// 26. Rule one. Answer only to your own name.
shot('rule', K.rule, (ctx, t, lt) => {
  const y1 = R[0].y + 40;
  const z = lerp(1.25, 1.5, E.sine(clamp(lt / (K.yours - K.rule)))) * 0.84;
  ctx.save(); camera(ctx, 556, y1 + 170 / z, z);
  X.drawList(ctx, t, { hl: 0, hlA: E.out(inv(K.rule + 0.1, K.rule + 0.7, t)), done: 0, tx: 520 + (noise1(t) - 0.5) * 40, ty: y1 + 60, tr: 600, dark: 0.9 });
  ctx.restore();
  capShade(ctx); hudShade(ctx);
}, {});
// 27. Dev just answered to yours. — Dev's bubble turns red
shot('yours', K.yours, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.yoursW2, 20, 0.45);
  chat(ctx, t, { scale: lerp(1.35, 1.5, E.out(clamp(lt / 1.2))), shake: [sx, sy - 280] });
  if (t > K.yoursW2) redPulse(ctx, 0.35 * Math.exp(-(t - K.yoursW2) * 2));
}, { vignette: 0.55 });
// 28. Far above you, a bolt slides open. — door 11, the light under it spills out
shot('bolt', K.bolt, (ctx, t, lt) => {
  const d11 = X.doorDepth(11); const [nx, ny] = X.corrP(-430, 200, d11);
  const g = 0.8 + 1.4 * E.out(inv(K.boltW, K.openW + 0.5, t));
  const [sx, sy] = shake(t, K.boltW + 0.1, 12, 0.3);
  ctx.save(); camera(ctx, nx + 120, ny + 60, lerp(1.6, 1.8, E.sine(clamp(lt / 2.6))), sx, sy);
  X.drawHostelCorridor(ctx, t, { lights: [0, 0, 0, 0, 0], doorGlow: { '11': g } });
  ctx.restore();
  if (t > K.openW) redPulse(ctx, 0.2 * Math.exp(-(t - K.openW) * 2.5));
}, { vignette: 0.6 });
// 29. And forty-two students stand up. At once. — the bright hall, everyone rises together
shot('stand', K.stand, (ctx, t, lt) => {
  const rise = E.inOut(inv(K.standW - 0.1, K.standW + 0.5, t));
  const [sx, sy] = shake(t, K.onceW, 22, 0.45);
  ctx.save(); camera(ctx, 540, 1060, lerp(1.15, 1.25, E.out(clamp(lt / 2.5))), sx, sy);
  M(ctx, t, { rise });
  ctx.restore();
  if (t > K.standW) redPulse(ctx, 0.2 * Math.exp(-(t - K.standW) * 2.5));
  if (t > K.onceW) redPulse(ctx, 0.3 * Math.exp(-(t - K.onceW) * 2));
}, { vignette: 0.5 });
// 30. They're going to room eleven. — the corridor upstairs, a line of students from behind walking to door 11
shot('going', K.going, (ctx, t, lt) => {
  const d11 = X.doorDepth(11);
  ctx.save(); camera(ctx, 520, 900, lerp(1.0, 1.1, clamp(lt / 2.2)));
  X.drawHostelCorridor(ctx, t, { lights: [0, 0, 0, 0, 0], doorGlow: { '11': 2.2 } });
  // walkers: from the camera toward door 11, smaller with depth
  for (let i = 0; i < 9; i++) {
    const ph = ((lt * 0.28 + i / 9) % 1);
    const d = lerp(0.9, d11, ph);
    const [x, y] = X.corrP(lerp(60, -300, ph) + (i % 2 ? 90 : -40), 820, d);
    const sc = 1.25 / d;
    ctx.save(); ctx.globalAlpha = clamp(ph * 6) * clamp((1 - ph) * 5);
    X.drawStudentBack(ctx, x, y, sc, { lift: 0, rise: 1, col: 'rgba(238,241,247,0.85)' });
    ctx.restore();
  }
  ctx.restore();
  if (t > K.elevenW) redPulse(ctx, 0.25 * Math.exp(-(t - K.elevenW) * 2.5));
}, { vignette: 0.6 });
// 31. You can still type. — the keyboard comes up, "thats not m" with the cursor
shot('type', K.type, (ctx, t, lt) => {
  const txt = 'thats not m'.slice(0, Math.max(0, Math.floor((t - K.type - 0.3) * 7)));
  chat(ctx, t, { scale: lerp(1.0, 1.06, clamp(lt / 2)), compose: { text: txt, key: txt.slice(-1) } });
}, { vignette: 0.5 });
// 32-35. Choice card over the chat (your messages on your side)
shot('choice', K.choice, (ctx, t, lt) => {
  ctx.save(); ctx.filter = `blur(${(9 * clamp(lt / 0.4)).toFixed(1)}px)`;
  chat(ctx, t, { scale: 1.06 });
  ctx.restore();
  ctx.fillStyle = `rgba(3,5,12,${0.74 * clamp(lt / 0.35)})`; ctx.fillRect(0, 0, W, H);
  const q = ['WHAT', 'DO', 'YOU', 'DO?'];
  ctx.save(); ctx.font = '124px Osw700'; ctx.textBaseline = 'middle';
  const sp = 30; const ws = q.map(w => ctx.measureText(w).width); const tot = ws.reduce((a, b) => a + b, 0) + sp * 3;
  let x = 540 - tot / 2;
  q.forEach((w, i) => {
    const a = clamp((t - Wd(32, i) + 0.03) / 0.12);
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
  opt('A', 'WARN EVERYONE', 960, K.optA, K.optB - 0.1, 'TELL THEM IT ISN\'T YOU');
  opt('B', 'STAY QUIET', 1150, K.optB, K.cta - 0.1, 'IT\'S LEARNING HOW YOU TYPE');
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
    spaced(ctx, 'MOST VOTES DECIDE PART 7 · TOMORROW 3 PM', 540, 1580, 3, 'center');
    ctx.restore();
  }
}, { captions: false, vignette: 0.4 });

// ---------- overlay: small burned-in hook (frame 1) + recap stamp ----------
function overlay(ctx, t) {
  const ha = t < 2.7 ? 1 : clamp(1 - (t - 2.7) / 0.35);
  if (ha > 0) {
    const pop = lerp(1.12, 1, E.outBack(clamp(t / 0.35)));
    ctx.save(); ctx.globalAlpha = ha; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.translate(540, 560); ctx.scale(pop, pop); ctx.translate(-540, -560);
    ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = 24;
    ctx.font = '96px Osw700'; ctx.fillStyle = C.white; ctx.fillText('MEMBER 43', 540, 520);
    ctx.font = '110px Osw700'; ctx.fillStyle = C.red; ctx.fillText('IS ME', 540, 630);
    ctx.restore();
  }
  const r0 = K.tap + 0.05, r1 = K.left + 0.5;
  if (t > r0 && t < r1 + 0.3) {
    const a = clamp((t - r0) / 0.18) * clamp((r1 + 0.3 - t) / 0.3);
    const s = lerp(1.4, 1, E.outBack(clamp((t - r0) / 0.3)));
    ctx.save(); ctx.globalAlpha = a; ctx.translate(540, 470); ctx.rotate(-0.06); ctx.scale(s, s);
    rrect(ctx, -270, -70, 540, 140, 18); ctx.fillStyle = 'rgba(8,12,26,0.85)'; ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = C.lime; ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.lime;
    ctx.font = '70px Osw700'; ctx.fillText('YOU SAID A', 0, -8);
    ctx.font = '22px Mono700'; ctx.fillStyle = 'rgba(238,241,247,0.8)'; spaced(ctx, 'YOU LEFT THE GROUP', 0, 46, 2.5, 'center');
    ctx.restore();
  }
}

shots.sort((a, b) => a.start - b.start);
return { shots, K, hudState, overlay, coverTitle: 'MEMBER 43 [IS ME]', coverSize: 86 };
};
