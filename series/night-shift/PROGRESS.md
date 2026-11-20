# NIGHT SHIFT — progress log

**Status 2026-11-20 ~11:45 IST (creator run):** Episode 3 built and QUEUED for 2026-11-22. Credits left 24,046
(16 episodes to make 2026-11-23 … 12-08 -> ~1,503 each; pace OK). Next: Episode 4 (petrol pump night attendant) for 2026-11-23;
standalone, no vote dependency. Competitor scan due on the first run on/after Monday 2026-11-23.

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
