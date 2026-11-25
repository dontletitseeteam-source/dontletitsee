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


def part3():
    """NIGHT SHIFT Ep.3 — the last delivery (seven fingers behind the door chain)."""
    lights_off = load("lights_off.mp3"); slam = load("door_slam_wood.mp3"); creak = load("door_creak.mp3")
    breath = load("whisper.mp3", "lowpass=f=900,asetrate=48000*0.8,aresample=48000")
    sent = load("sent.mp3"); button = load("button.mp3")
    rattle = noise_burst(0.35, 1800, 9000, 21, 0.002) * 0.6       # chain links
    bagr = noise_burst(0.5, 700, 5000, 23, 0.02) * 0.5             # paper bag rustle
    pop = noise_burst(0.06, 2000, 8000, 11, 0.001) * 0.7           # count pops
    # the night street: wind + far traffic (synth), hum loop very low
    rng = np.random.default_rng(3); x = rng.standard_normal(N).astype(np.float32)
    X_ = np.fft.rfft(x); f = np.fft.rfftfreq(N, 1 / SR); X_[(f < 60) | (f > 700)] = 0
    x = np.fft.irfft(X_, N).astype(np.float32); x /= (np.abs(x).max() + 1e-9)
    x *= (0.7 + 0.3 * np.sin(np.arange(N) / SR * 2 * np.pi * 0.07)).astype(np.float32)
    rb = np.stack([x, x], 1) * db(-16) + bed("hum.mp3", "lowpass=f=400") * db(-24)
    rb = rb * automation([(0, 0), (K["msgW"], -4), (K["order"], -4), (K["house"], 0), (K["outW"], 0), (K["outW"] + 0.1, -6),
                          (K["choice"], -4), (DUR - 1, -4), (DUR, -40)])
    # score: music_p2 looped with a 2 s crossfade (episode is longer than the 60 s cue)
    mu = load("music_p2.mp3"); xf = int(2 * SR)
    ramp = np.linspace(0, 1, xf, dtype=np.float32)[:, None]
    loop = np.concatenate([mu[:-xf], mu[-xf:] * (1 - ramp) + mu[:xf] * ramp, mu[xf:]])
    loop = np.pad(loop, ((0, max(0, N - len(loop))), (0, 0)))[:N]
    m1 = loop * automation([
        (0, -16), (K["seven"], -14), (K["me"], -19), (K["r1"], -18), (K["last"], -16), (K["order"], -16),
        (K["yestW"], -13), (K["house"], -16), (K["whisper"], -15), (K["hand"], -14), (K["knucklesW"], -12),
        (K["rule3"], -15), (K["n7"], -10), (K["face"], -12), (K["smilingW"], -10), (K["take"], -14), (K["shutsW"], -12),
        (K["outW"], -40), (K["buzz"], -18), (K["phone21W"], -11), (K["tmr"], -14), (K["yoursW"], -10),
        (K["choice"], -15), (DUR - 1.2, -15), (DUR, -40)])
    place(boom, 0.05, -13, fo=0.8, maxlen=2.0)
    place(stinger, 0.0, -15, fo=0.5, maxlen=1.2)
    place(rattle, K["chainW"] - 0.05, -12)
    place(load("stretch.mp3"), K["handW"], -17, fo=0.4, maxlen=1.4)
    place(stinger, K["sevenW"] - 0.03, -11, fo=0.5, maxlen=1.2); place(boom, K["sevenW"], -11, fo=0.6, maxlen=1.6)
    place(breath, K["seven"] + 0.1, -15, fi=0.2, fo=0.5, maxlen=1.6)
    place(motor, K["me"], -24, fi=0.3, fo=0.6, maxlen=2.0)
    place(sent, K["msgW"] - 0.05, -14)
    for k in ("r1", "r2", "r3"): place(tick, K[k] + 0.02, -13)
    place(breath, K["last"] + 0.1, -15, fi=0.2, fo=0.5, maxlen=1.8)
    place(stinger, K["notW"] - 0.03, -12, fo=0.5, maxlen=1.2); place(boom, K["notW"], -13, fo=0.6, maxlen=1.6)
    place(ding, K["order"] + 0.02, -12, fo=0.4, maxlen=1.0)
    place(button, K["acceptW"], -10)
    place(riser, K["yestW"] - 0.06 - len(riser) / SR, -22, fi=1.2, fo=0.004)
    place(boom, K["yestW"], -12, fo=0.6, maxlen=1.8)
    place(load("buzz.mp3", "lowpass=f=1500"), K["litW"] - 0.1, -18, maxlen=0.8, fo=0.3)
    place(creak, K["opensW"] - 0.1, -12, fo=0.4, maxlen=1.6)
    place(rattle, K["chain10W"], -9); place(boom, K["chain10W"], -14, fo=0.6, maxlen=1.6)
    place(bagr, K["stepW"] - 0.25, -12)
    place(breath, K["whisperW"] - 0.1, -10, fi=0.1, fo=0.5, maxlen=2.4)
    place(heartbeat, K["whisper"] + 0.3, -15, fi=0.1, fo=0.4, maxlen=K["hand"] - K["whisper"])
    place(bagr, K["liftW"], -13); place(rattle, K["chain13W"], -11)
    place(load("stretch.mp3"), K["slidesW"] - 0.2, -12, fo=0.5, maxlen=1.8)
    place(stinger, K["greyW"] - 0.03, -12, fo=0.5, maxlen=1.2); place(boom, K["knucklesW"], -12, fo=0.6, maxlen=1.6)
    place(heartbeat, K["rule3"], -13, fi=0.1, fo=0.3, maxlen=K["face"] - K["rule3"])
    for i in range(4): place(pop, K["countW"] + 0.2 + i * 0.15, -12)
    place(pop, K["n5"], -8); place(pop, K["n6"], -6)
    place(riser, K["n7"] - 0.06 - len(riser) / SR, -19, fi=1.5, fo=0.004)
    place(stinger, K["n7"] - 0.03, -9, fo=0.5, maxlen=1.4); place(boom, K["n7"], -8, fo=0.8, maxlen=2.2)
    place(rattle, K["faceW"], -12); place(breath, K["face"] + 0.1, -12, fi=0.2, fo=0.5, maxlen=2.0)
    place(load("smile_stinger.mp3"), K["smilingW"] - 0.05, -9, fo=0.5, maxlen=1.6)
    place(bagr, K["takeW"], -11)
    place(stinger, K["seeW"] - 0.03, -11, fo=0.5, maxlen=1.2)
    place(slam, K["shutsW"] - 0.05, -7, fo=0.4, maxlen=1.6); place(boom, K["shutsW"], -10, fo=0.6, maxlen=1.8)
    place(lights_off, K["outW"] - 0.05, -10, maxlen=1.2, fo=0.3)
    vib = noise_burst(0.5, 60, 220, 17, 0.01) * 0.9
    place(vib, K["buzzW"] - 0.1, -8); place(vib, K["buzzW"] + 0.35, -10)
    place(ding, K["deliveredW"], -14, fo=0.4, maxlen=1.0)
    place(riser, K["phone21W"] - 0.06 - len(riser) / SR, -19, fi=1.5, fo=0.004)
    place(stinger, K["phone21W"] - 0.03, -9, fo=0.5, maxlen=1.4); place(boom, K["phone21W"], -9, fo=0.8, maxlen=2.0)
    place(breath, K["tmr"] + 0.1, -13, fi=0.2, fo=0.5, maxlen=2.0)
    place(stinger, K["yoursW"] - 0.03, -8, fo=0.5, maxlen=1.4); place(boom, K["yoursW"], -7, fo=0.8, maxlen=2.4)
    place(boom, K["choice"] - 0.1, -17, fo=0.8, maxlen=2.5)
    place(tick, K["optA"], -12); place(tick, K["optB"], -12)
    place(tick, K["ctaA"], -14); place(tick, K["ctaB"], -14)
    return m1, rb


