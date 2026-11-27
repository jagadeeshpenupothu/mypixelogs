"""Adds a waveform ("peaks": 0-100 per bar) to every music preview and sound effect.

  python3 scripts/audio/peaks.py

Reads the MP3s in public/, writes the peaks into src/data/music.json and src/data/sfx.json.
"""
import array, json, os, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BARS = 96


def peaks(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", "8000", "-f", "s16le", "-"], capture_output=True, check=True).stdout
    s = array.array("h", raw)
    n = max(1, len(s) // BARS)
    vals = [max((abs(x) for x in s[i * n:(i + 1) * n]), default=0) for i in range(BARS)]
    top = max(vals) or 1
    # Square-root scale so quiet parts stay visible, as audio sites draw them.
    return [max(4, round((v / top) ** 0.6 * 100)) for v in vals]


for name, key in (("music", "preview"), ("sfx", "file")):
    p = os.path.join(ROOT, f"src/data/{name}.json")
    items = json.load(open(p))
    for it in items:
        it["peaks"] = peaks(os.path.join(ROOT, "public" + it[key]))
    with open(p, "w") as f:
        f.write("[\n" + ",\n".join(json.dumps(it, ensure_ascii=False, separators=(",", ":")) for it in items) + "\n]\n")
    print(name, len(items), os.path.getsize(p) // 1024, "KB")
