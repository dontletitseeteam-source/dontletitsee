// NIGHT SHIFT — Episode 5 "The school night watchman" (the girl who swings without moving her legs). Standalone, ~70 s.
// Standard (ANALYTICS): frame 1 = a BRIGHT, readable wide shot: the floodlit schoolyard, the girl on the swing mid-arc,
// legs hanging dead straight. POSTER image: her face rising to your 2nd-floor window at the top of the arc (L13).
const D = require('./draw');
const X = require('./sets_school');
const { W, H, C, clamp, lerp, inv, E, shake, rrect, spaced, camera } = D;

module.exports = function build(TL) {
const Ln = id => TL.lines[id - 1];
const Wd = (id, k) => Ln(id).words[k].start;
const S0 = id => Ln(id).start - 0.06;
const K = {
  girlW: Wd(1, 3), swingsW: Wd(1, 4), yardW: Wd(1, 8),
  legs: S0(2), legsW: Wd(2, 1), neverW: Wd(2, 2), moveW: Wd(2, 3),
  me: S0(3), watchW: Wd(3, 6), threeW: Wd(3, 11),
  r1: S0(4), r2: S0(5), r3: S0(6),
  last: S0(7), sheW: Wd(7, 2), presW: Wd(7, 5),
  rule1: S0(8), bellW: Wd(8, 5), ringsW: Wd(8, 6), itselfW: Wd(8, 8),
  thirteenW: Wd(9, 0), timesW: Wd(9, 1), ringW: Wd(9, 5),
  creak: S0(10), swingW: Wd(10, 2), creakW: Wd(10, 4),
  rule2: S0(11), insideW: Wd(11, 4), windowW: Wd(11, 7),
  higher: S0(12), h1W: Wd(12, 0), h2W: Wd(12, 1), legs2W: Wd(12, 3), stillW: Wd(12, 6),
  top: S0(13), topW: Wd(13, 2), faceW: Wd(13, 4), reachW: Wd(13, 5), winW: Wd(13, 7),
  voice: S0(14), voiceW: Wd(14, 3), callsW: Wd(14, 4), rollW: Wd(14, 6),
  every: S0(15), regW: Wd(15, 4),
  rule3: S0(16), callsYW: Wd(16, 3), nameW: Wd(16, 5),
  say: S0(17), sayW: Wd(17, 3), presentW: Wd(17, 4),
  stops: S0(18), stopsW: Wd(18, 2), emptyW: Wd(18, 6),
  reg: S0(19), herNameW: Wd(19, 3), tickedW: Wd(19, 4), tickPresW: Wd(19, 5),
  since: S0(20), nineteenW: Wd(20, 3),
  below: S0(21), yourW: Wd(21, 2),
  tick: S0(22), tick2W: Wd(22, 0), pres2W: Wd(22, 1), andW: Wd(22, 2), secondW: Wd(22, 4), movingW: Wd(22, 7),
  choice: Ln(23).start - 0.1, optA: Wd(23, 5), optB: Wd(23, 8), cta: Ln(24).start, ctaA: Wd(24, 2), ctaB: Wd(24, 4),
};

// her swing: a pendulum whose amplitude grows; it stops on "stops"
const amp = t => t < K.higher ? 0.42 : t < K.top ? lerp(0.42, 0.7, inv(K.higher, K.top, t)) : 0.7;
const a1 = (t, k = 1) => (t >= K.stopsW ? amp(t) * Math.exp(-(t - K.stopsW) * 3.5) : amp(t)) * Math.sin(t * 2.3) * k;
const seat = (t, ang) => [X.SW.p1 - X.SW.len * Math.sin(ang), X.SW.top + X.SW.len * Math.cos(ang)];
// the 13 bell strokes, from "rings" to "Thirteen"
const bellCount = t => t < K.ringsW ? 0 : 1 + 12 * inv(K.ringsW, K.thirteenW + 0.15, t);
const bellAng = t => { const c = bellCount(t); return c <= 0 ? 0 : (t > K.ringW + 0.6 ? 0.5 * Math.exp(-(t - K.ringW - 0.6) * 2) : 0.5) * Math.sin(c * Math.PI); };

// ---------- HUD ----------
function hudState(t) {
  const blink = (t0, end = C.red) => t < t0 + 0.6 ? (Math.floor(t * 12) % 2 ? C.red : C.white) : end;
  const time = t < K.rule1 ? '2:51' : t < K.rule2 ? '3:00' : t < K.voice ? '3:01' : t < K.stops ? '3:03' : '3:04';
  let b = ['BELL', 'SILENT', C.white];
  if (t >= K.ringsW) b = ['BELL', `RINGING ${Math.min(13, Math.floor(bellCount(t)))}/13`, bellCount(t) >= 13 ? blink(K.thirteenW) : C.white];
  if (t >= K.creakW) b = ['SWING', 'CREAKING', blink(K.creakW)];
  if (t >= K.h1W) b = ['SWING', 'HIGHER', blink(K.h1W)];
  if (t >= K.faceW) b = ['SWING', 'AT YOUR WINDOW', blink(K.faceW)];
  if (t >= K.stopsW) b = ['SWING', 'STOPPED', C.white];
  if (t >= K.secondW) b = ['SWING 2', 'MOVING', blink(K.secondW)];
  let rl = ['RULES', '3', C.white];
  if (t >= K.ringsW) rl = ['RULE 1', 'KEPT', blink(K.ringsW, C.lime)];
  if (t >= K.insideW) rl = ['RULE 2', 'KEPT · INSIDE', blink(K.insideW, C.lime)];
  if (t >= K.presentW) rl = ['RULE 3', 'BROKEN', blink(K.presentW)];
  let ro = ['ROLL', '—', C.white];
  if (t >= K.callsW) ro = ['ROLL', 'CALLING', blink(K.callsW)];
  if (t >= K.nameW) ro = ['ROLL', 'SAM?', blink(K.nameW)];
  if (t >= K.presentW) ro = ['ROLL', 'SAM · PRESENT', blink(K.presentW)];
  if (t >= K.nineteenW) ro = ['MEERA S.', 'SINCE 1998', blink(K.nineteenW)];
  if (t >= K.tick2W) ro = ['SAM', 'TICKED · PRESENT', blink(K.tick2W)];
  return { t, part: 'SHIFT 5', time, ampm: 'AM', labelW: 150, rows: [['SCHOOL 13', 'WATCHMAN', C.white], b, rl, ro] };
}

const shots = [];
const shot = (name, start, draw, meta) => shots.push({ name, start, draw, meta });
const capShade = (ctx, a = 0.72) => { const g = ctx.createLinearGradient(0, 1250, 0, 1720); g.addColorStop(0, 'rgba(2,3,8,0)'); g.addColorStop(0.35, `rgba(2,3,8,${a})`); g.addColorStop(0.75, `rgba(2,3,8,${a})`); g.addColorStop(1, 'rgba(2,3,8,0)'); ctx.fillStyle = g; ctx.fillRect(0, 1250, W, 470); };
const hudShade = (ctx, a = 1) => { const g = ctx.createRadialGradient(170, 230, 180, 170, 230, 720); g.addColorStop(0, `rgba(2,3,8,${a})`); g.addColorStop(1, 'rgba(2,3,8,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 760, 820); };
const redPulse = (ctx, a) => { if (a < 0.01) return; const g = ctx.createRadialGradient(540, 960, 300, 540, 960, 1200); g.addColorStop(0, 'rgba(255,40,60,0)'); g.addColorStop(1, `rgba(255,40,60,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
const flash = (ctx, t, t0, a = 0.8) => { if (t < t0 || t > t0 + 0.4) return; ctx.fillStyle = `rgba(235,240,255,${a * (1 - (t - t0) / 0.4)})`; ctx.fillRect(0, 0, W, H); };
const pulseAt = (ctx, t, t0, a = 0.3, k = 2.5) => { if (t > t0) redPulse(ctx, a * Math.exp(-(t - t0) * k)); };
const ME = (o) => ({ s: 1.0, view: 'front', ...o });

// 1. HOOK (frame 1): the bright floodlit yard, the girl swinging, legs dead straight
shot('hook', 0, (ctx, t, lt) => {
  const k = E.inOut(clamp(t / K.legs));
  ctx.save(); camera(ctx, lerp(470, 445, k), lerp(1190, 1250, k), lerp(1.28, 1.5, k));
  X.drawYard(ctx, t, { a1: a1(t), girl: 1, face: { smile: 0.5 } });
  ctx.restore();
  hudShade(ctx, 0.5);
}, { vignette: 0.22 });
// 2. Her legs never move. — close on the legs, the camera rides the swing
shot('legs', K.legs, (ctx, t, lt) => {
  const ang = a1(t); const [sx0, sy0] = seat(t, ang);
  const [sx, sy] = shake(t, K.neverW, 12, 0.35);
  ctx.save(); camera(ctx, lerp(X.SW.p1, sx0, 0.75), sy0 + 20, lerp(2.4, 2.8, clamp(lt / 1.5)), sx, sy);
  X.drawYard(ctx, t, { a1: ang, girl: 1, face: { smile: 0.6 } });
  ctx.restore();
  hudShade(ctx, 0.6); flash(ctx, t, K.legs, 0.25); pulseAt(ctx, t, K.neverW, 0.35, 2);
  // a red "no bend" marker along her straight legs
}, { vignette: 0.4 });
// 3. Your first night as the school watchman. — you at the gate with a torch, the swings still
shot('me', K.me, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.threeW - K.me)));
  ctx.save(); camera(ctx, lerp(560, 600, k), lerp(1150, 1250, k), lerp(1.1, 1.3, k));
  X.drawYard(ctx, t, { a1: 0, girl: 0, light: 0.9, me: ME({ x: 820, y: 1780, s: 1.1, view: 'back', arm: 'phone', lit: 1 }) });
  ctx.restore();
  hudShade(ctx, 0.6);
}, { vignette: 0.4 });
// 3b-7. the register: three rules + the last line
shot('note', K.threeW - 0.05, (ctx, t, lt) => {
  ctx.save(); camera(ctx, 540, lerp(880, 920, E.out(clamp(lt / 0.6))), lerp(1.08, 1.0, E.out(clamp(lt / 0.5))));
  X.drawRules(ctx, t, { last: 0 });
  ctx.restore();
  hudShade(ctx, 0.7); flash(ctx, t, K.threeW - 0.05, 0.25);
}, { vignette: 0.4 });
const R = X.NOTE_RULES;
const ruleShot = (i, t0, t1, hlW) => shot('rule' + (i + 1), t0, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / 0.5));
  const prevY = i ? R[i - 1].y : 760;
  ctx.save(); camera(ctx, 560, lerp(prevY, R[i].y, k) + 40, lerp(1.45, 1.58, clamp(lt / (t1 - t0))));
  X.drawRules(ctx, t, { hl: i, hlA: E.out(inv(hlW - 0.1, hlW + 0.5, t)), dim: 1, last: 0 });
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
  const k = E.inOut(clamp(lt / (K.rule1 - K.last)));
  const [sx, sy] = shake(t, K.presW, 12, 0.35);
  ctx.save(); camera(ctx, 560, lerp(1330, 1400, k), lerp(1.5, 1.7, k), sx, sy);
  X.drawRules(ctx, t, { last: E.inOut(inv(K.sheW - 0.2, K.presW + 0.4, t)), dim: 0.5, hl: -1 });
  ctx.restore();
  capShade(ctx, 0.5); hudShade(ctx);
  pulseAt(ctx, t, K.presW, 0.3);
}, {});
// 8. Rule one. At three, the bell rings by itself. — wide, the bell by the door starts to swing
shot('three', K.rule1, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.bellW - K.rule1)));
  ctx.save(); camera(ctx, lerp(560, 680, k), lerp(1000, 760, k), lerp(1.1, 1.9, k));
  X.drawYard(ctx, t, { a1: 0, girl: 0, bell: bellAng(t), me: ME({ x: 820, y: 1780, s: 1.1, view: 'back', arm: 'phone', lit: 1 }) });
  ctx.restore();
  hudShade(ctx, 0.6);
}, { vignette: 0.4 });
// 8b-9. the bell close-up: it swings by itself, the rope hangs still. 1/13 … 13/13
shot('bell', K.bellW - 0.06, (ctx, t, lt) => {
  const c = bellCount(t);
  const hit = Math.floor(c); const since = c - hit;
  const [sx, sy] = t > K.ringsW ? [Math.sin(t * 60) * 6 * Math.exp(-since * 4), 0] : [0, 0];
  const z = t < K.thirteenW ? lerp(1.0, 1.15, inv(K.bellW, K.thirteenW, t)) : 1.22;
  ctx.save(); camera(ctx, 540, 860, z, sx, sy);
  X.drawBell(ctx, t, { ang: bellAng(t), count: c });
  ctx.restore();
  hudShade(ctx, 0.7); flash(ctx, t, K.bellW - 0.06, 0.25); pulseAt(ctx, t, K.thirteenW, 0.4, 2);
}, { vignette: 0.4 });
// 10. Outside, a swing starts creaking. — wide, darker; the girl fades in on her swing
shot('creak', K.creak, (ctx, t, lt) => {
  const g = E.inOut(inv(K.swingW, K.creakW + 0.4, t));
  ctx.save(); camera(ctx, lerp(520, 470, E.inOut(clamp(lt / 2.2))), 1230, lerp(1.35, 1.6, clamp(lt / 2.2)));
  X.drawYard(ctx, t, { a1: a1(t, g), girl: g, light: 0.8, face: { smile: 0.4 } });
  ctx.restore();
  hudShade(ctx, 0.6); pulseAt(ctx, t, K.creakW, 0.3);
}, { vignette: 0.5 });
// 11. Rule two. You stay inside, at the window.
shot('window', K.rule2, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.higher - K.rule2)));
  ctx.save(); camera(ctx, lerp(470, 540, k), lerp(1100, 900, k), lerp(1.15, 1.3, k));
  X.drawWindow(ctx, t, { a1: a1(t), girl: 1, me: ME({ x: 330, y: 1960, s: 1.35, view: 'back' }) });
  ctx.restore();
  hudShade(ctx, 0.6);
}, { vignette: 0.5 });
// 12. Higher. Higher. Her legs hang dead still. — the swing, close, climbing
shot('higher', K.higher, (ctx, t, lt) => {
  const ang = a1(t); const [sx0, sy0] = seat(t, ang);
  const z = t < K.h2W ? 1.4 : t < K.legs2W ? 1.75 : 2.5;
  const [sx, sy] = shake(t, t < K.h2W ? K.h1W : t < K.legs2W ? K.h2W : K.legs2W, 12, 0.3);
  ctx.save(); camera(ctx, lerp(X.SW.p1, sx0, 0.6), lerp(X.SW.top + 200, sy0 + (t > K.legs2W ? 40 : -60), 0.7), z, sx, sy);
  X.drawYard(ctx, t, { a1: ang, girl: 1, light: 0.85, face: { smile: 0.7 } });
  ctx.restore();
  hudShade(ctx, 0.6); pulseAt(ctx, t, K.stillW, 0.3);
}, { vignette: 0.5 });
// 13. At the top, her face reaches your window. — THE POSTER IMAGE
const rise = t => E.out(inv(K.topW - 0.1, K.faceW + 0.15, t));
shot('poster', K.top, (ctx, t, lt) => {
  const r = rise(t);
  const [sx, sy] = shake(t, K.faceW, 18, 0.45);
  ctx.save(); camera(ctx, 540, lerp(900, 840, E.out(clamp(lt / 3))), lerp(1.0, 1.12, clamp(lt / 3)), sx, sy);
  X.drawWindow(ctx, t, { a1: r > 0.05 ? 0 : a1(t), girl: r > 0.05 ? 0 : 1, rise: r, smile: lerp(0.4, 1, inv(K.reachW, K.winW + 0.5, t)) });
  ctx.restore();
  hudShade(ctx, 0.6); flash(ctx, t, K.faceW, 0.35); pulseAt(ctx, t, K.faceW, 0.45, 2); pulseAt(ctx, t, K.winW, 0.35);
}, { vignette: 0.35 });
// 14. Then a small voice calls the roll. — her mouth moves at the glass
const talk = (t, t0, t1) => t > t0 - 0.05 && t < t1 ? Math.abs(Math.sin((t - t0) * 10)) : 0;
shot('voice', K.voice, (ctx, t, lt) => {
  ctx.save(); camera(ctx, 540, 780, lerp(1.35, 1.55, clamp(lt / 2)));
  X.drawWindow(ctx, t, { a1: 0, girl: 0, rise: 1, mouth: talk(t, K.voiceW - 0.3, K.rollW + 0.4), smile: 0.2, light: 0.8 });
  ctx.restore();
  hudShade(ctx, 0.7); pulseAt(ctx, t, K.callsW, 0.3);
}, { vignette: 0.55 });
// 15. Every name in the register. — the roll, row by row
shot('roll', K.every, (ctx, t, lt) => {
  const c = lerp(0, 6.99, inv(K.every + 0.05, K.rule3 - 0.05, t));
  ctx.save(); camera(ctx, 540, lerp(820, 1000, clamp(lt / 1.6)), 1.12);
  X.drawRoll(ctx, t, { call: c });
  ctx.restore();
  capShade(ctx, 0.5); hudShade(ctx, 0.7); flash(ctx, t, K.every, 0.2);
}, { vignette: 0.4 });
// 16. Rule three. She calls your name.
shot('yourname', K.rule3, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.nameW, 16, 0.4);
  ctx.save(); camera(ctx, 540, 770, lerp(1.7, t > K.nameW ? 2.3 : 1.95, E.inOut(clamp(lt / 1.4))), sx, sy);
  X.drawWindow(ctx, t, { a1: 0, girl: 0, rise: 1, mouth: talk(t, K.callsYW, K.nameW + 0.35), smile: 0.1, light: 0.75 });
  ctx.restore();
  hudShade(ctx, 0.7); pulseAt(ctx, t, K.nameW, 0.45, 2);
}, { vignette: 0.55 });
// 17. You hear yourself say: present. — you, facing us, her face in the window behind you
shot('present', K.say, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.presentW, 16, 0.45);
  ctx.save(); camera(ctx, 540, lerp(1050, 1000, clamp(lt / 2)), 1.0, sx, sy);
  X.drawWindow(ctx, t, { a1: 0, girl: 0, rise: 1, smile: lerp(0.2, 1, inv(K.presentW, K.presentW + 0.5, t)), light: 0.7, me: ME({ x: 540, y: 1830, s: 1.45, view: 'front' }) });
  ctx.restore();
  hudShade(ctx, 0.6);
  const p = E.outBack(clamp((t - K.presentW + 0.05) / 0.3));
  if (p > 0) {
    ctx.save(); ctx.translate(540 + sx, 1110 + sy); ctx.rotate(-0.05); ctx.scale(p, p);
    rrect(ctx, -300, -80, 600, 150, 26); ctx.fillStyle = 'rgba(6,8,18,0.82)'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = C.red; ctx.stroke();
    ctx.font = '104px Osw700'; ctx.fillStyle = C.red; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('"PRESENT."', 0, 0);
    ctx.restore();
  }
  pulseAt(ctx, t, K.presentW, 0.5, 1.8);
}, { vignette: 0.45 });
// 18. The swing stops. The yard is empty.
shot('stops', K.stops, (ctx, t, lt) => {
  const gone = t >= K.stopsW ? 0 : 1;
  const [sx, sy] = shake(t, K.stopsW, 10, 0.3);
  ctx.save(); camera(ctx, lerp(540, 520, clamp(lt / 2.4)), 1180, lerp(1.25, 1.1, clamp(lt / 2.4)), sx, sy);
  X.drawYard(ctx, t, { a1: a1(t), girl: gone, light: 0.75 });
  ctx.restore();
  hudShade(ctx, 0.5); flash(ctx, t, K.stopsW, 0.3); pulseAt(ctx, t, K.emptyW, 0.3);
}, { vignette: 0.5 });
// 19-21. The register. Her name. Ticked present. Every night since 1998. Below it, your name.
shot('register', K.reg, (ctx, t, lt) => {
  const herY = X.ROW0 + 6 * X.RH, myY = X.ROW0 + 7 * X.RH;
  let cy = lerp(900, herY - 40, E.inOut(inv(K.reg, K.herNameW, t))), z = lerp(1.05, 1.5, E.inOut(inv(K.reg, K.herNameW, t)));
  if (t > K.since) { cy = lerp(herY - 40, 1300, E.inOut(inv(K.since, K.nineteenW, t))); z = lerp(1.5, 1.3, E.inOut(inv(K.since, K.nineteenW, t))); }
  if (t > K.below) { cy = lerp(1300, myY - 120, E.inOut(inv(K.below, K.yourW, t))); z = lerp(1.3, 1.6, E.inOut(inv(K.below, K.yourW, t))); }
  const [sx, sy] = shake(t, t < K.below ? K.nineteenW : K.yourW, 12, 0.35);
  ctx.save(); camera(ctx, 560, cy, z, sx, sy);
  X.drawRoll(ctx, t, { call: -1, her: E.out(inv(K.tickedW - 0.1, K.tickPresW + 0.5, t)), since: E.out(inv(K.nineteenW - 0.1, K.nineteenW + 0.3, t)), mine: E.out(inv(K.yourW - 0.2, K.yourW + 0.3, t)), tick: E.out(inv(K.tick2W - 0.05, K.tick2W + 0.25, t)) });
  ctx.restore();
  capShade(ctx, 0.45); hudShade(ctx, 0.7);
  flash(ctx, t, K.reg, 0.2); pulseAt(ctx, t, K.nineteenW, 0.35); pulseAt(ctx, t, K.yourW, 0.45, 2); pulseAt(ctx, t, K.tick2W, 0.4);
}, {});
// 22b. And the second swing is moving.
shot('second', K.andW - 0.06, (ctx, t, lt) => {
  const g = clamp((t - K.andW) / 0.8);
  const a2 = 0.35 * g * Math.sin((t - K.andW) * 2.3 + 0.4);
  ctx.save(); camera(ctx, lerp(620, 650, clamp(lt / 3)), lerp(1250, 1300, clamp(lt / 3)), lerp(1.5, 1.85, clamp(lt / 3)));
  X.drawYard(ctx, t, { a1: 0, a2, girl: 0, light: 0.7, ring2: E.out(inv(K.secondW, K.movingW + 0.4, t)) });
  ctx.restore();
  hudShade(ctx, 0.6); pulseAt(ctx, t, K.movingW, 0.4, 2);
}, { vignette: 0.55 });
// 23-24. Choice card over the dark yard
shot('choice', K.choice, (ctx, t, lt) => {
  ctx.save(); ctx.filter = `blur(${(9 * clamp(lt / 0.4)).toFixed(1)}px)`;
  ctx.save(); camera(ctx, 600, 1250, 1.4); X.drawYard(ctx, t, { a1: 0, a2: 0.3 * Math.sin(t * 2.3), girl: 0, light: 0.6 }); ctx.restore();
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
  opt('A', 'RULE 2 · GO OUTSIDE', 840, K.optA, K.optB - 0.1, 'AND STAND UNDER HER SWING');
  opt('B', 'RULE 3 · SAY PRESENT', 1030, K.optB, K.cta - 0.1, 'AND TAKE THE SECOND SWING');
  const ca = clamp((t - K.cta + 0.05) / 0.2);
  if (ca > 0) {
    ctx.save(); ctx.globalAlpha = ca; ctx.textBaseline = 'middle';
    const pa = t > K.ctaA ? Math.exp(-(t - K.ctaA) * 5) : 0, pb = t > K.ctaB ? Math.exp(-(t - K.ctaB) * 5) : 0;
    ctx.font = '120px Osw700'; const parts = [['TYPE ', C.white, 0], ['A', C.lime, pa], [' OR ', C.white, 0], ['B', C.lime, pb]];
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
  const ha = t < K.legs - 0.1 ? 1 : clamp(1 - (t - K.legs + 0.1) / 0.25);
  if (ha > 0) {
    const pop = lerp(1.12, 1, E.outBack(clamp(t / 0.35)));
    ctx.save(); ctx.globalAlpha = ha; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.translate(540, 600); ctx.scale(pop, pop); ctx.translate(-540, -600);
    ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 28;
    rrect(ctx, 110, 475, 860, 250, 26); ctx.fillStyle = 'rgba(6,8,18,0.8)'; ctx.fill();
    ctx.shadowBlur = 0;
    ctx.font = '92px Osw700'; ctx.fillStyle = C.white; ctx.fillText('3 AM. SHE SWINGS.', 540, 582);
    ctx.fillStyle = C.red; ctx.fillText('LEGS DON\'T MOVE.', 540, 687);
    ctx.restore();
  }
}

shots.sort((a, b) => a.start - b.start);
return { shots, K, hudState, overlay, coverTitle: 'THE GIRL ON {THE SWING}', coverSize: 80, coverSub: 'NIGHT SHIFT · 3 AM' };
};
