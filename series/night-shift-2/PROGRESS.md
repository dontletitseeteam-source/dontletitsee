# NIGHT SHIFT Season 2 — progress log

Workspace: reuses `night-shift/engine` (same v4 engine). Season 2 episode n = engine part 8+n (`night-shift/p9` = S2 Ep 1,
`p10` = Ep 2 ...); outputs are `outputs/night-shift-2-p<n>.mp4/.jpg`. Render: `cd night-shift/engine && node render.js <8+n> ...`,
`python3 mix.py <8+n>`, `bash finalize.sh <8+n> NIGHTSHIFT2`.

**Status 2026-11-27 ~02:30 IST (creator run): Episode 3 QUEUED for 2026-11-30.** Real ElevenLabs balance 358 until the
2026-11-30 17:36 IST reset (40,000 then). Ep 4 (12-01) is built on 11-28: 358 < 800, so either wait for a run AFTER the reset
(the 11-28 01:xx run is before it; 12-01's post is still 3 days out) or make Ep 4 a no-voice episode. Recommended: the 11-28
run builds nothing if the queue already reaches 11-30 and D=12-01 can wait; the first run after 11-30 17:36 IST builds Ep 4 with
a full voice. Next: Ep 4 "The hostel night warden". (YouTube Data API quotaExceeded again on 11-27; Analytics API worked.)

## Episode 3 "The last bus" — QUEUED for 2026-11-30
- Output: `outputs/night-shift-2-p3.mp4` + `outputs/night-shift-2-p3.jpg` (cover: his whole hanging silhouette in the aisle,
  "His arms are / {three metres long.}", "NIGHT SHIFT · the last bus"); 59.9 s, 10.3 MB, -14.2 LUFS (stems VO -18.1 dB RMS, SFX -28.0, music -32.2, beds -36.5); jsDelivr @ `6970f96`
  (mp4 + jpg HTTP 200 first try).
- Voice: 834 credits (REAL, account_get_usage 38,808 -> 39,642), transcript 0. 18 lines / 141 words / 7 tags. Raw take 55.8 s,
  gaps widened to 59.9 s.
- Look (v4): own palette = sick mint-white tubes in an old red state bus, blue rexine seats, brass roof rails, amber streetlights
  sweeping the windows, black-green fields, red STOP lamp. New files: `engine/sets_bus.js` (one-point-perspective aisle
  `interior` with sweeping light, `hanger` = him hanging by zigzag double-jointed arms, toes dragging, head below the shoulders,
  `fold` arm, `conductor` with cash bag + ticket machine, `busSide` exterior with door/brakes, `busRear` driving away past the
  green "Kesarpur 12 km" sign with his arm out of the back window, `etm` ticket machine (02:40 = the only clock, taped rules
  note, printed ticket "to: Kesarpur"), `coinHand`, `cord` + STOP lamp, `village` house with one warm window, `hangerFace`),
  `part11.js`, mix.py `part11` (diesel drone + road rumble that stops at the brakes, rail creaks with the sway, joint ticks,
  ding per cord pull, air brakes + pneumatic doors, the bus pulling away).
- Story (clarity test): "A night bus conductor has two rules: every passenger needs a ticket, never ring the bell twice. A man
  hangs from the roof rail by arms three metres long; he pays (rule 1 kept), but his ticket says your village, where your
  mother sleeps. You pull the cord twice to stop the bus (rule 2 broken). He doesn't move: two bells means the CONDUCTOR gets
  off. You're left on the road; the bus drives on to your village with him, his arm waving from the back window."
- 24 shots: bright aisle hook (jerk at 0.3 s, title "Never ring the bell twice." 1.2 s), hands on the rail, dutch tilt down the
  zigzag arm, floor-level toes with rack focus, bus on the highway, you by the door, machine + taped note (2.5 s), over-shoulder
  on him for rule 1 (analytics 11-27: rule said over the monster), along the bell cord, 02:40 screen, POV walk, "Ticket,
  please" low angle, arm folding down, coin into your palm, your face, ticket printing (Kesarpur turns red), village window,
  cord pulled twice + STOP lamp, his head snapping up, air brakes, doors, SCALE (him floor-to-ceiling, you small by the door),
  your face, STOP lamp over him, you put off on the road, doors close, bus driving off past the sign, arm waving out of the back
  window, A/B over the last shot, loop cut to frame 1.
- Choice offered: **Which rule would you break? A) let him ride free  B) ring the bell twice** ("Just type A or B").
- YT title: "His arms were three metres long, hanging from my night bus rail | NIGHT SHIFT #shorts" (silhouette-wrong detail in
  the first 6 words).

