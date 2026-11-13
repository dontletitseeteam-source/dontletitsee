// BLOCK C — Part 3 "Left" shot list (branch A: you opened the door; no votes -> the scarier branch)
const { createCanvas } = require('@napi-rs/canvas');
const D = require('./draw');
const S = require('./scenes');
const X = require('./sets');
const { W, H, C, clamp, lerp, inv, E, hash, noise1, shake, rrect, spaced, camera } = D;

module.exports = function build(TL) {
const Ln = id => TL.lines[id - 1];
const Wd = (id, k) => Ln(id).words[k].start;
const R = X.listLayout();
const K = {
  opened: Ln(2).start - 0.06, openedW: Wd(2, 3),
  bolt: Ln(3).start - 0.06, slides: Wd(3, 1), swings: Wd(3, 5),
  nobody: Ln(4).start - 0.1,
  corridor: Ln(5).start - 0.06, emptyW: Wd(5, 3), dead: Wd(5, 7), shut: Wd(5, 10),
  nofoot: Ln(6).start - 0.06, nothing: Wd(6, 4),
  gone: Ln(7).start - 0.06, goneW: Wd(7, 6),
  down: Ln(8).start - 0.06, downW: Wd(8, 3),
  feet: Ln(9).start - 0.06, regW: Wd(9, 7),
  pick: Ln(10).start - 0.06, wrong: Wd(10, 10),
  date: Ln(11).start - 0.06, tomorrow: Wd(11, 2),
  room13: Ln(12).start - 0.06, red: Wd(12, 6),
  mark: Ln(13).start - 0.06,
  left: Ln(14).start - 0.04,
  notAbs: Ln(15).start - 0.06, left2: Wd(15, 4),
  slam: Ln(16).start - 0.06, slamW: Wd(16, 2), boltW: Wd(16, 4), backW: Wd(16, 6),
  time: Ln(17).start - 0.08,
  rule: Ln(18).start - 0.06, lookW: Wd(18, 11),
  buzz: Ln(19).start - 0.06, buzzW: Wd(19, 2), kabirW: Wd(19, 3),
  m1: Ln(20).start - 0.05, m2: Ln(21).start - 0.05, voicesW: Wd(21, 8),
  since: Ln(22).start - 0.06,
  flash: Ln(23).start - 0.06, breathingW: Wd(23, 3),
  under: Ln(24).start - 0.06, breathW: Wd(24, 6),
  slow: Ln(25).start - 0.06, tooSlow: Wd(25, 1),
  whisper: Ln(26).start - 0.06, kvoice: Wd(26, 4),
  closer: Ln(27).start - 0.06, comeW: Wd(27, 3),
  choice: Ln(28).start - 0.1, optA: Wd(29, 0), optB: Wd(30, 0), cta: Ln(31).start, ctaA: Wd(31, 1), ctaB: Wd(31, 3),
};

// ---------- HUD ----------
function hudState(t) {
  const time = t < K.time ? '12:58' : t < K.buzz ? '1:04' : '1:05';
  const blink = (t0) => t < t0 + 0.6 ? (Math.floor(t * 12) % 2 ? C.red : C.white) : C.red;
  let r4 = ['KABIR', 'MISSING', C.red];
  if (t >= K.m1) r4 = ['KABIR', 'WASHROOM', t < K.m1 + 0.6 ? blink(K.m1) : C.lime];
  if (t >= K.under) r4 = ['UNDER BED', 'BREATHING', blink(K.under)];
  return {
    t, part: 'PART 3', time, ampm: 'AM',
    rows: [['BATTERY', t < K.time ? '27%' : '26%'],
      ['ROOM', t >= K.left ? '13 · LEFT' : '13 · ALONE', t >= K.left ? blink(K.left) : C.red],
      ['HEADCOUNT', '43', C.red],
      r4],
  };
}

const shots = [];
const shot = (name, start, draw, meta) => shots.push({ name, start, draw, meta });
const hudShade = (ctx, a = 0.85) => { const g = ctx.createRadialGradient(170, 250, 60, 170, 250, 560); g.addColorStop(0, `rgba(2,3,8,${a})`); g.addColorStop(1, 'rgba(2,3,8,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 760, 820); };
const capShade = (ctx, a = 0.72) => { const g = ctx.createLinearGradient(0, 1250, 0, 1720); g.addColorStop(0, 'rgba(2,3,8,0)'); g.addColorStop(0.35, `rgba(2,3,8,${a})`); g.addColorStop(0.75, `rgba(2,3,8,${a})`); g.addColorStop(1, 'rgba(2,3,8,0)'); ctx.fillStyle = g; ctx.fillRect(0, 1250, W, 470); };
const redPulse = (ctx, a) => { if (a < 0.01) return; const g = ctx.createRadialGradient(540, 960, 300, 540, 960, 1200); g.addColorStop(0, 'rgba(255,40,60,0)'); g.addColorStop(1, `rgba(255,40,60,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
const flash = (ctx, t, t0, a = 0.8) => { if (t < t0 || t > t0 + 0.4) return; ctx.fillStyle = `rgba(235,240,255,${a * (1 - (t - t0) / 0.4)})`; ctx.fillRect(0, 0, W, H); };
const ME = { x: 560, y: 1690, s: 1.35 };

// 1. HOOK (frame 1): the feet in the red gap, the handle already turning
shot('hook', 0, (ctx, t, lt) => {
  const z = lerp(1.25, 1.12, E.out(clamp(t / 3.3)));
  const [sx, sy] = shake(t, 0, 10, 0.5);
  const h = -0.38 - 0.08 * Math.sin(t * 7);
  ctx.save(); camera(ctx, 560, 900, z, sx, sy);
  X.drawDoorGap(ctx, t, { feet: 1, toes: 1, red: 1, handle: h, light: 0.95 + 0.05 * noise1(t * 5) });
  ctx.restore();
  redPulse(ctx, 0.2 + 0.1 * Math.sin(t * 5));
}, { vignette: 0.75 });
// 2. And you just opened the door — your hand on the bolt
shot('opened', K.opened, (ctx, t, lt) => {
  const k = E.sine(clamp(lt / (K.bolt - K.opened)));
  ctx.save(); camera(ctx, lerp(760, 800, k), lerp(820, 860, k), lerp(1.7, 1.95, k));
  X.drawDoorway(ctx, t, { open: 0, bolt: 1, dark: 0.15 });
  ctx.restore();
});
// 3. The bolt slides. The door swings in.
shot('bolt', K.bolt, (ctx, t, lt) => {
  const b = 1 - E.inOut(inv(K.slides - 0.05, K.slides + 0.35, t));
  const op = E.inOut(inv(K.swings - 0.1, K.nobody + 0.3, t));
  const z = lerp(1.6, 1.0, E.inOut(inv(K.slides + 0.3, K.swings + 0.4, t)));
  const cx = lerp(780, 540, E.inOut(inv(K.slides + 0.3, K.swings + 0.4, t)));
  ctx.save(); camera(ctx, cx, lerp(860, 900, 1 - z + 1), z);
  X.drawDoorway(ctx, t, { open: op, bolt: b, dark: 0.1 });
  ctx.restore();
});
// 4. Nobody. — you in the open doorway, from behind
shot('nobody', K.nobody, (ctx, t, lt) => {
  const op = E.out(clamp(0.75 + lt / 1.2));
  ctx.save(); camera(ctx, 540, 960, lerp(1.0, 1.06, clamp(lt / 1.4)));
  X.drawDoorway(ctx, t, { open: op, me: ME });
  ctx.restore();
}, { vignette: 0.7 });
// 5. The corridor is empty. Every tube light dead. Every door shut.
shot('corridor', K.corridor, (ctx, t, lt) => {
  const k = E.sine(clamp(lt / (K.nofoot - K.corridor)));
  const dz = 0.05 * (t > K.dead ? Math.exp(-(t - K.dead) * 5) : 0);
  ctx.save(); camera(ctx, 540, 900, lerp(1.05, 1.22, k) + dz);
  X.drawHostelCorridor(ctx, t, { lights: [0, 0, 0, 0, 0], moon: 0.95 });
  ctx.restore();
});
// 6. No footsteps. No breathing. Nothing. — deeper into the dark end
shot('nofoot', K.nofoot, (ctx, t, lt) => {
  const k = E.sine(clamp(lt / (K.gone - K.nofoot)));
  ctx.save(); camera(ctx, 540, 860, lerp(1.6, 2.1, k));
  X.drawHostelCorridor(ctx, t, { lights: [0, 0, 0, 0, 0], moon: 0.8 });
  ctx.restore();
  if (t > K.nothing) { ctx.fillStyle = `rgba(1,2,6,${0.35 * clamp((t - K.nothing) / 0.6)})`; ctx.fillRect(0, 0, W, H); }
});
// 7. Whatever spoke a second ago is gone. — you, small in the doorway
shot('gone', K.gone, (ctx, t, lt) => {
  ctx.save(); camera(ctx, 540, 900, lerp(0.92, 0.98, clamp(lt / 2)));
  X.drawDoorway(ctx, t, { open: 1, me: ME, moon: 0.7 });
  ctx.restore();
});
// 8. Then you look down. — tilt to the threshold
shot('down', K.down, (ctx, t, lt) => {
  const k = E.inOut(inv(K.down + 0.1, K.downW + 0.4, t));
  ctx.save(); camera(ctx, 560, lerp(900, 1240, k), lerp(1.0, 1.5, k));
  X.drawDoorway(ctx, t, { open: 1, book: E.out(inv(K.downW, K.downW + 0.5, t)) });
  ctx.restore();
});
// 9. At your feet, lying open, is the register.
shot('feet', K.feet, (ctx, t, lt) => {
  const k = E.sine(clamp(lt / (K.pick - K.feet)));
  ctx.save(); camera(ctx, 560, lerp(1240, 1268, k), lerp(1.7, 2.6, k));
  X.drawDoorway(ctx, t, { open: 1, book: 1 });
  ctx.restore();
  if (t > K.regW) redPulse(ctx, 0.2 * Math.exp(-(t - K.regW) * 2.5));
}, { vignette: 0.75 });
// 10-15. The register (tomorrow's)
const REGY = i => 620 + i * 140;
const regCam = t => {
  if (t < K.date) { const k = E.inOut(inv(K.pick, K.wrong, t)); return [lerp(560, 640, k), lerp(900, 480, k), lerp(1.05, 1.5, k)]; }
  if (t < K.room13) { const k = E.inOut(inv(K.date, K.tomorrow, t)); return [lerp(640, 820, k), lerp(480, 420, k), lerp(1.5, 2.3, k)]; }
  if (t < K.mark) { const k = E.inOut(inv(K.room13, K.room13 + 1.0, t)); return [lerp(820, 470, k), lerp(420, REGY(5) - 40, k), lerp(2.3, 1.75, k)]; }
  if (t < K.notAbs) { const k = E.inOut(inv(K.mark, K.left - 0.3, t)); return [lerp(470, 860, k), REGY(5) - 40, lerp(1.75, 2.4, k)]; }
  const k = E.sine(inv(K.notAbs, K.slam, t)); return [lerp(860, 700, k), REGY(5) - 40, lerp(2.4, 1.6, k)];
};
shot('register', K.pick, (ctx, t, lt) => {
  const [cx, cy, z] = regCam(t);
  const [sx, sy] = shake(t, K.left, 22, 0.5);
  const [sx2, sy2] = shake(t, K.tomorrow, 12, 0.35);
  ctx.save(); camera(ctx, cx, cy, z, sx + sx2, sy + sy2);
  X.drawRegister(ctx, t, { write: 1, date: '14 / 11', lx: cx, ly: cy, dateHL: inv(K.tomorrow - 0.1, K.tomorrow + 0.5, t), mark: inv(K.left, K.left + 0.18, t) });
  ctx.restore();
  hudShade(ctx, 0.9);
  if (t > K.tomorrow) redPulse(ctx, 0.25 * Math.exp(-(t - K.tomorrow) * 2.4));
  if (t > K.red) redPulse(ctx, 0.2 * Math.exp(-(t - K.red) * 2.4));
  if (t > K.left) redPulse(ctx, 0.4 * Math.exp(-(t - K.left) * 1.6));
  if (t > K.left2) redPulse(ctx, 0.25 * Math.exp(-(t - K.left2) * 2));
});
// 16. You slam the door. Bolt it. Back against it.
shot('slam', K.slam, (ctx, t, lt) => {
  const op = 1 - E.in(inv(K.slamW - 0.25, K.slamW + 0.05, t));
  const b = E.out(inv(K.boltW - 0.1, K.boltW + 0.2, t));
  const [sx, sy] = shake(t, K.slamW + 0.05, 26, 0.5);
  if (t < K.backW - 0.1) {
    ctx.save(); camera(ctx, 540, 900, 1.0, sx, sy);
    X.drawDoorway(ctx, t, { open: op, bolt: b });
    ctx.restore();
  } else {
    // in the room: you, back against the door, Kabir's bed empty
    const k = E.sine(clamp((t - K.backW) / 1.6));
    ctx.save(); camera(ctx, lerp(-330, -280, k), 1010, lerp(1.25, 1.35, k), sx, sy);
    X.drawRoom(ctx, t, { lamp: 0, dark: 0.35, kabir: { mode: 'none' }, gap: { gap: 0.4 }, me: { x: -470, y: 1340, s: 0.95, view: 'front', arm: 'down', fill: C.navy1 } });
    ctx.restore();
  }
});
// 17. One oh four. — the empty bed
shot('time', K.time, (ctx, t, lt) => {
  const k = E.sine(clamp(lt / (K.rule - K.time)));
  ctx.save(); camera(ctx, lerp(-50, -40, k), lerp(1150, 1190, k), lerp(1.45, 1.75, k));
  X.drawRoom(ctx, t, { lamp: 0, dark: 0.35, kabir: { mode: 'none' }, gap: { gap: 0.4 } });
  ctx.restore();
}, { vignette: 0.75 });
// 18. Rule three
shot('rule', K.rule, (ctx, t, lt) => {
  const y3 = R[2].y + 40;
  const z = lerp(1.25, 1.5, E.sine(clamp(lt / (K.buzz - K.rule)))) * 0.84;
  const [sx, sy] = shake(t, K.lookW, 22, 0.45);
  ctx.save(); camera(ctx, 556, y3 + 170 / z, z, sx, sy);
  X.drawList(ctx, t, { hl: 2, hlA: E.out(inv(K.rule + 0.1, K.rule + 0.7, t)), done: 2, tx: 520 + (noise1(t) - 0.5) * 40, ty: y3 + 60, tr: 600, dark: 0.9 });
  ctx.restore();
  capShade(ctx); hudShade(ctx);
  if (t > K.lookW) redPulse(ctx, 0.3 * Math.exp(-(t - K.lookW) * 2.5));
});
// 19-22. Phone: Kabir
const chatBG = (ctx, t) => {
  ctx.fillStyle = '#070a16'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.filter = 'blur(26px)'; ctx.globalAlpha = 0.8; camera(ctx, 300, 1000, 0.9); X.drawRoom(ctx, t, { lamp: 0, dark: 0.3, kabir: { mode: 'none' } }); ctx.restore();
  ctx.fillStyle = 'rgba(3,4,10,0.4)'; ctx.fillRect(0, 0, W, H);
};
shot('buzz', K.buzz, (ctx, t, lt) => {
  const b = t - K.buzzW; const buzzing = b > 0 && b < 0.35;
  const sh = buzzing ? (hash(Math.floor(t * 60)) - 0.5) * 0.02 : 0;
  S.drawPhone(ctx, t, { screen: 'lock', time: '1:05', date: 'Saturday, November 14', bg: chatBG, scale: lerp(1.1, 1.2, E.sine(clamp(lt / 2))) + sh,
    notifs: [{ a: (t - K.buzzW + 0.05) / 0.3, title: 'Kabir', lines: [{ text: 'bro where are you??' }], h: 150 }] });
});
const kMsgs = (t) => [
  { from: 'Kabir', col: '#9fe870', text: 'bro where are you? i\'m in the washroom since 12', a: (t - K.m1) / 0.25, time: '1:05 AM' },
  { from: 'Kabir', col: '#9fe870', text: 'don\'t open the door for anyone. it does voices.', a: (t - K.m2) / 0.25, time: '1:05 AM', fg: '#ff9aa5' },
];
shot('chat', K.m1 - 0.05, (ctx, t, lt) => {
  const z = t < K.since ? lerp(1.06, 1.16, E.sine(clamp(lt / (K.since - K.m1)))) : lerp(1.16, 1.5, E.inOut(clamp((t - K.since) / 0.9)));
  const [sx, sy] = shake(t, K.voicesW, 14, 0.4);
  X.drawGroupChat(ctx, t, { name: 'Kabir', initial: 'K', sub: 'online', scale: z, shake: [sx, sy], bg: chatBG, msgs: kMsgs(t) });
  if (t > K.since) {
    // "since 12" gets ringed in red
    const a = clamp((t - K.since) / 0.3);
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = C.red; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.ellipse(540, 960, 380, 200, -0.04, 0, Math.PI * 2 * clamp((t - K.since) / 0.6)); ctx.stroke(); ctx.restore();
    redPulse(ctx, 0.25 * Math.exp(-(t - K.since) * 2));
  }
});
// 23. So who was breathing under his blanket all night? — flashback, 12:40
shot('flash', K.flash, (ctx, t, lt) => {
  const k = E.sine(clamp(lt / (K.under - K.flash)));
  ctx.save(); camera(ctx, lerp(-60, -45, k), lerp(1170, 1160, k), lerp(1.9, 2.3, k));
  X.drawRoom(ctx, t, { lamp: 0, dark: 0.3, kabir: { mode: 'lump', breath: 1 }, gap: { gap: 1, feet: 1 } });
  ctx.restore();
  // memory grade: cold, grainy, framed
  ctx.fillStyle = 'rgba(120,20,30,0.18)'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 60; i++) ctx.fillRect(hash(i + Math.floor(t * 24) * 3.7) * W, hash(i * 2.3 + Math.floor(t * 24)) * H, 2, 2);
  ctx.save(); ctx.font = '30px Mono700'; ctx.fillStyle = 'rgba(255,90,100,0.85)'; ctx.textAlign = 'right';
  spaced(ctx, '● 12:40 AM · EARLIER', 1020, 1180, 4, 'right'); ctx.restore();
  flash(ctx, t, K.flash, 0.6);
  if (t > K.breathingW) redPulse(ctx, 0.25 * Math.exp(-(t - K.breathingW) * 2));
}, { vignette: 0.8 });
// 24. Then, from under his bed, a breath. — low, at the floor
shot('under', K.under, (ctx, t, lt) => {
  const k = E.sine(clamp(lt / (K.slow - K.under)));
  ctx.save(); camera(ctx, 540, lerp(940, 980, k), lerp(1.0, 1.15, k));
  X.drawUnderBed(ctx, t, { breath: t > K.breathW ? 1 : 0.2 });
  ctx.restore();
  flash(ctx, t, K.under, 0.5);
}, { vignette: 0.8 });
// 25. Slow. Too slow. — closer to the black
shot('slow', K.slow, (ctx, t, lt) => {
  const k = E.sine(clamp(lt / (K.whisper - K.slow)));
  ctx.save(); camera(ctx, 540, lerp(900, 880, k), lerp(1.3, 1.65, k));
  X.drawUnderBed(ctx, t, { breath: 1.4 });
  ctx.restore();
  if (t > K.tooSlow) redPulse(ctx, 0.18 * Math.exp(-(t - K.tooSlow) * 2));
}, { vignette: 0.85 });
// 26. And a whisper, in Kabir's voice — voice match
shot('whisper', K.whisper, (ctx, t, lt) => {
  ctx.save(); camera(ctx, 540, 900, 1.2);
  X.drawUnderBed(ctx, t, { breath: 1 });
  ctx.restore();
  ctx.fillStyle = 'rgba(2,3,8,0.55)'; ctx.fillRect(0, 0, W, H);
  const a = clamp(lt / 0.4);
  ctx.save(); ctx.globalAlpha = a * 0.9; ctx.strokeStyle = t > K.kvoice ? C.red : 'rgba(220,232,255,0.85)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  for (let i = 0; i < 44; i++) {
    const x = 160 + i * 18; const amp = (0.2 + noise1(i * 0.7 + t * 7) * 0.7) * 90 * (0.5 + 0.5 * Math.sin(i / 43 * Math.PI));
    ctx.beginPath(); ctx.moveTo(x, 860 - amp); ctx.lineTo(x, 860 + amp); ctx.stroke();
  }
  ctx.font = '26px Mono700'; ctx.fillStyle = 'rgba(238,241,247,0.75)';
  spaced(ctx, t > K.kvoice ? 'VOICE MATCH · KABIR · 100%' : 'MATCHING VOICE…', 540, 1040, 4, 'center');
  ctx.restore();
  if (t > K.kvoice) redPulse(ctx, 0.25 * Math.exp(-(t - K.kvoice) * 2));
});
// 27. Don't look. Just come closer. — the fingers slide out
shot('closer', K.closer, (ctx, t, lt) => {
  const h = E.inOut(inv(K.closer + 0.2, K.comeW + 0.6, t));
  const k = E.sine(clamp(lt / (K.choice - K.closer)));
  const [sx, sy] = shake(t, K.comeW, 14, 0.4);
  ctx.save(); camera(ctx, 560, lerp(1000, 1080, k), lerp(1.2, 1.45, k), sx, sy);
  X.drawUnderBed(ctx, t, { breath: 1, hand: h });
  ctx.restore();
  if (t > K.comeW) redPulse(ctx, 0.3 * Math.exp(-(t - K.comeW) * 2));
}, { vignette: 0.8 });
// 28-31. Choice card (spoken: "A. Look under the bed. B. Get out of the room. Comment A or B.")
let choiceBG = null;
shot('choice', K.choice, (ctx, t, lt) => {
  if (!choiceBG) {
    const c2 = createCanvas(W, H); const x2 = c2.getContext('2d');
    shots.find(s => s.name === 'closer').draw(x2, K.choice - 0.05, K.choice - 0.05 - K.closer);
    choiceBG = c2;
  }
  ctx.save(); ctx.filter = `blur(${(9 * clamp(lt / 0.4)).toFixed(1)}px)`; ctx.drawImage(choiceBG, 0, 0); ctx.restore();
  ctx.fillStyle = `rgba(3,5,12,${0.72 * clamp(lt / 0.35)})`; ctx.fillRect(0, 0, W, H);
  const q = ['WHAT', 'DO', 'YOU', 'DO?'];
  ctx.save(); ctx.font = '124px Osw700'; ctx.textBaseline = 'middle';
  const sp = 30; const ws = q.map(w => ctx.measureText(w).width); const tot = ws.reduce((a, b) => a + b, 0) + sp * 3;
  let x = 540 - tot / 2;
  q.forEach((w, i) => {
    const a = clamp((t - Wd(28, i) + 0.03) / 0.12);
    if (a > 0) { ctx.save(); ctx.globalAlpha = a; const s = lerp(1.3, 1, E.outBack(a)); ctx.translate(x + ws[i] / 2, 720); ctx.scale(s, s); ctx.fillStyle = C.white; ctx.textAlign = 'center'; ctx.fillText(w, 0, 0); ctx.restore(); }
    x += ws[i] + sp;
  });
  ctx.restore();
  const opt = (letter, label, y, ta, tEnd, sub) => {
    const a = E.out(clamp((t - ta + 0.05) / 0.3)); if (a <= 0) return;
    const live = t >= ta - 0.05 && t < tEnd; // being read out loud right now
    ctx.save(); ctx.globalAlpha = a; ctx.translate(lerp(-60, 0, a), 0);
    const s = live ? 1.04 : 1; ctx.translate(540, y); ctx.scale(s, s); ctx.translate(-540, -y);
    rrect(ctx, 130, y - 70, 820, 140, 26); ctx.fillStyle = live ? 'rgba(30,40,24,0.9)' : 'rgba(18,24,48,0.85)'; ctx.fill();
    ctx.lineWidth = live ? 6 : 3; ctx.strokeStyle = live ? C.lime : 'rgba(238,241,247,0.75)'; ctx.stroke();
    ctx.beginPath(); ctx.arc(214, y, 44, 0, 7); ctx.fillStyle = live ? C.lime : C.white; ctx.fill();
    ctx.font = '58px Osw700'; ctx.fillStyle = '#0b1022'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(letter, 214, y + 2);
    ctx.textAlign = 'left'; ctx.fillStyle = C.white; ctx.font = '60px Osw700'; ctx.fillText(label, 286, y - 4);
    ctx.font = '23px Mono500'; ctx.fillStyle = 'rgba(238,241,247,0.55)'; spaced(ctx, sub, 288, y + 40, 1.5);
    ctx.restore();
  };
  opt('A', 'LOOK UNDER THE BED', 960, K.optA, K.optB - 0.1, 'RULE 3 SAYS NEVER');
  opt('B', 'GET OUT OF THE ROOM', 1150, K.optB, K.cta - 0.1, 'IT IS STILL IN THE CORRIDOR');
  const ca = clamp((t - K.cta + 0.05) / 0.2);
  if (ca > 0) {
    ctx.save(); ctx.globalAlpha = ca; ctx.textBaseline = 'middle'; ctx.font = '80px Osw700';
    const pa = t > K.ctaA ? Math.exp(-(t - K.ctaA) * 5) : 0, pb = t > K.ctaB ? Math.exp(-(t - K.ctaB) * 5) : 0;
    const parts = [['COMMENT ', C.white, 0], ['A', C.lime, pa], [' OR ', C.white, 0], ['B', C.lime, pb]];
    const tw = parts.reduce((s, [p]) => s + ctx.measureText(p).width, 0);
    let xx = 540 - tw / 2;
    for (const [p, c, pop] of parts) {
      const w = ctx.measureText(p).width;
      ctx.save(); ctx.translate(xx + w / 2, 1350); ctx.scale(1 + 0.35 * pop, 1 + 0.35 * pop); ctx.fillStyle = c; ctx.textAlign = 'center'; ctx.fillText(p, 0, 0); ctx.restore();
      xx += w;
    }
    // arrow pointing down to the comment box, bobbing
    const by = 1440 + Math.sin(t * 6) * 10;
    ctx.strokeStyle = C.lime; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(540, by); ctx.lineTo(540, by + 60); ctx.moveTo(510, by + 32); ctx.lineTo(540, by + 62); ctx.lineTo(570, by + 32); ctx.stroke();
    ctx.font = '24px Mono500'; ctx.fillStyle = 'rgba(238,241,247,0.55)'; ctx.textAlign = 'center';
    spaced(ctx, 'MOST VOTES DECIDE PART 4 · TOMORROW 3 PM', 540, 1580, 3, 'center');
    ctx.restore();
  }
}, { captions: false, vignette: 0.4 });

// ---------- overlay: burned-in hook (frame 1) + recap stamp ----------
function overlay(ctx, t) {
  const ha = t < 3.0 ? 1 : clamp(1 - (t - 3.0) / 0.35);
  if (ha > 0) {
    ctx.save(); ctx.globalAlpha = ha; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = 24;
    ctx.font = '26px Mono700'; ctx.fillStyle = 'rgba(238,241,247,0.75)'; spaced(ctx, 'MY HOSTEL DOOR · 12:58 AM', 540, 600, 6, 'center');
    ctx.font = '118px Osw700'; ctx.fillStyle = C.white; ctx.fillText('IT TALKS IN', 540, 735);
    ctx.fillStyle = C.red; ctx.fillText('MY VOICE', 540, 860);
    ctx.restore();
  }
  const r0 = K.openedW - 0.1, r1 = K.swings + 0.2;
  if (t > r0 && t < r1 + 0.3) {
    const a = clamp((t - r0) / 0.18) * clamp((r1 + 0.3 - t) / 0.3);
    const s = lerp(1.4, 1, E.outBack(clamp((t - r0) / 0.3)));
    ctx.save(); ctx.globalAlpha = a; ctx.translate(540, 520); ctx.rotate(-0.06); ctx.scale(s, s);
    rrect(ctx, -260, -70, 520, 140, 18); ctx.fillStyle = 'rgba(8,12,26,0.82)'; ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = C.lime; ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.lime;
    ctx.font = '70px Osw700'; ctx.fillText('YOU CHOSE A', 0, -8);
    ctx.font = '22px Mono700'; ctx.fillStyle = 'rgba(238,241,247,0.8)'; spaced(ctx, 'YOU OPENED THE DOOR', 0, 46, 3, 'center');
    ctx.restore();
  }
}

shots.sort((a, b) => a.start - b.start);
return { shots, K, hudState, overlay, coverTitle: 'DON\'T [LOOK]', coverSize: 112 };
};
