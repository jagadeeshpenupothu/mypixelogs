/**
 * Draws PDF pages with PDF.js. The library and its worker load only when a
 * PDF tool first needs to show a page, so other pages stay light.
 */
import type { PDFDocumentProxy } from "pdfjs-dist";

type PdfJs = typeof import("pdfjs-dist");

let pdfjsPromise: Promise<PdfJs> | null = null;
const loadingTasks = new WeakMap<PDFDocumentProxy, { destroy: () => Promise<void> }>();

/** Frees the memory and worker used by an opened PDF. */
export function closePdf(doc: PDFDocumentProxy) {
  void loadingTasks.get(doc)?.destroy();
}

function loadPdfJs() {
  pdfjsPromise ??= import("pdfjs-dist").then((pdfjs) => {
    pdfjs.GlobalWorkerOptions.workerSrc = `/pdfjs/${pdfjs.version}/pdf.worker.min.mjs`;
    return pdfjs;
  });
  return pdfjsPromise;
}

export async function openPdfForDrawing(data: ArrayBuffer): Promise<PDFDocumentProxy> {
  const pdfjs = await loadPdfJs();
  const base = `/pdfjs/${pdfjs.version}`;
  // PDF.js takes ownership of the buffer it is given, so hand it a copy.
  const task = pdfjs.getDocument({
    data: new Uint8Array(data.slice(0)),
    cMapUrl: `${base}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${base}/standard_fonts/`,
    wasmUrl: `${base}/wasm/`,
    iccUrl: `${base}/iccs/`,
  });
  try {
    const doc = await task.promise;
    loadingTasks.set(doc, task);
    return doc;
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    if (name === "PasswordException") {
      throw new Error("This PDF is locked with a password. Unlock it first, then try again.");
    }
    throw new Error("This file could not be read as a PDF. It may be damaged.");
  }
}

/**
 * Draws one page (numbered from 1) onto a new canvas.
 * `scale` 1 means 72 dots per inch; 150 DPI is a scale of about 2.08.
 * A white background is painted first so JPG output never turns black.
 */
export async function renderPage(doc: PDFDocumentProxy, pageNumber: number, scale: number) {
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not draw this page.");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvas, canvasContext: context, viewport }).promise;
  page.cleanup();
  return canvas;
}

/** A small picture of a page, for choosing and ordering pages. */
export async function renderThumbnail(doc: PDFDocumentProxy, pageNumber: number, width = 180) {
  const page = await doc.getPage(pageNumber);
  const base = page.getViewport({ scale: 1 });
  const ratio = typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio || 1, 2);
  const canvas = await renderPage(doc, pageNumber, (width / base.width) * ratio);
  return canvasToBlob(canvas, "image/jpeg", 0.8);
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Your browser could not save the image."))), type, quality);
  });
}

/** Points to the page size in PDF units (1/72 inch), after the page's own rotation. */
export async function pageSizeInPoints(doc: PDFDocumentProxy, pageNumber: number) {
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  return { width: viewport.width, height: viewport.height };
}
