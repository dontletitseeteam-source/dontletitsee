"""NIGHT SHIFT — sound mix for one part:  python mix.py <part>

Assembles the re-spaced voiceover from p<part>/timeline.json, lays every SFX
cue on the key times exported by render.js (p<part>/keys.json), rides the
underscore and room tone (ducked under the voice), and writes
p<part>/out/mix.wav at -14 LUFS.
"""
import json, subprocess, pathlib, sys, wave
import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent.parent
PART = int(sys.argv[1]) if len(sys.argv) > 1 else 1
PD = ROOT / f"p{PART}"
A = ROOT / "audio"          # shared SFX + scores
SR = 48000
T = json.load(open(PD / "timeline.json"))
K = json.load(open(PD / "keys.json"))
DUR = T["duration"]
N = int(DUR * SR) + SR
OUT = PD / "out"; OUT.mkdir(exist_ok=True)


def load(path, filt=None, mono=False):
    path = pathlib.Path(path)
    if not path.is_absolute(): path = A / path
    cmd = ["ffmpeg", "-v", "error", "-i", str(path)]
    if filt: cmd += ["-af", filt]
    cmd += ["-f", "f32le", "-ac", "1" if mono else "2", "-ar", str(SR), "-"]
    x = np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32)
    return x.copy() if mono else x.reshape(-1, 2).copy()


def db(g): return 10 ** (g / 20)


def fade(x, fi=0.005, fo=0.02):
    a = int(fi * SR); b = int(fo * SR)
    if a: x[:a] *= np.linspace(0, 1, a)[:, None]
    if b: x[-b:] *= np.linspace(1, 0, b)[:, None]
    return x


sfx = np.zeros((N, 2), np.float32)


def place(x, t, gain=0.0, fi=0.003, fo=0.03, maxlen=None, buf=None):
    buf = sfx if buf is None else buf
    x = x.copy()
    if maxlen: x = x[: max(1, int(maxlen * SR))]
    x = fade(x, fi, min(fo, len(x) / SR / 2)) * db(gain)
    i = int(round(t * SR))
    if i < 0: x = x[-i:]; i = 0
    j = min(N, i + len(x))
    if j > i: buf[i:j] += x[: j - i]


def wwav(path, data, ch):
    d = np.clip(data, -1, 1)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(ch); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((d * 32767).astype(np.int16).tobytes())


def automation(points):
    ts = np.array([p[0] for p in points]); gs = np.array([p[1] for p in points])
    return db(np.interp(np.arange(N) / SR, ts, gs)).astype(np.float32)[:, None]


def bed(name, filt=None):
    x = load(name, filt)
    return np.tile(x, (int(np.ceil(N / len(x))) + 1, 1))[:N]


def peak_time(x):
    return float(np.argmax(np.abs(x).max(1))) / SR


# ---------------- voice ----------------
vo_src = load(PD / "audio" / "vo_fast.wav", "highpass=f=75,lowpass=f=15000", mono=True)
vo = np.zeros(N, np.float32)
for L in T["lines"]:
    a, b = int(L["src_start"] * SR), int(L["src_end"] * SR)
    seg = vo_src[a:b].copy()
    f = int(0.006 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f * 3:] *= np.linspace(1, 0, f * 3)
    i = int(L["start"] * SR); vo[i:i + len(seg)] += seg
