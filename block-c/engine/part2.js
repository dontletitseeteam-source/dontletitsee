// BLOCK C — Part 2 "Present" shot list (branch A: you answered)
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
  answered: Ln(2).start - 0.06, answeredW: Wd(2, 2), present: Wd(3, 0),
  word: Ln(4).start - 0.06, stopIt: Wd(4, 8),
  pages: Ln(5).start - 0.06, pagesStop: Wd(5, 5),
  pen: Ln(6).start - 0.06, slow: Wd(6, 3), spell: Wd(6, 9),
  walk: Ln(7).start - 0.06, walkW: Wd(7, 3),
  n14: Wd(8, 0) - 0.04, n15: Wd(8, 1) - 0.04, n16: Wd(8, 2) - 0.04, nothing: Wd(8, 4),
  kabir: Ln(9).start - 0.06, whisper: Ln(10).start - 0.06, blanket: Ln(11).start - 0.06, tooSlow: Wd(11, 6),
  lock: Ln(12).start - 0.08, pings: Wd(12, 4),
  chat: Ln(13).start - 0.1, m2: Ln(14).start - 0.02, m3: Ln(15).start + 0.4,
  register: Wd(15, 5) - 0.06, every: Ln(16).start, except: Ln(17).start, room13: Wd(17, 2), red: Wd(17, 5),
  yourName: Ln(18).start - 0.04,
  chat2: Ln(19).start - 0.08, m4: Wd(19, 2) - 0.05, voiceW: Wd(19, 7), m5: Ln(20).start - 0.05,
  door: Ln(21).start - 0.06, knockW: Wd(22, 1),
  knuckles: Ln(24).start - 0.06,
  rule: Ln(25).start - 0.06, notW: Wd(26, 5),
  speaks: Ln(27).start - 0.06, voice: Ln(28).start - 0.06, voiceW2: Wd(28, 2),
  breath: Ln(29).start - 0.06, exactly: Wd(29, 4),
  hey: Ln(30).start - 0.06, openUp: Wd(30, 3),
  behind: Ln(31).start - 0.06, creaks: Wd(31, 4),
  flat: Ln(32).start - 0.06, flatW: Wd(32, 3), empty: Wd(32, 7),
  choice: Ln(33).start - 0.08,
};
const kb0 = Ln(22).end + 0.18;
K.knocks = [kb0, kb0 + 0.34, kb0 + 0.68].map(x => +x.toFixed(3));
K.footsteps = [];
for (let tt = K.walkW - 0.05; tt < K.nothing - 0.2; tt += 0.95) K.footsteps.push(+tt.toFixed(3));

// ---------- HUD ----------
function hudState(t) {
  const time = t < K.word ? '12:07' : t < K.lock ? '12:09' : t < K.door ? '12:40' : '12:58';
  const lost = t >= K.voiceW;
  const blink = (t0) => t < t0 + 0.6 ? (Math.floor(t * 12) % 2 ? C.red : C.white) : C.red;
  const alone = t >= K.empty;
  return {
    t, part: 'PART 2', time, ampm: 'AM',
    rows: [['BATTERY', t < K.lock ? '30%' : t < K.door ? '28%' : '27%'],
      ['ROOM', alone ? '13 · ALONE' : '13 · BLOCK C', alone ? blink(K.empty) : undefined],
      ['HEADCOUNT', '43', C.red],
      ['VOICE', lost ? 'NOT YOURS' : 'YOURS', lost ? blink(K.voiceW) : undefined]],
  };
}

