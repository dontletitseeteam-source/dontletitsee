// NIGHT SHIFT — Episode 8 (season finale) "The wedding hall" (THE BRIDE WITH THE SEWN VEIL). ~58 s. First v4-look episode:
// no HUD, serif sentence-case captions, grain + bloom + handheld camera, real-proportion silhouettes with eye highlights,
// own palette (marigold, crimson, tungsten; teal moonlight when the lights go off), in-world note (2.8 s), the time once on
// a wall clock, rack focus via low-res layers, whip pans and a dutch angle on the scares. Silhouette rule: frame 1 = the
// bright hall, the too-tall bride standing on the stage with her head bent sideways against the marigold strings.
const D = require('./draw');
const X = require('./sets_wedding');
const L4 = require('./look4');
const { W, H, clamp, lerp, inv, E, shake } = D;

module.exports = function build(TL) {
const Ln = id => TL.lines[id - 1];
const Wd = (id, k) => Ln(id).words[k].start;
const S0 = id => Ln(id).start - 0.06;
const END = TL.duration;
const K = {
  brideW: Wd(1, 6), veil: S0(2), sewnW: Wd(2, 3), me: S0(3), note: S0(4), oneW: Wd(5, 0), r1: Wd(5, 1) - 0.12, twoW: Wd(6, 0), r2: Wd(6, 1) - 0.1,
  sw: S0(7), offW: Wd(7, 1), lightsW: Wd(7, 4), bandW: Wd(7, 6) - 0.25, playW: Wd(7, 7),
  on: Wd(8, 0) - 0.04, everyW: Wd(8, 2) - 0.1, guest: S0(9), lookW: Wd(9, 4), face: Wd(9, 4) - 0.05,
  stand: S0(10), standsW: Wd(10, 2), scale: S0(11), mariW: Wd(11, 5),
  walk: S0(12), walksW: Wd(12, 1), puts: Wd(12, 5) - 0.1, veilW: Wd(12, 10),
  pull: S0(13), awayW: Wd(13, 3), rule1: Wd(13, 4) - 0.1,
  book: S0(14), bookW: Wd(14, 4), clap: S0(15), clapW: Wd(15, 3),
  sign: S0(16), signW: Wd(16, 2), anyW: Wd(16, 4), notW: S0(17), regW: Wd(18, 3), married: Wd(18, 5) - 0.1, marriedW: Wd(18, 7),
  open: S0(19), openW: Wd(19, 3), ask: S0(20), typeW: Wd(20, 5), loop: END - 0.75,
};
const light = t => (t >= K.lightsW && t < K.on ? 0 : 1);
const shots = [];
const shot = (name, start, draw, meta) => shots.push({ name, start, draw, meta });
const flash = (ctx, t, t0, a = 0.7, d = 0.35, col = '255,245,230') => { if (t < t0 || t > t0 + d) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(${col},${a * (1 - (t - t0) / d)})`; ctx.fillRect(0, 0, W, H); ctx.restore(); };
const pulse = (ctx, t, t0, a = 0.35, k = 2.2) => { if (t < t0) return; const v = a * Math.exp(-(t - t0) * k); if (v < 0.01) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); const g = ctx.createRadialGradient(540, 960, 300, 540, 960, 1200); g.addColorStop(0, 'rgba(200,20,30,0)'); g.addColorStop(1, `rgba(200,20,30,${v})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); };
const bendAt = (t) => 0.42 + Math.sin(t * 0.9) * 0.05;                 // her head pushed sideways by the ceiling strings
const STAND = { x: 430, y: X.STAGE_Y, h: 650 };
const brideStanding = (t, o = {}) => ({ ...STAND, bend: bendAt(t), ...o });
const strings = (t) => ({ x: 470, k: 0.6 + 0.4 * Math.sin(t * 1.3) });