def part4():
    """NIGHT SHIFT Ep.4 — the petrol pump (the white car whose passengers all face backwards)."""
    lights_off = load("lights_off.mp3"); slam = load("door_slam.mp3")
    breath = load("whisper.mp3", "lowpass=f=900,asetrate=48000*0.8,aresample=48000")
    button = load("button.mp3")
    clunk = noise_burst(0.12, 300, 3000, 31, 0.001) * 0.9           # nozzle clunk / pump click
    pour = noise_burst(1.0, 400, 3500, 33, 0.05) * 0.35               # fuel pouring (looped under the meter)
    # the highway at night: low wind + canopy hum (synth) + hum loop very low
    rng = np.random.default_rng(4); x = rng.standard_normal(N).astype(np.float32)
    X_ = np.fft.rfft(x); f = np.fft.rfftfreq(N, 1 / SR); X_[(f < 50) | (f > 600)] = 0
    x = np.fft.irfft(X_, N).astype(np.float32); x /= (np.abs(x).max() + 1e-9)
    x *= (0.7 + 0.3 * np.sin(np.arange(N) / SR * 2 * np.pi * 0.05)).astype(np.float32)
    tone = (0.5 * np.sin(np.arange(N) / SR * 2 * np.pi * 100) + 0.25 * np.sin(np.arange(N) / SR * 2 * np.pi * 200)).astype(np.float32)
    rb = np.stack([x, x], 1) * db(-16) + np.stack([tone, tone], 1) * db(-40) + bed("hum.mp3", "lowpass=f=400") * db(-24)
    rb = rb * automation([(0, 0), (K["noteW"], -4), (K["fill"], 0), (K["faces"], -2), (K["full"], -2), (K["choice"], -4), (DUR - 1, -4), (DUR, -40)])
    mu = load("music_p2.mp3"); xf = int(2 * SR)
    ramp = np.linspace(0, 1, xf, dtype=np.float32)[:, None]
    loop = np.concatenate([mu[:-xf], mu[-xf:] * (1 - ramp) + mu[:xf] * ramp, mu[xf:]])
    loop = np.pad(loop, ((0, max(0, N - len(loop))), (0, 0)))[:N]
    m1 = loop * automation([
        (0, -16), (K["back"], -14), (K["me"], -19), (K["r1"], -18), (K["last"], -16), (K["fill"], -16),
        (K["l80"], -13), (K["stare"], -15), (K["rule2"], -15), (K["faceW"], -11), (K["middle"], -13),
        (K["mouths"], -16), (K["rule3"], -15), (K["plateW"], -12), (K["numberW"], -10), (K["full"], -15),
        (K["empty"], -13), (K["goneW"], -11), (K["newline"], -15), (K["backW"], -10),
        (K["choice"], -15), (DUR - 1.2, -15), (DUR, -40)])
    place(boom, 0.05, -13, fo=0.8, maxlen=2.0)
    place(stinger, 0.0, -15, fo=0.5, maxlen=1.2)
    place(motor, 0.0, -18, fi=0.05, fo=0.8, maxlen=K["inW"] + 0.6)
    place(stinger, K["driverW"] - 0.03, -12, fo=0.5, maxlen=1.2)
    place(stinger, K["backwardsW"] - 0.03, -11, fo=0.5, maxlen=1.2); place(boom, K["backwardsW"], -11, fo=0.6, maxlen=1.6)
    place(breath, K["back"] + 0.1, -15, fi=0.2, fo=0.5, maxlen=1.6)
    place(load("shutter.mp3"), K["noteW"] - 0.05, -16)
    for k in ("r1", "r2", "r3"): place(tick, K[k] + 0.02, -13)
    place(breath, K["last"] + 0.1, -15, fi=0.2, fo=0.5, maxlen=1.8)
    place(stinger, K["meW"] - 0.03, -12, fo=0.5, maxlen=1.2); place(boom, K["meW"], -13, fo=0.6, maxlen=1.6)
    place(clunk, K["fillW"], -10)
    tpour = K["fillW"] + 0.1
    while tpour < K["stare"] - 0.3:
        place(pour, tpour, -17, fi=0.1, fo=0.1); tpour += 0.9
    for i in range(int((K["stare"] - K["meterW"]) / 0.12)): place(tick, K["meterW"] + i * 0.12, -24, maxlen=0.05)
    place(riser, K["l80"] - 0.06 - len(riser) / SR, -21, fi=1.2, fo=0.004)
    place(boom, K["l80"], -12, fo=0.6, maxlen=1.8)
    place(breath, K["stare"] + 0.1, -12, fi=0.2, fo=0.5, maxlen=1.8)
    place(clunk, K["jamsW"] - 0.05, -8); place(clunk, K["jamsW"] + 0.15, -10)
    place(heartbeat, K["stepW"], -15, fi=0.1, fo=0.3, maxlen=K["faces"] - K["stepW"] + 0.2)
    place(riser, K["faceW"] - 0.06 - len(riser) / SR, -18, fi=1.5, fo=0.004)
    place(stinger, K["faceW"] - 0.03, -8, fo=0.5, maxlen=1.4); place(boom, K["faceW"], -8, fo=0.8, maxlen=2.2)
    place(load("smile_stinger.mp3"), K["youW"] - 0.05, -11, fo=0.5, maxlen=1.6)
    place(stinger, K["attW"] - 0.03, -12, fo=0.5, maxlen=1.2)
    place(breath, K["mouthsW"] - 0.1, -10, fi=0.1, fo=0.5, maxlen=2.0)
    place(heartbeat, K["rule3"], -13, fi=0.1, fo=0.3, maxlen=K["bike"] - K["rule3"])
    place(stinger, K["plateW"] - 0.03, -10, fo=0.5, maxlen=1.2); place(boom, K["plateW"], -11, fo=0.6, maxlen=1.6)
    place(riser, K["numberW"] - 0.06 - len(riser) / SR, -19, fi=1.5, fo=0.004)
    place(stinger, K["numberW"] - 0.03, -8, fo=0.5, maxlen=1.4); place(boom, K["numberW"], -7, fo=0.8, maxlen=2.4)
    place(clunk, K["clicksW"] - 0.02, -6); place(ding, K["clicksW"] + 0.05, -16, fo=0.4, maxlen=0.8)
    place(motor, K["carGo"] - 0.1, -14, fi=0.1, fo=1.0, maxlen=2.4)
    place(breath, K["empty"] + 0.1, -12, fi=0.2, fo=0.5, maxlen=2.0)
    place(stinger, K["waitingW"] - 0.03, -10, fo=0.5, maxlen=1.2)
    place(riser, K["goneW"] - 0.06 - len(riser) / SR, -20, fi=1.5, fo=0.004)
    place(boom, K["goneW"], -9, fo=0.8, maxlen=2.0)
    place(load("typing.mp3"), K["handW"] - 0.3, -18, fo=0.3, maxlen=1.4)
    place(breath, K["imW"] - 0.1, -11, fi=0.1, fo=0.5, maxlen=1.6)
    place(stinger, K["backW"] - 0.03, -8, fo=0.5, maxlen=1.4); place(boom, K["backW"], -7, fo=0.8, maxlen=2.4)
    place(boom, K["choice"] - 0.1, -17, fo=0.8, maxlen=2.5)
    place(tick, K["optA"], -12); place(tick, K["optB"], -12)
    place(tick, K["ctaA"], -14); place(tick, K["ctaB"], -14)
    return m1, rb


