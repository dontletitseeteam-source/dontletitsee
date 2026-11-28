# Research: what growing horror Shorts/Reels do, and what we got wrong

Owner's order (2026-11-18): "post after analysing mistakes, improve stories and elements, and research
different channels like this which are actually gaining something." This file is the creator's standing brief.
Read it before designing a series and before writing every script. PLAYBOOK section 7 says how to keep it fresh.

## Owner directive v5 (2026-11-28 18:00 IST): "check why the wedding worked and make accordingly" — THE WEDDING RECIPE
Every new episode must pass the 7 checks below before any voice or art is spent. They come from comparing the
wedding bride (Season 1 Ep 8) with every other NIGHT SHIFT episode on Instagram (YouTube showed none of them, see
the end of this block).

| Ep | Place: have most viewers been there themselves? | Monster | IG views | Skip (first 3 s) | Avg watch | Opening V / S (hookcheck) |
|---|---|---|---|---|---|---|
| S1 Ep 8 wedding hall | **yes** (everyone has been to a wedding) | the bride, taller than the marigold strings, veil sewn shut | **1,594** | **21.4%** | 27.3 s | **144-173 / 137-148** |
| S1 Ep 2 sleeper coach | **yes** | the 73rd passenger | 1,230 | 37.7% | 29.5 s | 134-139 / 66 |
| S1 Ep 5 school | **yes** | a schoolgirl swinging, legs never move | 922 | 37.3% | 22.6 s | 132-138 / 70-73 |
| S1 Ep 7 toll booth | no, only toll staff | driver's head on backwards (small, inside a cab) | 319 | 41.9% | 16.0 s | 119-124 / 78-80 |
| S1 Ep 1 pharmacy counter | partly | barefoot man | 258 | 36.7% | 22.9 s | n/a |
| S1 Ep 3 delivery | partly | grey hand | 146 | 45.1% | 16.0 s | 101-114 / 80-88 |
| S1 Ep 6 projection room | no | face is a screen | 139 | 47.7% | 11.9 s | 102-104 / 131-140 |
| S1 Ep 4 petrol pump | no | a white car | 127 | 33.0% | 21.5 s | 140-143 / 64-66 |
| S2 Ep 1 level crossing (v4 look) | no | stock "bent-backwards crawler" | 180 at 2.6 h | 45.8% | 13.5 s | 91-101 / 75-78 |

**Why the wedding worked (ranked):**
1. **A place everyone has been to, as a normal person.** The top 3 reels are a wedding hall, a sleeper coach and a
   school; all 6 others are places you only see if you do that job (toll booth, projection room, petrol pump
   forecourt, level crossing). The night-shift job is fine; the PLACE must be one the viewer already knows from life.
2. **The monster is the most familiar figure of that place, made wrong in its outline.** A bride is the first
   thing anyone pictures at a wedding; this one is taller than the decorations and has no face. Not a stock genre
   creature dropped into a place (the bent-backwards crawler and the bent-backwards woman are on every horror
   channel; S2 Ep 1 lost viewers in 3 s even with the new look).
3. **The trap is the place's own ritual.** Signing the register at a wedding (Ep 8), answering "present" at roll
   call (Ep 5), counting passengers against the chart (Ep 2). Losers had arbitrary rules (look in the mirror, lift
   the barrier, stop the film). The viewer does the normal thing, and the normal thing is the trap.
4. **The twist is a life-changing consequence in 4 plain words about "you": "You just married her."** It is
   dark, a bit funny and easy to repeat to a friend, which is what earned the likes, saves and shares that pushed
   reach past followers. Compare "now he's on your side" (vague) or "now it's your turn" (generic).
5. **The opening looks like a celebration, not a horror reel.** Ep 8 is the only episode with frames 0-3 s both
   bright AND warm-colourful (saturation 137-148; every other episode 64-88 except the dark cinema). In a feed of
   dark blue horror it stands out, and the wrong thing is visible at once: the giant bride fills the centre of
   the frame, whole, with 3 iconic props (marigold strings, red carpet, rows of chairs) saying "wedding" in 0.2 s.
   One small serif line, no text box. The darkness arrives later as a story beat ("you switch off the lights").
6. **Two short sentences set it up:** "The wedding is over. But the bride is still on the stage." Place + the one
   wrong fact, no "something is coming", no time stamp needed.
