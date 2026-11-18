# BLOCK C — progress log

**COMPLETE (2026-11-19 ~02:30 IST): all 8 parts queued. Next series: NIGHT SHIFT (`series/night-shift/SERIES.md`), Episode 1 for 2026-11-20.**

**Status 2026-11-19 ~02:30 IST (creator run):** Part 8 (FINALE) built and QUEUED for 2026-11-19. ANALYTICS review for 2026-11-19
done. Credits left 28,114 (19 episodes to make through 2026-12-08 -> ~1,480 each). BLOCK C post-mortem in `series/RESEARCH.md`.

## Part 8 "Morning roll call" (FINALE) — QUEUED for 2026-11-19 (branch B, no votes)
- Vote on Part 7: **A = 0, B = 0** (Instagram 0 comments; YouTube @dontletitsee 0; @lexter2025 0). No votes -> the scarier
  branch, B (find R. 13). Recap stamp "YOU CHOSE B / YOU LOOK FOR R. 13" over line 3.
- Output: `outputs/block-c-p8.mp4` (76.1 s, 10.8 MB, −14.0 LUFS; SFX/music ~12 dB under the voice) + `outputs/block-c-p8.jpg`
  (cover "THE WARDEN WAS ME" over the warden's arm, sleeve slid back, hostel tag "BLOCK C · 13", holding the red pen over the
  register); jsDelivr @ `a9f1c67` (mp4 + jpg HTTP 200 at once; raw.githubusercontent fallback 200). Queue id `block-c-p8`.
- Voice: 1,424 credits (eleven_v4, Jack), transcript 0. 24 lines / 175 words (shorter, ≤ 80 s as planned). Files in `block-c/p8/audio/`.
- Standard kept: bright frame 1 (the register page in daylight, row 13 = your red-ink name stamped LEFT, date 19 / 11 / 2020
  circled on "six years ago"), small hook "I LEFT HERE / 6 YEARS AGO". YT title is a hook sentence, no "Part 8".
- Story: 3:04, footsteps on the stairs; you don't run, you look for R. 13; "i never left. find me."; behind the wardrobe the wall
  is covered in tally marks (hundreds of roll calls) and under them a name scratched and traced in red: yours, your handwriting
  (split: the list's 12:07 vs the wall — same slant, same sevens); you wrote the rules (signature R. 13 ringed); the footsteps
  stop at room 13, the bolt slides itself, the door opens on its own; the warden holds out the register and a pen; its sleeve
  slides back: a hostel tag, BLOCK C · 13 — it was the last student too; you take the pen; the coat fits. 12:07 the next night:
  a new student moves into room 13 (lit room, his bag); "the last student in room thirteen left him a list" (loop to Part 1's
  first line); you scratch out rule 6 so hard the paper tears; rule card "RULE #6 · NEVER ANSWER TWICE."; you walk the dark
  corridor and call his name: the light under his door turns red (Part 1's last image).
- Choice offered (answerable, no next part): **Would you answer? A) YES · PRESENT  B) NEVER**, then "BLOCK C · THE END / A NEW
  STORY TOMORROW · 3 PM".
- Engine: `sets.js` adds drawTallyWall (wall behind the wardrobe: 117 tally groups, red scribble name, ring, sliding wardrobe
  edge, torch pool), drawOffer (lit doorway, coat, sleeve that slides back to show the wrist + hostel tag, pen, register with an
  empty red row, your hand taking the pen), `scribble` helper; drawRegister gets `bright` + `time`; drawList gets `scratch`
  (0 = rule 6 still readable, animates the scratching; tear only at 1). `mix.py` part8: music_p3 underscore, then Part 1's
  music.mp3 from "12:07, the next night" (callback), scratch bursts on the tallies, bolt + creak, stretch on the sleeve, pen
  strokes for the scratch-out, a paper-tear burst, lights_off cascade.

**Status 2026-11-18 11:11 IST (creator run):** queue full through 2026-11-18 (Part 7 jsDelivr mp4 + jpg re-verified HTTP 200); nothing built. Part 8 = FINALE (2026-11-19) waits for the A/B vote on Part 7 (posts today 15:00 IST); build it on/after 2026-11-18 23:00 IST. ANALYTICS review for 2026-11-18 already done. Credits 29,538.