def part5():
    """NIGHT SHIFT Ep.5 — the school night watchman (the girl who swings without moving her legs)."""
    breath = load("whisper.mp3", "lowpass=f=900,asetrate=48000*0.8,aresample=48000")
    t_ = np.arange(int(3.0 * SR)) / SR
    # a brass school bell stroke (inharmonic partials, long decay)
    bl = sum(a * np.sin(2 * np.pi * f * t_) * np.exp(-t_ * d) for f, a, d in [(620, 1.0, 1.6), (1480, 0.5, 2.4), (2210, 0.3, 3.2), (3130, 0.18, 4.5), (311, 0.35, 1.2)])
    bl = (bl / np.abs(bl).max()).astype(np.float32); bell_hit = np.stack([bl, bl], 1)
    # a chain/swing creak: a short pitched squeal sweeping down
    tc = np.arange(int(0.45 * SR)) / SR
    fq = 900 - 500 * tc / 0.45
    cr = np.sin(2 * np.pi * np.cumsum(fq) / SR) * np.sin(np.pi * tc / 0.45) ** 2 * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 38 * tc)))
    cr = (cr / np.abs(cr).max()).astype(np.float32); creak = np.stack([cr, cr], 1)
    # bed: night wind + crickets (synth) + hum very low
    rng = np.random.default_rng(5); x = rng.standard_normal(N).astype(np.float32)
    X_ = np.fft.rfft(x); f = np.fft.rfftfreq(N, 1 / SR); X_[(f < 60) | (f > 500)] = 0
    x = np.fft.irfft(X_, N).astype(np.float32); x /= (np.abs(x).max() + 1e-9)
    tt = np.arange(N) / SR
    cri = (np.sin(2 * np.pi * 4300 * tt) * (np.sin(2 * np.pi * 28 * tt) > 0.3) * (np.sin(2 * np.pi * 0.9 * tt) > 0)).astype(np.float32)
    rb = np.stack([x, x], 1) * db(-16) + np.stack([cri, cri * 0.8], 1) * db(-42) + bed("hum.mp3", "lowpass=f=400") * db(-26)
    rb = rb * automation([(0, 0), (K["threeW"], -4), (K["rule1"], 0), (K["top"], -3), (K["stopsW"], 0), (K["reg"], -4), (K["andW"], 0), (K["choice"], -4), (DUR - 1, -4), (DUR, -40)])
    mu = load("music_p3.mp3"); xf = int(2 * SR)
    ramp = np.linspace(0, 1, xf, dtype=np.float32)[:, None]
    loop = np.concatenate([mu[:-xf], mu[-xf:] * (1 - ramp) + mu[:xf] * ramp, mu[xf:]])
    while len(loop) < N: loop = np.concatenate([loop, loop])
    loop = loop[:N]
    m1 = loop * automation([
        (0, -16), (K["legs"], -14), (K["me"], -19), (K["r1"], -18), (K["last"], -16), (K["rule1"], -17),
        (K["thirteenW"], -13), (K["creak"], -16), (K["rule2"], -16), (K["higher"], -14), (K["faceW"], -10),
        (K["voice"], -15), (K["rule3"], -14), (K["presentW"], -10), (K["stops"], -16), (K["reg"], -16),
        (K["nineteenW"], -12), (K["yourW"], -11), (K["movingW"], -10), (K["choice"], -15), (DUR - 1.2, -15), (DUR, -40)])
    place(boom, 0.05, -13, fo=0.8, maxlen=2.0)
    place(stinger, 0.0, -15, fo=0.5, maxlen=1.2)
    # her swing creaks at each end of its arc (period 2*pi/2.3)
    tt0 = np.pi / 2 / 2.3
    for tc0 in np.arange(tt0, K["me"], np.pi / 2.3): place(creak, tc0, -22, fo=0.08)
    place(stinger, K["neverW"] - 0.03, -11, fo=0.5, maxlen=1.2); place(boom, K["neverW"], -12, fo=0.6, maxlen=1.6)
    place(breath, K["legs"] + 0.1, -15, fi=0.2, fo=0.5, maxlen=1.4)
    place(noise_burst(0.35, 800, 6000, 51, 0.02) * 0.6, K["threeW"] - 0.05, -14)
    for k in ("r1", "r2", "r3"): place(tick, K[k] + 0.02, -13)
    place(breath, K["last"] + 0.1, -15, fi=0.2, fo=0.5, maxlen=1.8)
    place(stinger, K["presW"] - 0.03, -12, fo=0.5, maxlen=1.2); place(boom, K["presW"], -13, fo=0.6, maxlen=1.6)
    # the 13 bell strokes (rings -> Thirteen); the first and the last louder
    for i in range(13):
        tb = K["ringsW"] + (K["thirteenW"] + 0.15 - K["ringsW"]) * i / 12
        place(bell_hit, tb, -15 if i in (0, 12) else -20, fo=0.4, maxlen=1.6 if i < 12 else 3.0)
    place(boom, K["thirteenW"] + 0.15, -12, fo=0.8, maxlen=2.0)
    for tc0 in np.arange(K["swingW"], K["stopsW"], np.pi / 2.3):
        g = -14 if K["higher"] <= tc0 < K["top"] else -18
        if K["top"] <= tc0 < K["stops"]: continue
        place(creak, tc0, g, fo=0.08)
    place(breath, K["creak"] + 0.1, -12, fi=0.2, fo=0.5, maxlen=1.8)
    place(heartbeat, K["rule2"], -15, fi=0.1, fo=0.3, maxlen=K["top"] - K["rule2"])
    place(riser, K["faceW"] - 0.06 - len(riser) / SR, -17, fi=1.5, fo=0.004)
    place(creak, K["topW"] - 0.1, -10, fo=0.1)
    place(stinger, K["faceW"] - 0.03, -7, fo=0.5, maxlen=1.4); place(boom, K["faceW"], -7, fo=0.8, maxlen=2.4)
    place(load("smile_stinger.mp3"), K["winW"] - 0.05, -11, fo=0.5, maxlen=1.6)
    place(breath, K["voiceW"] - 0.1, -10, fi=0.1, fo=0.5, maxlen=2.4)
    place(noise_burst(0.3, 800, 6000, 52, 0.02) * 0.6, K["every"], -15)
    place(heartbeat, K["rule3"], -13, fi=0.1, fo=0.3, maxlen=K["say"] - K["rule3"] + 0.6)
    place(stinger, K["nameW"] - 0.03, -9, fo=0.5, maxlen=1.2); place(boom, K["nameW"], -10, fo=0.6, maxlen=1.6)
    place(riser, K["presentW"] - 0.06 - len(riser) / SR, -18, fi=1.5, fo=0.004)
    place(stinger, K["presentW"] - 0.03, -7, fo=0.5, maxlen=1.4); place(boom, K["presentW"], -7, fo=0.8, maxlen=2.4)
    place(bell_hit, K["stopsW"], -14, fo=0.6, maxlen=2.5)
    place(noise_burst(0.35, 800, 6000, 53, 0.02) * 0.6, K["reg"], -14)
    place(stinger, K["nineteenW"] - 0.03, -10, fo=0.5, maxlen=1.2); place(boom, K["nineteenW"], -11, fo=0.6, maxlen=1.6)
    place(breath, K["below"] + 0.05, -11, fi=0.1, fo=0.5, maxlen=1.4)
    place(stinger, K["yourW"] - 0.03, -8, fo=0.5, maxlen=1.4); place(boom, K["yourW"], -8, fo=0.8, maxlen=2.0)
    place(noise_burst(0.15, 1500, 7000, 54, 0.005) * 0.7, K["tick2W"], -12)
    for tc0 in np.arange(K["andW"] + 0.5, K["choice"] + 1.5, np.pi / 2.3): place(creak, tc0, -13, fo=0.08)
    place(riser, K["movingW"] - 0.06 - len(riser) / SR, -19, fi=1.5, fo=0.004)
    place(stinger, K["movingW"] - 0.03, -8, fo=0.5, maxlen=1.4); place(boom, K["movingW"], -7, fo=0.8, maxlen=2.4)
    place(boom, K["choice"] - 0.1, -17, fo=0.8, maxlen=2.5)
    place(tick, K["optA"], -12); place(tick, K["optB"], -12)
    place(tick, K["ctaA"], -14); place(tick, K["ctaB"], -14)
    return m1, rb


