# NIGHT SHIFT — progress log

**Status 2026-11-23 ~01:55 IST (creator run):** Episode 7 built and QUEUED for 2026-11-26. Credits left 19,324 (12 episodes to make
2026-11-27 … 12-08 -> ~1,610 each; v2 episodes cost ~850, pace is comfortable). Next: Episode 8 (wedding-hall caretaker, season
finale) for 2026-11-27, then design the closing series (2026-11-28 … 12-08) per PLAYBOOK section 7 (post-mortem first). Daily
review + weekly competitor scan done today (ANALYTICS / RESEARCH 2026-11-23).

## Episode 7 "The highway toll booth" — QUEUED for 2026-11-26
- Output: `outputs/night-shift-p7.mp4` (59.2 s, 10.1 MB, −14.2 LUFS; stems: VO −18.1 dB RMS, SFX −25.5, beds −45.3, music −34.4)
  + `outputs/night-shift-p7.jpg` (cover: the driver in the cab window, hands on the wheel to the left, face pointing back to
  the right; "HIS HEAD IS {ON BACKWARDS}", "NIGHT SHIFT · 3 AM"); jsDelivr @ `33f8577` (mp4 + jpg HTTP 200 first try).
- Voice: 849 credits (eleven_v4, Jack), transcript 0. 21 lines / 145 words / 8 tags (`[low, calm]` base, `[whispering]` ×2,
  `[slow]` on the twist, `[short pause]` ×4). SPEED 1.00. Raw take 56.0 s.
- Change vs the bible: the old twist (receipts with tomorrow's date + an "accident" column) was too clever for v2. New plain twist:
  he walks BACKWARDS to your window so his face can see you, makes you look in his mirror, your head is turning around, his vest
  says TOLL STAFF: he was the last toll man, now it's your turn.
- Applied today's ANALYTICS lesson (silhouette rule): the entity's wrongness is in his outline (chest + hands + toes one way,
  face the other), shown big on frame 1, the cover, the walk and the scale shot. One change only; A/B card unchanged ("Just type
  A or B", the Ep 4-6 test).
- Clarity test (a): "A man on his first night at a highway toll booth meets a truck driver whose head is on backwards. The driver
  climbs out, walks backwards to the booth so his face can see him, and points at his mirror. In the mirror the toll man's head is
  turning around: the driver was the last toll man, and now it's his turn." (b) captions + 1-s stills read as: 3 AM / truck at
  your toll booth / driver's head on backwards / first night / 2 rules / hands on the wheel, face looks back / pays without turning
  / you lift the barrier / doesn't move / door opens / walks to your window backwards / now his face can see you / taller than
  your booth / taps the glass, points at his mirror / you look / your head is turning around / toll staff / last toll man / your
  turn. A stranger can retell it.
- 23 shots: bright plaza hook, cab close (profile), you walk into the booth, note + 2 rule cards, hands -> face pan, wide road,
  POV paying (arm bent the wrong way), UP button, barrier lifts (lane light X -> green arrow), still truck (pause), door opens
  (dome light), the backwards walk, POSTER (his back in the TOLL STAFF vest, face on top, through your glass), SCALE shot (BOOTH /
  HIM bars), knuckles on the glass, the glowing mirror, your face close, the mirror twist (your head turning), vest print push,
  the photo of the last night staff on the booth wall, you with your head on backwards, choice card.
- HUD: SHIFT 7 · 3:00→3:03 · TOLL PLAZA LANE 3 · TRUCK STOPPED → HEAD BACKWARDS → PAID → NOT MOVING → OUT OF CAB → AT YOUR WINDOW ·
  BARRIER DOWN → UP · RULES 2 → RULE 1 KEPT → RULE 2 BROKEN.
- Choice offered: **Which rule would you break? A) RULE 1 · KEEP THE BARRIER DOWN  B) RULE 2 · LOOK IN HIS MIRROR**.
- YT title: "The truck driver at my 3 AM toll booth had his head on backwards | NIGHT SHIFT #shorts".
- Engine: new `engine/sets_toll.js` (drawPlaza, truck, booth, manSide/manSeated/manBack, meHead, drawGlass, drawConsole,
  drawNote, drawMirror), `part7.js`, `mix.py` part7 (diesel idle throb, plaza hum, low wind, carved silences in 5 pauses).