**Status 2026-11-18 ~01:50 IST (creator run):** Part 7 built and QUEUED for 2026-11-18. Next: Part 8 = FINALE (2026-11-19)
after the Part 7 vote (posts 15:00 IST today; build it on/after 23:00 IST). ANALYTICS review for 2026-11-18 done. Credits left
29,538 (~16 parts at 1,800): BLOCK C finale, then a new ~8-part series (design it right after the finale is queued), then a last
short series ending on a finale made with the last credits ~Dec 3-4.

## Part 7 "The scratched rule" — QUEUED for 2026-11-18 (branch A, 1 voter)
- Vote on Part 6: YouTube @dontletitsee had 2 comments from ONE viewer ("i sat B" at 12:49 UTC, then "A" at 12:50 UTC) ->
  counted as 1 voter whose final answer is **A**; Instagram 0 comments, @lexter2025 0. Branch A (warn everyone). Recap stamp
  "YOU SAID A / YOU WARN EVERYONE" over lines 3-5.
- Output: `outputs/block-c-p7.mp4` (95.6 s, 13.7 MB, −14.2 LUFS; SFX ~8.4 dB under the voice) + `outputs/block-c-p7.jpg`
  (cover "RULE 6 [WAS HIDDEN]" over the backlit rule 6 with "twice" circled); jsDelivr @ `f099e9c` (mp4 + jpg HTTP 200 at
  once). Queue id `block-c-p7` (also carries `video_url_fallback` on raw.githubusercontent, verified 200).
- Voice: 1,759 credits (eleven_v4, Jack), transcript 0. 32 lines / 209 words. Files in `block-c/p7/audio/`.
- Standard kept: bright frame 1 (the LIT green corridor, a crowd of students from behind at one open door, slow push-in), small
  hook "42 STUDENTS / ONE DOOR". YouTube title again WITHOUT "Part 7" (test #5 continues; only one change at a time).
- Story: Dev's door (room 11) is open, the crowd outside it; you type "thats not me. dont open your doors" -> sent; right under
  it member 43 (+91…43 · ROOM 13) sends the same words, same second (two identical ROOM 13 cards); Rohan "which one of you is
  real??", Arjun "ask him something only he would know"; you're new, nobody knows your name (room 13's blank name card) - "It
  does." (the warden in the dark corridor); Dev last seen 3:02; every tube light dies far->near; from the stairwell the warden
  calls your name AGAIN (register: second red stroke in your row's MARK column); you run to room 13, the list; phone light
  behind the paper, the pressed-in words of rule 6 show through: "If the warden calls a name twice, that student leaves
  Block C." -> the register's LEFT stamp; under it, smaller, in red: "i never left. find me." (signed R. 13); footsteps coming
  UP the stairs, and the only way to the gate is down them.
- HUD: PART 7 · 3:03 → 3:04 AM · BATTERY 16→15% · ROOM 13 · LEFT · HEADCOUNT 43 · ROOM 11 DOOR OPEN → WARNING SENT → MEMBER 43
  SENT IT TOO → YOU × 2 → WHO IS REAL? → LIGHTS OFF → NAME CALLED 1 → 2 → RULE 6 FOUND (lime) → R. 13 NEVER LEFT → STAIRS COMING
  UP → GATE DOWN THE STAIRS.
- Engine: `sets.js` drawList gets `back` (light behind the paper, tear glows), `reveal` (rule 6 text shows through, 3 lines),
  `hlTwice`, `note` ("i never left. find me."); drawHostelCorridor gets `open` (door standing open, warm light spill);
  drawRegister gets `calls` (red tally strokes). `part7.js` adds the crowd (CROWD, drawStudentBack standing) + a screen wash
  for the bright corridor. `mix.py` part7: music_p2 underscore, lights_off cascade, slowed echoing whisper for the far voice,
  pen strokes on each name call, fast stairs for the run, wood door slam, paper rustle.
- Choice offered: **A) RUN FOR THE GATE** (past the stairs, get out tonight)  **B) FIND R. 13** (who wrote the list, never left).
  The card footer says "MOST VOTES DECIDE THE FINALE".