7. **Shortest recent episode: 57.8 s**, 2 rules, 145 words, 8 tags. 47% of it watched on average (best ever).
Probably helping too: it is peak Indian wedding season (Nov-Feb), so the setting is on everyone's mind right now.
Not the reason on its own: the v4 look. S2 Ep 1 has the same look and a 45.8% skip. Keep the look (owner's order),
but the look does not rescue a job-only place, a stock creature or a dark opening.

**The 7 checks (write them into PROGRESS.md for every episode, pass/fail, before spending credits):**
1. Place: most Indian viewers have been there themselves (wedding/baraat/sangeet, sleeper train, school or exam
   hall, hospital ward, city bus, apartment lift/society, mela, birthday or family function, coaching class).
2. Monster: that place's most familiar figure (bride, groom, schoolgirl, passenger, patient, band player,
   relative in the family photo), wrong in outline (too tall, faceless, wrong way round, too many). No religious
   figures or deities. No stock creatures.
3. Rules and twist come from that place's ritual; the broken rule = the viewer doing the normal ritual.
4. Twist line: the consequence for "you" in <= 5 plain words ("You just married her.").
5. Opening: `python3 night-shift/engine/hookcheck.py outputs/<id>.mp4` must PASS brightness (every sample V >= 130)
   and should reach the colour target (avg S >= 100): warm practical light (bulbs, string lights, tube lights),
   the monster whole and centred, >= half the frame height, 2-3 iconic props, one serif line. Dark only later.
6. First VO line: place + the wrong fact in two short sentences.
7. 55-60 s, 2 rules, 130-145 words, <= 8 tags. Title: "The <figure> in my <place> <wrong outline detail>".

**Next episodes (replaces Season 2 Ep 4-8 in `series/night-shift-2/SERIES.md`; old Ep 4-8 become backups).** It is
wedding season, so lean on it first, then the worlds of the other two winners. The creator writes the scripts.
- Ep 4 **The baraat band** (you play in the wedding band): the groom on the white horse, flower sehra hiding his
  face, sitting taller than the light-carriers; ritual = notes waved over the groom's head and handed to the band.
- Ep 5 **The sleeper coach, return journey** (you are the TTE again): the passenger asleep on the top berth whose
  legs reach the floor; ritual = the reservation chart and the ticket check.
- Ep 6 **The exam hall** (night exam / you are the invigilator): the student too tall for his bench, head down on
  the paper; ritual = roll number, signing the answer sheet.
- Ep 7 **The mela giant wheel** (you run the wheel, last ride): the child in the top cabin who never comes down,
  bright bulb-lit wheel; ritual = one ticket, one round, counting the cabins.
- Ep 8 **The wedding family photo** (you are the wedding photographer): the relative taller than the backdrop in
  every group photo, standing behind the couple; ritual = "everyone together for one family photo".
