// BLOCK C — Part 7 "The scratched rule" shot list (branch A: you warn everyone; 1 voter, YouTube "A")
// Standard (ANALYTICS): frame 1 = a BRIGHT, recognizable wide set (the lit corridor, 42 students crowding one open door), small hook.
const D = require('./draw');
const X = require('./sets');
const { W, H, C, clamp, lerp, inv, E, hash, noise1, shake, rrect, spaced, camera } = D;

module.exports = function build(TL) {
const Ln = id => TL.lines[id - 1];
const Wd = (id, k) => Ln(id).words[k].start;
const R = X.listLayout();
const S0 = id => Ln(id).start - 0.06;
const K = {
  doorW: Wd(1, 6),
  room: S0(2), elevenW: Wd(2, 1), openW: Wd(2, 5),
  type: S0(3),
  warn: S0(4), notMeW: Wd(4, 2), doorsW: Wd(4, 6),
  sent: S0(5), sentW: Wd(5, 0),
  under: S0(6), n43W: Wd(6, 5), sameW: Wd(6, 8),
  same: S0(7), sameSecW: Wd(7, 3),
  two: S0(8), twoW: Wd(8, 3),
  rohan: S0(9), realW: Wd(9, 5),
  arjun: S0(10), knowW: Wd(10, 6),
  newH: S0(11), nobodyW: Wd(11, 4),
  does: S0(12), doesW: Wd(12, 1),
  dev: S0(13), devDoorW: Wd(13, 7),
  lights: S0(14), outW: Wd(14, 5), floorW: Wd(14, 7),
  stair: S0(15), stairW: Wd(15, 3), onceW: Wd(15, 7),
  call: S0(16), nameW: Wd(16, 4),
  again: S0(17), againW: Wd(17, 0),
  run: S0(18), runW: Wd(18, 1), thirteenW: Wd(18, 5),
  list: S0(19), listW: Wd(19, 3),
  six: S0(20), sixW: Wd(20, 1), hardW: Wd(20, 10),
  hold: S0(21), lightW: Wd(21, 4),
  dents: S0(22), wordsW: Wd(22, 5),
  rule: S0(23), twiceW: Wd(23, 8),
  leaves: S0(24), blockW: Wd(24, 3),
  reg: S0(25), regW: Wd(25, 3), leftW: Wd(25, 5),
  note: S0(26), neverW: Wd(26, 4), findW: Wd(26, 6),
  steps: S0(27), upW: Wd(27, 5),
  gate: S0(28), gateW: Wd(28, 6), downW: Wd(28, 8),
  choice: Ln(29).start - 0.1, optA: Wd(30, 0), optB: Wd(31, 0), cta: Ln(32).start, ctaA: Wd(32, 1), ctaB: Wd(32, 3),
};

// ---------- HUD ----------
function hudState(t) {
  const time = t < K.lights ? '3:03' : '3:04';
  const blink = (t0) => t < t0 + 0.6 ? (Math.floor(t * 12) % 2 ? C.red : C.white) : C.red;
  let r4 = ['ROOM 11', 'DOOR OPEN', C.red];
  if (t >= K.sentW) r4 = ['WARNING', 'SENT', t < K.sentW + 0.6 ? blink(K.sentW) : C.lime];
  if (t >= K.n43W) r4 = ['MEMBER 43', 'SENT IT TOO', blink(K.n43W)];
  if (t >= K.twoW) r4 = ['YOU', '× 2', blink(K.twoW)];
  if (t >= K.realW) r4 = ['WHO IS', 'REAL?', blink(K.realW)];
  if (t >= K.outW) r4 = ['LIGHTS', 'OFF', blink(K.outW)];
  if (t >= K.nameW) r4 = ['NAME CALLED', '1', blink(K.nameW)];
  if (t >= K.againW) r4 = ['NAME CALLED', '2', blink(K.againW)];
  if (t >= K.wordsW) r4 = ['RULE 6', 'FOUND', t < K.wordsW + 0.6 ? blink(K.wordsW) : C.lime];
  if (t >= K.neverW) r4 = ['R. 13', 'NEVER LEFT', blink(K.neverW)];
  if (t >= K.upW) r4 = ['STAIRS', 'COMING UP', blink(K.upW)];
  if (t >= K.gateW) r4 = ['GATE', 'DOWN THE STAIRS', blink(K.gateW)];
  return {
    t, part: 'PART 7', time, ampm: 'AM',
    rows: [t >= K.lights ? ['BATTERY', '15%', C.red] : ['BATTERY', '16%', C.red],
      ['ROOM', '13 · LEFT', C.red],
      ['HEADCOUNT', '43', C.red],
      r4],
  };
}

const shots = [];
const shot = (name, start, draw, meta) => shots.push({ name, start, draw, meta });
const capShade = (ctx, a = 0.72) => { const g = ctx.createLinearGradient(0, 1250, 0, 1720); g.addColorStop(0, 'rgba(2,3,8,0)'); g.addColorStop(0.35, `rgba(2,3,8,${a})`); g.addColorStop(0.75, `rgba(2,3,8,${a})`); g.addColorStop(1, 'rgba(2,3,8,0)'); ctx.fillStyle = g; ctx.fillRect(0, 1250, W, 470); };
const hudShade = (ctx, a = 1) => { const g = ctx.createRadialGradient(170, 230, 180, 170, 230, 720); g.addColorStop(0, `rgba(2,3,8,${a})`); g.addColorStop(1, 'rgba(2,3,8,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 760, 820); };
const redPulse = (ctx, a) => { if (a < 0.01) return; const g = ctx.createRadialGradient(540, 960, 300, 540, 960, 1200); g.addColorStop(0, 'rgba(255,40,60,0)'); g.addColorStop(1, `rgba(255,40,60,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
const flash = (ctx, t, t0, a = 0.8) => { if (t < t0 || t > t0 + 0.4) return; ctx.fillStyle = `rgba(235,240,255,${a * (1 - (t - t0) / 0.4)})`; ctx.fillRect(0, 0, W, H); };

// ---------- the corridor with the crowd at door 11 ----------
const D11 = X.doorDepth(11);
// 42 students (we draw ~16 visible), standing in a loose crowd facing door 11, seen from behind
const CROWD = [];
for (let i = 0; i < 18; i++) CROWD.push({ X: lerp(-110, 330, hash(i * 3.7)), d: lerp(2.0, 4.4, hash(i * 9.1 + 2)), ph: hash(i * 5.3) });
CROWD.sort((a, b) => b.d - a.d);
function corridor(ctx, t, st = {}) {
  const L = st.lights ?? [1, 1, 1, 1, 1];
  X.drawHostelCorridor(ctx, t, { lights: L, open: { '11': st.open ?? 1 }, warden: st.warden });
  const amb = L.reduce((a, b) => a + b, 0) / L.length;
  // bright wash: cold tube light on everything
  if (amb > 0.02 && st.wash !== 0) {
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(70,110,100,${0.42 * amb})`; ctx.fillRect(-800, -800, W + 1600, H + 1600); ctx.restore();
  }
  if (st.crowd !== 0) for (const c of CROWD) {
    const [x, y] = X.corrP(c.X, 820, c.d);
    const sc = 1.3 / c.d;
    const sway = Math.sin(t * 0.7 + c.ph * 6) * 2;
    const col = amb > 0.1 ? `rgba(238,241,247,${0.75 + 0.25 * amb})` : 'rgba(120,130,160,0.55)';
    X.drawStudentBack(ctx, x + sway, y, sc, { lift: 0, rise: 1, col, turn: st.turn || 0 });
  }
}
const T43 = '+91 ••••• •••43';
const chatBG = (ctx, t) => {
  ctx.fillStyle = '#070a16'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.filter = 'blur(24px)'; ctx.globalAlpha = 0.9; camera(ctx, 540, 900, 1.2); corridor(ctx, t, { lights: t > K.lights + 0.6 ? [0, 0, 0, 0, 0] : [1, 1, 1, 1, 1] }); ctx.restore();
  ctx.fillStyle = 'rgba(3,4,10,0.45)'; ctx.fillRect(0, 0, W, H);
};
function msgs(t) {
  const m = [
    { mine: true, text: "im locked out. can someone open their door?", a: 1, time: '3:02', bg: '#3a2a48' },
    { from: 'Dev · Room 11', col: '#c6ff3a', text: 'coming. opening my door', a: 1, time: '3:02 AM' },
  ];
  if (t > K.sentW - 0.05) m.push({ mine: true, text: "thats not me. dont open your doors", a: clamp((t - K.sentW + 0.05) / 0.3), time: '3:03', ring: t > K.sameW ? clamp((t - K.sameW) / 0.3) : 0 });
  if (t > K.n43W - 0.05) m.push({ from: `${T43} · ROOM 13`, col: '#ff8a94', text: 'thats not me. dont open your doors', a: clamp((t - K.n43W + 0.05) / 0.3), time: '3:03 AM', bg: t > K.sameW ? '#4a1420' : undefined });
  if (t > K.realW - 0.3) m.push({ from: 'Rohan', col: '#f0a35e', text: 'which one of you is real??', a: clamp((t - K.realW + 0.3) / 0.3), time: '3:03 AM' });
  if (t > K.arjun + 0.1) m.push({ from: 'Arjun', col: '#7fb0ff', text: 'ask him something only he would know', a: clamp((t - K.arjun - 0.1) / 0.3), time: '3:03 AM' });
  if (t > K.devDoorW - 0.3) m.push({ sys: true, text: 'Dev · last seen 3:02 AM', fg: '#ff8a94', a: clamp((t - K.devDoorW + 0.3) / 0.3), ring: clamp((t - K.devDoorW) / 0.3) });
  while (m.length > 4) m.shift();
  return m;
}
const chat = (ctx, t, o = {}) => X.drawGroupChat(ctx, t, { sub: '43 members · muted', bg: chatBG, msgs: msgs(t), ...o });

// 1. HOOK (frame 1): the lit corridor, a crowd of students at one open door, slow push-in
shot('hook', 0, (ctx, t, lt) => {
  const k = E.out(clamp(t / 3.6));
  ctx.save(); camera(ctx, lerp(540, 500, k), lerp(900, 880, k), lerp(1.08, 1.22, k));
  corridor(ctx, t, {});
  ctx.restore();
  capShade(ctx, 0.4);
}, { vignette: 0.42 });
// 2. Room eleven. Dev's room. It's open. — push to door 11
shot('room', K.room, (ctx, t, lt) => {
  const [nx, ny] = X.corrP(-430, 200, D11);
  const k = E.inOut(clamp(lt / (K.type - K.room)));
  const [sx, sy] = shake(t, K.openW, 12, 0.35);
  ctx.save(); camera(ctx, lerp(500, nx + 90, k), lerp(880, ny - 40, k), lerp(1.22, 2.1, k), sx, sy);
  corridor(ctx, t, {});
  ctx.restore();
  if (t > K.openW) redPulse(ctx, 0.22 * Math.exp(-(t - K.openW) * 2.5));
}, { vignette: 0.5 });
// 3-4. You type fast. "thats not me. dont open your doors"
shot('type', K.type, (ctx, t, lt) => {
  const full = 'thats not me. dont open your doors';
  const n = t < K.sentW - 0.1 ? Math.floor(clamp((t - K.type - 0.2) / (K.sentW - 0.3 - K.type)) * full.length) : 0;
  const txt = full.slice(0, n);
  chat(ctx, t, { scale: lerp(1.0, 1.08, clamp(lt / 3)), compose: t < K.sentW - 0.05 ? { text: txt, key: txt.slice(-1) } : undefined });
}, { vignette: 0.5 });
// 5. Sent.
shot('sent', K.sent, (ctx, t, lt) => {
  chat(ctx, t, { scale: lerp(1.08, 1.16, E.out(clamp(lt / 1))), shake: [0, -lerp(0, 120, E.out(clamp(lt / 0.6)))] });
  flash(ctx, t, K.sentW, 0.12);
}, { vignette: 0.5 });
// 6-7. Right under it, member 43 sends the same thing. Same words. Same second.
shot('under', K.under, (ctx, t, lt) => {
  let z = lerp(1.16, 1.22, clamp(lt / 2));
  if (t > K.sameW) z = lerp(1.22, 1.38, E.inOut(inv(K.sameW, K.sameSecW + 0.4, t)));
  const [sx, sy] = shake(t, K.n43W, 18, 0.4);
  chat(ctx, t, { scale: z, shake: [sx, sy - lerp(120, 300, E.inOut(inv(K.n43W, K.sameW + 0.5, t)))] });
  if (t > K.n43W) redPulse(ctx, 0.3 * Math.exp(-(t - K.n43W) * 2));
  if (t > K.sameSecW) redPulse(ctx, 0.25 * Math.exp(-(t - K.sameSecW) * 2.5));
}, { vignette: 0.55 });
// 8. Now there are two of you in the group. — split: two identical "ROOM 13" avatars
shot('two', K.two, (ctx, t, lt) => {
  ctx.fillStyle = '#060912'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.filter = 'blur(28px)'; ctx.globalAlpha = 0.6; camera(ctx, 540, 900, 1.3); corridor(ctx, t, {}); ctx.restore();
  ctx.fillStyle = 'rgba(3,4,10,0.55)'; ctx.fillRect(0, 0, W, H);
  const a = E.outBack(clamp(lt / 0.4)), b = E.outBack(clamp((t - K.twoW + 0.1) / 0.4));
  const card = (x, k, label, col) => {
    if (k <= 0) return;
    ctx.save(); ctx.globalAlpha = clamp(k); ctx.translate(x, 900); ctx.scale(lerp(0.6, 1, k), lerp(0.6, 1, k));
    rrect(ctx, -200, -300, 400, 560, 36); ctx.fillStyle = 'rgba(22,28,52,0.92)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -120, 110, 0, 7); ctx.fillStyle = '#2a3460'; ctx.fill();
    ctx.strokeStyle = C.white; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, -150, 42, 0, 7); ctx.fillStyle = '#0b1022'; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-70, -30); ctx.quadraticCurveTo(0, -110, 70, -30); ctx.stroke();
    ctx.textAlign = 'center'; ctx.fillStyle = C.white; ctx.font = '44px Osw700'; ctx.fillText('ROOM 13', 0, 90);
    ctx.font = '26px Mono500'; ctx.fillStyle = 'rgba(238,241,247,0.7)'; ctx.fillText(T43, 0, 140);
    ctx.font = '30px Osw700'; ctx.fillStyle = col; ctx.fillText(label, 0, 210);
    ctx.restore();
  };
  card(300, a, '?', C.lime); card(780, b, '?', C.red);
  ctx.save(); ctx.textAlign = 'center'; ctx.font = '120px Osw700'; ctx.globalAlpha = clamp((t - K.twoW) / 0.2); ctx.fillStyle = C.red; ctx.fillText('=', 540, 920); ctx.restore();
  if (t > K.twoW) redPulse(ctx, 0.25 * Math.exp(-(t - K.twoW) * 2.5));
}, { vignette: 0.55 });
// 9-10. Rohan / Arjun in the chat
shot('rohan', K.rohan, (ctx, t, lt) => {
  const z = lerp(1.05, 1.16, E.sine(clamp(lt / (K.newH - K.rohan))));
  chat(ctx, t, { scale: z, shake: [0, -lerp(80, 220, E.inOut(inv(K.rohan, K.arjun + 0.6, t)))] });
  if (t > K.realW) redPulse(ctx, 0.18 * Math.exp(-(t - K.realW) * 3));
}, { vignette: 0.5 });
// 11. But you're new here. Nobody knows your name. — room 13's plate, empty name card
shot('new', K.newH, (ctx, t, lt) => {
  const z = lerp(1.0, 1.25, E.inOut(clamp(lt / (K.does - K.newH))));
  ctx.save(); camera(ctx, 540, lerp(820, 960, E.inOut(clamp(lt / (K.does - K.newH)))), z);
  X.drawPlate(ctx, t, {});
  ctx.restore();
  if (t > K.nobodyW) redPulse(ctx, 0.15 * Math.exp(-(t - K.nobodyW) * 3));
}, { vignette: 0.6 });
// 12. It does. — the warden at the dark end of the corridor, register under his arm
shot('does', K.does, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.doesW, 14, 0.4);
  ctx.save(); camera(ctx, 540, 840, lerp(1.6, 1.85, E.out(clamp(lt / 1.4))), sx, sy);
  X.drawHostelCorridor(ctx, t, { lights: [0, 0, 0, 0, 0.0], warden: { d: 4.6, X: 40, rim: 0.9, rimCol: '#a33a4a' } });
  ctx.restore();
  ctx.fillStyle = 'rgba(120,10,25,0.12)'; ctx.fillRect(0, 0, W, H);
  if (t > K.doesW) redPulse(ctx, 0.35 * Math.exp(-(t - K.doesW) * 2));
}, { vignette: 0.7 });
// 13. Dev hasn't typed since he opened his door.
shot('dev', K.dev, (ctx, t, lt) => {
  chat(ctx, t, { scale: lerp(1.1, 1.24, E.sine(clamp(lt / (K.lights - K.dev)))), shake: [0, -200] });
  if (t > K.devDoorW) redPulse(ctx, 0.2 * Math.exp(-(t - K.devDoorW) * 2.5));
}, { vignette: 0.5 });
// 14. Then the tube lights go out. Every floor. — far to near, the crowd goes dark
shot('lights', K.lights, (ctx, t, lt) => {
  const L = [0, 1, 2, 3, 4].map(i => { const ti = K.outW - 0.25 + (4 - i) * 0.12; return t < ti ? 1 : (t < ti + 0.08 ? 0.3 : 0); });
  ctx.save(); camera(ctx, 520, 880, lerp(1.1, 1.18, clamp(lt / 2.6)));
  corridor(ctx, t, { lights: L });
  ctx.restore();
  if (t > K.floorW) ctx.fillStyle = 'rgba(0,0,0,0)';
}, { vignette: 0.55 });
// 15. And from the stairwell, a voice you've heard once before. — dark, far end, a tall shape
shot('stair', K.stair, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.call - K.stair)));
  ctx.save(); camera(ctx, 540, lerp(880, 840, k), lerp(1.1, 1.7, k));
  corridor(ctx, t, { lights: [0, 0, 0, 0, 0], warden: { d: 6.4, X: 120, rim: 0.7 * k, rimCol: '#7d8bc0' } });
  ctx.restore();
}, { vignette: 0.7 });
// 16-17. The warden calls your name. Again. — the register: your red row, a second red stroke
shot('call', K.call, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.run - K.call)));
  const calls = t < K.nameW ? 0 : (t < K.againW ? clamp((t - K.nameW) / 0.4) : 1 + clamp((t - K.againW) / 0.3));
  const [sx, sy] = shake(t, K.againW, 22, 0.5);
  ctx.save(); camera(ctx, lerp(560, 700, k), lerp(1180, 1300, k), lerp(1.15, 1.7, k), sx, sy);
  X.drawRegister(ctx, t, { date: '15 / 11', write: 1, calls });
  ctx.restore(); hudShade(ctx);
  if (t > K.nameW) redPulse(ctx, 0.2 * Math.exp(-(t - K.nameW) * 2.5));
  if (t > K.againW) redPulse(ctx, 0.4 * Math.exp(-(t - K.againW) * 1.8));
}, { vignette: 0.6 });
// 18. You run. Back to room thirteen. — the dark corridor rushes, door 13 close on the left
shot('run', K.run, (ctx, t, lt) => {
  const k = E.in(clamp(lt / (K.list - K.run)));
  const [nx, ny] = X.corrP(-430, 300, X.doorDepth(13));
  const bob = Math.sin(lt * 16) * 14;
  ctx.save(); camera(ctx, lerp(540, nx + 160, k), lerp(900, ny, k) + bob, lerp(1.0, 2.2, k), 0, 0, Math.sin(lt * 8) * 0.02);
  corridor(ctx, t, { lights: [0, 0, 0, 0, 0], crowd: 0, open: 1 });
  ctx.restore();
  ctx.fillStyle = 'rgba(2,3,8,0.15)'; ctx.fillRect(0, 0, W, H);
}, { vignette: 0.7 });
// 19. The wardrobe. The list. — phone light on the paper, wide
const listCam = (ctx, cx, cy, z, sx = 0, sy = 0) => { ctx.save(); camera(ctx, cx, cy, z * 0.84, sx, sy); };
shot('list', K.list, (ctx, t, lt) => {
  listCam(ctx, 540, 1000, lerp(1.12, 1.24, E.out(clamp(lt / 2))));
  X.drawList(ctx, t, { tx: 540 + (noise1(t) - 0.5) * 60, ty: 1000, tr: 800, dark: 0.88 });
  ctx.restore();
  flash(ctx, t, K.list, 0.2);
  capShade(ctx, 0.55); hudShade(ctx);
}, {});
// 20. Rule six is scratched out. But whoever wrote it pressed hard. — close on the scratch
const R6 = R[5].y;
shot('six', K.six, (ctx, t, lt) => {
  const z = lerp(1.7, 2.0, E.sine(clamp(lt / (K.hold - K.six))));
  listCam(ctx, 540, R6 - 30, z);
  X.drawList(ctx, t, { tx: 520 + (noise1(t) - 0.5) * 40, ty: R6, tr: 520, dark: 0.92 });
  ctx.restore();
  capShade(ctx, 0.6); hudShade(ctx);
  if (t > K.hardW) redPulse(ctx, 0.15 * Math.exp(-(t - K.hardW) * 3));
}, {});
// 21-22. You hold your phone light behind the paper. And the dents turn into words.
shot('hold', K.hold, (ctx, t, lt) => {
  const back = E.out(inv(K.lightW - 0.2, K.lightW + 0.8, t));
  const z = lerp(1.6, 1.8, E.sine(clamp(lt / (K.rule - K.hold))));
  listCam(ctx, 540, R6 - 10, z);
  X.drawList(ctx, t, { back, reveal: t > K.wordsW - 0.2 ? 0.34 * E.out(inv(K.wordsW - 0.2, K.wordsW + 0.6, t)) : 0, bx: 520 + Math.sin(t * 1.3) * 30, by: R6 + 20, tx: 540, ty: R6, tr: 700, dark: lerp(0.9, 0.7, back) });
  ctx.restore();
  capShade(ctx, 0.6); hudShade(ctx);
}, {});
// 23-24. Rule six. If the warden calls a name twice, that student leaves Block C.
shot('rule', K.rule, (ctx, t, lt) => {
  const rv = 0.34 + 0.66 * E.inOut(inv(K.rule + 0.4, K.blockW + 0.3, t));
  const z = lerp(1.8, 1.65, E.sine(clamp(lt / (K.reg - K.rule))));
  const [sx, sy] = shake(t, K.twiceW, 12, 0.35);
  listCam(ctx, 560, R6 + 40, z, sx, sy);
  X.drawList(ctx, t, { back: 1, reveal: rv, hlTwice: t > K.twiceW ? clamp((t - K.twiceW) / 0.4) : 0, bx: 520 + Math.sin(t * 1.3) * 30, by: R6 + 20, tx: 540, ty: R6 + 40, tr: 760, dark: 0.7 });
  ctx.restore();
  capShade(ctx, 0.6); hudShade(ctx);
  if (t > K.twiceW) redPulse(ctx, 0.25 * Math.exp(-(t - K.twiceW) * 2.5));
  if (t > K.blockW) redPulse(ctx, 0.25 * Math.exp(-(t - K.blockW) * 2.5));
}, {});
// 25. Leaves. Like the register said. Left. — the register's LEFT stamp lands
shot('reg', K.reg, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.leftW, 22, 0.45);
  ctx.save(); camera(ctx, 720, 1300, lerp(1.6, 1.9, E.out(clamp(lt / 2.5))), sx, sy);
  X.drawRegister(ctx, t, { date: '15 / 11', write: 1, calls: 2, mark: t > K.leftW - 0.05 ? clamp((t - K.leftW + 0.05) / 0.2) : 0 });
  ctx.restore(); hudShade(ctx);
  if (t > K.leftW) redPulse(ctx, 0.35 * Math.exp(-(t - K.leftW) * 2));
}, { vignette: 0.6 });
// 26. Below it, smaller. I never left. Find me. — the note under rule 6, the signature R. 13
shot('note', K.note, (ctx, t, lt) => {
  const nt = E.inOut(inv(K.neverW - 0.5, K.findW + 0.5, t));
  const k = E.inOut(clamp(lt / (K.steps - K.note)));
  listCam(ctx, lerp(560, 600, k), lerp(R6 + 220, R6 + 300, k), lerp(1.6, 1.85, k));
  X.drawList(ctx, t, { back: 1, reveal: 1, note: nt, bx: 520, by: R6 + 160, tx: 560, ty: R6 + 260, tr: 760, dark: 0.7 });
  ctx.restore();
  capShade(ctx, 0.6); hudShade(ctx);
  if (t > K.findW) redPulse(ctx, 0.25 * Math.exp(-(t - K.findW) * 2.5));
}, {});
// 27. Footsteps on the stairs. Coming up. — the door gap: a shadow rising on the stair light far off
shot('steps', K.steps, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.gate - K.steps)));
  ctx.save(); camera(ctx, 540, 860, lerp(1.5, 1.75, k));
  corridor(ctx, t, { lights: [0, 0, 0, 0, 0], crowd: 0, warden: { d: lerp(7.2, 5.6, k), X: 140, walk: lt * 4, rim: 0.8, rimCol: '#7d8bc0' } });
  ctx.restore();
  if (t > K.upW) redPulse(ctx, 0.2 * Math.exp(-(t - K.upW) * 2.5));
}, { vignette: 0.7 });
// 28. And the only way to the gate is down those stairs. — pull back: you in the doorway of 13, the shape at the end
shot('gate', K.gate, (ctx, t, lt) => {
  const k = E.out(clamp(lt / (K.choice - K.gate)));
  const [sx, sy] = shake(t, K.downW, 12, 0.35);
  ctx.save(); camera(ctx, 540, lerp(860, 900, k), lerp(1.6, 1.15, k), sx, sy);
  corridor(ctx, t, { lights: [0, 0, 0, 0, 0], crowd: 0, warden: { d: 5.2, X: 140, walk: lt * 4, rim: 0.8, rimCol: '#7d8bc0' } });
  ctx.restore();
  // GATE ↓ sign on the far wall
  const ga = clamp((t - K.gateW + 0.1) / 0.3);
  if (ga > 0) { ctx.save(); ctx.globalAlpha = ga; ctx.textAlign = 'center'; ctx.font = '54px Osw700'; ctx.fillStyle = C.lime; ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 18; ctx.fillText('GATE · DOWNSTAIRS', 540, 560); ctx.restore(); }
  if (t > K.downW) redPulse(ctx, 0.25 * Math.exp(-(t - K.downW) * 2.5));
}, { vignette: 0.6 });
// 29-32. Choice card over the revealed list
shot('choice', K.choice, (ctx, t, lt) => {
  ctx.save(); ctx.filter = `blur(${(9 * clamp(lt / 0.4)).toFixed(1)}px)`;
  listCam(ctx, 560, R6 + 120, 1.3);
  X.drawList(ctx, t, { back: 1, reveal: 1, note: 1, bx: 520, by: R6 + 100, tx: 540, ty: R6 + 100, tr: 900, dark: 0.7 });
  ctx.restore(); ctx.restore();
  ctx.fillStyle = `rgba(3,5,12,${0.74 * clamp(lt / 0.35)})`; ctx.fillRect(0, 0, W, H);
  const q = ['WHAT', 'DO', 'YOU', 'DO?'];
  ctx.save(); ctx.font = '124px Osw700'; ctx.textBaseline = 'middle';
  const sp = 30; const ws = q.map(w => ctx.measureText(w).width); const tot = ws.reduce((a, b) => a + b, 0) + sp * 3;
  let x = 540 - tot / 2;
  q.forEach((w, i) => {
    const a = clamp((t - Wd(29, i) + 0.03) / 0.12);
    if (a > 0) { ctx.save(); ctx.globalAlpha = a; const s = lerp(1.3, 1, E.outBack(a)); ctx.translate(x + ws[i] / 2, 720); ctx.scale(s, s); ctx.fillStyle = C.white; ctx.textAlign = 'center'; ctx.fillText(w, 0, 0); ctx.restore(); }
    x += ws[i] + sp;
  });
  ctx.restore();
  const opt = (letter, label, y, ta, tEnd, sub) => {
    const a = E.out(clamp((t - ta + 0.05) / 0.3)); if (a <= 0) return;
    const live = t >= ta - 0.05 && t < tEnd;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(lerp(-60, 0, a), 0);
    const s = live ? 1.04 : 1; ctx.translate(540, y); ctx.scale(s, s); ctx.translate(-540, -y);
    rrect(ctx, 130, y - 70, 820, 140, 26); ctx.fillStyle = live ? 'rgba(30,40,24,0.9)' : 'rgba(18,24,48,0.85)'; ctx.fill();
    ctx.lineWidth = live ? 6 : 3; ctx.strokeStyle = live ? C.lime : 'rgba(238,241,247,0.75)'; ctx.stroke();
    ctx.beginPath(); ctx.arc(214, y, 44, 0, 7); ctx.fillStyle = live ? C.lime : C.white; ctx.fill();
    ctx.font = '58px Osw700'; ctx.fillStyle = '#0b1022'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(letter, 214, y + 2);
    ctx.textAlign = 'left'; ctx.fillStyle = C.white; ctx.font = (label.length > 20 ? '52px' : '60px') + ' Osw700'; ctx.fillText(label, 286, y - 4);
    ctx.font = '23px Mono500'; ctx.fillStyle = 'rgba(238,241,247,0.55)'; spaced(ctx, sub, 288, y + 40, 1.5);
    ctx.restore();
  };
  opt('A', 'RUN FOR THE GATE', 960, K.optA, K.optB - 0.1, 'PAST THE STAIRS · GET OUT TONIGHT');
  opt('B', 'FIND R. 13', 1150, K.optB, K.cta - 0.1, 'WHO WROTE THE LIST · NEVER LEFT');
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
    const by = 1440 + Math.sin(t * 6) * 10;
    ctx.strokeStyle = C.lime; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(540, by); ctx.lineTo(540, by + 60); ctx.moveTo(510, by + 32); ctx.lineTo(540, by + 62); ctx.lineTo(570, by + 32); ctx.stroke();
    ctx.font = '24px Mono500'; ctx.fillStyle = 'rgba(238,241,247,0.55)'; ctx.textAlign = 'center';
    spaced(ctx, 'MOST VOTES DECIDE THE FINALE · TOMORROW 3 PM', 540, 1580, 3, 'center');
    ctx.restore();
  }
}, { captions: false, vignette: 0.4 });