- Open threads for Part 8 (bible finale "Morning roll call"): security register shows you signed out six years ago; at 12:07
  the next night a new student moves into Room 13 and YOU are the one calling names; you tape your own list in the wardrobe
  and scratch out rule 6. Rule card "RULE #6: NEVER ANSWER TWICE." Loop to Part 1. Fold in the branch: A (gate) -> you reach
  the gate, the security guard's register shows your name signed OUT six years ago; B (find R. 13) -> R. 13 is you (your
  handwriting, the list is yours). Both lead to the loop. Dev's door open, Kabir missing, member 43 = it, plates dated 16/11.

**Status 2026-11-17 ~02:30 IST (creator run):** Part 6 built and QUEUED for 2026-11-17. Next: Part 7 (2026-11-18) after the
Part 6 vote (posts 15:00 IST today; build it on/after 23:00 IST). ANALYTICS review for 2026-11-17 done. Credits left 31,297
(~17 parts at 1,800): BLOCK C Parts 7-8, then a new ~8-part series, then a last series ending on a finale ~Dec 3-4.

## Part 6 "43" — QUEUED for 2026-11-17 (branch A, 1 vote)
- Vote on Part 5: **A = 1** (YouTube @dontletitsee "Leave the group! First comment"), B = 0; Instagram 0 comments,
  @lexter2025 0. Branch A (you leave the group). Recap stamp "YOU SAID A / YOU LEFT THE GROUP" over lines 3-4.
- Output: `outputs/block-c-p6.mp4` (86.7 s, 14.5 MB, −13.9 LUFS; SFX ~9 dB under the voice) + `outputs/block-c-p6.jpg`
  (cover "MEMBER 43 [IS ME]" over the photo-of-you-from-behind shot); jsDelivr @ `2a87c8b` (jpg 200 at once; the mp4 gave
  404/503 for ~15 min, then HTTP 200 video/mp4). Queue id `block-c-p6`; the entry also carries `video_url_fallback`
  (raw.githubusercontent, verified 200) in case jsDelivr fails again at post time.
- Voice: 1,676 credits (eleven_v4, Jack), transcript 0. 35 lines / 192 words. Files in `block-c/p6/audio/`.
- Standard kept: bright frame 1 (the lit mess hall, 42 pale blank faces turned at camera, slow push-in), small hook
  "MEMBER 43 / IS ME". **Test #5 (the one change): the YouTube title has no "Part 6"** (series name only; part number in
  the description). Compare YT views at 10 h / 34 h with P4 (47 / 185) and P5 (61 at 10 h).
- Story: you tap Exit group -> "You left"; one second of quiet, 42 eyeless faces still turned to you; buzz: "+91 … 43 added
  you"; you tap the name: contact info of member 43 = Room 13, YOUR number "(You)", About "Block C · Room 13"; the profile
  photo is you from behind, standing in the mess, timestamp 3:01 NOW; you don't turn around; "it" types and sends, on YOUR
  side of the chat: "guys its me. room 13" / "im locked out. can someone open their door?" — your phone was in your hand
  the whole time; Dev (room 11, upstairs) replies "coming. opening my door"; rule 1 (answer only to your own name) — Dev
  answered to yours; a bolt slides open upstairs; the 42 students stand up at once and walk to room 11; you can still type
  ("thats not m…").
- HUD: PART 6 · 3:01 → 3:02 AM · BATTERY 18→17% · ROOM 13 · LEFT · HEADCOUNT 43 · GROUP 43 MEMBERS → LEFT (lime) → ADDED BACK
  → MEMBER 43 = YOU → NUMBER MATCH 100% → SENT AS YOU → DEV ROOM 11 → DEV ANSWERED → ROOM 11 OPEN → HEADCOUNT MOVING.
- Engine: `sets.js` adds drawMemberInfo (contact screen: square photo = drawMess with you from behind, name/number/about rows
  with highlight rings, red "3:01 · NOW" tag); drawGroupChat gets system pills (`sys`, ring, tap ripple), your-side bubbles
  (`mine`, ✓✓), an Exit-group action sheet (`sheet`/`tap`), `footer`, and passes `compose` (keyboard); drawStudentBack/drawMess
  get `rise` (students stand up, staggered). `mix.py` part6: music_p3 underscore, synthesized bench scrape for 42 standing at
  once, bolt noise, sent/typing/button UI sounds, shutter on "the photo is you", heartbeat under "you don't turn around".
