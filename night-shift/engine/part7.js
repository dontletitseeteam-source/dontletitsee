// NIGHT SHIFT — Episode 7 "The highway toll booth" (THE BACKWARDS MAN: a truck driver whose head is on backwards). ~59 s.
// v2 rules: one place, one monster, 2 rules, a plain twist, a face for "you", movement, 23 shots, light reveals (canopy,
// the cab's dome light, the glowing mirror), a scale shot (L14). Silhouette rule (ANALYTICS 2026-11-23): his wrongness
// reads in outline: chest + toes one way, face the other. Frame 1 = the BRIGHT plaza, him in the cab window, face backwards.
// POSTER image (L13): from inside your booth, his BACK in the TOLL STAFF vest with his FACE on top, looking in.
const D = require('./draw');
const X = require('./sets_toll');
const { W, H, C, clamp, lerp, inv, E, shake, rrect, spaced, camera } = D;

module.exports = function build(TL) {
const Ln = id => TL.lines[id - 1];
const Wd = (id, k) => Ln(id).words[k].start;
const S0 = id => Ln(id).start - 0.06;
const K = {
  truckW: Wd(1, 3), boothW: Wd(1, 8),
  drv: S0(2), headW: Wd(2, 2), backW: Wd(2, 5),
  me: S0(3), tollW: Wd(3, 5),
  rules: S0(4), twoW: Wd(4, 5),
  r1: S0(5), liftW: Wd(5, 2), r2: S0(6), lookW: Wd(6, 2), mirrorW: Wd(6, 5),
  hands: S0(7), wheelW: Wd(7, 5), faceW: Wd(7, 7), roadW: Wd(7, 12),
  pay: S0(8), paysW: Wd(8, 1), aroundW: Wd(8, 4),
  rule1: S0(9), lift2W: Wd(9, 3), barrierW: Wd(9, 5),
  still: S0(10), moveW: Wd(10, 3),
  door: S0(11), opensW: Wd(11, 2),
  walk: S0(12), climbW: Wd(12, 1), walksW: Wd(12, 3), windowW: Wd(12, 6), bwW: Wd(12, 7),
  poster: S0(13), face2W: Wd(13, 2), seeW: Wd(13, 4), youW: Wd(13, 5),
  scale: S0(14), tallerW: Wd(14, 1), booth2W: Wd(14, 4),
  tap: S0(15), tapsW: Wd(15, 1), glassW: Wd(15, 3), pointsW: Wd(15, 4), mirror2W: Wd(15, 7),
  rule2: S0(16), look2W: Wd(16, 3),
  mirror: S0(17), headW2: Wd(17, 4), turningW: Wd(17, 6), aroundW2: Wd(17, 7),
  vest: S0(18), staffW: Wd(18, 4), lastW: Wd(18, 5), manW: Wd(18, 10),
  turn: S0(19), turnW: Wd(19, 3),
  choice: Ln(20).start - 0.1, optA: Wd(20, 5), optB: Wd(20, 10), cta: Ln(21).start, ctaA: Wd(21, 2), ctaB: Wd(21, 4),
};
const lift = t => t < K.barrierW - 0.2 ? 0 : E.inOut(inv(K.barrierW - 0.2, K.barrierW + 0.9, t));
const blinkF = (t, off = 0) => ((t + off) % 3.4 < 0.14 ? 1 : 0);
const B = X.BOOTH, G = X.G;
const meHeadY = G - 40 - 338 * 1.1;

// ---------- HUD ----------
function hudState(t) {
  const blink = (t0, end = C.red) => t < t0 + 0.6 ? (Math.floor(t * 12) % 2 ? C.red : C.white) : end;
  const time = t < K.rules ? '3:00' : t < K.still ? '3:01' : t < K.poster ? '3:02' : '3:03';
  let tr = ['TRUCK', 'STOPPED', C.white];
  if (t >= K.backW) tr = ['DRIVER', 'HEAD BACKWARDS', blink(K.backW)];
  if (t >= K.paysW) tr = ['TOLL', 'PAID', blink(K.paysW, C.lime)];
  if (t >= K.moveW) tr = ['TRUCK', 'NOT MOVING', blink(K.moveW)];
  if (t >= K.climbW) tr = ['DRIVER', 'OUT OF CAB', blink(K.climbW)];
  if (t >= K.windowW) tr = ['DRIVER', 'AT YOUR WINDOW', blink(K.windowW)];
  const bar = t >= K.barrierW ? ['BARRIER', 'UP', blink(K.barrierW, C.lime)] : ['BARRIER', 'DOWN', C.white];
  let rl = ['RULES', '2', C.white];
  if (t >= K.barrierW) rl = ['RULE 1', 'KEPT', blink(K.barrierW, C.lime)];
  if (t >= K.look2W) rl = ['RULE 2', 'BROKEN', blink(K.look2W)];
  return { t, part: 'SHIFT 7', time, ampm: 'AM', labelW: 150, rows: [['TOLL PLAZA', 'LANE 3', C.white], tr, bar, rl] };
}

const shots = [];
const shot = (name, start, draw, meta) => shots.push({ name, start, draw, meta });
const hudShade = (ctx, a = 1) => { const g = ctx.createRadialGradient(170, 230, 180, 170, 230, 720); g.addColorStop(0, `rgba(2,3,8,${a})`); g.addColorStop(1, 'rgba(2,3,8,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 760, 820); };
const capShade = (ctx, a = 0.6) => { const g = ctx.createLinearGradient(0, 1250, 0, 1720); g.addColorStop(0, 'rgba(2,3,8,0)'); g.addColorStop(0.35, `rgba(2,3,8,${a})`); g.addColorStop(0.75, `rgba(2,3,8,${a})`); g.addColorStop(1, 'rgba(2,3,8,0)'); ctx.fillStyle = g; ctx.fillRect(0, 1250, W, 470); };
const redPulse = (ctx, a) => { if (a < 0.01) return; const g = ctx.createRadialGradient(540, 960, 300, 540, 960, 1200); g.addColorStop(0, 'rgba(255,40,60,0)'); g.addColorStop(1, `rgba(255,40,60,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
const flash = (ctx, t, t0, a = 0.8) => { if (t < t0 || t > t0 + 0.4) return; ctx.fillStyle = `rgba(235,240,255,${a * (1 - (t - t0) / 0.4)})`; ctx.fillRect(0, 0, W, H); };
const pulseAt = (ctx, t, t0, a = 0.3, k = 2.5) => { if (t > t0) redPulse(ctx, a * Math.exp(-(t - t0) * k)); };
const ME = (o) => ({ s: 1.1, view: 'front', ...o });

// 1. HOOK (frame 1): the bright toll plaza, the truck at your lane, the driver in the window, face pointing backwards
shot('hook', 0, (ctx, t, lt) => {
  const k = E.inOut(clamp(t / K.drv));
  ctx.save(); camera(ctx, lerp(520, 470, k), lerp(930, 900, k), lerp(1.85, 2.2, k));
  X.drawPlaza(ctx, t, { light: 1, driver: true, blink: blinkF(t), me: ME({ face: { fear: 0.2, look: -1, blink: blinkF(t, 1.3) } }) });
  ctx.restore();
  hudShade(ctx, 0.5);
}, { vignette: 0.25 });
// 2. The driver's head is on backwards. — close on the cab window
shot('drv', K.drv, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.backW, 16, 0.4);
  ctx.save(); camera(ctx, lerp(420, 440, clamp(lt / 2)), lerp(930, 905, clamp(lt / 2)), lerp(3.0, 3.5, E.out(clamp(lt / 2))), sx, sy);
  X.drawPlaza(ctx, t, { light: 1, driver: true, blink: blinkF(t, 0.5), look: Math.sin(t * 2) * 0.5, eyeGlow: t > K.backW ? 1 : 0, me: null });
  ctx.restore();
  hudShade(ctx, 0.6); flash(ctx, t, K.drv, 0.3); pulseAt(ctx, t, K.backW, 0.4, 2);
}, { vignette: 0.4 });
// 3. Your first night as the toll man. — you walk into the lit booth
shot('me', K.me, (ctx, t, lt) => {
  const wk = clamp(lt / 1.3);
  ctx.save(); camera(ctx, lerp(820, 850, clamp(lt / 2)), 960, lerp(1.6, 1.75, clamp(lt / 2)));
  X.drawPlaza(ctx, t, { light: 1, driver: true, me: ME({ x: lerp(690, B.meX, E.out(wk)), walk: wk < 1 ? lt * 7 : undefined, face: { fear: 0, look: wk < 1 ? 0.6 : lerp(0.6, -0.6, clamp((lt - 1.3) / 0.4)), blink: blinkF(t) } }) });
  ctx.restore();
  hudShade(ctx, 0.6);
}, { vignette: 0.4 });
// 4-6. the note: 2 rules
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
ruleShot(0, K.r1, K.r2, K.liftW);
ruleShot(1, K.r2, K.hands, K.lookW);
// 7a. His hands are on the wheel. — close on the hands, then the camera climbs to his face
shot('hands', K.hands, (ctx, t, lt) => {
  const up = E.inOut(inv(K.faceW - 0.35, K.faceW + 0.25, t));
  ctx.save(); camera(ctx, lerp(370, 445, up), lerp(1000, 900, up), lerp(3.6, 3.9, clamp(lt / 3.4)));
  X.drawPlaza(ctx, t, { light: 0.95, driver: true, blink: blinkF(t, 2), me: null });
  ctx.restore();
  hudShade(ctx, 0.6); pulseAt(ctx, t, K.faceW, 0.3);
}, { vignette: 0.45 });
// 7b. ...back down the road. — wide: his face aims down the dark highway behind the truck
shot('road', K.roadW - 0.5, (ctx, t, lt) => {
  ctx.save(); camera(ctx, lerp(700, 860, E.inOut(clamp(lt / 1.2))), 820, lerp(1.05, 0.95, clamp(lt / 1.2)));
  X.drawPlaza(ctx, t, { light: 0.9, driver: true, me: ME({ face: { fear: 0.3, look: -1 } }) });
  ctx.restore();
  hudShade(ctx, 0.6);
}, { vignette: 0.45 });
// 8. He pays without turning around. — from inside the booth: his arm comes out, elbow bent the wrong way
shot('pay', K.pay, (ctx, t, lt) => {
  const p = E.inOut(inv(K.paysW - 0.2, K.aroundW, t));
  const [sx, sy] = shake(t, K.aroundW, 10, 0.3);
  ctx.save(); camera(ctx, 540, 960, lerp(1.0, 1.08, clamp(lt / 1.8)), sx, sy);
  X.drawGlass(ctx, t, { out: 'cab', pay: p, blink: blinkF(t, 1) });
  ctx.restore();
  hudShade(ctx, 0.6); pulseAt(ctx, t, K.aroundW, 0.3);
}, { vignette: 0.45 });
// 9a. Rule one. You lift the barrier. — your finger on UP
shot('press', K.rule1, (ctx, t, lt) => {
  const pr = E.out(inv(K.lift2W - 0.1, K.lift2W + 0.1, t));
  ctx.save(); camera(ctx, 470, 1000, lerp(1.0, 1.1, clamp(lt / 1.6)));
  X.drawConsole(ctx, t, { press: pr, hand: E.out(clamp(lt / 0.6)) });
  ctx.restore();
  hudShade(ctx, 0.6); flash(ctx, t, K.lift2W, 0.2);
}, { vignette: 0.45 });
// 9b. ...the barrier. — wide: the barrier arm swings up, the lane light turns green
shot('lift', K.barrierW - 0.15, (ctx, t, lt) => {
  ctx.save(); camera(ctx, 380, 900, lerp(1.15, 1.05, clamp(lt / 1.2)));
  X.drawPlaza(ctx, t, { light: 1, driver: true, barrier: lift(t), green: t > K.barrierW + 0.3, me: ME({ face: { fear: 0.2, look: -1 } }) });
  ctx.restore();
  hudShade(ctx, 0.6);
}, { vignette: 0.4 });
// 10. The truck doesn't move. — wide, static, the engine idling
shot('still', K.still, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.moveW, 6, 0.3);
  ctx.save(); camera(ctx, 560, 880, lerp(0.9, 0.95, clamp(lt / 1.6)), sx, sy);
  X.drawPlaza(ctx, t, { light: 0.95, driver: true, barrier: 1, green: true, me: ME({ face: { fear: 0.45, look: -1 } }) });
  ctx.restore();
  hudShade(ctx, 0.6); pulseAt(ctx, t, K.moveW, 0.25);
}, { vignette: 0.45 });
// 11. The door opens. — the cab door swings, the dome light spills out
shot('door', K.door, (ctx, t, lt) => {
  const op = E.out(inv(K.opensW - 0.1, K.opensW + 0.5, t));
  ctx.save(); camera(ctx, 400, 1020, lerp(2.0, 2.2, clamp(lt / 1.4)));
  X.drawPlaza(ctx, t, { light: 0.9, driver: op < 0.5, door: op, barrier: 1, green: true, me: null });
  ctx.restore();
  hudShade(ctx, 0.6); flash(ctx, t, K.opensW, 0.15);
}, { vignette: 0.5 });
// 12. He climbs down, walks to your window. Backwards. — wide, the whole wrong silhouette
shot('walk', K.walk, (ctx, t, lt) => {
  const down = E.out(inv(K.climbW - 0.1, K.walksW - 0.1, t));
  const wk = inv(K.walksW - 0.1, K.bwW, t);
  const x = lerp(400, 560, E.inOut(wk));
  const [sx, sy] = shake(t, K.bwW, 14, 0.4);
  const z = t < K.bwW ? 1.0 : lerp(1.0, 1.25, E.out(inv(K.bwW, K.bwW + 0.6, t)));
  ctx.save(); camera(ctx, t < K.bwW ? 600 : lerp(600, 560, E.out(inv(K.bwW, K.bwW + 0.6, t))), t < K.bwW ? 880 : lerp(880, 800, E.out(inv(K.bwW, K.bwW + 0.6, t))), z, sx, sy);
  X.drawPlaza(ctx, t, { light: 0.95, driver: false, door: 1, barrier: 1, green: true, walker: { x, walk: wk > 0 && wk < 1 ? -lt * 6 : undefined, bob: (1 - down) * -120, blink: blinkF(t) }, me: ME({ face: { fear: lerp(0.4, 0.8, wk), look: -1 } }) });
  ctx.restore();
  hudShade(ctx, 0.6); pulseAt(ctx, t, K.bwW, 0.45, 2);
}, { vignette: 0.45 });
// 13. Now his face can see you. — THE POSTER: from inside the booth, his back in the vest, his face on top
shot('poster', K.poster, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.seeW, 18, 0.45);
  ctx.save(); camera(ctx, 540, lerp(960, 930, E.out(clamp(lt / 2))), lerp(1.0, 1.1, E.out(clamp(lt / 2))), sx, sy);
  X.drawGlass(ctx, t, { out: 'back', backX: 540, backY: 1010, backS: 1, blink: blinkF(t, 0.3), smile: lerp(0.2, 0.7, inv(K.seeW, K.youW + 0.3, t)), eyeGlow: t > K.seeW ? 1 : 0, tilt: Math.sin(t * 1.1) * 0.04 });
  ctx.restore();
  hudShade(ctx, 0.6); flash(ctx, t, K.poster + 0.05, 0.4); pulseAt(ctx, t, K.youW, 0.45, 1.8);
}, { vignette: 0.35 });
// 14. He's taller than your booth. — THE SCALE SHOT
shot('scale', K.scale, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.tallerW, 10, 0.35);
  ctx.save(); camera(ctx, lerp(700, 720, clamp(lt / 1.6)), lerp(860, 840, clamp(lt / 1.6)), lerp(0.98, 0.9, clamp(lt / 1.6)), sx, sy);
  X.drawPlaza(ctx, t, { light: 0.9, driver: false, door: 1, barrier: 1, green: true, walker: { x: 565, lean: lerp(0, 0.6, E.inOut(inv(K.tallerW, K.booth2W + 0.4, t))), blink: blinkF(t) }, me: ME({ face: { fear: 0.9, look: -1 } }) });
  const hb = E.out(inv(K.tallerW - 0.1, K.tallerW + 0.4, t));
  if (hb > 0) {
    ctx.save(); ctx.globalAlpha = hb; ctx.lineWidth = 10; ctx.lineCap = 'round';
    const yB = B.top - 90, yH = G + 10 - 0.95 * 905;
    ctx.strokeStyle = C.lime; ctx.beginPath(); ctx.moveTo(1090, G); ctx.lineTo(1090, lerp(G, yB, hb)); ctx.moveTo(1065, yB); ctx.lineTo(1115, yB); ctx.stroke();
    ctx.strokeStyle = C.red; ctx.beginPath(); ctx.moveTo(440, G); ctx.lineTo(440, lerp(G, yH, hb)); ctx.moveTo(415, yH); ctx.lineTo(465, yH); ctx.stroke();
    ctx.font = '60px Osw700'; ctx.textAlign = 'center'; ctx.fillStyle = C.lime; ctx.fillText('BOOTH', 1090, yB - 24);
    ctx.fillStyle = C.red; ctx.fillText('HIM', 440, yH - 24);
    ctx.restore();
  }
  ctx.restore();
  hudShade(ctx, 0.6); pulseAt(ctx, t, K.tallerW, 0.35);
}, { vignette: 0.45 });
// 15a. He taps the glass. — his knuckles (bent backwards) knock; the glass ripples
shot('tap', K.tap, (ctx, t, lt) => {
  const tp = t > K.tapsW ? (t - K.tapsW) * 0.9 : 0;
  const [sx, sy] = shake(t, K.glassW, 12, 0.3);
  ctx.save(); camera(ctx, 560, lerp(720, 700, clamp(lt / 1.4)), lerp(1.25, 1.35, clamp(lt / 1.4)), sx, sy);
  X.drawGlass(ctx, t, { out: 'back', backX: 520, backY: 1150, backS: 1.05, blink: 0, smile: 0.7, eyeGlow: 1, tap: tp, tapX: 760, tapY: 820 });
  // the hand at the glass: palm facing you, thumb on the wrong side
  if (t > K.tapsW - 0.15) {
    const knock = Math.abs(Math.sin((t - K.tapsW) * 9)) * 16;
    ctx.save(); ctx.translate(760, 820 - knock); ctx.fillStyle = '#c3c8d2'; ctx.strokeStyle = '#0b1022'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.ellipse(0, 40, 60, 74, 0, 0, 7); ctx.fill(); ctx.stroke();
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(-36 + i * 24, -40 - (i === 1 || i === 2 ? 14 : 0), 12, 36, 0, 0, 7); ctx.fill(); ctx.stroke(); }
    ctx.beginPath(); ctx.ellipse(-70, 40, 14, 34, 0.6, 0, 7); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
  hudShade(ctx, 0.6);
}, { vignette: 0.45 });
// 15b. Points at his mirror. — the side mirror lights up
shot('mirrorins', K.pointsW - 0.05, (ctx, t, lt) => {
  const gl = E.out(inv(K.mirror2W - 0.2, K.mirror2W + 0.3, t));
  ctx.save(); camera(ctx, lerp(300, 245, E.inOut(clamp(lt / 0.9))), lerp(860, 820, E.inOut(clamp(lt / 0.9))), lerp(1.8, 3.1, E.inOut(clamp(lt / 0.9))));
  X.drawPlaza(ctx, t, { light: 0.8, driver: false, door: 1, barrier: 1, green: true, mirrorGlow: gl, walker: { x: 565, lean: 0.6, arm: 'point' }, me: ME({ face: { fear: 0.9 } }) });
  ctx.restore();
  hudShade(ctx, 0.6); flash(ctx, t, K.mirror2W, 0.15);
}, { vignette: 0.5 });
// 16. Rule two. You look. — your face, close: the eyes slide to the mirror
shot('look', K.rule2, (ctx, t, lt) => {
  const lk = E.inOut(inv(K.look2W - 0.3, K.look2W + 0.1, t));
  const [sx, sy] = shake(t, K.look2W, 12, 0.35);
  ctx.save(); camera(ctx, B.meX - 10, meHeadY + 30, lerp(3.4, 3.8, E.inOut(clamp(lt / 1.6))), sx, sy, -0.03);
  X.drawPlaza(ctx, t, { light: 0.85, driver: false, door: 1, barrier: 1, green: true, me: ME({ face: { fear: lerp(0.6, 0.85, lk), look: lerp(0.3, -1, lk), side: lerp(0, -0.5, lk), blink: t < K.look2W - 0.4 ? blinkF(t) : 0 } }) });
  ctx.restore();
  hudShade(ctx, 0.6); pulseAt(ctx, t, K.look2W, 0.4, 2); flash(ctx, t, K.look2W, 0.2);
}, { vignette: 0.55 });
// 17. In the mirror, your head is turning around. — THE TWIST IMAGE
shot('mirror', K.mirror, (ctx, t, lt) => {
  const k = E.inOut(inv(K.headW2 - 0.1, K.vest - 0.3, t));
  const [sx, sy] = shake(t, K.aroundW2, 16, 0.5);
  ctx.save(); camera(ctx, 500, lerp(840, 800, clamp(lt / 2.6)), lerp(1.0, 1.15, E.inOut(clamp(lt / 2.6))), sx, sy);
  X.drawMirror(ctx, t, { k, glow: 1, fear: 1 });
  ctx.restore();
  hudShade(ctx, 0.6); flash(ctx, t, K.mirror + 0.05, 0.25); pulseAt(ctx, t, K.aroundW2, 0.5, 1.6);
}, { vignette: 0.4 });
// 18a. His vest says toll staff. — push into the print on his back
shot('vest', K.vest, (ctx, t, lt) => {
  ctx.save(); camera(ctx, 540, lerp(1150, 1360, E.inOut(clamp(lt / 1.4))), lerp(1.0, 1.55, E.inOut(clamp(lt / 1.4))));
  X.drawGlass(ctx, t, { out: 'back', backX: 540, backY: 1120, backS: 1, blink: blinkF(t), smile: 0.7, eyeGlow: 1 });
  ctx.restore();
  hudShade(ctx, 0.6); pulseAt(ctx, t, K.staffW, 0.3);
}, { vignette: 0.45 });
// 18b. He was the last toll man. — the photo on your booth wall: the night staff, in the same vest
shot('photo', K.lastW - 0.08, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.manW, 10, 0.35);
  ctx.save(); camera(ctx, B.x1 - 80, B.win0 + 70, lerp(5.2, 6.0, E.inOut(clamp(lt / 1.4))), sx, sy);
  X.drawPlaza(ctx, t, { light: 0.9, driver: false, door: 1, barrier: 1, green: true, me: null });
  ctx.restore();
  hudShade(ctx, 0.6); flash(ctx, t, K.lastW - 0.05, 0.25); pulseAt(ctx, t, K.manW, 0.4);
}, { vignette: 0.5 });
// 19. Now it's your turn. — you in the booth: your body faces us, your head is on backwards
shot('turn', K.turn, (ctx, t, lt) => {
  const fl = (Math.floor(t * 14) % 5 === 0 && lt > 0.3) ? 0.55 : 0.9;
  const [sx, sy] = shake(t, K.turnW, 16, 0.45);
  ctx.save(); camera(ctx, B.meX - 10, lerp(930, 905, clamp(lt / 1.6)), lerp(2.5, 2.8, E.inOut(clamp(lt / 1.6))), sx, sy);
  X.drawPlaza(ctx, t, { light: fl, driver: false, door: 1, barrier: 1, green: true, meHead: 1, me: ME({ face: { fear: 1 } }), walker: { x: 565, lean: 0.6, smile: 0.8 } });
  ctx.restore();
  hudShade(ctx, 0.6); flash(ctx, t, K.turn, 0.35); pulseAt(ctx, t, K.turnW, 0.5, 1.6);
}, { vignette: 0.5 });
// 20-21. Choice card over the dark plaza
shot('choice', K.choice, (ctx, t, lt) => {
  ctx.save(); ctx.filter = `blur(${(9 * clamp(lt / 0.4)).toFixed(1)}px)`;
  ctx.save(); camera(ctx, 700, 860, 0.95); X.drawPlaza(ctx, t, { light: 0.6, driver: false, door: 1, barrier: 1, green: true, meHead: 1, me: ME({ face: { fear: 1 } }), walker: { x: 565, lean: 0.6 } }); ctx.restore();
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
    ctx.textAlign = 'left'; ctx.fillStyle = C.white; ctx.font = '50px Osw700'; ctx.fillText(label, 266, y - 8);
    ctx.font = '24px Mono500'; ctx.fillStyle = 'rgba(238,241,247,0.6)'; spaced(ctx, sub, 268, y + 42, 1.5);
    ctx.restore();
  };
  opt('A', 'RULE 1 · KEEP IT DOWN', 840, K.optA, K.optB - 0.1, 'AND THE TRUCK WAITS ALL NIGHT');
  opt('B', 'RULE 2 · LOOK IN HIS MIRROR', 1030, K.optB, K.cta - 0.1, 'AND WATCH YOUR HEAD TURN');
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
  const ha = t < K.drv - 0.1 ? 1 : clamp(1 - (t - K.drv + 0.1) / 0.25);
  if (ha > 0) {
    const pop = lerp(1.12, 1, E.outBack(clamp(t / 0.35)));
    ctx.save(); ctx.globalAlpha = ha; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.translate(540, 560); ctx.scale(pop, pop); ctx.translate(-540, -560);
    ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 28;
    rrect(ctx, 130, 435, 820, 250, 26); ctx.fillStyle = 'rgba(6,8,18,0.8)'; ctx.fill();
    ctx.shadowBlur = 0;
    ctx.font = '92px Osw700'; ctx.fillStyle = C.white; ctx.fillText('HIS HEAD IS', 540, 542);
    ctx.fillStyle = C.red; ctx.fillText('ON BACKWARDS.', 540, 647);
    ctx.restore();
  }
}

shots.sort((a, b) => a.start - b.start);
return { shots, K, hudState, overlay, coverTitle: 'HIS HEAD IS {ON BACKWARDS}', coverSize: 70, coverSub: 'NIGHT SHIFT · 3 AM' };
};