The running family-impersonation test (ANALYTICS) fits inside these (a voice calling in your mother's voice).

**Fix before it posts (2026-11-30 15:00 IST): S2 Ep 3 night bus.** Its place, figure and ritual pass checks 1-3, but
its opening FAILS check 5 badly (V 37-57). First job of the next creator run: re-render the first ~3 s with the bus
interior lit (tube lights on, warm bulbs, the hanging man whole against a bright aisle) or regrade them, keep the same
voice (0 credits), rerun hookcheck until it passes, re-host, update the queue URL, push before 2026-11-30 09:00 UTC.
If it cannot be done safely, post it unchanged and log why. S2 Ep 2 (ATM, 11-29) passes brightness: leave it.

**YouTube note:** the wedding got 2 views on @dontletitsee in 26 h and S2 Ep 1 got 0, while Instagram had its best
day. The same file is uploaded to @dontletitsee and @lexter2025 at the same second; YouTube may be treating them as
duplicates. The owner has been asked whether to stop the @lexter2025 uploads; until then, do not change uploads.

## Owner directive v4 (2026-11-23 22:00 IST): the animation looks template-made. Improve it a lot.
The owner: "the animation is too common; anyone can tell it's made by Claude because the layout and quality are
always the same." The contact sheets of Ep 2-7 confirm it. The giveaways, in order:
1. The same HUD block (clock + tiny mono lines) top-left in every frame of every episode.
2. The same caption system every video: dark box, all-caps condensed font, lime/red keyword.
3. The white-outline stick figure as the hero.
4. Flat vector geometry, perfect gradients, no texture, centred symmetric compositions, the same navy palette.
5. Full-screen text cards (notes, phones, charts, pump displays).
6. One camera move only: the slow push.

**Free fixes (code), from the next episode built:**
- a. **No permanent HUD.** The time appears once, in the world (a wall clock, a phone lock screen, a ticket).
- b. **A new caption style, not a box:** sentence case, white with a soft dark shadow, lower third, 1-4 words, one
  accent colour, moved when the subject is low. Different from FLOOR 0/BLOCK C/NIGHT SHIFT Ep 1-7.
- c. **Retire the stick figure.** "You" is a textured dark silhouette with real proportions (shoulders, hair,
  clothes, hands) and readable eye highlights, or is shown through POV, hands and a face close-up.
- d. **Texture and light:** paper/grain texture over everything, soft chromatic edge, real cast shadows from the
  light source, volumetric beams (torch, headlights, projector), flicker, fog and dust particles.
- e. **Camera language:** handheld drift under tension, rack focus (blurred foreground/background layers), smash
  cut or whip pan on each scare, dutch angle on the reveal, extreme close-ups (eye, hand, mouth), parallax depth.
- f. **Composition:** off-centre, foreground objects framing the shot; each episode its own palette (sodium
  orange + teal for a petrol pump, sick green for a hospital), not the house navy every time.
- g. **Notes and screens in the world** (paper in a hand, tilted, half in shadow), 2 short lines, at most 3 s.

**Painted plates (credits), after the 2026-11-30 credit reset and only within budget (see ELEVENLABS.md):**
- Style test, owner session 2026-11-23, ElevenLabs flow `VzTEkKkkEe1PzMk57p3h`: **Krea 3** (generation
  `vFOkQ8HBW5fSPcrfsrXu`, 9:16, 1K, 151 credits): a painterly, cinematic illustration that looks made by an artist
  (Indian sleeper coach, TTE in khaki with a torch, the upside-down man). **Recraft v4.1 flash** (generation
  `dMa4ufLLAIrdj5x1UEn1`, 9:16, 48 credits): a bold inked-comic look, also far from our template. Download both as
  references into `refs/style/` (creative_get_generations -> signed full_res_url -> curl).
- Set the 9:16 aspect with `creative_add_flow_node` + `model_parameters` ({"aspect_ratio": "9:16"}, plus
  "resolution": "1K" for Krea 3), then `creative_run_flow_nodes` with generations_count 1;
  `creative_generate_image` alone gives 16:9.
- Per episode: 2-4 plates with ONE style-anchor prompt per series (place wide; place close/POV; monster key art,
  which is also the cover). Animate them in the engine: parallax layers (cut-outs via `birefnet-v2-bg-removal` if
  budget allows, or masks), camera moves, light overlays, particles, an eye/mouth overlay on the monster; captions
  and effects drawn in code on top. Same anchor across a series, so it looks like one show.
- Art budget per episode = (balance - days left in the cycle x real voice cost) / days left, capped at 450. At 0
  or below: free fixes only.

## Owner directive v3 (2026-11-23): analyse properly, keep improving
The owner: "keep improving, take inspiration from reels in this genre that actually work and from our own reels
that work, and analyse them properly." PLAYBOOK sections 6-7 now include a second-by-second retention check and a
winners-and-losers frame breakdown (below). First findings, 2026-11-23 (owner session):
1. **The rules note loses viewers.** YouTube's retention curve for Ep 1 (pharmacy, the first NIGHT SHIFT video with
   data): 104% at 6% of the video (rewatches), 86% at 11%, **58% at 21%** (about 8-15 s in: the stretch where the
   handover note fills the screen), then a slow slide to 38% at 81%. The contact sheets (frames at 0/1/2/3/5/10/
   20/30/40/50 s) of Ep 2-4 show the same thing: the middle is full of text screens (note, phone, chart, pump
   display). Ep 3 (weakest) kept its phone-screen of rules up for about 20 s.
   -> **Note on screen at most 3 s, 2 rules of at most 6 words each, read aloud once. Then show each rule being
   tested in ACTION (the hand reaching, the head turning), not on paper. No reading screens (charts, counters,
   displays) longer than ~2 s unless the number itself is the scare.**
2. **The end card loses half of who's left:** Ep 1 falls from 38% at 81% to 19% at 96%, i.e. during the A/B card.
   -> **No separate end card.** Say the A/B question over the last scary shot (max 3 s, text on screen), and cut
   so the last frame flows into the first one (a loop invites a replay).
3. **The first 3 s are still one held shot** in Ep 2-7 (a slow push at most). -> The monster MOVES within 0.5 s
   (turns its head, leans in, flickers closer) and there is a cut to a closer shot by ~1.5 s.
4. **"You" now has a face in Ep 7 (worried eyes) but not in Ep 6.** -> A face on every reaction shot, every episode.
5. **What the winner did** (Ep 2 train, 1,228 IG / 1,134 YT, the only Instagram breakout): a hook anyone gets in
   one glance ("72 berths. 73 passengers."), a setting most of our viewers know (Indian sleeper train), and a
   payoff image that reads as a silhouette (a man hanging upside down). The weakest (Ep 3) needed you to count
   fingers and read a phone screen. Keep choosing everyday Indian night places, contradictions you get instantly,
   and silhouette-wrong monsters.

## Owner directives v2 (2026-11-21): clearer stories, better voice, better animation. In force from now.
The owner watched NIGHT SHIFT Ep 1-2: the format works (Ep 2 = best reel ever), but the stories are **hard to
understand**, the **voiceover could be better**, and the **animation should look more like the animated horror
reels that already work**. Keep researching and improving. (The owner had shared metro screen recordings as a
style reference in another chat; they are not available here. If reference videos ever appear in `refs/` in this
repo, study their frames first.)

