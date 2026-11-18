"""BLOCK C — sound mix for one part:  python mix.py <part>

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
    lights_off = load("lights_off.mp3"); stairs = load("stairs.mp3", "highpass=f=700")
    step = load("boom.mp3", "lowpass=f=240")[: int(0.5 * SR)]
    sent = load("sent.mp3"); typing = load("typing.mp3"); slam_w = load("door_slam_wood.mp3")
    page = noise_burst(0.32, 1500, 7000, 3, 0.02) * 0.6
    page2 = noise_burst(0.28, 1200, 6000, 7, 0.03) * 0.6
    paper = noise_burst(0.5, 800, 5000, 11, 0.05) * 0.5
    c0 = K["corridor"]
    m1 = np.pad(load("music.mp3"), ((0, N), (0, 0)))[:N] * automation([
        (0, -19), (K["list"], -17), (K["tore"] - 0.1, -15), (K["tore"] + 0.05, -26), (K["kabir"], -20), (K["sleep"] + 0.3, -18),
        (K["chat"], -16), (K["died"], -12), (K["lock"], -15), (c0 - 0.3, -16), (c0 + 0.6, -80), (DUR, -80)])
    m2 = np.pad(load("music_p3.mp3"), ((0, N), (0, 0)))
    off = int(c0 * SR); m2 = np.concatenate([np.zeros((off, 2), np.float32), m2])[:N] * automation([
        (0, -80), (c0, -80), (c0 + 0.4, -22), (K["steps"], -18), (K["name"], -15), (K["blanket"], -16), (K["stop"], -13),
        (K["gap"], -17), (K["yourName"] - 0.1, -17), (K["nameW"] - 0.05, -30), (K["nameW"] + 0.4, -11), (K["register"], -13),
        (K["does"] - 0.15, -12), (K["does"] - 0.05, -30), (K["choice"], -13), (DUR - 1.4, -14), (DUR, -40)])
    music = m1 + m2
    # room tone / tube hum: hum in the corridor until the lights die; low room tone otherwise
    hum = bed("hum.mp3", "lowpass=f=700") * automation([(0, -14), (DUR, -14)])
    hum += bed("hum.mp3", "highpass=f=1200") * automation([
        (0, -80), (0.0, -10), (K["room1"], -10), (K["room1"] + 0.05, -80), (c0, -80), (c0 + 0.05, -5),
        (K["out"][2], -8), (K["out"][4], -12), (K["out"][4] + 0.08, -80), (DUR, -80)])
    # opening: plate -> room
    place(boom, 0.05, -16, fo=0.6, maxlen=2.0)
    place(paper, K["push"] + 0.3, -10)
    place(boom, K["list"] + 0.05, -17, fo=0.5, maxlen=1.5)
    # rules: a soft tick on each rule number, paper rustles
    for k in ["r1", "r2", "r3", "r4", "r5"]:
        place(tick_soft, K[k] - 0.02, -12)
    place(whisper, K["underbed"] - 0.1, -14, fi=0.2, fo=0.5, maxlen=1.6)
    place(boom, K["underbed"] + 0.02, -17, fo=0.5, maxlen=1.2)
    place(paper, K["r6"] + 0.2, -10)
    place(stinger, K["tore"] - 0.03, -11, fo=0.5, maxlen=1.2)
    place(boom, K["tore"], -13, fo=0.6, maxlen=1.6)
    # lamp click
    place(tick, K["sleep"] + 0.33, -6, maxlen=0.4)
    # group chat
    place(sent, K["chat"] + 0.12, -12)
    place(buzz, K["ping"] - 0.03, -22, maxlen=1.0, fo=0.15)
    place(sent, K["ping"], -10)
    place(sent, K["m3"] - 0.02, -10)
    place(boom, K["died"], -16, fo=0.6, maxlen=1.6)
    place(sent, K["m4"] - 0.02, -10)
    place(whisper, K["m4"] + 0.1, -16, fi=0.3, fo=0.8, maxlen=2.0)
    place(boom, K["twelve"], -18, fo=0.5, maxlen=1.4)
    # lights die one by one
    pk = peak_time(lights_off[: int(1.2 * SR)])
    for i, tt in enumerate(K["out"]):
        place(lights_off, tt - pk, -6 - i * 0.5, fo=0.3, maxlen=pk + 0.6)
    place(boom, K["out"][4] + 0.05, -15, fo=0.8, maxlen=2.0)
    # footsteps (heavy, slow)
    for i, tt in enumerate(K["footsteps"]):
        place(step, tt, -4 if tt < K["name"] else -2, fo=0.25)
        place(stairs[: int(0.12 * SR)], tt, -24, fo=0.05)
    place(heartbeat, K["steps"] + 0.3, -18, fi=0.6, fo=0.8, maxlen=K["blanket"] - K["steps"])
    # doors answer: a soft door latch tick + boom per number
    place(tick_soft, K["present9"] + 0.3, -10)
    for k in ["ten", "eleven", "twelve2"]:
        place(boom, K[k] + 0.02, -18, fo=0.4, maxlen=0.9)
        place(tick_soft, K[k] + 0.35, -12)
    # the stop outside 13
    place(boom, K["stopW"] + 0.05, -12, fo=0.6, maxlen=1.8)
    place(heartbeat, K["stopW"] + 0.2, -16, fi=0.2, fo=0.8, maxlen=K["yourName"] - K["stopW"])
    # under the door
    place(riser, K["two"] - 0.4, -20, fi=0.4, fo=0.3, maxlen=1.6)
    place(boom, K["feet"], -14, fo=0.6, maxlen=1.4)
    place(page, K["pages"][0] - 0.05, -6)
    place(page2, K["pages"][1] - 0.05, -6)
    place(page, K["kabirCall"] + 0.1, -12)
    # your name
    place(stinger, K["nameW"] - 0.03, -8, fo=0.4, maxlen=1.4)
    place(boom, K["nameW"], -10, fo=0.6, maxlen=2.2)
    place(paper, K["register"] + 0.15, -14)
    place(whisper, K["nobody"] + 0.1, -15, fi=0.5, fo=0.6, maxlen=2.4)
    place(riser, K["does"] - 0.06 - len(riser) / SR, -16, fi=2.5, fo=0.004)
    place(slam_w, K["does"] - 0.02, -9)
    place(boom, K["does"] + 0.02, -8, fo=0.6, maxlen=2.0)
    place(boom, K["choice"] - 0.1, -16, fo=0.8, maxlen=2.5)
    return music, hum


def part2():
    lights_off = load("lights_off.mp3")
    step = load("boom.mp3", "lowpass=f=240")[: int(0.5 * SR)]
    sent = load("sent.mp3"); slam_w = load("door_slam_wood.mp3"); creak = load("door_creak.mp3")
    page = noise_burst(0.32, 1500, 7000, 3, 0.02) * 0.6
    scratch = np.concatenate([noise_burst(0.16, 2500, 9000, 20 + i, 0.01) * (0.5 + 0.4 * (i % 3) / 2) for i in range(14)])
    knock = load("door_slam_wood.mp3", "lowpass=f=1400,highpass=f=90")
    kp = peak_time(knock[: int(1.0 * SR)])
    knock = knock[max(0, int((kp - 0.01) * SR)): int((kp + 0.22) * SR)]
    knock_body = load("boom.mp3", "lowpass=f=300")[: int(0.25 * SR)]
    m1 = np.pad(load("music_p3.mp3"), ((0, N), (0, 0)))[:N] * automation([
        (0, -13), (K["answered"], -15), (K["present"] - 0.1, -26), (K["present"] + 0.5, -15), (K["n14"], -14), (K["kabir"], -18),
        (K["blanket"], -16), (K["lock"], -17), (K["register"], -15), (K["red"], -12), (K["chat2"], -15), (K["door"] - 0.3, -16),
        (K["knocks"][0] - 0.4, -30), (K["knocks"][2] + 0.4, -30), (K["knuckles"], -16), (K["rule"], -14), (K["speaks"], -16),
        (K["voice"], -12), (K["breath"], -14), (K["hey"], -18), (K["behind"], -15), (K["flatW"] - 0.05, -30), (K["flatW"] + 0.4, -11),
        (K["choice"], -13), (DUR - 1.4, -14), (DUR, -40)])
    hum = bed("hum.mp3", "lowpass=f=700") * automation([(0, -15), (DUR, -15)])
    # hook: hit on frame 1
    place(boom, 0.0, -10, fo=0.8, maxlen=2.2)
    place(stinger, 0.0, -14, fo=0.6, maxlen=1.4)
    place(heartbeat, 0.3, -18, fi=0.3, fo=0.6, maxlen=3.0)
    place(whisper, K["present"] - 0.2, -15, fi=0.2, fo=0.5, maxlen=1.4)
    place(boom, K["present"] + 0.05, -14, fo=0.6, maxlen=1.6)
    place(boom, K["stopIt"], -16, fo=0.5, maxlen=1.2)
    for p0 in [K["pages"] + 0.1, K["pages"] + 0.65]:
        place(page, p0 - 0.05, -8)
    place(scratch, K["pen"] + 0.2, -14, fi=0.05, fo=0.3, maxlen=K["spell"] + 0.4 - K["pen"] - 0.2)
    for tt in K["footsteps"]:
        place(step, tt, -6, fo=0.25)
    for k in ["n14", "n15", "n16"]:
        place(tick_soft, K[k] + 0.02, -12)
    place(boom, K["nothing"], -16, fo=0.8, maxlen=1.8)
    place(heartbeat, K["blanket"] + 0.3, -17, fi=0.5, fo=0.6, maxlen=K["lock"] - K["blanket"])
    place(boom, K["tooSlow"], -17, fo=0.6, maxlen=1.4)
    place(buzz, K["pings"] - 0.03, -22, maxlen=0.6, fo=0.15)
    place(sent, K["pings"], -10)
    place(sent, K["chat"] + 0.1, -12); place(sent, K["m2"], -11); place(sent, K["m3"], -11)
    place(shutter, K["register"], -8)
    place(stinger, K["red"] - 0.03, -10, fo=0.5, maxlen=1.2)
    place(boom, K["red"], -12, fo=0.6, maxlen=1.8)
    place(sent, K["m4"], -10); place(sent, K["m5"], -10)
    place(boom, K["voiceW"], -15, fo=0.6, maxlen=1.6)
    place(riser, K["door"] - 0.2, -22, fi=1.0, fo=0.3, maxlen=K["knocks"][0] - K["door"] + 0.2)
    for tt in K["knocks"]:
        place(knock, tt, -4, fo=0.08); place(knock_body, tt, -12, fo=0.12)
    place(boom, K["notW"], -12, fo=0.6, maxlen=1.8)
    place(whisper, K["speaks"] + 0.2, -16, fi=0.4, fo=0.6, maxlen=2.2)
    place(stinger, K["voiceW2"] - 0.03, -9, fo=0.5, maxlen=1.4)
    place(boom, K["voiceW2"], -11, fo=0.6, maxlen=2.0)
    place(heartbeat, K["breath"] + 0.2, -15, fi=0.3, fo=0.6, maxlen=K["behind"] - K["breath"])
    place(creak, K["openUp"] - 0.1, -12, fo=0.4, maxlen=1.4)
    place(creak, K["creaks"] - 0.05, -9, fo=0.4, maxlen=1.0)
    place(riser, K["flatW"] - 0.06 - len(riser) / SR, -17, fi=2.0, fo=0.004)
    place(slam_w, K["flatW"] - 0.02, -10)
    place(boom, K["flatW"], -8, fo=0.6, maxlen=2.0)
    place(boom, K["choice"] - 0.1, -16, fo=0.8, maxlen=2.5)
    return m1, hum


def part3():
    slam_w = load("door_slam_wood.mp3"); creak = load("door_creak.mp3"); dopen = load("door_open.mp3")
    sent = load("sent.mp3")
    bolt = noise_burst(0.28, 900, 5000, 7, 0.02) * 0.7
    page = noise_burst(0.32, 1500, 7000, 3, 0.02) * 0.6
    breath = load("whisper.mp3", "lowpass=f=900,asetrate=48000*0.8,aresample=48000")
    m1 = np.pad(load("music_p3.mp3"), ((0, N), (0, 0)))[:N] * automation([
        (0, -13), (K["opened"], -15), (K["swings"] - 0.2, -24), (K["nobody"] + 0.4, -17), (K["corridor"], -16),
        (K["gone"], -18), (K["feet"], -15), (K["pick"], -16), (K["tomorrow"], -12), (K["room13"], -15), (K["mark"], -18),
        (K["left"] - 0.1, -30), (K["left"] + 0.5, -11), (K["notAbs"], -14), (K["slam"], -15), (K["time"], -18),
        (K["rule"], -14), (K["buzz"], -17), (K["since"], -13), (K["flash"], -15), (K["under"] - 0.2, -28), (K["under"] + 0.6, -18),
        (K["whisper"], -14), (K["closer"], -16), (K["comeW"], -11), (K["choice"], -13), (DUR - 1.4, -14), (DUR, -40)])
    hum = bed("hum.mp3", "lowpass=f=700") * automation([(0, -16), (K["nobody"], -22), (K["slam"], -16), (DUR, -16)])
    # hook: hit on frame 1, handle rattling
    place(boom, 0.0, -10, fo=0.8, maxlen=2.2)
    place(stinger, 0.0, -14, fo=0.6, maxlen=1.4)
    place(heartbeat, 0.3, -18, fi=0.3, fo=0.6, maxlen=3.0)
    place(creak, 0.4, -16, fo=0.4, maxlen=1.2)
    place(boom, K["openedW"], -15, fo=0.6, maxlen=1.4)
    place(bolt, K["slides"] - 0.05, -6)
    place(dopen, K["swings"] - 0.1, -10, fo=0.5, maxlen=2.0)
    place(creak, K["swings"], -12, fo=0.5, maxlen=1.6)
    place(whisper, K["nobody"] - 0.1, -20, fi=0.3, fo=0.6, maxlen=1.6)
    place(boom, K["dead"], -18, fo=0.6, maxlen=1.4)
    place(boom, K["nothing"], -16, fo=0.8, maxlen=1.8)
    place(riser, K["down"] - 0.2, -24, fi=0.8, fo=0.3, maxlen=K["regW"] - K["down"] + 0.2)
    place(stinger, K["regW"] - 0.03, -13, fo=0.5, maxlen=1.0)
    place(page, K["pick"] + 0.05, -8); place(page, K["pick"] + 0.5, -10)
    place(boom, K["wrong"], -15, fo=0.6, maxlen=1.4)
    place(stinger, K["tomorrow"] - 0.03, -11, fo=0.5, maxlen=1.2)
    place(boom, K["tomorrow"], -12, fo=0.6, maxlen=1.8)
    place(boom, K["red"], -15, fo=0.6, maxlen=1.4)
    place(heartbeat, K["mark"] + 0.1, -16, fi=0.3, fo=0.3, maxlen=K["left"] - K["mark"])
    place(riser, K["left"] - 0.06 - len(riser) / SR, -18, fi=2.0, fo=0.004)
    place(slam_w, K["left"] - 0.02, -12)
    place(boom, K["left"], -7, fo=0.6, maxlen=2.4)
    place(stinger, K["left"], -10, fo=0.6, maxlen=1.4)
    place(boom, K["left2"], -15, fo=0.6, maxlen=1.4)
    place(slam_w, K["slamW"] - 0.02, -5)
    place(boom, K["slamW"], -10, fo=0.6, maxlen=1.6)
    place(bolt, K["boltW"] - 0.05, -5)
    place(heartbeat, K["backW"], -15, fi=0.2, fo=0.6, maxlen=K["rule"] - K["backW"])
    place(tick_soft, K["time"] + 0.05, -10)
    place(boom, K["lookW"], -13, fo=0.6, maxlen=1.6)
    place(buzz, K["buzzW"] - 0.03, -20, maxlen=0.6, fo=0.15)
    place(sent, K["buzzW"], -10); place(sent, K["m1"], -11); place(sent, K["m2"], -11)
    place(boom, K["voicesW"], -14, fo=0.6, maxlen=1.6)
    place(stinger, K["since"] - 0.03, -11, fo=0.5, maxlen=1.2)
    place(boom, K["since"], -12, fo=0.6, maxlen=1.8)
    place(shutter, K["flash"] - 0.02, -12)
    place(boom, K["breathingW"], -14, fo=0.6, maxlen=1.6)
    # the breath under the bed: slow, low, in the gaps
    for tt in [K["under"] - 0.7, K["breathW"] + 0.75, K["slow"] + 2.1]:
        place(breath, tt, -12, fi=0.4, fo=0.6, maxlen=1.6)
    place(heartbeat, K["slow"], -15, fi=0.3, fo=0.6, maxlen=K["closer"] - K["slow"])
    place(whisper, K["whisper"] + 0.2, -15, fi=0.3, fo=0.6, maxlen=1.8)
    place(stinger, K["kvoice"] - 0.03, -10, fo=0.5, maxlen=1.2)
    place(boom, K["kvoice"], -12, fo=0.6, maxlen=1.8)
    place(creak, K["closer"] + 0.2, -16, fo=0.4, maxlen=1.2)
    place(riser, K["comeW"] - 0.06 - len(riser) / SR, -18, fi=2.0, fo=0.004)
    place(boom, K["comeW"], -8, fo=0.6, maxlen=2.2)
    place(boom, K["choice"] - 0.1, -16, fo=0.8, maxlen=2.5)
    place(tick, K["optA"], -12); place(tick, K["optB"], -12)
    place(tick, K["ctaA"], -14); place(tick, K["ctaB"], -14)
    return m1, hum


def part4():
    creak = load("door_creak.mp3"); sent = load("sent.mp3"); stairs = load("stairs.mp3"); crowd = load("crowd.mp3")
    lights = load("lights_off.mp3"); button = load("button.mp3")
    scratch = noise_burst(0.9, 2500, 9000, 2, 0.05) * 0.5
    breath = load("whisper.mp3", "lowpass=f=900,asetrate=48000*0.8,aresample=48000")
    # the mess bell: a struck bell made from partials, ringing out
    tb = np.arange(int(3.5 * SR)) / SR
    bellw = sum(a * np.sin(2 * np.pi * f * tb) * np.exp(-tb * d) for f, a, d in [(523, 0.5, 1.2), (1046, 0.25, 2.0), (1318, 0.2, 2.6), (1568, 0.12, 3.5), (262, 0.3, 0.9)])
    clang = np.stack([bellw, bellw], 1).astype(np.float32) * 0.6
    m1 = np.pad(load("music_p2.mp3"), ((0, N), (0, 0)))[:N] * automation([
        (0, -13), (K["look"], -15), (K["torchW"], -17), (K["beam"], -18), (K["shape"], -14), (K["long"], -16),
        (K["turned"], -18), (K["noface"], -13), (K["whisper"], -17), (K["present"] - 0.1, -32), (K["present"] + 0.6, -12),
        (K["diesW"], -40), (K["back"], -40), (K["back"] + 0.5, -18), (K["n43"], -12), (K["phone"], -17), (K["bell"] - 0.2, -34),
        (K["mess"], -16), (K["doors"], -14), (K["steps"], -15), (K["rule"], -14), (K["buzz"], -17), (K["voicesW"], -12),
        (K["choice"], -13), (DUR - 1.4, -14), (DUR, -40)])
    hum = bed("hum.mp3", "lowpass=f=700") * automation([(0, -16), (K["diesW"], -26), (K["back"], -16), (DUR, -16)])
    # hook: hit on frame 1 + the breath
    place(boom, 0.0, -10, fo=0.8, maxlen=2.2)
    place(stinger, 0.0, -14, fo=0.6, maxlen=1.4)
    place(breath, 0.2, -12, fi=0.2, fo=0.6, maxlen=1.6)
    place(heartbeat, 0.4, -18, fi=0.3, fo=0.6, maxlen=2.6)
    place(boom, K["lookW"], -15, fo=0.6, maxlen=1.4)
    place(button, K["torchW"] - 0.02, -8)
    place(scratch, K["hand"] + 0.3, -14)
    place(stinger, K["fastW"] - 0.03, -12, fo=0.5, maxlen=1.0)
    place(riser, K["shapeW"] - 0.06 - len(riser) / SR, -20, fi=2.0, fo=0.004)
    place(boom, K["shapeW"], -12, fo=0.6, maxlen=1.8)
    place(boom, K["longW"], -15, fo=0.6, maxlen=1.4)
    place(breath, K["long"] + 1.2, -14, fi=0.3, fo=0.6, maxlen=1.4)
    place(stinger, K["hereW"] - 0.03, -11, fo=0.5, maxlen=1.2)
    place(boom, K["hereW"], -12, fo=0.6, maxlen=1.6)
    place(creak, K["turned"] + 0.2, -16, fo=0.4, maxlen=1.2)
    place(boom, K["faceW"], -10, fo=0.6, maxlen=2.0)
    place(heartbeat, K["faceW"] + 0.3, -15, fi=0.3, fo=0.5, maxlen=K["whisper"] - K["faceW"])
    place(whisper, K["whisper"] + 0.2, -15, fi=0.3, fo=0.6, maxlen=1.8)
    place(stinger, K["voiceW"] - 0.03, -10, fo=0.5, maxlen=1.2)
    place(riser, K["present"] - 0.06 - len(riser) / SR, -18, fi=2.0, fo=0.004)
    place(boom, K["present"] + 0.05, -6, fo=0.6, maxlen=2.4)
    place(stinger, K["present"] + 0.05, -9, fo=0.6, maxlen=1.4)
    place(lights, K["diesW"] - 0.05, -10, maxlen=1.2, fo=0.3)
    for c in ["c1", "c2", "c3"]:
        place(heartbeat, K[c] - 0.05, -10, maxlen=0.7, fo=0.2)
    place(button, K["back"] + 0.02, -9)
    place(scratch, K["scratchW"], -10); place(scratch, K["scratchW"] + 0.8, -12)
    place(boom, K["n43"], -8, fo=0.6, maxlen=2.2)
    place(stinger, K["n43"], -10, fo=0.6, maxlen=1.4)
    place(boom, K["t259"] + 0.1, -12, fo=0.6, maxlen=1.8)
    place(boom, K["goneW"], -14, fo=0.6, maxlen=1.4)
    place(clang, K["bellW"] - 0.02, -4, fo=1.0)
    place(clang, K["bellW"] + 0.9, -8, fo=1.0)
    place(clang, K["threeW"] - 0.05, -12, fo=1.0)
    place(lights, K["mess"] + 0.1, -16, maxlen=1.0, fo=0.3)
    place(boom, K["onceW"], -9, fo=0.6, maxlen=2.0)
    place(creak, K["onceW"] - 0.05, -10, fo=0.4, maxlen=1.4)
    place(stairs, K["steps"] - 0.3, -10, fi=0.4, fo=0.8, maxlen=K["rule"] - K["steps"] + 0.6)
    place(boom, K["notYou"], -12, fo=0.6, maxlen=1.6)
    place(buzz, K["buzzW"] - 0.03, -20, maxlen=0.6, fo=0.15)
    place(sent, K["buzzW"], -10); place(sent, K["m1"], -11); place(sent, K["m2"], -11)
    place(stinger, K["voicesW"] - 0.03, -10, fo=0.5, maxlen=1.2)
    place(boom, K["voicesW"], -9, fo=0.6, maxlen=2.0)
    place(boom, K["choice"] - 0.1, -16, fo=0.8, maxlen=2.5)
    place(tick, K["optA"], -12); place(tick, K["optB"], -12)
    place(tick, K["ctaA"], -14); place(tick, K["ctaB"], -14)
    return m1, hum


def part5():
    creak = load("door_creak.mp3"); sent = load("sent.mp3"); stairs = load("stairs.mp3"); typing = load("typing.mp3")
    lights = load("lights_off.mp3")
    creak_low = load("door_creak.mp3", "asetrate=48000*0.7,aresample=48000,lowpass=f=2500")
    breath = load("whisper.mp3", "lowpass=f=900,asetrate=48000*0.8,aresample=48000")
    pen = noise_burst(0.22, 2500, 8000, 5, 0.01) * 0.45
    # steel spoon on a steel plate: short metallic partials (one for the whole hall, slightly smeared = unison)
    tc = np.arange(int(0.6 * SR)) / SR
    cl = sum(a * np.sin(2 * np.pi * f * tc) * np.exp(-tc * d) for f, a, d in [(2310, 0.5, 14), (3470, 0.35, 18), (5120, 0.2, 24), (1290, 0.25, 10)])
    cl = np.stack([cl, cl], 1).astype(np.float32)
    clink = cl * 0.5
    for d_ms, g in [(9, 0.6), (17, 0.5), (26, 0.4), (38, 0.3), (51, 0.25)]:
        i = int(d_ms / 1000 * SR); clink[i:] += cl[: len(cl) - i] * g * 0.5
    tb = np.arange(int(3.5 * SR)) / SR
    bellw = sum(a * np.sin(2 * np.pi * f * tb) * np.exp(-tb * d) for f, a, d in [(523, 0.5, 1.2), (1046, 0.25, 2.0), (1318, 0.2, 2.6), (1568, 0.12, 3.5), (262, 0.3, 0.9)])
    clang = np.stack([bellw, bellw], 1).astype(np.float32) * 0.6
    m1 = np.pad(load("music_p2.mp3"), ((0, N), (0, 0)))[:N] * automation([
        (0, -15), (K["stairs"], -17), (K["plates"], -18), (K["chew"], -22), (K["practise"], -15), (K["counter"], -16),
        (K["warden"], -12), (K["empty"], -16), (K["plate"], -18), (K["tomW"], -13), (K["rule"], -15), (K["sit"], -18),
        (K["stopW"] - 0.05, -18), (K["stopW"] + 0.05, -40), (K["turnW"], -40), (K["onceW"], -12), (K["reg"], -15),
        (K["buzz"], -17), (K["n43W"], -13), (K["typing"], -16), (K["now"], -12), (K["choice"], -13), (DUR - 1.4, -14), (DUR, -40)])
    hum = bed("hum.mp3", "lowpass=f=900") * automation([(0, -14), (K["stopW"], -14), (K["stopW"] + 0.1, -20), (K["buzz"], -18), (DUR, -18)])
    # spoons: one unison clink each time the hall's spoons hit the plates
    def downs(a, b, w, ph):
        out = []; k = int(np.floor((a * w - ph) / (2 * np.pi))) - 1
        while True:
            tt = (ph - np.pi / 2 + 2 * np.pi * k) / w
            if tt > b: break
            if tt >= a: out.append(tt)
            k += 1
        return out
    for tt in downs(0.0, K["spoon"], 2.4, 1.2) + downs(K["chew"] + 1.6, K["practise"], 2.4, 1.2):
        place(clink, tt, -14)
    for tt in [K["down1"], K["down2"]]: place(clink, tt + 0.25, -9)
    for tt in downs(K["practise"], K["counter"], 5.2, 0.0): place(clink, tt, -13)
    for tt in downs(K["counter"], K["stopW"], 2.4, 1.2): place(clink, tt, -20)
    # hook: distant mess bell tail + hit
    place(clang, 0.0, -16, fo=1.0)
    place(boom, 0.05, -14, fo=0.8, maxlen=2.0)
    place(boom, K["chairW"], -15, fo=0.6, maxlen=1.4)
    place(stairs, K["stairs"] - 0.2, -12, fi=0.3, fo=0.6, maxlen=K["lights"] - K["stairs"] + 0.4)
    place(boom, K["spokeW"], -16, fo=0.6, maxlen=1.2)
    place(lights, K["lights"] + 0.05, -18, maxlen=0.8, fo=0.3)
    place(breath, K["chew"] + 0.1, -14, fi=0.2, fo=0.5, maxlen=1.4)
    place(stinger, K["practiseW"] - 0.03, -14, fo=0.5, maxlen=1.0)
    place(riser, K["tallW"] - 0.06 - len(riser) / SR, -20, fi=2.0, fo=0.004)
    place(boom, K["tallW"], -12, fo=0.6, maxlen=1.8)
    place(stinger, K["wardenW"] - 0.03, -10, fo=0.6, maxlen=1.4)
    place(boom, K["wardenW"], -8, fo=0.6, maxlen=2.2)
    place(boom, K["emptyW"], -15, fo=0.6, maxlen=1.4)
    place(tick, K["roomW"], -12)
    place(pen, K["dateW"] - 0.05, -14); place(pen, K["dateW"] + 0.25, -15)
    place(stinger, K["tomW"] - 0.03, -10, fo=0.5, maxlen=1.2)
    place(boom, K["tomW"], -9, fo=0.6, maxlen=2.0)
    place(boom, K["notYou"] + 0.05, -12, fo=0.6, maxlen=1.6)
    place(heartbeat, K["sit"], -12, fi=0.1, fo=0.4, maxlen=K["stop"] - K["sit"] + 0.2)
    place(clink, K["stopW"] - 0.02, -6)
    place(boom, K["stopW"] + 0.05, -10, fo=0.6, maxlen=1.6)
    place(creak_low, K["turnW"] - 0.1, -9, fo=0.4, maxlen=1.5)
    place(creak_low, K["turnW"] + 0.12, -12, fo=0.4, maxlen=1.3)
    place(riser, K["onceW"] - 0.06 - len(riser) / SR, -18, fi=2.0, fo=0.004)
    place(boom, K["onceW"], -6, fo=0.6, maxlen=2.4)
    place(stinger, K["toward"], -9, fo=0.6, maxlen=1.4)
    place(creak, K["regOpenW"] - 0.1, -16, fo=0.4, maxlen=1.0)
    for i in range(8): place(pen, K["penW"] + i * 0.27, -13 - (i % 2) * 2)
    place(buzz, K["buzzW"] - 0.03, -18, maxlen=0.6, fo=0.15)
    place(sent, K["buzzW"], -10)
    place(stinger, K["n43W"] - 0.03, -11, fo=0.5, maxlen=1.2)
    place(boom, K["n43W"], -10, fo=0.6, maxlen=1.8)
    place(boom, K["leaveW"], -14, fo=0.6, maxlen=1.4)
    place(typing, K["typingW"] - 0.1, -12, fi=0.05, fo=0.3, maxlen=K["choice"] - K["typingW"])
    place(boom, K["now"] + 0.05, -8, fo=0.6, maxlen=2.0)
    place(boom, K["choice"] - 0.1, -16, fo=0.8, maxlen=2.5)
    place(tick, K["optA"], -12); place(tick, K["optB"], -12)
    place(tick, K["ctaA"], -14); place(tick, K["ctaB"], -14)
    return m1, hum


def part6():
    creak = load("door_creak.mp3"); sent = load("sent.mp3"); stairs = load("stairs.mp3"); typing = load("typing.mp3")
    btn = load("button.mp3"); lock = load("lock_denied.mp3")
    creak_low = load("door_creak.mp3", "asetrate=48000*0.7,aresample=48000,lowpass=f=2500")
    breath = load("whisper.mp3", "lowpass=f=900,asetrate=48000*0.8,aresample=48000")
    shut_far = load("shutter.mp3", "lowpass=f=3000")
    bolt = noise_burst(0.35, 600, 4000, 11, 0.02) * 0.5
    # benches scraping back: long low noise, slightly smeared (42 at once)
    scrape = noise_burst(1.2, 120, 1400, 23, 0.06) * 0.7
    for d_ms, g in [(14, 0.7), (31, 0.55), (52, 0.4)]:
        i = int(d_ms / 1000 * SR); scrape[i:] += scrape[: len(scrape) - i] * g * 0.5
    m1 = np.pad(load("music_p3.mp3"), ((0, N), (0, 0)))[:N] * automation([
        (0, -15), (K["tap"], -17), (K["leftW"], -40), (K["quiet"], -40), (K["heads"], -18), (K["eyesW"], -13),
        (K["buzz"], -17), (K["addedW"], -13), (K["info"], -17), (K["isYouW"], -12), (K["head"], -16), (K["turn"], -40),
        (K["num"], -16), (K["thirteenW"], -13), (K["typing"], -16), (K["neverW"], -12), (K["hand"], -17), (K["dev"], -19),
        (K["reply"], -16), (K["rule"], -15), (K["yoursW2"], -12), (K["bolt"], -18), (K["openW"], -14), (K["onceW"], -11),
        (K["going"], -14), (K["type"], -19), (K["choice"], -13), (DUR - 1.4, -14), (DUR, -40)])
    hum = bed("hum.mp3", "lowpass=f=900") * automation([(0, -14), (K["dev"], -14), (K["dev"] + 0.1, -22), (K["reply"], -16), (K["bolt"], -22), (K["stand"], -14), (DUR, -18)])
    place(boom, 0.05, -12, fo=0.8, maxlen=2.0)
    place(stinger, 0.0, -14, fo=0.5, maxlen=1.2)
    place(typing, K["number"], -16, fo=0.3, maxlen=K["tap"] - K["number"])
    place(boom, K["numberW"], -14, fo=0.6, maxlen=1.4)
    place(btn, K["leaveW"], -10)
    place(sent, K["leftW"], -12)
    place(boom, K["leftW"] + 0.05, -16, fo=0.6, maxlen=1.2)
    place(breath, K["eyes"] + 0.1, -15, fi=0.2, fo=0.5, maxlen=1.6)
    place(stinger, K["eyesW"] - 0.03, -12, fo=0.5, maxlen=1.2)
    place(buzz, K["buzzW"] - 0.03, -16, maxlen=0.6, fo=0.15)
    place(sent, K["addedW"], -10)
    place(boom, K["addedW"], -10, fo=0.6, maxlen=1.8)
    place(btn, K["nameW"], -12)
    place(riser, K["isYouW"] - 0.06 - len(riser) / SR, -18, fi=2.0, fo=0.004)
    place(shut_far, K["isYouW"] - 0.02, -12)
    place(boom, K["isYouW"], -8, fo=0.6, maxlen=2.2)
    place(stinger, K["behindW"] - 0.03, -11, fo=0.5, maxlen=1.2)
    place(boom, K["ownW"], -10, fo=0.6, maxlen=1.8)
    place(heartbeat, K["turn"], -11, fi=0.1, fo=0.4, maxlen=K["num"] - K["turn"] + 0.2)
    place(tick, K["yoursW"], -12); place(tick, K["roomW"], -13)
    place(boom, K["thirteenW"], -10, fo=0.6, maxlen=1.6)
    place(typing, K["typingW"] - 0.1, -13, fi=0.05, fo=0.3, maxlen=K["msg1W"] - K["typingW"] + 0.1)
    place(sent, K["msg1W"], -10); place(sent, K["msg2W"], -10)
    place(stinger, K["neverW"] - 0.03, -10, fo=0.5, maxlen=1.2)
    place(boom, K["neverW"], -8, fo=0.6, maxlen=2.0)
    place(creak_low, K["dev"] + 0.2, -16, fo=0.4, maxlen=1.4)
    place(typing, K["replyW"] - 0.1, -15, fo=0.3, maxlen=K["comingW"] - K["replyW"])
    place(sent, K["comingW"], -10)
    place(boom, K["ownNameW"], -14, fo=0.6, maxlen=1.4)
    place(stinger, K["yoursW2"] - 0.03, -10, fo=0.5, maxlen=1.4)
    place(boom, K["yoursW2"], -9, fo=0.6, maxlen=2.0)
    place(bolt, K["boltW"] + 0.05, -10); place(creak, K["openW"], -13, fo=0.4, maxlen=1.4)
    place(scrape, K["standW"] - 0.05, -8, fo=0.4)
    place(riser, K["onceW"] - 0.06 - len(riser) / SR, -18, fi=2.0, fo=0.004)
    place(boom, K["onceW"], -6, fo=0.6, maxlen=2.4)
    place(stairs, K["going"] - 0.1, -10, fi=0.2, fo=0.6, maxlen=K["type"] - K["going"] + 0.4)
    place(typing, K["type"] + 0.3, -15, fo=0.3, maxlen=K["choice"] - K["type"] - 0.3)
    place(boom, K["choice"] - 0.1, -16, fo=0.8, maxlen=2.5)
    place(tick, K["optA"], -12); place(tick, K["optB"], -12)
    place(tick, K["ctaA"], -14); place(tick, K["ctaB"], -14)
    return m1, hum


def part7():
    sent = load("sent.mp3"); typing = load("typing.mp3"); stairs = load("stairs.mp3"); btn = load("button.mp3")
    lights_off = load("lights_off.mp3"); door_slam = load("door_slam_wood.mp3")
    breath = load("whisper.mp3", "lowpass=f=900,asetrate=48000*0.8,aresample=48000")
    voice_far = load("whisper.mp3", "lowpass=f=700,asetrate=48000*0.7,aresample=48000,aecho=0.8:0.7:120|260:0.4|0.25")
    pen = noise_burst(0.5, 1500, 6000, 31, 0.02) * 0.4
    paper = noise_burst(0.6, 800, 5000, 41, 0.03) * 0.5
    run = load("stairs.mp3", "atempo=1.6")
    m1 = np.pad(load("music_p2.mp3"), ((0, N), (0, 0)))[:N] * automation([
        (0, -15), (K["type"], -17), (K["sentW"], -16), (K["n43W"], -12), (K["two"], -15), (K["rohan"], -17), (K["doesW"], -12),
        (K["dev"], -17), (K["outW"], -40), (K["stair"], -40), (K["stairW"], -20), (K["nameW"], -14), (K["againW"], -11),
        (K["run"], -13), (K["list"], -18), (K["hold"], -18), (K["wordsW"], -14), (K["twiceW"], -12), (K["leftW"], -11),
        (K["note"], -17), (K["findW"], -13), (K["steps"], -18), (K["downW"], -13), (K["choice"], -14), (DUR - 1.4, -14), (DUR, -40)])
    hum = bed("hum.mp3", "lowpass=f=900") * automation([(0, -13), (K["outW"], -13), (K["outW"] + 0.1, -40), (K["list"], -24), (DUR, -24)])
    place(boom, 0.05, -12, fo=0.8, maxlen=2.0)
    place(stinger, 0.0, -14, fo=0.5, maxlen=1.2)
    place(load("door_creak.mp3"), K["openW"] - 0.1, -12, fo=0.4, maxlen=1.4)
    place(typing, K["type"] + 0.1, -13, fi=0.05, fo=0.2, maxlen=K["sentW"] - K["type"] - 0.2)
    place(sent, K["sentW"], -9)
    place(sent, K["n43W"], -9)
    place(stinger, K["n43W"] - 0.03, -11, fo=0.5, maxlen=1.2)
    place(boom, K["sameSecW"], -10, fo=0.6, maxlen=1.8)
    place(boom, K["twoW"], -11, fo=0.6, maxlen=1.6)
    place(sent, K["realW"] - 0.3, -12); place(sent, K["arjun"] + 0.1, -12)
    place(breath, K["does"] - 0.1, -13, fi=0.2, fo=0.5, maxlen=1.6)
    place(stinger, K["doesW"] - 0.03, -10, fo=0.5, maxlen=1.4)
    place(boom, K["devDoorW"], -13, fo=0.6, maxlen=1.4)
    for i in range(5): place(lights_off, K["outW"] - 0.25 + (4 - i) * 0.12, -13 - i, maxlen=0.6, fo=0.2)
    place(boom, K["floorW"], -12, fo=0.8, maxlen=2.0)
    place(voice_far, K["stairW"], -14, fi=0.3, fo=0.6, maxlen=K["call"] - K["stairW"] + 0.4)
    place(pen, K["nameW"], -12)
    place(riser, K["againW"] - 0.06 - len(riser) / SR, -18, fi=2.0, fo=0.004)
    place(pen, K["againW"], -9); place(boom, K["againW"], -6, fo=0.6, maxlen=2.4)
    place(run, K["runW"] - 0.1, -9, fo=0.3, maxlen=K["list"] - K["runW"])
    place(door_slam, K["list"] - 0.05, -9, maxlen=1.2, fo=0.4)
    place(paper, K["listW"], -12)
    place(btn, K["lightW"], -11)
    place(heartbeat, K["dents"], -12, fi=0.1, fo=0.4, maxlen=K["rule"] - K["dents"] + 0.2)
    place(stinger, K["wordsW"] - 0.03, -12, fo=0.5, maxlen=1.2)
    place(boom, K["twiceW"], -9, fo=0.6, maxlen=1.8)
    place(boom, K["blockW"], -10, fo=0.6, maxlen=1.8)
    place(stinger, K["leftW"] - 0.03, -9, fo=0.5, maxlen=1.4); place(boom, K["leftW"], -7, fo=0.6, maxlen=2.2)
    place(breath, K["note"] + 0.2, -14, fi=0.2, fo=0.5, maxlen=1.8)
    place(boom, K["findW"], -10, fo=0.6, maxlen=1.8)
    place(stairs, K["steps"] - 0.1, -10, fi=0.3, fo=0.6, maxlen=K["choice"] - K["steps"])
    place(boom, K["downW"], -10, fo=0.6, maxlen=1.8)
    place(boom, K["choice"] - 0.1, -16, fo=0.8, maxlen=2.5)
    place(tick, K["optA"], -12); place(tick, K["optB"], -12)
    place(tick, K["ctaA"], -14); place(tick, K["ctaB"], -14)
    return m1, hum

def part8():
    stairs = load("stairs.mp3", "lowpass=f=1400"); lights_off = load("lights_off.mp3"); creak = load("door_creak.mp3")
    breath = load("whisper.mp3", "lowpass=f=900,asetrate=48000*0.8,aresample=48000")
    scratch = noise_burst(0.35, 2500, 9000, 51, 0.005) * 0.5
    pen = noise_burst(0.5, 1500, 6000, 31, 0.02) * 0.4
    paper = noise_burst(0.6, 800, 5000, 41, 0.03) * 0.5
    bolt = noise_burst(0.25, 400, 3000, 61, 0.004) * 0.6
    steps = load("stairs.mp3", "atempo=0.8,lowpass=f=1200")
    m1 = np.pad(load("music_p3.mp3"), ((0, N), (0, 0)))[:N] * automation([
        (0, -15), (K["stairs"], -17), (K["look"], -18), (K["findW"], -14), (K["wall"], -17), (K["hundW"], -14), (K["yourW"], -11),
        (K["same"], -16), (K["wroteW"], -11), (K["feet"], -18), (K["stopW"], -14), (K["door"], -17), (K["roomW"], -11),
        (K["last"], -15), (K["fitsW"], -11), (K["next"] - 0.2, -40), (DUR, -40)])
    m2 = np.pad(np.zeros((int(K["next"] * SR), 2), np.float32), ((0, 0), (0, 0)))
    m2 = np.concatenate([m2, load("music.mp3")])[:N]; m2 = np.pad(m2, ((0, max(0, N - len(m2))), (0, 0)))[:N]
    m2 = m2 * automation([(0, -40), (K["next"] - 0.05, -40), (K["next"] + 0.3, -15), (K["toreW"], -12), (K["rule"], -14),
                          (K["neverW"], -11), (K["walk"], -16), (K["hisW"], -11), (K["choice"], -14), (DUR - 1.4, -14), (DUR, -40)])
    hum = bed("hum.mp3", "lowpass=f=900") * automation([(0, -24), (K["stairs"], -17), (K["look"], -22), (K["next"], -14), (K["walk"] + 0.3, -14), (K["walk"] + 1.6, -40), (K["callW"], -22), (DUR, -22)])
    place(boom, 0.05, -12, fo=0.8, maxlen=2.0)
    place(stinger, 0.0, -14, fo=0.5, maxlen=1.2)
    place(stinger, K["sixW"] - 0.03, -12, fo=0.5, maxlen=1.2)
    place(steps, K["stepsW"] - 0.2, -11, fi=0.2, fo=0.6, maxlen=K["look"] - K["stepsW"] + 1.4)
    place(btn := load("button.mp3"), K["look"] + 0.2, -12)
    place(breath, K["note"] + 0.1, -14, fi=0.2, fo=0.5, maxlen=1.8)
    place(boom, K["findW"], -11, fo=0.6, maxlen=1.8)
    place(load("door_slam.mp3", "asetrate=48000*0.6,aresample=48000,lowpass=f=900"), K["wardW"] - 0.3, -12, fi=0.15, fo=0.4, maxlen=1.2)
    for i in range(6): place(scratch, K["hundW"] - 0.1 + i * 0.16, -14, maxlen=0.3)
    place(pen, K["nameW"] - 0.2, -13)
    place(riser, K["yourW"] - 0.06 - len(riser) / SR, -20, fi=1.5, fo=0.004)
    place(stinger, K["yourW"] - 0.03, -9, fo=0.5, maxlen=1.4); place(boom, K["yourW"], -8, fo=0.6, maxlen=2.0)
    place(heartbeat, K["handW"], -13, fi=0.1, fo=0.4, maxlen=K["wrote"] - K["handW"])
    place(tick, K["sevensW"], -12)
    place(stinger, K["wroteW"] - 0.03, -9, fo=0.5, maxlen=1.4); place(boom, K["wroteW"], -8, fo=0.6, maxlen=2.2)
    place(steps, K["feet"] - 0.6, -10, fi=0.1, fo=0.2, maxlen=K["stopW"] - K["feet"] + 0.6)
    place(boom, K["stopW"] + 0.05, -12, fo=0.6, maxlen=1.6)
    place(bolt, K["opensW"] - 0.35, -11)
    place(creak, K["opensW"] - 0.1, -10, fo=0.5, maxlen=1.8)
    place(paper, K["penW"] - 0.4, -13)
    place(load("stretch.mp3"), K["slidesW"] - 0.05, -14, fo=0.4, maxlen=1.0)
    place(stinger, K["roomW"] - 0.03, -9, fo=0.5, maxlen=1.4); place(boom, K["roomW"], -7, fo=0.6, maxlen=2.2)
    place(breath, K["last"] - 0.1, -13, fi=0.2, fo=0.5, maxlen=1.8)
    place(pen, K["takeW"] + 0.2, -12)
    place(riser, K["fitsW"] - 0.06 - len(riser) / SR, -18, fi=2.0, fo=0.004)
    place(boom, K["fitsW"], -6, fo=0.8, maxlen=2.6)
    place(ding_far, K["next"] + 0.05, -14, fo=0.6, maxlen=2.0)
    place(paper, K["list2W"], -12)
    for i in range(8): place(pen, K["scrW"] + i * (K["toreW"] - K["scrW"]) / 8, -12 + (i % 2) * 2, maxlen=0.35)
    place(noise_burst(0.5, 300, 4000, 71, 0.002) * 0.8, K["toreW"], -9)
    place(stinger, K["rule"] - 0.03, -10, fo=0.5, maxlen=1.4); place(boom, K["neverW"], -8, fo=0.6, maxlen=2.2)
    for i in range(5): place(lights_off, K["walk"] + 0.3 + (4 - i) * 0.25, -13 - i, maxlen=0.6, fo=0.2)
    place(steps, K["walk"] + 0.4, -12, fi=0.3, fo=0.4, maxlen=K["callW"] - K["walk"])
    place(stinger, K["hisW"] - 0.03, -9, fo=0.5, maxlen=1.4); place(boom, K["hisW"], -7, fo=0.6, maxlen=2.2)
    place(boom, K["choice"] - 0.1, -16, fo=0.8, maxlen=2.5)
    place(tick, K["optA"], -12); place(tick, K["optB"], -12)
    place(tick, K["ctaA"], -14); place(tick, K["ctaB"], -14)
    place(boom, K["newStory"], -12, fo=0.8, maxlen=2.4)
    return m1 + m2, hum


music, beds = {1: part1, 2: part2, 3: part3, 4: part4, 5: part5, 6: part6, 7: part7, 8: part8}[PART]()
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
