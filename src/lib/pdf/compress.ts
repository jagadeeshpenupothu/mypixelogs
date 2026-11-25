/**
 * Makes PDFs smaller in the browser.
 *
 * "Keep text" levels shrink only the photos inside the PDF: each photo is
 * redrawn smaller and saved as a lighter JPG. Text, lines and fonts are not
 * touched, so they stay sharp and can still be selected and searched.
 *
 * The "pages as pictures" level redraws every page as one JPG. It makes the
 * smallest files, but the text can no longer be selected.
 */
import { PDFArray, PDFDict, PDFDocument, PDFName, PDFNumber, PDFRawStream, PDFRef } from "pdf-lib";

import { loadPdf } from "@/lib/pdf/common";
import { canvasToBlob, closePdf, openPdfForDrawing, renderPage } from "@/lib/pdf/render";

export type CompressLevel = "light" | "medium" | "strong" | "pictures";

const settings: Record<Exclude<CompressLevel, "pictures">, { quality: number; maxSide: number; includeLossless: boolean }> = {
  light: { quality: 0.8, maxSide: 2400, includeLossless: false },
  medium: { quality: 0.65, maxSide: 1700, includeLossless: true },
  strong: { quality: 0.5, maxSide: 1200, includeLossless: true },
};

export type CompressResult = { bytes: Uint8Array; imagesShrunk: number; imagesFound: number };

type Progress = (done: number, total: number) => void;

export async function compressPdf(file: File, level: CompressLevel, onProgress?: Progress): Promise<CompressResult> {
  if (level === "pictures") return pagesAsPictures(file, onProgress);

  const { quality, maxSide, includeLossless } = settings[level];
  const pdf = await loadPdf(file);
  const context = pdf.context;
  const objects = context.enumerateIndirectObjects();

  // Masks control see-through areas; turning them into JPGs would spoil them.
  const masks = new Set<string>();
  for (const [, object] of objects) {
    if (!(object instanceof PDFRawStream)) continue;
    for (const key of ["SMask", "Mask"]) {
      const value = object.dict.get(PDFName.of(key));
      if (value instanceof PDFRef) masks.add(value.toString());
    }
  }

  const candidates = objects.filter(([ref, object]) => object instanceof PDFRawStream && isPhoto(object, masks.has(ref.toString()), includeLossless));
  let shrunk = 0;

  for (const [index, [ref, object]] of candidates.entries()) {
    onProgress?.(index, candidates.length);
    const stream = object as PDFRawStream;
    try {
      const replacement = await shrinkImage(stream, quality, maxSide);
      if (replacement) {
        context.assign(ref, replacement);
        shrunk += 1;
      }
    } catch {
      // A photo the browser cannot read stays as it was.
    }
  }
  onProgress?.(candidates.length, candidates.length);

  const bytes = await pdf.save({ useObjectStreams: true });
  return { bytes, imagesShrunk: shrunk, imagesFound: candidates.length };
}

function nameOf(dict: PDFDict, key: string) {
  const value = dict.lookup(PDFName.of(key));
  return value instanceof PDFName ? value.asString() : null;
}

function filterOf(dict: PDFDict) {
  const value = dict.lookup(PDFName.of("Filter"));
  if (value instanceof PDFName) return [value.asString()];
  if (value instanceof PDFArray) return value.asArray().map((item) => (item instanceof PDFName ? item.asString() : ""));
  return [];
}

/** How many colour channels the image has: 1 (grey), 3 (colour), or 0 if we should leave it alone. */
function channels(dict: PDFDict) {
  const space = dict.lookup(PDFName.of("ColorSpace"));
  if (space instanceof PDFName) {
    if (space.asString() === "/DeviceRGB") return 3;
    if (space.asString() === "/DeviceGray") return 1;
    return 0;
  }
  if (space instanceof PDFArray && space.size() === 2) {
    const family = space.lookup(0);
    const profile = space.lookup(1);
    if (family instanceof PDFName && family.asString() === "/ICCBased" && profile instanceof PDFRawStream) {
      const n = profile.dict.lookup(PDFName.of("N"));
      if (n instanceof PDFNumber && (n.asNumber() === 3 || n.asNumber() === 1)) return n.asNumber();
    }
  }
  return 0;
}

function isPhoto(stream: PDFRawStream, isMask: boolean, includeLossless: boolean) {
  const dict = stream.dict;
  if (isMask || nameOf(dict, "Subtype") !== "/Image") return false;
  if (dict.get(PDFName.of("ImageMask")) || dict.get(PDFName.of("Decode"))) return false;
  const bits = dict.lookup(PDFName.of("BitsPerComponent"));
  if (!(bits instanceof PDFNumber) || bits.asNumber() !== 8) return false;
  if (channels(dict) === 0) return false;
  const width = (dict.lookup(PDFName.of("Width")) as PDFNumber | undefined)?.asNumber() ?? 0;
  const height = (dict.lookup(PDFName.of("Height")) as PDFNumber | undefined)?.asNumber() ?? 0;
  if (width * height < 160 * 160) return false; // icons and logos: too small to matter
  const filters = filterOf(dict);
  if (filters.length === 1 && filters[0] === "/DCTDecode") return true;
  return includeLossless && filters.length === 1 && filters[0] === "/FlateDecode";
}