- Choice offered: **A) WARN EVERYONE** (tell them it isn't you)  **B) STAY QUIET** (it's learning how you type).
- Open threads for Part 7 (bible "The scratched rule"): under light, the scratched rule 6 reads "If the warden calls a name
  twice, that student leaves Block C." The warden has called your name twice. Choice: A) run for the gate B) find the last
  occupant of Room 13. Fold in the branch: A (warn) -> your warning arrives as "thats not me" but the group sees it sent by
  member 43 too / nobody believes; B (quiet) -> member 43 writes in your exact style. Dev's door is open; the 42 are at room
  11; Kabir still missing; plates dated 16/11.

**Status 2026-11-16 11:11 IST (creator run):** queue full through 2026-11-16 (Part 5 jsDelivr URLs re-verified HTTP 200); nothing built. Part 6 (2026-11-17) waits for the A/B vote on Part 5 (posts today 15:00 IST); build it on/after 2026-11-16 23:00 IST. ANALYTICS review for 2026-11-16 already done. Credits 32,973.

**Status 2026-11-16 02:00 IST (creator run):** Part 5 built and QUEUED for 2026-11-16. Next: Part 6 (2026-11-17) after the
Part 5 vote (posts 15:00 IST today; build it on/after 23:00 IST). ANALYTICS review for 2026-11-16 done. Credits left 32,973
(~18 parts at 1,800): BLOCK C Parts 6-8, then a new ~8-part series, then a last series ending on a finale ~Dec 3-4.

## Part 5 "The mess at 3 AM" — QUEUED for 2026-11-16 (branch A, no votes)
- Vote on Part 4: **A = 0, B = 0** (Instagram 0 comments; YouTube @dontletitsee 1 comment, "shooting it rn", not a vote;
  @lexter2025 0). No votes -> the scarier branch, A (follow them to the mess). Recap stamp "YOU CHOSE A / YOU FOLLOWED THEM
  TO THE MESS" over line 3.
- Output: `outputs/block-c-p5.mp4` (87.7 s, 14.7 MB, −14.1 LUFS; SFX ~15 dB under the voice) + `outputs/block-c-p5.jpg`
  (cover "DINNER AT 3 AM" over the hall of turned pale faces); jsDelivr @ `927c89c` (both HTTP 200). Queue id `block-c-p5`.
- Voice: 1,753 credits (eleven_v4, Jack), transcript 0. 34 lines / 195 words. Files in `block-c/p5/audio/`.
- **Test #4 applied (bright, recognizable frame 1):** frame 1 = the WELL-LIT mess hall wide (tube lights, 3 rows of students
  from behind lifting spoons in unison, the warden at the counter, steaming pots), slow push-in; burned-in hook smaller and
  4 words ("DINNER AT / 3 AM"); first VO line "Forty-two students are eating dinner at three in the morning." Compare
  Part 5's IG 3-second skip rate with Part 4 (69.6%), Part 3 (62.8%) and the bright openers (46.9 / 53.6%).
- Story: the hall lit, plates of rice and dal still steaming; everyone sits perfectly straight, spoons up/down in unison,
  nobody chewing ("like they're practising how to eat"); the warden serving behind the counter, register under one arm;
  the one empty chair at the end of the last table: a covered plate, a card "ROOM 13" and tomorrow's date (16 / 11);
  rule 4 ("not for you — so why is your plate here?"); you don't sit; every spoon stops; 42 heads turn at once — smooth
  pale blank faces (like the thing under the bed); the warden opens the register, a pen writes your row in red; phone:
  BLOCK C group, 43 members; rule 5; "the forty-third member is typing. Right now." (+91 ••••• •••43).
- HUD: PART 5 · 3:00 → 3:01 AM · BATTERY 19→18% · ROOM 13 · LEFT · HEADCOUNT 43 · MESS OPEN → SPOONS IN SYNC → SERVING
  WARDEN → EMPTY CHAIR 1 → PLATE ROOM 13 (lime) → PLATE DATE 16 / 11 → HEADS TURNED → GROUP 43 MEMBERS → MEMBER 43 TYPING…
- Engine: `sets.js` adds drawMess (bright hall, 3 rows of seated students from behind via drawStudentBack with lift/stop/
  turn, counter + warden, empty place with covered plate, `me`), drawCoveredPlate (dome + card ROOM 13 + red date), messSeat/
  messEmpty helpers; drawGroupChat gets `typing` (+ `typingFrom`). `mix.py` part5: synthesized unison spoon clinks on every
  down-beat, silence + clink when the spoons stop, low creaks for the heads turning, pen scratches, typing.mp3.