// 1. HOOK (frame 1): the bright hall from the back of the aisle; the too-tall bride on the stage, head bent at the strings.
// She moves inside 0.5 s (her head jerks further over), then a cut closer by 1.75 s.
shot('hook', 0, (ctx, t, lt) => {
  const z = lerp(1.22, 1.34, E.out(clamp(lt / 1.8)));
  L4.cam(ctx, 520, 800, z, t, { hand: 4 });
  const jerk = E.outBack(inv(0.25, 0.6, t)) * 0.12;
  X.hall(ctx, t, { light: 1, bride: brideStanding(t, { bend: bendAt(t) + jerk }), stringsPush: strings(t) });
}, {});
shot('stage', 1.75, (ctx, t, lt) => {
  L4.cam(ctx, lerp(500, 480, clamp(lt / 2.5)), lerp(760, 740, clamp(lt / 2.5)), lerp(2.05, 2.25, E.inOut(clamp(lt / 2.5))), t, { hand: 6, seed: 2 });
  X.hall(ctx, t, { light: 1, bride: brideStanding(t), stringsPush: strings(t) });
}, {});
// 2. Her veil is sewn shut. — extreme close-up, rack focus from the blurred strings to the stitches
shot('veil', K.veil, (ctx, t, lt) => {
  ctx.save(); L4.cam(ctx, 540, 900, lerp(1.0, 1.12, E.out(clamp(lt / 2))), t, { hand: 3, seed: 3 });
  X.veilClose(ctx, t, { bend: 0.06 });
  ctx.restore();
  const f = 1 - E.inOut(clamp(lt / 0.9));        // strings in front go soft as focus pulls to the seam
  L4.blurLayer(ctx, 'fgs', lerp(0.25, 0.06, 1 - f), (x) => { for (let i = 0; i < 4; i++) X.marigoldString(x, 60 + i * 330 + (i > 1 ? 120 : 0), -100, 2100, 34, 1, t, i); }, 0.9);
  pulse(ctx, t, K.sewnW, 0.3);
}, {});
// 3. Your first night as caretaker. — you in the doorway, the bright hall behind you
shot('me', K.me, (ctx, t, lt) => {
  L4.cam(ctx, 540, 960, lerp(1.0, 1.06, clamp(lt / 3)), t, { hand: 5, seed: 4 });
  ctx.fillStyle = '#120806'; ctx.fillRect(-100, -100, 1280, 2120);
  // door frame with the hall glowing through it
  ctx.save(); ctx.beginPath(); ctx.rect(250, 380, 580, 1240); ctx.clip();
  L4.blurLayer(ctx, 'meBg', 0.12, (x) => { x.translate(540, 960); x.scale(0.9, 0.9); x.translate(-540, -900); X.hall(x, t, { light: 1, bride: brideStanding(t) }); }, 1);
  ctx.restore();
  ctx.strokeStyle = '#3a1a0e'; ctx.lineWidth = 40; ctx.strokeRect(250, 380, 580, 1240);
  const wk = clamp(lt / 1.6);
  X.person(ctx, lerp(760, 560, E.out(wk)), 1640, 900, { view: 'back', walk: wk < 1 ? lt * 6 : null, rim: '#ffb46a', rimSide: 1, armR: -0.15 });
  // a key ring glint
  D.glow(ctx, lerp(760, 560, E.out(wk)) + 120, 1300, 26, 'rgba(255,220,150,A)', 0.7);
}, {});
// 4. The note says two rules. — the note in your hand (2.8 s), the hall soft behind it
shot('note', K.note, (ctx, t, lt) => {
  L4.blurLayer(ctx, 'noteBg', 0.08, (x) => { X.hall(x, t, { light: 1, bride: brideStanding(t) }); }, 1);
  L4.cam(ctx, 540, lerp(940, 960, clamp(lt / 2)), lerp(1.02, 1.1, E.out(clamp(lt / 2.6))), t, { hand: 5, seed: 5, rot: -0.02 });
  X.note(ctx, t, { l1: K.oneW - 0.2, l2: K.twoW - 0.2 });
}, {});
// 5. One. Never lift her veil. — low angle past a soft chair: her veiled head among the strings, her fingers twitch
shot('r1', K.r1, (ctx, t, lt) => {
  ctx.save(); L4.cam(ctx, 440, 640, lerp(2.5, 2.7, clamp(lt / 1.6)), t, { hand: 4, seed: 6, rot: 0.03 });
  X.hall(ctx, t, { light: 1, bride: brideStanding(t), stringsPush: strings(t) });
  ctx.restore();
  L4.blurLayer(ctx, 'r1fg', 0.07, (x) => { x.fillStyle = '#efe4d2'; D.rrect(x, -80, 1250, 520, 800, 60); x.fill(); x.fillStyle = '#d8a03a'; x.fillRect(-80, 1420, 520, 60); }, 1);
}, {});
// 6. Two. Never sign her book. — the register on a little table at the stage steps, a pen, petals
shot('r2', K.r2, (ctx, t, lt) => {
  ctx.fillStyle = '#1a0806'; ctx.fillRect(0, 0, W, H);
  L4.blurLayer(ctx, 'r2bg', 0.08, (x) => { x.translate(540, 300); x.scale(2.2, 2.2); x.translate(-540, -760); X.hall(x, t, { light: 1, bride: brideStanding(t) }); }, 1);
  L4.cam(ctx, 540, 1060, lerp(0.95, 1.05, E.out(clamp(lt / 2.5))), t, { hand: 4, seed: 7 });
  ctx.fillStyle = '#3a1a10'; ctx.fillRect(40, 1250, 1000, 900);
  ctx.save(); ctx.translate(540, 1200); ctx.scale(0.9, 0.45); ctx.translate(-540, -960); X.register(ctx, t, { page: 'guest', rot: 0.04 }); ctx.restore();
  ctx.strokeStyle = '#d9b25a'; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(660, 1290); ctx.lineTo(880, 1210); ctx.stroke();
  for (let i = 0; i < 9; i++) { ctx.fillStyle = i % 2 ? '#ff9d1c' : '#ffc23a'; ctx.beginPath(); ctx.arc(150 + i * 97 + Math.sin(i) * 30, 1420 + Math.cos(i * 2) * 40, 14, 0, Math.PI * 2); ctx.fill(); }
}, {});
// 7a. You switch off the lights. — the switchboard, the wall clock reads 2:14
shot('switch', K.sw, (ctx, t, lt) => {
  L4.cam(ctx, 560, 900, lerp(1.0, 1.08, clamp(lt / 1.5)), t, { hand: 4, seed: 8 });
  const off = Math.floor(clamp((t - K.offW) / (K.lightsW - K.offW)) * 6.99);
  X.switches(ctx, t, { off, light: t < K.lightsW ? 1 : 0.05 });
  const hx = lerp(-180, 300, clamp((t - K.offW) / (K.lightsW - K.offW))) + 0;
  X.myHand(ctx, 170 + hx, 1080, -0.25, 0.9, { curl: 0.5 });
}, {});
// 7b. The band starts playing. — dark stage corner, dhol + harmonium by themselves, dutch angle
shot('band', K.bandW, (ctx, t, lt) => {
  L4.cam(ctx, 540, 1000, lerp(1.05, 1.18, clamp(lt / 2)), t, { hand: 7, seed: 9, rot: 0.08 });
  X.band(ctx, t, { play: clamp((t - K.playW + 0.4) / 0.3) });
}, {});
// 8. Lights on. Every chair is full again. — smash to the bright hall, every seat taken
shot('on', K.on, (ctx, t, lt) => {
  L4.cam(ctx, 540, 1000, lerp(1.2, 1.3, clamp(lt / 1.2)), t, { hand: 4, seed: 10 });
  X.hall(ctx, t, { light: 1, guests: 1, bride: { x: 430, y: 950, h: 330, bend: 0 }, stringsPush: strings(t) });
  flash(ctx, t, K.on, 0.85, 0.3);
}, {});
shot('rows', K.everyW, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / 1.8));
  L4.cam(ctx, lerp(380, 450, k), lerp(1520, 1380, k), lerp(1.9, 2.0, k), t, { hand: 4, seed: 11 });
  X.hall(ctx, t, { light: 1, guests: 1, bride: { x: 430, y: 950, h: 330, bend: 0 } });
}, {});
// 9. And every guest is looking at you. — the heads all turn at once
shot('turn', K.guest, (ctx, t, lt) => {
  L4.cam(ctx, 560, 1330, lerp(1.6, 1.75, clamp(lt / 1.4)), t, { hand: 5, seed: 12 });
  X.hall(ctx, t, { light: 1, guests: 1, turn: clamp((t - K.guest - 0.3) / 0.9), bride: { x: 430, y: 950, h: 330, bend: 0 } });
}, {});
shot('face1', K.face, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.face, 14, 0.3);
  L4.cam(ctx, 560, 960, lerp(1.0, 1.08, clamp(lt / 1.6)), t, { hand: 3, seed: 13, sx, sy });
  X.myFace(ctx, t, { fear: lerp(0.5, 0.9, clamp(lt / 0.5)), look: -0.2, behind: (x) => L4.blurLayer(x, 'f1bg', 0.06, (y) => { y.translate(540, 960); y.scale(1.8, 1.8); y.translate(-540, -1350); X.hall(y, t, { light: 1, guests: 1, turn: 1 }); }, 0.9) });
}, {});
// 10. The bride stands up. — she unfolds from her throne up into the strings
shot('stand', K.stand, (ctx, t, lt) => {
  const k = E.inOut(inv(K.standsW - 0.2, K.standsW + 1.1, t));
  L4.cam(ctx, 470, lerp(860, 760, k), lerp(2.2, 1.95, k), t, { hand: 5, seed: 14 });
  X.hall(ctx, t, { light: 1, guests: 1, turn: 1, bride: { x: 430, y: lerp(950, X.STAGE_Y, k), h: lerp(330, 650, k), bend: lerp(0, bendAt(t), clamp((k - 0.7) / 0.3)) }, stringsPush: { x: 470, k: k * 1.4 } });
}, {});
// 11. She is taller than the marigold strings. — SCALE: you at the foot of the stage, her head in the strings
shot('scale', K.scale, (ctx, t, lt) => {
  L4.cam(ctx, 480, lerp(820, 760, clamp(lt / 2.5)), lerp(1.55, 1.7, E.out(clamp(lt / 2.5))), t, { hand: 4, seed: 15, rot: -0.03 });
  X.hall(ctx, t, { light: 1, guests: 1, turn: 1, bride: brideStanding(t), stringsPush: { x: 470, k: 1.2 } });
  X.person(ctx, 560, 1095, 245, { view: 'back', rim: '#ffb46a', rimSide: -1 });
  pulse(ctx, t, K.mariW, 0.25);
}, {});
// 12. She walks to you — POV down the aisle; she comes off the stage and grows, the guests turn to watch her
shot('walk', K.walk, (ctx, t, lt) => {
  const k = E.inOut(clamp((t - K.walksW + 0.2) / 1.5));
  const row = Math.max(0, Math.min(8, Math.floor(lerp(-0.5, 8.2, k))));
  const by = lerp(1060, 2050, Math.pow(k, 1.3)), bh = lerp(600, 2300, Math.pow(k, 1.6));
  L4.cam(ctx, 540, 1000, 1.18, t, { hand: 8, seed: 16 });
  X.hall(ctx, t, { light: 1, guests: 1, turn: 1, inAisle: { row, draw: (c) => X.bride(c, 540, by, bh, t, { walk: t * 4, bend: lerp(0.35, 0.1, k) }) } });
}, {});
// 12b. ...and puts your hand on her veil. — her mehndi hand pulls yours up to the stitches
shot('hands', K.puts, (ctx, t, lt) => {
  L4.blurLayer(ctx, 'hBg', 0.16, (x) => X.veilClose(x, t, { bend: 0.1 }), 1);
  const k = E.inOut(clamp((t - K.puts) / 0.9));
  L4.cam(ctx, 540, 960, 1.0, t, { hand: 6, seed: 17 });
  X.myHand(ctx, lerp(560, 520, k), lerp(1500, 1000, k), -0.05, 1.1, { curl: 0.2 });
  X.herHand(ctx, lerp(760, 640, k), lerp(1500, 1060, k), 2.55, 0.95, t, 0.75);
}, {});
// 13. You pull it away. Rule one, kept. — whip, then your face
shot('pull', K.pull, (ctx, t, lt) => {
  const k = E.in(clamp((t - K.awayW + 0.35) / 0.35));
  const [sx, sy] = shake(t, K.awayW - 0.1, 26, 0.4);
  L4.blurLayer(ctx, 'pBg', 0.16, (x) => X.veilClose(x, t, { bend: 0.1 }), 1);
  L4.cam(ctx, 540, 960, 1.0, t, { hand: 6, seed: 18, sx, sy });
  X.myHand(ctx, lerp(520, 80, k), lerp(1000, 2200, k), lerp(-0.05, 0.5, k), 1.1, { curl: lerp(0.2, 0.8, k) });
  X.herHand(ctx, 640, 1060 + Math.sin(t * 20) * 4, 2.55, 0.95, t, lerp(0.75, 0.1, k));
}, {});
shot('kept', K.rule1, (ctx, t, lt) => {
  L4.cam(ctx, 560, 960, lerp(1.06, 1.14, clamp(lt / 1.8)), t, { hand: 3, seed: 19 });
  X.myFace(ctx, t, { fear: 0.6, look: 0.5, blink: (t - K.rule1) % 1.9 > 1.75, behind: (x) => L4.blurLayer(x, 'kBg', 0.06, (y) => X.veilClose(y, t, {}), 0.8) });
}, {});
// 14. She holds out a book and a pen. — POV: she bends over you, the register held open in her long hands
shot('book', K.book, (ctx, t, lt) => {
  L4.blurLayer(ctx, 'bBg', 0.1, (x) => { x.translate(540, 0); x.translate(-540, 0); X.hall(x, t, { light: 1, guests: 1, turn: 1 }); }, 1);
  L4.cam(ctx, 540, 960, lerp(1.0, 1.06, clamp(lt / 2)), t, { hand: 5, seed: 20, rot: 0.04 });
  X.bride(ctx, 600, 3300, 3600, t, { bend: 0.25, arms: 'hang' });
  ctx.save(); ctx.translate(540, 1300); ctx.scale(0.72, 0.72); ctx.translate(-540, -960); X.register(ctx, t, { page: 'guest', rot: -0.08 }); ctx.restore();
  X.herHand(ctx, 230, 1310, -0.45, 0.7, t, 0.5); X.herHand(ctx, 850, 1290, 0.45, 0.7, t, 0.5);
  ctx.strokeStyle = '#d9b25a'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(780, 1180); ctx.lineTo(620, 1060); ctx.stroke();
  pulse(ctx, t, K.bookW, 0.2);
}, {});
// 15. The guests start clapping. — rows of silhouettes clapping in unison, all staring at you, dutch angle
shot('clap', K.clap, (ctx, t, lt) => {
  L4.cam(ctx, 540, 1380, lerp(1.6, 1.7, clamp(lt / 2)), t, { hand: 6, seed: 21, rot: -0.07 });
  X.hall(ctx, t, { light: 1, guests: 1, turn: 1, clap: t > K.clapW - 0.5 });
}, {});
// 16. So you sign it. — your hand writes on the groom line (the heading is out of frame)
shot('sign', K.sign, (ctx, t, lt) => {
  ctx.fillStyle = '#120605'; ctx.fillRect(0, 0, W, H);
  L4.cam(ctx, 830, 1100, 3.0, t, { hand: 3, seed: 22 });
  const sg = clamp((t - K.signW + 0.1) / 1.3);
  const pen = X.register(ctx, t, { page: 'marriage', sign: sg, rot: 0 }) || [740, 910];
  X.myHand(ctx, 540 + pen[0] - 40, 960 + pen[1] + 150, 0.4, 0.6, { pen: true, curl: 0.6 });
}, {});
// 17-18. It was not the guest book. It was the marriage register. — tilt up to the heading
shot('reveal', K.notW, (ctx, t, lt) => {
  ctx.fillStyle = '#120605'; ctx.fillRect(0, 0, W, H);
  const k = E.inOut(clamp((t - K.notW - 0.9) / 1.3));
  L4.cam(ctx, lerp(830, 540, k), lerp(1100, 860, k), lerp(3.0, 1.25, k), t, { hand: 4, seed: 23, rot: k * 0.05 });
  X.register(ctx, t, { page: 'marriage', sign: 1, rot: 0 });
  pulse(ctx, t, K.regW, 0.45, 1.6);
}, {});
// 18b. You just married her. — on the stage: you on the groom's throne with a marigold garland, her beside you, bent
shot('married', K.married, (ctx, t, lt) => {
  L4.cam(ctx, 545, lerp(800, 780, clamp(lt / 2)), lerp(2.3, 2.5, E.inOut(clamp(lt / 2.2))), t, { hand: 5, seed: 24 });
  X.hall(ctx, t, { light: 1, guests: 1, turn: 1, bride: brideStanding(t), groom: { fear: 1, look: -0.6 }, stringsPush: strings(t) });
  flash(ctx, t, K.married, 0.4, 0.3);
}, {});
// 19-20. And her veil starts to open. Which rule would you break? — the seam splits, the stitches snap, two eyes inside
shot('open', K.open, (ctx, t, lt) => {
  const op = clamp((t - K.openW + 0.1) / 2.6);
  const [sx, sy] = shake(t, K.openW, 12, 0.5);
  L4.cam(ctx, 540, 900, lerp(1.05, 1.35, E.inOut(clamp(lt / 6))), t, { hand: 4, seed: 25, sx, sy, rot: lerp(0, -0.06, clamp(lt / 3)) });
  X.veilClose(ctx, t, { open: op, bend: 0.06 });
  pulse(ctx, t, K.openW, 0.35, 1.2);
}, { capY: () => 1640 });
// loop: the last beat returns to the frame-1 picture so the replay is seamless
shot('loop', K.loop, (ctx, t, lt) => {
  L4.cam(ctx, 520, 800, 1.22, t, { hand: 4 });
  X.hall(ctx, t, { light: 1, bride: brideStanding(t), stringsPush: strings(t) });
}, { captions: false });