def part6():
    """NIGHT SHIFT Ep.6 — the cinema projectionist (the man whose face is a screen). v2: real silences before the reveals."""
    T6 = {L["id"]: L for L in T["lines"]}
    gaps = [(T6[i - 1]["end"], T6[i]["start"]) for i in (8, 11, 12, 15, 16, 19)]   # the deliberate pauses
    breath = load("whisper.mp3", "lowpass=f=900,asetrate=48000*0.8,aresample=48000")
    tt = np.arange(N) / SR
    # projector clatter: 24 fps shutter clicks (filtered noise ticks) + a low motor, from PLAY on
    rng = np.random.default_rng(6); clk = np.zeros(N, np.float32)
    ck = (rng.standard_normal(int(0.012 * SR)) * np.exp(-np.linspace(0, 6, int(0.012 * SR)))).astype(np.float32)
    for tc in np.arange(K["playW"] + 0.2, DUR, 1 / 24):
        i = int(tc * SR); clk[i:i + len(ck)] += ck * (0.7 + 0.3 * rng.random())
    C_ = np.fft.rfft(clk); f = np.fft.rfftfreq(N, 1 / SR); C_[(f < 900) | (f > 5000)] = 0
    clk = np.fft.irfft(C_, N).astype(np.float32); clk /= (np.abs(clk).max() + 1e-9)
    proj = np.stack([clk, clk * 0.9], 1) * db(-24) + bed("motor.mp3", "lowpass=f=500") * db(-13) * (tt >= K["playW"] + 0.1)[:, None].astype(np.float32)
    # room tone: hall hum
    rb = bed("hum.mp3", "lowpass=f=300") * db(-6) + proj
    pts = [(0, 0), (K["me"], 0), (K["playW"], 0), (K["film"], -2), (K["hand"], 0), (K["poster"], -3), (K["choice"], -4), (DUR - 1, -4), (DUR, -40)]
    rb = rb * automation(pts)
    mu = load("music.mp3"); xf = int(2 * SR)
    ramp = np.linspace(0, 1, xf, dtype=np.float32)[:, None]
    loop = np.concatenate([mu[:-xf], mu[-xf:] * (1 - ramp) + mu[:xf] * ramp, mu[xf:]])
    while len(loop) < N: loop = np.concatenate([loop, loop])
    loop = loop[:N]
    mp = [(0, -16), (K["face"], -13), (K["me"], -19), (K["rules"], -18), (K["play"], -17), (K["film"], -16), (K["jacket"], -15),
          (K["isyou"], -12), (K["shape"], -14), (K["empty"], -13), (K["rule1"], -15), (K["hand"], -14), (K["rule2"], -13),
          (K["scale"], -11), (K["poster"], -10), (K["twist"], -14), (K["you2W"], -10), (K["choice"], -15), (DUR - 1.2, -15), (DUR, -40)]
    # carve the silences: music + beds drop out across each pause, back in with the sting
    for a, b in gaps:
        mp += [(a - 0.05, None), (a + 0.12, -45), (b - 0.02, -45)]
    mp = sorted(mp, key=lambda p: p[0])
    # resolve None = keep previous level
    out = []; last = -16
    for tpt, g in mp:
        if g is None: g = last
        out.append((tpt, g)); last = g if g > -40 else last
    m1 = loop * automation(out)
    sil = np.ones((N, 1), np.float32)
    for a, b in gaps:
        sil *= 1 - (automation([(0, -100), (a + 0.02, -100), (a + 0.15, 0), (b - 0.05, 0), (b + 0.02, -100), (DUR + 1, -100)]) * 0.9)
    rb = rb * sil
    place(boom, 0.05, -13, fo=0.8, maxlen=2.0); place(stinger, 0.0, -15, fo=0.5, maxlen=1.2)
    place(load("tv.mp3", "highpass=f=400"), 0.0, -26, fo=0.5, maxlen=K["face"])
    place(stinger, K["screenW"] - 0.03, -10, fo=0.5, maxlen=1.2); place(boom, K["screenW"], -11, fo=0.6, maxlen=1.6)
    place(load("tv.mp3", "highpass=f=400"), K["face"], -20, fi=0.05, fo=0.3, maxlen=1.6)
    place(load("stairs.mp3"), K["me"] + 0.05, -20, fo=0.3, maxlen=1.6)
    place(noise_burst(0.35, 800, 6000, 61, 0.02) * 0.6, K["rules"], -14)
    for k in ("r1", "r2"): place(tick, K[k] + 0.02, -13)
    place(load("button.mp3"), K["playW"] - 0.02, -10, maxlen=0.6)
    place(motor, K["playW"] + 0.05, -16, fi=0.2, fo=0.5, maxlen=1.6)
    place(riser, K["film"] - 0.06 - len(riser) / SR, -24, fi=1.0, fo=0.004)
    place(boom, K["film"], -15, fo=0.8, maxlen=2.0)
    place(stinger, K["jacketW"] - 0.03, -12, fo=0.5, maxlen=1.2)
    place(breath, K["waveW"], -16, fi=0.1, fo=0.4, maxlen=1.2)
    place(stinger, K["wavesW"] - 0.03, -11, fo=0.4, maxlen=0.9); place(boom, K["wavesW"], -12, fo=0.5, maxlen=1.0)
    place(stinger, K["isyou"] + 0.02, -9, fo=0.5, maxlen=1.4); place(boom, K["youW"], -10, fo=0.8, maxlen=2.0)
    place(heartbeat, K["isyou"], -16, fi=0.1, fo=0.3, maxlen=K["shape"] - K["isyou"] - 0.6)
    place(stinger, K["shape"], -11, fo=0.5, maxlen=1.2)
    place(riser, K["behind2W"] - 0.06 - len(riser) / SR, -18, fi=1.2, fo=0.004)
    place(stinger, K["behind2W"] - 0.03, -8, fo=0.5, maxlen=1.4); place(boom, K["behind2W"], -9, fo=0.8, maxlen=2.0)
    place(load("lights_off.mp3"), K["emptyW"] - 0.05, -14, maxlen=1.0)
    place(heartbeat, K["rule1"], -14, fi=0.1, fo=0.3, maxlen=K["hand"] - K["rule1"] - 0.6)
    place(breath, K["hand"] + 0.05, -10, fi=0.1, fo=0.5, maxlen=1.6)
    place(stinger, K["shoulderW"] - 0.03, -8, fo=0.4, maxlen=0.9); place(boom, K["shoulderW"], -9, fo=0.5, maxlen=1.0)
    place(stinger, K["rule2"] + 0.02, -12, fo=0.5, maxlen=1.0)
    place(riser, K["look2W"] - 0.06 - len(riser) / SR, -18, fi=1.2, fo=0.004)
    place(stinger, K["look2W"] - 0.03, -7, fo=0.5, maxlen=1.4); place(boom, K["look2W"], -7, fo=0.8, maxlen=2.4)
    place(load("stretch.mp3"), K["bendsW"], -14, fo=0.4, maxlen=1.8)
    place(boom, K["twiceW"], -11, fo=0.6, maxlen=1.6)
    place(load("tv.mp3", "highpass=f=400"), K["poster"], -18, fi=0.05, fo=0.3, maxlen=1.2)
    place(load("smile_stinger.mp3"), K["youreW"] - 0.05, -9, fo=0.5, maxlen=1.3)
    place(stinger, K["youreW"] - 0.03, -7, fo=0.5, maxlen=1.2); place(boom, K["youreW"], -7, fo=0.6, maxlen=1.5)
    place(stinger, K["twist"] + 0.02, -12, fo=0.5, maxlen=1.2)
    place(breath, K["he2W"] - 0.1, -11, fi=0.1, fo=0.5, maxlen=1.6)
    place(riser, K["you2W"] - 0.06 - len(riser) / SR, -19, fi=1.5, fo=0.004)
    place(stinger, K["you2W"] - 0.03, -7, fo=0.5, maxlen=1.4); place(boom, K["you2W"], -7, fo=0.8, maxlen=2.4)
    place(boom, K["choice"] - 0.1, -17, fo=0.8, maxlen=2.5)
    place(tick, K["optA"], -12); place(tick, K["optB"], -12)
    place(tick, K["ctaA"], -14); place(tick, K["ctaB"], -14)
    return m1, rb


