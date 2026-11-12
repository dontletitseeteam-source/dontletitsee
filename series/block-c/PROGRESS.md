# BLOCK C — progress log

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
