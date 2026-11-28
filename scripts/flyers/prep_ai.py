#!/usr/bin/env python3
"""Prepares OpenAI-generated images for a flyer.

  python3 scripts/flyers/prep_ai.py <in> <out>      background (JPEG out): upscaled to 2160 px wide, sharpened
  python3 scripts/flyers/prep_ai.py <in> <out.webp> cut-out (transparent PNG in): trimmed to the subject, upscaled 1.4x

Prints the output size and aspect ratio (width / height) to place it in the SVG."""
import sys

from PIL import Image, ImageFilter

src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src)
if im.mode == "RGBA" and im.getchannel("A").getextrema()[0] < 250:
    im = im.crop(im.getchannel("A").point(lambda a: 255 if a > 10 else 0).getbbox())
    im = im.resize((int(im.width * 1.4), int(im.height * 1.4)), Image.LANCZOS)
    im.save(dst, quality=92, method=6)
else:
    im = im.convert("RGB")
    s = 2160 / im.width
    im = im.resize((2160, round(im.height * s)), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 50, 3))
    im.save(dst, quality=88, optimize=True, progressive=True)
print(f"{dst} {im.width}x{im.height} aspect {im.width / im.height:.3f}")
