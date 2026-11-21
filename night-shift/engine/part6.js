// NIGHT SHIFT — Episode 6 "The cinema projectionist" (the man whose face is a screen). Standalone, ~62 s.
// First episode under the owner directives v2: one place, one monster, 2 rules, a plain twist, a face for "you",
// more movement, 23 shots, light reveals (house lights, projector beam, his glowing face), a scale shot (L17).
// Frame 1 = a BRIGHT, readable cinema hall: red rows, house lights on, one man in H13 with a glowing screen for a face.
// POSTER image (L18): his screen-face, close; on it, you screaming.
const D = require('./draw');
const X = require('./sets_cinema');
const { W, H, C, clamp, lerp, inv, E, shake, rrect, spaced, camera, drawStick } = D;

module.exports = function build(TL) {
const Ln = id => TL.lines[id - 1];
const Wd = (id, k) => Ln(id).words[k].start;
const S0 = id => Ln(id).start - 0.06;
const K = {
  cinemaW: Wd(1, 6),
  face: S0(2), faceW: Wd(2, 1), screenW: Wd(2, 4),
  me: S0(3), projW: Wd(3, 5),
  rules: S0(4), twoW: Wd(4, 5),
  r1: S0(5), stopW: Wd(5, 2), r2: S0(6), lookW: Wd(6, 2), faceRW: Wd(6, 5),
  play: S0(7), playW: Wd(7, 2),
  film: S0(8), roomW: Wd(8, 5), manW: Wd(8, 7), behindW: Wd(8, 9),
  jacket: S0(9), jacketW: Wd(9, 3),
  wave: S0(10), waveW: Wd(10, 1), onW: Wd(10, 2), wavesW: Wd(10, 6),
  isyou: S0(11), youW: Wd(11, 3), nowW: Wd(11, 5),
  shape: S0(12), tallW: Wd(12, 4), stepsW: Wd(12, 6), behind2W: Wd(12, 8),
  empty: S0(13), seatW: Wd(13, 1), emptyW: Wd(13, 3),
  rule1: S0(14), runW: Wd(14, 6),
  hand: S0(15), coldW: Wd(15, 1), shoulderW: Wd(15, 6),
  rule2: S0(16), turnW: Wd(16, 3), look2W: Wd(16, 5),
  scale: S0(17), bendsW: Wd(17, 1), ceilW: Wd(17, 4), twiceW: Wd(17, 5),
  poster: S0(18), screen2W: Wd(18, 4), youreW: Wd(18, 7), screamW: Wd(18, 8),
  twist: S0(19), neverW: Wd(19, 2), filmW: Wd(19, 5), he2W: Wd(19, 6), watchW: Wd(19, 8), you2W: Wd(19, 9),
  choice: Ln(20).start - 0.1, optA: Wd(20, 5), optB: Wd(20, 9), cta: Ln(21).start, ctaA: Wd(21, 2), ctaB: Wd(21, 4),
};
const run = t => t < K.playW ? 0 : E.out(inv(K.playW, K.playW + 0.6, t));

// ---------- HUD ----------
function hudState(t) {
  const blink = (t0, end = C.red) => t < t0 + 0.6 ? (Math.floor(t * 12) % 2 ? C.red : C.white) : end;
  const time = t < K.playW ? '2:59' : t < K.shape ? '3:00' : t < K.hand ? '3:04' : '3:06';
  let seat = ['SEAT H13', 'SOLD · 1', C.white];
  if (t >= K.faceW) seat = ['SEAT H13', 'NO FACE', blink(K.faceW)];
  if (t >= K.emptyW) seat = ['SEAT H13', 'EMPTY', blink(K.emptyW)];
  if (t >= K.shoulderW) seat = ['H13', 'BEHIND YOU', blink(K.shoulderW)];
  let film = ['FILM', 'READY', C.white];
  if (t >= K.playW) film = ['FILM', 'RUNNING', blink(K.playW, C.lime)];
  if (t >= K.youW) film = ['FILM', 'LIVE · YOU', blink(K.youW)];
  let rl = ['RULES', '2', C.white];
  if (t >= K.runW) rl = ['RULE 1', 'KEPT', blink(K.runW, C.lime)];
  if (t >= K.look2W) rl = ['RULE 2', 'BROKEN', blink(K.look2W)];
  return { t, part: 'SHIFT 6', time, ampm: 'AM', labelW: 150, rows: [['CINEMA', 'PROJECTIONIST', C.white], seat, film, rl] };
}

const shots = [];
const shot = (name, start, draw, meta) => shots.push({ name, start, draw, meta });
const hudShade = (ctx, a = 1) => { const g = ctx.createRadialGradient(170, 230, 180, 170, 230, 720); g.addColorStop(0, `rgba(2,3,8,${a})`); g.addColorStop(1, 'rgba(2,3,8,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 760, 820); };
const capShade = (ctx, a = 0.6) => { const g = ctx.createLinearGradient(0, 1250, 0, 1720); g.addColorStop(0, 'rgba(2,3,8,0)'); g.addColorStop(0.35, `rgba(2,3,8,${a})`); g.addColorStop(0.75, `rgba(2,3,8,${a})`); g.addColorStop(1, 'rgba(2,3,8,0)'); ctx.fillStyle = g; ctx.fillRect(0, 1250, W, 470); };
const redPulse = (ctx, a) => { if (a < 0.01) return; const g = ctx.createRadialGradient(540, 960, 300, 540, 960, 1200); g.addColorStop(0, 'rgba(255,40,60,0)'); g.addColorStop(1, `rgba(255,40,60,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
const flash = (ctx, t, t0, a = 0.8) => { if (t < t0 || t > t0 + 0.4) return; ctx.fillStyle = `rgba(235,240,255,${a * (1 - (t - t0) / 0.4)})`; ctx.fillRect(0, 0, W, H); };
const pulseAt = (ctx, t, t0, a = 0.3, k = 2.5) => { if (t > t0) redPulse(ctx, a * Math.exp(-(t - t0) * k)); };
const ME = (o) => ({ s: 1.25, view: 'front', ...o });
const blinkF = t => (t % 3.1 < 0.12 ? 1 : 0);

// 1. HOOK (frame 1): the bright hall, house lights on, one man in H13, his face a glowing screen
shot('hook', 0, (ctx, t, lt) => {
  const k = E.inOut(clamp(t / K.face));
  ctx.save(); camera(ctx, 560, lerp(840, 800, k), lerp(1.45, 1.85, k));
  X.drawHall(ctx, t, { light: 1, beam: 0, label: E.out(inv(K.cinemaW, K.cinemaW + 0.4, t)), tilt: Math.sin(t * 1.3) * 0.04 });
  ctx.restore();
  hudShade(ctx, 0.5);
}, { vignette: 0.25 });
// 2. His face is a screen. — close, his head tilts toward you
shot('face', K.face, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.screenW, 14, 0.4);
  ctx.save(); camera(ctx, 540, lerp(1000, 920, E.out(clamp(lt / 1.6))), lerp(0.95, 1.12, clamp(lt / 1.6)), sx, sy);
  X.drawFaceClose(ctx, t, { tilt: lerp(0, -0.12, E.inOut(inv(K.faceW, K.screenW + 0.3, t))) });
  ctx.restore();
  hudShade(ctx, 0.6); flash(ctx, t, K.face, 0.35); pulseAt(ctx, t, K.screenW, 0.35, 2);
}, { vignette: 0.4 });
// 3. Your first night as the projectionist. — you walk into the booth
shot('me', K.me, (ctx, t, lt) => {
  const wk = clamp(lt / 1.6);
  const x = lerp(-60, 250, E.out(wk));
  ctx.save(); camera(ctx, lerp(380, 470, E.inOut(clamp(lt / 2.2))), 1180, lerp(1.15, 1.25, clamp(lt / 2.2)));
  X.drawBooth(ctx, t, { light: 1, run: 0, me: ME({ x, s: 1.25, walk: wk < 1 ? lt * 7 : undefined, face: { fear: 0, look: wk < 1 ? 0.6 : lerp(0.6, 0, clamp((lt - 1.6) / 0.4)), blink: blinkF(t) } }) });
  ctx.restore();
  hudShade(ctx, 0.6);
}, { vignette: 0.4 });
// 4-6. the note on the projector: 2 rules
shot('note', K.rules, (ctx, t, lt) => {
  ctx.save(); camera(ctx, 540, lerp(980, 1040, E.out(clamp(lt / 1.2))), lerp(1.12, 1.0, E.out(clamp(lt / 0.6))));
  X.drawNote(ctx, t, {});
  ctx.restore();
  hudShade(ctx, 0.7); flash(ctx, t, K.rules, 0.25);
}, { vignette: 0.4 });
const R = X.NOTE_RULES;
const ruleShot = (i, t0, t1, hlW) => shot('rule' + (i + 1), t0, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / 0.45));
  const prevY = i ? R[0].y : 760;
  ctx.save(); camera(ctx, 560, lerp(prevY, R[i].y, k) + 40, lerp(1.4, 1.52, clamp(lt / (t1 - t0))));
  X.drawNote(ctx, t, { hl: i, hlA: E.out(inv(hlW - 0.1, hlW + 0.5, t)), dim: 1 });
  ctx.restore();
  capShade(ctx, 0.55); hudShade(ctx);
  const a = E.outBack(clamp(lt / 0.3));
  ctx.save(); ctx.globalAlpha = clamp(lt / 0.12) * clamp((t1 - t) / 0.2); ctx.translate(880, 560); ctx.rotate(0.08); ctx.scale(lerp(1.5, 1, a), lerp(1.5, 1, a));
  rrect(ctx, -110, -70, 220, 140, 14); ctx.fillStyle = C.red; ctx.fill(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '96px Osw700'; ctx.fillStyle = '#fff'; ctx.fillText(`#${i + 1}`, 0, 6);
  ctx.restore();
}, {});
ruleShot(0, K.r1, K.r2, K.stopW);
ruleShot(1, K.r2, K.play, K.lookW);
// 7. You press play. — your finger on PLAY
shot('play', K.play, (ctx, t, lt) => {
  const pr = t < K.playW - 0.15 ? 0 : E.out(inv(K.playW - 0.15, K.playW, t)) * (t > K.playW + 0.3 ? 0.6 : 1);
  const up = E.out(clamp(lt / 0.5));
  ctx.save(); camera(ctx, 470, 1020, lerp(1.0, 1.12, clamp(lt / 1.4)));
  X.drawPanel(ctx, t, { press: Math.max(pr, 0.0001), run: run(t), hand: 1, hover: 0, _up: up });
  ctx.restore();
  hudShade(ctx, 0.6); flash(ctx, t, K.playW, 0.3);
}, { vignette: 0.45 });
// 7b. the projector wakes: reels spin, the beam shoots through the window
shot('reels', K.playW + 0.45, (ctx, t, lt) => {
  ctx.save(); camera(ctx, lerp(560, 600, clamp(lt / 1)), 1000, lerp(1.05, 1.15, clamp(lt / 1)));
  X.drawBooth(ctx, t, { light: 0.8, run: run(t), me: ME({ x: 250, face: { fear: 0.1, look: 1 } }) });
  ctx.restore();
  hudShade(ctx, 0.6); flash(ctx, t, K.playW + 0.45, 0.2);
}, { vignette: 0.45 });
// 8. The film shows a small room. A man, from behind. — POV through the booth window
shot('pov', K.film, (ctx, t, lt) => {
  const z = t < K.manW ? lerp(1.0, 1.1, inv(K.film, K.manW, t)) : lerp(1.1, 1.7, E.inOut(inv(K.manW, K.manW + 0.7, t)));
  const cy = t < K.manW ? 1000 : lerp(1000, 720, E.inOut(inv(K.manW, K.manW + 0.7, t)));
  ctx.save(); camera(ctx, t < K.manW ? 540 : lerp(540, 520, E.inOut(inv(K.manW, K.manW + 0.7, t))), cy, z);
  X.drawPOV(ctx, t, { play: E.out(inv(K.film, K.film + 0.6, t)), film: {} });
  ctx.restore();
  hudShade(ctx, 0.6);
}, { vignette: 0.45 });
// 9. He's wearing your jacket. — you, worried, look down at your own mustard jacket
shot('jacket', K.jacket, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.jacketW, 12, 0.35);
  const down = E.inOut(inv(K.jacketW - 0.4, K.jacketW, t));
  ctx.save(); camera(ctx, 300, lerp(1440, 1480, clamp(lt / 1.4)), lerp(2.0, 2.3, clamp(lt / 1.4)), sx, sy);
  X.drawBooth(ctx, t, { light: 0.8, run: 1, me: ME({ x: 300, headDY: down * 10, face: { fear: lerp(0.3, 0.5, down), look: lerp(1, 0, down), blink: blinkF(t) } }) });
  ctx.restore();
  hudShade(ctx, 0.6); pulseAt(ctx, t, K.jacketW, 0.35, 2);
}, { vignette: 0.45 });
// 10a. You wave.
shot('wave', K.wave, (ctx, t, lt) => {
  const wv = t > K.waveW - 0.2 ? Math.sin((t - K.waveW) * 9) * 1.6 : 0;
  ctx.save(); camera(ctx, 420, 1250, lerp(1.45, 1.55, clamp(lt / 1)));
  X.drawBooth(ctx, t, { light: 0.8, run: 1, me: ME({ x: 300, arm: t > K.waveW - 0.2 ? 'wave' : undefined, wv, face: { fear: 0.4, look: 1 } }) });
  ctx.restore();
  hudShade(ctx, 0.6);
}, { vignette: 0.45 });
// 10b. On the screen, he waves. — the screen, close
shot('screenwave', K.onW - 0.05, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.wavesW, 12, 0.35);
  ctx.save(); camera(ctx, 540, 680, lerp(1.6, 1.8, clamp(lt / 2)), sx, sy);
  X.drawPOV(ctx, t, { play: 1, film: { wave: t > K.wavesW - 0.15 ? 1 : 0 } });
  ctx.restore();
  hudShade(ctx, 0.6); pulseAt(ctx, t, K.wavesW, 0.3);
}, { vignette: 0.4 });
// 11. The film is you. Right now. — your face, close, scared
shot('isyou', K.isyou, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.youW, 14, 0.4);
  ctx.save(); camera(ctx, 300, lerp(1310, 1290, clamp(lt / 2.4)), lerp(3.2, 3.8, E.inOut(clamp(lt / 2.4))), sx, sy);
  X.drawBooth(ctx, t, { light: 0.7, run: 1, me: ME({ x: 300, face: { fear: lerp(0.45, 0.75, inv(K.youW - 0.2, K.youW + 0.2, t)), look: Math.sin(t * 3) * 0.3 } }) });
  ctx.restore();
  hudShade(ctx, 0.6); pulseAt(ctx, t, K.youW, 0.45, 2); pulseAt(ctx, t, K.nowW, 0.3);
}, { vignette: 0.55 });
// 12. On the screen, a tall shape steps up behind you.
shot('shape', K.shape, (ctx, t, lt) => {
  const sh = E.inOut(inv(K.tallW - 0.2, K.behind2W + 0.3, t));
  const [sx, sy] = shake(t, K.behind2W, 14, 0.4);
  ctx.save(); camera(ctx, 540, 680, lerp(1.55, 1.85, E.inOut(clamp(lt / 3))), sx, sy);
  X.drawPOV(ctx, t, { play: 1, film: { shape: sh, live: 1 } });
  ctx.restore();
  hudShade(ctx, 0.6); pulseAt(ctx, t, K.behind2W, 0.4, 2);
}, { vignette: 0.45 });
// 13. His seat is empty. — POV pulls down to H13: nobody there
shot('empty', K.empty, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / 0.9));
  const [sx, sy] = shake(t, K.emptyW, 10, 0.3);
  ctx.save(); camera(ctx, 560, lerp(1100, 1450, k), lerp(1.0, 1.35, k), sx, sy);
  X.drawPOV(ctx, t, { play: 1, viewer: 0, label: E.out(inv(K.emptyW - 0.1, K.emptyW + 0.3, t)), film: { shape: 1, live: 1 } });
  ctx.restore();
  hudShade(ctx, 0.6); flash(ctx, t, K.empty, 0.2); pulseAt(ctx, t, K.emptyW, 0.35);
}, { vignette: 0.5 });
// 14. Rule one. You let the film run. — finger trembling over STOP, then pulled back
shot('stop', K.rule1, (ctx, t, lt) => {
  const hv = E.out(clamp(lt / 0.6)) * (t > K.runW ? lerp(1, 0.55, E.inOut(inv(K.runW, K.runW + 0.5, t))) : 1);
  ctx.save(); camera(ctx, 640, 1040, lerp(1.05, 1.15, clamp(lt / 2)));
  X.drawPanel(ctx, t, { hover: hv, tremble: 1, run: 1 });
  ctx.restore();
  hudShade(ctx, 0.6);
}, { vignette: 0.5 });
// 15. A cold hand rests on your shoulder.
shot('hand', K.hand, (ctx, t, lt) => {
  const land = inv(K.coldW, K.shoulderW + 0.1, t);
  const [sx, sy] = shake(t, K.shoulderW, 16, 0.4);
  ctx.save(); camera(ctx, 560, 1150, lerp(1.0, 1.08, clamp(lt / 2.2)), sx, sy);
  X.drawShoulder(ctx, t, { land, flinch: t > K.shoulderW ? Math.exp(-(t - K.shoulderW) * 6) : 0 });
  ctx.restore();
  hudShade(ctx, 0.6); pulseAt(ctx, t, K.shoulderW, 0.45, 2);
}, { vignette: 0.55 });
// 16. Rule two. You turn and look. — low angle; you turn, your face goes from fear to terror
shot('turn', K.rule2, (ctx, t, lt) => {
  const tr = E.inOut(inv(K.turnW - 0.1, K.turnW + 0.35, t));
  const [sx, sy] = shake(t, K.look2W, 16, 0.45);
  ctx.save(); camera(ctx, 330, lerp(1240, 1210, clamp(lt / 2)), lerp(2.3, 2.7, E.inOut(clamp(lt / 2))), sx, sy, -0.04);
  X.drawBooth(ctx, t, { light: 0.6, run: 1, me: ME({ x: 300, view: tr < 0.5 ? 'back' : 'front', headSX: Math.abs(Math.cos(tr * Math.PI)) * 0.8 + 0.2, face: { fear: t < K.look2W ? 0.6 : 1, look: -1, side: -0.5 } }) });
  ctx.restore();
  hudShade(ctx, 0.6); pulseAt(ctx, t, K.look2W, 0.5, 1.8); flash(ctx, t, K.look2W, 0.3);
}, { vignette: 0.55 });
// 17. He bends under the ceiling, twice your height. — THE SCALE SHOT
shot('scale', K.scale, (ctx, t, lt) => {
  const bend = lerp(0.55, 0.9, E.inOut(inv(K.bendsW - 0.2, K.ceilW + 0.3, t)));
  const [sx, sy] = shake(t, K.ceilW, 10, 0.35);
  ctx.save(); camera(ctx, lerp(360, 330, clamp(lt / 2.4)), lerp(1140, 1110, clamp(lt / 2.4)), lerp(0.95, 0.88, clamp(lt / 2.4)), sx, sy);
  X.drawBooth(ctx, t, { light: 0.6, run: 1, viewer: { x: 150, s: 0.85, bend, mode: 'blank' }, me: ME({ x: 430, s: 1.2, face: { fear: 1, look: -1, side: -0.4 } }) });
  // height bars: you vs him
  const hb = E.out(inv(K.twiceW - 0.1, K.twiceW + 0.4, t));
  if (hb > 0) {
    ctx.save(); ctx.globalAlpha = hb; ctx.lineWidth = 10; ctx.lineCap = 'round';
    const yF = X.BOOTH.floor;
    ctx.strokeStyle = C.lime; ctx.beginPath(); ctx.moveTo(560, yF); ctx.lineTo(560, lerp(yF, yF - 470, hb)); ctx.moveTo(535, yF - 470); ctx.lineTo(585, yF - 470); ctx.stroke();
    ctx.strokeStyle = C.red; ctx.beginPath(); ctx.moveTo(-40, yF); ctx.lineTo(-40, lerp(yF, X.BOOTH.ceil + 10, hb)); ctx.moveTo(-65, X.BOOTH.ceil + 10); ctx.lineTo(-15, X.BOOTH.ceil + 10); ctx.stroke();
    ctx.font = '64px Osw700'; ctx.textAlign = 'center'; ctx.fillStyle = C.lime; ctx.fillText('YOU', 640, yF - 490);
    ctx.textAlign = 'left'; ctx.fillStyle = C.red; ctx.fillText('HIM · 2X', -20, X.BOOTH.ceil + 100);
    ctx.restore();
  }
  ctx.restore();
  hudShade(ctx, 0.6); pulseAt(ctx, t, K.twiceW, 0.35);
}, { vignette: 0.45 });
// 18. His face is a screen. On it, you're screaming. — THE POSTER IMAGE
shot('poster', K.poster, (ctx, t, lt) => {
  const scream = t >= K.youreW - 0.05;
  const [sx, sy] = shake(t, K.youreW - 0.05, 22, 0.5);
  ctx.save(); camera(ctx, 540, lerp(980, 900, E.out(clamp(lt / 3))), lerp(0.95, 1.12, E.out(clamp(lt / 3))), sx, sy);
  X.drawFaceClose(ctx, t, { mode: scream ? 'scream' : 'blank', tilt: 0.05 * Math.sin(t * 1.7) });
  ctx.restore();
  hudShade(ctx, 0.6); flash(ctx, t, K.youreW - 0.05, 0.45); pulseAt(ctx, t, K.youreW, 0.5, 1.6);
}, { vignette: 0.35 });
// 19a. He was never watching the film. — the empty hall from the window, the live film still running
shot('twist', K.twist, (ctx, t, lt) => {
  ctx.save(); camera(ctx, 560, lerp(1150, 1050, clamp(lt / 1.8)), lerp(1.15, 1.0, clamp(lt / 1.8)));
  X.drawPOV(ctx, t, { play: 1, viewer: 0, label: 1, film: { shape: 1, lean: 1, live: 1, wave: 0 } });
  ctx.restore();
  hudShade(ctx, 0.6); flash(ctx, t, K.twist, 0.2);
}, { vignette: 0.5 });
// 19b. He was watching you. — his screen-face inches from yours; on it, your own face
shot('watching', K.he2W - 0.05, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.you2W, 14, 0.45);
  ctx.save(); camera(ctx, 440, lerp(1150, 1120, clamp(lt / 2)), lerp(1.25, 1.38, E.inOut(clamp(lt / 2))), sx, sy);
  X.drawBooth(ctx, t, { light: 0.5, run: 1, viewer: { x: 150, s: 0.85, bend: 0.95, mode: 'you', arm: E.out(clamp(lt / 1.2)) }, me: ME({ x: 470, s: 1.2, face: { fear: 1, look: -1, side: -0.4 } }) });
  ctx.restore();
  hudShade(ctx, 0.6); pulseAt(ctx, t, K.you2W, 0.5, 1.6);
}, { vignette: 0.5 });
// 20-21. Choice card over the dark booth
shot('choice', K.choice, (ctx, t, lt) => {
  ctx.save(); ctx.filter = `blur(${(9 * clamp(lt / 0.4)).toFixed(1)}px)`;
  ctx.save(); camera(ctx, 400, 1150, 1.1); X.drawBooth(ctx, t, { light: 0.5, run: 1, viewer: { x: 150, s: 0.85, bend: 0.9 }, me: ME({ x: 430, s: 1.2, face: { fear: 1 } }) }); ctx.restore();
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
    ctx.textAlign = 'left'; ctx.fillStyle = C.white; ctx.font = '54px Osw700'; ctx.fillText(label, 266, y - 8);
    ctx.font = '24px Mono500'; ctx.fillStyle = 'rgba(238,241,247,0.6)'; spaced(ctx, sub, 268, y + 42, 1.5);
    ctx.restore();
  };
  opt('A', 'RULE 1 · STOP THE FILM', 840, K.optA, K.optB - 0.1, 'AND THE SCREEN GOES DARK');
  opt('B', 'RULE 2 · LOOK AT HIM', 1030, K.optB, K.cta - 0.1, 'AND SEE YOURSELF ON HIS FACE');
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
  const ha = t < K.face - 0.1 ? 1 : clamp(1 - (t - K.face + 0.1) / 0.25);
  if (ha > 0) {
    const pop = lerp(1.12, 1, E.outBack(clamp(t / 0.35)));
    ctx.save(); ctx.globalAlpha = ha; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.translate(540, 560); ctx.scale(pop, pop); ctx.translate(-540, -560);
    ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 28;
    rrect(ctx, 150, 435, 780, 250, 26); ctx.fillStyle = 'rgba(6,8,18,0.8)'; ctx.fill();
    ctx.shadowBlur = 0;
    ctx.font = '92px Osw700'; ctx.fillStyle = C.white; ctx.fillText('HIS FACE', 540, 542);
    ctx.fillStyle = C.red; ctx.fillText('IS A SCREEN.', 540, 647);
    ctx.restore();
  }
}

shots.sort((a, b) => a.start - b.start);
return { shots, K, hudState, overlay, coverTitle: 'HIS FACE IS {A SCREEN}', coverSize: 72, coverSub: 'NIGHT SHIFT · 3 AM' };
};
