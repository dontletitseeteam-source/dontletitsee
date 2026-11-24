# NIGHT SHIFT Season 2 — progress log

Workspace: reuses `night-shift/engine` (same v4 engine). Season 2 episode n = engine part 8+n (`night-shift/p9` = S2 Ep 1,
`p10` = Ep 2 ...); outputs are `outputs/night-shift-2-p<n>.mp4/.jpg`. Render: `cd night-shift/engine && node render.js <8+n> ...`,
`python3 mix.py <8+n>`, `bash finalize.sh <8+n> NIGHTSHIFT2`.

**Status 2026-11-25 ~02:25 IST (creator run): Episode 1 QUEUED for 2026-11-28.** Real ElevenLabs balance 2,012 until the
2026-11-30 17:36 IST reset: Ep 2 (11-29) and Ep 3 (11-30) must each stay <= 850 characters (both are built before the reset).
Next: Ep 2 "The ATM guard" for 2026-11-29 (standalone; A/B votes only break ties between ready episodes).

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
