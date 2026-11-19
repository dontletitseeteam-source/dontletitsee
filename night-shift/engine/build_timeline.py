"""Build the edit timeline for FLOOR 0.

Reads the ElevenLabs word alignment of the chosen VO take, splits it into the
script's lines, re-spaces the lines with designed gaps (the pacing pass), and
writes timeline.json: per-line source/destination times, per-word destination
times and the caption chunks.
"""
import json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
import sys
from scripts import LINES as ALL, HOLD
PART = int(sys.argv[1]) if len(sys.argv) > 1 else 1
AUD = ROOT / f"p{PART}" / "audio"
LINES = ALL[PART]
END_HOLD = HOLD[PART]



def norm(w):
    return re.sub(r"[^a-z0-9']", "", w.lower().replace("’", "'"))


import numpy as np
DB = np.load(AUD / "vo_rms_db.npy")  # 10 ms RMS frames of vo.wav in dBFS


def main():
    raw = json.load(open(AUD / "words_fast.json", encoding="utf-8"))["words"]
    words = [w for w in raw if w.get("type", "word") == "word" and not w["text"].startswith("[")
             and not w["text"].endswith("]")]
    # silence map: list of (start, end)
    sil, cur = [], None
    for ln in open(AUD / "vo_silence.txt"):
        k, v = ln.split(":")
        v = float(v)
        if k.endswith("start"):
            cur = v
        elif cur is not None:
            sil.append((cur, v)); cur = None

    wi = 0
    out_lines = []
    t = 0.0
    for li, (text, gap, chunks) in enumerate(LINES):
        toks = [norm(x) for x in text.split()]
        lw = []
        for tok in toks:
            w = words[wi]
            assert norm(w["text"]) == tok, (li, tok, w["text"])
            lw.append(w); wi += 1
        src_start = lw[0]["start"]
        last_start = lw[-1]["start"]
        nxt = words[wi]["start"] if wi < len(words) else lw[-1]["end"] + 0.3
        # true end = first silence that starts after the last word's onset
        # true end = first 100 ms run below -68 dBFS after the last word's onset
        i0 = int((last_start + 0.12) * 100)
        quiet = 0
        src_end = nxt
        for i in range(i0, len(DB)):
            quiet = quiet + 1 if DB[i] < -68 else 0
            if quiet >= 10:
                src_end = (i - 9) / 100.0
                break
        src_end = min(src_end + 0.05, nxt - 0.02)  # keep the breath tail
        src_start = max(0.0, src_start - 0.05)
        t += gap
        dst_start = t
        dur = src_end - src_start
        off = dst_start - src_start
        ww = [{"text": w["text"], "start": round(w["start"] + off, 3), "end": round(min(w["end"], src_end) + off, 3)}
              for w in lw]
        caps, k = [], 0
        for n, disp in chunks:
            caps.append({"text": disp, "start": ww[k]["start"], "word_idx": k})
            k += n
        assert k == len(ww) or not chunks, (li, k, len(ww))
        for i, c in enumerate(caps):
            c["end"] = caps[i + 1]["start"] if i + 1 < len(caps) else round(dst_start + dur + 0.12, 3)
        out_lines.append({"id": li + 1, "text": text, "src_start": round(src_start, 3), "src_end": round(src_end, 3),
                          "start": round(dst_start, 3), "end": round(dst_start + dur, 3), "words": ww, "captions": caps})
        t = dst_start + dur
    total = round(t + END_HOLD, 3)
    json.dump({"fps": 30, "width": 1080, "height": 1920, "duration": total, "lines": out_lines},
              open(ROOT / f"p{PART}" / "timeline.json", "w"), indent=1)
    for L in out_lines:
        print(f"L{L['id']:>2} {L['start']:6.2f}-{L['end']:6.2f}  {L['text']}")
    print("TOTAL", total)


if __name__ == "__main__":
    main()