## Episode 2 "The ATM booth" — QUEUED for 2026-11-29
- Output: `outputs/night-shift-2-p2.mp4` (59.3 s, 10.2 MB, -14.4 LUFS) + `outputs/night-shift-2-p2.jpg` (cover: her whole arch at
  the machine, "She's bent / {backwards.}", "NIGHT SHIFT · the ATM booth"); jsDelivr @ `de3daae` (mp4 + jpg HTTP 200 first try).
- Voice: 820 credits (REAL, account_get_usage 37,988 -> 38,808), transcript 0. 18 lines / 143 words / 8 tags. Raw take 54.3 s,
  gaps widened to 59.3 s.
- Look (v4): own palette = hard cold-white tube light in a glass booth, cobalt sign band, one sodium streetlight on a wet road,
  green-mono CCTV. New files: `engine/sets_atm.js` (booth world, `arch` = her backbend side silhouette with typing fingers,
  `tall` = her standing, hair over the face, `guard` with cap, note, keypad close with pale upside-down hands, `cctv` feed with
  timestamp (the only clock: 03:10), `mirrorView`), `part10.js`, mix.py `part10` (tube hum, fan, traffic wash, synth key beeps,
  footsteps + running, spine cracks, CCTV hiss, tape-jump clicks). Reuses `X.faceClose` for her upside-down talking face.
- Story (clarity test): "A new ATM guard has two rules: one customer at a time, never look at the mirror. A woman bent backwards
  is using the machine; he stops a man at the door (rule 1 kept), the man looks past him and runs. She asks him to look up; in the
  mirror nobody is at the machine, she is standing behind him. The machine is empty; the CCTV shows she was behind him all night —
  that's why the man ran." Plant: the 03:10 CCTV insert (line 6) already shows her faintly behind you.
- 23 shots: bright booth hook (head jerk at 0.3 s, cut closer at 1.3 s), arch profile (dutch), floor-level heels + upside-down face
  (rack focus), you getting up off the plastic chair, note (1.8 s), door sticker, tilt up to the mirror, CCTV 03:10, the man
  walking up, over-shoulder through glass, arm out at the door, your face, the man's eyes, the man running, keypad with her hands,
  her upside-down face talking, your face, punch-in on the mirror, mirror (empty), SCALE in the mirror (her far taller than you,
  head bent), empty machine with tube stutter, CCTV rolling back through the night, CCTV with the man looking past you, your face
  with her face lowering behind (focus pull), A/B over the last shot (you at the door, her right behind you), loop cut to frame 1.
- Choice offered: **Which rule would you break? A) let the man in  B) look in the mirror** ("Just type A or B").
- Hook title (frame 1, 1.3 s): "Never look at the mirror." YT title: "Bent backwards, a woman used my ATM upside down at 3 AM |
  NIGHT SHIFT #shorts" (silhouette-wrong detail in the first 2 words).
- Measure: vs Ep 1 (crossing) and Season 1 Ep 5/6 at 10 h (IG 751 vs 127 plays); does a silhouette-wrong woman match Ep 5?

