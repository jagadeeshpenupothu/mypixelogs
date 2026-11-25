export type CropBox = { x: number; y: number; w: number; h: number };
export type CropHandle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export const MIN_CROP = 16;

const clamp = (value: number, low: number, high: number) => Math.min(Math.max(value, low), Math.max(low, high));
const even = (value: number) => Math.round(value / 2) * 2;
const floorEven = (value: number) => Math.floor(value / 2) * 2;

/** Whole, even pixels inside the picture: H.264 video cannot hold odd sizes. */
export function tidy(box: CropBox, width: number, height: number): CropBox {
  const w = clamp(even(box.w), MIN_CROP, floorEven(width));
  const h = clamp(even(box.h), MIN_CROP, floorEven(height));
  return { w, h, x: clamp(even(box.x), 0, floorEven(width - w)), y: clamp(even(box.y), 0, floorEven(height - h)) };
}

/** The largest box of a shape, as close to a centre point as the picture allows. */
export function largestBox(ratio: number, width: number, height: number, centre = { x: width / 2, y: height / 2 }): CropBox {
  const w = Math.min(width, height * ratio);
  const h = w / ratio;
  return tidy(
    { w, h, x: clamp(centre.x - w / 2, 0, width - w), y: clamp(centre.y - h / 2, 0, height - h) },
    width,
    height,
  );
}

export function moveBox(box: CropBox, dx: number, dy: number, width: number, height: number): CropBox {
  return tidy(
    { ...box, x: clamp(box.x + dx, 0, width - box.w), y: clamp(box.y + dy, 0, height - box.h) },
    width,
    height,
  );
}

/** Drags one handle while the opposite side stays where it is. */
export function resizeBox(
  start: CropBox,
  handle: CropHandle,
  dx: number,
  dy: number,
  ratio: number | null,
  width: number,
  height: number,
): CropBox {
  const west = handle.includes("w");
  const east = handle.includes("e");
  const north = handle.includes("n");
  const south = handle.includes("s");
  const right = start.x + start.w;
  const bottom = start.y + start.h;
  const centreX = start.x + start.w / 2;
  const centreY = start.y + start.h / 2;
  const roomX = west ? right : east ? width - start.x : 2 * Math.min(centreX, width - centreX);
  const roomY = north ? bottom : south ? height - start.y : 2 * Math.min(centreY, height - centreY);

  let w = start.w + (east ? dx : west ? -dx : 0);
  let h = start.h + (south ? dy : north ? -dy : 0);
  if (ratio === null) {
    if (east || west) w = clamp(w, MIN_CROP, roomX);
    if (north || south) h = clamp(h, MIN_CROP, roomY);
  } else {
    if (north || south) {
      if (east || west) w = Math.max(w, h * ratio);
      else w = h * ratio;
    }
    const smallest = Math.max(MIN_CROP, MIN_CROP * ratio);
    w = clamp(w, Math.min(smallest, roomX), Math.min(roomX, roomY * ratio));
    h = w / ratio;
  }
  w = floorEven(w + 1e-6);
  h = floorEven(h + 1e-6);
  return tidy(
    {
      w,
      h,
      x: west ? right - w : east || ratio === null ? start.x : centreX - w / 2,
      y: north ? bottom - h : south || ratio === null ? start.y : centreY - h / 2,
    },
    width,
    height,
  );
}
