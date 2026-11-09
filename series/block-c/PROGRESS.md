# BLOCK C — progress log

## Part 1 "The List" — target date 2026-11-12 — VOICE DONE, NOT YET RENDERED
The first cloud test run (2026-11-09 15:26 IST) wrote the script and paid for the voiceover, but could not
download it (sandbox network blocked `elevenlabsusercontent.com`) or push (GitHub 403). Both are being fixed.
The paid take was saved here from the owner's PC, so **do NOT generate Part 1's voice again**:
- `block-c/p1/audio/vo.mp3` — ElevenLabs eleven_v4, voice BVPhWQykET1TSvfGzrUr, 87.6 s raw
  (flow `YHXGyGdZN9LOCZNvIo1D`, node `JZeNdwB5YWoN87h4rPtV`, generation `wZ0gtqJRJUiXWQaU06do`, 1,643 credits)
- `block-c/p1/audio/words_raw.json` — eleven_scribe_v1 word timings (session `TRnVEmvJPFaUObiXLR2m`);
  matches the prompt word for word
- `block-c/p1/audio/vo_prompt.txt` — the exact spoken text with audio tags

Next run: rebuild `scripts.py` P1 from `vo_prompt.txt` (split into ~28 lines at the `[short pause]` marks; caption
word counts must match the spoken words), then prep_vo → build_timeline → part1.js → mix → finalize → outputs/ →
queue entry dated 2026-11-12.

Story beats: the last occupant's rules list (rules 1–5 read aloud, 6 scratched out so hard the paper tore);
roommate **Kabir** laughs it off; BLOCK C group pings: the warden died six years ago, roll call never stopped;
12:06 → corridor lights die one by one; footsteps stop at every door, each room answers "present"; feet under the
door of Room 13, pages turn; it calls Kabir ("present"), then calls YOUR name — you moved in today, you're on no
register. "Nobody here knows your name. It does." Choice: **A) answer "Present"**  **B) stay silent**.
