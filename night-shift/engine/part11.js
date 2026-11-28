// NIGHT SHIFT Season 2 · Episode 3 (engine part 11) "The last bus" (THE MAN HANGING FROM THE ROOF RAIL). ~60 s, v4 look.
// Own palette: sick mint-white tube light in an old red state bus, blue rexine seats, brass rails, amber streetlights sweeping
// the windows, black-green fields outside, a red STOP lamp. Silhouette rule: frame 1 = the bright aisle, his whole outline
// hanging from the rail by zigzag arms, toes dragging, moving within 0.3 s; cut closer at ~1.2 s. Analytics 2026-11-27: the
// monster is DOING something before 4 s and rule 1 is said over him, the note is on screen 2.5 s.
// Rules: 1) every passenger needs a ticket (kept: he pays), 2) never ring the bell twice (broken). Twist: two bells means the
// conductor gets off; the bus drives on to your village with him.
const D = require('./draw');
const B = require('./sets_bus');
const Wd = require('./sets_wedding');
const L4 = require('./look4');
const { W, H, clamp, lerp, inv, E, shake, hash } = D;

module.exports = function build(TL) {
const Ln = id => TL.lines[id - 1];
const Wt = (id, k) => Ln(id).words[k].start;
const S0 = id => Ln(id).start - 0.06;
const END = TL.duration;
const K = {
  rail: Wt(1, 4) - 0.06, railW: Wt(1, 7), arms: Wt(1, 8) - 0.06, longW: Wt(1, 13), feet: Wt(1, 14) - 0.06, floorW: Wt(1, 19),
  bus: S0(2), me: Wt(2, 3) - 0.06, note: S0(3), rulesW: Wt(3, 1), r1: S0(4), ticketW: Wt(4, 5), r2: S0(5), twiceW: Wt(5, 5),
  clock: S0(6), walk: Wt(6, 3) - 0.06, ask1: Wt(6, 8) - 0.06,
  fold: S0(7), foldW: Wt(7, 3), coin: Wt(7, 5) - 0.06, dropW: Wt(7, 7), kept: S0(8), keptW: Wt(8, 2),
  print: S0(9), printW: Wt(9, 2), villageW: Wt(9, 5), mother: S0(10), asleepW: Wt(10, 3),
  pull: S0(11), pull1: Wt(11, 1), pull2: Wt(11, 4), broken: Wt(11, 5) - 0.06, brokenW: Wt(11, 7),
  stops: S0(12), stopsW: Wt(12, 2), doors: Wt(12, 3) - 0.06, openW: Wt(12, 5),
  still: S0(13), moveW: Wt(13, 3), route: S0(14), bells: Wt(14, 3) - 0.06, off: Wt(14, 6) - 0.06, offW: Wt(14, 9),
  close: S0(15), closeW: Wt(15, 2), drive: S0(16), withW: Wt(16, 7), wave: S0(17), wavesW: Wt(17, 2),
  ask: S0(18), loop: END - 0.75,
};
const shots = [];
const shot = (name, start, draw, meta) => shots.push({ name, start, draw, meta });
const pulse = (ctx, t, t0, a = 0.35, k = 2.2) => { if (t < t0) return; const v = a * Math.exp(-(t - t0) * k); if (v < 0.01) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); const g = ctx.createRadialGradient(540, 960, 300, 540, 960, 1200); g.addColorStop(0, 'rgba(200,20,30,0)'); g.addColorStop(1, `rgba(200,20,30,${v})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); };
const flick = (t, t0, t1) => (t >= t0 && t < t1 && hash(Math.floor(t * 14)) < 0.4 ? 0.75 : 0);
const under = (ctx) => { const g = ctx.createLinearGradient(0, 1420, 0, 1920); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.35, 'rgba(0,0,0,0.8)'); g.addColorStop(1, 'rgba(0,0,0,0.9)'); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = g; ctx.fillRect(0, 1420, W, 500); ctx.restore(); };
const HIM = (o = {}) => ({ z: 6.4, ...o });
// v5 fix (2026-11-29): the opening is lit warm and bright, then the light drains to the sick mint look by ~3.6 s
const WARM = (t) => 1 - E.inOut(inv(2.9, 3.7, t));
const myFace = (ctx, t, o) => Wd.myFace(ctx, t, { bg0: '#0c1a16', bg1: '#020605', rim: '#d8fff0', light: 0.75, ...o });
const aisleBg = (t, o = {}) => (x) => L4.blurLayer(x, 'ab' + (o.key || ''), o.scale || 0.06, (y) => { y.translate(540, 960); y.scale(1.6, 1.6); y.translate(-540, -900); B.interior(y, t, { him: o.him ? HIM(o.him) : null }); }, 0.85);

// 1. HOOK (frame 1): the bright aisle, his whole silhouette hanging from the rail, toes on the floor; he jerks at 0.3 s.
shot('hook', 0, (ctx, t, lt) => {
  L4.cam(ctx, 540, 900, lerp(1.32, 1.4, E.out(clamp(lt / 1.3))), t, { hand: 4 });
  B.interior(ctx, t, { warm: WARM(t), him: HIM({ jerk: E.outBack(inv(0.25, 0.55, t)) * (1 - inv(0.6, 1.2, t)) * 0.8 }) });
}, {});
// 1b. from the roof rail. — closer: his hands locked on the rail, the head hanging between the shoulders
shot('rail', K.rail, (ctx, t, lt) => {
  L4.cam(ctx, 540, lerp(640, 610, clamp(lt / 1.5)), lerp(2.3, 2.45, clamp(lt / 1.5)), t, { hand: 4, seed: 2 });
  B.interior(ctx, t, { warm: WARM(t), him: HIM() });
  pulse(ctx, t, K.railW, 0.2);
}, {});
// 1c. His arms are three metres long. — dutch tilt DOWN the zigzag arm from the hand to the shoulder
shot('arms', K.arms, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / 1.6));
  L4.cam(ctx, lerp(700, 600, k), lerp(560, 860, k), lerp(3.0, 2.6, k), t, { hand: 3, seed: 3, rot: -0.09 });
  B.interior(ctx, t, { warm: WARM(t), him: HIM() });
  pulse(ctx, t, K.longW, 0.3);
}, {});
// 1d. His feet still touch the floor. — floor level: the toes dragging with the sway, rack focus from the rubber floor
shot('feet', K.feet, (ctx, t, lt) => {
  ctx.save(); L4.cam(ctx, 560, 1190, lerp(3.4, 3.7, clamp(lt / 2)), t, { hand: 3, seed: 4, rot: 0.03 });
  B.interior(ctx, t, { him: HIM() }); ctx.restore();
  const f = 1 - E.inOut(clamp(lt / 0.8));
  L4.blurLayer(ctx, 'ffg', lerp(0.05, 0.12, f), (x) => { x.fillStyle = '#1c211f'; x.fillRect(-100, 1680, 1300, 300); x.fillStyle = 'rgba(255,255,255,0.12)'; for (let i = 0; i < 6; i++) x.fillRect(-100, 1700 + i * 40, 1300, 4); }, 0.9);
  pulse(ctx, t, K.floorW, 0.3);
}, {});
// 2. The last bus. — outside: the old red bus on the dark highway, lit windows, his outline in one of them
shot('bus', K.bus, (ctx, t, lt) => {
  L4.cam(ctx, lerp(560, 520, clamp(lt / 1.8)), 1240, 1.05, t, { hand: 3, seed: 5 });
  B.busSide(ctx, t, { scroll: t * 300, him: { w: 4 } });
}, {});
// 2b. You're the night conductor. — inside, from the front: you stand up by the door with the machine; he hangs behind you
shot('me', K.me, (ctx, t, lt) => {
  const up = E.out(clamp(lt / 0.9));
  L4.cam(ctx, lerp(600, 580, clamp(lt / 1.7)), 940, lerp(1.05, 1.12, clamp(lt / 1.7)), t, { hand: 5, seed: 6 });
  B.interior(ctx, t, { him: HIM(), you: { z: 3.4, x: 0.62, s: lerp(0.9, 1, up), fear: 0.15, look: -0.5 } });
}, {});
// 3. Two rules, taped to the ticket machine. — the machine in your hand, the note taped on it (2.5 s)
shot('note', K.note, (ctx, t, lt) => {
  L4.cam(ctx, 540, lerp(960, 990, clamp(lt / 2.5)), lerp(1.0, 1.08, E.out(clamp(lt / 2.5))), t, { hand: 5, seed: 7, rot: 0.02 });
  B.etm(ctx, t, { note: 1, l1: (t - K.rulesW) / 0.3, l2: (t - K.rulesW - 0.5) / 0.3, screen: 'last trip' });
}, {});
// 4. One. Every passenger needs a ticket. — over your shoulder: him in the aisle, no ticket (rule 1 said over the monster)
shot('r1', K.r1, (ctx, t, lt) => {
  L4.cam(ctx, 540, lerp(900, 860, clamp(lt / 2.6)), lerp(1.55, 1.7, clamp(lt / 2.6)), t, { hand: 4, seed: 8 });
  B.interior(ctx, t, { him: HIM({ eyes: 1 }) });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  L4.blurLayer(ctx, 'shoulder', 0.06, (x) => B.conductor(x, 860, 2500, 1500, { view: 'back' }), 1);
  pulse(ctx, t, K.ticketW, 0.2);
}, {});
// 5. Two. Never ring the bell twice. — along the bell cord at the ceiling, past his hands on the rail; red pulse on "twice"
shot('r2', K.r2, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / 2.4));
  L4.cam(ctx, lerp(980, 720, k), lerp(520, 600, k), lerp(2.2, 1.9, k), t, { hand: 4, seed: 9, rot: 0.05 });
  B.interior(ctx, t, { him: HIM(), lamp: t > K.twiceW && t < K.twiceW + 0.25 ? 1 : 0 });
  pulse(ctx, t, K.twiceW, 0.3);
}, {});
// 6. At two forty — the machine's screen: the only clock
shot('clock', K.clock, (ctx, t, lt) => {
  L4.cam(ctx, 540, 780, lerp(1.6, 1.7, clamp(lt / 1)), t, { hand: 3, seed: 10 });
  B.etm(ctx, t, { note: 0, time: '02:40', screen: 'last trip' });
  under(ctx);
}, { capY: () => 1650 });
// 6b. you walk up to him. — POV down the aisle, the hanging man growing with each step
shot('walk', K.walk, (ctx, t, lt) => {
  const k = clamp(lt / 1.3), bob = Math.sin(lt * 9) * 8;
  L4.cam(ctx, 540, 860 + bob, lerp(1.1, 1.8, E.in(k)), t, { hand: 5, seed: 11 });
  B.interior(ctx, t, { him: HIM({ eyes: 1 }) });
}, {});
// 6c. Ticket, please. — low angle: you hold the machine up to him; he towers over you between the rails
shot('ask1', K.ask1, (ctx, t, lt) => {
  L4.cam(ctx, 560, lerp(900, 860, clamp(lt / 1.2)), 1.45, t, { hand: 3, seed: 12, rot: -0.04 });
  B.interior(ctx, t, { him: HIM({ z: 5.6 }), you: { z: 4.3, x: 0.28, view: 'back', armR: -0.9 } });
}, {});
// 7. His long arm folds down. — his right arm unhooks from the rail and folds down joint by joint
shot('fold', K.fold, (ctx, t, lt) => {
  const f = clamp((t - K.foldW + 0.2) / 1.0);
  L4.cam(ctx, 600, lerp(720, 800, E.inOut(f)), 2.0, t, { hand: 3, seed: 13 });
  B.interior(ctx, t, { him: HIM({ fold: f, fx: 10, fy: -40, coin: true }) });
  pulse(ctx, t, K.foldW + 0.4, 0.22);
}, {});
// 7b. A coin drops in your hand. — your palm, his long grey fingers above, the coin falls
shot('coin', K.coin, (ctx, t, lt) => {
  L4.cam(ctx, 540, 960, lerp(1.0, 1.06, clamp(lt / 1.8)), t, { hand: 3, seed: 14 });
  B.coinHand(ctx, t, { reach: lt / 0.5, drop: (t - K.dropW) / 0.35 });
}, {});
// 8. Rule one, kept. — your face, a breath, him soft behind you
shot('kept', K.kept, (ctx, t, lt) => {
  L4.cam(ctx, 560, 960, lerp(1.04, 1.1, clamp(lt / 2)), t, { hand: 3, seed: 15 });
  myFace(ctx, t, { fear: 0.3, look: 0.3, blink: (lt % 1.7) > 1.55, behind: aisleBg(t, { him: {} }) });
}, {});
// 9. The machine prints his stop. Your village. — the ticket rolls out; "to: Kesarpur" turns red; push in
shot('print', K.print, (ctx, t, lt) => {
  const hot = t > K.villageW - 0.05, pz = hot ? E.out(clamp((t - K.villageW) / 0.4)) * 0.35 : 0;
  L4.cam(ctx, 540, lerp(760, 640, pz * 2.5), 1.15 + pz, t, { hand: 4, seed: 16 });
  B.etm(ctx, t, { note: 0, print: (t - K.printW) / 0.9, hot, time: '02:40', screen: 'printing…' });
  under(ctx);
  pulse(ctx, t, K.villageW, 0.35, 1.8);
}, { capY: () => 1700 });
// 10. Your mother is asleep there. — your village at night: one warm window; far off, two headlights coming
shot('mother', K.mother, (ctx, t, lt) => {
  L4.cam(ctx, 600, lerp(1100, 1080, clamp(lt / 2)), lerp(1.2, 1.3, clamp(lt / 2)), t, { hand: 2, seed: 17 });
  B.village(ctx, t, { bus: lt / 2.2 });
}, {});
// 11. You pull the cord. Twice. — the cord, the red STOP lamp lights on each pull
shot('pull', K.pull, (ctx, t, lt) => {
  const p1 = Math.exp(-Math.pow((t - K.pull1 - 0.15) / 0.12, 2)), p2 = Math.exp(-Math.pow((t - K.pull2 - 0.1) / 0.12, 2));
  const [sx, sy] = shake(t, K.pull2 + 0.05, 10, 0.3);
  L4.cam(ctx, 600, 620, 1.0, t, { hand: 4, seed: 18, sx, sy });
  B.cord(ctx, t, { pull: Math.max(p1, p2), lamp: (t > K.pull1 + 0.1 && t < K.pull1 + 0.5) || (t > K.pull2 + 0.05 && t < K.pull2 + 0.8) ? 1 : 0 });
}, {});
// 11b. Rule two, broken. — his face: the hanging head snaps up and looks straight at you
shot('broken', K.broken, (ctx, t, lt) => {
  const up = clamp((t - K.brokenW + 0.25) / 0.3);
  L4.cam(ctx, 540, 1000, lerp(1.0, 1.1, clamp(lt / 1.6)) + up * 0.12, t, { hand: 3, seed: 19 });
  B.hangerFace(ctx, t, { up });
  pulse(ctx, t, K.brokenW, 0.45, 1.8);
}, {});
// 12. The bus stops. — outside: the brakes, the bus lurches, red tail lights
shot('stops', K.stops, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.stopsW, 14, 0.4);
  L4.cam(ctx, 520, 1240, 1.05, t, { hand: 3, seed: 20, sx, sy });
  B.busSide(ctx, t, { scroll: K.stops * 300 + (1 - Math.exp(-lt * 3)) * 100, brake: 1, him: { w: 4 } });
}, {});
// 12b. The doors open. — the front door folds open, mint light spills onto the dark road
shot('doors', K.doors, (ctx, t, lt) => {
  L4.cam(ctx, 260, 1260, lerp(2.0, 2.15, clamp(lt / 1.4)), t, { hand: 3, seed: 21 });
  B.busSide(ctx, t, { scroll: K.stops * 300 + 100, door: (t - K.openW + 0.1) / 0.4, brake: 1, him: { w: 4 } });
}, {});
// 13. But he doesn't move. — SCALE: low wide down the aisle, him filling floor to ceiling, you small by the open door
shot('still', K.still, (ctx, t, lt) => {
  L4.cam(ctx, 540, lerp(980, 940, clamp(lt / 2)), lerp(1.12, 1.2, clamp(lt / 2)), t, { hand: 3, seed: 22, rot: 0.06 });
  B.interior(ctx, t, { sweep: 0, him: HIM({ z: 4.4, eyes: 1, up: 1 }), you: { z: 3.0, x: 0.9, s: 0.85, fear: 0.7, look: -1 } });
  pulse(ctx, t, K.moveW, 0.25);
}, {});
// 14. On this route, — your face: understanding
shot('route', K.route, (ctx, t, lt) => {
  L4.cam(ctx, 560, 960, lerp(1.04, 1.12, clamp(lt / 1.2)), t, { hand: 3, seed: 23, rot: -0.03 });
  myFace(ctx, t, { fear: lerp(0.5, 0.8, clamp(lt / 1.2)), look: -0.5, behind: aisleBg(t, { key: 'b', him: { z: 4.4, up: 1 } }) });
}, {});
// 14b. two bells means — the STOP lamp still burning red over his head
shot('bells', K.bells, (ctx, t, lt) => {
  L4.cam(ctx, 500, lerp(680, 640, clamp(lt / 0.9)), 1.7, t, { hand: 3, seed: 24 });
  B.interior(ctx, t, { sweep: 0, lamp: 1, him: HIM({ z: 4.4, up: 1 }) });
}, {});
// 14c. the conductor gets off. — outside: you are put out of the door onto the road; his long arm withdraws inside
shot('off', K.off, (ctx, t, lt) => {
  const k = E.out(clamp(lt / 0.9));
  L4.cam(ctx, 360, 1300, 1.5, t, { hand: 4, seed: 25 });
  B.busSide(ctx, t, { scroll: K.stops * 300 + 100, door: 1, brake: 1, him: { w: 1, eyes: 1 }, you: { x: lerp(200, 300, k), y: lerp(1450, 1650, k), h: 330, fear: 0.8, look: -1, lean: lerp(0.25, 0, k) } });
  pulse(ctx, t, K.offW, 0.3);
}, {});
// 15. The doors close behind you. — you on the road; the door folds shut; he looks at you from the window
shot('close', K.close, (ctx, t, lt) => {
  L4.cam(ctx, 420, 1300, 1.25, t, { hand: 3, seed: 26 });
  B.busSide(ctx, t, { scroll: K.stops * 300 + 100, door: 1 - clamp((t - K.closeW) / 0.5), brake: 0, him: { w: 1, eyes: 1 }, you: { x: 320, y: 1700, h: 380, fear: 0.9, look: 1, view: 'front' } });
}, {});
// 16. The bus drives on to your village, with him. — the road behind: the bus pulls away past the green Kesarpur sign
shot('drive', K.drive, (ctx, t, lt) => {
  L4.cam(ctx, 540, 1000, lerp(1.0, 1.06, clamp(lt / 3)), t, { hand: 3, seed: 27 });
  B.busRear(ctx, t, { d: lt / 9 });
  pulse(ctx, t, K.withW, 0.3);
}, {});
// 17. His arm waves from the back window. — punch in: the long arm out of the back window, waving down to the road
shot('wave', K.wave, (ctx, t, lt) => {
  const d = (K.wave - K.drive) / 9 + lt / 16;
  const s = lerp(1.0, 0.16, E.out(clamp(d))), by = lerp(1520, 894, E.out(clamp(d)));
  L4.cam(ctx, 540, by - 220 * s, lerp(2.2, 2.4, clamp(lt / 2.5)) / Math.max(0.45, s * 1.6), t, { hand: 3, seed: 28 });
  B.busRear(ctx, t, { d, arm: clamp(lt / 0.6) });
  pulse(ctx, t, K.wavesW, 0.3);
}, {});
// 18. Which rule would you break? — the last scary shot: you on the road (back), the bus going, the arm still waving
shot('ask', K.ask, (ctx, t, lt) => {
  const d = (K.wave - K.drive) / 9 + (K.ask - K.wave) / 16 + lt / 40;
  const s = lerp(1.0, 0.16, E.out(clamp(d))), by = lerp(1520, 894, E.out(clamp(d)));
  L4.cam(ctx, 540, by - 180 * s, lerp(1.5, 1.6, clamp(lt / 3)) / Math.max(0.45, s * 1.6), t, { hand: 4, seed: 29 });
  B.busRear(ctx, t, { d, arm: 1 });
}, { capY: () => 1690 });
// loop: back to the frame-1 picture so the replay is seamless
shot('loop', K.loop, (ctx, t, lt) => {
  L4.cam(ctx, 540, 900, 1.32, t, { hand: 4 });
  B.interior(ctx, 0.1, { warm: 1, him: HIM() });
}, { captions: false });

const outside = new Set(['bus', 'stops', 'doors', 'off', 'close', 'mother']), red = new Set(['drive', 'wave', 'ask', 'pull', 'bells']);
function post(ctx, canvas, t, cur) {
  L4.bloom(ctx, canvas, 0.3);
  const wk = cur.name === 'loop' ? 1 : WARM(t);
  L4.grade(ctx, wk > 0.5 ? '#ffb060' : red.has(cur.name) ? '#ff6a4a' : outside.has(cur.name) ? '#5fb0a0' : '#9fffd0', 0.05, lerp(['broken', 'route', 'kept', 'still'].includes(cur.name) ? 0.7 : 0.55, 0.3, wk));
  whipAll(ctx, canvas, t);
}
function whipAll(ctx, canvas, t) {
  for (const [t0, dir] of [[K.rail, 1], [K.feet, -1], [K.bus, 1], [K.walk, 1], [K.coin, -1], [K.broken, 1], [K.still, -1], [K.off, 1], [K.drive, -1], [K.ask, 1]]) { const k = 1 - clamp((t - t0) / 0.14); if (t >= t0 && k > 0) L4.whip(ctx, canvas, k, dir); }
}
function overlay(ctx, t, cur) {
  if (t < K.rail) { const ta = clamp(t / 0.15) * clamp((K.rail - t) / 0.15); const g = ctx.createLinearGradient(0, 0, 0, 260); g.addColorStop(0, `rgba(30,16,8,${0.75 * ta})`); g.addColorStop(1, 'rgba(30,16,8,0)'); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 260); ctx.restore(); }
  if (t < K.rail) L4.title(ctx, 'Never ring the bell twice.', 540, 120, 62, '#fbf6ee', clamp(t / 0.15) * clamp((K.rail - t) / 0.15), true);
  if (t >= K.ask && t < K.loop) {
    const a = clamp((t - K.ask) / 0.25) * clamp((K.loop - t) / 0.2);
    L4.title(ctx, 'A · let him ride free', 540, 1440, 66, '#8ff0c8', a);
    L4.title(ctx, 'B · ring the bell twice', 540, 1530, 66, '#ff4a3d', a);
  }
}
function cover(ctx, t) {
  ctx.save(); L4.cam(ctx, 540, 860, 1.55, 0, { hand: 0 });
  B.interior(ctx, 0.6, { him: HIM({ eyes: 1 }) });
  ctx.restore(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  L4.bloom(ctx, ctx.canvas, 0.35); L4.grade(ctx, '#9fffd0', 0.05, 0.6);
  const g = ctx.createLinearGradient(0, 1250, 0, 1920); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.85)'); ctx.fillStyle = g; ctx.fillRect(0, 1250, W, 670);
  L4.title(ctx, 'His arms are', 540, 1450, 116, '#fbf6ee');
  L4.title(ctx, 'three metres long.', 540, 1575, 116, '#ff4a3d');
  L4.title(ctx, 'NIGHT SHIFT · the last bus', 540, 1695, 44, '#8ff0c8', 0.95, true);
  L4.grain(ctx, 0.5, 0.06);
}
return { look: 'v4', shots, K, post, overlay, cover, capY: 1530, hudState: () => ({}) };
};
