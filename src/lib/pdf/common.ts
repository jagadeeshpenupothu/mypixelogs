import { PDFDocument } from "pdf-lib";

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export function baseName(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, "") || "document";
}

export function isPdfFile(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export function bytesToBlob(bytes: Uint8Array, type: string) {
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  return new Blob([buffer], { type });
}

/** Opens a PDF with pdf-lib and turns its errors into words a person can act on. */
export async function loadPdf(source: File | ArrayBuffer) {
  const bytes = source instanceof File ? await source.arrayBuffer() : source;
  try {
    return await PDFDocument.load(bytes, { updateMetadata: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/encrypt/i.test(message)) {
      throw new Error("This PDF is locked with a password. Unlock it first, then try again.");
    }
    throw new Error("This file could not be read as a PDF. It may be damaged.");
  }
}

export type PageSelection = { pages: number[]; error: string | null };

/** Reads "1-3, 5, 8-10" into page numbers, in the order typed, without repeats. */
export function parsePages(input: string, pageCount: number): PageSelection {
  const ranges = parseRanges(input, pageCount);
  if (ranges.error) return { pages: [], error: ranges.error };
  const seen = new Set<number>();
  const pages: number[] = [];
  ranges.ranges.forEach(([start, end]) => {
    for (let page = start; page <= end; page += 1) {
      if (!seen.has(page)) {
        seen.add(page);
        pages.push(page);
      }
    }
  });
  return { pages, error: null };
}

/** Reads "1-3, 5" into ranges, keeping each range separate (used to split one PDF into several). */
export function parseRanges(input: string, pageCount: number): { ranges: Array<[number, number]>; error: string | null } {
  const text = input.trim();
  if (!text) return { ranges: [], error: "Type at least one page number, like 1-3 or 5." };

  const ranges: Array<[number, number]> = [];
  for (const raw of text.split(",")) {
    const part = raw.trim();
    if (!part) continue;
    const match = part.match(/^(\d+)\s*(?:-\s*(\d+))?$/);
    if (!match) return { ranges: [], error: `"${part}" is not a page number or range. Use numbers like 2 or 4-7.` };
    const start = Number(match[1]);
    const end = match[2] ? Number(match[2]) : start;
    if (start < 1 || end < 1) return { ranges: [], error: "Page numbers start at 1." };
    if (start > pageCount || end > pageCount) {
      return { ranges: [], error: `This PDF has ${pageCount} page${pageCount === 1 ? "" : "s"}, so "${part}" is too high.` };
    }
    if (start > end) return { ranges: [], error: `"${part}" goes backwards. Write it as ${end}-${start}.` };
    ranges.push([start, end]);
  }
  if (ranges.length === 0) return { ranges: [], error: "Type at least one page number, like 1-3 or 5." };
  return { ranges, error: null };
}

/** Writes a short list of page numbers as ranges: [1,2,3,5] becomes "1-3, 5". */
export function describePages(pages: number[]) {
  const sorted = [...pages].sort((a, b) => a - b);
  const parts: string[] = [];
  let index = 0;
  while (index < sorted.length) {
    let end = index;
    while (end + 1 < sorted.length && sorted[end + 1] === sorted[end] + 1) end += 1;
    parts.push(end > index ? `${sorted[index]}-${sorted[end]}` : `${sorted[index]}`);
    index = end + 1;
  }
  return parts.join(", ");
}

export function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
