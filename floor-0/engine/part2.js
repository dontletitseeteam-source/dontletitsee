// FLOOR 0 — Part 2 "8C" shot list
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('@napi-rs/canvas');
const D = require('./draw');
const S = require('./scenes');
const S2 = require('./scenes2');
const { W, H, C, clamp, lerp, inv, E, hash, noise1, flicker, shake, rrect, glow, spaced, camera } = D;

module.exports = function build(TL) {
  const FPS = TL.fps, DUR = TL.duration;
  const Ln = id => TL.lines[id - 1];
  const Wd = (id, k) => Ln(id).words[k].start;
  // Part 1, for the recap
  const TL1 = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'p1', 'timeline.json'), 'utf8'));
  const P1 = require('./part1')(TL1);
  const shot1 = n => P1.shots.find(s => s.name === n);

  const K = {
    recapA: 0, recapB: Wd(1, 2) - 0.12, recapC: Wd(1, 4) - 0.1,
    lobby: Ln(2).start - 0.25, turn: Wd(2, 5) - 0.2,
    stairs: Ln(3).start - 0.1,
    corridor: Ln(4).start - 0.1, yourDoor: Wd(4, 2),
    door8c: Ln(5).start - 0.08,
    gap: Ln(6).start - 0.08, couch: Ln(7).start, spot: Ln(8).start,
    phone: Ln(9).start - 0.1, buzz: Wd(9, 3), ownNumber: Wd(10, 2),
    chat: Ln(11).start - 0.12, msg: Wd(11, 0) - 0.04,
    push: Ln(12).start - 0.1, pushOpen: Wd(12, 1),
    turn2: Wd(13, 1) - 0.05, itsYou: Ln(14).start,
    smile: Ln(15).start - 0.05, smiled: Wd(15, 3), smileEnd: Ln(15).end,
    slamShot: Ln(16).start - 0.15, slam: Wd(16, 2),
    lock: Ln(17).start - 0.1, unrec: Wd(17, 2),
    alone: Ln(18).start - 0.08,
    hall: Ln(19).start - 0.1, ding: Wd(19, 3) - 0.35,
    lit: Ln(20).start - 0.1,
    display: Ln(21).start - 0.1, zero: Wd(21, 3),
    eight: Ln(22).start - 0.1,
    rule: Ln(23).start - 0.05,
  };

  // ----- HUD -----
  function hudState(t) {
    let loc = 'LOBBY', locCol;
    if (t >= K.stairs && t < K.corridor) {
      const u = clamp((t - K.stairs) / (K.corridor - K.stairs - 0.2));
      loc = `STAIRS · ${1 + Math.min(7, Math.floor(u * 7.99))}`;
    } else if (t >= K.corridor) loc = 'FLOOR 8';
    if (t >= K.unrec) { loc = t < K.unrec + 0.35 && Math.floor(t * 24) % 2 ? 'FLOOR 8' : 'UNKNOWN'; locCol = C.red; }
    return {
      t, part: 'PART 2',
      time: t < K.stairs ? '12:09' : t < K.slam ? '12:11' : '12:12',
      battery: t < K.buzz ? '18%' : '17%',
      elevator: '0', elevatorCol: C.lime,
      location: loc, locationCol: locCol,
    };
  }

  const shots = [];
  const shot = (name, start, draw, meta) => shots.push({ name, start, draw, meta });

  // memory treatment for the recap
  const mem = createCanvas(W, H), memx = mem.getContext('2d');
  function recap(ctx, drawFn) {
    memx.setTransform(1, 0, 0, 1, 0, 0); memx.globalAlpha = 1; memx.filter = 'none'; memx.globalCompositeOperation = 'source-over';
    memx.fillStyle = '#000'; memx.fillRect(0, 0, W, H);
    drawFn(memx);
    ctx.save(); ctx.filter = 'saturate(0.35) contrast(1.15) brightness(0.9)'; ctx.drawImage(mem, 0, 0); ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.035)'; for (let y = 0; y < H; y += 6) ctx.fillRect(0, y, W, 2);
  }
  const recapLabel = (ctx, t) => {
    ctx.save(); ctx.font = '26px Mono700'; ctx.fillStyle = C.red; ctx.textBaseline = 'alphabetic';
    spaced(ctx, 'PREVIOUSLY · PART 1', 1016, 186, 3, 'right'); ctx.restore();
  };
  // 1. Recap: display 0 / flash / welcome home
  shot('recap0', 0, (ctx, t) => { recap(ctx, x => shot1('indicator_down').draw(x, P1.K.zero + 0.4 + t * 0.3, P1.K.zero + 0.4 + t * 0.3)); recapLabel(ctx, t); });
  shot('recap1', K.recapB, (ctx, t) => { recap(ctx, x => shot1('flash').draw(x, P1.K.flash + 4.5 / 30, 4.5 / 30)); recapLabel(ctx, t); });
  shot('recap2', K.recapC, (ctx, t, lt) => { recap(ctx, x => shot1('lock_notif').draw(x, P1.K.hasFace + 0.9 + lt * 0.2, P1.K.hasFace + 0.9 - P1.K.lockStart + lt * 0.2)); recapLabel(ctx, t); });

  // 2. Lobby: you turn away from the open, lit car and head for the stairs
  shot('lobby_stairs', K.lobby, (ctx, t, lt) => {
    const walking = t > K.turn + 0.25;
    const k = E.inOut(inv(K.turn + 0.25, K.stairs + 0.05, t));
    const x = lerp(215, -40, k);
    ctx.save(); camera(ctx, lerp(470, 380, k), 1190, 0.86);
    S.drawLobby(ctx, t, { light: flicker(t, 21, 0.06), door: 1, lit: 1, ind: { ch: '0', arrow: ' ' }, stairDoor: true,
      char: { x, y: 1720, s: 0.95, view: t > K.turn ? 'back' : 'front', arm: 'down', walk: walking ? t * 9 : undefined, headSX: t > K.turn - 0.1 && t < K.turn + 0.15 ? 0.3 : 1, rim: 0.4 } });
    ctx.restore();
  });
  // 3. Stairwell cross-section, eight floors
  shot('stairs', K.stairs, (ctx, t, lt) => {
    const u = E.inOut(clamp(lt / (K.corridor - K.stairs - 0.1)));
    const [px, py] = S2.stairPos(u);
    ctx.save(); camera(ctx, 540, py - 230, 0.74);
    S2.drawStairwell(ctx, t, { char: { x: px, y: py, s: 0.9, view: 'back', arm: 'down', walk: lt * 14, color: C.white, fill: '#0b1022' } });
    ctx.restore();
  });
  // 4. Corridor: your hallway, your door (already ajar)
  shot('corridor', K.corridor, (ctx, t, lt) => {
    const push = E.inOut(inv(K.yourDoor - 0.2, K.door8c + 0.1, t));
    const lights = [0, 1, 2, 3, 4].map(i => 0.75 * flicker(t, 30 + i, 0.05));
    ctx.save(); camera(ctx, lerp(540, 690, push), lerp(960, 1000, push), lerp(1.0, 1.7, push));
    S2.drawCorridor(ctx, t, { lights, ajar: 1, tv: 0.7 + 0.3 * noise1(t * 9), indCh: '0',
      char: { d: lerp(1.25, 1.75, clamp(lt / 1.8)), X: -110, view: 'back', arm: 'phone', lit: 0.4, walk: t * 8.5 } });
    ctx.restore();
  });
  // 5. 8C, open a crack
  shot('door8c', K.door8c, (ctx, t, lt) => {
    const [dx, dy] = S2.corridorPoint(430, 330, 2.62);
    ctx.save(); camera(ctx, dx - 40, dy - 40, lerp(2.4, 2.75, clamp(lt / 2)));
    S2.drawCorridor(ctx, t, { lights: [0.7, 0.7, 0.7, 0.7, 0.7].map((v, i) => v * flicker(t, 40 + i, 0.05)), ajar: 1, tv: 0.55 + 0.45 * noise1(t * 12) });
    ctx.restore();
  });
  // 6. Through the gap: TV, couch, someone in your spot
  shot('gap', K.gap, (ctx, t, lt) => {
    const z = lerp(1.0, 1.15, E.sine(inv(K.gap, K.spot, t))) + lerp(0, 0.75, E.inOut(inv(K.spot - 0.1, K.phone, t)));
    ctx.save(); camera(ctx, 540, lerp(1000, 1060, E.inOut(inv(K.spot - 0.1, K.phone, t))), z);
    S2.drawApartment(ctx, t, { gap: lerp(0.08, 0.15, clamp(lt / 4)), who: { mode: 'couch' } });
    ctx.restore();
  });
  // 7. Phone: buzz from "Me"
  let corBG = null;
  const bgFn = (ctx) => {
    if (!corBG) { corBG = createCanvas(W, H); const x = corBG.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, W, H); x.save(); camera(x, 690, 1000, 1.6); S2.drawCorridor(x, 1, { lights: [0.7, 0.7, 0.7, 0.7, 0.7], ajar: 1, tv: 0.9 }); x.restore(); }
    ctx.save(); ctx.filter = 'blur(26px)'; ctx.drawImage(corBG, 0, 0); ctx.restore(); ctx.fillStyle = 'rgba(3,4,10,0.35)'; ctx.fillRect(0, 0, W, H);
  };
  shot('phone_me', K.phone, (ctx, t, lt) => {
    const b = t - K.buzz; const buzzing = (b > 0 && b < 0.26) || (b > 0.4 && b < 0.66);
    const sh = buzzing ? [(hash(Math.floor(t * 60)) - 0.5) * 18, (hash(Math.floor(t * 60) + 5) - 0.5) * 10] : [0, 0];
    S.drawPhone(ctx, t, { bg: bgFn, screen: 'lock', time: '12:11', shake: sh, scale: lerp(1.08, 1.16, E.sine(clamp(lt / 3))),
      notifs: [{ a: (t - K.buzz) / 0.3, icon: 'me', iconBg: '#26304f', title: 'Me', lines: [{ text: '1 new message' }, { text: 'Your number', col: C.lime, font: '26px Inter600', a: (t - K.ownNumber + 0.05) / 0.2 }], h: 182, hl: t > K.ownNumber }] });
  });
  shot('chat_me', K.chat, (ctx, t, lt) => {
    S.drawPhone(ctx, t, { bg: bgFn, screen: 'chat', contact: { name: 'Me', avatar: 'me', hl: true }, sub: 'Text Message · Today 12:11 AM',
      scale: lerp(1.13, 1.2, E.sine(clamp(lt / 1.6))), bubbles: [{ text: 'Go back downstairs.', a: (t - K.msg) / 0.25 }] });
  });
  // 8. You push the door open; it turns; it's you; it smiles
  shot('push', K.push, (ctx, t, lt) => {
    const gap = lerp(0.12, 1, E.inOut(inv(K.pushOpen - 0.05, K.pushOpen + 0.95, t)));
    const turning = t > K.turn2;
    const sq = turning ? Math.abs(Math.cos(clamp((t - K.turn2) / 0.5) * Math.PI)) : 1;
    const stand = t > K.turn2 + 0.25;
    const z = stand ? lerp(1.0, 1.35, E.inOut(inv(K.itsYou - 0.1, K.smile, t))) : lerp(1.0, 1.05, clamp(lt / 2));
    const [sx, sy] = shake(t, K.turn2 + 0.25, 10, 0.3);
    ctx.save(); camera(ctx, 540, stand ? lerp(1100, 1060, inv(K.itsYou, K.smile, t)) : 1100, z, sx, sy);
    S2.drawApartment(ctx, t, { gap, who: stand ? { mode: 'stand', headSX: Math.max(0.12, sq) } : { mode: 'couch', headSX: Math.max(0.12, sq), headDY: turning ? -10 : 0 } });
    ctx.restore();
  });
  shot('smile', K.smile, (ctx, t, lt) => {
    const grin = E.inOut(inv(K.smiled - 0.45, K.smiled + 0.8, t));
    const z = lerp(3.6, 4.4, E.sine(clamp(lt / (K.slamShot - K.smile)))) + 0.15 * Math.exp(-Math.max(0, t - K.smiled) * 4) * (t > K.smiled ? 1 : 0);
    const [sx, sy] = shake(t, K.smiled, 8, 0.4);
    ctx.save(); camera(ctx, 540, 985, z, sx, sy);
    S2.drawApartment(ctx, t, { gap: 1, who: { mode: 'stand', grin } });
    ctx.restore();
  });
  // 9. The door slams in your face (it's still grinning)
  shot('slam', K.slamShot, (ctx, t, lt) => {
    const gap = lerp(0.55, 0, E.in(inv(K.slam - 0.05, K.slam + 0.1, t)));
    const [sx, sy] = shake(t, K.slam + 0.08, 36, 0.5);
    ctx.save(); camera(ctx, 540, 1060, 1.25, sx, sy);
    S2.drawApartment(ctx, t, { gap, who: { mode: 'stand', grin: 1 } });
    ctx.restore();
  });
  // 10. Smart lock: unrecognized face
  shot('lock', K.lock, (ctx, t, lt) => {
    const b = t - K.lock - 0.15; const buzzing = (b > 0 && b < 0.26);
    const sh = buzzing ? [(hash(Math.floor(t * 60)) - 0.5) * 18, (hash(Math.floor(t * 60) + 5) - 0.5) * 10] : [0, 0];
    S.drawPhone(ctx, t, { bg: bgFn, screen: 'lock', time: '12:12', shake: sh, scale: lerp(1.1, 1.2, E.sine(clamp(lt / 2.6))),
      notifs: [{ a: b / 0.3, icon: 'lock', iconBg: '#e8ecf6', title: 'Smart Lock', h: 270, hl: true, thumb: (t - K.unrec + 0.2) / 0.3, thumbCol: 'rgba(255,51,71,0.95)',
        lines: [{ text: 'Unrecognized face', font: '28px Inter700', col: '#ffffff', a: (t - K.unrec + 0.05) / 0.2 }, { text: 'Front Door · Denied', font: '27px Inter500', col: C.red, a: (t - K.unrec - 0.25) / 0.2 }] }] });
  });
  // 11. You don't live here anymore — the lights go out, far to near
  shot('lights_out', K.alone, (ctx, t, lt) => {
    const lights = [0, 1, 2, 3, 4].map(i => (t < K.alone + 0.35 + (4 - i) * 0.24 ? 0.7 * flicker(t, 50 + i, 0.05) : 0));
    ctx.save(); camera(ctx, 560, 980, lerp(1.0, 1.06, clamp(lt / 2)));
    S2.drawCorridor(ctx, t, { lights, ajar: 0, indCh: '0', char: { d: 2.05, X: 230, view: 'back', arm: 'phone', lit: 0.5 } });
    ctx.restore();
  });
  // 12. Down the hall, the elevator opens — lit, empty, waiting
  shot('hall', K.hall, (ctx, t, lt) => {
    const open = E.inOut(inv(K.ding + 0.3, K.ding + 1.2, t));
    const lit = E.out(inv(K.ding + 0.25, K.ding + 0.7, t));
    const push = E.inOut(inv(K.lit, K.display, t));
    ctx.save(); camera(ctx, 540, lerp(980, 900, push), lerp(1.0, 2.7, push));
    S2.drawCorridor(ctx, t, { lights: [0, 0, 0, 0, 0], ajar: 0, elevOpen: open, elevLit: lit, indCh: '0', char: push < 0.22 ? { d: 2.05, X: 300, view: 'back', arm: 'down', rim: lit * 0.6 } : null });
    ctx.restore();
  });
  // 13. The display says 0 — you're on floor 8
  shot('display', K.display, (ctx, t, lt) => {
    const back = E.inOut(inv(K.eight - 0.05, K.eight + 0.6, t));
    const [ix, iy] = S2.corridorPoint(0, -360, 8);
    const z = lerp(lerp(10.5, 11.6, clamp(lt / 1.5)), 4.6, back);
    ctx.save(); camera(ctx, lerp(ix, ix + 12, back), lerp(iy - 4, iy + 22, back), z);
    S2.drawCorridor(ctx, t, { lights: [0, 0, 0, 0, 0], ajar: 0, elevOpen: 1, elevLit: 1, indCh: '0', plaque: true });
    ctx.restore();
  });
  // 14. Rule #2
  let ruleBG = null;
  shot('rule', K.rule, (ctx, t, lt) => {
    if (!ruleBG) { ruleBG = createCanvas(W, H); const x = ruleBG.getContext('2d'); shots.find(s => s.name === 'hall').draw(x, K.display - 0.01, K.display - K.hall); }
    S2.drawRuleCard(ctx, t, lt, { bg: ruleBG, title: 'RULE #2',
      lines: [{ text: 'ONCE IT HAS', t: Wd(23, 3) }, { text: 'YOUR FACE,', t: Wd(23, 6) }, { text: 'FLOOR [0] IS {HOME.}', t: Wd(23, 8) }],
      footer: 'FOLLOW FOR PART 3', footerT: Ln(23).end + 0.25, footer2: 'THE ELEVATOR IS WAITING' });
  }, { captions: false, vignette: 0.4 });

  shots.find(s => s.name === 'recap1').meta = { hideHud: () => false };
  return { shots, K, hudState };
};