- QA fixes: hook zoomed in on the cab (driver was small), poster moved up out of the caption band, tap shot re-framed (face was
  under the HUD), mirror reflection enlarged 2x, final "your turn" shot closer.

## Episode 6 "The cinema projectionist" — QUEUED for 2026-11-25
- Output: `outputs/night-shift-p6.mp4` (61.6 s, 10.1 MB, −14.1 LUFS; stems: VO −18.1 dB RMS, SFX −25.7, beds −46.1, music −35.4)
  + `outputs/night-shift-p6.jpg` (cover: his screen-face, close, showing YOUR face screaming; "HIS FACE IS {A SCREEN}",
  "NIGHT SHIFT · 3 AM"); jsDelivr @ `1ab5905` (mp4 + jpg HTTP 200 first try). Queue id `night-shift-p6`.
- Voice: 841 credits (eleven_v4, Jack), transcript 0. 21 lines / 145 words / 9 tags, base delivery `[low, calm]`,
  `[whispering]` ×2, `[slow]` on the twist only. prep_vo SPEED = 1.00 (no speed-up from Ep 6 on). Raw take 56.9 s.
- v2 checklist: one place (the cinema), one monster (THE VIEWER: too-tall man in a suit, a glowing screen for a face), 2 rules
  (1 never stop the film, 2 never look at his face), the twist said plainly ("He was never watching the film. He was watching
  you."); 6 real pauses of 0.6-1.0 s before the reveals (music and beds carved out, sting after); "you" now has a FACE
  (new `drawFace` in draw.js: dot eyes that widen into rings, brows, mouth from line to scream; `fear` 0..1) and moves (walks in,
  looks down at the jacket, waves, turns); a mustard jacket on "you" (new `jacket` option in drawStick) so "he's wearing your
  jacket" is visible; 23 shots (wide hall, face close, booth medium, note inserts, panel close, POV through the booth window,
  film-screen close, your face close, shoulder close, low angle turn, the SCALE SHOT with YOU / HIM · 2X height bars, poster,
  twist two-shot); light reveals: house lights, the projector beam, his glowing face.
- Clarity test (a), before the voice: "A projectionist runs a 3 AM film for one viewer whose face is a screen. The film turns out
  to be live video of the projectionist's own booth, and a tall shape walks up behind him. He turns: it's the viewer, twice his
  height, and on the viewer's face-screen is the projectionist screaming: he was watching you all along." (b) after the render,
  captions + 1-s stills read as: 3 AM / one man in the cinema / his face is a screen / 2 rules / press play / the film shows a
  man from behind / your jacket / you wave, he waves / the film is you / a tall shape behind you / his seat is empty / cold hand
  / turn and look / twice your height / you're screaming / he was watching you. A stranger can retell it.
- Story beats: frame 1 = the BRIGHT hall (red rows, house lights, sconces, EXIT sign), him in H13 with the glowing face; hook box
  "HIS FACE / IS A SCREEN."; face close 3.4 s; you walk into the booth; the note (THE 3 AM SHOW · 1 TICKET SOLD · SEAT H13 + 2
  rules, signed "— R."); PLAY; reels spin, beam on; POV: the film = your booth, a man from behind in your jacket; you wave, he
  waves; LIVE; a tall shape steps up behind him; H13 empty; finger trembles over STOP, pulls back (rule 1 kept); the cold hand;
  you turn (rule 2 broken); scale shot; poster (your screaming face on his screen); empty hall with the live film; he bends
  over you, his screen shows you.
- HUD: SHIFT 6 · 2:59→3:00→3:04→3:06 · CINEMA PROJECTIONIST · SEAT H13 SOLD 1 → NO FACE → EMPTY → BEHIND YOU · FILM READY →
  RUNNING → LIVE · YOU · RULES 2 → RULE 1 KEPT → RULE 2 BROKEN.
