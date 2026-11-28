#!/usr/bin/env python3
"""Opening check (owner directive v5, 2026-11-28): measures brightness and colour of the first 3 seconds.

Usage:  python3 night-shift/engine/hookcheck.py outputs/night-shift-2-p3.mp4 [more.mp4 ...]

Prints mean HSV value (brightness) and saturation, 0-255, at 0, 0.5, 1, 1.5, 2 and 2.5 s.
Reference (IG, 2026-11-28): Ep 8 wedding, best reel ever, 21% skip: V 144-173, S 137-148.
Losers: S2 Ep1 crossing V 91-101 (46% skip), Ep 6 cinema V 102-104 (48% skip).
MUST: every sample V >= 130.  TARGET: average S >= 100 (warm, colourful, celebration look).
Exit code 1 if a MUST fails, so a build script can stop on it.
"""
import io
import subprocess
import sys

from PIL import Image, ImageStat

TIMES = (0, 0.5, 1, 1.5, 2, 2.5)
V_MIN, S_TARGET = 130, 100


def sample(path, t):
    png = subprocess.run(
        ['ffmpeg', '-v', 'error', '-ss', str(t), '-i', path, '-frames:v', '1',
         '-f', 'image2pipe', '-vcodec', 'png', '-'],
        capture_output=True, check=True).stdout
    _, s, v = ImageStat.Stat(Image.open(io.BytesIO(png)).convert('HSV')).mean
    return v, s


def main(paths):
    failed = False
    for path in paths:
        vals = [sample(path, t) for t in TIMES]
        vmin = min(round(v) for v, _ in vals)
        savg = sum(s for _, s in vals) / len(vals)
        must = vmin >= V_MIN
        failed |= not must
        print(f"{path}: V " + ' '.join(f'{v:.0f}' for v, _ in vals)
              + "  S " + ' '.join(f'{s:.0f}' for _, s in vals)
              + f"  -> brightness {'PASS' if must else 'FAIL'} (min {vmin:.0f}, need {V_MIN})"
              + f", colour {'PASS' if savg >= S_TARGET else 'below target'} (avg {savg:.0f}, target {S_TARGET})")
    return 1 if failed else 0


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    sys.exit(main(sys.argv[1:]))
