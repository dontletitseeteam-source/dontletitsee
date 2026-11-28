# ElevenLabs credit ledger

Rules: PLAYBOOK section 5. Owner's wish: spend the credits on quality; running out around day 23–25
(~2026-12-02 … 12-04) is fine. Pace ≈ 1,800 credits per part. Append one row per generation (voice,
transcript, SFX) with the balance after it. When the balance is too low for another part, write
**CREDITS USED UP** at the top of this file.


**OWNER ANSWER (2026-11-28 18:05 IST): the owner will renew the ElevenLabs subscription on 2026-12-05. Until then do NOT spend
on `payg`. Keep posting every day: episodes due 2026-12-01 to 12-04 are NO-VOICE episodes (story told in on-screen serif captions,
music + SFX, 0 credits) and must still pass the v5 checks (RESEARCH.md top); keep captions to 1 short sentence on screen at a
time, 2-3 s each, 50-60 s total. On 12-05 call `account_get_usage` before building: if the tier is a subscription again, that
day's episode gets voice; if it is still `payg`, make it no-voice too and check again next run.**

**2026-11-28 01:15 IST (creator): `account_get_usage` CHANGED: tier `payg` (was `starter`), status active, 0 of 10,000 characters
used, next reset 2026-12-28 06:12 IST, overage 0 INR. The Starter subscription (and its 2026-11-30 40,000 reset) seems to have
ended or been switched to pay-as-you-go, which may bill the owner per character. Nothing was generated this run (queue full to
11-30). Rule until the owner confirms: do NOT spend on `payg` (real money). If the tier is still `payg` when an episode must be
built, make it a no-voice episode (0 credits). If it shows `starter`/a refill again, carry on with voice as planned. Owner notified.**

**REAL BALANCE CHECK (owner session, 2026-11-23 22:00 IST): `account_get_usage` (now permitted) says starter tier,
36,107 of 40,000 used -> only 3,893 credits left, and the monthly reset is 2026-11-30 17:36 IST (12:06 UTC), after
which 40,000 are available again. This ledger said 19,324: it undercounted (transcripts logged as 0, retries, or
eleven_v4 costing more than 1 credit per character). 199 of the 36,107 are two style-test images from the owner
session. From now on:**
- **Call `account_get_usage` at the start of every run and right before and after every paid generation; log the
  REAL difference as the cost** (keep the chars too). Trust the API, not this table.
- **Never write CREDITS USED UP while a monthly reset is due** (the original creator task stops for good on that
  phrase). Write `PAUSED UNTIL RESET <date time IST>` instead.
- Until the reset the 3,893 must cover the posts of 2026-11-27, 28, 29 and 30. Measure the real cost of the next
  episode. If the balance can't pay for a voiced episode, make a **no-voice episode** (the story told in on-screen
  text, with library music and SFX: zero credits) rather than leave a day empty.
- After each reset, plan the month: (real voice cost per episode x days in the cycle) first, then the rest for art
  plates (RESEARCH.md v4), capped at 450 per episode.

**2026-11-24 (creator): measured the real cost of a voice: NIGHT SHIFT Ep 8 = 837 characters -> exactly 837 credits
(account_get_usage before/after). Real balance 2,857 until the 2026-11-30 17:36 IST reset; Season 2 Ep 1-3 (11-28/29/30)
must stay <= 850 characters each.**

**Owner extension (2026-11-23): no end date. Keep posting daily after 2026-12-08 while credits last; before
writing CREDITS USED UP, check the real balance with `account_get_usage` (the Starter plan may refill monthly)
and log any refill as a row.**

