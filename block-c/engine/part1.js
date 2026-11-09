// BLOCK C — Part 1 "The List" shot list
const { createCanvas } = require('@napi-rs/canvas');
const D = require('./draw');
const S = require('./scenes');
const X = require('./sets');
const { W, H, C, clamp, lerp, inv, E, hash, noise1, flicker, shake, rrect, glow, spaced, camera } = D;

module.exports = function build(TL) {
const FPS = TL.fps, DUR = TL.duration;
const Ln = id => TL.lines[id - 1];
const Wd = (id, k) => Ln(id).words[k].start;
const R = X.listLayout();
const K = {
  room1: Wd(1, 6) - 0.05, push: Ln(2).start - 0.05, list: Ln(3).start - 0.05,
  r1: Ln(4).start, r2: Ln(5).start, r3: Ln(6).start, underbed: Wd(6, 9) - 0.04, r4: Ln(7).start - 0.06,
  r5: Ln(8).start, r6: Ln(10).start, tore: Wd(11, 4),
  kabir: Ln(12).start - 0.06, laugh: Wd(12, 2), sleep: Wd(12, 5) - 0.04,
  chat: Ln(13).start - 0.1, ping: Wd(13, 5), m3: Ln(14).start + 0.05, died: Wd(14, 5), m4: Ln(15).start,
  lock: Ln(16).start - 0.08, twelve: Wd(16, 3),
  corridor: Ln(17).start - 0.06, out: [Wd(17, 3), Wd(17, 4), Wd(17, 5), Wd(17, 6), Wd(17, 7) + 0.18],
  steps: Ln(18).start - 0.06, foot: [Wd(18, 0), Wd(18, 1), Wd(18, 2)],
  name: Ln(19).start - 0.06, present9: Wd(19, 7),
  ten: Wd(20, 0) - 0.04, eleven: Wd(20, 1) - 0.04, twelve2: Wd(20, 2) - 0.04, every: Wd(20, 3),
  blanket: Ln(21).start - 0.06, shaking: Wd(21, 7),
  stop: Ln(22).start - 0.06, stopW: Wd(22, 2), outside: Wd(22, 3),
  gap: Ln(23).start - 0.06, two: Wd(23, 3), feet: Wd(23, 5), pages: [Wd(24, 0), Wd(24, 1)],
  kabirCall: Ln(25).start - 0.06, present13: Wd(25, 6),
  yourName: Ln(26).start - 0.06, nameW: Wd(26, 3),
  register: Ln(27).start - 0.06, regW: Wd(27, 8),
  nobody: Ln(28).start - 0.06, itDoes: Ln(29).start - 0.06, does: Wd(29, 1),
  choice: Ln(30).start - 0.08,
};
K.footsteps = [];
// heavy footsteps for the mix: during the walk to door 9, and to door 13
for (let tt = K.steps + 0.1; tt < K.name - 0.3; tt += 0.95) K.footsteps.push(+tt.toFixed(3));
for (let tt = K.stop + 0.05; tt < K.stopW + 0.05; tt += 0.62) K.footsteps.push(+tt.toFixed(3));
K.footsteps.push(+(K.stopW + 0.02).toFixed(3));

// ---------- HUD ----------
function hudState(t) {
  const pm = t < K.chat;
  const time = t < K.chat ? '11:52' : t < K.lock ? '12:04' : t < K.steps ? '12:06' : '12:07';
  const hc43 = t >= Wd(26, 4);
  const blink = hc43 && t < Wd(26, 4) + 0.6 ? (Math.floor(t * 12) % 2 ? C.red : C.white) : (hc43 ? C.red : undefined);
  return {
    t, part: 'PART 1', time, ampm: pm ? 'PM' : 'AM',
    rows: [['BATTERY', t < K.steps ? '31%' : '30%'], ['ROOM', '13 · BLOCK C'], ['HEADCOUNT', hc43 ? '43' : '42', blink]],
  };
}

const shots = [];
const shot = (name, start, draw, meta) => shots.push({ name, start, draw, meta });
const hudShade = (ctx, a = 0.85) => { const g = ctx.createRadialGradient(170, 250, 60, 170, 250, 560); g.addColorStop(0, `rgba(2,3,8,${a})`); g.addColorStop(1, 'rgba(2,3,8,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 760, 820); };
const capShade = (ctx, a = 0.72) => { const g = ctx.createLinearGradient(0, 1250, 0, 1720); g.addColorStop(0, 'rgba(2,3,8,0)'); g.addColorStop(0.35, `rgba(2,3,8,${a})`); g.addColorStop(0.75, `rgba(2,3,8,${a})`); g.addColorStop(1, 'rgba(2,3,8,0)'); ctx.fillStyle = g; ctx.fillRect(0, 1250, W, 470); };
const redPulse = (ctx, a) => { if (a < 0.01) return; const g = ctx.createRadialGradient(540, 960, 300, 540, 960, 1200); g.addColorStop(0, 'rgba(255,40,60,0)'); g.addColorStop(1, `rgba(255,40,60,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };

// 1. Door plate: BLOCK C · 13 (hook)
shot('plate', 0, (ctx, t, lt) => {
  const z = lerp(1.35, 1.12, E.out(clamp(t / K.room1)));
  ctx.save(); camera(ctx, 540, 760, z); X.drawPlate(ctx, t); ctx.restore();
});
// 2. Room 13: you at the open wardrobe, torch on the list
const meAtWardrobe = (t, lift = 0) => ({ x: 470, y: 1590, s: 1.05, view: 'back', arm: 'phone', lit: 0.9, headDY: -lift * 8 });
shot('room1', K.room1, (ctx, t, lt) => {
  const k = E.sine(clamp(lt / (K.push - K.room1)));
  ctx.save(); camera(ctx, lerp(420, 470, k), lerp(1060, 1010, k), lerp(0.78, 0.86, k));
  X.drawRoom(ctx, t, { lamp: 0.85, kabir: { mode: 'sit', headDX: 0 }, me: meAtWardrobe(t), torch: { x: 700, y: 850, a: 0.9 + 0.1 * noise1(t * 4) } });
  ctx.restore();
});
// 3. Push into the paper taped inside the wardrobe door
shot('push', K.push, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.list - K.push)));
  ctx.save(); camera(ctx, lerp(560, 705, k), lerp(980, 840, k), lerp(1.0, 3.6, k));
  X.drawRoom(ctx, t, { lamp: 0.85, kabir: { mode: 'sit' }, me: meAtWardrobe(t), torch: { x: 700, y: 850, a: 1 } });
  ctx.restore();
});
// 4. The list: torch + camera move rule by rule
const ry = i => R[i].y + 40;
const camKeys = [ // [time, cy, z]
  [K.list, 520, 1.5], [K.r1 - 0.2, 520, 1.42], [K.r1 + 0.25, ry(0), 1.45], [K.r2 - 0.2, ry(0) + 20, 1.5],
  [K.r2 + 0.25, ry(1), 1.55], [K.r3 - 0.2, ry(1), 1.6], [K.r3 + 0.25, ry(2), 1.45], [K.underbed, ry(2) + 20, 1.55],
  [K.r4 + 0.01, ry(3), 1.45], [K.r5 - 0.2, ry(3) + 10, 1.5], [K.r5 + 0.25, ry(4), 1.45], [Ln(9).end, ry(4) + 30, 1.55],
  [K.r6 + 0.35, ry(5), 1.7], [K.tore - 0.05, ry(5), 1.85], [K.tore + 0.15, ry(5), 2.2], [K.kabir, ry(5), 2.3],
];
function listCam(t) {
  for (let i = 0; i < camKeys.length - 1; i++) {
    const [t0, y0, z0] = camKeys[i], [t1, y1, z1] = camKeys[i + 1];
    if (t <= t1) { const k = E.inOut(inv(t0, t1, t)); return [lerp(y0, y1, k), lerp(z0, z1, k)]; }
  }
  return camKeys[camKeys.length - 1].slice(1);
}
function ruleState(t) {
  const starts = [K.r1, K.r2, K.r3, K.r4, K.r5];
  let hl = -1; starts.forEach((s, i) => { if (t >= s - 0.05) hl = i; });
  if (t >= K.r6) hl = -1;
  return { hl, hlA: hl >= 0 ? E.out(inv(starts[hl], starts[hl] + 0.6, t)) : 0, done: hl >= 0 ? hl : (t >= K.r6 ? 5 : 0) };
}
shot('list', K.list, (ctx, t, lt) => {
  let [cy, z] = listCam(t); z *= 0.84;
  const [sx, sy] = shake(t, K.tore, 26, 0.5);
  const wob = [(noise1(t * 0.9) - 0.5) * 40, (noise1(t * 0.9 + 9) - 0.5) * 30];
  ctx.save(); camera(ctx, 556 + wob[0] * 0.3, cy + 170 / z, z, sx, sy, (noise1(t * 0.5) - 0.5) * 0.02);
  X.drawList(ctx, t, { ...ruleState(t), tx: 540 + wob[0], ty: cy + 40 + wob[1], tr: 700 / Math.sqrt(z), dark: 0.9 });
  ctx.restore();
  capShade(ctx); hudShade(ctx);
  if (t > K.tore) redPulse(ctx, 0.3 * Math.exp(-(t - K.tore) * 3));
});
// 4b. Insert: under Kabir's bed (rule 3)
shot('underbed', K.underbed, (ctx, t, lt) => {
  const z = lerp(3.0, 3.4, clamp(lt / 1.2));
  ctx.save(); camera(ctx, -60, 1268, z);
  X.drawRoom(ctx, t, { lamp: 0.2, dark: 0.35, kabir: { mode: 'lump', shake: 0 }, gap: { gap: 0.4 } });
  // fingertips curling over the frame edge from the dark
  const f = E.out(inv(K.underbed + 0.35, K.underbed + 1.0, t));
  if (f > 0) {
    ctx.strokeStyle = '#3a4469'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const x = -110 + i * 13; ctx.beginPath(); ctx.moveTo(x, 1300); ctx.quadraticCurveTo(x + 2, 1300 - 26 * f, x + 10, 1296 - 34 * f - (i === 1 || i === 2 ? 5 : 0) * f); ctx.stroke();
    }
  }
  ctx.restore();
}, { vignette: 0.8 });
shot('list_b', K.r4, (ctx, t, lt) => shots.find(s => s.name === 'list').draw(ctx, t, lt));
// 5. Kabir laughs it off; then the lamp goes off
shot('kabir', K.kabir, (ctx, t, lt) => {
  const laugh = clamp(inv(K.laugh, K.laugh + 0.15, t)) * (1 - inv(K.laugh + 1.2, K.laugh + 1.6, t));
  const k = E.sine(clamp(lt / (K.sleep - K.kabir)));
  ctx.save(); camera(ctx, lerp(-150, -110, k), lerp(1050, 1030, k), lerp(1.5, 1.62, k));
  X.drawRoom(ctx, t, { lamp: 0.85, kabir: { mode: 'sit', laugh }, torch: { x: 300, y: 1100, a: 0.25 } });
  ctx.restore();
});
shot('lamp_off', K.sleep, (ctx, t, lt) => {
  const off = t > K.sleep + 0.35;
  ctx.save(); camera(ctx, 380, 1060, 0.72);
  X.drawRoom(ctx, t, { lamp: off ? 0 : 0.85, dark: off ? 0.45 : 0, kabir: { mode: off ? 'lump' : 'sit' }, gap: { gap: 0.8 }, meBed: off ? { headDX: -10 } : undefined,
    me: off ? undefined : { x: 900, y: 1590, s: 1.05, view: 'back', arm: 'down' } });
  ctx.restore();
});
// 6. BLOCK C group pings
const chatBG = (ctx, t) => {
  ctx.fillStyle = '#070a16'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.filter = 'blur(26px)'; ctx.globalAlpha = 0.8; camera(ctx, 300, 1000, 0.9); X.drawRoom(ctx, t, { lamp: 0, dark: 0.3, kabir: { mode: 'lump' } }); ctx.restore();
  ctx.fillStyle = 'rgba(3,4,10,0.4)'; ctx.fillRect(0, 0, W, H);
};
shot('chat', K.chat, (ctx, t, lt) => {
  const b = t - K.ping; const buzzing = (b > 0 && b < 0.25) || (b > 0.4 && b < 0.62);
  const sh = buzzing ? [(hash(Math.floor(t * 60)) - 0.5) * 16, (hash(Math.floor(t * 60) + 5) - 0.5) * 10] : [0, 0];
  const z = lerp(1.06, 1.2, E.sine(clamp(lt / (K.lock - K.chat))));
  X.drawGroupChat(ctx, t, { scale: z, shake: sh, bg: chatBG, msgs: [
    { from: 'Arjun', text: 'new guy in 13 found the list yet?', a: (t - K.chat - 0.15) / 0.25, time: '11:58 PM' },
    { from: 'Rohan', col: '#8fe3b0', text: 'lol go to sleep', a: (t - K.ping) / 0.25, time: '12:03 AM' },
    { from: 'Dev', col: '#ffb36b', text: 'the warden of block C died six years ago', a: (t - K.m3) / 0.25, time: '12:04 AM' },
    { from: 'Dev', col: '#ffb36b', text: 'roll call never stopped.', a: (t - K.m4) / 0.25, time: '12:04 AM', fg: '#ff9aa5' },
  ] });
  if (t > K.died) redPulse(ctx, 0.2 * Math.exp(-(t - K.died) * 3));
});
// 7. 12:06
shot('lock', K.lock, (ctx, t, lt) => {
  const p = t > K.twelve ? 0.05 * Math.exp(-(t - K.twelve) * 5) : 0;
  S.drawPhone(ctx, t, { screen: 'lock', time: '12:06', date: 'Thursday, November 12', bg: chatBG, scale: lerp(1.1, 1.2, E.sine(clamp(lt / 2))) + p,
    notifs: [{ a: (t - K.lock - 0.1) / 0.3, title: 'BLOCK C', lines: [{ text: 'Dev: roll call never stopped.' }], h: 150 }] });
});
// 8. The corridor lights go out, one by one (far to near)
const lightsAt = t => [4, 3, 2, 1, 0].reduce((arr, idx, n) => { arr[idx] = t < K.out[n] ? flicker(t, idx, 0.04) : (t < K.out[n] + 0.12 ? 0.35 : 0); return arr; }, [1, 1, 1, 1, 1]);
shot('corridor', K.corridor, (ctx, t, lt) => {
  const z = lerp(1.0, 1.08, E.sine(clamp(lt / 3)));
  ctx.save(); camera(ctx, 540, 900, z);
  X.drawHostelCorridor(ctx, t, { lights: lightsAt(t) });
  ctx.restore();
});
// 9. Footsteps: the warden walks out of the far dark toward door 9
const walk9 = t => clamp(inv(K.steps, K.name - 0.2, t));
shot('steps', K.steps, (ctx, t, lt) => {
  const k = walk9(t);
  ctx.save(); camera(ctx, 540, 900, lerp(1.08, 1.2, k));
  X.drawHostelCorridor(ctx, t, { lights: [0, 0, 0, 0, 0], warden: { d: lerp(7.6, 5.4, k), X: lerp(0, -250, k), walk: k * Math.PI * 4, rim: 0.7, book: 1 } });
  ctx.restore();
});
// 10. A name. Room 9 answers.
const glowAt = (t, t0) => t < t0 ? 0 : Math.max(0.25, Math.exp(-(t - t0) * 1.6));
shot('name', K.name, (ctx, t, lt) => {
  const [px, py] = X.corrP(-430, 200, 5.25);
  ctx.save(); camera(ctx, lerp(px + 70, px + 50, clamp(lt / 3)), py + 40, lerp(3.3, 3.6, clamp(lt / 3)));
  X.drawHostelCorridor(ctx, t, { lights: [0, 0, 0, 0, 0], doorGlow: { '9': glowAt(t, K.present9) }, warden: { d: 5.4, X: -250, rim: 0.8, page: inv(Wd(19, 1), Wd(19, 1) + 0.4, t) % 1 } });
  ctx.restore();
});
// 11. Ten. Eleven. Twelve. (jump cuts closer) — every door answers
const WPOS = [[K.ten, 4.5, 260, '10'], [K.eleven, 3.5, -260, '11'], [K.twelve2, 2.75, 260, '12']];
shot('doors', K.ten, (ctx, t, lt) => {
  let w = WPOS[0]; for (const p of WPOS) if (t >= p[0]) w = p;
  const punch = 0.06 * Math.exp(-(t - w[0]) * 6);
  const glows = { '9': 0.3 };
  WPOS.forEach(([t0, , , n]) => { glows[n] = glowAt(t, t0 + 0.35); });
  ctx.save(); camera(ctx, 540, 940, 1.15 + punch + 0.03 * clamp(lt / 4));
  X.drawHostelCorridor(ctx, t, { lights: [0, 0, 0, 0, 0], doorGlow: glows, warden: { d: w[1], X: w[2], rim: 0.8 } });
  ctx.restore();
});
// 12. Kabir under the blanket, shaking
shot('blanket', K.blanket, (ctx, t, lt) => {
  const sh = t > K.shaking ? 1 : 0.35;
  ctx.save(); camera(ctx, lerp(-240, -170, clamp(lt / 3)), 1130, lerp(1.0, 1.12, E.sine(clamp(lt / 3))));
  X.drawRoom(ctx, t, { lamp: 0, dark: 0.3, kabir: { mode: 'lump', shake: sh }, gap: { gap: 1 } });
  ctx.restore();
});
// 13. The footsteps stop outside room 13
shot('stop', K.stop, (ctx, t, lt) => {
  const k = E.out(inv(K.stop, K.stopW, t));
  const [sx, sy] = shake(t, K.stopW, 10, 0.3);
  const pan = E.inOut(inv(K.outside - 0.2, K.outside + 0.8, t));
  ctx.save(); camera(ctx, lerp(540, 470, pan), lerp(930, 820, pan), lerp(1.0, 1.3, pan), sx, sy);
  X.drawHostelCorridor(ctx, t, { lights: [0, 0, 0, 0, 0], warden: { d: lerp(2.5, 1.62, k), X: lerp(150, -170, k), walk: k < 1 ? k * Math.PI * 3 : undefined, rim: 0.9 } });
  ctx.restore();
});
// 14. Under the door: two shadows. Feet. Pages turn.
shot('gap', K.gap, (ctx, t, lt) => {
  const f = inv(K.two - 0.1, K.two + 0.7, t);
  const punch = t > K.feet ? 0.08 * Math.exp(-(t - K.feet) * 5) : 0;
  let page = 0; for (const p of K.pages) if (t > p && t < p + 0.45) page = (t - p) / 0.45;
  ctx.save(); camera(ctx, 540, lerp(1060, 1180, clamp(lt / 4)), lerp(1.0, 1.22, E.sine(clamp(lt / 4))) + punch);
  X.drawDoorGap(ctx, t, { feet: f, page, light: 0.9 + 0.1 * noise1(t * 3) });
  ctx.restore();
});
// 15. It calls Kabir. "present"
shot('kabirCall', K.kabirCall, (ctx, t, lt) => {
  const sh = t > K.present13 + 0.3 ? 0 : 1;
  ctx.save(); camera(ctx, lerp(-40, -20, clamp(lt / 3)), 1140, lerp(1.55, 1.75, E.sine(clamp(lt / 3.4))));
  X.drawRoom(ctx, t, { lamp: 0, dark: 0.3, kabir: { mode: 'lump', shake: sh }, gap: { gap: 1, feet: 1 } });
  ctx.restore();
});
// 16. Then it calls your name.
shot('yourName', K.yourName, (ctx, t, lt) => {
  const punch = t > K.nameW ? 0.18 * E.out(clamp((t - K.nameW) / 0.3)) : 0;
  const [sx, sy] = shake(t, K.nameW, 16, 0.4);
  ctx.save(); camera(ctx, 1345, 1060, 2.05 + punch + 0.05 * lt, sx, sy);
  X.drawRoom(ctx, t, { lamp: 0, dark: 0.45, kabir: { mode: 'lump' }, gap: { gap: 1, feet: 1 }, meBed: { headDX: lerp(0, -16, E.out(clamp((t - K.nameW) / 0.25))), rim: 0.7 } });
  ctx.restore();
  if (t > K.nameW) redPulse(ctx, 0.35 * Math.exp(-(t - K.nameW) * 2.5));
});
// 17. The register: a new row for room 13, in red ink
shot('register', K.register, (ctx, t, lt) => {
  ctx.save(); camera(ctx, 560, 1120, lerp(1.25, 1.38, E.sine(clamp(lt / 2.4))));
  X.drawRegister(ctx, t, { write: inv(K.register + 0.15, K.register + 1.6, t), circle: inv(K.regW - 0.1, K.regW + 0.45, t) });
  ctx.restore();
  hudShade(ctx, 0.9);
});
// 18. Nobody here knows your name. — push toward the door
shot('nobody', K.nobody, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.itDoes - K.nobody)));
  ctx.save(); camera(ctx, lerp(-420, -540, k), lerp(1020, 1180, k), lerp(0.95, 1.6, k));
  X.drawRoom(ctx, t, { lamp: 0, dark: 0.5, kabir: { mode: 'lump' }, gap: { gap: 1, feet: 1 }, meBed: {} });
  ctx.restore();
});
// 19. It does. — the light under the door turns red
shot('itDoes', K.itDoes, (ctx, t, lt) => {
  const red = E.out(inv(K.does - 0.05, K.does + 0.25, t));
  const [sx, sy] = shake(t, K.does, 22, 0.45);
  ctx.save(); camera(ctx, 540, 1200, 1.45 + 0.06 * clamp(lt / 1.2), sx, sy);
  X.drawDoorGap(ctx, t, { feet: 1, red, toes: red, light: 1 });
  ctx.restore();
  if (t > K.does) redPulse(ctx, 0.3 * Math.exp(-(t - K.does) * 2));
});
// 20. Choice card
let choiceBG = null;
shot('choice', K.choice, (ctx, t, lt) => {
  if (!choiceBG) {
    const c2 = createCanvas(W, H); const x2 = c2.getContext('2d');
    shots.find(s => s.name === 'itDoes').draw(x2, K.choice - 0.001, K.choice - K.itDoes);
    choiceBG = c2;
  }
  ctx.save(); ctx.filter = `blur(${(10 * clamp(lt / 0.4)).toFixed(1)}px)`; ctx.drawImage(choiceBG, 0, 0); ctx.restore();
  ctx.fillStyle = `rgba(3,5,12,${0.74 * clamp(lt / 0.35)})`; ctx.fillRect(0, 0, W, H);
  const q = ['WHAT', 'DO', 'YOU', 'DO?'];
  ctx.save(); ctx.font = '124px Osw700'; ctx.textBaseline = 'middle';
  const sp = 30; const ws = q.map(w => ctx.measureText(w).width); const tot = ws.reduce((a, b) => a + b, 0) + sp * 3;
  let x = 540 - tot / 2;
  q.forEach((w, i) => {
    const a = clamp((t - Wd(30, i) + 0.03) / 0.12);
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
  opt('A', 'ANSWER "PRESENT"', 960, Wd(30, 3) + 0.35, 'IT ALREADY KNOWS YOUR NAME');
  opt('B', 'STAY SILENT', 1150, Wd(30, 3) + 0.65, 'AND HOPE IT MOVES ON');
  const ca = clamp((t - (Wd(30, 3) + 1.15)) / 0.25);
  if (ca > 0) {
    ctx.save(); ctx.globalAlpha = ca; ctx.textBaseline = 'middle'; ctx.font = '76px Osw700';
    const parts = [['COMMENT ', C.white], ['A', C.lime], [' OR ', C.white], ['B', C.lime]];
    const tw = parts.reduce((s, [p]) => s + ctx.measureText(p).width, 0);
    let xx = 540 - tw / 2;
    for (const [p, c] of parts) { ctx.fillStyle = c; ctx.fillText(p, xx, 1345); xx += ctx.measureText(p).width; }
    ctx.font = '24px Mono500'; ctx.fillStyle = 'rgba(238,241,247,0.5)';
    spaced(ctx, 'PART 2 TOMORROW · FOLLOW', 540, 1420, 5, 'center');
    ctx.restore();
  }
}, { captions: false, vignette: 0.4 });

shots.sort((a, b) => a.start - b.start);
return { shots, K, hudState, coverTitle: 'BLOCK [C]', coverSize: 150 };
};
