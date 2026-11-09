# Series 2 — BLOCK C  (posts 2026-11-12 → 2026-11-19, 8 parts)

Slug: `block-c` · Workspace: `block-c/` (in this repo) · Caption name: `BLOCK C`

## Premise
You move into an old college hostel mid-semester, Room 13, Block C. Taped inside the wardrobe door is a
handwritten list left by the last occupant: **BLOCK C NIGHT RULES**. The last rule is scratched out.
The warden of Block C died six years ago. Roll call still happens every night at 12:07 AM.

Why it works: relatable for students (hostel, warden, roll call, mess, WhatsApp group, curfew), a fixed set
of locations to reuse, and a rule list that gives every part a clear "rule of the day".

## The list (shown in Part 1, one rule tested per part)
1. Roll call is at 12:07 AM. Answer only to your own name.
2. The warden never knocks. If someone knocks after lights out, it is not the warden.
3. If your roommate's bed is empty after 1 AM, do not look under it.
4. The mess opens at 3 AM for someone. Not for you.
5. Block C has 42 students. If the group chat says 43, leave it.
6. ~~(scratched out)~~ — revealed in Part 7.

## HUD rows
`PART n` · time · `BATTERY` · `ROOM 13 · BLOCK C` · `HEADCOUNT 42` (changes when the story does: 43, 41…).

## Sets to build once (in `block-c/engine/sets.js`)
- Hostel room (front view): two iron beds, wardrobe with the taped list, study table + lamp, window bars,
  door with a gap under it (corridor light / shadows of feet).
- Corridor (reuse/adapt `drawCorridor`): green-ish tube lights, room doors numbered 9–16, notice board.
- Wardrobe-door close-up with the paper list (readable text, the scratched line).
- Phone: chat screens (hostel WhatsApp-style group "BLOCK C 🔕" — no real brand names or logos).
- Mess hall at 3 AM: long tables, steel plates already served, one empty chair with your name card.
- The warden: very tall figure in a long coat with a register book; face never shown (entity style).

## Episode outline (comments choose A/B; both branches must lead to the next planned beat)
1. **The List** — find the list; 12:07 roll call; the warden calls names door by door… calls YOUR name
   though you're not registered yet. Choice: A) answer "Present"  B) stay silent.
2. **Present** (A: it now knows your voice, marks you in red ink) / (B: it calls your name again, closer,
   then calls your *roommate's* name in your voice). Rule 2: three soft knocks. Choice: A) open the door
   B) look under the door gap.
3. **The knock** — what's outside (feet facing the wrong way / nothing but the register on the floor with
   tomorrow's date). Roommate's bed is empty at 1:04 AM. Choice: A) look under the bed  B) leave the room.
4. **Under the bed / the corridor** — branch payoff, then the 3 AM mess bell rings for the whole block.
   Choice: A) go to the mess  B) hide in the washroom.
5. **The mess at 3 AM** — 42 plates served, everyone eating silently, your plate has your name… and
   tomorrow's date. Group chat: 43 members. Choice: A) leave the group  B) scroll up.
6. **43** — the new member is you (your number, your photo, typing). Messages from "you" ask others to
   open their doors. Choice: A) warn everyone  B) stay quiet.
7. **The scratched rule** — under light, the scratched line reads: "6. If the warden calls a name twice,
   that student leaves Block C." The warden has called your name twice. Choice: A) run for the gate
   B) find the last occupant of Room 13.
8. **Finale: Morning roll call** — security register shows you signed out six years ago. At 12:07 the next
   night, a new student moves into Room 13… and you are the one calling names. You tape your own list
   inside the wardrobe and scratch out rule 6. Rule card: "RULE #6: NEVER ANSWER TWICE." Loop to Part 1.

## After BLOCK C
Design the next series the same way (8 parts, original premise, fixed sets, rules list, loop ending).
Candidate premises (pick one, all original): a 24-hour pharmacy night shift that gets prescriptions for
people who died that day; a sleeper train coach where the ticket checker counts one extra passenger every
station; a food-delivery rider's last order to an address that only exists after midnight; a smart speaker
in a new flat that answers questions nobody asked; a power cut where only one apartment's lights stay on.