function post(ctx, canvas, t, cur) {
  const lt = light(t);
  L4.bloom(ctx, canvas, lt ? 0.32 : 0.2);
  L4.grade(ctx, lt ? '#ff9a3c' : '#3c7aa8', 0.05, cur.name === 'open' ? 0.7 : 0.55);
  // whip-pan smear across the hard cuts that carry a scare
  for (const [t0, dir] of [[K.on, 1], [K.pull, -1], [K.open, 1], [K.face, -1]]) { const k = 1 - clamp((t - t0) / 0.14); if (t >= t0 && k > 0) L4.whip(ctx, canvas, k, dir); }
}
function overlay(ctx, t, cur) {
  if (t < 1.75) L4.title(ctx, 'She never left the stage.', 540, 250, 64, '#fbf6ee', clamp(t / 0.15) * clamp((1.75 - t) / 0.15), true);
  if (t >= K.ask && t < K.loop) {
    const a = clamp((t - K.ask) / 0.25) * clamp((K.loop - t) / 0.2);
    L4.title(ctx, 'A · lift her veil', 540, 1370, 66, '#ffb84a', a);
    L4.title(ctx, 'B · sign her book', 540, 1460, 66, '#ff4a3d', a);
  }
}
function cover(ctx, t) {
  ctx.save(); L4.cam(ctx, 470, 720, 1.85, 0, { hand: 0 });
  X.hall(ctx, 3, { light: 1, guests: 0, bride: brideStanding(3), stringsPush: strings(3) });
  ctx.restore(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  L4.bloom(ctx, ctx.canvas, 0.35); L4.grade(ctx, '#ff9a3c', 0.05, 0.6);
  const g = ctx.createLinearGradient(0, 1250, 0, 1920); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.85)'); ctx.fillStyle = g; ctx.fillRect(0, 1250, W, 670);
  L4.title(ctx, 'Her veil is', 540, 1450, 120, '#fbf6ee');
  L4.title(ctx, 'sewn shut.', 540, 1580, 130, '#ff4a3d');
  L4.title(ctx, 'NIGHT SHIFT · the wedding hall', 540, 1700, 44, '#ffb84a', 0.95, true);
  L4.grain(ctx, 0.5, 0.06);
}
return { look: 'v4', shots, K, post, overlay, cover, capY: 1530, hudState: () => ({}) };
};
