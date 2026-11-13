# BLOCK C — progress log

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
