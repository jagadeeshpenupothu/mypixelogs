#!/usr/bin/env python3
"""Prepares the images of a layered flyer (src/data/flyer-composites.json) from ChatGPT or free-licence files.

  python3 scripts/flyers/prepare_images.py <slug> --bg 006-1.png --hero 006-2.png [--extra 006-3.png ...] [--overlay 006-4.png ...]

Writes public/flyers/<slug>/bg.jpg (A4, 2480 x 3508), hero.webp, extra-<n>.webp and overlay-<n>.webp.
Cut-outs that came back on a plain background (ChatGPT often ignores "transparent") get their background
removed with rembg (pip install "rembg[cpu]"); every cut-out is trimmed to its visible pixels.
"""
import argparse
import os
import sys

from PIL import Image, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
A4 = (2480, 3508)
MAX_CUTOUT = 1800


def cover(im, size, focus="center"):
    s = max(size[0] / im.width, size[1] / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x = (im.width - size[0]) // 2
    y = {"top": 0, "bottom": im.height - size[1]}.get(focus, (im.height - size[1]) // 2)
    im = im.crop((x, y, x + size[0], y + size[1]))
    return im.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=3)) if s > 1.2 else im


def has_transparency(im):
    if im.mode != "RGBA":
        return False
    alpha = im.getchannel("A")
    lo, _ = alpha.getextrema()
    # Real cut-outs have a clearly transparent border; a few soft pixels don't count.
    return lo < 10 and sum(alpha.histogram()[:10]) > im.width * im.height * 0.05


_session = None


def cut_out(im):
    global _session
    if has_transparency(im):
        return im
    from rembg import new_session, remove  # imported only when needed

    if _session is None:
        _session = new_session("isnet-general-use")
    return remove(im.convert("RGB"), session=_session)


def trim(im, pad=8):
    box = im.getchannel("A").point(lambda a: 255 if a > 12 else 0).getbbox()
    if box:
        im = im.crop((max(0, box[0] - pad), max(0, box[1] - pad), min(im.width, box[2] + pad), min(im.height, box[3] + pad)))
    if max(im.size) > MAX_CUTOUT:
        im.thumbnail((MAX_CUTOUT, MAX_CUTOUT), Image.LANCZOS)
    return im


def main():
    p = argparse.ArgumentParser()
    p.add_argument("slug")
    p.add_argument("--bg", required=True)
    p.add_argument("--focus", default="center", choices=["top", "center", "bottom"])
    p.add_argument("--hero", required=True)
    p.add_argument("--extra", action="append", default=[])
    p.add_argument("--overlay", action="append", default=[])
    a = p.parse_args()

    out = os.path.join(ROOT, "public", "flyers", a.slug)
    os.makedirs(out, exist_ok=True)
    cover(Image.open(a.bg).convert("RGB"), A4, a.focus).save(os.path.join(out, "bg.jpg"), quality=86, optimize=True, progressive=True)
    print(f"bg.jpg  {A4[0]}x{A4[1]}")

    jobs = [("hero", a.hero)] + [(f"extra-{i + 1}", f) for i, f in enumerate(a.extra)]
    for name, f in jobs:
        im = trim(cut_out(Image.open(f).convert("RGBA")))
        im.save(os.path.join(out, f"{name}.webp"), quality=90, method=6)
        print(f"{name}.webp  {im.width}x{im.height}")
    for i, f in enumerate(a.overlay):
        im = Image.open(f).convert("RGBA")
        if not has_transparency(im):
            # An overlay on black (sparkles, light) becomes transparent by brightness.
            g = im.convert("L")
            im.putalpha(g.point(lambda v: min(255, v * 2)))
        cover(im, (1240, 1754)).save(os.path.join(out, f"overlay-{i + 1}.webp"), quality=88, method=6)
        print(f"overlay-{i + 1}.webp")


if __name__ == "__main__":
    sys.exit(main())
