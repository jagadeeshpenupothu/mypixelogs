export type GifInfo = {
  width: number;
  height: number;
  frames: number;
  /** Seconds each frame is shown. */
  delays: number[];
  duration: number;
  hasTransparency: boolean;
};

/** Reads an animated GIF's structure. Returns null when it is not a readable GIF. */
export function parseGif(data: Uint8Array): GifInfo | null {
  if (data.length < 14 || !/^GIF8[79]a$/.test(String.fromCharCode(...data.subarray(0, 6)))) return null;
  const width = data[6] | (data[7] << 8);
  const height = data[8] | (data[9] << 8);
  if (width === 0 || height === 0) return null;
  const tableSize = (flags: number) => (flags & 0x80 ? 3 * 2 ** ((flags & 7) + 1) : 0);
  let at = 13 + tableSize(data[10]);
  const delays: number[] = [];
  let delay = 10;
  let hasTransparency = false;

  const skipBlocks = () => {
    while (at < data.length && data[at] !== 0) at += data[at] + 1;
    at += 1;
  };

  while (at < data.length) {
    const kind = data[at];
    if (kind === 0x3b) break;
    if (kind === 0x21) {
      if (data[at + 1] === 0xf9) {
        if (data[at + 3] & 1) hasTransparency = true;
        delay = data[at + 4] | (data[at + 5] << 8);
      }
      at += 2;
      skipBlocks();
    } else if (kind === 0x2c) {
      at += 10 + tableSize(data[at + 9]) + 1;
      if (at >= data.length) break;
      skipBlocks();
      // Browsers and FFmpeg both show frames without a usable delay for a tenth of a second.
      delays.push((delay < 2 ? 10 : delay) / 100);
      delay = 10;
    } else break;
  }
  if (delays.length === 0) return null;
  return {
    width,
    height,
    frames: delays.length,
    delays,
    duration: delays.reduce((sum, value) => sum + value, 0),
    hasTransparency,
  };
}

/** The lowest smooth frame rate that shows every frame at its own time. */
export function exactRate({ delays }: GifInfo): { text: string; value: number } {
  const divide = (a: number, b: number): number => (b === 0 ? a : divide(b, a % b));
  const unit = Math.max(2, delays.map((delay) => Math.round(delay * 100)).reduce(divide));
  // Very slow animations get repeated frames, because players handle them better.
  const repeat = Math.max(1, Math.ceil((10 * unit) / 100));
  const value = (100 * repeat) / unit;
  return { text: `${100 * repeat}/${unit}`, value };
}