- Choice offered: **A) LEAVE THE GROUP** (rule 5 says leave it)  **B) SCROLL UP · SEE WHO IT IS** (who is member 43?).
- Open threads for Part 6 (bible "43"): the new member is you (your number, your photo, typing); messages from "you" ask
  others to open their doors. Choice: A) warn everyone  B) stay quiet. If A (leave) wins: you leave, but "you" re-add
  yourself / the group shows "You left" and then "+91…43 added you"; if B wins: scroll up to your own photo. The warden
  wrote your row in red; plate dated 16/11; Kabir still unaccounted for (last texted "washroom. now.").

**Status 2026-11-15 11:11 IST (creator run):** queue full through 2026-11-15 (Part 4 jsDelivr URLs re-verified live); nothing built. Part 5 (2026-11-16) waits for the A/B vote on Part 4 (posts today 15:00 IST); build it on/after 2026-11-15 23:00 IST. ANALYTICS review for 2026-11-15 already done.

**Status 2026-11-15 01:40 IST (creator run):** Part 4 built and QUEUED for 2026-11-15. Next: Part 5 (2026-11-16) after
the Part 4 vote (posts 15:00 IST today; build it on/after 23:00 IST). ANALYTICS review for 2026-11-15 done.

## Part 4 "Under the bed" — QUEUED for 2026-11-15 (branch A, no votes)
- Vote on Part 3: **A = 0, B = 0** (Instagram 0 comments, YouTube @dontletitsee 0, @lexter2025 0). No votes -> the scarier
  branch, A (you look under the bed). Recap stamp "YOU CHOSE A / YOU LOOKED UNDER THE BED".
- Output: `outputs/block-c-p4.mp4` (89.0 s, 11.8 MB, −14.0 LUFS) + `outputs/block-c-p4.jpg` (cover "NO FACE", the pale
  faceless head under the bed); jsDelivr @ `7b788ef` (both HTTP 200). Queue id `block-c-p4`.
- Voice: 1,694 credits (eleven_v4, Jack), transcript 0. 34 lines / 197 words. Files in `block-c/p4/audio/`.
- **Test #3 applied (short hook + motion on frame 1):** burned-in hook is 5 words ("DON'T LOOK / UNDER HIS BED", no
  kicker line), frame 1 = the pale hand already crawling out of the dark at the camera with a fast push-in + shake;
  first VO line 7 words ("Something is breathing under your roommate's bed."). CTA kept as in Part 3 (spoken A/B card).
  Compare Part 4's IG 3-second skip rate with Part 3 (62.8%) and Parts 1-2 (53.6 / 54.7%).
- Story: you kneel, torch on; the hand slides back "like it knows the light"; the beam finds dust, one slipper, a steel
  mess plate; a shape lying flat wrapped in Kabir's blanket, too long to be a person (it runs past the bed into the wall),
  its head right by you; it turns: no face, a smooth pale circle; it whispers "Present." in YOUR voice (VOICE MATCH · YOU
  · 100%); the torch dies; black, you count to three; light back: nothing under the bed, only "43" scratched into the
  floor; phone: 2:59 — two hours gone; the 3 AM mess bell; every door in Block C opens at once; the whole block walks past
  your door to the mess, nobody talking; rule 4; Kabir texts "washroom. now." / "don't go with them" — but Kabir himself
  said it does voices (his 1:05 message ringed red).
- HUD: PART 4 · 1:05 → 1:06 → 2:59 → 3:00 AM · BATTERY 26→25→**19%** · ROOM 13 · LEFT · HEADCOUNT 43 · UNDER BED
  BREATHING → NOT KABIR → EMPTY (lime) → LOST TIME 1 H 53 M → MESS OPEN → KABIR WASHROOM? → KABIR VOICE?
- Engine: `sets.js` drawUnderBed gets the torch beam (st.torch/tx/ty/tr/flick, items: slipper + steel thali, shape +
  headTurn: the wrapped faceless figure, scratch: the carved "43", dark); drawDoorGap gets `walkers` (feet shadows
  passing the door). `mix.py` part4: synthesized mess bell (partials), torch click (button.mp3), scratch noise, stairs bed
  for the walking block, heartbeat on each count, music_p2 underscore.
