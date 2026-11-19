// NIGHT SHIFT — Episode 1 "The all-night pharmacy" (the customer with a toe tag). Standalone, ~69 s.
// Standard (ANALYTICS): frame 1 = a BRIGHT, readable wide shot: lit pharmacy, the barefoot man at the counter, small hook.
const D = require('./draw');
const X = require('./sets');
const { W, H, C, clamp, lerp, inv, E, noise1, shake, rrect, spaced, camera } = D;

module.exports = function build(TL) {
const Ln = id => TL.lines[id - 1];
const Wd = (id, k) => Ln(id).words[k].start;
const S0 = id => Ln(id).start - 0.06;
const K = {
  manW: Wd(1, 6), counterW: Wd(1, 10),
  feet: S0(2), tagW: Wd(2, 2), toeW: Wd(2, 8),
  me: S0(3), lastW: Wd(3, 4), rulesW: Wd(3, 10),
  r1: S0(4), paperW: Wd(4, 6),
  r2: S0(5), obitW: Wd(5, 5), outW: Wd(5, 8),
  r3: S0(6), neverW: Wd(6, 1), coldW: Wd(6, 5),
  sorry: S0(7), leftW: Wd(7, 3), sorryW: Wd(7, 5),
  slip: S0(8), slidesW: Wd(8, 1), wetW: Wd(8, 6), freezeW: Wd(8, 8),
  name: S0(9), thomasW: Wd(9, 1),
  paper: S0(10), hale2W: Wd(10, 2), diedW: Wd(10, 4),
  rule2: S0(11), askW: Wd(11, 3),
  move: S0(12), moveW: Wd(12, 2), frostW: Wd(12, 3),
  pills: S0(13), shakeW: Wd(13, 7),
  ask: S0(14), whyW: Wd(14, 5), coldQ: Wd(14, 9),
  lean: S0(15), keepW: Wd(15, 4), downW: Wd(15, 7),
  dark: S0(16), dieW: Wd(16, 2), goneW: Wd(16, 5),
  sig: S0(17), signedW: Wd(17, 3), earlyW: Wd(17, 9),
  tray: S0(18), tomW: Wd(18, 3),
  mine: S0(19), yourW: Wd(19, 4), nameW: Wd(19, 5),
  choice: Ln(20).start - 0.1, optA: Wd(20, 5), optB: Wd(20, 7), cta: Ln(21).start, ctaA: Wd(21, 1), ctaB: Wd(21, 3),
};

// ---------- HUD ----------
function hudState(t) {
  const blink = (t0, end = C.red) => t < t0 + 0.6 ? (Math.floor(t * 12) % 2 ? C.red : C.white) : end;
  const time = t < K.slip ? '2:00' : t < K.move ? '2:03' : t < K.dark ? '2:07' : '2:09';
  let r3 = ['RULES', '3', C.white];
  if (t >= K.askW) r3 = ['RULE 2', 'OUTSIDE', blink(K.askW, C.lime)];
  if (t >= K.moveW) r3 = ['RULE 2', 'BENT', blink(K.moveW)];
  if (t >= K.whyW) r3 = ['RULE 3', 'BROKEN', blink(K.whyW)];
  let r4 = ['CUSTOMER', 'BAREFOOT', C.white];
  if (t >= K.toeW) r4 = ['CUSTOMER', 'TOE TAG', blink(K.toeW)];
  if (t >= K.thomasW) r4 = ['CUSTOMER', 'T. HALE', C.white];
  if (t >= K.diedW) r4 = ['CUSTOMER', 'DECEASED', blink(K.diedW)];
  if (t >= K.goneW) r4 = ['CUSTOMER', 'GONE', blink(K.goneW)];
  if (t >= K.nameW) r4 = ['NEXT SLIP', 'YOU', blink(K.nameW)];
  const temp = t < K.slip ? '21°C' : t < K.move ? '9°C' : t < K.dark ? '-4°C' : '-11°C';
  return { t, part: 'SHIFT 1', time, ampm: 'AM', labelW: 170, rows: [['PHARMACY', 'ALL-NIGHT', C.white], ['TEMP', temp, t >= K.move ? C.blue : C.white], r3, r4] };
}

const shots = [];
const shot = (name, start, draw, meta) => shots.push({ name, start, draw, meta });
const capShade = (ctx, a = 0.72) => { const g = ctx.createLinearGradient(0, 1250, 0, 1720); g.addColorStop(0, 'rgba(2,3,8,0)'); g.addColorStop(0.35, `rgba(2,3,8,${a})`); g.addColorStop(0.75, `rgba(2,3,8,${a})`); g.addColorStop(1, 'rgba(2,3,8,0)'); ctx.fillStyle = g; ctx.fillRect(0, 1250, W, 470); };
const hudShade = (ctx, a = 1) => { const g = ctx.createRadialGradient(170, 230, 180, 170, 230, 720); g.addColorStop(0, `rgba(2,3,8,${a})`); g.addColorStop(1, 'rgba(2,3,8,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 760, 820); };
const redPulse = (ctx, a) => { if (a < 0.01) return; const g = ctx.createRadialGradient(540, 960, 300, 540, 960, 1200); g.addColorStop(0, 'rgba(255,40,60,0)'); g.addColorStop(1, `rgba(255,40,60,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
const coldPulse = (ctx, a) => { if (a < 0.01) return; const g = ctx.createRadialGradient(540, 960, 300, 540, 960, 1200); g.addColorStop(0, 'rgba(160,200,255,0)'); g.addColorStop(1, `rgba(190,225,255,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
const flash = (ctx, t, t0, a = 0.8) => { if (t < t0 || t > t0 + 0.4) return; ctx.fillStyle = `rgba(235,240,255,${a * (1 - (t - t0) / 0.4)})`; ctx.fillRect(0, 0, W, H); };
const pulseAt = (ctx, t, t0, a = 0.3, k = 2.5) => { if (t > t0) redPulse(ctx, a * Math.exp(-(t - t0) * k)); };
const coldAt = (ctx, t, t0, a = 0.3, k = 2.5) => { if (t > t0) coldPulse(ctx, a * Math.exp(-(t - t0) * k)); };
const MAN = { x: 400, y: 1640, s: 1.0 };

// 1. HOOK (frame 1): the bright pharmacy, a barefoot man at the counter, wet prints to his feet; slow push to his feet
shot('hook', 0, (ctx, t, lt) => {
  const k = E.inOut(clamp(t / K.feet));
  ctx.save(); camera(ctx, lerp(540, 470, k), lerp(1060, 1300, k), lerp(0.9, 1.25, k));
  X.drawStore(ctx, t, { man: MAN, prints: 1, minute: 0 });
  ctx.restore();
  hudShade(ctx, 0.55);
  pulseAt(ctx, t, K.manW, 0.12);
}, { vignette: 0.28 });
// 2. A paper tag is tied to his big toe. — the feet close-up, the tag swings into view
shot('feet', K.feet, (ctx, t, lt) => {
  const k = E.out(clamp(lt / (K.me - K.feet)));
  const [sx, sy] = shake(t, K.toeW, 12, 0.3);
  ctx.save(); camera(ctx, lerp(600, 720, k), lerp(1180, 1360, k), lerp(0.9, 1.1, k), sx, sy);
  X.drawFeet(ctx, t, { swing: Math.exp(-(lt) * 1.5) });
  ctx.restore();
  hudShade(ctx, 0.6);
  flash(ctx, t, K.feet, 0.35); pulseAt(ctx, t, K.toeW, 0.3);
}, { vignette: 0.4 });
// 3. Your first night shift. The last pharmacist left you three rules. — you behind the counter, badge; then the note
shot('me', K.me, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.lastW - K.me)));
  ctx.save(); camera(ctx, 560, lerp(1000, 960, k), lerp(1.45, 1.7, k));
  X.drawStore(ctx, t, { man: null, prints: 1, minute: 0, me: { x: 560 } });
  ctx.restore();
  hudShade(ctx, 0.7);
  X.drawBadge(ctx, 790, 1150, 0.9 * E.outBack(clamp((t - K.me - 0.4) / 0.35)));
}, { vignette: 0.35 });
const noteCam = (ctx, cy, z, sx = 0, sy = 0) => { ctx.save(); camera(ctx, 540, cy, z, sx, sy); };
shot('note', K.lastW, (ctx, t, lt) => {
  const k = E.out(clamp(lt / (K.r1 - K.lastW)));
  noteCam(ctx, lerp(820, 900, k), lerp(0.9, 1.0, k));
  X.drawNote(ctx, t, { sorry: 0 });
  ctx.restore();
  capShade(ctx, 0.5); hudShade(ctx, 0.7);
  pulseAt(ctx, t, K.rulesW, 0.15);
}, {});
// 4-6. the three rules: camera steps to each, lime swipe on the spoken rule, others dim
const R = X.NOTE_RULES;
const ruleShot = (i, t0, t1, hlW) => shot('rule' + (i + 1), t0, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / 0.5));
  const prevY = i ? R[i - 1].y + 40 : 900;
  noteCam(ctx, lerp(prevY, R[i].y + 40, k) + 40, lerp(1.25, 1.45, clamp(lt / (t1 - t0))));
  X.drawNote(ctx, t, { sorry: 0, hl: i, hlA: E.out(inv(hlW - 0.1, hlW + 0.5, t)), dim: 1 });
  ctx.restore();
  capShade(ctx, 0.62); hudShade(ctx);
  // the rule number stamp
  const a = E.outBack(clamp(lt / 0.3));
  ctx.save(); ctx.globalAlpha = clamp(lt / 0.12) * clamp((t1 - t) / 0.2); ctx.translate(880, 520); ctx.rotate(0.08); ctx.scale(lerp(1.5, 1, a), lerp(1.5, 1, a));
  rrect(ctx, -110, -70, 220, 140, 14); ctx.fillStyle = C.red; ctx.fill(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '96px Osw700'; ctx.fillStyle = '#fff'; ctx.fillText(`#${i + 1}`, 0, 6);
  ctx.restore();
}, {});
ruleShot(0, K.r1, K.r2, Wd(4, 1));
ruleShot(1, K.r2, K.r3, Wd(5, 1));
ruleShot(2, K.r3, K.sorry, Wd(6, 1));
// 6b. "Never ask" -> red pulse handled in overlay; 7. Under them: I left early. Sorry. — handwriting writes itself, push in
shot('sorry', K.sorry, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.slip - K.sorry)));
  noteCam(ctx, lerp(1420, 1520, k), lerp(1.3, 1.65, k));
  X.drawNote(ctx, t, { sorry: E.inOut(inv(K.leftW - 0.4, K.sorryW + 0.4, t)), dim: 0 });
  ctx.restore();
  capShade(ctx, 0.5); hudShade(ctx);
  pulseAt(ctx, t, K.leftW, 0.2);
}, {});
// 8. He slides a slip across. It's wet. And freezing. — POV across the counter
shot('slip', K.slip, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.name - K.slip)));
  const sl = E.inOut(inv(K.slidesW, K.slidesW + 1.0, t));
  ctx.save(); camera(ctx, 540, lerp(1150, 1400, k), lerp(0.95, 1.2, k));
  X.drawCounterPOV(ctx, t, { man: 1, slip: sl, frost: 0.35 * clamp(inv(K.freezeW - 0.2, K.freezeW + 0.6, t)) });
  ctx.restore();
  hudShade(ctx, 0.6);
  coldAt(ctx, t, K.freezeW, 0.45, 2);
}, { vignette: 0.45 });
// 9. Name: Thomas Hale. — the slip close-up; the name writes in, lime swipe
shot('name', K.name, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.paper - K.name)));
  ctx.save(); camera(ctx, lerp(440, 520, k), lerp(820, 790, k), lerp(1.2, 1.45, k));
  X.drawSlip(ctx, t, { name: E.out(inv(K.thomasW - 0.1, K.thomasW + 0.7, t)), nameHL: E.out(inv(K.thomasW + 0.6, K.thomasW + 1.1, t)), frost: 0.3 + 0.2 * k });
  ctx.restore();
  capShade(ctx, 0.5); hudShade(ctx);
}, {});
// 10. Today's paper. Thomas Hale. Died this morning. — the obituaries, his photo; red ring on "died this morning"
shot('paper', K.paper, (ctx, t, lt) => {
  const hx = 560, hy = 900;
  const k = E.inOut(inv(K.paper, K.hale2W + 0.2, t));
  const [sx, sy] = shake(t, K.diedW, 14, 0.35);
  ctx.save(); camera(ctx, lerp(540, hx + 200, k), lerp(900, hy + 120, k), lerp(0.95, 1.75, k), sx, sy);
  X.drawPaper(ctx, t, { nameHL: E.out(inv(K.hale2W, K.hale2W + 0.4, t)), ring: E.out(inv(K.diedW, K.diedW + 0.6, t)) });
  ctx.restore();
  capShade(ctx, 0.45); hudShade(ctx);
  pulseAt(ctx, t, K.diedW, 0.35, 2);
}, { vignette: 0.45 });
// 11. Rule two. You ask him to wait outside. — POV, him full (the poster image), slow push in
shot('rule2', K.rule2, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.pills - K.rule2)));
  ctx.save(); camera(ctx, 540, lerp(1050, 900, k), lerp(0.95, 1.2, k));
  X.drawCounterPOV(ctx, t, { man: 1, slip: 1, frost: lerp(0.35, 0.5, k) * (t < K.move ? 1 : 1) });
  ctx.restore();
  hudShade(ctx, 0.6);
}, { vignette: 0.45 });
// 12b. Frost spreads under his fingers. — the hands on the glass, frost racing out
shot('frost', K.frostW - 0.05, (ctx, t, lt) => {
  const fr = lerp(0.45, 1.1, E.out(clamp(lt / 1.5)));
  ctx.save(); camera(ctx, 560, 1600, lerp(1.6, 1.8, clamp(lt / 1.8)));
  X.drawCounterPOV(ctx, t, { man: 1, slip: 1, frost: fr });
  ctx.restore();
  hudShade(ctx, 0.7);
  coldAt(ctx, t, K.frostW, 0.5, 1.6);
  flash(ctx, t, K.frostW - 0.05, 0.25);
}, { vignette: 0.45 });
// 13. You fill it fast. Your hands are shaking. — pill tray, tremor grows
shot('pills', K.pills, (ctx, t, lt) => {
  const k = clamp(lt / (K.ask - K.pills));
  const [sx, sy] = [(noise1(t * 25) - 0.5) * 18 * inv(K.shakeW - 0.3, K.shakeW + 0.3, t), (noise1(t * 21 + 5) - 0.5) * 14 * inv(K.shakeW - 0.3, K.shakeW + 0.3, t)];
  ctx.save(); camera(ctx, lerp(560, 620, k), lerp(980, 940, k), lerp(1.05, 1.25, k), sx, sy);
  X.drawPills(ctx, t, { count: k * 0.9, shake: 0.3 + 0.9 * inv(K.shakeW - 0.4, K.shakeW + 0.2, t) });
  ctx.restore();
  capShade(ctx, 0.45); hudShade(ctx);
}, { vignette: 0.45 });
// 14. Then you hear yourself ask: why are you so cold? — you and him across the counter, lights stutter on "cold"
shot('ask', K.ask, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.lean - K.ask)));
  const L = t > K.coldQ ? 0.55 + 0.45 * Math.abs(Math.sin((t - K.coldQ) * 20)) * Math.exp(-(t - K.coldQ) * 2) : 1;
  ctx.save(); camera(ctx, lerp(500, 480, k), lerp(1150, 1080, k), lerp(1.1, 1.3, k));
  X.drawStore(ctx, t, { man: MAN, prints: 1, minute: 7, me: { x: 600, arm: 'down' }, light: L * (t > K.whyW ? 0.85 : 1), chill: inv(K.whyW, K.coldQ + 0.5, t) });
  ctx.restore();
  hudShade(ctx, 0.7);
  pulseAt(ctx, t, K.whyW, 0.35, 2);
}, { vignette: 0.45 });
// 15. He leans in. They keep us cold. Downstairs. — THE POSTER IMAGE: his face, frosted eyes, breath
shot('lean', K.lean, (ctx, t, lt) => {
  if (t < Wd(15, 2) + 0.2) {
    const k = E.inOut(clamp(lt / (Wd(15, 2) + 0.2 - K.lean)));
    ctx.save(); camera(ctx, 540, lerp(1000, 820, k), lerp(1.0, 1.25, k));
    X.drawCounterPOV(ctx, t, { man: 1, slip: 1, frost: 1, lean: k * 0.5 });
    ctx.restore();
  } else {
    const k = E.inOut(inv(Wd(15, 2) + 0.2, K.dark, t));
    const [sx, sy] = shake(t, K.downW, 14, 0.4);
    ctx.save(); camera(ctx, 540, lerp(980, 1000, k), lerp(1.0, 1.12, k), sx, sy);
    X.drawFace(ctx, t, { mouth: t > K.keepW - 0.2 && t < K.downW + 0.9 ? 0.4 + 0.6 * Math.abs(Math.sin(t * 9)) : 0.1, eyes: 1 });
    ctx.restore();
    coldAt(ctx, t, K.keepW, 0.25); pulseAt(ctx, t, K.downW, 0.4, 2);
  }
  hudShade(ctx, 0.7);
}, { vignette: 0.55 });
// 16. The lights die. Then he's gone. — tubes die, black, then lights back on an empty shop: prints stop halfway
shot('dark', K.dark, (ctx, t, lt) => {
  const off = inv(K.dieW - 0.1, K.dieW + 0.15, t), on = inv(K.goneW - 0.25, K.goneW, t);
  const L = t < K.dieW ? 1 : (on > 0 ? on * (0.75 + 0.25 * Math.abs(Math.sin(t * 25))) : (1 - off) * Math.abs(Math.sin(t * 30)));
  const empty = t >= K.goneW - 0.25;
  ctx.save(); camera(ctx, 540, 1100, 1.0);
  X.drawCounterPOV(ctx, t, { man: empty ? 0 : 1, empty, slip: empty ? 0 : 1, slipLeft: true, frost: 1, prints: empty ? 1 : 0, door: empty ? 0.4 : 0, light: L });
  ctx.restore();
  if (empty) coldAt(ctx, t, K.goneW - 0.25, 0.4, 2);
  hudShade(ctx, 0.6);
}, { vignette: 0.5 });
// 17. His slip was signed by the pharmacist who left early. — split: the slip's signature over the note's signature
shot('sig', K.sig, (ctx, t, lt) => {
  ctx.fillStyle = '#04060c'; ctx.fillRect(0, 0, W, H);
  const a = E.out(clamp(lt / 0.35)), b = E.out(inv(K.signedW, K.signedW + 0.35, t));
  ctx.save(); ctx.beginPath(); ctx.rect(0, 300, W, 560); ctx.clip(); ctx.translate(lerp(-W, 0, a), 0);
  ctx.save(); camera(ctx, 380, 1450, 1.45, 0, -380);
  X.drawSlip(ctx, t, { frost: 0.5, sigRing: E.out(inv(K.signedW + 0.2, K.signedW + 0.8, t)) });
  ctx.restore(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(0, 880, W, 560); ctx.clip(); ctx.translate(lerp(W, 0, b), 0);
  ctx.save(); camera(ctx, 700, 1560, 1.25, 0, 200);
  X.drawNote(ctx, t, { sorry: 1, dim: 0 });
  ctx.restore(); ctx.restore();
  ctx.fillStyle = C.lime; ctx.fillRect(80, 866, 920 * E.out(inv(K.earlyW - 0.6, K.earlyW, t)), 8);
  ctx.save(); ctx.font = '30px Mono700'; ctx.fillStyle = 'rgba(238,241,247,0.75)'; spaced(ctx, 'HIS SLIP', 1000, 290, 4, 'right'); spaced(ctx, 'THE NOTE', 1000, 1475 - 20, 4, 'right'); ctx.restore();
  pulseAt(ctx, t, K.earlyW, 0.3);
}, { vignette: 0.4 });
// 18. In the tray, tomorrow's slips are waiting. — wire tray, TOMORROW tab; push toward the top slip
shot('tray', K.tray, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.mine - K.tray)));
  ctx.save(); camera(ctx, 540, lerp(1150, 900, k), lerp(0.95, 1.4, k));
  X.drawTray(ctx, t, {});
  ctx.restore();
  capShade(ctx, 0.45); hudShade(ctx);
  pulseAt(ctx, t, K.tomW, 0.15);
}, { vignette: 0.45 });
// 19. The top one has your name. — your slip, SAM in red, a toe tag clipped to it; your badge slides in
shot('mine', K.mine, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.choice - K.mine)));
  const [sx, sy] = shake(t, K.nameW, 16, 0.4);
  ctx.save(); camera(ctx, lerp(520, 600, k), lerp(900, 980, k), lerp(1.0, 1.15, k), sx, sy);
  X.drawSlip(ctx, t, { mine: true, rot: 0.02, frost: 0.2, tag: inv(K.nameW - 0.1, K.nameW + 0.35, t) });
  ctx.restore();
  const ba = E.out(inv(K.yourW - 0.3, K.yourW + 0.1, t));
  if (ba > 0) X.drawBadge(ctx, lerp(-260, 300, ba), 1180, 0.85);
  capShade(ctx, 0.4); hudShade(ctx);
  pulseAt(ctx, t, K.nameW, 0.45, 1.8);
}, { vignette: 0.45 });
// 20-21. Choice card over the empty, frosted counter
shot('choice', K.choice, (ctx, t, lt) => {
  ctx.save(); ctx.filter = `blur(${(9 * clamp(lt / 0.4)).toFixed(1)}px)`;
  ctx.save(); camera(ctx, 540, 1100, 1.0); X.drawCounterPOV(ctx, t, { man: 0, empty: true, slipLeft: true, prints: 1, door: 0.4, light: 0.9 }); ctx.restore();
  ctx.restore();
  ctx.fillStyle = `rgba(3,5,12,${0.76 * clamp(lt / 0.35)})`; ctx.fillRect(0, 0, W, H);
  const q = [['WHICH', 'RULE'], ['WOULD', 'YOU', 'BREAK?']];
  ctx.save(); ctx.font = '112px Osw700'; ctx.textBaseline = 'middle';
  let wi = 0;
  q.forEach((row, ri) => {
    const sp = 30; const ws = row.map(w => ctx.measureText(w).width); const tot = ws.reduce((a, b) => a + b, 0) + sp * (row.length - 1);
    let x = 540 - tot / 2;
    row.forEach((w, i) => {
      const a = clamp((t - Wd(20, wi) + 0.03) / 0.12); wi++;
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
  opt('A', 'RULE 2 · LET HIM IN', 840, K.optA, K.optB - 0.1, 'A DEAD MAN WAITS AT YOUR COUNTER');
  opt('B', 'RULE 3 · ASK WHY', 1030, K.optB, K.cta - 0.1, 'AND HEAR WHERE THEY KEEP HIM');
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
  const ha = t < 2.9 ? 1 : clamp(1 - (t - 2.9) / 0.35);
  if (ha > 0) {
    const pop = lerp(1.12, 1, E.outBack(clamp(t / 0.35)));
    ctx.save(); ctx.globalAlpha = ha; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.translate(540, 555); ctx.scale(pop, pop); ctx.translate(-540, -555);
    ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 28;
    rrect(ctx, 170, 430, 740, 250, 26); ctx.fillStyle = 'rgba(6,8,18,0.78)'; ctx.fill();
    ctx.shadowBlur = 0;
    ctx.font = '96px Osw700'; ctx.fillStyle = C.white; ctx.fillText('2 AM CUSTOMER', 540, 540);
    ctx.fillStyle = C.red; ctx.fillText('WITH A TOE TAG', 540, 645);
    ctx.restore();
  }
}

shots.sort((a, b) => a.start - b.start);
return { shots, K, hudState, overlay, coverTitle: 'HE HAS A {TOE TAG}', coverSize: 84, coverSub: 'NIGHT SHIFT · 2 AM' };
};