async function shrinkImage(stream: PDFRawStream, quality: number, maxSide: number) {
  const dict = stream.dict;
  const width = (dict.lookup(PDFName.of("Width")) as PDFNumber).asNumber();
  const height = (dict.lookup(PDFName.of("Height")) as PDFNumber).asNumber();
  const filter = filterOf(dict)[0];

  let source: ImageBitmap | ImageData;
  if (filter === "/DCTDecode") {
    source = await createImageBitmap(new Blob([copy(stream.contents)], { type: "image/jpeg" }), { imageOrientation: "none" });
  } else {
    source = await flateToImageData(stream, width, height);
  }

  const scale = Math.min(1, maxSide / Math.max(width, height));
  const outW = Math.max(1, Math.round(width * scale));
  const outH = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.imageSmoothingQuality = "high";
  if (source instanceof ImageData) {
    const full = document.createElement("canvas");
    full.width = width;
    full.height = height;
    full.getContext("2d")?.putImageData(source, 0, 0);
    ctx.drawImage(full, 0, 0, outW, outH);
  } else {
    ctx.drawImage(source, 0, 0, outW, outH);
    source.close();
  }

  const blob = await canvasToBlob(canvas, "image/jpeg", quality);
  const jpg = new Uint8Array(await blob.arrayBuffer());
  if (jpg.length >= stream.contents.length * 0.9) return null; // not worth it

  const next = dict.clone();
  next.set(PDFName.of("Width"), PDFNumber.of(outW));
  next.set(PDFName.of("Height"), PDFNumber.of(outH));
  next.set(PDFName.of("ColorSpace"), PDFName.of("DeviceRGB"));
  next.set(PDFName.of("BitsPerComponent"), PDFNumber.of(8));
  next.set(PDFName.of("Filter"), PDFName.of("DCTDecode"));
  next.delete(PDFName.of("DecodeParms"));
  next.set(PDFName.of("Length"), PDFNumber.of(jpg.length));
  return PDFRawStream.of(next, jpg);
}

function copy(bytes: Uint8Array) {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

async function inflate(bytes: Uint8Array) {
  const stream = new Blob([copy(bytes)]).stream().pipeThrough(new DecompressionStream("deflate"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Unpacks a lossless (Flate) image into pixels, undoing PNG row filters if present. */
async function flateToImageData(stream: PDFRawStream, width: number, height: number) {
  const dict = stream.dict;
  const colors = channels(dict);
  const raw = await inflate(stream.contents);
  const params = dict.lookup(PDFName.of("DecodeParms"));
  const predictor = params instanceof PDFDict ? ((params.lookup(PDFName.of("Predictor")) as PDFNumber | undefined)?.asNumber() ?? 1) : 1;
  const rowBytes = width * colors;

  let pixels: Uint8Array<ArrayBuffer>;
  if (predictor >= 10) {
    pixels = new Uint8Array(rowBytes * height);
    let prev = new Uint8Array(rowBytes);
    for (let y = 0; y < height; y += 1) {
      const start = y * (rowBytes + 1);
      const type = raw[start];
      const row = raw.subarray(start + 1, start + 1 + rowBytes);
      const out = pixels.subarray(y * rowBytes, (y + 1) * rowBytes);
      for (let x = 0; x < rowBytes; x += 1) {
        const left = x >= colors ? out[x - colors] : 0;
        const up = prev[x];
        const upLeft = x >= colors ? prev[x - colors] : 0;
        let value = row[x];
        if (type === 1) value += left;
        else if (type === 2) value += up;
        else if (type === 3) value += (left + up) >> 1;
        else if (type === 4) {
          const p = left + up - upLeft;
          const pa = Math.abs(p - left);
          const pb = Math.abs(p - up);
          const pc = Math.abs(p - upLeft);
          value += pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
        }
        out[x] = value & 0xff;
      }
      prev = out;
    }
  } else if (predictor === 1) {
    pixels = raw;
  } else {
    throw new Error("Unsupported image packing");
  }
  if (pixels.length < rowBytes * height) throw new Error("Image data is short");

  const image = new ImageData(width, height);
  const data = image.data;
  for (let i = 0, p = 0; i < width * height; i += 1, p += colors) {
    const o = i * 4;
    if (colors === 3) {
      data[o] = pixels[p];
      data[o + 1] = pixels[p + 1];
      data[o + 2] = pixels[p + 2];
    } else {
      data[o] = data[o + 1] = data[o + 2] = pixels[p];
    }
    data[o + 3] = 255;
  }
  return image;
}

async function pagesAsPictures(file: File, onProgress?: Progress): Promise<CompressResult> {
  const doc = await openPdfForDrawing(await file.arrayBuffer());
  try {
    const output = await PDFDocument.create();
    for (let page = 1; page <= doc.numPages; page += 1) {
      onProgress?.(page - 1, doc.numPages);
      const pdfPage = await doc.getPage(page);
      const size = pdfPage.getViewport({ scale: 1 });
      const canvas = await renderPage(doc, page, 110 / 72);
      const blob = await canvasToBlob(canvas, "image/jpeg", 0.6);
      canvas.width = 0;
      canvas.height = 0;
      const image = await output.embedJpg(new Uint8Array(await blob.arrayBuffer()));
      const outPage = output.addPage([size.width, size.height]);
      outPage.drawImage(image, { x: 0, y: 0, width: size.width, height: size.height });
    }
    onProgress?.(doc.numPages, doc.numPages);
    return { bytes: await output.save({ useObjectStreams: true }), imagesShrunk: doc.numPages, imagesFound: doc.numPages };
  } finally {
    closePdf(doc);
  }
}
