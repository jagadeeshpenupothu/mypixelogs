import { PDFDocument } from "pdf-lib";

import { canvasToBlob } from "@/lib/pdf/render";

/** Reads the EXIF orientation of a JPG (1 means upright). Phones often save photos sideways with this flag. */
export function jpegOrientation(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return 1;
  let offset = 2;
  while (offset + 4 < view.byteLength) {
    const marker = view.getUint16(offset);
    const size = view.getUint16(offset + 2);
    if (marker === 0xffe1 && view.getUint32(offset + 4) === 0x45786966) {
      const tiff = offset + 10;
      if (tiff + 8 > view.byteLength) return 1;
      const little = view.getUint16(tiff) === 0x4949;
      const ifd = tiff + view.getUint32(tiff + 4, little);
      if (ifd + 2 > view.byteLength) return 1;
      const count = view.getUint16(ifd, little);
      for (let i = 0; i < count; i += 1) {
        const entry = ifd + 2 + i * 12;
        if (entry + 10 > view.byteLength) return 1;
        if (view.getUint16(entry, little) === 0x0112) return view.getUint16(entry + 8, little);
      }
      return 1;
    }
    if ((marker & 0xff00) !== 0xff00 || marker === 0xffda) return 1;
    offset += 2 + size;
  }
  return 1;
}

export type PreparedImage = { kind: "jpg" | "png"; bytes: Uint8Array; width: number; height: number };

/**
 * Gets an image ready to place in a PDF. Upright JPGs and PNGs go in untouched,
 * so they keep their full quality. Anything else is redrawn the right way up.
 */
export async function prepareImage(file: File): Promise<PreparedImage> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = file.type || (file.name.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg");

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(new Blob([bytes], { type }));
  } catch {
    throw new Error(`${file.name} could not be opened as a picture.`);
  }
  const { width, height } = bitmap;

  if (type === "image/jpeg" && jpegOrientation(bytes) === 1) {
    bitmap.close();
    return { kind: "jpg", bytes, width, height };
  }
  if (type === "image/png") {
    bitmap.close();
    return { kind: "png", bytes, width, height };
  }

  // Sideways JPGs, WebP, GIF, BMP: the browser has already turned the picture upright.
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not draw this picture.");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0);
  bitmap.close();
  const blob = await canvasToBlob(canvas, "image/jpeg", 0.92);
  return { kind: "jpg", bytes: new Uint8Array(await blob.arrayBuffer()), width, height };
}

export type PageSize = "fit" | "a4" | "letter";
export type Orientation = "auto" | "portrait" | "landscape";
export type Margin = 0 | 18 | 36;

const sizes = { a4: [595.28, 841.89], letter: [612, 792] } as const;

export async function imagesToPdf(
  images: PreparedImage[],
  options: { size: PageSize; orientation: Orientation; margin: Margin },
) {
  const pdf = await PDFDocument.create();
  for (const image of images) {
    const embedded = image.kind === "jpg" ? await pdf.embedJpg(image.bytes) : await pdf.embedPng(image.bytes);
    // Pictures are 96 pixels per inch on screen; PDF pages use 72 points per inch.
    const naturalW = (image.width * 72) / 96;
    const naturalH = (image.height * 72) / 96;

    let pageW: number;
    let pageH: number;
    if (options.size === "fit") {
      pageW = naturalW + options.margin * 2;
      pageH = naturalH + options.margin * 2;
    } else {
      const [shortSide, longSide] = sizes[options.size];
      const landscape = options.orientation === "landscape" || (options.orientation === "auto" && image.width > image.height);
      pageW = landscape ? longSide : shortSide;
      pageH = landscape ? shortSide : longSide;
    }

    const boxW = pageW - options.margin * 2;
    const boxH = pageH - options.margin * 2;
    const scale = options.size === "fit" ? 1 : Math.min(boxW / naturalW, boxH / naturalH);
    const drawW = naturalW * scale;
    const drawH = naturalH * scale;

    const page = pdf.addPage([pageW, pageH]);
    page.drawImage(embedded, { x: (pageW - drawW) / 2, y: (pageH - drawH) / 2, width: drawW, height: drawH });
  }
  return pdf.save({ useObjectStreams: true });
}
