# NIGHT SHIFT — progress log

**Status 2026-11-19 ~11:45 IST (creator run):** Episode 1 built and QUEUED for 2026-11-20. Credits left 26,811
(18 episodes to make 2026-11-21 … 12-08 -> ~1,490 each; pace OK). Next: Episode 2 (sleeper train) for 2026-11-21; it does
not depend on a vote (standalone format), so it can be built any time. No competitor scan due until Monday 2026-11-23.

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