- Choice offered: **A) FOLLOW THEM TO THE MESS** (rule 4: not for you)  **B) HIDE IN THE WASHROOM** (if that is really Kabir).
- Open threads for Part 5 (bible): the mess at 3 AM — 42 plates served, everyone eating silently, your plate has your name
  and tomorrow's date; group chat shows 43 members. Choice: A) leave the group  B) scroll up. (If B wins, start in the
  washroom: "Kabir" is there or isn't, then the mess pulls you in anyway.) The thing does voices (yours, Kabir's); the
  register for 14/11 marks you LEFT; 43 scratched under Kabir's bed; you lost ~2 hours.

**Status 2026-11-14 01:55 IST (creator run):** Part 3 built and QUEUED for 2026-11-14. Next: Part 4 (2026-11-15) after
the Part 3 vote (posts 15:00 IST today; build it on/after 23:00 IST). ANALYTICS review for 2026-11-14 done.

## Part 3 "Left" — QUEUED for 2026-11-14 (branch A, no votes)
- Vote on Part 2: **A = 0, B = 0** (Instagram 0 comments, YouTube @dontletitsee 0, @lexter2025 0). No votes -> the scarier
  branch, A (you open the door). Recap stamp says "YOU CHOSE A / YOU OPENED THE DOOR".
- Output: `outputs/block-c-p3.mp4` (84.7 s, 10.3 MB, −14.1 LUFS) + `outputs/block-c-p3.jpg` (cover "DON'T LOOK", the hand
  under the bed); jsDelivr @ `8c0764d` (both HTTP 200). Queue id `block-c-p3`.
- Voice: 1,620 credits (eleven_v4, Jack), transcript 0. 31 lines / 194 words. Files in `block-c/p3/audio/`.
- **Test #2 applied (stronger CTA), hook-first kept as the standard:** the narrator now SAYS the choice ("What do you do?
  A. Look under the bed. B. Get out of the room. Comment A or B."); the card lands ~11.7 s before the end (VO lines 28-31 +
  3.8 s hold), each option lights up lime while it is read, A/B pop when spoken, a bobbing arrow points at the comments,
  footer "MOST VOTES DECIDE PART 4 · TOMORROW 3 PM". Compare Part 3's A/B comment count with Part 1 (1) and Part 2 (0).
- Hook: frame 1 = the red door gap with the feet + the handle turning, burned-in "MY HOSTEL DOOR · 12:58 AM / IT TALKS IN /
  MY VOICE"; first VO line "Something outside your hostel room is talking in your voice."
