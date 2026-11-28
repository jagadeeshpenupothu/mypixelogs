#!/usr/bin/env python3
"""Prepares OpenAI-generated images for a flyer, with a natural photographic finish.

  python3 scripts/flyers/prep_ai.py <in> <out.jpg>   photo or background: upscaled to 2160 px wide
  python3 scripts/flyers/prep_ai.py <in> <out.webp>  cut-out (transparent PNG in): trimmed to the subject, upscaled 1.4x
  add --no-finish to skip the finish (e.g. for flat graphics)

The finish takes away the "AI look": slightly softer highlights and contrast, a touch less saturation, a gentle
warm/cool split tone and fine film grain, like a real camera photo. Prints the size and aspect ratio."""
import sys

import numpy as np
from PIL import Image, ImageFilter

src, dst = sys.argv[1], sys.argv[2]
finish = "--no-finish" not in sys.argv


def natural(rgb):
    a = np.asarray(rgb).astype(np.float32) / 255.0
    lum = a.mean(axis=2, keepdims=True)
    a = lum + (a - lum) * 0.9                       # a little less saturation
    a = 0.03 + a * 0.94                             # lifted blacks, softer highlights
    a = a + (a - 0.5) * -0.04                       # slightly lower contrast
    shadows = np.clip(0.5 - lum, 0, 0.5) * 2
    highlights = np.clip(lum - 0.5, 0, 0.5) * 2
    a[:, :, 2] += shadows[:, :, 0] * 0.012          # cool shadows
    a[:, :, 0] += highlights[:, :, 0] * 0.012       # warm highlights
    rng = np.random.default_rng(7)
    grain = rng.normal(0, 0.018, a.shape[:2])[:, :, None]
    a = a + grain * (0.6 + 0.4 * (1 - np.abs(lum - 0.5) * 2))  # film grain, strongest in mid-tones
    return Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8), "RGB")


im = Image.open(src)
if im.mode == "RGBA" and im.getchannel("A").getextrema()[0] < 250:
    im = im.crop(im.getchannel("A").point(lambda v: 255 if v > 10 else 0).getbbox())
    im = im.resize((int(im.width * 1.4), int(im.height * 1.4)), Image.LANCZOS)
    if finish:
        alpha = im.getchannel("A")
        im = natural(im.convert("RGB")).convert("RGBA")
        im.putalpha(alpha)
    im.save(dst, quality=92, method=6)
else:
    im = im.convert("RGB")
    s = 2160 / im.width
    im = im.resize((2160, round(im.height * s)), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 40, 3))
    if finish:
        im = natural(im)
    im.save(dst, quality=88, optimize=True, progressive=True)
print(f"{dst} {im.width}x{im.height} aspect {im.width / im.height:.3f}")