- Choice offered: **Which rule would you break? A) RULE 1 · STOP THE FILM  B) RULE 2 · LOOK AT HIM** (kept the "Just type A or
  B" ask unchanged, the Ep 4 test is measured on Ep 4-6).
- YT title (image-title standard): "The only man at my 3 AM movie had a screen for a face | NIGHT SHIFT #shorts".
- Engine: new `engine/sets_cinema.js` (drawHall, drawFaceClose, drawBooth with drawViewer bending under the ceiling, drawPOV with
  filmFrame = the live film, drawPanel, drawNote, drawShoulder, viewerHead); `part6.js`; `mix.py` part6 (24-fps projector
  clatter synth + motor, hall hum, music.mp3 loop, carved silences in the 6 pauses, tv static on his face, button, stretch on
  the bend). draw.js: `drawFace`, stick `jacket`, arms `wave`/`reach` (old parts unaffected: options are opt-in).
- QA fixes: hook re-framed so he sits mid-frame under the hook box (was hidden behind it), seated Viewer enlarged, collar/suit of
  the face close-up redrawn (read as legs), scale shot re-framed so his head stays in frame, two-shot re-framed above the
  captions, the ×2 glyph (missing in Oswald) replaced by "HIM · 2X", sting tails shortened so the pauses stay quiet.
- Measure (ANALYTICS): IG skip rate, avg watch and YT stay rate of Ep 6 vs Ep 1-5 (first v2 episode).

## Episode 5 "The school night watchman" — QUEUED for 2026-11-24
- Output: `outputs/night-shift-p5.mp4` (69.8 s, 12.1 MB, −14.0 LUFS; stems: VO −18.1 dB RMS, SFX −26.8, beds −36.0, music −34.3)
  + `outputs/night-shift-p5.jpg` (cover: her face at the barred classroom window, smiling, chains to the sky, the yard below,
  "THE GIRL ON {THE SWING}", "NIGHT SHIFT · 3 AM"); jsDelivr @ `dfc0b20` (mp4 + jpg HTTP 200 first try). Queue id `night-shift-p5`.
- Voice: 1,449 credits (eleven_v4, Jack) + transcript (tool quoted 165; logged as 1,614 to be safe). 24 lines / 170 words.
  Take ran 74.9 s raw, so this part uses tempo 1.08 (prep_vo.py per-part SPEED; others stay 1.06), gaps −0.06 s, hold 1.7 s.
- Standard kept: bright frame 1 (floodlit schoolyard, cream two-storey "GOVT. SCHOOL NO. 13", red swing set, the girl mid-arc with
  legs dead straight), hook box "3 AM. SHE SWINGS. / LEGS DON'T MOVE."; entity SHOWN: 0-5.5 s (wide + legs close-up), 29-38 s
  swinging higher, POSTER (her face rising to your 2nd-floor window between the grille bars) 38-48 s.
- Story: 3 AM, a girl swings in the empty yard, legs never move; first night as watchman; the night register's 3 rules (1 let the
  bell ring at three, 2 if the swing moves stay inside, 3 if she calls the roll never answer present) + "She marked me present. — R.";
  the bell rings by itself 13 times (rule 1 kept); a swing creaks; you stay inside at the window (rule 2 kept/bent); higher,
  legs dead still; at the top her face reaches your window; a small voice calls the roll, every name; she calls yours; you hear
  yourself say "present" (rule 3 broken); swing stops, yard empty; the register: MEERA S. ticked present every night since 1998;
  below, your name (SAM · WATCHMAN) ticked; the second swing starts moving.
- HUD: SHIFT 5 · 2:51→3:00→3:04 · SCHOOL 13 WATCHMAN · BELL SILENT → RINGING n/13 → SWING CREAKING → HIGHER → AT YOUR WINDOW →
  STOPPED → SWING 2 MOVING · RULES 3 → RULE 1 KEPT → RULE 2 KEPT · INSIDE → RULE 3 BROKEN · ROLL — → CALLING → SAM? → SAM · PRESENT →
  MEERA S. SINCE 1998 → SAM TICKED · PRESENT.
- Choice offered: **Which rule would you break? A) RULE 2 · GO OUTSIDE  B) RULE 3 · SAY PRESENT** (kept the Ep 4 "Just type A or B"
  test unchanged so it can be measured across 2 posts).
- Engine: new `engine/sets_school.js` (drawYard with pendulum swings/girl/bell/your lit window, drawWindow classroom POV + poster
  face rise, drawBell close-up with n/13 badge, drawRules register page, drawRoll attendance grid with drawn ticks + SINCE 1998
  stamp); `part5.js`; `mix.py` part5 (synth night wind + crickets, music_p3 loop, synthesized brass bell strokes ×13, synth
  chain creaks at each end of the arc). Easter eggs: signed "R." again; GOVT. SCHOOL NO. 13; you are SAM.
