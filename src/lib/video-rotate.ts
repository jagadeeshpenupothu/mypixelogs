/**
 * Lossless rotation for MP4, MOV and M4V files.
 *
 * These files store how a video should be turned in a small matrix inside each
 * track header (tkhd). Only those 36 bytes change: the picture and sound are
 * never re-encoded, so quality and file size stay exactly the same.
 */

export type Rotation = 90 | 180 | 270;

export class VideoRotateError extends Error {}

type Box = { type: string; start: number; size: number; header: number };

const MAX_MOOV_SIZE = 256 * 1024 * 1024;

function readBox(view: DataView, offset: number, end: number): Box | null {
  if (offset + 8 > end) return null;
  let size = view.getUint32(offset);
  let header = 8;
  const type = String.fromCharCode(
    view.getUint8(offset + 4),
    view.getUint8(offset + 5),
    view.getUint8(offset + 6),
    view.getUint8(offset + 7),
  );
  if (size === 1) {
    if (offset + 16 > end) return null;
    size = Number(view.getBigUint64(offset + 8));
    header = 16;
  } else if (size === 0) {
    size = end - offset;
  }
  if (size < header || offset + size > end) return null;
  return { type, start: offset, size, header };
}

function children(view: DataView, parent: Box): Box[] {
  const boxes: Box[] = [];
  const end = parent.start + parent.size;
  let offset = parent.start + parent.header;
  while (offset < end) {
    const box = readBox(view, offset, end);
    if (!box) break;
    boxes.push(box);
    offset += box.size;
  }
  return boxes;
}

const find = (view: DataView, parent: Box | undefined, type: string) =>
  parent ? children(view, parent).find((box) => box.type === type) : undefined;

/** Finds the moov box by reading only the small box headers, so huge files stay on disk. */
async function locateMoov(file: Blob): Promise<{ start: number; size: number }> {
  let offset = 0;
  while (offset + 8 <= file.size) {
    const view = new DataView(await file.slice(offset, offset + 16).arrayBuffer());
    let size = view.getUint32(0);
    const type = String.fromCharCode(view.getUint8(4), view.getUint8(5), view.getUint8(6), view.getUint8(7));
    if (!/^[\x20-\x7e]{4}$/.test(type)) break;
    if (size === 1) {
      if (view.byteLength < 16) break;
      size = Number(view.getBigUint64(8));
    } else if (size === 0) {
      size = file.size - offset;
    }
    if (size < 8 || offset + size > file.size) break;
    if (type === "moov") return { start: offset, size };
    offset += size;
  }
  throw new VideoRotateError("This does not look like a complete MP4, MOV or M4V video.");
}

function rotateTrack(view: DataView, tkhd: Box, degrees: Rotation) {
  const body = tkhd.start + tkhd.header;
  const version = view.getUint8(body);
  const matrix = body + 4 + (version === 1 ? 32 : 20) + 16;
  if (matrix + 44 > tkhd.start + tkhd.size) throw new VideoRotateError("This video has a track header that cannot be read.");

  const fixed = (index: number) => view.getInt32(matrix + index * 4) / 65536;
  const width = view.getUint32(matrix + 36) / 65536;
  const height = view.getUint32(matrix + 40) / 65536;

  // Keep any rotation or flip the video already has, then turn it clockwise.
  let [a, b, c, d] = [fixed(0), fixed(1), fixed(3), fixed(4)];
  for (let turn = 0; turn < degrees / 90; turn += 1) [a, b, c, d] = [-b, a, -d, c];

  // Move the picture back so that its corner stays at 0,0.
  const x = -Math.min(0, width * a, height * c, width * a + height * c);
  const y = -Math.min(0, width * b, height * d, width * b + height * d);

  const write = (index: number, value: number) => view.setInt32(matrix + index * 4, Math.round(value * 65536));
  write(0, a);
  write(1, b);
  write(3, c);
  write(4, d);
  write(6, x);
  write(7, y);
}

/** Returns the rotated video. Everything except the rotation bytes is the original file. */
export async function rotateVideo(file: Blob, degrees: Rotation): Promise<Blob> {
  const moov = await locateMoov(file);
  if (moov.size > MAX_MOOV_SIZE) throw new VideoRotateError("This video's index is too large to open in the browser.");

  const buffer = await file.slice(moov.start, moov.start + moov.size).arrayBuffer();
  const view = new DataView(buffer);
  const root = readBox(view, 0, buffer.byteLength);
  if (!root) throw new VideoRotateError("This video's index cannot be read.");

  let rotated = 0;
  for (const track of children(view, root).filter((box) => box.type === "trak")) {
    const handler = find(view, find(view, track, "mdia"), "hdlr");
    const header = find(view, track, "tkhd");
    if (!handler || !header || handler.size < handler.header + 12) continue;
    // "vide" marks a video track. Sound and subtitles are left alone.
    if (view.getUint32(handler.start + handler.header + 8) !== 0x76696465) continue;
    rotateTrack(view, header, degrees);
    rotated += 1;
  }
  if (rotated === 0) throw new VideoRotateError("No video track was found in this file.");

  return new Blob([file.slice(0, moov.start), buffer, file.slice(moov.start + moov.size)], { type: file.type || "video/mp4" });
}
