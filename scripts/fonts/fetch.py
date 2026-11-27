"""Download free fonts from Google's official repository (github.com/google/fonts) and package them.

  python3 scripts/fonts/fetch.py

For each family in families.json: reads METADATA.pb, downloads the TTF files and licence,
writes public/downloads/fonts/<slug>.zip and src/data/fonts.json. Every font is under the
SIL Open Font License, Apache 2.0 or Ubuntu Font Licence, all of which allow free use and sharing.
"""
import json, os, re, subprocess, sys, tempfile, urllib.parse, zipfile
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = "https://raw.githubusercontent.com/google/fonts/main"
OUT = os.path.join(ROOT, "public/downloads/fonts")
CACHE = os.path.join(tempfile.gettempdir(), "mypixelogs-fonts")
CATEGORY = {"SANS_SERIF": "Sans serif", "SERIF": "Serif", "DISPLAY": "Display", "HANDWRITING": "Script", "MONOSPACE": "Monospace"}
LICENSE = {"OFL": ("SIL Open Font License 1.1", "OFL.txt"), "APACHE2": ("Apache License 2.0", "LICENSE.txt"), "UFL": ("Ubuntu Font Licence 1.0", "UFL.txt")}
README = """{name}
{rule}
Designer: {designer}
Licence: {license}. Free for personal and commercial use, including print, logos and client work.
Source: Google Fonts (fonts.google.com/specimen/{spec}), downloaded from MyPixelogs (mypixelogs.netlify.app/assets/fonts/{slug}).

How to install
- Windows: right-click the .ttf file and choose "Install" (or "Install for all users").
- Mac: double-click the .ttf file, then click "Install Font".
Then restart Photoshop, Illustrator, Word or Canva desktop and pick "{name}" from the font list.
Files with [wght] in the name are variable fonts: one file holds every weight.
"""


def get(url, dest=None):
    args = ["curl", "-sfL", "--retry", "3", url]
    if dest:
        args += ["-o", dest]
    r = subprocess.run(args, capture_output=True)
    return r.returncode == 0 and (r.stdout.decode("utf-8", "replace") if not dest else True)


def slugify(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def fetch(name):
    folder = re.sub(r"[^a-z0-9]", "", name.lower())
    for lic_dir in ("ofl", "apache", "ufl"):
        meta = get(f"{RAW}/{lic_dir}/{folder}/METADATA.pb")
        if meta:
            break
    else:
        return {"name": name, "error": "not found"}
    field = lambda k: (re.search(rf'^{k}: "(.*)"', meta, re.M) or [None, ""])[1]
    fonts = re.findall(r'fonts \{(.*?)\n\}', meta, re.S)
    files, styles, regular = [], set(), None
    for block in fonts:
        fn = re.search(r'filename: "(.*?)"', block)[1]
        style = re.search(r'style: "(.*?)"', block)[1]
        weight = int(re.search(r'weight: (\d+)', block)[1])
        styles.add((weight, style))
        if style == "normal" and (regular is None or abs(weight - 400) < abs(regular[1] - 400)):
            regular = (fn, weight)
        if fn not in files:
            files.append(fn)
    axes = re.findall(r'axes \{\s*tag: "(\w+)"\s*min_value: ([\d.]+)\s*max_value: ([\d.]+)', meta)
    weights = sorted({w for w, _ in styles})
    wght = next(((float(a), float(b)) for t, a, b in axes if t == "wght"), None)
    if wght:
        weights = [w for w in range(100, 1000, 100) if wght[0] <= w <= wght[1]]
    italic = any(s == "italic" for _, s in styles)
    lic_name, lic_file = LICENSE.get(field("license"), ("SIL Open Font License 1.1", "OFL.txt"))
    slug = slugify(name)
    work = os.path.join(CACHE, slug)
    os.makedirs(work, exist_ok=True)
    for fn in files + [lic_file]:
        dest = os.path.join(work, fn)
        if not os.path.exists(dest) and not get(f"{RAW}/{lic_dir}/{folder}/{urllib.parse.quote(fn)}", dest):
            return {"name": name, "error": f"download failed: {fn}"}
    designer = field("designer")
    zpath = os.path.join(OUT, f"{slug}.zip")
    with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
        for fn in files:
            z.write(os.path.join(work, fn), f"{name}/{fn}")
        z.write(os.path.join(work, lic_file), f"{name}/{lic_file}")
        z.writestr(f"{name}/README.txt", README.format(name=name, rule="=" * len(name), designer=designer, license=lic_name, spec=name.replace(" ", "+"), slug=slug))
    subsets = [s for s in re.findall(r'^subsets: "(.*)"', meta, re.M) if s not in ("menu",)]
    return {
        "name": name, "slug": slug, "designer": designer, "category": CATEGORY.get(field("category"), "Display"),
        "license": lic_name, "weights": weights, "italic": italic, "variable": bool(axes),
        "scripts": subsets, "files": files, "sample": os.path.join(work, (regular or (files[0],))[0]),
        "size": os.path.getsize(zpath), "added": field("date_added"),
    }


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    names = json.load(open(os.path.join(ROOT, "scripts/fonts/families.json")))
    with ThreadPoolExecutor(8) as pool:
        results = list(pool.map(fetch, names))
    bad = [r for r in results if "error" in r]
    for r in bad:
        print("FAILED", r["name"], r["error"], file=sys.stderr)
    good = [r for r in results if "error" not in r]
    json.dump(good, open(os.path.join(CACHE, "fonts-full.json"), "w"), indent=1)
    print(f"{len(good)} fonts packaged, {sum(r['size'] for r in good) / 1e6:.1f} MB total")
