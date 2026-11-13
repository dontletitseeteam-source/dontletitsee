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


music, beds = {1: part1, 2: part2, 3: part3}[PART]()
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