## Episode 1 "The railway level crossing" — QUEUED for 2026-11-28
- Output: `outputs/night-shift-2-p1.mp4` (59.7 s, 10.2 MB, −14.3 LUFS; stems VO −18.1 dB RMS, SFX −27.5, music −34.5, beds −44.8)
  + `outputs/night-shift-2-p1.jpg` (cover: the crawler on the rails under the green signal, "He crawls / {bent backwards.}",
  "NIGHT SHIFT · the level crossing"); jsDelivr @ `da372f8` (mp4 + jpg HTTP 200 first try).
- Voice: 845 credits (REAL, account_get_usage 37,143 -> 37,988), transcript 0. 20 lines / 143 words / 8 tags. SPEED 1.00. Raw
  take 54.8 s; gaps widened to 59.7 s (silences before the bell, the stand-up, "Nobody", the twist, "on your side", the A/B).
- Look (v4, 2nd episode in it): own palette = cold LED floodlight (white-mint) over violet night, red-and-white boom barrier, red
  crossing lamps flashing, one warm hut bulb, signal green; serif captions; grain + bloom + handheld; rack focus on the rail and
  the lantern; whip pans on the scare cuts; dutch angles. New files: `engine/sets_crossing.js` (crossing world, `crawlerSide` /
  `crawlerFront` with a crawl->stand morph, barrier, signal, hut, lantern, note, bell+clock (2:40, the only time), winch,
  upside-down face close-up), `part9.js`, mix.py `part9` (synth electric crossing bell at 18 Hz, night wind, knuckle taps on the
  sleepers, barrier motor, winch creak, joint cracks, child whisper).
- Story (clarity test a): "A new gatekeeper at a railway crossing must close the gate when the bell rings and never open it for
  anyone on foot. The bell rings, no train comes; a man crawls up the tracks on all fours, back bent backwards, stands up taller
  than the signal post and calls in the gatekeeper's little brother's voice, so he opens the gate. Nobody is there, only the last
  gatekeeper's lamp: the thing was waiting for the gate to open, and now it's on his side." (b) captions + stills read as:
  something on the tracks / on all fours / back bent wrong / gatekeeper at the level crossing / two rules (note 2.6 s) / bell /
  close the gate / anyone on foot (prints of four limbs on the road) / bell rings / gate closes / rule one kept / no train /
  him crawling toward you / he stands up / taller than the signal / a small voice: Bhaiya, it's me / your little brother / you
  lift the gate / rule two broken / nobody / the last gatekeeper's lamp / waiting for the gate to open / now on your side (his
  face over your shoulder) / him standing behind you at the open gate. A stranger can retell it.
- 25 shots: bright crossing hook (head jerks at 0.3 s, cut closer at 1.75 s), rail-level profile with rack focus, you stepping out
  of the hut with a lantern, note, bell + clock, winch, road with four-limb prints, bell hammering, barrier lowering, your face,
  track POV (empty, then him crawling out of the dark), your face, stand-up behind the barrier, SCALE shot (him > signal post,
  you small by the hut), upside-down face talking, winch trembling, your face, barrier lifting behind you + punch-in, empty
  crossing with floodlight stutter, lantern insert, track POV signal turns red, raised barrier against the sky, your face with his
  face rising over your shoulder (focus pull on "side"), A/B over the last shot (you at the open gate, him standing right behind
  you), loop cut back to frame 1.
- Choice offered: **Which rule would you break? A) leave the gate up (when the bell rings)  B) open it for him** ("Just type A or B").
- Hook title (frame 1, 1.7 s): "Never open the gate." YT title: "Bent backwards on all fours, a man crawled to my railway gate |
  NIGHT SHIFT #shorts" (analytics 2026-11-25: silhouette-wrong detail inside the first 6 words; compare with Ep 5's late detail).
- Measure: YT views at 10 h / 34 h vs Season 1 Ep 4 (704 / 983) and Ep 5 (25 at 10 h); IG skip rate vs 33-35%.