Starting balance: **39,717 credits** (owner's screenshot, 2026-11-09, Starter plan, 40,000 total).
BLOCK C Part 1's voice was already paid before this balance and is saved in `block-c/p1/audio/`.

| Date (IST) | Series · part | What | Credits | Balance after |
|---|---|---|---|---|
| 2026-11-09 | — | starting balance | — | 39,717 |
| 2026-11-13 | BLOCK C · Part 2 | voice (eleven_v4, Jack, 1,677 chars) + scribe transcript (0) | 1,677 | 38,040 |
| 2026-11-14 | BLOCK C · Part 3 | voice (eleven_v4, Jack, 1,620 chars) + scribe transcript (0) | 1,620 | 36,420 |
| 2026-11-15 | BLOCK C · Part 4 | voice (eleven_v4, Jack, 1,694 chars) + scribe transcript (0) | 1,694 | 34,726 |
| 2026-11-16 | BLOCK C · Part 5 | voice (eleven_v4, Jack, 1,753 chars) + scribe transcript (0) | 1,753 | 32,973 |
| 2026-11-17 | BLOCK C · Part 6 | voice (eleven_v4, Jack, 1,676 chars) + scribe transcript (0) | 1,676 | 31,297 |
| 2026-11-18 | BLOCK C · Part 7 | voice (eleven_v4, Jack, 1,759 chars) + scribe transcript (0) | 1,759 | 29,538 |
| 2026-11-19 | BLOCK C · Part 8 (finale) | voice (eleven_v4, Jack, 1,424 chars) + scribe transcript (0) | 1,424 | 28,114 |
| 2026-11-19 | NIGHT SHIFT · Episode 1 | voice (eleven_v4, Jack, 1,303 chars) + scribe transcript (0) | 1,303 | 26,811 |
| 2026-11-20 | NIGHT SHIFT · Episode 2 | voice (eleven_v4, Jack, 1,368 chars) + scribe transcript (0) | 1,368 | 25,443 |
| 2026-11-20 | NIGHT SHIFT · Episode 3 | voice (eleven_v4, Jack, 1,397 chars) + scribe transcript (0) | 1,397 | 24,046 |
| 2026-11-21 | NIGHT SHIFT · Episode 4 | voice (eleven_v4, Jack, 1,418 chars) + scribe transcript (0) | 1,418 | 22,628 |
| 2026-11-21 | NIGHT SHIFT · Episode 5 | voice (eleven_v4, Jack, 1,449 chars) + scribe transcript (tool quoted 165; counted to be safe) | 1,614 | 21,014 |
| 2026-11-22 | NIGHT SHIFT · Episode 6 | voice (eleven_v4, Jack, 841 chars, v2 rules: 145 words, 9 tags) + scribe transcript (0) | 841 | 20,173 |
| 2026-11-23 | NIGHT SHIFT · Episode 7 | voice (eleven_v4, Jack, 849 chars, v2: 145 words, 8 tags) + scribe transcript (0) | 849 | 19,324 |
| 2026-11-24 | NIGHT SHIFT · Episode 8 (finale) | voice (eleven_v4, Jack, 837 chars, 145 words, 8 tags) + scribe transcript (0). REAL: account_get_usage 36,306 -> 37,143 used = 837 (voice costs exactly 1 credit/char) | 837 | **2,857 (real)** |
| 2026-11-25 | NIGHT SHIFT S2 · Episode 1 (railway crossing; engine part 9) | voice (eleven_v4, Jack, 845 chars, 143 words, 8 tags) + scribe transcript (0). REAL: account_get_usage 37,143 -> 37,988 used = 845 | 845 | **2,012 (real)** |
| 2026-11-26 | NIGHT SHIFT S2 · Episode 2 (ATM booth; engine part 10) | voice (eleven_v4, Jack, 820 chars, 143 words, 8 tags) + scribe transcript (0). REAL: account_get_usage 37,988 -> 38,808 used = 820 | 820 | **1,192 (real)** |
| 2026-11-27 | NIGHT SHIFT S2 · Episode 3 (night bus; engine part 11) | voice (eleven_v4, Jack, 834 chars, 141 words, 7 tags) + scribe transcript (0). REAL: account_get_usage 38,808 -> 39,642 used = 834 | 834 | **358 (real)** |