const shots = [];
const shot = (name, start, draw, meta) => shots.push({ name, start, draw, meta });
const hudShade = (ctx, a = 0.85) => { const g = ctx.createRadialGradient(170, 250, 60, 170, 250, 560); g.addColorStop(0, `rgba(2,3,8,${a})`); g.addColorStop(1, 'rgba(2,3,8,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 760, 820); };
const capShade = (ctx, a = 0.72) => { const g = ctx.createLinearGradient(0, 1250, 0, 1720); g.addColorStop(0, 'rgba(2,3,8,0)'); g.addColorStop(0.35, `rgba(2,3,8,${a})`); g.addColorStop(0.75, `rgba(2,3,8,${a})`); g.addColorStop(1, 'rgba(2,3,8,0)'); ctx.fillStyle = g; ctx.fillRect(0, 1250, W, 470); };
const redPulse = (ctx, a) => { if (a < 0.01) return; const g = ctx.createRadialGradient(540, 960, 300, 540, 960, 1200); g.addColorStop(0, 'rgba(255,40,60,0)'); g.addColorStop(1, `rgba(255,40,60,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
const flash = (ctx, t, t0, a = 0.8) => { if (t < t0 || t > t0 + 0.4) return; ctx.fillStyle = `rgba(235,240,255,${a * (1 - (t - t0) / 0.4)})`; ctx.fillRect(0, 0, W, H); };

// 1. HOOK (frame 1): the red light under your door, two feet facing in
shot('hook', 0, (ctx, t, lt) => {
  const z = lerp(1.62, 1.42, E.out(clamp(t / 3.2)));
  const [sx, sy] = shake(t, 0, 10, 0.5);
  ctx.save(); camera(ctx, 540, 1180, z, sx, sy);
  X.drawDoorGap(ctx, t, { feet: 1, red: 1, toes: 1, light: 0.95 + 0.05 * noise1(t * 5) });
  ctx.restore();
  redPulse(ctx, 0.22 + 0.1 * Math.sin(t * 5));
}, { vignette: 0.75 });
// 2. "And you answered." — you, sitting up in bed in the dark
shot('answered', K.answered, (ctx, t, lt) => {
  const k = E.sine(clamp(lt / (K.word - K.answered)));
  const [sx, sy] = shake(t, K.present, 12, 0.35);
  ctx.save(); camera(ctx, lerp(1300, 1345, k), lerp(1080, 1050, k), lerp(1.55, 1.95, k), sx, sy);
  X.drawRoom(ctx, t, { lamp: 0, dark: 0.42, kabir: { mode: 'lump' }, gap: { gap: 1, feet: 1, red: 0.7 }, meBed: { headDX: -10, rim: 0.7 } });
  ctx.restore();
  if (t > K.present) redPulse(ctx, 0.3 * Math.exp(-(t - K.present) * 2.2));
});
// 3. The word leaves your mouth — push in on you
shot('word', K.word, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.pages - K.word)));
  const [sx, sy] = shake(t, K.stopIt, 14, 0.4);
  ctx.save(); camera(ctx, 1352, lerp(1060, 1010, k), lerp(2.2, 3.0, k), sx, sy);
  X.drawRoom(ctx, t, { lamp: 0, dark: 0.45, kabir: { mode: 'lump' }, gap: { gap: 1, feet: 1, red: 0.5 }, meBed: { headDX: -14, rim: 0.8 } });
  ctx.restore();
});
// 4. Behind the door the pages stop
shot('pages', K.pages, (ctx, t, lt) => {
  let page = 0; for (const p0 of [K.pages + 0.1, K.pages + 0.65, K.pages + 1.15]) if (t > p0 && t < p0 + 0.42 && p0 < K.pagesStop) page = (t - p0) / 0.42;
  const red = lerp(0.6, 0.1, clamp(lt / 1.6));
  ctx.save(); camera(ctx, 540, 1180, lerp(1.3, 1.45, E.sine(clamp(lt / 2))));
  X.drawDoorGap(ctx, t, { feet: 1, red, page, light: 0.9 });
  ctx.restore();
});
// 5. A pen scratches — the red row is written, slowly
shot('pen', K.pen, (ctx, t, lt) => {
  const w = inv(K.pen + 0.2, K.spell + 0.4, t);
  const yRow = 1320;
  ctx.save(); camera(ctx, lerp(440, 560, w), yRow - 130, lerp(1.85, 1.7, clamp(lt / 4)));
  X.drawRegister(ctx, t, { write: w, date: '13 / 11', lx: lerp(300, 800, w), ly: yRow });
  ctx.restore();
  hudShade(ctx, 0.9);
});
// 6. Then the feet walk on
shot('walk', K.walk, (ctx, t, lt) => {
  const f = 1 - E.inOut(inv(K.walkW, K.walkW + 1.3, t));
  ctx.save(); camera(ctx, 540, 1180, 1.42);
  X.drawDoorGap(ctx, t, { feet: Math.max(0.001, f), light: 0.9 });
  ctx.restore();
});
// 7. 14. 15. 16. Then nothing — the warden recedes into the dark corridor
const NPOS = [[K.n14, 2.0, 230], [K.n15, 3.3, -200], [K.n16, 5.0, 180]];
shot('corridor', K.n14, (ctx, t, lt) => {
  let w = NPOS[0]; for (const p0 of NPOS) if (t >= p0[0]) w = p0;
  const gone = t >= K.nothing;
  const punch = 0.06 * Math.exp(-(t - w[0]) * 6);
  ctx.save(); camera(ctx, 540, 900, 1.12 + punch + 0.04 * clamp(lt / 4));
  X.drawHostelCorridor(ctx, t, { lights: [0, 0, 0, 0, 0], moon: gone ? 0.5 : 1,
    warden: gone ? undefined : { d: w[1] + (t - w[0]) * 0.25, X: w[2], walk: (t - w[0]) * 3.2, rim: 0.7, book: 1 } });
  ctx.restore();
  if (gone) { ctx.fillStyle = `rgba(1,2,6,${0.4 * clamp((t - K.nothing) / 0.6)})`; ctx.fillRect(0, 0, W, H); }
});
// 8. Kabir hasn't moved
shot('kabir', K.kabir, (ctx, t, lt) => {
  ctx.save(); camera(ctx, lerp(-60, -30, clamp(lt / 2)), 1130, lerp(1.25, 1.4, E.sine(clamp(lt / 2.2))));
  X.drawRoom(ctx, t, { lamp: 0, dark: 0.32, kabir: { mode: 'lump' }, gap: { gap: 1 } });
  ctx.restore();
});
// 9. You whisper his name — you lean toward his bed
shot('whisper', K.whisper, (ctx, t, lt) => {
  const lean = E.out(clamp(lt / 0.8));
  ctx.save(); camera(ctx, 1320, 1090, lerp(1.9, 2.05, clamp(lt / 1.4)));
  X.drawRoom(ctx, t, { lamp: 0, dark: 0.42, kabir: { mode: 'lump' }, gap: { gap: 1 }, meBed: { headDX: -26 * lean, rim: 0.6 } });
  ctx.restore();
});
// 10. Just the blanket. Rising. Falling. Too slow.
shot('blanket', K.blanket, (ctx, t, lt) => {
  const k = E.sine(clamp(lt / (K.lock - K.blanket)));
  ctx.save(); camera(ctx, lerp(-60, -40, k), lerp(1180, 1160, k), lerp(1.7, 2.2, k));
  X.drawRoom(ctx, t, { lamp: 0, dark: 0.3, kabir: { mode: 'lump', breath: 1 }, gap: { gap: 1 } });
  ctx.restore();
  if (t > K.tooSlow) redPulse(ctx, 0.18 * Math.exp(-(t - K.tooSlow) * 2));
}, { vignette: 0.75 });
// 11. 12:40 — the group pings
const chatBG = (ctx, t) => {
  ctx.fillStyle = '#070a16'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.filter = 'blur(26px)'; ctx.globalAlpha = 0.8; camera(ctx, 300, 1000, 0.9); X.drawRoom(ctx, t, { lamp: 0, dark: 0.3, kabir: { mode: 'lump' } }); ctx.restore();
  ctx.fillStyle = 'rgba(3,4,10,0.4)'; ctx.fillRect(0, 0, W, H);
};
shot('lock', K.lock, (ctx, t, lt) => {
  const b = t - K.pings; const buzzing = b > 0 && b < 0.3;
  const sh = buzzing ? (hash(Math.floor(t * 60)) - 0.5) * 0.02 : 0;
  S.drawPhone(ctx, t, { screen: 'lock', time: '12:40', date: 'Friday, November 13', bg: chatBG, scale: lerp(1.1, 1.2, E.sine(clamp(lt / 2))) + sh,
    notifs: [{ a: (t - K.pings + 0.05) / 0.3, title: 'BLOCK C', lines: [{ text: 'Dev: who answered in 13?' }], h: 150 }] });
});
const chatMsgs = (t) => [
  { from: 'Dev', col: '#ffb36b', text: 'who answered in 13?', a: (t - K.chat - 0.1) / 0.25, time: '12:40 AM' },
  { from: 'Arjun', text: 'new guys always answer.', a: (t - K.m2) / 0.25, time: '12:40 AM' },
  { from: 'Dev', col: '#ffb36b', text: '📷 Photo · tonight\'s register', a: (t - K.m3) / 0.25, time: '12:41 AM', fg: '#c9d2ea' },
];
shot('chat', K.chat, (ctx, t, lt) => {
  const z = lerp(1.06, 1.18, E.sine(clamp(lt / (K.register - K.chat))));
  X.drawGroupChat(ctx, t, { scale: z, bg: chatBG, sub: '43 members · muted', msgs: chatMsgs(t) });
});
// 12. The photo: tonight's register — blue marks, one row in red
const REGY = i => 620 + i * 140;
const regCam = t => {
  if (t < K.except) { const k = E.inOut(inv(K.every - 0.2, K.except, t)); return [lerp(560, 600, k), lerp(REGY(0) + 40, REGY(4), k), lerp(1.25, 1.45, k)]; }
  if (t < K.yourName) { const k = E.inOut(inv(K.except, K.room13 + 0.3, t)); return [lerp(600, 520, k), lerp(REGY(4), REGY(5) - 120, k), lerp(1.45, 1.8, k)]; }
  const k = E.sine(inv(K.yourName, K.chat2, t)); return [lerp(520, 540, k), REGY(5) - 120, lerp(1.8, 2.05, k)];
};
shot('register', K.register, (ctx, t, lt) => {
  const [cx, cy, z] = regCam(t);
  const [sx, sy] = shake(t, K.red, 14, 0.4);
  ctx.save(); camera(ctx, cx, cy, z, sx, sy);
  X.drawRegister(ctx, t, { write: 1, circle: inv(K.red - 0.05, K.red + 0.4, t), date: '13 / 11', lx: cx, ly: cy });
  ctx.restore();
  hudShade(ctx, 0.9);
  flash(ctx, t, K.register, 0.7);
  if (t > K.red) redPulse(ctx, 0.28 * Math.exp(-(t - K.red) * 2.4));
});
// 13. Dev types: red ink means it has your voice now
shot('chat2', K.chat2, (ctx, t, lt) => {
  const z = lerp(1.12, 1.24, E.sine(clamp(lt / (K.door - K.chat2))));
  const msgs = [chatMsgs(t)[2],
    { from: 'Dev', col: '#ffb36b', text: 'red ink means it has your voice now', a: (t - K.m4) / 0.25, time: '12:42 AM' },
    { from: 'Dev', col: '#ffb36b', text: 'don\'t talk tonight. not even in your sleep.', a: (t - K.m5) / 0.25, time: '12:42 AM', fg: '#ff9aa5' }];
  msgs[0].a = 1;
  X.drawGroupChat(ctx, t, { scale: z, bg: chatBG, sub: '43 members · muted', msgs });
  if (t > K.voiceW) redPulse(ctx, 0.2 * Math.exp(-(t - K.voiceW) * 2.5));
});
// 14. 12:58 — right at your door: three soft knocks
const knockAmt = t => K.knocks.reduce((a, k) => a + (t > k ? Math.exp(-(t - k) * 14) : 0), 0);
shot('door', K.door, (ctx, t, lt) => {
  const kn = knockAmt(t);
  const k = E.inOut(clamp(lt / (K.knuckles - K.door)));
  ctx.save(); camera(ctx, lerp(-420, -540, k) + kn * 6, lerp(1010, 1000, k), lerp(0.95, 1.35, k));
  X.drawRoom(ctx, t, { lamp: 0, dark: 0.45, kabir: { mode: 'lump' }, gap: { gap: 1, feet: 1 }, meBed: {} });
  ctx.restore();
  if (kn > 0.05) { ctx.fillStyle = `rgba(0,0,0,${0.2 * kn})`; ctx.fillRect(0, 0, W, H); }
});
// 15. Not a fist. Knuckles. Polite. — low on the door: feet in the gap
shot('knuckles', K.knuckles, (ctx, t, lt) => {
  ctx.save(); camera(ctx, 540, lerp(980, 1120, E.sine(clamp(lt / 2.5))), lerp(1.05, 1.25, E.sine(clamp(lt / 2.5))));
  X.drawDoorGap(ctx, t, { feet: 1, light: 0.9 });
  ctx.restore();
});
// 16. Rule two. The warden never knocks.
shot('rule', K.rule, (ctx, t, lt) => {
  const y2 = R[1].y + 40;
  const z = lerp(1.4, 1.75, E.sine(clamp(lt / (K.speaks - K.rule)))) * 0.84;
  const [sx, sy] = shake(t, K.notW, 22, 0.45);
  ctx.save(); camera(ctx, 556, y2 + 170 / z, z, sx, sy);
  X.drawList(ctx, t, { hl: 1, hlA: E.out(inv(K.rule + 0.1, K.rule + 0.7, t)), done: 1, tx: 520 + (noise1(t) - 0.5) * 40, ty: y2 + 40, tr: 560, dark: 0.9 });
  ctx.restore();
  capShade(ctx); hudShade(ctx);
  if (t > K.notW) redPulse(ctx, 0.3 * Math.exp(-(t - K.notW) * 2.5));
});
// 17. Then it speaks. Through the door. — the gap; the feet shift closer
shot('speaks', K.speaks, (ctx, t, lt) => {
  ctx.save(); camera(ctx, 540, 1170, lerp(1.35, 1.6, E.sine(clamp(lt / 2.2))));
  X.drawDoorGap(ctx, t, { feet: 1, toes: E.out(clamp(lt / 1.5)), light: 0.88 + 0.12 * noise1(t * 6) });
  ctx.restore();
});
// 18. In your voice. — you, frozen in bed
shot('voice', K.voice, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.voiceW2, 14, 0.4);
  ctx.save(); camera(ctx, 1350, 1040, 2.3 + 0.12 * clamp(lt / 1.6), sx, sy);
  X.drawRoom(ctx, t, { lamp: 0, dark: 0.45, kabir: { mode: 'lump' }, gap: { gap: 1, feet: 1 }, meBed: { headDX: -6, rim: 0.8 } });
  ctx.restore();
  if (t > K.voiceW2) redPulse(ctx, 0.3 * Math.exp(-(t - K.voiceW2) * 2));
});
// 19. Every breath. Every crack. Exactly you. — your own voice-wave on the door
shot('breath', K.breath, (ctx, t, lt) => {
  ctx.save(); camera(ctx, 540, 1060, 1.12 + 0.05 * clamp(lt / 3));
  X.drawDoorGap(ctx, t, { feet: 1, toes: 1, light: 0.9 });
  ctx.restore();
  // waveform (your voice, coming from the other side)
  const a = clamp(lt / 0.4);
  ctx.save(); ctx.globalAlpha = a * 0.9; ctx.strokeStyle = t > K.exactly ? C.red : 'rgba(220,232,255,0.85)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  for (let i = 0; i < 44; i++) {
    const x = 160 + i * 18; const amp = (0.25 + noise1(i * 0.7 + t * 9) * 0.9) * 120 * (0.5 + 0.5 * Math.sin(i / 43 * Math.PI));
    ctx.beginPath(); ctx.moveTo(x, 860 - amp); ctx.lineTo(x, 860 + amp); ctx.stroke();
  }
  ctx.font = '26px Mono700'; ctx.fillStyle = 'rgba(238,241,247,0.7)';
  spaced(ctx, t > K.exactly ? 'VOICE MATCH · 100%' : 'MATCHING VOICE…', 540, 1060, 4, 'center');
  ctx.restore();
});
// 20. Hey. It's me. Open up. I'm locked out. — the handle starts to turn
shot('hey', K.hey, (ctx, t, lt) => {
  const h = -0.45 * E.inOut(inv(K.openUp, K.openUp + 0.6, t)) * (1 + 0.15 * Math.sin(t * 30) * (t > K.openUp ? 1 : 0));
  const k = E.sine(clamp(lt / (K.behind - K.hey)));
  ctx.save(); camera(ctx, lerp(760, 820, k), lerp(640, 560, k), lerp(1.45, 1.9, k));
  X.drawDoorGap(ctx, t, { feet: 1, toes: 1, light: 0.9, handle: h });
  ctx.restore();
});
// 21. Behind you, Kabir's bed creaks. — whip to his bed
shot('behind', K.behind, (ctx, t, lt) => {
  const whip = 1 - E.out(clamp(lt / 0.35));
  ctx.save(); camera(ctx, lerp(-40, 300, whip), 1140, 1.4, 0, 0, whip * 0.05);
  if (whip > 0.2) ctx.filter = `blur(${(whip * 14).toFixed(1)}px)`;
  X.drawRoom(ctx, t, { lamp: 0, dark: 0.35, kabir: { mode: 'lump', shake: t > K.creaks && t < K.creaks + 0.4 ? 0.8 : 0 }, gap: { gap: 1, feet: 1 } });
  ctx.restore();
});
// 22. The blanket is flat. His bed is empty. — then the dark under it
shot('flat', K.flat, (ctx, t, lt) => {
  const isFlat = t >= K.flatW - 0.05;
  const k = E.inOut(inv(K.empty, K.choice, t));
  const [sx, sy] = shake(t, K.flatW, 18, 0.4);
  ctx.save(); camera(ctx, lerp(-40, -50, k), lerp(1150, 1270, k), lerp(1.45, 2.4, k), sx, sy);
  X.drawRoom(ctx, t, { lamp: 0, dark: 0.35, kabir: { mode: isFlat ? 'none' : 'lump' }, gap: { gap: 1, feet: 1 } });
  ctx.restore();
  if (t > K.flatW) redPulse(ctx, 0.3 * Math.exp(-(t - K.flatW) * 2.2));
}, { vignette: 0.75 });
// 23. Choice card
let choiceBG = null;
shot('choice', K.choice, (ctx, t, lt) => {
  if (!choiceBG) {
    const c2 = createCanvas(W, H); const x2 = c2.getContext('2d');
    shots.find(s => s.name === 'hey').draw(x2, K.behind - 0.05, K.behind - 0.05 - K.hey);
    choiceBG = c2;
  }
  ctx.save(); ctx.filter = `blur(${(10 * clamp(lt / 0.4)).toFixed(1)}px)`; ctx.drawImage(choiceBG, 0, 0); ctx.restore();
  ctx.fillStyle = `rgba(3,5,12,${0.74 * clamp(lt / 0.35)})`; ctx.fillRect(0, 0, W, H);
  const q = ['WHAT', 'DO', 'YOU', 'DO?'];
  ctx.save(); ctx.font = '124px Osw700'; ctx.textBaseline = 'middle';
  const sp = 30; const ws = q.map(w => ctx.measureText(w).width); const tot = ws.reduce((a, b) => a + b, 0) + sp * 3;
  let x = 540 - tot / 2;
  q.forEach((w, i) => {
    const a = clamp((t - Wd(33, i) + 0.03) / 0.12);
    if (a > 0) { ctx.save(); ctx.globalAlpha = a; const s = lerp(1.3, 1, E.outBack(a)); ctx.translate(x + ws[i] / 2, 720); ctx.scale(s, s); ctx.fillStyle = C.white; ctx.textAlign = 'center'; ctx.fillText(w, 0, 0); ctx.restore(); }
    x += ws[i] + sp;
  });
  ctx.restore();
  const opt = (letter, label, y, ta, sub) => {
    const a = E.out(clamp((t - ta) / 0.3)); if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(lerp(-60, 0, a), 0);
    rrect(ctx, 130, y - 70, 820, 140, 26); ctx.fillStyle = 'rgba(18,24,48,0.85)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(238,241,247,0.75)'; ctx.stroke();
    ctx.beginPath(); ctx.arc(214, y, 44, 0, 7); ctx.fillStyle = C.white; ctx.fill();
    ctx.font = '58px Osw700'; ctx.fillStyle = '#0b1022'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(letter, 214, y + 2);
    ctx.textAlign = 'left'; ctx.fillStyle = C.white; ctx.font = '62px Osw700'; ctx.fillText(label, 286, y - 4);
    ctx.font = '23px Mono500'; ctx.fillStyle = 'rgba(238,241,247,0.55)'; spaced(ctx, sub, 288, y + 40, 1.5);
    ctx.restore();
  };
  opt('A', 'OPEN THE DOOR', 960, Wd(33, 3) + 0.35, 'IT SOUNDS EXACTLY LIKE YOU');
  opt('B', 'LOOK UNDER THE GAP', 1150, Wd(33, 3) + 0.65, 'SEE WHAT IS STANDING THERE');
  const ca = clamp((t - (Wd(33, 3) + 1.15)) / 0.25);
  if (ca > 0) {
    ctx.save(); ctx.globalAlpha = ca; ctx.textBaseline = 'middle'; ctx.font = '76px Osw700';
    const parts = [['COMMENT ', C.white], ['A', C.lime], [' OR ', C.white], ['B', C.lime]];
    const tw = parts.reduce((s, [p]) => s + ctx.measureText(p).width, 0);
    let xx = 540 - tw / 2;
    for (const [p, c] of parts) { ctx.fillStyle = c; ctx.fillText(p, xx, 1345); xx += ctx.measureText(p).width; }
    ctx.font = '24px Mono500'; ctx.fillStyle = 'rgba(238,241,247,0.5)';
    spaced(ctx, 'PART 3 TOMORROW · FOLLOW', 540, 1420, 5, 'center');
    ctx.restore();
  }
}, { captions: false, vignette: 0.4 });

// ---------- overlay: burned-in hook (frame 1) + recap stamp ----------
function overlay(ctx, t) {
  // hook title, visible from the very first frame, gone by ~3.2 s
  const ha = t < 2.9 ? 1 : clamp(1 - (t - 2.9) / 0.35);
  if (ha > 0) {
    ctx.save(); ctx.globalAlpha = ha; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = 24;
    ctx.font = '26px Mono700'; ctx.fillStyle = 'rgba(238,241,247,0.75)'; spaced(ctx, 'MY HOSTEL · 12:07 AM', 540, 600, 6, 'center');
    ctx.font = '118px Osw700'; ctx.fillStyle = C.white; ctx.fillText('A DEAD WARDEN', 540, 735);
    ctx.fillStyle = C.red; ctx.fillText('KNOWS MY NAME', 540, 860);
    ctx.restore();
  }
  // recap: what you chose yesterday
  const r0 = K.answeredW - 0.1, r1 = K.word + 0.6;
  if (t > r0 && t < r1 + 0.3) {
    const a = clamp((t - r0) / 0.18) * clamp((r1 + 0.3 - t) / 0.3);
    const s = lerp(1.4, 1, E.outBack(clamp((t - r0) / 0.3)));
    ctx.save(); ctx.globalAlpha = a; ctx.translate(540, 700); ctx.rotate(-0.06); ctx.scale(s, s);
    rrect(ctx, -250, -70, 500, 140, 18); ctx.fillStyle = 'rgba(8,12,26,0.82)'; ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = C.lime; ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.lime;
    ctx.font = '70px Osw700'; ctx.fillText('YOU SAID A', 0, -8);
    ctx.font = '22px Mono700'; ctx.fillStyle = 'rgba(238,241,247,0.8)'; spaced(ctx, 'YOU ANSWERED "PRESENT"', 0, 46, 3, 'center');
    ctx.restore();
  }
}

shots.sort((a, b) => a.start - b.start);
return { shots, K, hudState, overlay, coverTitle: 'IT KNOWS MY [NAME]', coverSize: 92 };
};
