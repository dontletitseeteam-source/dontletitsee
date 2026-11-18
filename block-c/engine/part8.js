// BLOCK C — Part 8 "Morning roll call" (FINALE) shot list (branch B: find R. 13; no votes on Part 7 -> "YOU CHOSE B")
// Standard (ANALYTICS): frame 1 = a BRIGHT, recognizable picture (the hostel register page, your row stamped LEFT, 2020), small hook.
const D = require('./draw');
const X = require('./sets');
const { W, H, C, clamp, lerp, inv, E, noise1, shake, rrect, spaced, camera } = D;

module.exports = function build(TL) {
const Ln = id => TL.lines[id - 1];
const Wd = (id, k) => Ln(id).words[k].start;
const R = X.listLayout();
const S0 = id => Ln(id).start - 0.06;
const K = {
  sixW: Wd(1, 8), leftW: Wd(1, 5),
  stairs: S0(2), stepsW: Wd(2, 4),
  look: S0(3), listW: Wd(3, 9),
  note: S0(4), findW: Wd(4, 3),
  wall: S0(5), wardW: Wd(5, 2), hundW: Wd(5, 7),
  name: S0(6), nameW: Wd(6, 4), yourW: Wd(7, 0), handW: Wd(8, 2),
  same: S0(9), sevensW: Wd(9, 6),
  wrote: S0(10), wroteW: Wd(10, 1),
  feet: S0(11), stopW: Wd(11, 2),
  door: S0(12), opensW: Wd(12, 2),
  offer: S0(13), penW: Wd(13, 8), slidesW: Wd(14, 2), tagW: Wd(14, 9), roomW: Wd(14, 10),
  last: S0(15), lastW: Wd(15, 3),
  take: S0(16), takeW: Wd(16, 1),
  coat: S0(17), fitsW: Wd(17, 2),
  next: S0(18), newW: Wd(18, 7),
  list: S0(19), list2W: Wd(19, 9),
  scratch: S0(20), scrW: Wd(20, 1), toreW: Wd(20, 9),
  rule: S0(21), neverW: Wd(21, 2),
  walk: S0(22), callW: Wd(22, 6), hisW: Wd(22, 8),
  choice: Ln(23).start - 0.1, optA: Wd(23, 3), optB: Wd(23, 5), cta: Ln(24).start, ctaA: Wd(24, 1), ctaB: Wd(24, 3), newStory: Wd(24, 5),
};

// ---------- HUD ----------
function hudState(t) {
  const blink = (t0, end = C.red) => t < t0 + 0.6 ? (Math.floor(t * 12) % 2 ? C.red : C.white) : end;
  const night2 = t >= K.next;
  const time = night2 ? '12:07' : (t < K.feet ? '3:04' : '3:05');
  let r4 = ['REGISTER', 'LEFT · 2020', C.red];
  if (t >= K.stepsW) r4 = ['STAIRS', 'COMING UP', blink(K.stepsW)];
  if (t >= K.findW) r4 = ['R. 13', 'FIND ME', blink(K.findW)];
  if (t >= K.hundW) r4 = ['TALLY', '600+ NIGHTS', blink(K.hundW)];
  if (t >= K.yourW) r4 = ['NAME', 'YOURS', blink(K.yourW)];
  if (t >= K.sevensW) r4 = ['HANDWRITING', 'MATCH', blink(K.sevensW, C.lime)];
  if (t >= K.wroteW) r4 = ['R. 13', '= YOU', blink(K.wroteW)];
  if (t >= K.stopW) r4 = ['FOOTSTEPS', 'AT ROOM 13', blink(K.stopW)];
  if (t >= K.opensW) r4 = ['DOOR', 'OPEN', blink(K.opensW)];
  if (t >= K.tagW) r4 = ['WARDEN', 'ROOM 13', blink(K.tagW)];
  if (t >= K.takeW) r4 = ['PEN', 'TAKEN', blink(K.takeW)];
  if (t >= K.newW) r4 = ['ROOM 13', 'NEW STUDENT', blink(K.newW, C.lime)];
  if (t >= K.scrW) r4 = ['RULE 6', 'SCRATCHED', blink(K.scrW)];
  if (t >= K.callW) r4 = ['ROLL CALL', 'YOU CALL', blink(K.callW)];
  const r1 = night2 ? ['NIGHT', 'NEXT', C.white] : ['BATTERY', t < K.feet ? '15%' : '14%', C.red];
  const r2 = t >= K.fitsW ? ['ROOM', '13 · WARDEN', C.red] : ['ROOM', '13 · LEFT', C.red];
  const r3 = night2 ? ['HEADCOUNT', '42', C.white] : ['HEADCOUNT', '43', C.red];
  return { t, part: 'PART 8', time, ampm: 'AM', rows: [r1, r2, r3, r4] };
}

const shots = [];
const shot = (name, start, draw, meta) => shots.push({ name, start, draw, meta });
const capShade = (ctx, a = 0.72) => { const g = ctx.createLinearGradient(0, 1250, 0, 1720); g.addColorStop(0, 'rgba(2,3,8,0)'); g.addColorStop(0.35, `rgba(2,3,8,${a})`); g.addColorStop(0.75, `rgba(2,3,8,${a})`); g.addColorStop(1, 'rgba(2,3,8,0)'); ctx.fillStyle = g; ctx.fillRect(0, 1250, W, 470); };
const hudShade = (ctx, a = 1) => { const g = ctx.createRadialGradient(170, 230, 180, 170, 230, 720); g.addColorStop(0, `rgba(2,3,8,${a})`); g.addColorStop(1, 'rgba(2,3,8,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 760, 820); };
const redPulse = (ctx, a) => { if (a < 0.01) return; const g = ctx.createRadialGradient(540, 960, 300, 540, 960, 1200); g.addColorStop(0, 'rgba(255,40,60,0)'); g.addColorStop(1, `rgba(255,40,60,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
const flash = (ctx, t, t0, a = 0.8) => { if (t < t0 || t > t0 + 0.4) return; ctx.fillStyle = `rgba(235,240,255,${a * (1 - (t - t0) / 0.4)})`; ctx.fillRect(0, 0, W, H); };
const pulseAt = (ctx, t, t0, a = 0.3, k = 2.5) => { if (t > t0) redPulse(ctx, a * Math.exp(-(t - t0) * k)); };
const corridor = (ctx, t, st = {}) => X.drawHostelCorridor(ctx, t, { lights: st.lights ?? [0, 0, 0, 0, 0], warden: st.warden, open: st.open });
const listCam = (ctx, cx, cy, z, sx = 0, sy = 0) => { ctx.save(); camera(ctx, cx, cy, z * 0.84, sx, sy); };
const R1 = R[0].y, R6 = R[5].y;

// 1. HOOK (frame 1): the register page in daylight, your row 13 stamped LEFT, dated 2020
shot('hook', 0, (ctx, t, lt) => {
  const k = E.out(clamp(t / (K.stairs)));
  const [sx, sy] = shake(t, K.sixW, 10, 0.3);
  ctx.save(); camera(ctx, lerp(560, 640, k), lerp(980, 1080, k), lerp(0.98, 1.22, k), sx, sy);
  X.drawRegister(ctx, t, { date: '19 / 11 / 2020', write: 1, mark: 1, bright: 1, dateHL: t > K.sixW - 0.05 ? clamp((t - K.sixW + 0.05) / 0.5) : 0 });
  ctx.restore();
  hudShade(ctx, 0.7);
  pulseAt(ctx, t, K.sixW, 0.25);
}, { vignette: 0.3 });
// 2. It's 3:04. Footsteps on the stairs. — dark corridor, a tall shape climbing into view at the far end
shot('stairs', K.stairs, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.look - K.stairs)));
  ctx.save(); camera(ctx, 540, 860, lerp(1.3, 1.6, k));
  corridor(ctx, t, { warden: { d: lerp(7.4, 6.2, k), X: 140, walk: lt * 4, rim: 0.8, rimCol: '#7d8bc0' } });
  ctx.restore();
  pulseAt(ctx, t, K.stepsW, 0.2);
}, { vignette: 0.7 });
// 3. You don't run. You look for whoever wrote the list. — room 13, you at the wardrobe, phone torch on
shot('look', K.look, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.note - K.look)));
  ctx.save(); camera(ctx, lerp(440, 480, k), lerp(1060, 980, k), lerp(0.8, 1.05, k));
  X.drawRoom(ctx, t, { lamp: 0.25, dark: 0.25, moon: 0.8, kabir: { mode: 'none' }, me: { x: 470, y: 1590, s: 1.05, view: 'back', arm: 'phone', lit: 0.9 }, torch: { x: 700, y: 850, a: 0.95 + 0.05 * noise1(t * 4) } });
  ctx.restore();
}, { vignette: 0.55 });
// 4. I never left. Find me. — the note under rule 6
shot('note', K.note, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.wall - K.note)));
  listCam(ctx, 600, lerp(R6 + 200, R6 + 290, k), lerp(1.55, 1.85, k));
  X.drawList(ctx, t, { back: 1, reveal: 1, note: 1, bx: 520, by: R6 + 160, tx: 560, ty: R6 + 260, tr: 760, dark: 0.7 });
  ctx.restore();
  capShade(ctx, 0.6); hudShade(ctx);
  pulseAt(ctx, t, K.findW, 0.25);
}, {});
// 5. Behind the wardrobe, scratched into the wall, hundreds of tally marks. — the wardrobe slides, the wall full of tallies
shot('wall', K.wall, (ctx, t, lt) => {
  const ed = E.inOut(inv(K.wall, K.wardW + 0.6, t));
  const k = E.inOut(inv(K.wardW, K.name, t));
  ctx.save(); camera(ctx, lerp(760, 540, k), lerp(700, 860, k), lerp(1.7, 1.0, k));
  X.drawTallyWall(ctx, t, { edge: ed, tally: 1, tx: lerp(700, 540, k), ty: lerp(720, 860, k), tr: lerp(500, 1000, k), dark: 0.86 });
  ctx.restore();
  hudShade(ctx);
  if (t > K.hundW) flash(ctx, t, K.hundW, 0.12);
}, { vignette: 0.55 });
// 6-8. And under them, a name. Your name. In your handwriting. — red scribble writes itself, ringed, push in
shot('name', K.name, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.same - K.name)));
  const [sx, sy] = shake(t, K.yourW, 16, 0.4);
  ctx.save(); camera(ctx, lerp(540, 520, k), lerp(1000, 1300, k), lerp(1.05, 1.7, k), sx, sy);
  X.drawTallyWall(ctx, t, { tally: 1, name: E.inOut(inv(K.nameW - 0.3, K.yourW + 0.2, t)), ring: t > K.yourW ? clamp((t - K.yourW) / 0.5) : 0, tx: 540, ty: lerp(1000, 1400, k), tr: lerp(1000, 700, k), dark: 0.86 });
  ctx.restore();
  hudShade(ctx);
  pulseAt(ctx, t, K.yourW, 0.35, 2);
  pulseAt(ctx, t, K.handW, 0.25);
}, { vignette: 0.55 });
// 9. Same slant as the list. Same sevens. — split: the list's rule 1 (12:07) over the wall's name
shot('same', K.same, (ctx, t, lt) => {
  ctx.fillStyle = '#04060c'; ctx.fillRect(0, 0, W, H);
  const a = E.out(clamp(lt / 0.35)), b = E.out(clamp((lt - 0.5) / 0.35));
  ctx.save(); ctx.beginPath(); ctx.rect(0, 300, W, 560); ctx.clip(); ctx.translate(lerp(-W, 0, a), 0);
  ctx.save(); camera(ctx, 560, R1 + 10, 1.5, 0, -380);
  X.drawList(ctx, t, { tx: 560, ty: R1, tr: 900, dark: 0.5, hl: 0, hlA: t > K.sevensW ? clamp((t - K.sevensW) / 0.3) : 0 });
  ctx.restore(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(0, 880, W, 560); ctx.clip(); ctx.translate(lerp(W, 0, b), 0);
  ctx.save(); camera(ctx, 520, 1440, 1.45, 0, 200);
  X.drawTallyWall(ctx, t, { tally: 1, name: 1, tx: 520, ty: 1440, tr: 900, dark: 0.6 });
  ctx.restore(); ctx.restore();
  ctx.fillStyle = C.lime; ctx.fillRect(80, 866, 920 * E.out(clamp((t - K.sevensW) / 0.4)), 8);
  ctx.save(); ctx.font = '30px Mono700'; ctx.fillStyle = 'rgba(238,241,247,0.75)'; spaced(ctx, 'THE LIST', 1000, 290, 4, 'right'); spaced(ctx, 'THE WALL', 1000, 1475 - 20, 4, 'right'); ctx.restore();
  pulseAt(ctx, t, K.sevensW, 0.2);
}, { vignette: 0.4 });
// 10. You wrote the rules. — the full list, signature R. 13 ringed red
shot('wrote', K.wrote, (ctx, t, lt) => {
  const [sx, sy] = shake(t, K.wroteW, 18, 0.45);
  const k = E.out(clamp(lt / (K.feet - K.wrote)));
  listCam(ctx, lerp(560, 640, k), lerp(1000, 1500, k), lerp(1.0, 1.5, k), sx, sy);
  X.drawList(ctx, t, { done: 5, tx: 600, ty: 1300, tr: 1100, dark: 0.7 });
  const rg = clamp((t - K.wroteW) / 0.5);
  if (rg > 0) { ctx.strokeStyle = C.red; ctx.lineWidth = 7; ctx.beginPath(); ctx.ellipse(830, 1712, 130, 50, -0.03, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * rg); ctx.stroke(); }
  ctx.restore();
  capShade(ctx, 0.6); hudShade(ctx);
  pulseAt(ctx, t, K.wroteW, 0.4, 2);
}, {});
// 11. The footsteps stop outside room thirteen. — the gap under the door: two feet slide in and stop
shot('feet', K.feet, (ctx, t, lt) => {
  const f = E.out(inv(K.feet + 0.2, K.stopW + 0.1, t));
  ctx.save(); camera(ctx, 540, lerp(1150, 1200, clamp(lt / 2.6)), lerp(1.2, 1.4, clamp(lt / 2.6)));
  X.drawDoorGap(ctx, t, { feet: f, toes: 1, light: 0.9 + 0.1 * noise1(t * 3) });
  ctx.restore();
  pulseAt(ctx, t, K.stopW, 0.25);
}, { vignette: 0.6 });
// 12. The door opens on its own. — inside room 13, the bolt slides itself, the door swings in; the warden stands there
shot('door', K.door, (ctx, t, lt) => {
  const op = E.inOut(inv(K.opensW - 0.1, K.opensW + 1.0, t));
  const b = 1 - E.inOut(inv(K.door, K.opensW - 0.1, t));
  ctx.save(); camera(ctx, 540, 900, lerp(0.95, 1.05, clamp(lt / 2)));
  X.drawDoorway(ctx, t, { open: op, bolt: b, me: { x: 540, y: 2060, s: 1.0 }, warden: { d: 2.2, X: 0, rim: 0.9 * op, rimCol: '#7d8bc0' } });
  ctx.restore();
  pulseAt(ctx, t, K.opensW, 0.3);
}, { vignette: 0.6 });
// 13-15. The warden holds out the register and a pen. Its sleeve slides back: a hostel tag, ROOM 13.
shot('offer', K.offer, (ctx, t, lt) => {
  const sl = E.inOut(inv(K.slidesW - 0.1, K.slidesW + 0.9, t));
  const z = t < K.tagW ? lerp(0.95, 1.1, clamp(lt / (K.tagW - K.offer))) : lerp(1.1, 1.75, E.inOut(inv(K.tagW, K.tagW + 0.9, t)));
  const fx = t < K.tagW ? 560 : lerp(560, 650, E.inOut(inv(K.tagW, K.tagW + 0.9, t)));
  const fy = t < K.tagW ? 1050 : lerp(1050, 900, E.inOut(inv(K.tagW, K.tagW + 0.9, t)));
  const z2 = t > K.last ? lerp(1.75, 1.95, clamp((t - K.last) / 2)) : z;
  const [sx, sy] = shake(t, K.roomW, 16, 0.4);
  ctx.save(); camera(ctx, fx, fy, z2, sx, sy);
  X.drawOffer(ctx, t, { sleeve: sl, rim: 0.8 });
  ctx.restore();
  hudShade(ctx);
  pulseAt(ctx, t, K.penW, 0.2); pulseAt(ctx, t, K.roomW, 0.4, 2); pulseAt(ctx, t, K.lastW, 0.25);
}, { vignette: 0.55 });
// 16. You take the pen.
shot('take', K.take, (ctx, t, lt) => {
  ctx.save(); camera(ctx, 580, 1150, lerp(1.2, 1.3, clamp(lt / 1.2)));
  X.drawOffer(ctx, t, { sleeve: 1, take: E.inOut(inv(K.take, K.takeW + 0.6, t)), rim: 0.8 });
  ctx.restore();
  hudShade(ctx);
}, { vignette: 0.55 });
// 17. The coat fits. — the corridor, a tall coat with a register under its arm, your height now; rim light
shot('coat', K.coat, (ctx, t, lt) => {
  const k = E.out(clamp(lt / (K.next - K.coat)));
  ctx.save(); camera(ctx, 540, lerp(820, 780, k), lerp(1.35, 1.55, k));
  corridor(ctx, t, { warden: { d: 2.6, X: 0, rim: 1, rimCol: '#a33a4a' } });
  ctx.restore();
  ctx.fillStyle = 'rgba(120,10,25,0.1)'; ctx.fillRect(0, 0, W, H);
  pulseAt(ctx, t, K.fitsW, 0.45, 1.8);
}, { vignette: 0.65 });
// 18. 12:07, the next night. A new student moves into room 13. — the room, lamp on, a new student with a bag
const NEW = (t) => ({ x: 980, y: 1590, s: 1.05, view: 'front', arm: 'down', fill: C.navy1 });
shot('next', K.next, (ctx, t, lt) => {
  const k = E.inOut(clamp(lt / (K.list - K.next)));
  ctx.save(); camera(ctx, lerp(600, 720, k), lerp(1000, 1040, k), lerp(0.78, 0.92, k));
  X.drawRoom(ctx, t, { lamp: 1, moon: 1, kabir: { mode: 'none' }, me: NEW(t) });
  // the bag
  ctx.fillStyle = '#2f3b6e'; rrect(ctx, 1060, 1440, 190, 150, 18); ctx.fill(); ctx.strokeStyle = C.white; ctx.lineWidth = 5; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(1110, 1440); ctx.quadraticCurveTo(1155, 1390, 1200, 1440); ctx.stroke();
  ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = 'rgba(70,80,110,0.25)'; ctx.fillRect(0, 0, W, H); ctx.restore();
  flash(ctx, t, K.next, 0.35);
}, { vignette: 0.4 });
// 19. The last student in room thirteen left him a list. — the wardrobe door, a fresh list (rule 6 still readable)
shot('list', K.list, (ctx, t, lt) => {
  listCam(ctx, 540, lerp(980, 1060, clamp(lt / 2.4)), lerp(1.0, 1.12, E.out(clamp(lt / 2.4))));
  X.drawList(ctx, t, { scratch: 0, tx: 540, ty: 1000, tr: 1000, dark: 0.6 });
  ctx.restore();
  capShade(ctx, 0.55); hudShade(ctx);
}, {});
// 20. And scratched out rule six. So hard the paper tore.
shot('scratch', K.scratch, (ctx, t, lt) => {
  const sc = clamp(inv(K.scrW, K.toreW, t));
  const [sx, sy] = shake(t, K.toreW, 20, 0.4);
  listCam(ctx, 540, R6 + 20, lerp(1.6, 1.85, E.sine(clamp(lt / (K.rule - K.scratch)))), sx, sy);
  X.drawList(ctx, t, { scratch: t >= K.toreW ? 1 : Math.min(0.96, sc), tx: 540, ty: R6, tr: 700, dark: 0.85 });
  // the red pen tip, scratching
  if (t < K.toreW + 0.2) {
    const px = 330 + 300 * (0.5 + 0.5 * Math.sin(t * 23)), py = R6 - 30 + 50 * (0.5 + 0.5 * Math.sin(t * 9));
    ctx.save(); ctx.translate(px, py); ctx.rotate(-0.7); ctx.fillStyle = '#0a0d1a'; ctx.fillRect(0, -10, 260, 20); ctx.fillStyle = '#c4102a'; ctx.fillRect(200, -10, 60, 20); ctx.restore();
  }
  ctx.restore();
  capShade(ctx, 0.6); hudShade(ctx);
  flash(ctx, t, K.toreW, 0.3); pulseAt(ctx, t, K.toreW, 0.35);
}, {});
// 21. Rule six. Never answer twice. — the rule card
shot('rule', K.rule, (ctx, t, lt) => {
  ctx.save(); ctx.filter = 'blur(10px)';
  listCam(ctx, 540, R6, 1.4);
  X.drawList(ctx, t, { tx: 540, ty: R6, tr: 900, dark: 0.8 });
  ctx.restore(); ctx.restore();
  ctx.fillStyle = 'rgba(3,5,12,0.72)'; ctx.fillRect(0, 0, W, H);
  const a = E.outBack(clamp(lt / 0.4));
  ctx.save(); ctx.translate(540, 880); ctx.scale(lerp(0.7, 1, a), lerp(0.7, 1, a)); ctx.globalAlpha = clamp(lt / 0.25);
  rrect(ctx, -430, -300, 860, 600, 30); ctx.fillStyle = 'rgba(14,18,38,0.95)'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = C.red; ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '40px Mono700'; ctx.fillStyle = 'rgba(238,241,247,0.7)'; spaced(ctx, 'BLOCK C · NIGHT RULES', 0, -210, 5, 'center');
  ctx.font = '150px Osw700'; ctx.fillStyle = C.lime; ctx.fillText('RULE #6', 0, -70);
  const n = clamp((t - K.neverW + 0.05) / 0.25);
  ctx.globalAlpha *= n; ctx.font = '96px Osw700'; ctx.fillStyle = C.red; ctx.fillText('NEVER ANSWER', 0, 80); ctx.fillText('TWICE.', 0, 185);
  ctx.restore();
  pulseAt(ctx, t, K.neverW, 0.3);
}, { captions: false, vignette: 0.4 });
// 22. Then you walk the corridor, and call his name. — lights die far to near as the coat walks to room 13; then the gap turns red
shot('walk', K.walk, (ctx, t, lt) => {
  if (t < K.callW) {
    const k = E.inOut(clamp(lt / (K.callW - K.walk)));
    const L = [0, 1, 2, 3, 4].map(i => { const ti = K.walk + 0.3 + (4 - i) * 0.25; return t < ti ? 1 : (t < ti + 0.08 ? 0.3 : 0); });
    ctx.save(); camera(ctx, 540, 860, lerp(1.1, 1.3, k));
    corridor(ctx, t, { lights: L, warden: { d: lerp(6.0, 3.6, k), X: 60, walk: lt * 4.5, rim: 0.8, rimCol: '#a33a4a' } });
    ctx.restore();
  } else {
    const red = E.inOut(inv(K.hisW - 0.1, K.hisW + 0.5, t));
    ctx.save(); camera(ctx, 540, 1150, lerp(1.25, 1.4, clamp((t - K.callW) / 2)));
    X.drawDoorGap(ctx, t, { feet: 1, toes: red, red, light: 1 });
    ctx.restore();
    pulseAt(ctx, t, K.hisW, 0.4, 2);
  }
}, { vignette: 0.6 });
// 23-24. Choice card over the red door gap + THE END
shot('choice', K.choice, (ctx, t, lt) => {
  ctx.save(); ctx.filter = `blur(${(9 * clamp(lt / 0.4)).toFixed(1)}px)`;
  ctx.save(); camera(ctx, 540, 1150, 1.4); X.drawDoorGap(ctx, t, { feet: 1, toes: 1, red: 1, light: 1 }); ctx.restore();
  ctx.restore();
  ctx.fillStyle = `rgba(3,5,12,${0.74 * clamp(lt / 0.35)})`; ctx.fillRect(0, 0, W, H);
  const q = ['WOULD', 'YOU', 'ANSWER?'];
  ctx.save(); ctx.font = '118px Osw700'; ctx.textBaseline = 'middle';
  const sp = 30; const ws = q.map(w => ctx.measureText(w).width); const tot = ws.reduce((a, b) => a + b, 0) + sp * (q.length - 1);
  let x = 540 - tot / 2;
  q.forEach((w, i) => {
    const a = clamp((t - Wd(23, i) + 0.03) / 0.12);
    if (a > 0) { ctx.save(); ctx.globalAlpha = a; const s = lerp(1.3, 1, E.outBack(a)); ctx.translate(x + ws[i] / 2, 640); ctx.scale(s, s); ctx.fillStyle = C.white; ctx.textAlign = 'center'; ctx.fillText(w, 0, 0); ctx.restore(); }
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
    ctx.textAlign = 'left'; ctx.fillStyle = C.white; ctx.font = '60px Osw700'; ctx.fillText(label, 286, y - 4);
    ctx.font = '23px Mono500'; ctx.fillStyle = 'rgba(238,241,247,0.55)'; spaced(ctx, sub, 288, y + 40, 1.5);
    ctx.restore();
  };
  opt('A', 'YES · PRESENT', 880, K.optA, K.optB - 0.1, 'IT ALREADY KNOWS YOUR NAME');
  opt('B', 'NEVER', 1070, K.optB, K.cta - 0.1, 'NOT EVEN IN YOUR SLEEP');
  const ca = clamp((t - K.cta + 0.05) / 0.2);
  if (ca > 0) {
    ctx.save(); ctx.globalAlpha = ca; ctx.textBaseline = 'middle'; ctx.font = '80px Osw700';
    const pa = t > K.ctaA ? Math.exp(-(t - K.ctaA) * 5) : 0, pb = t > K.ctaB ? Math.exp(-(t - K.ctaB) * 5) : 0;
    const parts = [['COMMENT ', C.white, 0], ['A', C.lime, pa], [' OR ', C.white, 0], ['B', C.lime, pb]];
    const tw = parts.reduce((s, [p]) => s + ctx.measureText(p).width, 0);
    let xx = 540 - tw / 2;
    for (const [p, c, pop] of parts) {
      const w = ctx.measureText(p).width;
      ctx.save(); ctx.translate(xx + w / 2, 1270); ctx.scale(1 + 0.35 * pop, 1 + 0.35 * pop); ctx.fillStyle = c; ctx.textAlign = 'center'; ctx.fillText(p, 0, 0); ctx.restore();
      xx += w;
    }
    const by = 1340 + Math.sin(t * 6) * 10;
    ctx.strokeStyle = C.lime; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(540, by); ctx.lineTo(540, by + 60); ctx.moveTo(510, by + 32); ctx.lineTo(540, by + 62); ctx.lineTo(570, by + 32); ctx.stroke();
    ctx.restore();
  }
  const ea = clamp((t - K.newStory + 0.1) / 0.3);
  if (ea > 0) {
    ctx.save(); ctx.globalAlpha = ea; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.font = '96px Osw700'; ctx.fillStyle = C.red; ctx.fillText('BLOCK C · THE END', 540, 1560);
    ctx.font = '26px Mono700'; ctx.fillStyle = 'rgba(238,241,247,0.75)'; spaced(ctx, 'A NEW STORY TOMORROW · 3 PM', 540, 1630, 3, 'center');
    ctx.restore();
  }
}, { captions: false, vignette: 0.4 });

// ---------- overlay: small burned-in hook (frame 1) + recap stamp ----------
function overlay(ctx, t) {
  const ha = t < 2.8 ? 1 : clamp(1 - (t - 2.8) / 0.35);
  if (ha > 0) {
    const pop = lerp(1.12, 1, E.outBack(clamp(t / 0.35)));
    ctx.save(); ctx.globalAlpha = ha; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.translate(540, 1000); ctx.scale(pop, pop); ctx.translate(-540, -1000);
    ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 28;
    rrect(ctx, 150, 880, 780, 270, 26); ctx.fillStyle = 'rgba(6,8,18,0.72)'; ctx.fill();
    ctx.shadowBlur = 0;
    ctx.font = '104px Osw700'; ctx.fillStyle = C.white; ctx.fillText('I LEFT HERE', 540, 1000);
    ctx.font = '104px Osw700'; ctx.fillStyle = C.red; ctx.fillText('6 YEARS AGO', 540, 1115);
    ctx.restore();
  }
  const r0 = K.look + 0.1, r1 = K.note - 0.1;
  if (t > r0 && t < r1 + 0.3) {
    const a = clamp((t - r0) / 0.18) * clamp((r1 + 0.3 - t) / 0.3);
    const s = lerp(1.4, 1, E.outBack(clamp((t - r0) / 0.3)));
    ctx.save(); ctx.globalAlpha = a; ctx.translate(540, 470); ctx.rotate(-0.06); ctx.scale(s, s);
    rrect(ctx, -290, -70, 580, 140, 18); ctx.fillStyle = 'rgba(8,12,26,0.85)'; ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = C.lime; ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.lime;
    ctx.font = '70px Osw700'; ctx.fillText('YOU CHOSE B', 0, -8);
    ctx.font = '22px Mono700'; ctx.fillStyle = 'rgba(238,241,247,0.8)'; spaced(ctx, 'YOU LOOK FOR R. 13', 0, 46, 2.5, 'center');
    ctx.restore();
  }
}

shots.sort((a, b) => a.start - b.start);
return { shots, K, hudState, overlay, coverTitle: 'THE WARDEN [WAS ME]', coverSize: 74 };
};