def part7():
    """NIGHT SHIFT Ep.7 — the highway toll booth (the Backwards Man). v2: real silences before the reveals."""
    T7 = {L["id"]: L for L in T["lines"]}
    gaps = [(T7[i - 1]["end"], T7[i]["start"]) for i in (10, 13, 16, 17, 18)]   # the deliberate pauses
    breath = load("whisper.mp3", "lowpass=f=900,asetrate=48000*0.8,aresample=48000")
    tt = np.arange(N) / SR
    # the truck's diesel idle (low motor, slow throb) + the plaza hum + distant highway wind
    throb = (0.75 + 0.25 * np.sin(2 * np.pi * 7.5 * tt)).astype(np.float32)[:, None]
    idle = bed("motor.mp3", "lowpass=f=220,asetrate=48000*0.7,aresample=48000") * db(-9) * throb
    rng = np.random.default_rng(77); wn = rng.standard_normal(N).astype(np.float32)
    WX = np.fft.rfft(wn); fw = np.fft.rfftfreq(N, 1 / SR); WX[(fw < 80) | (fw > 600)] = 0
    wn = np.fft.irfft(WX, N).astype(np.float32); wn /= (np.abs(wn).max() + 1e-9)
    wind = np.stack([wn, wn], 1) * db(-30)
    rb = bed("hum.mp3", "lowpass=f=300") * db(-10) + idle + wind
    pts = [(0, 0), (K["still"], 0), (K["moveW"], 2), (K["door"], 0), (K["poster"], -4), (K["mirror"], -6), (K["choice"], -6), (DUR - 1, -6), (DUR, -40)]
    rb = rb * automation(pts)
    mu = load("music.mp3"); xf = int(2 * SR)
    ramp = np.linspace(0, 1, xf, dtype=np.float32)[:, None]
    loop = np.concatenate([mu[:-xf], mu[-xf:] * (1 - ramp) + mu[:xf] * ramp, mu[xf:]])
    while len(loop) < N: loop = np.concatenate([loop, loop])
    loop = loop[:N]
    mp = [(0, -16), (K["drv"], -13), (K["me"], -19), (K["rules"], -18), (K["hands"], -16), (K["pay"], -15), (K["rule1"], -17),
          (K["still"], -15), (K["walk"], -13), (K["poster"], -10), (K["scale"], -12), (K["tap"], -13), (K["rule2"], -12),
          (K["mirror"], -10), (K["vest"], -13), (K["turn"], -10), (K["choice"], -15), (DUR - 1.2, -15), (DUR, -40)]
    for a, b in gaps:
        mp += [(a - 0.05, None), (a + 0.12, -45), (b - 0.02, -45)]
    mp = sorted(mp, key=lambda p: p[0])
    out = []; last = -16
    for tpt, g in mp:
        if g is None: g = last
        out.append((tpt, g)); last = g if g > -40 else last
    m1 = loop * automation(out)
    sil = np.ones((N, 1), np.float32)
    for a, b in gaps:
        sil *= 1 - (automation([(0, -100), (a + 0.02, -100), (a + 0.15, 0), (b - 0.05, 0), (b + 0.02, -100), (DUR + 1, -100)]) * 0.8)
    rb = rb * sil
    place(boom, 0.05, -13, fo=0.8, maxlen=2.0); place(stinger, 0.0, -15, fo=0.5, maxlen=1.2)
    place(load("buzz.mp3", "lowpass=f=1200"), K["truckW"], -24, fo=0.4, maxlen=0.8)   # air brakes hiss stand-in
    place(noise_burst(0.6, 1500, 7000, 71, 0.01) * 0.7, K["truckW"] + 0.1, -16)
    place(stinger, K["backW"] - 0.03, -9, fo=0.5, maxlen=1.2); place(boom, K["backW"], -10, fo=0.6, maxlen=1.6)
    place(door_open, K["me"] + 0.05, -20, fo=0.3, maxlen=1.0)
    place(noise_burst(0.35, 800, 6000, 61, 0.02) * 0.6, K["rules"], -14)
    for k in ("r1", "r2"): place(tick, K[k] + 0.02, -13)
    place(stinger, K["faceW"] - 0.03, -13, fo=0.4, maxlen=0.9)
    place(breath, K["roadW"] - 0.2, -16, fi=0.1, fo=0.4, maxlen=1.2)
    place(load("door_creak.mp3"), K["paysW"] - 0.1, -16, fo=0.3, maxlen=1.0)   # the elbow bending the wrong way
    place(load("sent.mp3", "highpass=f=1500"), K["aroundW"] - 0.2, -18, maxlen=0.6)   # coins
    place(boom, K["aroundW"], -13, fo=0.5, maxlen=1.2)
    place(load("button.mp3"), K["lift2W"] - 0.02, -10, maxlen=0.6)
    place(motor, K["barrierW"] - 0.1, -15, fi=0.05, fo=0.3, maxlen=1.1)
    place(ding, K["barrierW"] + 0.3, -22, maxlen=0.8)
    place(heartbeat, K["still"], -15, fi=0.1, fo=0.3, maxlen=K["door"] - K["still"] - 0.1)
    place(door_open, K["opensW"] - 0.1, -11, fo=0.3, maxlen=1.4)
    place(load("stairs.mp3"), K["climbW"], -15, fo=0.3, maxlen=1.0)
    for i in range(5): place(load("stairs.mp3", "lowpass=f=900"), K["walksW"] + i * 0.36, -20, maxlen=0.25)
    place(riser, K["bwW"] - 0.06 - len(riser) / SR, -18, fi=1.0, fo=0.004)
    place(stinger, K["bwW"] - 0.03, -8, fo=0.5, maxlen=1.4); place(boom, K["bwW"], -9, fo=0.8, maxlen=2.0)
    place(breath, K["poster"] + 0.05, -11, fi=0.1, fo=0.5, maxlen=1.6)
    place(load("smile_stinger.mp3"), K["seeW"] - 0.05, -10, fo=0.5, maxlen=1.3)
    place(boom, K["youW"], -9, fo=0.8, maxlen=2.0)
    place(load("stretch.mp3"), K["tallerW"], -14, fo=0.4, maxlen=1.6)
    place(boom, K["booth2W"], -12, fo=0.6, maxlen=1.4)
    for i in range(3): place(load("door_slam_wood.mp3", "highpass=f=700"), K["tapsW"] + i * 0.34, -14, maxlen=0.22)
    place(stinger, K["mirror2W"] - 0.03, -12, fo=0.4, maxlen=0.9)
    place(stinger, K["rule2"] + 0.02, -12, fo=0.5, maxlen=1.0)
    place(riser, K["look2W"] - 0.06 - len(riser) / SR, -18, fi=1.2, fo=0.004)
    place(stinger, K["look2W"] - 0.03, -8, fo=0.5, maxlen=1.2); place(boom, K["look2W"], -8, fo=0.8, maxlen=2.0)
    place(load("stretch.mp3", "asetrate=48000*0.8,aresample=48000"), K["turningW"] - 0.2, -11, fo=0.5, maxlen=1.8)  # the neck twisting
    place(stinger, K["aroundW2"] - 0.03, -7, fo=0.5, maxlen=1.4); place(boom, K["aroundW2"], -7, fo=0.8, maxlen=2.4)
    place(stinger, K["vest"] + 0.02, -13, fo=0.5, maxlen=1.0)
    place(boom, K["manW"], -10, fo=0.6, maxlen=1.6)
    place(riser, K["turnW"] - 0.06 - len(riser) / SR, -19, fi=1.2, fo=0.004)
    place(load("lights_off.mp3"), K["turn"] + 0.1, -15, maxlen=1.0)
    place(stinger, K["turnW"] - 0.03, -7, fo=0.5, maxlen=1.4); place(boom, K["turnW"], -7, fo=0.8, maxlen=2.4)
    place(boom, K["choice"] - 0.1, -17, fo=0.8, maxlen=2.5)
    place(tick, K["optA"], -12); place(tick, K["optB"], -12)
    place(tick, K["ctaA"], -14); place(tick, K["ctaB"], -14)
    return m1, rb