- QA fixes: removed a misaligned legs marker, shrank the handwritten last line (was clipped), moved the 13/13 badge above the
  captions, moved/faded the 1998 stamp off your row, drew tick marks as paths (the font has no ✓ glyph).

## Episode 4 "The petrol pump" — QUEUED for 2026-11-23
- Output: `outputs/night-shift-p4.mp4` (69.6 s, 11.7 MB, −13.8 LUFS) + `outputs/night-shift-p4.jpg` (cover: the back window full
  of pale faces, the last attendant in his cap in the middle, palms on the glass, "THEY {STARE BACK}", "NIGHT SHIFT · 2:22 AM");
  jsDelivr @ `fc4961a` (mp4 + jpg HTTP 200 first try). Queue id `night-shift-p4`.
- Voice: 1,418 credits (eleven_v4, Jack), transcript 0. 23 lines / 171 words (gaps tightened 0.08 s, hold 1.9 s to land < 70 s).
  Files in `night-shift/p4/audio/`.
- Standard kept: bright frame 1 (lit forecourt under the HIGHWAY FUELS canopy, the white car rolling in to pump 3, empty driver's
  seat, two pale heads in the back turned the wrong way), hook box "2:22 AM. NO DRIVER. / ALL FACING BACK." (moved above the car,
  clear of captions); entity SHOWN: side view 0-5 s and 30-33 s, the back window full of faces (poster image) 37-48 s.
- Story: 2:22, white car, no driver, everyone faces backwards; first night at the pump; note (1 fill the white car, full tank, take
  no money; 2 never stand behind it; 3 never read the number plate) + "Don't wait for me. — R."; rule 1: the meter won't stop,
  40, 80 litres, never fills; they stare at the road behind; rule 2 broken: nozzle jams, you step behind the car; every face in
  the back window is looking at you; in the middle the last attendant, still in uniform; he mouths "Don't read it"; rule 3
  broken: the plate KA 13 NS 2222 = your bike's number; pump clicks full, car pulls away; one back seat empty, waiting; your bike
  is gone; a new line on the note in your handwriting: "I'm in the back."
- HUD: SHIFT 4 · 2:22→2:27 · PUMP 3 FIRST NIGHT · LITRES 0→99.9 → NEVER FULL → FULL · RS 0 · RULE 1 KEPT → RULE 2 BROKEN → RULE 3
  BROKEN · CAR NO DRIVER → FACES ON YOU → PLATE → YOUR BIKE → BIKE GONE → SEAT BACK ROW · YOU.
