// NIGHT SHIFT Season 2 · Episode 1 (engine part 9) "The railway level crossing" (THE MAN WHO CRAWLS THE TRACKS). ~60 s, v4 look.
// Own palette: cold LED floodlight over violet night, red-and-white boom barrier, red crossing lamps, one warm hut bulb, signal
// green. Silhouette rule: frame 1 = the bright crossing, the man on all fours on the rails, belly up, knees up past his upside-down
// head, moving within 0.5 s; cut closer by ~1.75 s. Rules: 1) bell rings -> close the gate (kept), 2) never open it for anyone on
// foot (broken, for his little brother's voice). Twist: he was never waiting for a train, he was waiting for the gate to open.
const D = require('./draw');
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
  tracksW: Wt(1, 5), foursW: Wt(1, 7), back: S0(2), wrongW: Wt(2, 5), me: S0(3), crossW: Wt(3, 7), note: S0(4), twoRulesW: Wt(4, 3),
  bell1: Wt(5, 1) - 0.1, rings1W: Wt(5, 4), close1: Wt(5, 5) - 0.08, r2: S0(6), footW: Wt(6, 6),
  ring: S0(7) - 0.5, ringW: Wt(7, 1), lower: Wt(7, 3) - 0.08, closeW: Wt(7, 4), kept: Wt(7, 7) - 0.08,
  noTrain: S0(8), trainW: Wt(8, 2), him: S0(9), himW: Wt(9, 1), crawlW: Wt(9, 2), lamp9W: Wt(9, 5) - 0.06,
  stand: S0(10), standsW: Wt(10, 4), scale: S0(11), tallW: Wt(11, 2), signalW: Wt(11, 5),
  voice: S0(12), bhaiyaW: Wt(12, 4), open: Wt(12, 7) - 0.08, bro: S0(13), broW: Wt(13, 3),
  lift: S0(14), liftW: Wt(14, 1), broken: Wt(14, 4) - 0.08, brokenW: Wt(14, 6),
  nobody: S0(15), lamp: S0(16), lampW: Wt(16, 4), never: S0(17), trainW2: Wt(17, 6), gate: S0(18), openW: Wt(18, 7),
  side: S0(19), sideW: Wt(19, 5), ask: S0(20), typeW: Wt(20, 6), loop: END - 0.75,
};
const shots = [];
const shot = (name, start, draw, meta) => shots.push({ name, start, draw, meta });
const flash = (ctx, t, t0, a = 0.7, d = 0.35, col = '235,245,255') => { if (t < t0 || t > t0 + d) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(${col},${a * (1 - (t - t0) / d)})`; ctx.fillRect(0, 0, W, H); ctx.restore(); };
const pulse = (ctx, t, t0, a = 0.35, k = 2.2) => { if (t < t0) return; const v = a * Math.exp(-(t - t0) * k); if (v < 0.01) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); const g = ctx.createRadialGradient(540, 960, 300, 540, 960, 1200); g.addColorStop(0, 'rgba(200,20,30,0)'); g.addColorStop(1, `rgba(200,20,30,${v})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); };
const lampFlicker = (t, t0, t1) => (t >= t0 && t < t1 ? (hash(Math.floor(t * 14)) < 0.35 ? 0.15 : 1) : 1);

// the crawler on the rails in the wide (side view), x moves right with time
const crawlX = t => 250 + t * 52;
const crawlSide = (t, o = {}) => ({ view: 'side', x: crawlX(t), s: 2.35, phase: t * 4.2, ...o });