// ---------- overlay: small burned-in hook (frame 1) + recap stamp ----------
function overlay(ctx, t) {
  const ha = t < 2.7 ? 1 : clamp(1 - (t - 2.7) / 0.35);
  if (ha > 0) {
    const pop = lerp(1.12, 1, E.outBack(clamp(t / 0.35)));
    ctx.save(); ctx.globalAlpha = ha; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.translate(540, 560); ctx.scale(pop, pop); ctx.translate(-540, -560);
    ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = 24;
    ctx.font = '96px Osw700'; ctx.fillStyle = C.white; ctx.fillText('42 STUDENTS', 540, 520);
    ctx.font = '110px Osw700'; ctx.fillStyle = C.red; ctx.fillText('ONE DOOR', 540, 630);
    ctx.restore();
  }
  const r0 = K.type + 0.05, r1 = K.sent + 0.4;
  if (t > r0 && t < r1 + 0.3) {
    const a = clamp((t - r0) / 0.18) * clamp((r1 + 0.3 - t) / 0.3);
    const s = lerp(1.4, 1, E.outBack(clamp((t - r0) / 0.3)));
    ctx.save(); ctx.globalAlpha = a; ctx.translate(540, 470); ctx.rotate(-0.06); ctx.scale(s, s);
    rrect(ctx, -290, -70, 580, 140, 18); ctx.fillStyle = 'rgba(8,12,26,0.85)'; ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = C.lime; ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.lime;
    ctx.font = '70px Osw700'; ctx.fillText('YOU SAID A', 0, -8);
    ctx.font = '22px Mono700'; ctx.fillStyle = 'rgba(238,241,247,0.8)'; spaced(ctx, 'YOU WARN EVERYONE', 0, 46, 2.5, 'center');
    ctx.restore();
  }
}

shots.sort((a, b) => a.start - b.start);
return { shots, K, hudState, overlay, coverTitle: 'RULE 6 [WAS HIDDEN]', coverSize: 84 };
};
