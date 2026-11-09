// FLOOR 0 — Part 1 shot list
const { createCanvas } = require('@napi-rs/canvas');
const D = require('./draw');
const S = require('./scenes');
const { W, H, C, clamp, lerp, inv, E, hash, noise1, flicker, shake, rrect, glow, spaced, camera } = D;

module.exports = function build(TL) {
const FPS = TL.fps, DUR = TL.duration;
const Ln = id => TL.lines[id - 1];
const Wd = (id, k) => Ln(id).words[k].start;
// ---------- key times ----------
const K = {
  zero: Wd(1, 9),               // "zero." — display lands on 0
  dirStart: Ln(2).start - 0.05,
  doorsStart: Ln(3).start - 0.05,
  doorOpen0: Wd(3, 2) - 0.25, doorOpen1: Wd(3, 3) + 0.55,
  phoneStart: Ln(5).start - 0.05,
  buzz: Wd(5, 3),
  chatStart: Ln(7).start - 0.12,
  msg1: Wd(7, 0) - 0.05,
  tooLate: Ln(8).start - 0.04,
  interiorStart: Ln(9).start - 0.05,
  corner: Wd(9, 3), facing: Wd(9, 6), notMoving: Wd(10, 0),
  lights: Wd(11, 2), hand: Wd(11, 4), screen: Wd(12, 0),
  typingStart: Ln(13).start - 0.08, typing: Wd(13, 3), smile: Wd(14, 0),
  flash: Ln(14).end + 0.32,
  slamStart: Ln(15).start - 0.06, slam: Wd(15, 2),
  upStart: Ln(16).start - 0.05, eight: Wd(17, 4), yourFloor: Wd(18, 0),
  lockStart: Ln(19).start - 0.05, notif: Wd(19, 0) + 0.12, unlocked: Wd(20, 2), faceid: Wd(20, 4),
  hasFace: Ln(21).start, face: Wd(21, 3),
  aloneStart: Ln(22).start - 0.05,
  dingBack: Ln(23).start - 0.62,
  behindStart: Ln(23).start - 0.95,
  doorBack0: Wd(23, 3) - 0.15, floorZero: Wd(24, 0), thisTime: Wd(25, 0), empty: Wd(25, 3),
  choice: Ln(26).start - 0.08,
};
// elevator floor sequence for the "coming back down" in the alone shot
const downSeq = ['8', '7', '6', '5', '4', '3', '2', '1', 'L', '0'];
function elevatorState(t) {
  // returns {ch, arrow}
  if (t < 0.72) return { ch: '2', arrow: 'D' };
  if (t < 1.5) return { ch: '1', arrow: 'D' };
  if (t < K.zero) return { ch: 'L', arrow: 'D' };
  const upT = [K.upStart + 0.35];
  if (t < K.upStart + 0.35) return { ch: '0', arrow: ' ' };
  const up = ['1', '2', '3', '4', '5', '6', '7', '8'];
  const span = K.eight - (K.upStart + 0.35);
  if (t < K.eight) {
    const k = clamp((t - (K.upStart + 0.35)) / span);
    const idx = Math.min(6, Math.floor(Math.pow(k, 0.85) * 7));
    return { ch: up[idx], arrow: 'U' };
  }
  const d0 = K.aloneStart + 0.55, d1 = K.dingBack;
  if (t < d0) return { ch: '8', arrow: ' ' };
  if (t < d1) { const idx = Math.min(8, Math.floor(((t - d0) / (d1 - d0)) * 9)); return { ch: downSeq[idx], arrow: 'D' }; }
  return { ch: '0', arrow: ' ' };
}

// ---------- HUD state ----------
function hudState(t) {
  const el = elevatorState(t);
  const loc = t < K.face ? 'LOBBY' : (t < K.face + 0.35 ? (Math.floor(t * 24) % 2 ? 'APT 8C' : 'LOBBY') : 'APT 8C');
  return {
    t,
    time: t < K.buzz ? '12:07' : t < K.unlocked ? '12:08' : '12:09',
    battery: t < K.notif ? '19%' : '18%',
    elevator: (el.arrow === 'U' ? '▲ ' : el.arrow === 'D' ? '▼ ' : '') + (el.ch === 'L' ? 'L' : el.ch),
    elevatorCol: el.ch === '0' ? C.lime : undefined,
    location: loc, locationCol: loc === 'APT 8C' ? C.red : undefined,
  };
}

// ---------- shots ----------
const shots = [];
const shot = (name, start, draw) => shots.push({ name, start, draw });

// 1. Indicator counting down past L to 0
shot('indicator_down', 0, (ctx, t, lt) => {
  const el = elevatorState(t);
  const landed = t >= K.zero;
  const punch = landed ? 0.06 * Math.exp(-(t - K.zero) * 6) : 0;
  const z = lerp(2.55, 2.9, E.sine(clamp(t / K.dirStart))) + punch;
  const [sx, sy] = shake(t, K.zero, 14, 0.4);
  ctx.save(); camera(ctx, 540, 770, z, sx, sy);
  const light = landed && t < K.zero + 0.5 ? flicker(t * 3, 4, 0.5) : flicker(t, 2, 0.03);
  S.drawLobby(ctx, t, {
    light, door: 0, ind: { ch: el.ch, arrow: el.arrow, arrowBlink: el.arrow !== ' ' ? (Math.floor(t * 3) % 2 ? 1 : 0.15) : 0, on: landed && t < K.zero + 0.12 ? 0.3 : 1 },
  });
  ctx.restore();
});
// 2. Directory: tilt down to the missing floor
shot('directory', K.dirStart, (ctx, t, lt) => {
  const d = K.doorsStart - K.dirStart;
  const k = E.inOut(clamp(lt / d));
  ctx.save(); camera(ctx, 540, lerp(980, 2070, k), 1.24);
  S.drawDirectory(ctx, t, { ghost: inv(Wd(2, 3), Wd(2, 4) + 0.4, t), lightY: lerp(500, 2000, k) });
  ctx.restore();
});
// 3. Lobby wide: doors open into black, push in
shot('doors_open', K.doorsStart, (ctx, t, lt) => {
  const open = E.inOut(inv(K.doorOpen0, K.doorOpen1, t));
  const push = E.inOut(inv(Ln(4).start - 0.4, K.phoneStart, t));
  const z = lerp(1.0, 1.75, push), cy = lerp(1060, 1175, push), cx = lerp(540, 560, push);
  ctx.save(); camera(ctx, cx, cy, z);
  S.drawLobby(ctx, t, {
    light: flicker(t, 3, 0.06), door: open, ind: { ch: '0', arrow: ' ' },
    char: { x: 360, y: 1700, s: 1.0, view: 'back', arm: 'phone', lit: 0.6 },
  });
  ctx.restore();
});
// 4. Phone: lock screen buzz -> notification
shot('phone_lock', K.phoneStart, (ctx, t, lt) => {
  const b = t - K.buzz;
  const buzzing = (b > 0 && b < 0.28) || (b > 0.42 && b < 0.7);
  const sh = buzzing ? [(hash(Math.floor(t * 60)) - 0.5) * 18, (hash(Math.floor(t * 60) + 5) - 0.5) * 10] : [0, 0];
  const hl = t > Wd(6, 0);
  S.drawPhone(ctx, t, {
    screen: 'lock', time: t < K.buzz ? '12:07' : '12:08', shake: sh, shakeRot: buzzing ? (hash(Math.floor(t * 60) + 2) - 0.5) * 0.03 : 0,
    scale: lerp(1.08, 1.14, E.sine(clamp(lt / 3))),
    notifs: [{ a: (t - K.buzz) / 0.3, title: 'Unknown Number', lines: [{ text: '1 new message' }], hl }],
  });
});
// 5. Chat: "Don't look inside."
shot('phone_chat', K.chatStart, (ctx, t, lt) => {
  S.drawPhone(ctx, t, {
    screen: 'chat', scale: lerp(1.13, 1.19, E.sine(clamp(lt / 1.6))),
    bubbles: [{ text: "Don't look inside.", a: (t - K.msg1) / 0.25 }],
  });
});
// 6. Too late — over-the-shoulder, head lifts toward the black doorway
shot('too_late', K.tooLate, (ctx, t, lt) => {
  const up = E.out(inv(K.tooLate, K.tooLate + 0.5, t));
  const punch = 0.12 * Math.exp(-lt * 5);
  const z = 1.75 + punch + lt * 0.05;
  ctx.save(); camera(ctx, 575, 1150, z);
  S.drawLobby(ctx, t, {
    light: flicker(t, 5, 0.08), door: 1, ind: { ch: '0', arrow: ' ' },
    char: { x: 360, y: 1760, s: 1.3, view: 'back', arm: 'phone', lit: lerp(0.9, 0.2, up), headDY: lerp(10, -10, up), headDX: lerp(-4, 8, up) },
  });
  ctx.restore();
  // red pulse
  const rp = Math.exp(-lt * 3.0) * 0.32;
  if (rp > 0.01) { const g = ctx.createRadialGradient(540, 960, 300, 540, 960, 1200); g.addColorStop(0, 'rgba(255,40,60,0)'); g.addColorStop(1, `rgba(255,40,60,${rp})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
});
// 7. Interior: eyes adjust, the figure in the corner, phone lights in its hand
shot('interior', K.interiorStart, (ctx, t, lt) => {
  const rv = E.out(inv(K.interiorStart + 0.1, K.corner + 0.4, t));
  const flick = (t > K.notMoving + 0.35 && t < K.notMoving + 0.42) || (t > K.notMoving + 0.5 && t < K.notMoving + 0.55) ? 1 : 0;
  const ph = E.out(inv(K.lights - 0.05, K.lights + 0.35, t)) * (0.85 + 0.15 * noise1(t * 5));
  // camera: slow creep, then push to the hand
  const p1 = E.sine(inv(K.interiorStart, K.lights, t));
  const p2 = E.inOut(inv(K.hand - 0.2, K.screen + 0.3, t));
  const z = lerp(lerp(1.0, 1.18, p1), 2.1, p2);
  const cx = lerp(lerp(540, 600, p1), 745, p2), cy = lerp(lerp(980, 1000, p1), 1110, p2);
  ctx.save(); camera(ctx, cx, cy, z);
  S.drawInterior(ctx, t, { reveal: rv, panel: flick, phone: ph, entityVis: inv(K.interiorStart + 0.15, K.corner, t) });
  ctx.restore();
});
// 8. Your phone: it's typing... "Smile."
shot('phone_typing', K.typingStart, (ctx, t, lt) => {
  const smileA = (t - K.smile + 0.25) / 0.22;
  S.drawPhone(ctx, t, {
    screen: 'chat', farGlow: 0.9, scale: lerp(1.15, 1.24, E.sine(clamp(lt / (K.flash - K.typingStart)))),
    bubbles: [{ text: "Don't look inside.", a: 1 }, { text: 'Smile.', a: smileA }],
    typing: t > K.typing - 0.1 && t < K.smile - 0.25 ? 1 : 0,
  });
});
// 9. FLASH
shot('flash', K.flash, (ctx, t, lt) => {
  const f = Math.floor(lt * FPS);
  if (f < 2) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); return; }
  if (f < 8) {
    const fl = f < 5 ? 1 : lerp(1, 0.55, (f - 5) / 3);
    ctx.save(); camera(ctx, 560, 1000, 1.12 + f * 0.012);
    S.drawInterior(ctx, t, { reveal: 1, flash: fl, mode: 'raise', ex: 590, ey: 1360, es: 1.04, tilt: 0.05, rim: 0 });
    ctx.restore();
    ctx.fillStyle = `rgba(255,255,255,${f < 3 ? 0.55 : 0.12})`; ctx.fillRect(0, 0, W, H);
    return;
  }
  // black with a fading negative afterimage of the figure
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const a = 0.5 * Math.exp(-(lt - 8 / FPS) * 3.2);
  ctx.save(); ctx.globalAlpha = a; camera(ctx, 560, 1000, 1.2);
  D.drawEntity(ctx, 590, 1360, 1.04, { t: K.flash, mode: 'raise', col: '#3f6f7a', tilt: 0.05, flash: 0 });
  ctx.restore();
});
// 10. Doors slam shut
shot('slam', K.slamStart, (ctx, t, lt) => {
  const close = 1 - E.in(inv(K.slam - 0.02, K.slam + 0.1, t));
  const [sx, sy] = shake(t, K.slam + 0.08, 34, 0.5);
  ctx.save(); camera(ctx, 540, 1150, 1.25 + 0.04 * clamp(lt / 1.5), sx, sy);
  S.drawLobby(ctx, t, {
    light: t > K.slam + 0.08 && t < K.slam + 0.45 ? flicker(t * 4, 8, 0.6) : flicker(t, 6, 0.05),
    door: close, ind: { ch: '0', arrow: ' ' },
    char: { x: 330, y: 1700, s: 1.0, view: 'back', arm: 'phone', lit: 0.5 },
  });
  ctx.restore();
});
// 11. Indicator climbing to 8
shot('indicator_up', K.upStart, (ctx, t, lt) => {
  const el = elevatorState(t);
  const at8 = t >= K.eight;
  const z = lerp(2.7, 3.1, E.sine(clamp(lt / (K.lockStart - K.upStart)))) + (at8 ? 0.05 * Math.exp(-(t - K.eight) * 5) : 0);
  const blink = t > K.yourFloor && t < K.yourFloor + 0.6 ? (Math.floor(t * 8) % 2 ? 1 : 0.25) : 1;
  ctx.save(); camera(ctx, 540, 770, z);
  S.drawLobby(ctx, t, { light: flicker(t, 9, 0.04), door: 0, ind: { ch: el.ch, arrow: el.arrow, on: blink, arrowBlink: Math.floor(t * 4) % 2 ? 1 : 0.2 } });
  ctx.restore();
});
// 12. Smart lock: unlocked with Face ID / welcome home
shot('lock_notif', K.lockStart, (ctx, t, lt) => {
  const b = t - K.notif;
  const buzzing = (b > 0 && b < 0.26) || (b > 0.4 && b < 0.66);
  const sh = buzzing ? [(hash(Math.floor(t * 60)) - 0.5) * 18, (hash(Math.floor(t * 60) + 5) - 0.5) * 10] : [0, 0];
  const n1 = { a: b / 0.3, icon: 'lock', iconBg: '#e8ecf6', title: 'Smart Lock', h: 196,
    lines: [{ text: 'Front Door unlocked', font: '34px Inter700', col: '#ffffff', a: (t - K.unlocked + 0.05) / 0.2 },
            { text: 'Apt 8C · with Face ID', a: (t - K.faceid + 0.05) / 0.2 }], hl: t > K.unlocked };
  const n2 = { a: (t - K.hasFace) / 0.3, icon: 'lock', iconBg: '#e8ecf6', title: 'Smart Lock', h: 270,
    lines: [{ text: 'Welcome home.', font: '32px Inter700', col: '#ffffff' }, { text: 'Face match 99.8%', font: '27px Inter500', col: C.lime }], thumb: (t - K.hasFace - 0.25) / 0.3 };
  // n1 icon draws a dark lock on a light tile
  const z = lerp(1.1, 1.2, E.sine(clamp(lt / (K.aloneStart - K.lockStart))));
  S.drawPhone(ctx, t, { screen: 'lock', time: t < K.unlocked ? '12:08' : '12:09', shake: sh, scale: z, notifs: [n2.a > 0 ? n2 : null, n1].filter(Boolean) });
});
// 13. Alone in the lobby; the display drops back toward 0
shot('alone', K.aloneStart, (ctx, t, lt) => {
  const el = elevatorState(t);
  ctx.save(); camera(ctx, 540, 1120, lerp(0.84, 0.9, clamp(lt / 2.2)));
  S.drawLobby(ctx, t, { light: flicker(t, 11, 0.12), door: 0, ind: { ch: el.ch, arrow: el.arrow, arrowBlink: Math.floor(t * 4) % 2 ? 1 : 0.2 }, callDown: false,
    char: { x: 540, y: 1630, s: 0.6, view: 'front', arm: 'phone', lit: 0.4 } });
  ctx.restore();
});
// 14. Behind you: doors open, lit, empty
shot('behind', K.behindStart, (ctx, t, lt) => {
  const el = elevatorState(t);
  const open = E.inOut(inv(K.doorBack0, K.doorBack0 + 1.2, t));
  const lit = E.out(inv(K.doorBack0 - 0.05, K.doorBack0 + 0.5, t));
  const push = E.inOut(inv(K.thisTime - 0.2, K.empty + 0.6, t));
  const z = lerp(1.32, 1.95, push), cx = lerp(540, 560, push), cy = lerp(1190, 1110, push);
  const turn = E.inOut(inv(K.empty - 0.3, K.empty + 0.5, t));
  ctx.save(); camera(ctx, cx, cy, z);
  S.drawLobby(ctx, t, {
    light: flicker(t, 13, 0.08), door: open, lit, ind: { ch: el.ch, arrow: el.arrow },
    char: { x: 215, y: 1830, s: 1.25, view: 'front', arm: 'down', headDX: lerp(0, 14, turn), rim: lit * open * 0.9 },
  });
  ctx.restore();
});
// 15. Choice card (over the frozen final frame)
let choiceBG = null;
shot('choice', K.choice, (ctx, t, lt) => {
  if (!choiceBG) {
    const c2 = createCanvas(W, H); const x2 = c2.getContext('2d');
    shots.find(s => s.name === 'behind').draw(x2, K.choice - 0.001, K.choice - K.behindStart);
    choiceBG = c2;
  }
  ctx.save(); ctx.filter = `blur(${(10 * clamp(lt / 0.4)).toFixed(1)}px)`; ctx.drawImage(choiceBG, 0, 0); ctx.restore();
  ctx.fillStyle = `rgba(3,5,12,${0.72 * clamp(lt / 0.35)})`; ctx.fillRect(0, 0, W, H);
  // question words pop with the VO
  const q = ['WHAT', 'DO', 'YOU', 'DO?'];
  ctx.save(); ctx.font = '124px Osw700'; ctx.textBaseline = 'middle';
  const sp = 30; const ws = q.map(w => ctx.measureText(w).width); const tot = ws.reduce((a, b) => a + b, 0) + sp * 3;
  let x = 540 - tot / 2;
  q.forEach((w, i) => {
    const a = clamp((t - Wd(26, i) + 0.03) / 0.12);
    if (a > 0) {
      ctx.save(); ctx.globalAlpha = a; const s = lerp(1.3, 1, E.outBack(a));
      ctx.translate(x + ws[i] / 2, 720); ctx.scale(s, s);
      ctx.fillStyle = C.white; ctx.textAlign = 'center'; ctx.fillText(w, 0, 0); ctx.restore();
    }
    x += ws[i] + sp;
  });
  ctx.restore();
  // options
  const opt = (letter, label, y, ta, sub) => {
    const a = E.out(clamp((t - ta) / 0.3)); if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(lerp(-60, 0, a), 0);
    rrect(ctx, 150, y - 70, 780, 140, 26); ctx.fillStyle = 'rgba(18,24,48,0.85)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(238,241,247,0.75)'; ctx.stroke();
    ctx.beginPath(); ctx.arc(234, y, 44, 0, 7); ctx.fillStyle = C.white; ctx.fill();
    ctx.font = '58px Osw700'; ctx.fillStyle = '#0b1022'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(letter, 234, y + 2);
    ctx.textAlign = 'left'; ctx.fillStyle = C.white; ctx.font = '66px Osw700'; ctx.fillText(label, 306, y - 4);
    ctx.font = '24px Mono500'; ctx.fillStyle = 'rgba(238,241,247,0.55)'; spaced(ctx, sub, 308, y + 40, 1.5);
    ctx.restore();
  };
  opt('A', 'GO HOME', 960, Wd(26, 3) + 0.35, "IT'S ALREADY THERE");
  opt('B', 'GET IN', 1150, Wd(26, 3) + 0.65, 'FLOOR 0 IS WAITING');
  const ca = clamp((t - (Wd(26, 3) + 1.15)) / 0.25);
  if (ca > 0) {
    ctx.save(); ctx.globalAlpha = ca; ctx.textBaseline = 'middle'; ctx.font = '76px Osw700';
    const parts = [['COMMENT ', C.white], ['A', C.lime], [' OR ', C.white], ['B', C.lime]];
    const tw = parts.reduce((s, [p]) => s + ctx.measureText(p).width, 0);
    let xx = 540 - tw / 2;
    for (const [p, c] of parts) { ctx.fillStyle = c; ctx.fillText(p, xx, 1345); xx += ctx.measureText(p).width; }
    ctx.font = '24px Mono500'; ctx.fillStyle = 'rgba(238,241,247,0.5)';
    spaced(ctx, 'FOLLOW FOR PART 2', 540, 1420, 5, 'center');
    ctx.restore();
  }
});

shots.sort((a, b) => a.start - b.start);
shots.find(s => s.name === 'choice').meta = { captions: false, vignette: 0.4 };
shots.find(s => s.name === 'flash').meta = { captions: false, hideHud: lt => lt * FPS < 8 };
return { shots, K, hudState, elevatorState };
};
