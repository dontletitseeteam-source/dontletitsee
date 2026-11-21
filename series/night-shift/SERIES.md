# Series 3 — NIGHT SHIFT  (standalone episodes, from 2026-11-20)

Slug: `night-shift` · Workspace: `night-shift/` · Caption name: `NIGHT SHIFT` · Designed 2026-11-19 from the BLOCK C post-mortem
and the owner directives in `series/RESEARCH.md` (read both first).

**Owner directives v2 (2026-11-21), from Episode 6 on (see top of `series/RESEARCH.md`):** 14–20 VO lines,
120–145 spoken words, no voice speed-up, real pauses, ≤ 10 tags, ~1,100 credits; the note has exactly **2** rules
(they are the A/B options); no number puzzles or required easter eggs; twist said plainly; "you" gets a face and
moves; 18–26 varied shots; a scale shot of the entity. Episodes 1–5 below were made under the older rules.

## Format (every episode, 55–70 s, 18–24 VO lines, 135–170 spoken words, ~1,300–1,480 credits; superseded by v2 above)
One ordinary night job in an everyday place. Second person, present tense ("Your first night at…").
1. **0–2 s:** a BRIGHT, readable wide shot of the workplace (lit counter / platform / forecourt), the entity small but visible
   somewhere wrong; burned-in hook ≤ 6 words that names it; first VO line states the wrong detail.
2. **The handover note** (a sticky note / register page / phone message from the last night-shift worker): exactly 3 rules,
   read fast, each on screen (rule card style from BLOCK C). The last line of the note is personal and wrong ("I left early.").
3. **Escalation** keyed to the rules: rule 1 holds, rule 2 bends, rule 3 breaks.
4. **The poster image**: the entity is SHOWN clearly at least once (lit, centred, 1.5 s+), also the cover and in the title.
5. **Twist / payoff inside the episode** (no cliffhanger). Optional small easter egg for returning viewers (Room 13, 12:07, the
   red pen) — never required to understand the story.
6. **A/B question answerable now**: "Which rule would you break? A … B …, comment A or B." The card names both rules. Votes
   only decide which shift comes next when two are equally ready (note it in PROGRESS.md), never the story.

House look stays: navy 2D vector, white stick figure with empty round head, red LED/HUD, lime/red caption keywords.
HUD: `SHIFT n` (instead of PART n) · time · `BATTERY` · `<JOB>` · `RULES 3` → `RULE 2 BROKEN` etc.
Titles (YouTube): the scary image + place/time + the wrong detail, sentence case, no series name before the bar, no episode
number: "A customer with a toe tag came for his medicine at 3 AM | NIGHT SHIFT #shorts". Instagram caption: same hook line,
"NIGHT SHIFT · Episode n", the A/B question, "New shift tomorrow, 3 PM.", the three hashtags.
Cover: the entity, lit, + 2–4 word title (`[lime]`/`{red}` markup).

## Episodes (order can change if a vote picks the next shift; all original)
1. **The 24-hour pharmacy** (2026-11-20) — rules: 1) Fill every prescription, even the old paper ones. 2) If the name on the
   slip matches today's obituary page, ask him to wait outside. 3) Never ask why he's cold. Entity: **the customer with a toe
   tag** (bare feet on the white tiles, a paper tag on his big toe, the same name as the slip). Twist: the slip's prescriber
   signature is the previous night pharmacist, and tomorrow's slip in the tray has YOUR name. A/B: rule 2 or rule 3.
2. **The sleeper train ticket checker** — count passengers every station; the chart says 72, you count 73. Entity: **the
   passenger hanging upside down from the top berth**, face level with yours. Twist: berth 73 is booked under your seat number.
3. **The food-delivery rider** — last order at 2:47 to an address that only shows on the map after midnight. Entity: **the
   woman taking the bag through the door chain with too many fingers**. Twist: the order was placed from your own phone.
4. **The petrol pump night attendant** — a car with no driver comes at 2:22 and asks for a full tank. Entity: **the car whose
   passengers all sit facing backwards**. Twist: the number plate is your bike's.
5. **The school night watchman** — the bell rings at 3 AM. Entity: **the girl on the swing who swings without moving her legs**.
   Twist: the attendance register has her name ticked present every night since 1998.
6. **The cinema projectionist (last show)** — one ticket sold for the 3 AM show, seat H13. Entity: **the viewer whose face is
   the screen's reflection** (no face, it shows the film). Twist: the film is security footage of your projection booth.
7. **The highway toll booth** — the same truck passes every 11 minutes. Entity: **the driver with his head turned all the way
   around**. Twist: the toll receipts print tomorrow's date and your booth number in the "accident" column.
8. **The wedding-hall caretaker** (season finale) — after the last guest leaves, the hall fills again. Entity: **the bride with
   the veil sewn shut**. Twist + series button: the guest book holds every name from episodes 1–7, including yours.

## Credit plan (PLAYBOOK section 5)
Balance after BLOCK C: 28,114 (2026-11-19). Episodes to make 2026-11-20 … 12-08 = 19 → ~1,480 per episode. NIGHT SHIFT =
Episodes 1–8 (2026-11-20 … 11-27). Then design the closing series (11 episodes, 2026-11-28 … 12-08) the same way, ending on
a finale made with the last credits (recompute remaining ÷ episodes before each voice; tighten if below 1,300).

## Sets to build (in `night-shift/engine/sets.js`, one per episode; reuse drawStick, drawHUD, captions, phone, list/rule card)
Pharmacy counter + shelves + obituary page + prescription slip; sleeper coach (3-tier berths, aisle, night lamp); delivery
map + gated house door with chain; petrol pump forecourt; school yard + swings + bell; cinema hall + projection booth; toll
booth + highway; wedding hall with marigold strings.