// a low camera ON the tracks, looking along the rails into the dark (POV of the gatekeeper standing on the crossing)
function trackPOV(ctx, t, o = {}) {
  const lt = o.light ?? 1;
  const sk = ctx.createLinearGradient(0, -200, 0, 800); sk.addColorStop(0, '#070a1c'); sk.addColorStop(1, '#2c3262');
  ctx.fillStyle = sk; ctx.fillRect(-400, -400, 1880, 1200);
  ctx.fillStyle = '#e8ecff'; ctx.beginPath(); ctx.arc(820, 260, 26, 0, Math.PI * 2); ctx.fill(); D.glow(ctx, 820, 260, 220, 'rgba(200,215,255,A)', 0.16);
  ctx.fillStyle = '#0a0d1a'; ctx.beginPath(); ctx.moveTo(-400, 780);
  for (let x = -400; x <= 1480; x += 30) ctx.lineTo(x, 770 - D.noise1(x * 0.012 + 4) * 140 - hash(x) * 14 - (Math.abs(x - 540) < 90 ? -60 : 0));
  ctx.lineTo(1480, 800); ctx.lineTo(-400, 800); ctx.closePath(); ctx.fill();
  const gr = ctx.createLinearGradient(0, 760, 0, 2000); gr.addColorStop(0, '#161a26'); gr.addColorStop(1, '#2a2b30');
  ctx.fillStyle = gr; ctx.fillRect(-400, 760, 1880, 1400);
  const VP = [540, 770];
  ctx.fillStyle = '#2f2b2a'; ctx.beginPath(); ctx.moveTo(VP[0] - 6, VP[1]); ctx.lineTo(VP[0] + 6, VP[1]); ctx.lineTo(1300, 2100); ctx.lineTo(-220, 2100); ctx.closePath(); ctx.fill();
  for (let i = 1; i < 40; i++) {
    const k = Math.pow(i / 40, 2.2), y = VP[1] + (2100 - VP[1]) * k, hw = 12 + 760 * k, th = 2 + 40 * k;
    ctx.fillStyle = '#3d2e25'; ctx.fillRect(VP[0] - hw, y, hw * 2, th);
  }
  for (const s of [-1, 1]) {
    ctx.strokeStyle = '#5e6670'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(VP[0] + s * 3, VP[1]); ctx.lineTo(VP[0] + s * 430, 2100); ctx.stroke();
    ctx.strokeStyle = D.rgba ? '#dfeeff' : '#dfeeff'; ctx.globalAlpha = 0.35 + 0.4 * lt; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(VP[0] + s * 3, VP[1]); ctx.lineTo(VP[0] + s * 424, 2100); ctx.stroke(); ctx.globalAlpha = 1;
  }
  // signal at the right, far
  ctx.fillStyle = '#14161c'; ctx.fillRect(742, 560, 10, 260); ctx.fillStyle = '#0c0d11'; D.rrect(ctx, 728, 540, 38, 76, 8); ctx.fill();
  const red = o.signal === 'red';
  ctx.fillStyle = red ? '#ff3a30' : '#1c1f22'; ctx.beginPath(); ctx.arc(747, 558, 11, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = red ? '#1c1f22' : '#45ff97'; ctx.beginPath(); ctx.arc(747, 594, 11, 0, Math.PI * 2); ctx.fill();
  D.glow(ctx, 747, red ? 558 : 594, 90, red ? 'rgba(255,60,50,A)' : 'rgba(70,255,150,A)', 0.5);
  if (o.lantern) X.lantern(ctx, 640, 1720, 2.4, t, { side: true, lit: 1 });
  if (o.crawler) { const d = clamp(o.crawler.d); X.crawlerFront(ctx, 540, lerp(800, 1560, Math.pow(d, 1.5)), lerp(0.6, 4.6, Math.pow(d, 1.7)), t, { phase: t * 4, light: lt, rim: '#eef8ff', jerk: o.crawler.jerk || 0 }); }
  // floodlight from behind the camera: light pool on the rails nearby
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const pg = ctx.createRadialGradient(540, 1800, 50, 540, 1700, 900); pg.addColorStop(0, `rgba(210,235,255,${0.28 * lt})`); pg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = pg; ctx.fillRect(-300, 900, 1700, 1300);
  if (o.flash) { ctx.fillStyle = `rgba(255,40,30,${Math.floor(t * 2.6) % 2 ? 0.1 : 0.03})`; ctx.fillRect(-400, -400, 1880, 2800); }
  ctx.restore();
  L4.dust(ctx, t, 100, 900, 900, 900, 30, '#e6f4ff', 0.35 * lt, 5);
}
const faceBg = (t, o = {}) => (x) => L4.blurLayer(x, 'fbg' + (o.key || ''), o.scale || 0.06, (y) => { y.translate(540, 960); y.scale(1.6, 1.6); y.translate(-560, -1020); X.crossing(y, t, { light: 1, bar: o.bar ?? 0, flash: o.flash }); }, 0.85);
const myFace = (ctx, t, o) => Wd.myFace(ctx, t, { bg0: '#0f1426', bg1: '#05070c', rim: '#cfe6ff', light: 0.75, ...o });

// 1. HOOK (frame 1): the bright crossing, lamps flashing, the man on all fours on the rails, belly up, knees past his head.
shot('hook', 0, (ctx, t, lt) => {
  const z = lerp(1.62, 1.72, E.out(clamp(lt / 1.8)));
  L4.cam(ctx, 390, 960, z, t, { hand: 4 });
  const jerk = E.outBack(inv(0.25, 0.55, t)) * 0.5;
  X.crossing(ctx, t, { light: 1, bar: 0, flash: true, crawler: crawlSide(t, { jerk }) });
}, {});
// 1b. On all fours. — closer, along the rails: his limbs stepping over the sleepers
shot('close', 1.75, (ctx, t, lt) => {
  const cx = crawlX(t) + 40;
  L4.cam(ctx, lerp(cx - 20, cx, clamp(lt / 2)), 950, lerp(2.7, 2.9, E.inOut(clamp(lt / 2.2))), t, { hand: 6, seed: 2 });
  X.crossing(ctx, t, { light: 1, bar: 0, flash: true, crawler: crawlSide(t) });
}, {});
// 2. Its back is bent the wrong way. — rail-level profile, rack focus from the soft near rail to him
shot('back', K.back, (ctx, t, lt) => {
  const cx = crawlX(t) + 30;
  ctx.save(); L4.cam(ctx, cx, 940, lerp(3.0, 3.25, clamp(lt / 1.8)), t, { hand: 4, seed: 3, rot: -0.05 });
  X.crossing(ctx, t, { light: 1, bar: 0, flash: true, crawler: crawlSide(t) });
  ctx.restore();
  const f = 1 - E.inOut(clamp(lt / 0.8));
  L4.blurLayer(ctx, 'railfg', lerp(0.05, 0.12, f), (x) => { x.fillStyle = '#4e555e'; x.fillRect(-100, 1640, 1300, 70); x.fillStyle = '#c9dcef'; x.fillRect(-100, 1640, 1300, 10); x.fillStyle = '#2a201a'; for (let i = 0; i < 6; i++) x.fillRect(i * 230 - 40, 1700, 120, 260); }, 0.95);
  pulse(ctx, t, K.wrongW, 0.28);
}, {});
// 3. Your first night as gatekeeper at the level crossing. — you step out of the hut with a lantern
shot('me', K.me, (ctx, t, lt) => {
  const wk = clamp(lt / 1.6);
  L4.cam(ctx, lerp(900, 820, E.inOut(clamp(lt / 2.8))), 900, lerp(2.1, 1.7, E.inOut(clamp(lt / 2.8))), t, { hand: 5, seed: 4 });
  X.crossing(ctx, t, { light: 1, bar: 1, doorOpen: true, you: { x: lerp(1010, 940, E.out(wk)), y: lerp(1012, 1060, E.out(wk)), h: 230, view: 'front', fear: 0.15, rim: '#ffc46a', walk: wk < 1 ? lt * 6 : null } });
  X.lantern(ctx, lerp(1010, 940, E.out(wk)) + 40, lerp(1012, 1060, E.out(wk)) - 62, 0.5, t, { lit: 1 });
}, {});
// 4. The note says two rules. — the note in your hand (<= 3 s), the crossing soft behind it
shot('note', K.note, (ctx, t, lt) => {
  L4.blurLayer(ctx, 'noteBg', 0.08, (x) => X.crossing(x, t, { light: 1, bar: 1 }), 1);
  L4.cam(ctx, 540, lerp(940, 960, clamp(lt / 2)), lerp(1.0, 1.08, E.out(clamp(lt / 2.6))), t, { hand: 5, seed: 5, rot: -0.02 });
  X.note(ctx, t, { l1: K.twoRulesW, l2: K.twoRulesW + 0.5 });
}, {});
// 5. One. When the bell rings, close the gate. — the bell over the hut door (and the clock: 2:40) ...
shot('bell1', K.bell1, (ctx, t, lt) => {
  L4.cam(ctx, 600, 760, lerp(1.0, 1.1, clamp(lt / 1.5)), t, { hand: 4, seed: 6 });
  X.bellWall(ctx, t, { ring: t > K.rings1W && t < K.rings1W + 0.25 ? 0.4 : 0 });
}, {});
// ... the winch wheel, your hand on it
shot('winch1', K.close1, (ctx, t, lt) => {
  L4.cam(ctx, 540, 960, lerp(1.0, 1.06, clamp(lt / 1.2)), t, { hand: 4, seed: 7, rot: 0.05 });
  X.winch(ctx, t, { rot: -0.4 + E.inOut(clamp(lt / 0.9)) * 0.5, bg: (x) => L4.blurLayer(x, 'wbg', 0.06, (y) => X.crossing(y, t, { light: 1, bar: 1 }), 0.7) });
}, {});
// 6. Two. Never open it for anyone on foot. — the open road over the crossing; prints in the dust, four limbs
shot('r2', K.r2, (ctx, t, lt) => {
  L4.cam(ctx, 540, lerp(1180, 1140, clamp(lt / 2.8)), lerp(1.7, 1.85, E.inOut(clamp(lt / 2.8))), t, { hand: 4, seed: 8 });
  X.crossing(ctx, t, { light: 1, bar: 1, prints: true });
}, {});
// 7. The bell rings. — the bell hammering, lamps on
shot('ring', K.ring, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.ringW - 0.4, 10, 2.5);
  L4.cam(ctx, 520, 860, lerp(1.25, 1.4, clamp(lt / 1.5)), t, { hand: 3, seed: 9, sx, sy, rot: 0.06 });
  X.bellWall(ctx, t, { ring: t > K.ringW - 0.45 ? 1 : 0 });
  if (t > K.ringW - 0.45) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,40,30,${Math.floor(t * 2.6) % 2 ? 0.14 : 0.04})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
}, {});
// 7b. You close the gate. — wide: the barrier comes down, the lamps flash
shot('lower', K.lower, (ctx, t, lt) => {
  L4.cam(ctx, 540, 960, lerp(1.08, 1.14, clamp(lt / 2)), t, { hand: 4, seed: 10 });
  X.crossing(ctx, t, { light: 1, bar: 1 - E.inOut(clamp((t - K.closeW + 0.1) / 1.3)), flash: true });
}, {});
// 7c. Rule one, kept. — your face, a breath of relief
shot('kept', K.kept, (ctx, t, lt) => {
  L4.cam(ctx, 560, 960, lerp(1.04, 1.1, clamp(lt / 1.6)), t, { hand: 3, seed: 11 });
  myFace(ctx, t, { fear: 0.3, look: 0.4, blink: (lt % 1.7) > 1.55, behind: faceBg(t, { flash: true }) });
}, {});
// 8. But no train comes. — on the tracks: the rails run into the dark, signal green, nothing
shot('noTrain', K.noTrain, (ctx, t, lt) => {
  L4.cam(ctx, 540, 900, lerp(1.0, 1.12, E.inOut(clamp(lt / 1.5))), t, { hand: 5, seed: 12 });
  trackPOV(ctx, t, { flash: true });
}, {});
// 9. Only him, crawling toward your lamp. — he comes out of the dark along the rails
shot('him', K.him, (ctx, t, lt) => {
  const d = lerp(0.3, 0.86, E.inOut(clamp((t - K.him) / (K.lamp9W - K.him))));
  L4.cam(ctx, 540, 960, 1.06, t, { hand: 6, seed: 13 });
  trackPOV(ctx, t, { flash: true, crawler: { d, jerk: t > K.himW && t < K.himW + 0.4 ? 0.4 : 0 } });
}, {});
shot('face1', K.lamp9W, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.lamp9W, 14, 0.3);
  L4.cam(ctx, 560, 960, lerp(1.0, 1.08, clamp(lt / 1.4)), t, { hand: 3, seed: 14, sx, sy });
  myFace(ctx, t, { fear: lerp(0.5, 0.85, clamp(lt / 0.5)), look: -0.25, behind: faceBg(t, { flash: true, key: 'b' }) });
  X.lantern(ctx, 900, 1880, 2.2, t, { lit: 1 });
}, {});
// 10. At the gate, he stands up. — low angle behind the closed barrier; he unfolds, up and up
shot('stand', K.stand, (ctx, t, lt) => {
  const k = E.inOut(inv(K.standsW - 0.25, K.standsW + 1.2, t));
  L4.cam(ctx, 560, lerp(1050, 820, k), lerp(1.9, 1.25, k), t, { hand: 5, seed: 15, rot: -0.06 });
  X.crossing(ctx, t, { light: 1, bar: 0, flash: true, crawlerNear: { x: 560, y: 1170, s: 2.9, stand: k, phase: 0, jerk: Math.sin(t * 7) * 0.05 * (1 - k) } });
}, {});
// 11. He is taller than the signal post. — SCALE: the wide crossing, him beside the signal, you small by the hut
shot('scale', K.scale, (ctx, t, lt) => {
  L4.cam(ctx, 520, lerp(900, 870, clamp(lt / 2.5)), lerp(1.08, 1.14, E.out(clamp(lt / 2.5))), t, { hand: 4, seed: 16, rot: 0.03 });
  X.crossing(ctx, t, { light: 1, bar: 0, flash: true, crawlerNear: { x: 470, y: 1150, s: 3.7, stand: 1, phase: 0 }, you: { x: 880, y: 1190, h: 230, view: 'back', rim: '#ffc46a', rimSide: -1 } });
  pulse(ctx, t, K.signalW, 0.25);
}, {});
// 12. A small voice calls: Bhaiya, it's me. — his upside-down face over the barrier; the child's voice comes out of it
shot('voice', K.voice, (ctx, t, lt) => {
  L4.cam(ctx, 540, 900, lerp(1.0, 1.12, E.inOut(clamp(lt / 3))), t, { hand: 3, seed: 17 });
  X.faceClose(ctx, t, { talk: t > K.bhaiyaW - 0.1 ? 1 : 0, look: 0, s: 0.95, bg: (x) => L4.blurLayer(x, 'vbg', 0.05, (y) => X.crossing(y, t, { light: 1, bar: 0, flash: true }), 0.7) });
  // the barrier crossing the bottom of frame, soft (he is right behind it)
  L4.blurLayer(ctx, 'vfg', 0.1, (x) => { for (let i = 0; i < 6; i++) { x.fillStyle = i % 2 ? '#f1eee6' : '#d9232c'; x.fillRect(i * 200 - 60, 1500, 200, 110); } }, 1);
}, { capY: () => 1760 });
// 12b. Open the gate. — your hand on the winch, trembling
shot('winch2', K.open, (ctx, t, lt) => {
  L4.cam(ctx, 540, 960, 1.04, t, { hand: 7, seed: 18, rot: -0.05 });
  X.winch(ctx, t, { rot: -0.2 + Math.sin(t * 30) * 0.008 + E.inOut(clamp((t - K.open - 0.8) / 1.2)) * 0.25, bg: (x) => L4.blurLayer(x, 'w2bg', 0.06, (y) => X.crossing(y, t, { light: 1, bar: 0, flash: true }), 0.7) });
}, {});
// 13. It's your little brother. — your face; you know that voice
shot('bro', K.bro, (ctx, t, lt) => {
  L4.cam(ctx, 560, 960, lerp(1.06, 1.16, clamp(lt / 1.6)), t, { hand: 3, seed: 19 });
  myFace(ctx, t, { fear: 0.65, look: 0.5, behind: faceBg(t, { flash: true, key: 'c' }) });
}, {});
// 14. You lift the gate. Rule two, broken. — behind you: the barrier swings up; punch-in on "broken"
shot('lift', K.lift, (ctx, t, lt) => {
  const k = clamp((t - K.liftW + 0.1) / 1.5);
  const pz = t > K.broken ? E.out(clamp((t - K.broken) / 0.3)) * 0.18 : 0;
  L4.cam(ctx, 540, 1000, 1.12 + pz, t, { hand: 5, seed: 20 });
  X.crossing(ctx, t, { light: 1, bar: k, flash: true, you: { x: 330, y: 1500, h: 520, view: 'back', rim: '#cfe6ff', rimSide: 1 } });
  pulse(ctx, t, K.brokenW - 0.2, 0.45, 1.8);
}, {});
// 15. Nobody is there. — the open crossing, empty; the floodlight stutters
shot('nobody', K.nobody, (ctx, t, lt) => {
  L4.cam(ctx, 540, lerp(940, 920, clamp(lt / 1.5)), lerp(1.1, 1.16, clamp(lt / 1.5)), t, { hand: 4, seed: 21 });
  X.crossing(ctx, t, { light: lampFlicker(t, K.nobody + 0.4, K.nobody + 1.1), bar: 1, flash: true });
}, {});
// 16. Just the last gatekeeper's lamp, lying on the tracks. — insert: a cracked hurricane lantern on its side, still lit
shot('lamp', K.lamp, (ctx, t, lt) => {
  const f = E.inOut(clamp(lt / 1.0));
  ctx.save(); L4.cam(ctx, 610, 1010, lerp(3.0, 3.3, clamp(lt / 3)), t, { hand: 3, seed: 22, rot: 0.04 });
  X.crossing(ctx, t, { light: 1, bar: 1, flash: true, lantern: { x: 610, y: 1036, s: 0.9 } });
  ctx.restore();
  L4.blurLayer(ctx, 'lfg', lerp(0.1, 0.04, f), (x) => { x.fillStyle = '#5e6670'; x.fillRect(-100, 1720, 1300, 60); x.fillStyle = '#d6e6f6'; x.fillRect(-100, 1720, 1300, 8); }, 0.9);
  pulse(ctx, t, K.lampW, 0.22);
}, {});
// 17. He was never waiting for a train. — the rails into the dark, the lantern in the foreground, the signal turns red
shot('never', K.never, (ctx, t, lt) => {
  L4.cam(ctx, 540, 960, lerp(1.0, 1.1, E.inOut(clamp(lt / 2.3))), t, { hand: 4, seed: 23 });
  trackPOV(ctx, t, { lantern: true, signal: t > K.trainW2 - 0.1 ? 'red' : 'green' });
}, {});
// 18. He was waiting for the gate to open. — low angle: the raised barrier pointing at the sky
shot('gate', K.gate, (ctx, t, lt) => {
  L4.cam(ctx, lerp(230, 260, clamp(lt / 2.6)), lerp(1000, 880, E.inOut(clamp(lt / 2.6))), 1.7, t, { hand: 4, seed: 24, rot: 0.08 });
  X.crossing(ctx, t, { light: 1, bar: 1, flash: true });
}, {});
// 19. And now he's on your side. — your face; behind your shoulder his upside-down face rises, focus pulls to him on "side"
shot('side', K.side, (ctx, t, lt) => {
  const rise = E.out(clamp((t - K.side - 0.2) / 1.2));
  const foc = E.inOut(clamp((t - K.sideW + 0.25) / 0.4));
  L4.cam(ctx, 560, 960, lerp(1.04, 1.14, clamp(lt / 2)), t, { hand: 3, seed: 25 });
  myFace(ctx, t, { fear: lerp(0.6, 0.95, foc), look: -0.6 * foc, behind: (x) => {
    faceBg(t, { flash: true, key: 'd' })(x);
    L4.blurLayer(x, 'ghost', lerp(0.07, 0.6, foc), (y) => { y.save(); y.translate(-250, lerp(360, 0, rise)); y.scale(0.62, 0.62); y.translate(0, 300); X.faceClose(y, t, { look: 1, jerk: Math.sin(t * 3) * 0.03, bgClear: true }); y.restore(); }, 1);
  } });
  pulse(ctx, t, K.sideW, 0.35, 1.4);
}, {});
// 20. Which rule would you break? — the last scary shot: you at the open gate, and him standing right behind you
shot('ask', K.ask, (ctx, t, lt) => {
  L4.cam(ctx, 560, lerp(1080, 1040, clamp(lt / 3)), lerp(1.0, 1.06, clamp(lt / 3)), t, { hand: 4, seed: 26 });
  X.crossing(ctx, t, { light: lampFlicker(t, K.ask + 1.6, K.ask + 1.9), bar: 1, flash: true, you: { x: 470, y: 1200, h: 300, view: 'back', rim: '#cfe6ff', rimSide: 1 }, crawlerNear: { x: 800, y: 1780, s: 4.6, stand: 1, phase: 0, jerk: Math.sin(t * 2) * 0.04 } });
}, { capY: () => 1680 });
// loop: back to the frame-1 picture so the replay is seamless
shot('loop', K.loop, (ctx, t, lt) => {
  L4.cam(ctx, 390, 960, 1.62, t, { hand: 4 });
  X.crossing(ctx, 0.1, { light: 1, bar: 0, flash: true, crawler: crawlSide(0.1) });
}, { captions: false });