wwav(OUT / "vo_edit_raw.wav", vo, 1)
proc = subprocess.run(["ffmpeg", "-v", "error", "-i", str(OUT / "vo_edit_raw.wav"), "-af",
                       "acompressor=threshold=-24dB:ratio=3:attack=8:release=120:makeup=2,"
                       "equalizer=f=180:t=q:w=1:g=2,equalizer=f=3500:t=q:w=1.2:g=2.5,"
                       "loudnorm=I=-17:TP=-2:LRA=9",
                       "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True)
vo = np.frombuffer(proc.stdout, np.float32).copy()
vo = np.pad(vo, (0, max(0, N - len(vo))))[:N]
vo2 = np.stack([vo, vo], 1)
env = np.convolve(np.abs(vo), np.ones(int(0.03 * SR)) / int(0.03 * SR), mode="same")
step = 480; e_ds = env[::step]; out = np.zeros_like(e_ds); cur = 0
for i, v in enumerate(e_ds):
    cur = v if v > cur else cur * 0.93; out[i] = cur
duck = np.clip(np.interp(np.arange(N), np.arange(len(out)) * step, out) / 0.05, 0, 1)
duck_gain = db(-6 * duck).astype(np.float32)[:, None]

# ---------------- shared sounds ----------------
ding = load("ding.mp3"); ding_far = load("ding.mp3", "lowpass=f=1800,aecho=0.8:0.6:90|170:0.35|0.2")
boom = load("boom.mp3"); door_open = load("door_open.mp3"); slam = load("door_slam.mp3")
buzz = load("buzz.mp3"); tick = load("tick.mp3"); shutter = load("shutter.mp3"); stinger = load("stinger.mp3")
riser = load("riser.mp3"); motor = load("motor.mp3"); motor_down = load("motor.mp3", "areverse,lowpass=f=900")
heartbeat = load("heartbeat.mp3"); whisper = load("whisper.mp3")
tick_soft = load("tick.mp3", "lowpass=f=2500,volume=0.6")


def noise_burst(dur, lo, hi, seed=0, attack=0.01):
    """filtered noise burst (page flick / paper)"""
    rng = np.random.default_rng(seed)
    n = int(dur * SR); x = rng.standard_normal(n).astype(np.float32)
    X = np.fft.rfft(x); f = np.fft.rfftfreq(n, 1 / SR); X[(f < lo) | (f > hi)] = 0
    x = np.fft.irfft(X, n).astype(np.float32)
    env = np.minimum(1, np.arange(n) / (attack * SR)) * np.exp(-np.linspace(0, 6, n))
    x = x * env; x /= (np.abs(x).max() + 1e-9)
    return np.stack([x, x], 1)


def part1():
    """NIGHT SHIFT Ep.1 — the all-night pharmacy."""
    lights_off = load("lights_off.mp3"); door = load("door_open.mp3", "lowpass=f=2500")
    breath = load("whisper.mp3", "lowpass=f=900,asetrate=48000*0.8,aresample=48000")
    paper = noise_burst(0.6, 800, 5000, 41, 0.03) * 0.5
    slide = noise_burst(0.9, 600, 4000, 43, 0.15) * 0.45
    pen = noise_burst(0.5, 1500, 6000, 31, 0.02) * 0.4
    frost = noise_burst(1.6, 3000, 12000, 77, 0.4) * 0.35
    pills = noise_burst(0.12, 2500, 9000, 13, 0.002) * 0.5
    drip = load("tick.mp3", "lowpass=f=1800,asetrate=48000*0.7,aresample=48000")
    m1 = np.pad(load("music_p3.mp3"), ((0, N), (0, 0)))[:N] * automation([
        (0, -16), (K["feet"], -15), (K["me"], -19), (K["r1"], -18), (K["sorry"], -16), (K["slip"], -15),
        (K["diedW"], -11), (K["rule2"], -16), (K["frostW"], -13), (K["pills"], -15), (K["whyW"], -11),
        (K["lean"], -15), (K["dieW"], -40), (K["goneW"], -16), (K["earlyW"], -12), (K["tray"], -15), (K["nameW"], -10),
        (K["choice"], -15), (DUR - 1.2, -15), (DUR, -40)])
    hum = bed("hum.mp3", "highpass=f=200,lowpass=f=3000") * automation([(0, -22), (K["dieW"], -22), (K["dieW"] + 0.1, -60), (K["goneW"] - 0.25, -60), (K["goneW"], -20), (DUR, -24)])
    place(boom, 0.05, -13, fo=0.8, maxlen=2.0)
    place(stinger, 0.0, -15, fo=0.5, maxlen=1.2)
    for i in range(6): place(drip, 0.6 + i * 0.62, -20, maxlen=0.2)
    place(stinger, K["toeW"] - 0.03, -11, fo=0.5, maxlen=1.2); place(boom, K["toeW"], -11, fo=0.6, maxlen=1.6)
    place(ding_far, K["me"] + 0.1, -18, fo=0.6, maxlen=1.6)
    place(paper, K["lastW"] - 0.1, -13)
    for k in ("r1", "r2", "r3"): place(tick, K[k] + 0.02, -13)
    place(boom, K["neverW"], -14, fo=0.6, maxlen=1.6)
    place(breath, K["sorry"] + 0.1, -15, fi=0.2, fo=0.5, maxlen=1.8)
    place(pen, K["leftW"] - 0.2, -14)
    place(slide, K["slidesW"] - 0.05, -12)
    place(frost, K["freezeW"] - 0.2, -15, fi=0.3, fo=0.6)
    place(pen, K["thomasW"] - 0.1, -14)
    place(paper, K["paper"] + 0.05, -13)
    place(riser, K["diedW"] - 0.06 - len(riser) / SR, -21, fi=1.2, fo=0.004)
    place(stinger, K["diedW"] - 0.03, -10, fo=0.5, maxlen=1.4); place(boom, K["diedW"], -9, fo=0.6, maxlen=2.0)
    place(heartbeat, K["askW"], -14, fi=0.1, fo=0.4, maxlen=K["frostW"] - K["askW"])
    place(boom, K["moveW"], -13, fo=0.6, maxlen=1.6)
    place(frost * 1.4, K["frostW"] - 0.1, -12, fi=0.2, fo=0.8)
    for i in range(14): place(pills, K["pills"] + 0.15 + i * 0.17 + (i % 3) * 0.02, -16 + (i % 2) * 2)
    place(heartbeat, K["shakeW"] - 0.3, -12, fi=0.1, fo=0.3, maxlen=K["ask"] - K["shakeW"] + 0.6)
    place(riser, K["whyW"] - 0.06 - len(riser) / SR, -19, fi=1.5, fo=0.004)
    place(stinger, K["whyW"] - 0.03, -10, fo=0.5, maxlen=1.4)
    place(buzz, K["coldQ"] + 0.1, -16, maxlen=0.8, fo=0.3)
    place(breath, K["lean"] + 0.2, -12, fi=0.2, fo=0.5, maxlen=2.2)
    place(frost, K["keepW"] - 0.2, -14, fi=0.3, fo=0.6)
    place(stinger, K["downW"] - 0.03, -9, fo=0.5, maxlen=1.4); place(boom, K["downW"], -8, fo=0.6, maxlen=2.2)
    place(lights_off, K["dieW"] - 0.05, -10, maxlen=1.2, fo=0.3)
    place(buzz, K["goneW"] - 0.28, -14, maxlen=0.6, fo=0.2)
    place(door, K["goneW"] + 0.2, -16, fo=0.6, maxlen=1.6)
    place(paper, K["sig"] + 0.05, -14)
    place(stinger, K["earlyW"] - 0.03, -11, fo=0.5, maxlen=1.2); place(boom, K["earlyW"], -10, fo=0.6, maxlen=1.8)
    place(paper, K["tomW"] - 0.1, -14)
    place(riser, K["nameW"] - 0.06 - len(riser) / SR, -18, fi=1.5, fo=0.004)
    place(stinger, K["nameW"] - 0.03, -8, fo=0.5, maxlen=1.4); place(boom, K["nameW"], -7, fo=0.8, maxlen=2.4)
    place(boom, K["choice"] - 0.1, -17, fo=0.8, maxlen=2.5)
    place(tick, K["optA"], -12); place(tick, K["optB"], -12)
    place(tick, K["ctaA"], -14); place(tick, K["ctaB"], -14)
    return m1, hum


def part2():
    """NIGHT SHIFT Ep.2 — the sleeper train."""
    lights_off = load("lights_off.mp3")
    breath = load("whisper.mp3", "lowpass=f=900,asetrate=48000*0.8,aresample=48000")
    paper = noise_burst(0.6, 800, 5000, 41, 0.03) * 0.5
    pen = noise_burst(0.5, 1500, 6000, 31, 0.02) * 0.4
    click = noise_burst(0.05, 2500, 9000, 13, 0.001) * 0.7
    clack = noise_burst(0.12, 80, 900, 5, 0.002)
    # the train: low rumble bed + rail clacks (two per 1.1 s), muffled in the night, sharp in the tunnel
    rng = np.random.default_rng(9); x = rng.standard_normal(N).astype(np.float32)
    X_ = np.fft.rfft(x); f = np.fft.rfftfreq(N, 1 / SR); X_[(f < 30) | (f > 240)] = 0
    x = np.fft.irfft(X_, N).astype(np.float32); x /= (np.abs(x).max() + 1e-9)
    x *= (0.85 + 0.15 * np.sin(np.arange(N) / SR * 2 * np.pi * 0.9)).astype(np.float32)
    rb = np.stack([x, x], 1) * db(-14)
    t0 = 0.3
    while t0 < DUR:
        place(clack, t0, -16, buf=rb); place(clack, t0 + 0.16, -19, buf=rb); t0 += 1.1
    rb = rb * automation([(0, 0), (K["rule2"], 0), (K["rule2"] + 0.6, -3), (K["tunnelW"] - 0.3, -3), (K["tunnelW"], 3),
                          (K["dieW"], 3), (K["backW"], 0), (K["choice"], -2), (DUR - 1, -2), (DUR, -40)])
    m1 = np.pad(load("music_p3.mp3"), ((0, N), (0, 0)))[:N] * automation([
        (0, -16), (K["arms"], -15), (K["me"], -19), (K["r1"], -18), (K["last"], -16), (K["station"], -16),
        (K["s73W"], -11), (K["chart"], -16), (K["rule2"], -16), (K["above"], -14), (K["n73W"], -11), (K["rule3"], -15),
        (K["upW"], -11), (K["man"], -12), (K["smile"], -13), (K["dieW"], -40), (K["backW"], -16), (K["chart2"], -15),
        (K["nameW"], -11), (K["sittingW"], -10), (K["choice"], -15), (DUR - 1.2, -15), (DUR, -40)])
    place(boom, 0.05, -13, fo=0.8, maxlen=2.0)
    place(stinger, 0.0, -15, fo=0.5, maxlen=1.2)
    for i in range(9): place(click, K["youW"] + i * 0.06, -10)
    place(stinger, K["c73W"] - 0.03, -11, fo=0.5, maxlen=1.2); place(boom, K["c73W"], -11, fo=0.6, maxlen=1.6)
    place(breath, K["arms"] + 0.1, -14, fi=0.2, fo=0.5, maxlen=1.8)
    place(boom, K["armsW"], -14, fo=0.6, maxlen=1.6)
    place(ding_far, K["me"] + 0.1, -18, fo=0.6, maxlen=1.6)
    place(paper, K["lastW"] - 0.1, -13)
    for k in ("r1", "r2", "r3"): place(tick, K[k] + 0.02, -13)
    place(boom, K["neverW"], -14, fo=0.6, maxlen=1.6)
    place(pen, K["noW"] - 0.6, -14); place(breath, K["last"] + 0.1, -15, fi=0.2, fo=0.5, maxlen=1.8)
    place(load("buzz.mp3", "lowpass=f=1200"), K["station"], -18, maxlen=1.2, fo=0.4)
    for i in range(33): place(click, K["countW"] + i * 0.03, -12)
    place(riser, K["s73W"] - 0.06 - len(riser) / SR, -21, fi=1.2, fo=0.004)
    place(stinger, K["s73W"] - 0.03, -10, fo=0.5, maxlen=1.4); place(boom, K["s73W"], -9, fo=0.6, maxlen=2.0)
    place(paper, K["chart"] + 0.05, -13)
    place(lights_off, K["rule2"] + 0.05, -18, maxlen=0.8, fo=0.3)
    place(heartbeat, K["rule2"] + 0.4, -15, fi=0.1, fo=0.4, maxlen=K["above"] - K["rule2"])
    place(breath, K["aboveW"], -12, fi=0.2, fo=0.5, maxlen=2.2)
    place(click, K["n71"], -6); place(click, K["n72"], -6); place(click, K["n73W"], -4)
    place(riser, K["n73W"] - 0.06 - len(riser) / SR, -19, fi=1.5, fo=0.004)
    place(stinger, K["n73W"] - 0.03, -10, fo=0.5, maxlen=1.4); place(boom, K["n73W"], -9, fo=0.6, maxlen=2.0)
    place(heartbeat, K["rule3"], -13, fi=0.1, fo=0.3, maxlen=K["man"] - K["rule3"])
    place(riser, K["upW"] - 0.06 - len(riser) / SR, -18, fi=1.5, fo=0.004)
    place(stinger, K["upW"] - 0.03, -9, fo=0.5, maxlen=1.4); place(boom, K["upW"], -8, fo=0.8, maxlen=2.2)
    place(load("stretch.mp3"), K["hangsW"], -15, fo=0.5, maxlen=1.6)
    place(breath, K["face"] + 0.1, -13, fi=0.2, fo=0.5, maxlen=2.0)
    place(load("smile_stinger.mp3"), K["smilesW"] - 0.05, -10, fo=0.5, maxlen=1.6)
    place(stinger, K["yourselfW"] - 0.03, -9, fo=0.5, maxlen=1.4); place(boom, K["yourselfW"], -8, fo=0.8, maxlen=2.2)
    place(lights_off, K["dieW"] - 0.05, -10, maxlen=1.2, fo=0.3)
    place(buzz, K["backW"] - 0.2, -14, maxlen=0.6, fo=0.2)
    place(boom, K["goneW"], -14, fo=0.6, maxlen=1.6)
    place(pen, K["lineW"] - 0.2, -13); place(pen, K["b73W"] - 0.1, -13)
    place(stinger, K["nameW"] - 0.03, -10, fo=0.5, maxlen=1.2); place(boom, K["nameW"], -10, fo=0.6, maxlen=1.8)
    place(riser, K["sittingW"] - 0.06 - len(riser) / SR, -18, fi=1.5, fo=0.004)
    place(stinger, K["sittingW"] - 0.03, -8, fo=0.5, maxlen=1.4); place(boom, K["sittingW"], -7, fo=0.8, maxlen=2.4)
    place(boom, K["choice"] - 0.1, -17, fo=0.8, maxlen=2.5)
    place(tick, K["optA"], -12); place(tick, K["optB"], -12)
    place(tick, K["ctaA"], -14); place(tick, K["ctaB"], -14)
    return m1, rb


music, beds = {1: part1, 2: part2}[PART]()
music = music * duck_gain
beds = beds * duck_gain
sfx = sfx * db(-5 * duck).astype(np.float32)[:, None]  # keep SFX >= 8 dB under the voice
mix = vo2 + music + beds + sfx
np.save(str(OUT / "stems.npy"), np.stack([vo2[:, 0], music[:, 0], beds[:, 0], sfx[:, 0]]))
peak = float(np.max(np.abs(mix)))
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix = mix[: int(DUR * SR)]
wwav(OUT / "mix_pre.wav", mix, 2)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(OUT / "mix_pre.wav"), "-af",
                "loudnorm=I=-14:TP=-1.2:LRA=11", "-ar", str(SR), str(OUT / "mix.wav")], check=True)
print(f"part {PART} mix written; pre-limit peak {peak:.3f}")