**Why Ep 1-5 are hard to follow (measured 2026-11-21):** 220-240 spoken words in ~69 s (190-210 words/min as
recorded), then sped up another 6-8% by `prep_vo.py` (about 205-225 words/min on screen), **zero pauses of 0.5 s
or more**, 32-39 delivery tags each (the tone flips almost every line), 3 rules + note + countdown/number puzzle +
signature easter eggs ("R.", 13, plates) packed into one minute. Horror narration lands through control: slowing
down, softening, leaving deliberate silences; reading too fast makes a story hard to follow.

**Clarity rules (every episode):**
1. **One place, one monster, two rules, one twist.** The handover note has exactly **2** short rules (they are
   the A/B choices). No number/counting puzzles, no clue the viewer must decode, no easter egg the story needs.
2. **Say what happens in plain words**, short sentences, everyday vocabulary (many viewers are not native English
   speakers). The twist is stated once, plainly, in the VO AND shown on screen ("The passenger in berth 73 was
   you."). If a beat needs explaining, it is too clever: cut it.
3. **Beat map for 60-70 s:** 0-3 s monster + hook line; 3-12 s who you are and where (one line) + the note with
   its 2 rules on screen; 12-40 s rule 1 holds, rule 2 is tested, one escalation; 40-52 s full reveal of the
   monster (clear, lit, close); 52-60 s the twist in one sentence; 60-70 s the A/B card.
4. **Clarity test before paying for the voice:** (a) write the story as 3 sentences a 12-year-old understands; if
   you can't, simplify; (b) after the render, read ONLY the caption chunks and the stills at 1 s intervals:
   could a stranger retell the story? If not, fix the script or the shots. Log both in PROGRESS.md.

**Voice rules:**
5. **120-145 spoken words** per episode (14-20 VO lines), aiming at about 130-150 words per minute on screen.
6. **No speed-up:** `prep_vo.py` SPEED = 1.00 for every new episode (never above 1.02). If the take is too long,
   cut words, don't speed the voice.
7. **Real silence:** 4-6 pauses of 0.6-1.0 s, placed right before reveals and after the twist (use the line gaps
   in `scripts.py`/`build_timeline.py`; never tighten gaps below natural to hit a length). Music and SFX drop out
   in those gaps, then a sting.
8. **Fewer tags:** at most 8-10 per episode. One steady base delivery (low, calm, close, like a campfire
   storyteller talking to one person), `[whispering]` only for the 1-2 creepiest lines, `[slow]` only on the
   twist. No tone flip every line.
9. After pace is fixed (Ep 6 and 7), if the voice still sounds flat, test ONE other deep storyteller voice from
   `creative_list_voices` on one episode and compare skip rate and average watch (one change at a time).

**Animation rules (from the animated horror Shorts that are winning; learn the pattern, never copy):**
10. **Give "you" a face.** Add a simple face option to `drawStick` (dot eyes that can widen and glance, short
    brows, a small mouth: neutral / worried / scared / screaming) and use it on every reaction shot. Keep the
    navy 2D vector look and the round head. The winning English animated horror Shorts all use characters whose
    fear you can read (game-engine avatars, cartoon faces); an empty head can't show it.
11. **More movement:** "you" walks, turns, flinches, steps back, drops things; the monster MOVES (head tilt,
    slow approach, crawl, sudden lean into frame), never a still cut-out. Parallax layers in wide shots; slow
    push-ins for dread; a quick cut + shake + sting on each scare; low angle on the monster.
12. **Shot variety, one focal point each:** 18-26 shots per episode, mixing wide (where), medium (what you do),
    close-up on your face (fear), POV (what you see), insert (the note, the object). Nothing important under the
    captions.
13. **Light tells the story:** torch beam, phone glow, flickering tube, headlights reveal the monster in pieces
    before the full reveal; then one clear, well-lit shot of it.
14. **Scale shot:** at least once, show the monster next to "you" so its size and wrongness read in one glance
    (top hits even title it "how tall is X next to a person").

**Already-queued old-style episodes:** when a creator run finds the queue full (every date today…today+3 has an
entry), it may rebuild ONE queued NIGHT SHIFT episode made before 2026-11-22 under these rules, but only if it
posts at least 24 h after the run starts, has not been uploaded anywhere, and the credit reserve still covers
~1,000 credits for each of the next 7 days. Write new files (`outputs/night-shift-pN-v2.mp4/.jpg`), check the
jsDelivr URLs (HTTP 200), then update that queue entry IN PLACE (video_url, cover_url, captions, title) in one
commit. Never delete the old files or the entry.

## Owner directives (2026-11-18), in force from the series after BLOCK C (item 2's word count is now 120-145)
1. **Standalone episodes.** Every post is a complete story a stranger can enjoy with zero context: setup,
   escalation, a scare they can SEE, and a twist or payoff inside the same video. A series is a repeatable
   FORMAT (same structure, title pattern, look), not one continuing plot. Links to earlier episodes are bonus
   details for returning viewers, never required. No "previously" recap.
2. **55-70 s per episode** (about 135-170 spoken words, 18-24 VO lines). Cut setup, not scares.
3. **One poster image per episode:** a specific, weird, nameable entity or sight (examples of the KIND, not to
   copy: a figure hanging upside down from a ceiling fan, a mess-hall cook with no mouth, two identical roommates
   in one bed). Show it clearly at least once, tease it in the first 3 s, put it on the cover, name it in the title.
4. **Titles state the scary image or premise,** not the series name. Pattern that works: concrete thing + place or
   time + the wrong detail ("His Baby Sister Cried At 3 AM Every NIGHT"; our own best: "Something knocked on my
   hostel door... in my voice", 733 views). Series name only in the description. One emoji at most.
5. **Keep:** bright readable frame 1 (proven), word-synced captions, the spoken A/B question (it now pulls YouTube
   comments). Make the A/B question answerable without the next episode (e.g. "Which rule would you break, A or
   B?"), or let the votes pick the NEXT episode's place/job. Never leave the story itself unfinished.
6. The switch to the new format is one deliberate reset ordered by the owner. Inside the new series go back to
   the normal rule: one test at a time (PLAYBOOK section 6).

## Post-mortem: FLOOR 0 + BLOCK C (posts 2026-11-09 … 11-18, numbers pulled 2026-11-18 18:00 IST)
| | Instagram | YouTube @dontletitsee | YouTube @lexter2025 |
|---|---|---|---|
| Total views, 10 posts | 2,032 | 3,177 | 193 |
| Followers / subscribers | 1 | 20 | 39 (unchanged) |
| Comments | 2 (both on FLOOR 0 P1) | 10 (BLOCK C P1, P4, P5, P6) | 0 |
| Shares / saves | 0 / 2 | n/a | n/a |

What went wrong, in order of damage:
1. **Serialized plot shown to strangers.** 100% of Instagram reach is non-followers, and IG gives every reel after
   the first about the same ~85-155 accounts. Part 6 of a story means nothing to someone who never saw Part 1, so they swipe or leave
   early. The zero-context hook helped (IG avg watch up to 21.5 s) but the middle of the story still needs the
   earlier parts.
2. **Too long.** BLOCK C parts run 85-96 s and YouTube's average viewed is 41-53% (P1-P4). FLOOR 0 (54-56 s)
   kept 58-61%. Instagram viewers leave at 7-21 s whatever the length. In the competitor scan below, story Shorts
   have a median of 68 s and most hits run 32-70 s.
3. **Dark, abstract openings** (fixed by the creator from Part 5 on: bright frame 1 brought the 3-second skip
   rate from 63-72% down to 43-55%).
4. **The scare is rarely a clear, specific image.** Silhouettes and empty-headed stick figures; the hit Shorts sell
   one concrete monster or wrong detail and show it.
5. **Nothing to share.** 0 shares on 10 reels; sends drive Instagram reach to non-followers.
6. **@lexter2025** gets near-zero distribution for exact duplicates (owner's call whether to keep posting there).

What worked (keep): bright frame 1; spoken A/B (YouTube comments 1 -> 10); hook-sentence YouTube titles; concrete
hostel details (roll call, mess at 3 AM, group chat); the US is the biggest YouTube audience, India second.

## Competitor scan, 2026-11-18 (YouTube search, Shorts published since 10-28, ordered by views)
Queries: "animated horror story #shorts", "scary story animation shorts", "horror story animated #shorts",
"rules horror story #shorts". 70 Shorts under 3 min; story Shorts (20 s+): median 68 s, median 678K views,
median likes 1.6% of views. Raw data: Composio workbench `/mnt/files/competitors_2026-11-18.json`.

| Views | Length | Channel (subs, started) | Title / format |
|---|---|---|---|
| 6.9M | 39 s | NIRNAAM (24K, 2025-06) | Hindi "True Horror Story" cartoon: a bloody witch hanging upside down from the roof |
| 3.3M | 36 s | DAARNOX (4K, started 2026-11-02) | Hindi "True Horror Story" cartoon, standalone |
| 3.1M | 42 s | Tyler (213K) | "They Called Him Charlie No-Face..." (game-engine animation story) |
| 2.6M | 32 s | Spooky Toons Hindi (2K, 2026-08) | "Who was sitting in the haunted train?" |
| 2.0M | 33 s | AuraRoblox (156K) | "His Baby Sister Cried At 3 AM Every NIGHT" |
| 1.9M | 69 s | HorrorKisse (4K, 2026-09) | "Raat Ki Aakhri Bus" (the last bus of the night) |
| 1.7M | 70 s | AuraRoblox | "The Dinosaur Skeleton MOVED Closer Every NIGHT" |
| 1.5M | 42 s | Taletrekking (10K) | "Haunted Shapit Gudiya" (cursed doll) |
| 942K | 34 s | AuraRoblox | "There Were TWO Moms In The KITCHEN" |
| 641K | 71 s | 90s Wala Bachpan | "Night Shift as a Dam Operator | 6 Horror Rules" |
| 511K | 70 s | Spooky Kissa | "Night Shift at a Haunted Truck Depot (6 Survival Rules)": same format every episode, new place |
| 68K | 51 s | INSTITUTE 19 | "If She Swaddles You, Fall Asleep | Analog Horror" |

Patterns:
- **Brand-new channels (2-24K subs, some started this month) pull millions:** content and format decide, not
  channel age. The feed tests every Short on strangers.
- **Standalone episodes in a repeatable format** ("Night shift at [place] + N rules", "[ordinary thing] [wrong
  behaviour] every NIGHT", "True Horror Story: [one monster]"). No hit in the scan needed a previous part.
- **One concrete, visual monster or wrong detail per Short, named in the title.**
- **Everyday, relatable places** (bus, train, kitchen, depot, hostel, school). Longer-form research agrees: Scary
  Pumpkin (3.7M subs) breaks out with standalone animated stories built on one clickable archetype or an everyday
  object/time made sinister; CJ Horror Toons wins with "one cursed, enclosed everyday location, not a multi-part
  sequel" (hostel and school stories among its best).
- **Comments are rare everywhere** (often <0.05% of views): distribution comes from the hook and watch time, not
  comment votes. Keep A/B for community, but don't build the story around it.
- The Indian (Hindi) market is the biggest pool in this niche; our narrator is English and the US is our top
  YouTube country, so stay in English. A Hindi version is an idea for the owner, not for the creator.

Sources: OutlierKit channel analyses (outlierkit.com/channel/scarypumpkin, /channel/cjhorrortoons); Buffer and
Social Media Today on Instagram ranking (watch time, likes per reach, sends per reach); Buffer on the YouTube Shorts
viewed-vs-swiped-away metric; easyviral.ai pattern notes (story Shorts 30-50 s, hook = picture + text + voice in the
first second; its own caveat: not a formal study).

## Post-mortem: BLOCK C (8 parts, 2026-11-12 … 11-19; numbers pulled 2026-11-19 01:15 IST, P8 not live yet)
| Part | IG views | IG skip rate | IG avg watch | YT views (@dontletitsee) | YT stay rate (engaged/views) | YT avg viewed | Comments (IG / YT) |
|---|---|---|---|---|---|---|---|
| P1 The List (90 s, dark open) | 142 | 52.6% | 15.9 s | 431 | 43% | 50.7% | 0 / 1 |
| P2 Present (91 s) | 145 | 54.7% | 21.4 s | 733 | 47% | 53.2% | 0 / 0 |
| P3 Left (85 s, dark) | 122 | 62.8% | 6.9 s | 225 | 53% | 40.8% | 0 / 0 |
| P4 Under the bed (89 s, dark) | 121 | 69.6% | 9.6 s | 218 | 65%* | 42.9%* | 0 / 1 |
| P5 Mess at 3 AM (88 s, BRIGHT) | 126 | 44.7% | 15.6 s | 340 | n/a (lag) | n/a | 0 / 5 |
| P6 43 (87 s, bright, no "Part n" in YT title) | 105 | 55.9% | 12.0 s | 314 | n/a | n/a | 0 / 3 |
| P7 Scratched rule (96 s, bright) | 151 | 44.6% | 21.2 s | 145 (10 h) | n/a | n/a | 0 / 0 |
| P8 Finale (76 s, bright) | — | — | — | — | — | — | — |
*partial (analytics lag ~2 days).

Worked: (1) bright, recognizable frame 1 (skip 44.6-55.9% vs 62.8-69.6% dark); (2) YouTube hook-sentence titles without
"Part n" (P6 314 views at 34 h vs P5 246 / P4 185); (3) concrete, relatable hostel details + one clear "wrong" object per
part (plate with tomorrow's date, member 43) drew the only comments.
Mistakes: (1) a continuing plot shown to strangers: IG reach stayed flat at ~105-130 per part, no part broke out;
(2) 85-96 s runtime: YouTube avg viewed 41-53%, IG viewers leave at 7-21 s; (3) the A/B vote carried too much weight:
0-1 voters on 5 of 7 cards, so "the votes decide" never really happened.
Rules for the next series: standalone 55-70 s episodes with one SHOWN entity (title + cover + first 3 s); A/B answerable
inside the episode ("which rule would you break"); every episode must work as somebody's first video.

## Post-mortem: NIGHT SHIFT (Ep 1-8, 2026-11-20 … 11-27; numbers pulled 2026-11-24 01:15 IST, Ep 5-8 not live yet)
| Ep | Place / monster | IG views | IG skip | IG avg watch | YT views (@dontletitsee) | YT comments |
|---|---|---|---|---|---|---|
| 1 | pharmacy / toe-tag customer | 257 | 36.8% | 22.8 s | 877 | 1 |
| 2 | sleeper train / upside-down passenger | **1,228** | 37.6% | **29.5 s** | **1,141** | 1 |
| 3 | delivery / too many fingers | 144 | 45.5% | 16.0 s | 199 | 2 |
| 4 | petrol pump / backwards passengers | 125 (10 h) | **32.7%** | 21.8 s | 704 (10 h) | 3 |
| 5-8 | school / cinema / toll / wedding | n/a | n/a | n/a | n/a | n/a |
Worked: (1) standalone episodes beat the continuing BLOCK C on YouTube 3 of 4 times; (2) silhouette-wrong monsters
(upside down, facing backwards) win, detail-wrong ones (a tag, fingers) lose; (3) bright, familiar Indian night places in frame 1.
Mistakes: (1) Ep 1-5 were too fast and too clever (220+ words, 3 rules, puzzles) - fixed by v2 from Ep 6; (2) the rules note and
the end card cost viewers (v3); (3) the same template look in every frame (v4 - first applied in Ep 8).
Rules for Season 2: keep the NIGHT SHIFT format and title shape (it is our only proven format); v4 look in every episode (Ep 8 is
the reference: look4.js + sets_wedding.js); a silhouette-wrong monster, shown big in frame 1 and on the cover; 145 words, ~840
credits per voice (measured: exactly 1 credit per character).

## Ideas for the next series (creator decides; all original, none of them a copy)
Format sketch: **"NIGHT SHIFT"**: each episode is one ordinary night job, the handover note with its rules, the
rule that breaks, one poster-image entity, a twist. The bible's candidate premises fit as episodes: 24-hour
pharmacy that fills prescriptions for people who died today, sleeper-train ticket checker counting one extra
passenger, delivery rider's last order to an address that exists only after midnight, a new flat's smart speaker,
the one apartment whose lights stay on in a power cut. A/B options: "which rule would you break?" or "which shift
next?". Stay clear of the @play.malo premises listed in PLAYBOOK section 1.

## Research log (newest first; PLAYBOOK section 7)
### 2026-11-28 (creator run, twice-weekly scan; YouTube Data API worked again)
Search (account youtube_regin-mont, shorts, viewCount, published after 2026-11-14), 4 queries, 78 videos. Most useful hits:
- 2.43M / 12 s "Chudail Chhipkili dar gai | Bhutiya Daravana Chudail" (Sinotal Team, 24.7k subs) + re-uploads on a 19M channel (2.15M / 7 s, 1.98M / 18 s).
- 2.28M / 44 s "Haunted Maa Ke Roop Me Chudail" (a ghost in the form of your mother; Taletrekking, 16.4k subs, started 2026-01).
- 2.33M / 81 s "PART 874 : KAKU KAKU HORROR STORY" (Amar Raghu, Telugu narrated horror, 3.6M subs; numbered daily parts).
- 2.58M / 50 s "O Monstro das Cocegas Saiu de Debaixo da Cama" (RareSnap, 112k subs, started 2026-09); 4.88M / 42 s "Tickle monster" (Roblox
  animation, 220k subs): one simple creature + a family member who saves or betrays.
- 3.99M / 2:58 "Ibu dari Danau Mengambil Anak Kedua" (the mother from the lake takes the second child; Indonesian, 243k subs, started 2026-07).
- Many non-horror hits (GTA / Minecraft / Gacha, 8-17 s) pollute these queries.
Patterns: (1) regional titles with a local monster word (chudail, bhoot) outperform English; (2) a **family member impersonated or
taken** is the top premise across 3 countries; (3) small new channels (16k-112k subs, started 2026) reach millions: the format carries,
not channel size; (4) long numbered daily series work when each part is a complete story. vs our week: our two best IG reels
(S1 Ep 5 bus-stop woman, Ep 8 bride) are also a woman in an Indian setting. Next test (ANALYTICS item 3): family-impersonation beat.
Retention: Analytics `dimensions=video` needs `sort=-views` + `maxResults` (400 without them).

### 2026-11-23 (creator run, weekly scan)
YouTube scan (youtube_regin-mont; 4 queries: "animated horror story #shorts", "scary story animation shorts", "rules horror story
#shorts", "night shift horror animation"; Shorts since 11-09 by views; 75 unique). The top is dominated by Hindi "bhoot wala
cartoon" channels and kids' Minecraft/Roblox skits (not our audience). Useful original-story hits:
| Views | Length | Channel | Title / what it does |
|---|---|---|---|
| 4.3M | 42 s | Lovelyhorrorshow | "Bhutiya Grandmother": Hindi 2D cartoon, one creature in a family home |
| 2.0M | 96 s | FanFabolix | "Never draw a face on the wall at night!" (Indonesian): the title IS one prohibition |
| 1.5M | 60 s | stor.ybrick | "The 2:17 bus: nobody who boarded it came back" (Malayalam): a time + a vehicle + a plain consequence |
| 1.3M | 50 s | AuraRoblox | "His sister saved him from the night ice cream TRUCK": an everyday vehicle at night turned monster |
| 1.1M | 147 s | Movie Flash Français | "The easel that erases people": one object, one plain power |
| 1.1M | 29 s | Deniverse | "This ice cream truck hides a terrifying secret" (Indonesian) |
| 0.8-2.0M | 11-59 s | Tudicore Darr TV, Sinotal, DARKNISHI, Khooni Kohra | Hindi 2D horror cartoons with a visible creature in frame 1 |
Patterns: (1) titles state one rule or one plain consequence with a time ("2:17", "at night"); (2) night-time vehicles and
everyday places beat abstract settings; (3) Indian-language 2D horror cartoons are a huge market (our audience is largely
Indian: Ep 2 sleeper train was our hit); (4) the creature is in frame 1, big. Compared with us: matches our standalone
recipe; our Ep 7 (highway toll booth + truck) fits pattern 2.
YouTube retention 11-09..11-22 (lag, NIGHT SHIFT not in yet): BLOCK C stay rate 43-62% (P4/P5/P7 best), FLOOR 0 34-52%.
Applied: nothing new on the voice/animation side (one change at a time); the silhouette rule (ANALYTICS item 3) comes from our
own numbers. Candidate next test after the A/B test: a prohibition-style YouTube title ("Never ... at 3 AM").

### 2026-11-21 (owner session: animation and voice)
Our numbers: NIGHT SHIFT Ep 2 (train) 964 IG views in 4.5 h (best ever, skip 37.2%, avg watch 30.4 s, first
shares); Ep 1 252 IG / 872 YT. Main YouTube 29 subs. @lexter2025 still 0-1 views per upload.
YouTube scan, English animated horror Shorts published since 10-22 (6 queries, 67 results 15-180 s, median of the
top 25: 62 s). Original-story hits (fan/IP pieces skipped; never use other people's characters):
| Views | Length | Channel | Title / what it does |
|---|---|---|---|
| 3.6M | 126 s | Gelo Stories | "In This Town, If You Get Hurt, You Die": the title IS the one rule; game-engine avatars with readable faces |
| 3.5M | 37 s | Size Cipher | "he ate them - STEAK": one creature, one gift, one twist; description invites "how tall is X next to a person?" |
| 3.0M | 117 s | Ruckus Town | "The Scarecrows Play RED ROVER": a recurring town of characters, a childhood game turned deadly |
| 3.0M | 87 s | Afterpast | "He Sold the Most Famous Fried Chicken on Route 66. He Never Bought One Chicken....": the twist is implied by the title in plain words |
| 1.4M | 142 s | Gelo Stories | "Nobody Tells Their Age!": again one rule for a whole place |
| 1.2M | 46 s | Size Cipher | "Don't turn around. It only moves when you do.": one rule, one monster |
Patterns: one rule or one wrong fact per story, stated in the title in plain words; characters with faces that
show fear; the creature shown with scale; most hits 37-126 s. Trend to watch: creature "lore" Shorts ("What is
Elephant 2028?") built on one invented creature; our poster-image entities could get their own short "what is it"
lore episode later.
Applied: owner directives v2 above (clarity, voice, animation).

### 2026-11-19 (creator run, BLOCK C finale queued)
No new competitor scan (last one 2026-11-18, next due on/after Monday 2026-11-23). YouTube retention (YOUTUBE_QUERY_ANALYTICS,
youtube_regin-mont, 11-09..11-18; needs maxResults with the video dimension): engaged/views P1 43%, P2 47%, P3 53%, FLOOR 0
P1 51%, P2 49%, P3 34%; avg viewed BLOCK C 41-53% vs FLOOR 0 59-61% (P2 175% = replays). Confirms: shorter is better.
Post-mortem above; NIGHT SHIFT (`series/night-shift/SERIES.md`) designed from it.
### 2026-11-18 (owner session)
Scan and post-mortem above. Next scan: the first creator run on or after Monday 2026-11-23.