def part8():
    """NIGHT SHIFT Ep.8 — the wedding hall (the bride with the sewn veil). v4: synth dhol + harmonium drone for the band
    that plays by itself, clapping in unison, pen scratch, stitches snapping; carved silences before the reveals."""
    T8 = {L["id"]: L for L in T["lines"]}
    gaps = [(T8[i - 1]["end"], T8[i]["start"]) for i in (7, 10, 17, 19, 20)]
    tt = np.arange(N) / SR
    rng = np.random.default_rng(88)
    # room: hall hum + a faint dead-wedding murmur (crowd, far, lowpassed) while the lights are on
    lit = automation([(0, 0), (K["lightsW"] - 0.05, 0), (K["lightsW"] + 0.05, -60), (K["on"] - 0.02, -60), (K["on"] + 0.05, 0), (DUR, 0)])
    hum = bed("hum.mp3", "lowpass=f=320") * db(-11)
    murmur = bed("crowd.mp3", "lowpass=f=700,aecho=0.8:0.7:120|260:0.4|0.3") * db(-27)
    mur_gate = automation([(0, 0), (K["sw"], -6), (K["lightsW"], -60), (K["on"], -60), (K["on"] + 0.02, -60), (DUR, -60)])
    rb = hum * lit + murmur * mur_gate
    # harmonium drone (detuned saw-ish chord) + dhol (pitch-dropping thumps): the band that plays itself
    def saw(f): return 2 * ((tt * f) % 1) - 1
    drone = (saw(146.8) + saw(147.6) + 0.7 * saw(220.0) + 0.6 * saw(174.6)).astype(np.float32)
    D_ = np.fft.rfft(drone); fq = np.fft.rfftfreq(N, 1 / SR); D_[fq > 1400] *= 0.05; D_[fq > 3000] = 0
    drone = np.fft.irfft(D_, N).astype(np.float32); drone /= np.abs(drone).max() + 1e-9
    wob = (0.8 + 0.2 * np.sin(2 * np.pi * 0.83 * tt)).astype(np.float32)
    band = np.stack([drone * wob, drone * wob], 1)
    band_gate = automation([(0, -80), (K["playW"] - 0.45, -80), (K["playW"] - 0.3, -14), (K["on"] - 0.05, -12), (K["on"], -26),
                            (K["everyW"], -30), (K["guest"], -34), (K["stand"], -30), (K["walk"], -24), (K["pull"], -80), (K["book"], -30),
                            (K["sign"], -26), (K["notW"], -80), (K["married"], -16), (K["open"] - 0.1, -80), (DUR, -80)])
    m1 = band * band_gate
    def thump(f0=95, dur=0.42):
        n = int(dur * SR); x = np.arange(n) / SR; f = f0 * (1 + 0.6 * np.exp(-x * 30))
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 9); y[:200] += rng.standard_normal(200) * 0.3
        return np.stack([y, y], 1).astype(np.float32)
    dh, slap = thump(), thump(180, 0.18)
    t0 = K["playW"] - 0.35
    while t0 < K["on"] - 0.1:
        place(dh, t0, -8); place(slap, t0 + 0.21, -14); place(slap, t0 + 0.31, -17); t0 += 1 / 1.2
    # wedding dhol returns, slow, under the married shot
    t0 = K["married"]
    while t0 < K["open"] - 0.3:
        place(dh, t0, -12); t0 += 0.75
    # music: the shared horror score, low, carved out in the pauses
    mu = load("music.mp3"); xf = int(2 * SR)
    ramp = np.linspace(0, 1, xf, dtype=np.float32)[:, None]
    loop = np.concatenate([mu[:-xf], mu[-xf:] * (1 - ramp) + mu[:xf] * ramp, mu[xf:]])
    while len(loop) < N: loop = np.concatenate([loop, loop])
    loop = loop[:N]
    mp = [(0, -16), (K["veil"], -15), (K["me"], -20), (K["note"], -19), (K["sw"], -20), (K["bandW"], -40), (K["on"], -16),
          (K["guest"], -14), (K["stand"], -12), (K["scale"], -11), (K["walk"], -11), (K["pull"], -12), (K["book"], -13),
          (K["clap"], -14), (K["sign"], -12), (K["notW"], -14), (K["married"], -12), (K["open"], -9), (K["ask"], -12), (DUR - 1, -14), (DUR, -40)]
    for a, b in gaps:
        mp += [(a - 0.05, None), (a + 0.12, -45), (b - 0.02, -45)]
    mp = sorted(mp, key=lambda p: p[0]); out = []; last = -16
    for tpt, g in mp:
        if g is None: g = last
        out.append((tpt, g)); last = g if g > -40 else last
    m1 = m1 + loop * automation(out)
    sil = np.ones((N, 1), np.float32)
    for a, b in gaps:
        sil *= 1 - (automation([(0, -100), (a + 0.02, -100), (a + 0.15, 0), (b - 0.05, 0), (b + 0.02, -100), (DUR + 1, -100)]) * 0.8)
    rb = rb * sil
    # ---- cues
    place(boom, 0.05, -13, fo=0.8, maxlen=2.0); place(stinger, 0.0, -15, fo=0.5, maxlen=1.2)
    place(load("stretch.mp3"), 0.25, -16, fo=0.4, maxlen=1.0)                       # her head jerking over
    place(stinger, K["brideW"] - 0.03, -13, fo=0.4, maxlen=1.0)
    place(whisper, K["veil"], -18, fi=0.2, fo=0.5, maxlen=1.8); place(boom, K["sewnW"], -11, fo=0.6, maxlen=1.6)
    place(door_open, K["me"] + 0.05, -19, fo=0.3, maxlen=1.0)
    for i in range(4): place(load("stairs.mp3", "lowpass=f=900"), K["me"] + 0.2 + i * 0.38, -22, maxlen=0.25)
    place(noise_burst(0.35, 800, 6000, 81, 0.02) * 0.6, K["note"], -15)               # paper
    place(tick, K["oneW"], -14); place(tick, K["twoW"], -14)
    place(stinger, K["r1"] + 0.05, -16, fo=0.4, maxlen=0.8)
    for i in range(6): place(load("button.mp3"), K["offW"] + (K["lightsW"] - K["offW"]) * i / 6, -15, maxlen=0.3)
    place(load("lights_off.mp3"), K["lightsW"], -10, maxlen=1.2)
    place(boom, K["bandW"] + 0.2, -14, fo=0.6, maxlen=1.4)
    place(load("lights_off.mp3", "areverse"), K["on"] - 0.25, -16, maxlen=0.3)
    place(stinger, K["on"] - 0.02, -8, fo=0.5, maxlen=1.2); place(boom, K["on"], -9, fo=0.8, maxlen=2.0)
    place(riser, K["lookW"] - 0.06 - len(riser) / SR, -19, fi=1.0, fo=0.004)
    for i in range(8): place(load("door_creak.mp3", "highpass=f=900"), K["guest"] + 0.35 + i * 0.1, -26, maxlen=0.25)  # chairs creak as they turn
    place(stinger, K["face"], -8, fo=0.5, maxlen=1.3); place(boom, K["face"] + 0.03, -9, fo=0.8, maxlen=2.0)
    place(heartbeat, K["face"] + 0.3, -16, fi=0.1, fo=0.3, maxlen=K["stand"] - K["face"] - 0.4)
    place(load("stretch.mp3", "asetrate=48000*0.75,aresample=48000"), K["standsW"] - 0.1, -10, fo=0.5, maxlen=2.0)
    place(boom, K["standsW"] + 0.9, -11, fo=0.6, maxlen=1.6)
    place(noise_burst(0.8, 300, 3000, 82, 0.05) * 0.5, K["mariW"] - 0.2, -18)          # marigold strings rustle
    place(load("smile_stinger.mp3"), K["mariW"], -12, fo=0.5, maxlen=1.3)
    for i in range(4): place(load("stairs.mp3", "lowpass=f=700"), K["walksW"] + i * 0.42, -18, maxlen=0.3)
    for i in range(10): place(noise_burst(0.05, 2000, 6000, 90 + i, 0.002) * 0.5, K["walksW"] + i * 0.15, -24)  # anklets
    place(whisper, K["puts"], -12, fi=0.1, fo=0.5, maxlen=1.6)
    place(stinger, K["veilW"] - 0.03, -10, fo=0.5, maxlen=1.0)
    place(noise_burst(0.3, 400, 5000, 83, 0.005) * 0.9, K["awayW"] - 0.15, -10); place(boom, K["awayW"] - 0.1, -10, fo=0.6, maxlen=1.4)
    place(ding_far, K["rule1"] + 0.3, -24, maxlen=1.0)
    place(noise_burst(0.45, 600, 5000, 84, 0.03) * 0.6, K["book"] + 0.2, -16)          # pages
    place(stinger, K["bookW"] - 0.03, -14, fo=0.4, maxlen=0.9)
    # clapping in unison, slow, matching the picture (2.2 claps / s)
    t0 = K["clapW"] - 0.5 + 0.227
    while t0 < K["notW"] - 0.2:
        for v in range(6): place(noise_burst(0.09, 900, 4500, 100 + v + int(t0 * 10), 0.002) * 0.5, t0 + v * 0.008, -13 - v)
        t0 += 1 / 2.2
    for i in range(12): place(noise_burst(0.12, 2500, 9000, 120 + i, 0.01) * 0.5, K["signW"] - 0.05 + i * 0.11, -22)  # pen scratch
    place(riser, K["regW"] - 0.06 - len(riser) / SR, -18, fi=1.2, fo=0.004)
    place(stinger, K["regW"] - 0.03, -7, fo=0.5, maxlen=1.4); place(boom, K["regW"], -7, fo=0.8, maxlen=2.4)
    place(load("smile_stinger.mp3"), K["marriedW"] - 0.05, -10, fo=0.5, maxlen=1.3); place(boom, K["marriedW"], -10, fo=0.6, maxlen=1.6)
    for i in range(11): place(load("tick.mp3", "highpass=f=2500"), K["openW"] + 0.1 + (1 - (10 - i) / 11) * 2.0 * 0.8, -12, maxlen=0.2)   # stitches snapping
    place(load("stretch.mp3", "asetrate=48000*0.9,aresample=48000"), K["openW"] + 0.2, -10, fo=0.6, maxlen=2.2)
    place(stinger, K["openW"] + 0.9, -7, fo=0.5, maxlen=1.4); place(boom, K["openW"] + 0.9, -7, fo=0.8, maxlen=2.4)
    place(whisper, K["ask"] + 0.5, -14, fi=0.2, fo=0.5, maxlen=2.0)
    place(boom, K["loop"] - 0.05, -14, fo=0.6, maxlen=1.0)
    return m1, rb


