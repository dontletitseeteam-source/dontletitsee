// NIGHT SHIFT — Episode 4 "The petrol pump" (the white car whose passengers all sit facing backwards). Standalone, ~70 s.
// Standard (ANALYTICS): frame 1 = a BRIGHT, readable wide shot: the lit forecourt, the white car rolling in to pump 3
// with nobody at the wheel and pale faces in the back turned the wrong way.
const D = require('./draw');
const X = require('./sets_pump');
const { W, H, C, clamp, lerp, inv, E, noise1, shake, rrect, spaced, camera } = D;

module.exports = function build(TL) {
const Ln = id => TL.lines[id - 1];
const Wd = (id, k) => Ln(id).words[k].start;
const S0 = id => Ln(id).start - 0.06;
const K = {
  carW: Wd(1, 4), inW: Wd(1, 6), noW: Wd(1, 7), driverW: Wd(1, 8),
  back: S0(2), facingW: Wd(2, 3), backwardsW: Wd(2, 4),
  me: S0(3), pumpW: Wd(3, 5), noteW: Wd(3, 11),
  r1: S0(4), r2: S0(5), r3: S0(6),
  last: S0(7), dontW: Wd(7, 2), meW: Wd(7, 5),
  fill: S0(8), fillW: Wd(8, 3), meterW: Wd(8, 6), stopW: Wd(8, 8),
  l40: Wd(9, 0), l80: Wd(9, 2), neverW: Wd(9, 4),
  stare: S0(10), stareW: Wd(10, 1), behindW: Wd(10, 5),
  rule2: S0(11), jamsW: Wd(11, 4), stepW: Wd(11, 5), car11W: Wd(11, 9),
  faces: S0(12), faceW: Wd(12, 1), lookingW: Wd(12, 7), youW: Wd(12, 9),
  middle: S0(13), attW: Wd(13, 5), uniformW: Wd(13, 8),
  mouths: S0(14), mouthsW: Wd(14, 1), dontRW: Wd(14, 2), readW: Wd(14, 3), itW: Wd(14, 4),
  rule3: S0(15), dropW: Wd(15, 4), plateW: Wd(15, 7),
  bike: S0(16), bikesW: Wd(16, 2), numberW: Wd(16, 3),
  full: S0(17), clicksW: Wd(17, 2), carGo: Wd(17, 4), awayW: Wd(17, 7),
  empty: S0(18), emptyW: Wd(18, 4), waitingW: Wd(18, 5),
  look: S0(19), bikeW: Wd(19, 4), goneW: Wd(19, 6),
  newline: S0(20), handW: Wd(20, 8), imW: Wd(21, 0), backW: Wd(21, 3),
  choice: Ln(22).start - 0.1, optA: Wd(22, 5), optB: Wd(22, 8), cta: Ln(23).start, ctaA: Wd(23, 2), ctaB: Wd(23, 4),
};

// litres on the meter: 0 at the cut, 40 on "Forty", 80 on "Eighty", then it keeps running
const litres = t => t < K.meterW ? 0 : t < K.l40 ? lerp(12, 40, inv(K.meterW, K.l40, t)) : t < K.l80 ? lerp(40, 80, inv(K.l40, K.l80, t)) : 80 + (t - K.l80) * 9;

// ---------- HUD ----------
function hudState(t) {
  const blink = (t0, end = C.red) => t < t0 + 0.6 ? (Math.floor(t * 12) % 2 ? C.red : C.white) : end;
  const time = t < K.fill ? '2:22' : t < K.faces ? '2:24' : t < K.full ? '2:26' : '2:27';
  let lt = ['LITRES', '0.0', C.white];
  if (t >= K.fillW) lt = ['LITRES', litres(t).toFixed(1), litres(t) > 35 ? blink(K.l40) : C.white];
  if (t >= K.neverW) lt = ['TANK', 'NEVER FULL', blink(K.neverW)];
  if (t >= K.clicksW) lt = ['TANK', 'FULL · RS 0', C.lime];
  let rl = ['RULES', '3', C.white];
  if (t >= K.fillW) rl = ['RULE 1', 'KEPT', blink(K.fillW, C.lime)];
  if (t >= K.stepW) rl = ['RULE 2', 'BROKEN', blink(K.stepW)];
  if (t >= K.plateW) rl = ['RULE 3', 'BROKEN', blink(K.plateW)];
  let pl = ['CAR', 'NO DRIVER', C.white];
  if (t >= K.faceW) pl = ['FACES', 'ON YOU', blink(K.faceW)];
  if (t >= K.plateW) pl = ['PLATE', 'KA 13 NS 2222', blink(K.plateW)];
  if (t >= K.numberW) pl = ['PLATE', 'YOUR BIKE', blink(K.numberW)];
  if (t >= K.goneW) pl = ['BIKE', 'GONE', blink(K.goneW)];
  if (t >= K.backW) pl = ['SEAT', 'BACK ROW · YOU', blink(K.backW)];
  return { t, part: 'SHIFT 4', time, ampm: 'AM', labelW: 150, rows: [['PUMP 3', 'FIRST NIGHT', C.white], lt, rl, pl] };
}

const shots = [];
const shot = (name, start, draw, meta) => shots.push({ name, start, draw, meta });
const capShade = (ctx, a = 0.72) => { const g = ctx.createLinearGradient(0, 1250, 0, 1720); g.addColorStop(0, 'rgba(2,3,8,0)'); g.addColorStop(0.35, `rgba(2,3,8,${a})`); g.addColorStop(0.75, `rgba(2,3,8,${a})`); g.addColorStop(1, 'rgba(2,3,8,0)'); ctx.fillStyle = g; ctx.fillRect(0, 1250, W, 470); };
const hudShade = (ctx, a = 1) => { const g = ctx.createRadialGradient(170, 230, 180, 170, 230, 720); g.addColorStop(0, `rgba(2,3,8,${a})`); g.addColorStop(1, 'rgba(2,3,8,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 760, 820); };
const redPulse = (ctx, a) => { if (a < 0.01) return; const g = ctx.createRadialGradient(540, 960, 300, 540, 960, 1200); g.addColorStop(0, 'rgba(255,40,60,0)'); g.addColorStop(1, `rgba(255,40,60,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
const flash = (ctx, t, t0, a = 0.8) => { if (t < t0 || t > t0 + 0.4) return; ctx.fillStyle = `rgba(235,240,255,${a * (1 - (t - t0) / 0.4)})`; ctx.fillRect(0, 0, W, H); };
const pulseAt = (ctx, t, t0, a = 0.3, k = 2.5) => { if (t > t0) redPulse(ctx, a * Math.exp(-(t - t0) * k)); };
const ME = (o) => ({ s: 1.0, view: 'front', ...o });

// 1. HOOK (frame 1): the bright forecourt, the white car rolling in to pump 3, no one at the wheel, faces turned back
shot('hook', 0, (ctx, t, lt) => {
  const k = E.inOut(clamp(t / K.back));
  const roll = E.out(inv(0, K.inW + 0.3, t));
  ctx.save(); camera(ctx, lerp(600, 620, k), lerp(1150, 1210, k), lerp(1.1, 1.4, k));
  X.drawForecourt(ctx, t, { carX: lerp(260, 0, roll), wheelRot: -roll * 7 });
  ctx.restore();
  hudShade(ctx, 0.5);
}, { vignette: 0.22 });
// 2. Every passenger sits facing backwards. — close on the back window from the side
shot('back', K.back, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.backwardsW, 14, 0.35);
  ctx.save(); camera(ctx, lerp(560, 520, E.out(clamp(lt / 2.6))), 1215, lerp(2.6, 3.1, clamp(lt / 2.6)), sx, sy);
  X.drawForecourt(ctx, t, {});
  ctx.restore();
  hudShade(ctx, 0.6); flash(ctx, t, K.back, 0.3); pulseAt(ctx, t, K.backwardsW, 0.35, 2);
}, { vignette: 0.4 });
// 3. Your first night at the pump. — you by pump 3, the car waiting
shot('me', K.me, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.noteW - K.me)));
  ctx.save(); camera(ctx, lerp(380, 330, k), lerp(1200, 1260, k), lerp(1.3, 1.5, k));
  X.drawForecourt(ctx, t, { me: ME({ x: 330, y: 1700, s: 1.05, view: 'back' }) });
  ctx.restore();
  hudShade(ctx, 0.6);
}, { vignette: 0.4 });
// 3b-7. the note + the three rules + the last line
shot('note', K.noteW - 0.05, (ctx, t, lt) => {
  ctx.save(); camera(ctx, 540, lerp(880, 920, E.out(clamp(lt / 0.6))), lerp(1.08, 1.0, E.out(clamp(lt / 0.5))));
  X.drawPumpNote(ctx, t, { last: 0 });
  ctx.restore();
  hudShade(ctx, 0.7); flash(ctx, t, K.noteW - 0.05, 0.25);
}, { vignette: 0.4 });
const R = X.NOTE_RULES;
const ruleShot = (i, t0, t1, hlW) => shot('rule' + (i + 1), t0, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / 0.5));
  const prevY = i ? R[i - 1].y : 760;
  ctx.save(); camera(ctx, 560, lerp(prevY, R[i].y, k) + 40, lerp(1.45, 1.58, clamp(lt / (t1 - t0))));
  X.drawPumpNote(ctx, t, { hl: i, hlA: E.out(inv(hlW - 0.1, hlW + 0.5, t)), dim: 1, last: 0 });
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
  const k = E.inOut(clamp(lt / (K.fill - K.last)));
  const [sx, sy] = shake(t, K.meW, 12, 0.35);
  ctx.save(); camera(ctx, 560, lerp(1330, 1400, k), lerp(1.5, 1.7, k), sx, sy);
  X.drawPumpNote(ctx, t, { last: E.inOut(inv(K.dontW - 0.2, K.meW + 0.3, t)), dim: 0.5, hl: -1 });
  ctx.restore();
  capShade(ctx, 0.5); hudShade(ctx);
  pulseAt(ctx, t, K.meW, 0.3);
}, {});
// 8. Rule one. You fill it. — you at the car with the nozzle
shot('fill', K.fill, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.meterW - K.fill)));
  ctx.save(); camera(ctx, lerp(380, 340, k), lerp(1220, 1260, k), lerp(1.4, 1.65, k));
  X.drawForecourt(ctx, t, { hose: t > K.fillW - 0.2, meter: litres(t).toFixed(1), me: ME({ x: 250, y: 1640, s: 1.05, view: 'back', arm: t > K.fillW - 0.2 ? 'raise' : 'down' }) });
  ctx.restore();
  hudShade(ctx, 0.6);
}, { vignette: 0.4 });
// 8b-9. The meter won't stop. Forty litres. Eighty. It never fills.
shot('meter', K.meterW - 0.06, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.l80, 14, 0.35);
  const z = t < K.l40 ? 1.0 : t < K.l80 ? 1.12 : 1.24;
  ctx.save(); camera(ctx, 540, lerp(880, 820, E.out(clamp(lt / 3))), z, sx, sy);
  X.drawMeter(ctx, t, { litres: litres(t) });
  ctx.restore();
  hudShade(ctx, 0.7); flash(ctx, t, K.meterW - 0.06, 0.25); pulseAt(ctx, t, K.l80, 0.35); pulseAt(ctx, t, K.neverW, 0.3);
}, { vignette: 0.4 });
// 10. They stare at the road behind. — the side window, all eyes to the dark road
shot('stare', K.stare, (ctx, t, lt) => {
  ctx.save(); camera(ctx, lerp(520, 440, E.inOut(clamp(lt / 1.8))), 1210, lerp(3.0, 3.4, clamp(lt / 1.8)));
  X.drawForecourt(ctx, t, { hose: true, light: 0.85 });
  ctx.restore();
  hudShade(ctx, 0.6); pulseAt(ctx, t, K.stareW, 0.25);
}, { vignette: 0.55 });
// 11. Rule two. The nozzle jams. You step behind the car.
shot('jam', K.rule2, (ctx, t, lt) => {
  const jam = t > K.jamsW - 0.1 ? 1 : 0;
  const [sx, sy] = shake(t, K.jamsW, 10, 0.3);
  const w = E.inOut(inv(K.stepW, K.car11W + 0.2, t));
  ctx.save(); camera(ctx, lerp(330, 300, w), lerp(1300, 1280, w), lerp(2.0, 1.6, w), sx, sy);
  X.drawForecourt(ctx, t, { hose: true, jam, meter: '99.9', me: ME({ x: lerp(250, 150, w), y: lerp(1640, 1520, w), s: 1.05, view: 'back', arm: w < 0.3 ? 'raise' : 'down', walk: w > 0.02 && w < 0.98 ? t * 7 : undefined }) });
  ctx.restore();
  hudShade(ctx, 0.6); pulseAt(ctx, t, K.jamsW, 0.25);
}, { vignette: 0.45 });
// 12. Every face in the back window is looking at you. — THE POSTER IMAGE
shot('faces', K.faces, (ctx, t, lt) => {
  const fa = E.out(inv(K.faceW - 0.25, K.faceW + 0.25, t));
  const [sx, sy] = shake(t, K.faceW, 16, 0.4);
  ctx.save(); camera(ctx, 540, lerp(900, 820, E.out(clamp(lt / 3))), lerp(0.95, 1.12, clamp(lt / 3)), sx, sy);
  X.drawCarRear(ctx, t, { faces: fa, palms: t > K.lookingW, smile: lerp(0.3, 1, inv(K.lookingW, K.youW + 0.4, t)) });
  ctx.restore();
  hudShade(ctx, 0.6); flash(ctx, t, K.faceW, 0.3); pulseAt(ctx, t, K.faceW, 0.4, 2); pulseAt(ctx, t, K.youW, 0.35);
}, { vignette: 0.35 });
// 13. In the middle: the last attendant. Still in uniform.
shot('middle', K.middle, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.mouths - K.middle)));
  const [sx, sy] = shake(t, K.attW, 12, 0.35);
  ctx.save(); camera(ctx, 540, lerp(760, 790, k), lerp(1.9, t > K.uniformW ? 2.35 : 2.15, k), sx, sy);
  X.drawCarRear(ctx, t, { faces: 1, palms: true, smile: 1 });
  ctx.restore();
  hudShade(ctx, 0.6); pulseAt(ctx, t, K.attW, 0.35);
}, { vignette: 0.5 });
// 14. He mouths: Don't read it.
shot('mouths', K.mouths, (ctx, t, lt) => {
  const talk = t > K.dontRW - 0.05 && t < K.itW + 0.35 ? Math.abs(Math.sin((t - K.dontRW) * 11)) : 0;
  ctx.save(); camera(ctx, 540, 760, lerp(2.6, 2.9, clamp(lt / 1.6)));
  X.drawCarRear(ctx, t, { faces: 1, mouth: talk, smile: 0.1 });
  ctx.restore();
  hudShade(ctx, 0.7); pulseAt(ctx, t, K.readW, 0.3);
}, { vignette: 0.55 });
// 15. Rule three. Your eyes drop to the plate.
shot('plate', K.rule3, (ctx, t, lt) => {
  const d = E.inOut(inv(K.dropW - 0.2, K.plateW, t));
  const [sx, sy] = shake(t, K.plateW, 14, 0.4);
  ctx.save(); camera(ctx, 540, lerp(760, 1170, d), lerp(1.5, 2.1, d), sx, sy);
  X.drawCarRear(ctx, t, { faces: 1, smile: 1, plate: E.out(inv(K.plateW - 0.1, K.plateW + 0.4, t)) });
  ctx.restore();
  hudShade(ctx, 0.6); pulseAt(ctx, t, K.plateW, 0.35);
}, { vignette: 0.45 });
// 16. It's your bike's number.
shot('plates', K.bike, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.numberW, 16, 0.45);
  ctx.save(); camera(ctx, 540, 860, lerp(1.0, 1.1, clamp(lt / 1.6)), sx, sy);
  X.drawPlates(ctx, t, { a: 1, b: E.out(inv(K.bikesW - 0.15, K.bikesW + 0.3, t)), hl: E.out(inv(K.numberW, K.numberW + 0.6, t)), eq: inv(K.numberW, K.numberW + 0.2, t) });
  ctx.restore();
  hudShade(ctx, 0.7); flash(ctx, t, K.numberW, 0.25); pulseAt(ctx, t, K.numberW, 0.5, 1.8);
}, { vignette: 0.45 });
// 17. The pump clicks full. — CLICK.
shot('full', K.full, (ctx, t, lt) => {
  const f = t >= K.clicksW;
  const [sx, sy] = shake(t, K.clicksW, 12, 0.3);
  ctx.save(); camera(ctx, 540, 900, f ? 1.08 : 1.0, sx, sy);
  X.drawMeter(ctx, t, { litres: 99.9, full: f });
  ctx.restore();
  hudShade(ctx, 0.7); flash(ctx, t, K.clicksW, 0.3);
}, { vignette: 0.4 });
// 17b. The car pulls away.
shot('away', K.carGo - 0.06, (ctx, t, lt) => {
  const go = E.in(inv(K.carGo, K.empty + 0.1, t));
  ctx.save(); camera(ctx, lerp(560, 640, go), 1150, lerp(1.0, 0.95, go));
  X.drawForecourt(ctx, t, { carX: go * 1100, wheelRot: go * 20, tail: 1, me: ME({ x: 200, y: 1620, s: 1.05, view: 'back' }) });
  ctx.restore();
  hudShade(ctx, 0.5);
}, { vignette: 0.35 });
// 18. One back seat is empty. Waiting. — the car on the dark road, the back window: a gap turned around
shot('empty', K.empty, (ctx, t, lt) => {
  ctx.save(); camera(ctx, 540, lerp(720, 690, E.out(clamp(lt / 2))), lerp(1.4, 1.55, clamp(lt / 2)));
  X.drawCarRear(ctx, t, { faces: 1, smile: 1, plate: 1, empty: 0, emptyHL: E.out(inv(K.emptyW - 0.1, K.emptyW + 0.5, t)), light: 0.55, tail: 1 });
  ctx.restore();
  hudShade(ctx, 0.6); pulseAt(ctx, t, K.emptyW, 0.3); pulseAt(ctx, t, K.waitingW, 0.35);
}, { vignette: 0.55 });
// 19. You look for your bike. It's gone.
shot('gone', K.look, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.newline - K.look)));
  const [sx, sy] = shake(t, K.goneW, 14, 0.4);
  ctx.save(); camera(ctx, lerp(700, 860, k), lerp(1050, 900, k), lerp(1.2, 1.7, k), sx, sy);
  X.drawForecourt(ctx, t, { car: false, bike: false, bikeGhost: E.out(inv(K.goneW - 0.1, K.goneW + 0.4, t)), me: ME({ x: 640, y: 1350, s: 0.95, view: 'back' }) });
  ctx.restore();
  hudShade(ctx, 0.6); pulseAt(ctx, t, K.goneW, 0.4, 2);
}, { vignette: 0.45 });
// 20-21. A new line on the note. In your handwriting. I'm in the back.
shot('newline', K.newline, (ctx, t, lt) => {
  const k = E.inOut(inv(K.newline, K.handW, t));
  const [sx, sy] = shake(t, K.backW, 16, 0.45);
  ctx.save(); camera(ctx, 560, lerp(1350, 1560, k), lerp(1.2, 1.6, k), sx, sy);
  X.drawPumpNote(ctx, t, { last: 1, mine: E.inOut(inv(K.handW - 0.3, K.backW + 0.3, t)), dim: 0.4, hl: -1 });
  ctx.restore();
  capShade(ctx, 0.4); hudShade(ctx); pulseAt(ctx, t, K.backW, 0.5, 1.6);
}, {});
// 23-24. Choice card over the dark chained door
shot('choice', K.choice, (ctx, t, lt) => {
  ctx.save(); ctx.filter = `blur(${(9 * clamp(lt / 0.4)).toFixed(1)}px)`;
  ctx.save(); camera(ctx, 540, 820, 1.25); X.drawCarRear(ctx, t, { faces: 1, light: 0.6, plate: 1 }); ctx.restore();
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
    ctx.textAlign = 'left'; ctx.fillStyle = C.white; ctx.font = '54px Osw700'; ctx.fillText(label, 266, y - 8);
    ctx.font = '24px Mono500'; ctx.fillStyle = 'rgba(238,241,247,0.6)'; spaced(ctx, sub, 268, y + 42, 1.5);
    ctx.restore();
  };
  opt('A', 'RULE 2 · STEP BEHIND IT', 840, K.optA, K.optB - 0.1, 'AND LET EVERY FACE SEE YOU');
  opt('B', 'RULE 3 · READ THE PLATE', 1030, K.optB, K.cta - 0.1, 'AND FIND OUT WHOSE IT IS');
  const ca = clamp((t - K.cta + 0.05) / 0.2);
  if (ca > 0) {
    ctx.save(); ctx.globalAlpha = ca; ctx.textBaseline = 'middle'; ctx.font = '84px Osw700';
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
  const ha = t < K.back - 0.1 ? 1 : clamp(1 - (t - K.back + 0.1) / 0.25);
  if (ha > 0) {
    const pop = lerp(1.12, 1, E.outBack(clamp(t / 0.35)));
    ctx.save(); ctx.globalAlpha = ha; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.translate(540, 600); ctx.scale(pop, pop); ctx.translate(-540, -600);
    ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 28;
    rrect(ctx, 110, 475, 860, 250, 26); ctx.fillStyle = 'rgba(6,8,18,0.8)'; ctx.fill();
    ctx.shadowBlur = 0;
    ctx.font = '92px Osw700'; ctx.fillStyle = C.white; ctx.fillText('2:22 AM. NO DRIVER.', 540, 582);
    ctx.fillStyle = C.red; ctx.fillText('ALL FACING BACK.', 540, 687);
    ctx.restore();
  }
}

shots.sort((a, b) => a.start - b.start);
return { shots, K, hudState, overlay, coverTitle: 'THEY {STARE BACK}', coverSize: 80, coverSub: 'NIGHT SHIFT · 2:22 AM' };
};