- Choice offered: **Which rule would you break? A) RULE 2 · STEP BEHIND IT  B) RULE 3 · READ THE PLATE**.
- TEST (ANALYTICS improvement #3): lower-effort comment ask — the VO ends "Just type A or B." and the card shows a big
  "TYPE A OR B" (120 px) instead of "COMMENT A OR B"; IG caption "Just type A or B 👇". Compare comment counts vs Ep 1-3.
- Engine: new `engine/sets_pump.js` (drawForecourt with car roll/hose/nozzle jam/bike + ghost, carSide with backwards heads and
  empty driver seat, drawCarRear poster image with faces/palms/talking mouth/empty seat/plate reveal, drawMeter, drawPumpNote with
  your handwritten line, drawPlates); `part4.js`; `mix.py` part4 (synth highway wind + canopy hum, music_p2 loop, pour + meter
  ticks, nozzle clunks; SFX −1.2 dB). Easter eggs: the note is signed "R." again (badge "R." on his uniform); plate "13" (Room 13).

## Episode 3 "The last delivery" — QUEUED for 2026-11-22
- Output: `outputs/night-shift-p3.mp4` (69.9 s, 12.0 MB, −14.2 LUFS; stems: VO −18.6 dB RMS, SFX −27.1, beds −37.1, music −34.7)
  + `outputs/night-shift-p3.jpg` (cover: her face pressed into the door gap, smiling, chain across her chin, seven fingers over the
  door edge, "SHE HAS {7 FINGERS}", "NIGHT SHIFT · 2:47 AM"); jsDelivr @ `80b0bcc` (mp4 + jpg HTTP 200 first try). Queue id `night-shift-p3`.
- Voice: 1,397 credits (eleven_v4, Jack), transcript 0. 24 lines / 167 words. Files in `night-shift/p3/audio/`.
- Standard kept: bright frame 1 (the lit cream house at 47 Lantern Lane, red door open on a chain, the grey seven-fingered hand
  reaching out; your scooter at the gate), hook box "2:47 AM DELIVERY. / 7 FINGERS."; entity SHOWN: hand at 0-4 s, close-up 4-6 s,
  hand slides out 37-40 s, fingers counted 1..7 with number badges 42-45 s, her face (poster image) 46-48.5 s and 50.6-51.8 s.
  YT title keeps "my" + the concrete image: "A hand with seven fingers took my 2:47 AM delivery through the door chain".
- Story: 2:47, a hand through a door chain, seven fingers; first night delivering; the last rider's pinned chat message (1 always
  accept the 2:47 order, 2 never hand the bag through the chain, 3 never count her fingers) + red "My phone ordered it. Not me.";
  order pops up (customer note "Hand it to me."), accepted; Lantern Lane wasn't on yesterday's map; one lit house, door opens on a
  chain; rule 2: bag on the step; whisper "Hand it to me. Please."; you lift it to the chain (bent); grey hand, too many knuckles;
  rule 3 broken: you count 5, 6, 7; her face slides into the gap, smiling; seven fingers take the bag, "See you tomorrow"; door
  shuts, light out; Order delivered — placed from YOUR phone; tomorrow's 2:47 order already placed, deliver to: your location, RM 13.
- HUD: SHIFT 3 · 2:41→2:47→2:51→2:52 · RIDER FIRST NIGHT · ORDERS 0 → #2147 ACCEPTED → NEW ROAD → DELIVERED → PLACED BY YOUR PHONE →
  NEXT DROP YOUR ROOM · RULES 3 → RULE 1 KEPT → RULE 2 KEPT/BENT → RULE 3 BROKEN · FINGERS ? → 5 → 6 → 7.
- Choice offered: **Which rule would you break? A) RULE 2 · HAND IT OVER  B) RULE 3 · COUNT HER FINGERS**.
- Engine: new `engine/sets_delivery.js` (drawHouse with door-on-chain/hand/eye/bag/scooter/you, drawHandClose with finger-count
  badges and bag take, drawGapFace poster image, drawPhone rider app: chat/order/map/delivered/tomorrow, streetBG); `part3.js`;
  `mix.py` part3 (synth night wind + hum bed, music_p2 looped with a 2 s crossfade, chain rattles, count pops, phone buzz; SFX −1.2 dB).
  Easter eggs: the last rider signs "R." again (as on the train note); RM 13 (Room 13).

## Episode 2 "The sleeper train" — QUEUED for 2026-11-21
- Output: `outputs/night-shift-p2.mp4` (69.7 s, 11.7 MB, −13.8 LUFS; stems: VO −18.1 dB RMS, SFX −26.1, beds −32.3, music −35.2)
  + `outputs/night-shift-p2.jpg` (cover: his upside-down face, smiling, "HE HANGS {UPSIDE DOWN}", "NIGHT SHIFT · 3 AM");
  jsDelivr @ `bb4c237` (mp4 + jpg HTTP 200 on first try; raw fallback 200). Queue id `night-shift-p2`.
- Voice: 1,368 credits (eleven_v4, Jack), transcript 0. 23 lines / 156 words. Files in `night-shift/p2/audio/`.
- Standard kept: bright frame 1 (lit sleeper coach looking down the aisle, two pale arms hanging from a top berth),
  hook box "72 BERTHS. / 73 PASSENGERS."; the entity SHOWN: arms at 0-3 s and 5-8 s, full upside-down man in the aisle at 43-46 s,
  his face (poster image) 46-51 s. Applied today's analytics lesson: YT title starts with the concrete image + "my"
  ("A man hung upside down from my train's top berth, face level with mine").