def part9():
    """NIGHT SHIFT S2 Ep.1 — the railway level crossing (the man who crawls the tracks). Synth crossing bell (electric, 18 Hz
    hammer) under red lamps, floodlight hum + night wind, knuckles and knees on the sleepers, barrier motor, winch creak,
    a child's whisper from the wrong mouth; carved silences before the reveals."""
    T9 = {L["id"]: L for L in T["lines"]}
    gaps = [(T9[i - 1]["end"], T9[i]["start"]) for i in (7, 10, 15, 17, 19, 20)]
    tt = np.arange(N) / SR
    rng = np.random.default_rng(99)
    # room: floodlight transformer hum + night wind (filtered noise, slow swell)
    hum = bed("hum.mp3", "lowpass=f=260") * db(-14)
    wn = rng.standard_normal(N).astype(np.float32)
    Wf = np.fft.rfft(wn); fq = np.fft.rfftfreq(N, 1 / SR); Wf[(fq < 120) | (fq > 900)] = 0
    wn = np.fft.irfft(Wf, N).astype(np.float32); wn /= np.abs(wn).max() + 1e-9
    wn *= (0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * tt)).astype(np.float32)
    rb = hum + np.stack([wn, np.roll(wn, 900)], 1) * db(-24)
    # electric crossing bell: inharmonic partials struck at 18 Hz while it rings
    def bell(dur):
        n = int(dur * SR); x = np.arange(n) / SR; y = np.zeros(n, np.float32)
        for f, a in ((1180, 1.0), (2710, 0.6), (3990, 0.35), (5230, 0.2)):
            y += a * np.sin(2 * np.pi * f * x)
        env = np.exp(-((x * 18) % 1) * 7)
        y = y * env * np.minimum(1, x / 0.01); y /= np.abs(y).max() + 1e-9
        return np.stack([y, y], 1).astype(np.float32)
    ring_on = K["ringW"] - 0.45
    place(bell(K["lower"] - ring_on + 0.4), ring_on, -17, fo=0.3)
    place(bell(4.0) * 0.6, K["lower"] + 0.4, -27, fo=1.5)                      # keeps ringing, far, while the lamps flash
    place(bell(0.25), K["rings1W"], -24, fo=0.1)                                # the rule-1 shot: one tiny shiver
    # music bed (shared score), low, carved out in the pauses
    mu = load("music.mp3"); xf = int(2 * SR)
    ramp = np.linspace(0, 1, xf, dtype=np.float32)[:, None]
    loop = np.concatenate([mu[:-xf], mu[-xf:] * (1 - ramp) + mu[:xf] * ramp, mu[xf:]])
    while len(loop) < N: loop = np.concatenate([loop, loop])
    loop = loop[:N]
    mp = [(0, -15), (K["back"], -15), (K["me"], -21), (K["note"], -20), (K["r2"], -19), (K["ring"], -24), (K["kept"], -18),
          (K["noTrain"], -16), (K["him"], -13), (K["stand"], -11), (K["scale"], -10), (K["voice"], -16), (K["bro"], -13),
          (K["lift"], -11), (K["nobody"], -17), (K["lamp"], -14), (K["never"], -12), (K["gate"], -12), (K["side"], -9), (K["ask"], -11),
          (DUR - 1, -14), (DUR, -40)]
    for a, b in gaps:
        mp += [(a - 0.05, None), (a + 0.12, -45), (b - 0.02, -45)]
    mp = sorted(mp, key=lambda p: p[0]); out = []; last = -16
    for tpt, g in mp:
        if g is None: g = last
        out.append((tpt, g)); last = g if g > -40 else last
    m1 = loop * automation(out)
    sil = np.ones((N, 1), np.float32)
    for a, b in gaps:
        sil *= 1 - (automation([(0, -100), (a + 0.02, -100), (a + 0.15, 0), (b - 0.05, 0), (b + 0.02, -100), (DUR + 1, -100)]) * 0.75)
    rb = rb * sil
    # ---- cues
    knock = noise_burst(0.06, 300, 2500, 7, 0.002)
    def crawl(t0, t1, gain, rate=4.2 / np.pi):
        t = t0; i = 0
        while t < t1:
            place(knock * 0.8, t, gain - (i % 2) * 3); place(load("tick.mp3", "lowpass=f=1500"), t + 0.02, gain - 6, maxlen=0.12)
            t += 1 / rate; i += 1
    place(boom, 0.05, -13, fo=0.8, maxlen=2.0); place(stinger, 0.0, -15, fo=0.5, maxlen=1.2)
    place(bell(1.6) * 0.7, 0.0, -22, fo=0.6)                                    # frame 1: the lamps are flashing, the bell is dying away
    place(load("stretch.mp3"), 0.25, -15, fo=0.4, maxlen=1.0)                   # his head jerks
    crawl(0.3, K["me"] - 0.2, -17)
    place(stinger, K["foursW"] - 0.03, -12, fo=0.4, maxlen=1.0)
    place(load("stretch.mp3", "asetrate=48000*0.8,aresample=48000"), K["back"] + 0.1, -14, fo=0.5, maxlen=1.4)
    place(boom, K["wrongW"], -11, fo=0.6, maxlen=1.6)
    place(door_open, K["me"] + 0.05, -19, fo=0.3, maxlen=1.0)
    place(noise_burst(0.35, 800, 6000, 81, 0.02) * 0.6, K["note"], -15)
    place(load("door_creak.mp3", "lowpass=f=2200"), K["close1"] + 0.1, -18, maxlen=0.9)
    place(stinger, K["footW"] - 0.05, -17, fo=0.4, maxlen=0.8)
    place(motor, K["closeW"] - 0.05, -17, fo=0.4, maxlen=1.5); place(load("door_slam_wood.mp3"), K["closeW"] + 1.2, -14, maxlen=0.8)
    place(ding_far, K["kept"] + 0.3, -24, maxlen=1.0)
    place(riser, K["trainW"] + 0.2, -22, fi=0.6, fo=0.3, maxlen=1.2)
    crawl(K["him"] + 0.1, K["lamp9W"] - 0.05, -14, 1.9)
    place(stinger, K["himW"] - 0.03, -10, fo=0.4, maxlen=1.0)
    place(stinger, K["lamp9W"], -8, fo=0.5, maxlen=1.3); place(boom, K["lamp9W"] + 0.03, -9, fo=0.8, maxlen=2.0)
    place(heartbeat, K["lamp9W"] + 0.3, -16, fi=0.1, fo=0.3, maxlen=K["stand"] - K["lamp9W"] - 0.4)
    place(load("stretch.mp3", "asetrate=48000*0.7,aresample=48000"), K["standsW"] - 0.15, -9, fo=0.5, maxlen=2.2)
    for i in range(6): place(load("tick.mp3", "lowpass=f=1800"), K["standsW"] + i * 0.2, -16, maxlen=0.15)   # joints cracking
    place(boom, K["standsW"] + 1.0, -10, fo=0.6, maxlen=1.6)
    place(load("smile_stinger.mp3"), K["signalW"] - 0.05, -12, fo=0.5, maxlen=1.3)
    place(whisper, K["voice"] + 0.1, -15, fi=0.2, fo=0.5, maxlen=1.4)
    place(stinger, K["bhaiyaW"] - 0.05, -14, fo=0.4, maxlen=0.9)
    place(load("door_creak.mp3", "lowpass=f=1800"), K["open"] + 0.6, -17, maxlen=1.2)
    place(heartbeat, K["bro"], -15, fi=0.1, fo=0.3, maxlen=K["lift"] - K["bro"])
    place(motor, K["liftW"] - 0.05, -14, fo=0.4, maxlen=1.6)
    place(stinger, K["broken"], -8, fo=0.5, maxlen=1.2); place(boom, K["broken"] + 0.02, -8, fo=0.8, maxlen=2.0)
    place(load("buzz.mp3", "lowpass=f=3000"), K["nobody"] + 0.4, -20, maxlen=0.7)   # floodlight stutter
    place(noise_burst(0.5, 200, 1800, 85, 0.05) * 0.4, K["lamp"] + 0.1, -20)
    place(load("smile_stinger.mp3"), K["lampW"] - 0.05, -13, fo=0.5, maxlen=1.2)
    place(load("button.mp3"), K["trainW2"] - 0.1, -16, maxlen=0.3)              # signal clicks to red
    place(riser, K["openW"] - 0.06 - len(riser) / SR, -18, fi=1.2, fo=0.004)
    place(boom, K["openW"], -9, fo=0.8, maxlen=2.2)
    place(whisper, K["side"] + 0.2, -11, fi=0.1, fo=0.5, maxlen=1.6)
    place(stinger, K["sideW"] - 0.03, -6, fo=0.5, maxlen=1.4); place(boom, K["sideW"], -7, fo=0.8, maxlen=2.4)
    place(load("buzz.mp3", "lowpass=f=3000"), K["ask"] + 1.6, -20, maxlen=0.35)
    place(whisper, K["ask"] + 0.5, -15, fi=0.2, fo=0.5, maxlen=2.0)
    place(boom, K["loop"] - 0.05, -14, fo=0.6, maxlen=1.0)
    return m1, rb


