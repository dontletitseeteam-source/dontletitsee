# Research: what growing horror Shorts/Reels do, and what we got wrong

Owner's order (2026-11-18): "post after analysing mistakes, improve stories and elements, and research
different channels like this which are actually gaining something." This file is the creator's standing brief.
Read it before designing a series and before writing every script. PLAYBOOK section 7 says how to keep it fresh.

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

## Ideas for the next series (creator decides; all original, none of them a copy)
Format sketch: **"NIGHT SHIFT"**: each episode is one ordinary night job, the handover note with its rules, the
rule that breaks, one poster-image entity, a twist. The bible's candidate premises fit as episodes: 24-hour
pharmacy that fills prescriptions for people who died today, sleeper-train ticket checker counting one extra
passenger, delivery rider's last order to an address that exists only after midnight, a new flat's smart speaker,
the one apartment whose lights stay on in a power cut. A/B options: "which rule would you break?" or "which shift
next?". Stay clear of the @play.malo premises listed in PLAYBOOK section 1.

## Research log (newest first; PLAYBOOK section 7)
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
