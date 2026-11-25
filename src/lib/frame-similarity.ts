type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;

function luma(canvas: AnyCanvas): Float32Array {
  const context = canvas.getContext("2d", { willReadFrequently: true }) as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null;
  if (!context) throw new Error("Frames cannot be read in this browser.");
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  return lumaFromPixels(data);
}

export function lumaFromPixels(data: Uint8ClampedArray): Float32Array {
  const result = new Float32Array(data.length / 4);
  for (let i = 0, p = 0; i < result.length; i += 1, p += 4) {
    result[i] = 0.2126 * data[p] + 0.7152 * data[p + 1] + 0.0722 * data[p + 2];
  }
  return result;
}

/** SSIM over 8x8 blocks, every 4 pixels. 1 means the frames look the same. */
export function ssim(a: Float32Array, b: Float32Array, width: number, height: number): number {
  const c1 = (0.01 * 255) ** 2;
  const c2 = (0.03 * 255) ** 2;
  let total = 0;
  let blocks = 0;
  for (let y = 0; y + 8 <= height; y += 4) {
    for (let x = 0; x + 8 <= width; x += 4) {
      let sa = 0;
      let sb = 0;
      let saa = 0;
      let sbb = 0;
      let sab = 0;
      for (let j = 0; j < 8; j += 1) {
        let k = (y + j) * width + x;
        for (let i = 0; i < 8; i += 1, k += 1) {
          const va = a[k];
          const vb = b[k];
          sa += va;
          sb += vb;
          saa += va * va;
          sbb += vb * vb;
          sab += va * vb;
        }
      }
      const ma = sa / 64;
      const mb = sb / 64;
      const variances = saa / 64 - ma * ma + (sbb / 64 - mb * mb);
      const covariance = sab / 64 - ma * mb;
      total += ((2 * ma * mb + c1) * (2 * covariance + c2)) / ((ma * ma + mb * mb + c1) * (variances + c2));
      blocks += 1;
    }
  }
  return blocks === 0 ? 1 : total / blocks;
}

export function frameSimilarity(a: AnyCanvas, b: AnyCanvas): number {
  if (a.width !== b.width || a.height !== b.height) throw new Error("Frames have different sizes.");
  return ssim(luma(a), luma(b), a.width, a.height);
}
