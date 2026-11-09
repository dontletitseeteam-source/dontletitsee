# Don't Let It See — automation repo

Source, assets and posting queue for the horror reel channel **Don't Let It See**
(Instagram + YouTube @dontletitsee). Three Claude cloud routines run the channel daily:

| Routine | Time (IST) | Job |
|---|---|---|
| Creator | 01:00 and 11:00 | Makes the next part (see `PLAYBOOK.md`), commits it to `outputs/`, adds it to `queue.json` |
| YouTube | ~13:31 | Uploads the day's part right after the shared upload quota resets; public at 15:00 |
| Instagram | 15:00 | Publishes the day's part, verifies it, retries any blocked YouTube upload |

`floor-0/` is Series 1 (the house style). `series/` holds series bibles and progress logs.