def part10():
    """NIGHT SHIFT S2 Ep.2 — the ATM booth (the woman bent backwards). Fluorescent tube buzz + the machine's fan hum, far
    traffic wash, ATM key beeps (synth 1.4 kHz), the man's footsteps and his running away, joint cracks in the arch, a
    CCTV hiss for the camera shots, carved silences before the mirror and the reveal."""
    T10 = {L["id"]: L for L in T["lines"]}
    gaps = [(T10[i - 1]["end"], T10[i]["start"]) for i in (6, 12, 14, 17, 18)]
    tt = np.arange(N) / SR
    rng = np.random.default_rng(1010)
    # room: tube hum (50 Hz + harmonics, slight buzz) + machine fan + far traffic wash
    tube = (np.sin(2 * np.pi * 100 * tt) * 0.5 + np.sin(2 * np.pi * 200 * tt) * 0.25 + np.sin(2 * np.pi * 300 * tt) * 0.12).astype(np.float32)
    tube *= (0.85 + 0.15 * np.sin(2 * np.pi * 0.3 * tt)).astype(np.float32)
    wn = rng.standard_normal(N).astype(np.float32)
    Wf = np.fft.rfft(wn); fq = np.fft.rfftfreq(N, 1 / SR); Wf[(fq < 80) | (fq > 600)] = 0
    wn = np.fft.irfft(Wf, N).astype(np.float32); wn /= np.abs(wn).max() + 1e-9
    wn *= (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * tt)).astype(np.float32)
    rb = bed("hum.mp3", "lowpass=f=400") * db(-16) + np.stack([tube, tube], 1) * db(-36) + np.stack([wn, np.roll(wn, 700)], 1) * db(-25)
    def beep(f=1400, d=0.09):
        n = int(d * SR); x = np.arange(n) / SR; y = np.sin(2 * np.pi * f * x) * np.minimum(1, (d - x) / 0.01) * np.minimum(1, x / 0.003)
        return np.stack([y, y], 1).astype(np.float32)
    def hiss(d):
        n = int(d * SR); x = rng.standard_normal(n).astype(np.float32)
        X = np.fft.rfft(x); f = np.fft.rfftfreq(n, 1 / SR); X[(f < 1500) | (f > 9000)] = 0
        x = np.fft.irfft(X, n).astype(np.float32); x /= np.abs(x).max() + 1e-9
        return np.stack([x, x], 1)
    # music bed (shared score), carved out in the pauses
    mu = load("music.mp3"); xf = int(2 * SR)
    ramp = np.linspace(0, 1, xf, dtype=np.float32)[:, None]
    loop = np.concatenate([mu[:-xf], mu[-xf:] * (1 - ramp) + mu[:xf] * ramp, mu[xf:]])
    while len(loop) < N: loop = np.concatenate([loop, loop])
    loop = loop[:N]
    mp = [(0, -15), (K["bent"], -14), (K["me"], -21), (K["note"], -20), (K["clock"], -19), (K["man"], -18), (K["stop"], -16),
          (K["kept"], -19), (K["past"], -14), (K["types"], -16), (K["speaks"], -13), (K["look"], -12), (K["mirror11"], -10),
          (K["mirror"], -15), (K["behind"], -10), (K["down"], -14), (K["never"], -11), (K["ran"], -12), (K["still"], -9),
          (K["ask"], -11), (DUR - 1, -14), (DUR, -40)]
    for a, b in gaps:
        mp += [(a - 0.05, None), (a + 0.12, -45), (b - 0.02, -45)]
    mp = sorted(mp, key=lambda p: p[0]); out = []; last = -16
    for tpt, g in mp:
        if g is None: g = last
        out.append((tpt, g)); last = g if g > -40 else last
    m1 = loop * automation(out)
    sil = np.ones((N, 1), np.float32)
    for a, b in gaps:
        sil *= 1 - (automation([(0, -100), (a + 0.02, -100), (a + 0.15, 0), (b - 0.05, 0), (b + 0.02, -100), (DUR + 1, -100)]) * 0.75)
    rb = rb * sil
    # ---- cues
    step = noise_burst(0.07, 120, 1800, 31, 0.003)
    def steps(t0, t1, gain, rate):
        t = t0; i = 0
        while t < t1:
            place(step, t, gain - (i % 2) * 2); t += 1 / rate; i += 1
    place(boom, 0.05, -13, fo=0.8, maxlen=2.0); place(stinger, 0.0, -15, fo=0.5, maxlen=1.2)
    place(load("stretch.mp3"), 0.25, -15, fo=0.4, maxlen=1.0)                    # her head jerks
    for i in range(4): place(beep(), 0.5 + i * 0.32, -26)                         # keys being pressed
    place(stinger, K["backW"] - 0.03, -11, fo=0.4, maxlen=1.0)
    for i in range(5): place(load("tick.mp3", "lowpass=f=1800"), K["bent"] + 0.15 + i * 0.17, -17, maxlen=0.15)   # spine cracks
    place(boom, K["heelsW"], -11, fo=0.6, maxlen=1.6); place(whisper, K["heels"] + 0.2, -22, fi=0.2, fo=0.4, maxlen=1.2)
    place(noise_burst(0.35, 800, 6000, 81, 0.02) * 0.6, K["note"], -15)
    place(load("smile_stinger.mp3"), K["mirrorW"] - 0.05, -14, fo=0.5, maxlen=1.1)
    place(hiss(K["man"] - K["clock"]), K["clock"], -30, fo=0.1)
    steps(K["man"] + 0.1, K["man"] + 2.0, -20, 2.2)
    place(door_open, K["doorW"] - 0.05, -21, fo=0.3, maxlen=0.6)
    place(load("door_slam.mp3", "lowpass=f=2500"), K["stopW"] - 0.02, -16, maxlen=0.6)   # your palm on the glass
    place(ding_far, K["kept"] + 0.3, -24, maxlen=1.0)
    place(stinger, K["pastW"] + 0.1, -12, fo=0.4, maxlen=1.0)
    steps(K["runsW"] - 0.1, K["runsW"] + 1.6, -17, 6.5)
    t = K["types"] + 0.2; i = 0
    while t < K["money"]:
        place(beep(1400 + (i % 3) * 90), t, -24); t += 0.21 + (i % 2) * 0.07; i += 1
    place(beep(520, 0.4), K["noW"] - 0.05, -22)                                     # transaction cancelled
    place(whisper, K["speaks"] + 0.05, -15, fi=0.2, fo=0.5, maxlen=1.4)
    place(stinger, K["lookUpW"] - 0.05, -12, fo=0.4, maxlen=0.9)
    place(heartbeat, K["look"], -15, fi=0.1, fo=0.3, maxlen=K["mirror11"] - K["look"] + 0.2)
    place(stinger, K["broken"], -8, fo=0.5, maxlen=1.2); place(boom, K["broken"] + 0.02, -8, fo=0.8, maxlen=2.0)
    place(riser, K["behindW"] - 0.06 - len(riser) / SR, -18, fi=1.2, fo=0.004)
    place(load("stretch.mp3", "asetrate=48000*0.7,aresample=48000"), K["standW"] - 0.1, -11, fo=0.5, maxlen=2.0)
    place(stinger, K["behindW"] - 0.03, -6, fo=0.5, maxlen=1.4); place(boom, K["behindW"], -7, fo=0.8, maxlen=2.4)
    place(load("buzz.mp3", "lowpass=f=3000"), K["emptyW"] - 0.1, -19, maxlen=0.6)       # tubes stutter
    place(hiss(K["still"] - K["never"]), K["never"], -30, fo=0.1)
    for i in range(3): place(load("button.mp3"), K["allW"] - 0.3 + i * 0.55, -18, maxlen=0.25)   # the tape jumps back
    place(load("smile_stinger.mp3"), K["nightW"], -11, fo=0.5, maxlen=1.3)
    place(boom, K["ranW"], -10, fo=0.6, maxlen=1.6)
    place(whisper, K["still"] + 0.1, -11, fi=0.1, fo=0.5, maxlen=1.6)
    place(stinger, K["thereW"] - 0.03, -6, fo=0.5, maxlen=1.4); place(boom, K["thereW"], -7, fo=0.8, maxlen=2.4)
    place(load("buzz.mp3", "lowpass=f=3000"), K["ask"] + 1.6, -20, maxlen=0.35)
    place(whisper, K["ask"] + 0.5, -15, fi=0.2, fo=0.5, maxlen=2.0)
    place(boom, K["loop"] - 0.05, -14, fo=0.6, maxlen=1.0)
    return m1, rb


music, beds = {1: part1, 2: part2, 3: part3, 4: part4, 5: part5, 6: part6, 7: part7, 8: part8, 9: part9, 10: part10}[PART]()
if PART in (3, 4, 5, 6, 7, 8, 9, 10): sfx *= db(-1.2)
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