- Story: the bolt slides, the door swings in; nobody, the corridor dead (tubes off, doors shut); at your feet the register
  lies open: dated 14 / 11 (tomorrow), your red row, and in the MARK column one word stamped in red: LEFT ("Not absent. Not
  late. Left." -> foreshadows rule 6); you slam and bolt the door; 1:04 AM; rule 3; Kabir texts: "bro where are you? i'm in
  the washroom since 12" / "don't open the door for anyone. it does voices." -> so what was breathing under his blanket all
  night (flashback to 12:40)? A slow breath under his bed; a whisper in Kabir's voice: "Don't look. Just come closer."; long
  pale fingers slide out from under the bed.
- HUD: PART 3 · 12:58 → 1:04 → 1:05 AM · BATTERY 27→26% · ROOM 13 · ALONE → **13 · LEFT** · HEADCOUNT 43 · KABIR MISSING →
  WASHROOM (lime) → **UNDER BED · BREATHING** (red).
- Engine: `sets.js` adds drawDoorway (door swings in onto the dead corridor, bolt, register on the threshold, you from
  behind) and drawUnderBed (the dark under the iron bed, hanging blanket edge that breathes, dust, the hand);
  drawRegister gets `mark` (red LEFT stamp) + `dateHL`; drawGroupChat takes `name`/`initial` (1:1 chat with Kabir).
  mix part3: bolt noise, door open/creak, slowed low "breath" from whisper.mp3 in the gaps, ticks on the spoken A/B.
- Choice offered: **A) LOOK UNDER THE BED** (rule 3 says never)  **B) GET OUT OF THE ROOM** (it is still in the corridor).
- Open threads for Part 4 (bible): branch payoff (A: what is under the bed / B: the corridor, the washroom where "Kabir" is),
  then the 3 AM mess bell rings for the whole block. Choice: A) go to the mess  B) hide in the washroom. Kabir is (says he is)
  in the washroom; the thing does voices (yours, Kabir's). The register for 14/11 marks you LEFT.

**Status 2026-11-13 11:11 IST (creator run):** queue full through 2026-11-13 (Part 2 URLs re-verified HTTP 200); nothing built. Part 3 (2026-11-14) waits for the A/B vote on Part 2 (posts today 15:00 IST); build it on/after 2026-11-13 23:00 IST. ANALYTICS review for 2026-11-13 already done.

**Status 2026-11-13 01:50 IST (creator run):** Part 2 built and QUEUED for 2026-11-13. Next: Part 3 (2026-11-14) after
the Part 2 vote (posts 15:00 IST today; build it on/after 23:00 IST). ANALYTICS review for 2026-11-13 done.

**Status 2026-11-12 11:11 IST (creator run):** queue full through 2026-11-12; nothing built. Part 2 (2026-11-13) still waits for the A/B vote on Part 1 (posts today 15:00 IST); build it on/after 2026-11-12 23:00 IST. ANALYTICS review for 2026-11-12 already done.

**Status 2026-11-12 01:15 IST (creator run):** queue full through 2026-11-12; nothing built. Part 2 (2026-11-13) waits
for the A/B vote on Part 1 (posts today 15:00 IST); build it on/after 2026-11-12 23:00 IST. ANALYTICS review done for
2026-11-12 (3-post pattern: sequels lose IG viewers in 3 s; Part 2 must open on a zero-context hook).

**Status 2026-11-11 01:12 IST (creator run):** queue full through 2026-11-12; nothing built. Part 2 (2026-11-13) still
waits for the A/B vote on Part 1 (posts 2026-11-12 15:00 IST); build it on/after 2026-11-12 23:00 IST. ANALYTICS
review done for 2026-11-11 (FLOOR 0 P2 skip rate 71%: Part 2's hook must work with zero context).

**Status 2026-11-10 01:05 IST (creator run):** queue full through 2026-11-12. Part 2 (2026-11-13) waits for the
A/B vote on Part 1, which posts 2026-11-12 15:00 IST; build it on/after 2026-11-12 23:00 IST. Apply ANALYTICS
"Next improvements" #1 (hook in the first 2 s) in Part 2.

## Part 2 "Present" — QUEUED for 2026-11-13 (branch A)
- Vote on Part 1: **A = 1** (YouTube @dontletitsee, the channel's first comment), B = 0; Instagram 0 comments,
  @lexter2025 0 comments. Branch A (you answered "Present"). Recap stamp says "YOU SAID A" (one vote, so not "most of you").
- Output: `outputs/block-c-p2.mp4` (90.8 s, 10.7 MB, −14.3 LUFS) + `outputs/block-c-p2.jpg`; jsDelivr @ `4001efd`
  (both HTTP 200). Queue id `block-c-p2`.
- Voice: 1,677 credits (eleven_v4, Jack), transcript 0. 33 lines / 194 words. Files in `block-c/p2/audio/`.
- **Test #1 applied (hook in the first 2 s):** frame 1 = the red light under the door with two feet shadows, burned-in
  hook "MY HOSTEL · 12:07 AM / A DEAD WARDEN / KNOWS MY NAME" (0–3.2 s), first VO line is a zero-context hook ("The dead
  warden of your hostel just called your name."); recap ("YOU SAID A") comes AFTER the hook. Nothing else changed
  (choice card and CTA as in Part 1) so the test reads cleanly. Compare Part 2's IG skip rate / avg watch with 52-54% / 15 s.
- Story: "Present" leaves your mouth; pages stop; a pen writes your row in red ink, slowly; the feet walk on past 14, 15,
  16 into the dark; Kabir under the blanket breathing too slowly; 12:40 group: Dev "who answered in 13?", Arjun "new guys
  always answer.", Dev sends a photo of tonight's register (all blue P marks, one red row: room 13, your name, circled);
  Dev: "red ink means it has your voice now" / "don't talk tonight. not even in your sleep."; 12:58 three soft knocks;
  rule 2 (the warden never knocks) so it is not the warden; it speaks through the door in YOUR voice ("Hey. It's me. Open
  up. I'm locked out."), the handle turns; behind you Kabir's bed creaks, the blanket is flat, his bed is empty.
- HUD: PART 2 · 12:07 → 12:09 → 12:40 → 12:58 AM · BATTERY 30→28→27% · ROOM 13 · BLOCK C → **13 · ALONE** (red) ·
  HEADCOUNT 43 (red) · VOICE YOURS → **NOT YOURS** (red, when Dev says it has your voice).
- Engine: `sets.js` drawRoom kabir.breath (slow blanket rise), drawDoorGap handle rotation; `part2.js` adds an `overlay`
  (hook title + recap stamp); mix part2 with synthesized pen scratch + 3 knuckle knocks in the gap.
- Choice offered: **A) OPEN THE DOOR** (it sounds exactly like you)  **B) LOOK UNDER THE GAP** (see what is standing there).
- Open threads for Part 3: who/what is outside in your voice; Kabir's bed is empty after ~1 AM (rule 3: don't look under
  it) — Part 3 per bible: what's outside (feet facing the wrong way / the register on the floor with tomorrow's date), then
  the empty bed at 1:04 AM, choice A) look under the bed B) leave the room. Votes: Part 2 IG media + YT video in queue.json.

