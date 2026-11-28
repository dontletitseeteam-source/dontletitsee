# Series 4 — NIGHT SHIFT · Season 2  (standalone episodes, from 2026-11-28)

Slug: `night-shift-2` · Workspace: reuse `night-shift/engine` (same engine, new `part9.js`… or copy to `night-shift-2/` with
parts p1…; either is fine, keep outputs as `outputs/night-shift-2-p<n>.mp4`) · Caption name: `NIGHT SHIFT` · Designed 2026-11-24
from the NIGHT SHIFT post-mortem (RESEARCH.md) and owner directives v2-v4. Read RESEARCH.md top first.

## Why a Season 2 and not a new format
NIGHT SHIFT is the only format that has proven itself (Ep 2: best reel ever on both platforms; 3 of 4 episodes beat BLOCK C on
YouTube). Keep the format, the title shape and the A/B card; change the LOOK (owner directive v4) and the jobs.

## Format (every episode, 55-70 s, 18-21 VO lines, 120-145 spoken words, <= 10 tags, ~800-850 credits)
- v4 look (Ep 8 of Season 1 is the reference: `engine/look4.js`, `sets_wedding.js`, `part8.js`): no HUD, serif sentence-case
  captions, grain + bloom + handheld camera, real-proportion silhouettes with eye highlights, each episode its OWN palette, the
  time once in the world (clock, phone, ticket), notes in a hand for <= 3 s, rack focus, whip pans + dutch angle on scares.
- Frame 1 (v5: must pass `python3 night-shift/engine/hookcheck.py`, every sample V >= 130, target avg S >= 100, warm and
  colourful like Ep 8): bright, familiar Indian night place, the monster's WRONG SILHOUETTE big and moving within 0.5 s; italic hook title
  (<= 6 words) at the top for 1.7 s; cut closer by ~1.7 s.
- 2 rules (the A/B options), rule 1 kept in action, rule 2 broken; full reveal + a scale shot; twist said plainly once.
- The A/B question over the last scary shot (no end card), options as two short serif lines, the last 0.7 s cuts back to frame 1.
- Titles: "The <monster> at my <place> <wrong detail> | NIGHT SHIFT #shorts". IG: hook line, "NIGHT SHIFT · Season 2 ·
  Episode n", the A/B question, "Just type A or B", "New shift tomorrow, 3 PM.", the 3 hashtags.

## Episodes (original; order may change; votes only break ties between equally ready episodes)
1. **The railway level crossing** (2026-11-28) — gatekeeper's hut, red lamp, the gate. Monster: **the man walking the tracks on
   all fours, back bent the wrong way, knees up past his head**. Rules: 1) Close the gate when the bell rings. 2) Never open it for
   someone on foot. Twist: the bell rings for a train that never comes; he isn't waiting for the train, he's waiting for the gate
   to open, and the gatekeeper before you opened it (his lamp is still on the tracks).
2. **The ATM guard** — glass booth on an empty road. Monster: **the woman bent fully backwards, head at her heels, using the ATM
   upside down**. Rules: 1) One customer at a time. 2) Never look at the mirror above the machine. Twist: the camera screen shows
   her standing behind YOU.
3. **The night bus conductor** — last bus, ticket machine. Monster: **the passenger hanging from the roof rail by arms three
   metres long, feet touching the floor**. Rules: 1) Every passenger needs a ticket. 2) Never ring the bell twice. Twist: the
   ticket machine prints his stop: your village.
4. **The baraat band** (owner directive v5, 2026-11-28: Ep 4-8 replaced, see RESEARCH.md v5) — you play in the wedding band at a
   3 AM baraat. Monster: **the groom on the white horse, flower sehra hiding his face, sitting taller than the light-carriers**.
   Ritual trap: the notes waved over the groom's head and handed to the band. Twist: <= 5 plain words about "you".
5. **The sleeper coach, return journey** (the world of Season 1 Ep 2) — you are the TTE again. Monster: **the passenger asleep on
   the top berth whose legs reach the floor**. Ritual trap: the reservation chart / the ticket check.
6. **The exam hall** — you are the invigilator of a night exam. Monster: **the student too tall for his bench, head down on the
   paper**. Ritual trap: the roll number / signing the answer sheet.
7. **The mela giant wheel** — you run the wheel's last ride. Monster: **the child in the top cabin who never comes down**, the
   wheel bright with bulbs. Ritual trap: one ticket, one round, counting the cabins.
8. **Finale: the wedding family photo** — you are the wedding photographer. Monster: **the relative taller than the backdrop in
   every group photo, standing behind the couple**. Ritual trap: "everyone together for one family photo".

Backups (the original Ep 4-8; their places fail the v5 place test, use only if a v5 idea fails its checks):
B1. **The hostel night warden** — corridor, register, room 6. Monster: **the student asleep standing on the ceiling**. Rules:
   1) Lights out at 11. 2) Never count the beds in room 6. Twist: the extra bed has your name card.
B2. **The farm watchman** — sugarcane field, a charpai, a torch. Monster: **the scarecrow taller than the trees that bends to look
   into your torch light**. Rules: 1) Keep the torch on. 2) Never answer when it calls your mother's voice. Twist: the scarecrow's
   shirt is the one you're wearing.
B3. **The cold-storage night guard** — ice factory, frosted doors. Monster: **the frozen man standing in the freezer whose breath
   doesn't fog, but yours does on the inside of the glass**. Rules: 1) Check the freezer every hour. 2) Never open it from the
   inside. Twist: you are the one inside.
B4. **The ferry ghat night boatman** — river steps, lamps. Monster: **the passenger who sits facing the water, but his reflection
   faces you**. Rules: 1) Take everyone across. 2) Never let him pay. Twist: the coin is your own.
B5. **The tiny railway station master** — one platform, one lamp, 3 AM. Monster: **the last train, every window full of the
   season's monsters, all facing you**. Rules: 1) Wave every train through. 2) Never board. Twist + series button.

## Credit plan (real balance via `account_get_usage`; voice = exactly 1 credit per character)
- 2026-11-24: 2,857 left until the reset on 2026-11-30 17:36 IST. Ep 1-3 (11-28, 11-29, 11-30) are built BEFORE the reset:
  keep each vo_prompt at <= 850 characters (3 x 850 = 2,550; leaves ~300). If a run finds < 800 left before the reset, make
  that episode a **no-voice episode** (story in on-screen captions, library music + SFX, 0 credits), never an empty day.
- After the reset (40,000): Ep 4-8 + the next season at ~850 voice + up to 450 for painted plates (RESEARCH.md v4) per episode.
