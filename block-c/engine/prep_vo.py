"""Prepare a part's VO: wav, 6% tempo tighten, RMS map, scaled word timings, silence map."""
import sys, json, subprocess, pathlib, numpy as np
ROOT = pathlib.Path(__file__).resolve().parent.parent
P = int(sys.argv[1]); A = ROOT / f"p{P}" / "audio"; SPEED = 1.06
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(A / "vo.mp3"), "-ac", "1", "-ar", "48000", str(A / "vo.wav")], check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(A / "vo.wav"), "-af", f"atempo={SPEED}", "-ar", "48000", str(A / "vo_fast.wav")], check=True)
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(A / "vo_fast.wav"), "-f", "f32le", "-ac", "1", "-ar", "48000", "-"], capture_output=True).stdout
x = np.frombuffer(raw, np.float32); hop = 480; n = len(x) // hop
np.save(A / "vo_rms_db.npy", 20 * np.log10(np.sqrt((x[:n * hop].reshape(n, hop) ** 2).mean(1) + 1e-12)))
d = json.load(open(A / "words_raw.json", encoding="utf-8"))
for w in d["words"]: w["start"] /= SPEED; w["end"] /= SPEED
json.dump(d, open(A / "words_fast.json", "w"))
out = subprocess.run(["ffmpeg", "-v", "info", "-i", str(A / "vo_fast.wav"), "-af", "silencedetect=noise=-40dB:d=0.12", "-f", "null", "-"], capture_output=True, text=True).stderr
import re
open(A / "vo_silence.txt", "w").write("\n".join(re.findall(r"silence_(?:start|end): [0-9.]+", out)) + "\n")
print("prepped", P, round(len(x) / 48000, 2), "s")