- Story: 3 AM, 72 berths, you count 73; first night as ticket checker; note on the chart: 1 count every passenger at every
  stop, 2 if you count 73 never count again, 3 never look up at the top berths + "There is no berth 73. Don't sit in it."; next
  station: clicker 073; chart says 72 names; rule 2 kept -> someone above counts for you (71, 72, 73; rule 2 bent); rule 3 broken:
  you look up: a man hangs upside down from the top berth, face level with yours; he smiles: "You forgot to count yourself.";
  tunnel, lights die, back on: he's gone; the chart has a new red line: 73 SAM K. T.T.E.; your seat plate turns from 63 to 73.
- HUD: SHIFT 2 · 3:00→3:17 · COACH S7 SLEEPER · COUNT 72→73→71/72→73 · RULES 3 → RULE 2 KEPT/BENT → RULE 3 BROKEN · BERTHS 72 →
  UB 41 OCCUPIED → EMPTY → BERTH 73 YOU.
- Choice offered: **Which rule would you break? A) RULE 2 · COUNT AGAIN  B) RULE 3 · LOOK UP**.
- Engine: new `engine/sets_train.js` (drawCoach perspective aisle with day/night-lamp/station/dark modes + hanger arms/full,
  drawTTE, drawChart, drawTrainNote, drawClicker, drawHangerFace, drawSeat); `part2.js`; `mix.py` part2 (synthesized rail rumble
  bed + clacks, clicker clicks). Easter egg: the note is signed "— R."; you are SAM again (the pharmacy badge name).

## Episode 1 "The all-night pharmacy" — QUEUED for 2026-11-20
- Output: `outputs/night-shift-p1.mp4` (69.4 s, 12.0 MB, −13.9 LUFS; SFX ~13 dB under the voice) + `outputs/night-shift-p1.jpg`
  (cover: his frosted face, "HE HAS A {TOE TAG}", "NIGHT SHIFT · 2 AM"); jsDelivr @ `33a76fa` (mp4 + jpg HTTP 200 at once;
  raw.githubusercontent fallback 200). Queue id `night-shift-p1`.
- Voice: 1,303 credits (eleven_v4, Jack), transcript 0. 21 lines / 163 words. Files in `night-shift/p1/audio/`.
- Standard kept: bright frame 1 (the lit pharmacy, the barefoot man at the counter, wet footprints to his feet), small hook
  "2 AM CUSTOMER / WITH A TOE TAG"; the entity SHOWN: back view in the first 3 s, the toe tag close-up at 4 s, frontal across
  the counter at 26 s and 35-41 s, his face (poster image) at 48-51 s. YT title = the scary image, series name after the bar.
- Story: 2 AM, barefoot man, paper tag on his big toe; your first night shift; the note's 3 rules (1 fill every prescription,
  even the paper ones; 2 if he's in today's obituaries he waits outside; 3 never ask why he's cold) + "I left early. Sorry.";
  wet, freezing slip: Thomas Hale; today's paper: died this morning; rule 2: you ask him to wait outside, he doesn't move, frost
  spreads under his fingers; you fill it, hands shaking; you hear yourself ask why he's so cold; he leans in: "They keep us
  cold. Downstairs."; lights die, he's gone; his slip was signed by the pharmacist who left early; tomorrow's tray: the top
  slip has your name (SAM, your badge) with a toe tag clipped to it.
- HUD: SHIFT 1 · 2:00→2:09 · PHARMACY ALL-NIGHT · TEMP 21°C→−11°C · RULES 3 → RULE 2 OUTSIDE/BENT → RULE 3 BROKEN · CUSTOMER
  BAREFOOT → TOE TAG → T. HALE → DECEASED → GONE → NEXT SLIP YOU.
- Choice offered (answerable now): **Which rule would you break? A) RULE 2 · LET HIM IN  B) RULE 3 · ASK WHY**.
- Engine: new workspace `night-shift/` (copy of the BLOCK C engine; `render.js --cover` takes `coverSub`). `sets.js`:
  drawStore (customer side, bright), drawCustomerBack/Front, drawFeet, drawCounterPOV (glass front at night, frost patches),
  drawFace, drawNote, drawSlip (also your slip + clipped toe tag), drawPaper (obituaries), drawPills, drawTray, drawBadge.
- Easter eggs for later: the signature "M." (the pharmacist who left early); the toe tag "MORGUE · 21/11".