## Part 1 "The List" — QUEUED for 2026-11-12 (built 2026-11-09 by the cloud creator)
- Output: `outputs/block-c-p1.mp4` (89.7 s, 11.4 MB, −14.4 LUFS) + `outputs/block-c-p1.jpg`;
  jsDelivr @ commit `66cf285` (both verified HTTP 200). Queue id `block-c-p1`.
- Voice: the saved take was reused (`block-c/p1/audio/vo.mp3`, `words_raw.json`, `vo_prompt.txt`), so this run
  spent **0 ElevenLabs credits**. (That take cost 1,643 credits, before the ledger's starting balance.)
  `scripts.py` P1 = 30 lines / 200 words, matching the transcript word for word.
- Workspace: `block-c/engine` (FLOOR 0 engine copy). Changes: `drawHUD` takes `rows` + `ampm`; `render.js` cover
  title from `P.coverTitle`; `drawPhone` takes `date` and `contact.initial`; new `sets.js` with drawRoom (room 13:
  wardrobe + list, Kabir's bed left, your bed right, barred window, study lamp, door far left with a light gap +
  feet shadows), drawList (the rules paper, torch pool, lime highlight per rule, rule 6 scribbled + torn),
  drawGroupChat (BLOCK C group, sender names), drawHostelCorridor (doors 9–14, green tubes, notice board, barred
  window, per-door glow), drawWarden (too tall, long coat, register book, face never shown), drawDoorGap,
  drawRegister (night roll-call register), drawPlate (BLOCK C · 13). mix.py: part1 + `noise_burst` for paper/page
  sounds; SFX are ducked 5 dB under the voice.
- HUD: PART 1 · 11:52 PM → 12:04 → 12:06 → 12:07 AM · BATTERY 31%→30% · ROOM 13 · BLOCK C · HEADCOUNT 42 →
  **43 (red) the moment it calls your name**.
- Story told: the list (rules 1–5 read and highlighted, rule 6 scratched out so hard the paper tore); roommate
  **Kabir** laughs it off, lamp off; BLOCK C group (Arjun: "new guy in 13 found the list yet?", Rohan: "lol go to
  sleep", Dev: "the warden of block C died six years ago" / "roll call never stopped."); 12:06; corridor tubes die
  far→near; the warden walks out of the dark toward room 9; rooms 9, 10, 11, 12 answer (light under each door);
  Kabir shaking under the blanket; footsteps stop outside 13; two feet shadows under the door; pages turn; it calls
  Kabir ("present", he goes still); it calls YOUR name; register insert: a new row for room 13 being written in red
  ink; "Nobody here knows your name. It does." — the light under the door turns red.
- Choice offered: **A) ANSWER "PRESENT"** (it already knows your name)  **B) STAY SILENT** (and hope it moves on).
- Open threads for Part 2: the red-ink row in the register; headcount now 43; Kabir answered and went still;
  rule 2 (the warden never knocks) is next. Names already used: Kabir Mehta (roommate, room 13), Ankit Sharma (9),
  Rohan Verma (10), Dev Malik (11), Imran Khan (12), Arjun (group chat).
- Votes: count on Part 1's IG media + YT video once they are posted (queue.json entry `block-c-p1`).
