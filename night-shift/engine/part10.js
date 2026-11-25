// NIGHT SHIFT Season 2 · Episode 2 (engine part 10) "The ATM booth" (THE WOMAN BENT BACKWARDS). ~59 s, v4 look.
// Own palette: hard cold-white tube light in a glass booth, a cobalt sign band, one sodium streetlight over a wet black road,
// green-mono CCTV. Silhouette rule: frame 1 = the bright booth, her whole arch at the machine (bent backwards, head at her
// heels), moving within 0.3 s; cut closer at ~1.7 s. Rules: 1) one customer at a time (kept: you stop the man),
// 2) never look at the mirror (broken). Twist: she was never at the machine; the camera shows her behind you all night.
const D = require('./draw');
const A = require('./sets_atm');
const X = require('./sets_crossing');
const Wd = require('./sets_wedding');
const L4 = require('./look4');
const { W, H, clamp, lerp, inv, E, shake, hash } = D;

module.exports = function build(TL) {
const Ln = id => TL.lines[id - 1];
const Wt = (id, k) => Ln(id).words[k].start;
const S0 = id => Ln(id).start - 0.06;
const END = TL.duration;
const K = {
  atmW: Wt(1, 5), bent: Wt(1, 6) - 0.06, backW: Wt(1, 7), heels: Wt(1, 8) - 0.06, heelsW: Wt(1, 13),
  me: S0(2), note: S0(3), twoW: Wt(3, 3), r1: S0(4), r2: S0(5), mirrorW: Wt(5, 5),
  clock: S0(6), man: Wt(6, 3) - 0.06, doorW: Wt(6, 9),
  inside: S0(7), stop: Wt(7, 3) - 0.06, stopW: Wt(7, 4), kept: Wt(7, 6) - 0.06,
  past: S0(8), pastW: Wt(8, 2), runs: Wt(8, 4) - 0.06, runsW: Wt(8, 5),
  types: S0(9), money: Wt(9, 4) - 0.06, noW: Wt(9, 6),
  speaks: S0(10), guardW: Wt(10, 3), lookUpW: Wt(10, 6),
  look: S0(11), mirror11: Wt(11, 4) - 0.06, broken: Wt(11, 5) - 0.06, brokenW: Wt(11, 7),
  mirror: S0(12), nobodyW: Wt(12, 3), behind: S0(13), standW: Wt(13, 1), behindW: Wt(13, 5),
  down: S0(14), emptyW: Wt(14, 6), never: S0(15), allW: Wt(15, 6), nightW: Wt(15, 11),
  ran: S0(16), ranW: Wt(16, 4), still: S0(17), thereW: Wt(17, 3), ask: S0(18), loop: END - 0.75,
};
const shots = [];
const shot = (name, start, draw, meta) => shots.push({ name, start, draw, meta });
const pulse = (ctx, t, t0, a = 0.35, k = 2.2) => { if (t < t0) return; const v = a * Math.exp(-(t - t0) * k); if (v < 0.01) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); const g = ctx.createRadialGradient(540, 960, 300, 540, 960, 1200); g.addColorStop(0, 'rgba(200,20,30,0)'); g.addColorStop(1, `rgba(200,20,30,${v})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); };
const flick = (t, t0, t1) => (t >= t0 && t < t1 && hash(Math.floor(t * 14)) < 0.4 ? 0.75 : 0);
const HER = (o = {}) => ({ x: 520, s: 2.5, ...o });
const boothBg = (t, o = {}) => (x) => L4.blurLayer(x, 'bb' + (o.key || ''), o.scale || 0.06, (y) => { y.translate(540, 960); y.scale(1.5, 1.5); y.translate(-600, -1000); A.booth(y, t, { her: o.her ? HER() : null }); }, 0.85);
const myFace = (ctx, t, o) => Wd.myFace(ctx, t, { bg0: '#0c1a20', bg1: '#03070a', rim: '#dff6ff', light: 0.7, ...o });

// 1. HOOK (frame 1): the bright booth on an empty road, her whole arch at the machine; her head jerks at 0.3 s.
shot('hook', 0, (ctx, t, lt) => {
  const z = lerp(1.45, 1.55, E.out(clamp(lt / 1.7)));
  L4.cam(ctx, 600, 1010, z, t, { hand: 4 });
  A.booth(ctx, t, { her: HER({ jerk: E.outBack(inv(0.25, 0.55, t)) * 0.4 }) });
}, {});
// 1b. using the ATM. — closer on her at the machine
shot('close', K.atmW - 0.1, (ctx, t, lt) => {
  L4.cam(ctx, lerp(640, 655, clamp(lt / 1.2)), 1080, lerp(2.4, 2.55, E.inOut(clamp(lt / 1.2))), t, { hand: 5, seed: 2 });
  A.booth(ctx, t, { her: HER() });
}, {});
// 1c. Bent backwards. — profile of the arch, dutch angle, push
shot('bent', K.bent, (ctx, t, lt) => {
  L4.cam(ctx, 620, lerp(1060, 1030, clamp(lt / 1.2)), lerp(3.0, 3.3, clamp(lt / 1.2)), t, { hand: 4, seed: 3, rot: -0.08 });
  A.booth(ctx, t, { her: HER() });
  pulse(ctx, t, K.backW, 0.28);
}, {});
// 1d. Her head is at her heels. — floor level: her heels and her upside-down face side by side; rack focus from the floor
shot('heels', K.heels, (ctx, t, lt) => {
  ctx.save(); L4.cam(ctx, 590, 1250, lerp(4.4, 4.8, clamp(lt / 2)), t, { hand: 3, seed: 4, rot: 0.03 });
  A.booth(ctx, t, { her: HER({ mouth: t > K.heelsW ? 0.6 : 0 }) });
  ctx.restore();
  const f = 1 - E.inOut(clamp(lt / 0.8));
  L4.blurLayer(ctx, 'hfg', lerp(0.05, 0.12, f), (x) => { x.fillStyle = '#7d8a90'; x.fillRect(-100, 1700, 1300, 300); x.fillStyle = 'rgba(255,255,255,0.3)'; x.fillRect(-100, 1700, 1300, 8); }, 0.9);
  pulse(ctx, t, K.heelsW, 0.3);
}, {});
// 2. Your first night as the ATM guard. — outside on the road: you get up off the plastic chair; she is small inside
shot('me', K.me, (ctx, t, lt) => {
  const up = E.out(clamp(lt / 1.0));
  L4.cam(ctx, lerp(820, 760, E.inOut(clamp(lt / 2.4))), 1180, lerp(1.35, 1.25, E.inOut(clamp(lt / 2.4))), t, { hand: 5, seed: 5 });
  A.booth(ctx, t, { her: HER(), you: { x: 985, y: lerp(1420, 1470, up), h: lerp(250, 300, up), view: 'front', fear: 0.15, rimSide: -1 } });
}, {});
// 3. The note says two rules. — the note in your hand (<= 2 s), the booth soft behind
shot('note', K.note, (ctx, t, lt) => {
  L4.blurLayer(ctx, 'noteBg', 0.07, (x) => A.booth(x, t, { her: HER() }), 1);
  L4.cam(ctx, 540, lerp(940, 960, clamp(lt / 2)), lerp(1.0, 1.08, E.out(clamp(lt / 2))), t, { hand: 5, seed: 6, rot: 0.02 });
  A.note(ctx, t, { l1: K.twoW - 0.3, l2: K.twoW + 0.2 });
}, {});
// 4. One. One customer at a time. — the sticker on the door glass, her shape soft behind it
shot('r1', K.r1, (ctx, t, lt) => {
  L4.cam(ctx, lerp(390, 410, clamp(lt / 2.2)), 1030, lerp(2.7, 2.9, clamp(lt / 2.2)), t, { hand: 3, seed: 7 });
  A.booth(ctx, t, { her: HER() });
}, {});
// 5. Two. Never look at the mirror above the machine. — tilt up the machine to the long mirror; it pulses on "mirror"
shot('r2', K.r2, (ctx, t, lt) => {
  const k = E.inOut(clamp((t - K.r2 - 0.3) / Math.max(0.5, K.mirrorW - K.r2 - 0.2)));
  L4.cam(ctx, 690, lerp(1080, 830, k), lerp(2.2, 2.8, k), t, { hand: 4, seed: 8 });
  A.booth(ctx, t, { her: HER({ eyes: 0.6 }) });
  pulse(ctx, t, K.mirrorW, 0.3);
}, {});
// 6. At three ten — the CCTV monitor in the booth: the only clock. (Look again: a faint shape stands behind you.)
shot('clock', K.clock, (ctx, t, lt) => {
  L4.cam(ctx, 540, 900, lerp(1.0, 1.07, clamp(lt / 1.2)), t, { hand: 3, seed: 9 });
  A.cctv(ctx, t, { stamp: '03:10:0' + Math.min(9, Math.floor(lt * 2) + 2), her: 0.16 });
}, { capY: () => 1700 });
// 6b. a man walks up to the door. — the road: the man comes out of the sodium light to the booth
shot('man', K.man, (ctx, t, lt) => {
  const k = clamp(lt / 2.2);
  L4.cam(ctx, lerp(440, 520, k), 1220, 1.2, t, { hand: 5, seed: 10 });
  A.booth(ctx, t, { her: HER(), man: { x: lerp(60, 420, E.out(k)), y: 1520, h: 330, walk: k < 1 ? lt * 5 : null, view: 'front' }, you: { x: 985, y: 1470, h: 300, view: 'front', fear: 0.2 } });
}, {});
// 7. She's still inside. — over your shoulder, through the glass: the arch at the machine
shot('inside', K.inside, (ctx, t, lt) => {
  L4.cam(ctx, 620, 1090, lerp(1.9, 2.05, clamp(lt / 1.2)), t, { hand: 4, seed: 11, rot: 0.04 });
  A.booth(ctx, t, { her: HER({ jerk: Math.sin(t * 3) * 0.05 }) });
  L4.blurLayer(ctx, 'shoulder', 0.06, (x) => A.guard(x, 260, 2300, 1300, { view: 'back' }), 1);
}, {});
// 7b. You stop him. — at the door: your arm out across the glass, the man pulls up
shot('stop', K.stop, (ctx, t, lt) => {
  const arm = E.outBack(clamp((t - K.stopW + 0.15) / 0.35));
  const [sx, sy] = shake(t, K.stopW, 8, 0.25);
  L4.cam(ctx, 520, 1260, lerp(1.6, 1.7, clamp(lt / 1.4)), t, { hand: 4, seed: 12, sx, sy });
  A.booth(ctx, t, { her: HER(), you: { x: 600, y: 1500, h: 330, view: 'front', fear: 0.3, armL: lerp(0.08, 1.45, arm) }, man: { x: 400, y: 1505, h: 320, view: 'front', lean: -0.04 * arm } });
}, {});
// 7c. Rule one, kept. — your face, a breath
shot('kept', K.kept, (ctx, t, lt) => {
  L4.cam(ctx, 560, 960, lerp(1.04, 1.1, clamp(lt / 1.6)), t, { hand: 3, seed: 13 });
  myFace(ctx, t, { fear: 0.3, look: 0.4, blink: (lt % 1.7) > 1.55, behind: boothBg(t, { her: true }) });
}, {});
// 8. He looks past you — close on the man: his eyes go wide at something behind you
shot('past', K.past, (ctx, t, lt) => {
  const f = E.out(inv(K.pastW - 0.1, K.pastW + 0.5, t));
  L4.cam(ctx, 400, lerp(1235, 1220, clamp(lt / 1.2)), lerp(3.4, 3.8, clamp(lt / 1.2)), t, { hand: 3, seed: 14 });
  A.booth(ctx, t, { her: HER(), man: { x: 400, y: 1505, h: 320, view: 'front', fear: f, look: 1 } });
  pulse(ctx, t, K.pastW + 0.2, 0.22);
}, {});
// 8b. and runs. — wide: he bolts back into the dark
shot('runs', K.runs, (ctx, t, lt) => {
  L4.cam(ctx, 500, 1220, 1.15, t, { hand: 6, seed: 15 });
  ctx.save(); A.booth(ctx, t, { her: HER(), you: { x: 600, y: 1500, h: 330, view: 'back' } }); ctx.restore();
  ctx.save(); ctx.translate(lerp(380, -260, E.in(clamp(lt / 1.4))) * 2, 0); ctx.scale(-1, 1);
  Wd.person(ctx, 0, 1520, 320, { col: '#0b0d10', rim: '#ff9a3c', rimSide: 1, view: 'back', walk: lt * 14, lean: 0.12 });
  ctx.restore();
}, {});
// 9. She types upside down. She takes no money. — the keypad: her pale fingers come up from below, wrists bent back
shot('types', K.types, (ctx, t, lt) => {
  L4.cam(ctx, 540, lerp(1000, 960, clamp(lt / 3)), lerp(1.0, 1.08, E.inOut(clamp(lt / 3))), t, { hand: 3, seed: 16, rot: Math.PI * 0 + 0.03 });
  const no = t > K.money;
  A.keypad(ctx, t, { hands: 1, press: Math.floor(t * 5) % 12, screen: no ? 'Transaction cancelled' : 'Enter PIN', sub: no ? 'no cash dispensed' : '* * * *' });
  pulse(ctx, t, K.noW, 0.2);
}, {});
// 10. Then she speaks. Guard, it's stuck. Look up. — her upside-down face at floor level, talking
shot('speaks', K.speaks, (ctx, t, lt) => {
  L4.cam(ctx, 540, 900, lerp(1.0, 1.14, E.inOut(clamp(lt / 3))), t, { hand: 3, seed: 17 });
  X.faceClose(ctx, t, { talk: t > K.guardW - 0.1 ? 1 : 0, look: 0, s: 0.95, bg: (x) => L4.blurLayer(x, 'sbg', 0.05, (y) => { y.translate(540, 960); y.scale(3, 3); y.translate(-640, -1220); A.booth(y, t, {}); }, 0.75) });
  pulse(ctx, t, K.lookUpW, 0.3);
}, { capY: () => 1760 });
// 11. You look at the mirror. — your face, eyes rising
shot('look', K.look, (ctx, t, lt) => {
  L4.cam(ctx, 560, lerp(980, 900, E.inOut(clamp(lt / 1.2))), lerp(1.06, 1.14, clamp(lt / 1.2)), t, { hand: 3, seed: 18, rot: -0.04 });
  myFace(ctx, t, { fear: 0.55, look: -0.2, behind: boothBg(t, { key: 'b', her: true }) });
}, {});
// 11b. ... the mirror. Rule two, broken. — POV tilt up to the mirror; punch in on "broken"
shot('mirror11', K.mirror11, (ctx, t, lt) => {
  const pz = t > K.broken ? E.out(clamp((t - K.broken) / 0.3)) * 0.5 : 0;
  L4.cam(ctx, 690, lerp(900, 826, E.inOut(clamp(lt / 0.6))), 3.4 + pz, t, { hand: 4, seed: 19 });
  A.booth(ctx, t, { her: HER() });
  pulse(ctx, t, K.brokenW - 0.1, 0.45, 1.8);
}, {});
// 12. In the mirror, nobody is at the machine. — the mirror, full frame: you in the doorway, the floor empty
shot('mirror', K.mirror, (ctx, t, lt) => {
  L4.cam(ctx, 540, 1000, lerp(1.04, 1.12, E.inOut(clamp(lt / 2.6))), t, { hand: 3, seed: 20 });
  A.mirrorView(ctx, t, { her: 0, fear: 0.5 });
}, {});
// 13. She's standing straight up, right behind you. — SCALE: in the mirror she rises behind you, head bent under the ceiling
shot('behind', K.behind, (ctx, t, lt) => {
  const r = E.inOut(inv(K.standW - 0.2, K.behindW + 0.1, t));
  L4.cam(ctx, 560, lerp(1000, 900, r), lerp(1.12, 1.0, r), t, { hand: 3, seed: 21 });
  A.mirrorView(ctx, t, { her: r, fear: lerp(0.5, 0.95, r) });
  pulse(ctx, t, K.behindW, 0.4, 1.6);
}, {});
// 14. You look down. The machine is empty. — the machine, nobody there; the tubes stutter
shot('down', K.down, (ctx, t, lt) => {
  L4.cam(ctx, 660, lerp(1060, 1100, clamp(lt / 2.3)), lerp(2.3, 2.45, clamp(lt / 2.3)), t, { hand: 4, seed: 22 });
  A.booth(ctx, t, { flick: flick(t, K.emptyW - 0.1, K.emptyW + 0.5) });
}, {});
// 15. She was never at the machine. She was behind you all night. — the CCTV: her behind you; the clock rolls back
shot('never', K.never, (ctx, t, lt) => {
  const stamps = ['23:41:10', '01:22:56', '02:48:03', '03:10:42'];
  const si = t < K.allW - 0.3 ? 3 : Math.min(2, Math.floor((t - K.allW + 0.3) / 0.55));
  L4.cam(ctx, 540, lerp(920, 900, clamp(lt / 4)), lerp(1.0, 1.1, E.inOut(clamp(lt / 4))), t, { hand: 3, seed: 23 });
  A.cctv(ctx, t, { stamp: stamps[si], her: 1 });
}, { capY: () => 1700 });
// 16. That's why the man ran. — the CCTV at 03:10: the man at the door looking past you, at her
shot('ran', K.ran, (ctx, t, lt) => {
  L4.cam(ctx, 600, 860, lerp(1.25, 1.35, clamp(lt / 1.4)), t, { hand: 3, seed: 24 });
  A.cctv(ctx, t, { stamp: '03:10:51', her: 1, man: { fear: 1 } });
  pulse(ctx, t, K.ranW, 0.25);
}, { capY: () => 1700 });
// 17. And she's still there. — your face; behind your shoulder her hair-curtained face lowers into frame, focus pulls to her
shot('still', K.still, (ctx, t, lt) => {
  const foc = E.inOut(clamp((t - K.thereW + 0.3) / 0.4));
  const dn = E.out(clamp(lt / 1.1));
  L4.cam(ctx, 560, 960, lerp(1.04, 1.14, clamp(lt / 1.6)), t, { hand: 3, seed: 25 });
  myFace(ctx, t, { fear: lerp(0.6, 0.95, foc), look: -0.6 * foc, behind: (x) => {
    boothBg(t, { key: 'c' })(x);
    L4.blurLayer(x, 'ghost', lerp(0.07, 0.6, foc), (y) => A.tall(y, 230, lerp(2100, 2520, dn), 2000, t, { tilt: 0.5, rim: '#dff6ff', light: 1 }), 1);
  } });
  pulse(ctx, t, K.thereW, 0.35, 1.4);
}, {});
// 18. Which rule would you break? — the last scary shot: you at the booth door, and her, standing straight, right behind you
shot('ask', K.ask, (ctx, t, lt) => {
  L4.cam(ctx, 600, lerp(1250, 1220, clamp(lt / 3)), lerp(1.25, 1.3, clamp(lt / 3)), t, { hand: 4, seed: 26 });
  A.booth(ctx, t, { flick: flick(t, K.ask + 1.6, K.ask + 1.9), you: { x: 520, y: 1500, h: 330, view: 'front', fear: 0.6 }, tallOut: { x: 660, y: 1470, h: 640, tilt: 0.5, eyes: 1 } });
}, { capY: () => 1730 });
// loop: back to the frame-1 picture so the replay is seamless
shot('loop', K.loop, (ctx, t, lt) => {
  L4.cam(ctx, 600, 1010, 1.45, t, { hand: 4 });
  A.booth(ctx, 0.1, { her: HER() });
}, { captions: false });

const green = new Set(['clock', 'never', 'ran']), warm = new Set(['man', 'stop', 'runs', 'past']);
function post(ctx, canvas, t, cur) {
  L4.bloom(ctx, canvas, 0.3);
  L4.grade(ctx, green.has(cur.name) ? '#7fffb0' : warm.has(cur.name) ? '#ff9a3c' : '#7fd8ff', 0.05, cur.name === 'still' || cur.name === 'speaks' || cur.name === 'behind' ? 0.7 : 0.55);
  for (const [t0, dir] of [[K.atmW - 0.1, 1], [K.bent, -1], [K.runs, -1], [K.speaks, 1], [K.mirror11, 1], [K.behind, -1], [K.still, 1], [K.ask, -1]]) { const k = 1 - clamp((t - t0) / 0.14); if (t >= t0 && k > 0) L4.whip(ctx, canvas, k, dir); }
}
function overlay(ctx, t, cur) {
  if (t < K.atmW - 0.1) L4.title(ctx, 'Never look at the mirror.', 540, 120, 64, '#fbf6ee', clamp(t / 0.15) * clamp((K.atmW - 0.1 - t) / 0.15), true);
  if (t >= K.ask && t < K.loop) {
    const a = clamp((t - K.ask) / 0.25) * clamp((K.loop - t) / 0.2);
    L4.title(ctx, 'A · let the man in', 540, 1440, 66, '#7fe8d0', a);
    L4.title(ctx, 'B · look in the mirror', 540, 1530, 66, '#ff4a3d', a);
  }
}
function cover(ctx, t) {
  ctx.save(); L4.cam(ctx, 630, 1150, 2.0, 0, { hand: 0 });
  A.booth(ctx, 0.6, { her: HER() });
  ctx.restore(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  L4.bloom(ctx, ctx.canvas, 0.35); L4.grade(ctx, '#7fd8ff', 0.05, 0.6);
  const g = ctx.createLinearGradient(0, 1250, 0, 1920); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.85)'); ctx.fillStyle = g; ctx.fillRect(0, 1250, W, 670);
  L4.title(ctx, "She's bent", 540, 1450, 124, '#fbf6ee');
  L4.title(ctx, 'backwards.', 540, 1580, 124, '#ff4a3d');
  L4.title(ctx, 'NIGHT SHIFT · the ATM booth', 540, 1700, 44, '#7fe8d0', 0.95, true);
  L4.grain(ctx, 0.5, 0.06);
}
return { look: 'v4', shots, K, post, overlay, cover, capY: 1530, hudState: () => ({}) };
};