const warm = new Set(['bell1', 'winch1', 'ring', 'winch2']);
function post(ctx, canvas, t, cur) {
  L4.bloom(ctx, canvas, 0.32);
  L4.grade(ctx, warm.has(cur.name) ? '#ff9a3c' : '#7fb0ff', 0.05, cur.name === 'side' || cur.name === 'voice' ? 0.7 : 0.55);
  for (const [t0, dir] of [[1.75, 1], [K.lamp9W, -1], [K.stand, 1], [K.lift, -1], [K.side, 1], [K.ask, -1]]) { const k = 1 - clamp((t - t0) / 0.14); if (t >= t0 && k > 0) L4.whip(ctx, canvas, k, dir); }
}
function overlay(ctx, t, cur) {
  if (t < 1.75) L4.title(ctx, 'Never open the gate.', 540, 250, 66, '#fbf6ee', clamp(t / 0.15) * clamp((1.75 - t) / 0.15), true);
  if (t >= K.ask && t < K.loop) {
    const a = clamp((t - K.ask) / 0.25) * clamp((K.loop - t) / 0.2);
    L4.title(ctx, 'A · leave the gate up', 540, 1330, 66, '#7fe8b0', a);
    L4.title(ctx, 'B · open it for him', 540, 1420, 66, '#ff4a3d', a);
  }
}
function cover(ctx, t) {
  ctx.save(); L4.cam(ctx, 430, 900, 1.9, 0, { hand: 0 });
  X.crossing(ctx, 0.6, { light: 1, bar: 0, flash: true, crawler: { view: 'side', x: 360, s: 2.35, phase: 1.2 } });
  ctx.restore(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  L4.bloom(ctx, ctx.canvas, 0.35); L4.grade(ctx, '#7fb0ff', 0.05, 0.6);
  const g = ctx.createLinearGradient(0, 1250, 0, 1920); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.85)'); ctx.fillStyle = g; ctx.fillRect(0, 1250, W, 670);
  L4.title(ctx, 'He crawls', 540, 1450, 124, '#fbf6ee');
  L4.title(ctx, 'bent backwards.', 540, 1580, 118, '#ff4a3d');
  L4.title(ctx, 'NIGHT SHIFT · the level crossing', 540, 1700, 44, '#7fe8b0', 0.95, true);
  L4.grain(ctx, 0.5, 0.06);
}
return { look: 'v4', shots, K, post, overlay, cover, capY: 1530, hudState: () => ({}) };
};
