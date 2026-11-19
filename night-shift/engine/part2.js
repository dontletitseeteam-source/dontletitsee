// NIGHT SHIFT — Episode 2 "The sleeper train" (the passenger hanging upside down from the top berth). Standalone, ~70 s.
// Standard (ANALYTICS): frame 1 = a BRIGHT, readable wide shot: the lit sleeper coach, two pale arms hanging from a top berth.
const D = require('./draw');
const X = require('./sets_train');
const { W, H, C, clamp, lerp, inv, E, noise1, shake, rrect, spaced, camera } = D;

module.exports = function build(TL) {
const Ln = id => TL.lines[id - 1];
const Wd = (id, k) => Ln(id).words[k].start;
const S0 = id => Ln(id).start - 0.06;
const K = {
  berthsW: Wd(1, 4), youW: Wd(1, 6), c73W: Wd(1, 8),
  arms: S0(2), armsW: Wd(2, 2), topW: Wd(2, 7),
  me: S0(3), lastW: Wd(3, 7), noteW: Wd(3, 11),
  r1: S0(4), r2: S0(5), r2n: Wd(5, 4), r3: S0(6), neverW: Wd(6, 1),
  last: S0(7), noW: Wd(7, 4), sitW: Wd(7, 8),
  station: S0(8), countW: Wd(8, 2), s73W: Wd(8, 4),
  chart: S0(9), c72W: Wd(9, 3),
  rule2: S0(10), againW: Wd(10, 4),
  above: S0(11), aboveW: Wd(11, 0), n71: Wd(11, 4), n72: Wd(11, 5),
  n73: S0(12), n73W: Wd(12, 0),
  rule3: S0(13), never3W: Wd(13, 2),
  look: S0(14), upW: Wd(14, 2),
  man: S0(15), hangsW: Wd(15, 2), upsideW: Wd(15, 3),
  face: S0(16), levelW: Wd(16, 3),
  smile: S0(17), smilesW: Wd(17, 1), forgotW: Wd(17, 3), yourselfW: Wd(17, 6),
  tunnel: S0(18), tunnelW: Wd(18, 1), dieW: Wd(18, 4),
  back: S0(19), backW: Wd(19, 3), goneW: Wd(19, 5),
  chart2: S0(20), lineW: Wd(20, 5), b73W: Wd(20, 7),
  nameW: Wd(21, 1), seat: Wd(21, 2) - 0.1, sittingW: Wd(21, 4),
  choice: Ln(22).start - 0.1, optA: Wd(22, 5), optB: Wd(22, 7), cta: Ln(23).start, ctaA: Wd(23, 1), ctaB: Wd(23, 3),
};

// ---------- HUD ----------
function hudState(t) {
  const blink = (t0, end = C.red) => t < t0 + 0.6 ? (Math.floor(t * 12) % 2 ? C.red : C.white) : end;
  const time = t < K.station ? '3:00' : t < K.rule2 ? '3:06' : t < K.tunnel ? '3:13' : '3:17';
  let cnt = ['COUNT', '72', C.white];
  if (t >= K.c73W) cnt = ['COUNT', '73', blink(K.c73W)];
  if (t >= K.n71 && t < K.n73W) cnt = ['COUNT', t < K.n72 ? '71' : '72', C.white];
  if (t >= K.n73W) cnt = ['COUNT', '73', blink(K.n73W)];
  let r3 = ['RULES', '3', C.white];
  if (t >= K.againW) r3 = ['RULE 2', 'KEPT', blink(K.againW, C.lime)];
  if (t >= K.n71) r3 = ['RULE 2', 'BENT', blink(K.n71)];
  if (t >= K.upW) r3 = ['RULE 3', 'BROKEN', blink(K.upW)];
  let r4 = ['BERTHS', '72', C.white];
  if (t >= K.hangsW) r4 = ['UB 41', 'OCCUPIED', blink(K.hangsW)];
  if (t >= K.goneW) r4 = ['UB 41', 'EMPTY', blink(K.goneW)];
  if (t >= K.b73W) r4 = ['BERTH 73', 'YOU', blink(K.b73W)];
  return { t, part: 'SHIFT 2', time, ampm: 'AM', labelW: 170, rows: [['COACH', 'S7 SLEEPER', C.white], cnt, r3, r4] };
}

const shots = [];
const shot = (name, start, draw, meta) => shots.push({ name, start, draw, meta });
const capShade = (ctx, a = 0.72) => { const g = ctx.createLinearGradient(0, 1250, 0, 1720); g.addColorStop(0, 'rgba(2,3,8,0)'); g.addColorStop(0.35, `rgba(2,3,8,${a})`); g.addColorStop(0.75, `rgba(2,3,8,${a})`); g.addColorStop(1, 'rgba(2,3,8,0)'); ctx.fillStyle = g; ctx.fillRect(0, 1250, W, 470); };
const hudShade = (ctx, a = 1) => { const g = ctx.createRadialGradient(170, 230, 180, 170, 230, 720); g.addColorStop(0, `rgba(2,3,8,${a})`); g.addColorStop(1, 'rgba(2,3,8,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 760, 820); };
const redPulse = (ctx, a) => { if (a < 0.01) return; const g = ctx.createRadialGradient(540, 960, 300, 540, 960, 1200); g.addColorStop(0, 'rgba(255,40,60,0)'); g.addColorStop(1, `rgba(255,40,60,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
const bluePulse = (ctx, a) => { if (a < 0.01) return; const g = ctx.createRadialGradient(540, 960, 300, 540, 960, 1200); g.addColorStop(0, 'rgba(60,110,255,0)'); g.addColorStop(1, `rgba(60,110,255,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
const flash = (ctx, t, t0, a = 0.8) => { if (t < t0 || t > t0 + 0.4) return; ctx.fillStyle = `rgba(235,240,255,${a * (1 - (t - t0) / 0.4)})`; ctx.fillRect(0, 0, W, H); };
const pulseAt = (ctx, t, t0, a = 0.3, k = 2.5) => { if (t > t0) redPulse(ctx, a * Math.exp(-(t - t0) * k)); };
const blueAt = (ctx, t, t0, a = 0.3, k = 2.5) => { if (t > t0) bluePulse(ctx, a * Math.exp(-(t - t0) * k)); };
const rumble = (t, a = 3) => [(noise1(t * 9) - 0.5) * a, (noise1(t * 11 + 4) - 0.5) * a];
// where the hanging arms are (world space of the coach)
const ARM = (() => { const m = X.BAYS[X.HANG_BAY] + 0.95 + 0.22; const [x, y] = X.P(-270, -424, m); return { x, y, m }; })();

// 1. HOOK (frame 1): the bright coach, two pale arms hang from a top berth; slow push
shot('hook', 0, (ctx, t, lt) => {
  const k = E.inOut(clamp(t / K.youW));
  const [rx, ry] = rumble(t);
  ctx.save(); camera(ctx, lerp(520, 500, k), lerp(900, 860, k), lerp(0.95, 1.2, k), rx, ry);
  X.drawCoach(ctx, t, { hanger: 'arms' });
  ctx.restore();
  hudShade(ctx, 0.55);
}, { vignette: 0.28 });
// 1b. You count seventy-three. — the clicker clicks up to 073, red
const clickN = (t, t0, t1, n0, n1) => Math.round(lerp(n0, n1, E.out(inv(t0, t1, t))));
shot('click1', K.youW - 0.05, (ctx, t, lt) => {
  const n = clickN(t, K.youW, K.c73W + 0.05, 64, 73);
  const [sx, sy] = shake(t, K.c73W, 14, 0.35);
  ctx.save(); camera(ctx, 540, 980, lerp(1.0, 1.12, clamp(lt / 1.8)), sx, sy);
  X.drawClicker(ctx, t, { n, press: Math.abs(Math.sin(t * 22)) * (t < K.c73W + 0.1 ? 1 : 0), red: t >= K.c73W ? 1 : 0 });
  ctx.restore();
  hudShade(ctx, 0.6); flash(ctx, t, K.youW - 0.05, 0.3);
  pulseAt(ctx, t, K.c73W, 0.35, 2);
}, { vignette: 0.4 });
// 2. Two pale arms hang down from a top berth. — push in to the arms
shot('arms', K.arms, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.me - K.arms)));
  ctx.save(); camera(ctx, lerp(500, ARM.x + 10, k), lerp(860, ARM.y + 130, k), lerp(1.2, 1.9, k));
  X.drawCoach(ctx, t, { hanger: 'arms', light: 0.95 });
  ctx.restore();
  hudShade(ctx, 0.6);
  flash(ctx, t, K.arms, 0.25); pulseAt(ctx, t, K.armsW, 0.25);
}, { vignette: 0.45 });
// 3. Your first night as ticket checker. — you in the aisle, back to us, the chart under your arm
shot('me', K.me, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.lastW - K.me)));
  const [rx, ry] = rumble(t);
  ctx.save(); camera(ctx, 540, lerp(980, 940, k), lerp(1.05, 1.2, k), rx, ry);
  X.drawCoach(ctx, t, { hanger: 'arms', me: { d: 1.25, x: 30, view: 'back' } });
  ctx.restore();
  hudShade(ctx, 0.65);
}, { vignette: 0.35 });
const noteCam = (ctx, cy, z, sx = 0, sy = 0) => { ctx.save(); camera(ctx, 540, cy, z, sx, sy); };
shot('note', K.lastW, (ctx, t, lt) => {
  const k = E.out(clamp(lt / (K.r1 - K.lastW)));
  noteCam(ctx, lerp(820, 900, k), lerp(0.9, 1.0, k));
  X.drawTrainNote(ctx, t, { last: 0 });
  ctx.restore();
  capShade(ctx, 0.5); hudShade(ctx, 0.7);
}, {});
// 4-6. the three rules
const R = X.TRAIN_RULES;
const ruleShot = (i, t0, t1, hlW) => shot('rule' + (i + 1), t0, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / 0.5));
  const prevY = i ? R[i - 1].y + 40 : 900;
  noteCam(ctx, lerp(prevY, R[i].y + 40, k) + 40, lerp(1.25, 1.45, clamp(lt / (t1 - t0))));
  X.drawTrainNote(ctx, t, { last: 0, hl: i, hlA: E.out(inv(hlW - 0.1, hlW + 0.5, t)), dim: 1 });
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
// 7. Under them: There is no berth seventy-three. Don't sit in it. — the red line writes itself
shot('last', K.last, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.station - K.last)));
  noteCam(ctx, lerp(1380, 1470, k), lerp(1.3, 1.6, k));
  X.drawTrainNote(ctx, t, { last: E.inOut(inv(K.noW - 0.8, K.sitW + 0.5, t)), dim: 0 });
  ctx.restore();
  capShade(ctx, 0.5); hudShade(ctx);
  pulseAt(ctx, t, K.noW, 0.2); pulseAt(ctx, t, K.sitW, 0.25);
}, {});
// 8. Next station. — platform light floods the windows; you walk the aisle
shot('station', K.station, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.countW - K.station)));
  ctx.save(); camera(ctx, lerp(560, 540, k), 900, lerp(1.0, 1.12, k));
  X.drawCoach(ctx, t, { hanger: 'arms', station: 1, me: { d: lerp(1.5, 1.8, k), x: 40, view: 'back' } });
  ctx.restore();
  hudShade(ctx, 0.6); flash(ctx, t, K.station, 0.3);
}, { vignette: 0.35 });
// 8b. You count. Seventy-three. — clicker climbs, lands on 073
shot('click2', K.countW - 0.08, (ctx, t, lt) => {
  const n = clickN(t, K.countW, K.s73W + 0.05, 40, 73);
  const [sx, sy] = shake(t, K.s73W, 16, 0.4);
  ctx.save(); camera(ctx, 540, 990, lerp(1.0, 1.2, clamp(lt / 2.4)), sx, sy);
  X.drawClicker(ctx, t, { n, press: t < K.s73W + 0.1 ? Math.abs(Math.sin(t * 24)) : 0, red: t >= K.s73W ? 1 : 0 });
  ctx.restore();
  hudShade(ctx, 0.6); pulseAt(ctx, t, K.s73W, 0.4, 2);
}, { vignette: 0.4 });
// 9. The chart says seventy-two names. — end of chart, 72 highlighted
shot('chart', K.chart, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.rule2 - K.chart)));
  ctx.save(); camera(ctx, 540, lerp(1200, 1430, k), lerp(1.0, 1.35, k));
  X.drawChart(ctx, t, { hl72: E.out(inv(K.c72W - 0.1, K.c72W + 0.5, t)) });
  ctx.restore();
  capShade(ctx, 0.5); hudShade(ctx);
}, { vignette: 0.4 });
// 10. Rule two. You don't count again. — the night lamps come on; you stand still, clicker down
shot('rule2', K.rule2, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.above - K.rule2)));
  const nt = E.inOut(inv(K.rule2, K.rule2 + 0.6, t));
  ctx.save(); camera(ctx, 540, lerp(940, 900, k), lerp(1.15, 1.3, k));
  X.drawCoach(ctx, t, { hanger: 'arms', night: nt, light: 1 - 0.5 * nt, me: { d: 1.35, x: 60, view: 'front', headDY: 0 } });
  ctx.restore();
  hudShade(ctx, 0.6);
}, { vignette: 0.45 });
// 11. Above you, someone does. Seventy-one. Seventy-two. — the clicker counts by itself, a shadow falls over it
shot('above', K.above, (ctx, t, lt) => {
  const n = t < K.n71 ? 70 : t < K.n72 ? 71 : 72;
  const k = clamp(lt / (K.n73 - K.above));
  ctx.save(); camera(ctx, 540, 1000, lerp(1.0, 1.25, E.inOut(k)));
  X.drawClicker(ctx, t, { n, self: true, night: 1, press: (t > K.n71 && t < K.n71 + 0.15) || (t > K.n72 && t < K.n72 + 0.15) ? 1 : 0 });
  ctx.restore();
  // the shadow of hanging arms sliding down over the hand
  const sh = E.inOut(inv(K.aboveW, K.n72 + 0.6, t));
  ctx.save(); ctx.globalAlpha = 0.55 * sh; ctx.strokeStyle = '#000'; ctx.lineCap = 'round'; ctx.lineWidth = 90;
  for (const ox of [-160, 200]) { ctx.beginPath(); ctx.moveTo(540 + ox, -100); ctx.lineTo(540 + ox * 1.1 + Math.sin(t + ox) * 20, lerp(-100, 900, sh)); ctx.stroke(); }
  ctx.restore();
  hudShade(ctx, 0.6);
  blueAt(ctx, t, K.n71, 0.2); blueAt(ctx, t, K.n72, 0.25);
}, { vignette: 0.55 });
// 12. Seventy-three. — 073, red, whispered
shot('n73', K.n73, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.n73W, 18, 0.45);
  ctx.save(); camera(ctx, 540, 1000, lerp(1.25, 1.5, E.out(clamp(lt / 1.4))), sx, sy);
  X.drawClicker(ctx, t, { n: 73, self: true, night: 1, red: 1, press: t < K.n73W + 0.15 && t > K.n73W ? 1 : 0 });
  ctx.restore();
  hudShade(ctx, 0.6); pulseAt(ctx, t, K.n73W, 0.45, 1.8);
}, { vignette: 0.55 });
// 13. Rule three. Never look up. — the note in the night-lamp blue, rule 3 lit
shot('rule3', K.rule3, (ctx, t, lt) => {
  noteCam(ctx, R[2].y + 80, lerp(1.4, 1.65, clamp(lt / (K.look - K.rule3))));
  X.drawTrainNote(ctx, t, { last: 1, hl: 2, hlA: E.out(inv(K.never3W - 0.1, K.never3W + 0.4, t)), dim: 1, night: 1, dark: 0.35 });
  ctx.restore();
  capShade(ctx, 0.6); hudShade(ctx);
  bluePulse(ctx, 0.15);
}, {});
// 14. You look up. — tilt up the dark aisle towards the top berth
shot('look', K.look, (ctx, t, lt) => {
  const k = E.inOut(inv(K.look, K.upW + 0.3, t));
  ctx.save(); camera(ctx, lerp(520, ARM.x + 30, k), lerp(1250, ARM.y + 120, k), lerp(1.4, 1.9, k));
  X.drawCoach(ctx, t, { hanger: 'full', night: 1, light: 0.5, smile: 0 });
  ctx.restore();
  hudShade(ctx, 0.6); pulseAt(ctx, t, K.upW, 0.3);
}, { vignette: 0.55 });
// 15. A man hangs upside down from the top berth. — the full picture: him and you, face to face
shot('man', K.man, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.face - K.man)));
  const [sx, sy] = shake(t, K.upsideW, 12, 0.35);
  ctx.save(); camera(ctx, lerp(520, 520, k), lerp(880, 870, k), lerp(1.45, 1.7, k), sx, sy);
  X.drawCoach(ctx, t, { hanger: 'full', night: 1, light: 0.5, smile: 0, me: { d: 1.9, x: 170, view: 'back', board: false } });
  ctx.restore();
  hudShade(ctx, 0.6);
  flash(ctx, t, K.man, 0.3); pulseAt(ctx, t, K.upsideW, 0.35, 2);
}, { vignette: 0.5 });
// 16. His face is level with yours. — THE POSTER IMAGE
shot('face', K.face, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.smile - K.face)));
  ctx.save(); camera(ctx, 540, 960, lerp(1.0, 1.08, k));
  X.drawHangerFace(ctx, t, { smile: 0, push: k });
  ctx.restore();
  hudShade(ctx, 0.7); blueAt(ctx, t, K.face, 0.25);
}, { vignette: 0.5 });
// 17. He smiles. You forgot to count yourself.
shot('smile', K.smile, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.tunnel - K.smile)));
  const [sx, sy] = shake(t, K.yourselfW, 16, 0.45);
  ctx.save(); camera(ctx, 540, lerp(960, 1000, k), lerp(1.08, 1.3, k), sx, sy);
  X.drawHangerFace(ctx, t, { smile: E.out(inv(K.smilesW - 0.1, K.smilesW + 0.7, t)), push: 1 });
  ctx.restore();
  hudShade(ctx, 0.7);
  pulseAt(ctx, t, K.smilesW, 0.3); pulseAt(ctx, t, K.yourselfW, 0.45, 1.8);
}, { vignette: 0.55 });
// 18. A tunnel. The lights die. — tunnel lamps strobe past, then black
shot('tunnel', K.tunnel, (ctx, t, lt) => {
  const off = t >= K.dieW;
  const strobe = 0.5 + 0.5 * Math.sin(t * 40);
  const [rx, ry] = rumble(t, 8);
  ctx.save(); camera(ctx, 520, 880, 1.25, rx, ry);
  X.drawCoach(ctx, t, { hanger: 'full', night: 1, light: 0.5, smile: 1, me: { d: 1.7, x: 150, view: 'back', board: false }, dark: off ? 0.97 - 0.1 * Math.abs(Math.sin(t * 30)) * Math.exp(-(t - K.dieW) * 3) : 0.3 * strobe });
  ctx.restore();
  if (!off) { ctx.fillStyle = `rgba(255,190,110,${0.12 * strobe})`; ctx.fillRect(0, 0, W, H); }
  hudShade(ctx, 0.6);
}, { vignette: 0.6 });
// 19. When they come back, he's gone. — lights back on: the top berth is empty
shot('back', K.back, (ctx, t, lt) => {
  const on = inv(K.backW - 0.2, K.backW + 0.05, t);
  const L = on > 0 ? 0.8 + 0.2 * Math.abs(Math.sin(t * 25)) * Math.exp(-(t - K.backW) * 3) : 0;
  ctx.save(); camera(ctx, lerp(520, ARM.x + 30, E.inOut(inv(K.backW, K.chart2, t))), lerp(880, ARM.y + 150, E.inOut(inv(K.backW, K.chart2, t))), lerp(1.25, 1.7, E.inOut(inv(K.backW, K.chart2, t))));
  X.drawCoach(ctx, t, { hanger: 'full', emptyHang: true, night: 0.2, light: L, me: { d: 1.7, x: 150, view: 'back', board: false }, dark: 1 - on * 0.95 });
  ctx.restore();
  hudShade(ctx, 0.6);
  blueAt(ctx, t, K.goneW, 0.3);
}, { vignette: 0.45 });
// 20. The chart has a new line. Berth seventy-three. Your name. — red ink writes itself under the end of the chart
shot('chart2', K.chart2, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.seat - K.chart2)));
  const [sx, sy] = shake(t, K.nameW, 14, 0.4);
  ctx.save(); camera(ctx, 540, lerp(1350, 1560, k), lerp(1.1, 1.5, k), sx, sy);
  X.drawChart(ctx, t, { newLine: E.inOut(inv(K.lineW - 0.2, K.b73W + 0.4, t)), ring73: E.out(inv(K.nameW - 0.1, K.nameW + 0.5, t)), hl72: 0 });
  ctx.restore();
  capShade(ctx, 0.5); hudShade(ctx);
  pulseAt(ctx, t, K.b73W, 0.3); pulseAt(ctx, t, K.nameW, 0.45, 1.8);
}, { vignette: 0.45 });
// 21. And you're sitting in it. — your seat plate flips from 63 to 73
shot('seat', K.seat, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.choice - K.seat)));
  const [sx, sy] = shake(t, K.sittingW, 16, 0.4);
  ctx.save(); camera(ctx, lerp(600, 560, k), lerp(1000, 920, k), lerp(1.0, 1.2, k), sx, sy);
  X.drawSeat(ctx, t, { plate: inv(K.sittingW - 0.05, K.sittingW + 0.1, t), night: 0.3 });
  ctx.restore();
  hudShade(ctx, 0.6);
  pulseAt(ctx, t, K.sittingW, 0.5, 1.6);
}, { vignette: 0.45 });
// 22-23. Choice card over the empty top berth
shot('choice', K.choice, (ctx, t, lt) => {
  ctx.save(); ctx.filter = `blur(${(9 * clamp(lt / 0.4)).toFixed(1)}px)`;
  ctx.save(); camera(ctx, 520, 880, 1.2); X.drawCoach(ctx, t, { hanger: 'full', emptyHang: true, night: 0.6, light: 0.7 }); ctx.restore();
  ctx.restore();
  ctx.fillStyle = `rgba(3,5,12,${0.76 * clamp(lt / 0.35)})`; ctx.fillRect(0, 0, W, H);
  const q = [['WHICH', 'RULE'], ['WOULD', 'YOU', 'BREAK?']];
  ctx.save(); ctx.font = '112px Osw700'; ctx.textBaseline = 'middle';
  let wi = 0;
  q.forEach((row, ri) => {
    const sp = 30; const ws = row.map(w => ctx.measureText(w).width); const tot = ws.reduce((a, b) => a + b, 0) + sp * (row.length - 1);
    let x = 540 - tot / 2;
    row.forEach((w, i) => {
      const a = clamp((t - Wd(22, wi) + 0.03) / 0.12); wi++;
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
    ctx.textAlign = 'left'; ctx.fillStyle = C.white; ctx.font = '58px Osw700'; ctx.fillText(label, 266, y - 8);
    ctx.font = '24px Mono500'; ctx.fillStyle = 'rgba(238,241,247,0.6)'; spaced(ctx, sub, 268, y + 42, 1.5);
    ctx.restore();
  };
  opt('A', 'RULE 2 · COUNT AGAIN', 840, K.optA, K.optB - 0.1, 'AND HEAR WHO COUNTS WITH YOU');
  opt('B', 'RULE 3 · LOOK UP', 1030, K.optB, K.cta - 0.1, 'AND MEET HIM FACE TO FACE');
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
  const ha = t < K.youW - 0.1 ? 1 : clamp(1 - (t - K.youW + 0.1) / 0.25);
  if (ha > 0) {
    const pop = lerp(1.12, 1, E.outBack(clamp(t / 0.35)));
    ctx.save(); ctx.globalAlpha = ha; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.translate(540, 1130); ctx.scale(pop, pop); ctx.translate(-540, -1130);
    ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 28;
    rrect(ctx, 150, 1005, 780, 250, 26); ctx.fillStyle = 'rgba(6,8,18,0.78)'; ctx.fill();
    ctx.shadowBlur = 0;
    ctx.font = '96px Osw700'; ctx.fillStyle = C.white; ctx.fillText('72 BERTHS.', 540, 1115);
    ctx.fillStyle = C.red; ctx.fillText('73 PASSENGERS.', 540, 1220);
    ctx.restore();
  }
}

shots.sort((a, b) => a.start - b.start);
return { shots, K, hudState, overlay, coverTitle: 'HE HANGS {UPSIDE DOWN}', coverSize: 84, coverSub: 'NIGHT SHIFT · 3 AM' };
};
