#!/usr/bin/env python3
"""Removes a photo's background and trims it: python3 scripts/flyers/cutout.py <in.jpg> <out.webp>
Needs: pip install "rembg[cpu]" (the first run downloads its model)."""
import sys

from PIL import Image
from rembg import new_session, remove

src, dst = sys.argv[1], sys.argv[2]
im = remove(Image.open(src).convert("RGB"), session=new_session("isnet-general-use"))
box = im.getchannel("A").point(lambda a: 255 if a > 12 else 0).getbbox()
if box:
    im = im.crop(box)
im.thumbnail((2000, 2000), Image.LANCZOS)
im.save(dst, quality=90, method=6)
# A magenta check image shows how clean the edges are.
check = Image.new("RGBA", im.size, (255, 0, 255, 255))
check.alpha_composite(im)
check.convert("RGB").resize((max(1, im.width // 3), max(1, im.height // 3))).save(dst.rsplit(".", 1)[0] + "-check.jpg")
print(f"{dst} {im.width}x{im.height}")
