"""FLOOR 0 — sound mix for one part:  python mix.py <part>

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


def part1():
    F0, F1 = K["flash"], K["slamStart"]
    music = np.pad(load("music.mp3"), ((0, N), (0, 0)))[:N] * automation([
        (0, -20), (K["zero"], -20), (K["zero"] + 0.3, -15), (K["interiorStart"], -15), (K["lights"], -12),
        (K["smile"] - 0.15, -12), (K["smile"] - 0.02, -26), (F0 - 0.02, -26), (F0, -80), (F1 + 0.35, -80), (F1 + 0.6, -14), (K["aloneStart"], -14),
        (K["aloneStart"] + 0.3, -20), (K["dingBack"], -20), (K["dingBack"] + 0.3, -12), (K["choice"], -11),
        (DUR - 1.4, -13), (DUR, -40)])
    hum = bed("hum.mp3") * automation([
        (0, -2), (K["phoneStart"], -2), (K["phoneStart"] + 0.05, -9), (K["tooLate"], -9), (K["tooLate"] + 0.05, -2),
        (K["typingStart"], -2), (K["typingStart"] + 0.05, -9), (F0, -9), (F0 + 0.01, -80), (F1, -80), (F1 + 0.05, 0),
        (K["lockStart"], 0), (K["lockStart"] + 0.05, -9), (K["aloneStart"], -9), (K["aloneStart"] + 0.05, 1), (DUR, -6)]) * db(2)
    place(motor_down, 0.0, -10, fi=0.02, fo=0.6, maxlen=K["zero"] + 0.1)
    place(ding, K["zero"] - 0.04, 1)
    place(boom, K["zero"] + 0.25, -15, fo=0.5)
    place(door_open, K["doorOpen0"] - 0.1, 1, fo=0.4)
    place(buzz, K["buzz"] - 0.03, -22, maxlen=1.0, fo=0.15)
    place(tick, K["msg1"] - 0.02, -2)
    place(boom, K["tooLate"] + 0.02, -15, fo=0.6)
    place(heartbeat, K["tooLate"] + 0.15, -17, fi=0.3, fo=1.2, maxlen=6.5)
    place(whisper, K["interiorStart"] + 0.2, -14, fi=0.8, fo=1.2)
    place(tick_soft, K["notMoving"] + 0.35, -6)
    place(tick_soft, K["lights"] - 0.04, -3)
    place(riser, K["smile"] - 0.06 - len(riser) / SR, -15, fi=2.5, fo=0.004)
    place(tick, K["smile"] - 0.27, -6)
    place(shutter, F0 - 0.03, 1, fo=0.3)
    place(stinger, F0 + 0.01, -7, fo=0.3, maxlen=0.9)
    place(boom, F0 + 0.02, -10, fo=0.4, maxlen=0.9)
    place(slam, K["slam"] - 0.01, -5)
    place(boom, K["slam"] + 0.02, -14, fo=0.6)
    place(motor, K["upStart"] + 0.25, -9, fi=0.4, fo=0.4, maxlen=K["eight"] - K["upStart"] + 0.2)
    for tc in K["floorChanges"]:
        if K["upStart"] < tc <= K["eight"] + 0.05 or K["aloneStart"] < tc < K["dingBack"]:
            place(tick_soft, tc, -12)
    place(ding_far, K["eight"] + 0.02, 0)
    place(buzz, K["notif"] - 0.03, -22, maxlen=1.0, fo=0.15)
    place(boom, K["unlocked"], -17, fo=0.5)
    place(stinger, K["face"] - 0.02, -12, fo=0.6)
    place(heartbeat, K["aloneStart"] + 0.05, -15, fi=0.4, fo=0.8, maxlen=K["dingBack"] - K["aloneStart"])
    place(motor_down, K["aloneStart"] + 0.55, -15, fi=0.3, fo=0.3, maxlen=K["dingBack"] - K["aloneStart"] - 0.5)
    place(ding, K["dingBack"] - 0.03, 3)
    place(boom, K["dingBack"], -11, fo=0.5)
    place(door_open, K["doorBack0"] - 0.1, 1, fo=0.4)
    place(boom, K["floorZero"], -18, fo=0.5)
    place(whisper, K["empty"] - 0.3, -15, fi=0.4, fo=0.8, maxlen=2.0)
    place(boom, K["choice"] - 0.1, -16, fo=0.8, maxlen=2.5)
    return music, hum


def part2():
    stairs = load("stairs.mp3", "aecho=0.8:0.5:60|120:0.3|0.2"); steps = load("stairs.mp3", "lowpass=f=1400")
    creak = load("door_creak.mp3"); slam_w = load("door_slam_wood.mp3"); denied = load("lock_denied.mp3")
    lights_off = load("lights_off.mp3"); smile_st = load("smile_stinger.mp3")
    music = np.pad(load("music_p2.mp3"), ((0, N), (0, 0)))[:N] * automation([
        (0, -17), (K["stairs"], -15), (K["gap"], -13), (K["chat"], -18), (K["push"], -12),
        (K["smiled"] - 0.7, -13), (K["smiled"] - 0.5, -28), (K["smiled"] + 0.05, -11), (K["slam"], -12),
        (K["alone"], -15), (K["hall"], -12), (K["rule"], -10), (DUR - 1.2, -13), (DUR, -40)])
    hum = bed("hum.mp3") * automation([
        (0, -2), (K["stairs"], -2), (K["stairs"] + 0.05, -14), (K["corridor"], -14), (K["corridor"] + 0.05, -4),
        (K["gap"], -4), (K["gap"] + 0.05, -14), (K["phone"], -14), (K["push"], -14), (K["alone"], -6),
        (K["alone"] + 1.3, -6), (K["alone"] + 1.5, -60), (DUR, -60)])
    tv_auto = automation([(0, -80), (K["corridor"], -80), (K["corridor"] + 0.1, -26), (K["door8c"], -20), (K["gap"], -11),
                          (K["phone"], -18), (K["push"], -13), (K["pushOpen"] + 0.3, -8), (K["slam"] + 0.02, -8),
                          (K["slam"] + 0.06, -30), (K["lock"], -40), (K["alone"], -34), (K["alone"] + 0.5, -80), (DUR, -80)])
    tv = bed("tv.mp3") * tv_auto
    # recap
    place(ding_far, 0.02, -4)
    place(shutter, K["recapB"], -10, fo=0.3)
    place(boom, K["recapB"] + 0.02, -14, fo=0.4, maxlen=0.8)
    place(tick, K["recapC"] + 0.05, -10)
    place(boom, K["lobby"] - 0.15, -18, fo=0.6, maxlen=1.5)
    # walk + climb
    place(steps, K["turn"] + 0.25, -16, fi=0.1, fo=0.3, maxlen=K["stairs"] - K["turn"])
    place(stairs, K["stairs"], -7, fi=0.05, fo=0.4, maxlen=K["corridor"] - K["stairs"] + 0.1)
    place(steps, K["corridor"], -18, fi=0.1, fo=0.4, maxlen=1.6)
    # phone from "Me"
    place(buzz, K["buzz"] - 0.03, -25, maxlen=1.0, fo=0.15)
    place(tick, K["msg"] - 0.02, -2)
    # the door, the turn, the grin
    place(creak, K["pushOpen"] - 0.1, -1, fo=0.3)
    place(whisper, K["turn2"] - 0.1, -14, fi=0.2, fo=0.5, maxlen=1.6)
    place(boom, K["itsYou"] + 0.02, -15, fo=0.6)
    place(heartbeat, K["itsYou"], -17, fi=0.2, fo=0.6, maxlen=K["smiled"] - K["itsYou"] - 0.4)
    pk = peak_time(smile_st)
    place(smile_st, K["smileEnd"] + 0.04 - pk, -6, fo=0.4)
    place(slam_w, K["slam"] - 0.03, -6)
    place(boom, K["slam"] + 0.02, -12, fo=0.6)
    # smart lock refuses you
    place(buzz, K["lock"] + 0.12, -22, maxlen=0.6, fo=0.12)
    place(denied, K["unrec"] - 0.05, -4)
    place(boom, K["unrec"], -16, fo=0.5)
    # lights out, the elevator opens
    place(lights_off, K["alone"] + 0.25, -10, fo=0.4)
    place(ding, K["ding"], 3)
    place(door_open, K["ding"] + 0.25, 1, fo=0.4)
    place(heartbeat, K["lit"], -21, fi=0.3, fo=0.8, maxlen=K["rule"] - K["lit"])
    place(boom, K["zero"], -18, fo=0.5)
    place(boom, K["eight"] + 0.05, -17, fo=0.5)
    place(boom, K["rule"] + 0.05, -14, fo=0.8, maxlen=2.5)
    return music, hum + tv


def part3():
    button = load("button.mp3"); descent = load("descent.mp3"); crowd = load("crowd.mp3")
    typing = load("typing.mp3"); sent = load("sent.mp3"); stretch = load("stretch.mp3")
    music = np.pad(load("music_p3.mp3"), ((0, N), (0, 0)))[:N] * automation([
        (0, -18), (K["goDown"], -14), (K["ding"], -13), (K["full"], -10), (K["buzzShot"], -16), (K["rises"], -12),
        (K["lookOut"], -10), (K["send2"] - 0.25, -12), (K["send2"] - 0.1, -28), (K["flash"] - 0.02, -28),
        (K["flash"], -80), (K["rule"] + 0.2, -80), (K["rule"] + 0.6, -15), (K["loop"], -22), (DUR, -40)])
    hum = bed("hum.mp3", "lowpass=f=900") * automation([
        (0, -6), (K["ding"], -6), (K["open0"], -6), (K["open0"] + 0.3, -60), (DUR, -60)])
    hum += bed("hum.mp3", "highpass=f=1500") * automation([
        (0, -80), (K["open0"], -80), (K["open0"] + 0.4, -6), (K["buzzShot"], -6), (K["buzzShot"] + 0.05, -14),
        (K["rises"], -14), (K["rises"] + 0.05, -80), (DUR, -80)])
    hum += bed("hum.mp3") * automation([(0, -80), (K["lookOut"], -80), (K["lookOut"] + 0.05, -2), (K["flash"], -2), (K["flash"] + 0.01, -80), (K["loop"], -80), (K["loop"] + 0.05, -2), (DUR, -2)])
    crowd_bed = bed("crowd.mp3") * automation([(0, -80), (K["full"], -80), (K["full"] + 0.05, -9), (K["buzzShot"], -9), (K["buzzShot"] + 0.3, -18), (K["rises"], -18), (K["rises"] + 0.3, -80), (DUR, -80)])
    place(button, K["press"], 2)
    place(door_open, K["doorsClose"] - 0.1, 0, fo=0.4)
    place(descent, K["goDown"] - 0.2, -9, fi=0.3, fo=0.5, maxlen=K["ding"] - K["goDown"] + 0.3)
    place(motor_down, K["down2"], -14, fi=0.2, fo=0.4, maxlen=K["ding"] - K["down2"])
    place(ding, K["ding"], 0)
    place(door_open, K["open0"], -4, fo=0.4)
    place(boom, K["open0"] + 0.15, -11, fo=0.6)
    place(stinger, K["full"] - 0.02, -14, fo=0.4)
    place(boom, K["full"], -15, fo=0.6)
    place(boom, K["tall"] + 0.05, -18, fo=0.6)
    place(stretch, K["taller"] + 0.6, -2, fo=0.4)
    place(stretch, K["tallerWord"] - 0.4, -4, fo=0.5)
    place(buzz, K["buzz"] - 0.03, -22, maxlen=1.0, fo=0.15)
    t0, t1 = K["type0"], K["send1"] - 0.25
    while t0 < t1:
        place(typing, t0, -8, maxlen=min(len(typing) / SR, t1 - t0), fo=0.05); t0 += len(typing) / SR
    place(sent, K["send1"] - 0.02, -3)
    place(motor, K["rises"] + 0.1, -9, fi=0.4, fo=0.5, maxlen=K["lobbyDing"] - K["rises"])
    place(heartbeat, K["rises"], -15, fi=0.3, fo=0.6, maxlen=K["lobbyDing"] - K["rises"])
    place(ding, K["lobbyDing"], 2)
    place(door_open, K["lobbyDing"] + 0.25, 0, fo=0.4)
    place(typing, K["type2a"], -8, maxlen=K["send2"] - 0.35 - K["type2a"], fo=0.05)
    place(sent, K["send2"] + 0.05, -9)
    F0 = K["flash"]
    place(shutter, F0 - 0.03, 1, fo=0.3)
    place(stinger, F0 + 0.01, -7, fo=0.3, maxlen=0.9)
    place(boom, F0 + 0.02, -10, fo=0.4, maxlen=0.9)
    place(boom, K["rule"] + 0.25, -14, fo=0.8, maxlen=2.5)
    place(motor_down, K["loop"], -10, fi=0.02, fo=0.4)
    return music, hum + crowd_bed


music, beds = {1: part1, 2: part2, 3: part3}[PART]()
music = music * duck_gain
beds = beds * duck_gain
mix = vo2 + music + beds + sfx
np.save(str(OUT / "stems.npy"), np.stack([vo2[:, 0], music[:, 0], beds[:, 0], sfx[:, 0]]))
peak = float(np.max(np.abs(mix)))
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix = mix[: int(DUR * SR)]
wwav(OUT / "mix_pre.wav", mix, 2)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(OUT / "mix_pre.wav"), "-af",
                "loudnorm=I=-14:TP=-1.2:LRA=11", "-ar", str(SR), str(OUT / "mix.wav")], check=True)
print(f"part {PART} mix written; pre-limit peak {peak:.3f}")
