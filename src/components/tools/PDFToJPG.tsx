"use client";

import { useState } from "react";
import { Download, FileArchive, ImageDown, RefreshCw } from "lucide-react";

import { Choice, ErrorNote, FileDrop, PageThumb, Panel, PrivacyNote, usePdfDrawing } from "@/components/tools/pdf/PdfParts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { baseName, formatBytes, isPdfFile, parsePages, triggerDownload } from "@/lib/pdf/common";
import { canvasToBlob, renderPage } from "@/lib/pdf/render";
import { createZip } from "@/lib/pdf/zip";

type Format = "jpg" | "png";
type Quality = 72 | 150 | 300;
type Picture = { page: number; name: string; blob: Blob };

const qualityNotes: Record<Quality, string> = {
  72: "Small files, for phones and WhatsApp",
  150: "Clear on any screen",
  300: "Sharp enough to print",
};

export function PDFToJPG() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<Format>("jpg");
  const [dpi, setDpi] = useState<Quality>(150);
  const [which, setWhich] = useState<"all" | "some">("all");
  const [typed, setTyped] = useState("");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { doc, error: openError } = usePdfDrawing(file);
  const pageCount = doc?.numPages ?? 0;

  function choose(files: File[]) {
    const next = files[0];
    setPictures([]);
    setError(null);
    if (!isPdfFile(next)) {
      setError("Please choose a PDF file.");
      return;
    }
    setFile(next);
  }

  function reset() {
    setFile(null);
    setPictures([]);
    setError(null);
    setTyped("");
    setWhich("all");
  }

  const selection = which === "all" ? { pages: Array.from({ length: pageCount }, (_, i) => i + 1), error: null } : parsePages(typed, pageCount);

  async function convert() {
    if (!doc || !file || selection.error || selection.pages.length === 0) return;
    setError(null);
    setPictures([]);
    const made: Picture[] = [];
    const name = baseName(file.name);
    const type = format === "jpg" ? "image/jpeg" : "image/png";
    try {
      for (const [index, page] of selection.pages.entries()) {
        setProgress({ done: index, total: selection.pages.length });
        const canvas = await renderPage(doc, page, dpi / 72);
        const blob = await canvasToBlob(canvas, type, format === "jpg" ? 0.9 : undefined);
        canvas.width = 0;
        canvas.height = 0;
        made.push({ page, name: `${name}-page-${page}.${format}`, blob });
      }
      setPictures(made);
      if (made.length === 1) triggerDownload(made[0].blob, made[0].name);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "";
      setError(
        dpi === 300 && /memory|allocation|canvas/i.test(message)
          ? "This page is too big for your device at 300 DPI. Try 150 DPI."
          : message || "The pages could not be saved as pictures.",
      );
    } finally {
      setProgress(null);
    }
  }

  async function downloadZip() {
    if (!file) return;
    const entries = await Promise.all(
      pictures.map(async (picture) => ({ name: picture.name, data: new Uint8Array(await picture.blob.arrayBuffer()) })),
    );
    triggerDownload(createZip(entries), `${baseName(file.name)}-${format}.zip`);
  }

  if (!file) {
    return (
      <div className="space-y-4">
        <FileDrop accept="application/pdf,.pdf" title="Choose a PDF" hint="Every page you pick is saved as a separate picture." onFiles={choose} />
        {error ? <ErrorNote>{error}</ErrorNote> : null}
      </div>
    );
  }

  const busy = progress !== null;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-5">
        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-foreground">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {pageCount ? `${pageCount} page${pageCount === 1 ? "" : "s"} · ` : ""}
                {formatBytes(file.size)}
              </p>
            </div>
            <Button variant="outline" onClick={reset}>
              <RefreshCw className="h-4 w-4" />
              Choose another
            </Button>
          </div>
        </Panel>

        {openError ? <ErrorNote>{openError}</ErrorNote> : null}

        {pictures.length > 0 ? (
          <Panel title={`Your pictures (${pictures.length})`}>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {pictures.map((picture) => (
                <li key={picture.name}>
                  <button
                    type="button"
                    onClick={() => triggerDownload(picture.blob, picture.name)}
                    className="w-full rounded-lg border border-border bg-background p-2 text-left transition-colors hover:border-primary/60"
                  >
                    <PageThumb doc={doc} pageNumber={picture.page} />
                    <span className="mt-2 flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">Page {picture.page}</span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        {formatBytes(picture.blob.size)}
                        <Download className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
        ) : doc ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {Array.from({ length: Math.min(pageCount, 12) }, (_, i) => (
              <div key={i}>
                <PageThumb doc={doc} pageNumber={i + 1} />
                <p className="mt-1 text-center text-xs text-muted-foreground">Page {i + 1}</p>
              </div>
            ))}
            {pageCount > 12 ? (
              <p className="col-span-full text-sm text-muted-foreground">…and {pageCount - 12} more pages.</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <aside className="space-y-5">
        <Panel title="Picture type">
          <div className="grid grid-cols-2 gap-2">
            <Choice active={format === "jpg"} onClick={() => { setFormat("jpg"); setPictures([]); }} title="JPG" note="Smaller files" />
            <Choice active={format === "png"} onClick={() => { setFormat("png"); setPictures([]); }} title="PNG" note="Sharpest text" />
          </div>
        </Panel>
        <Panel title="Quality">
          <div className="grid gap-2">
            {([72, 150, 300] as Quality[]).map((value) => (
              <Choice
                key={value}
                active={dpi === value}
                onClick={() => { setDpi(value); setPictures([]); }}
                title={`${value === 72 ? "Low" : value === 150 ? "Medium" : "High"} (${value} DPI)`}
                note={qualityNotes[value]}
              />
            ))}
          </div>
        </Panel>
        <Panel title="Pages">
          <div className="grid grid-cols-2 gap-2">
            <Choice active={which === "all"} onClick={() => { setWhich("all"); setPictures([]); }} title="All pages" />
            <Choice active={which === "some"} onClick={() => { setWhich("some"); setPictures([]); }} title="Some pages" />
          </div>
          {which === "some" ? (
            <>
              <Input
                value={typed}
                onChange={(event) => { setTyped(event.target.value); setPictures([]); }}
                placeholder="For example 1, 3-5"
                className="mt-3 h-11 text-base"
                aria-label="Pages to save"
              />
              {typed && selection.error ? <p className="mt-2 text-sm text-red-700 dark:text-red-300">{selection.error}</p> : null}
            </>
          ) : null}
        </Panel>
        <Panel>
          {pictures.length > 1 ? (
            <Button size="lg" className="w-full" onClick={downloadZip}>
              <FileArchive className="h-4 w-4" />
              Download all (ZIP)
            </Button>
          ) : (
            <Button size="lg" className="w-full" onClick={convert} disabled={!doc || busy || Boolean(selection.error) || selection.pages.length === 0}>
              <ImageDown className="h-4 w-4" />
              {busy ? `Page ${progress.done + 1} of ${progress.total}…` : `Save as ${format.toUpperCase()}`}
            </Button>
          )}
          <div className="mt-3">
            <PrivacyNote />
          </div>
        </Panel>
        {error ? <ErrorNote>{error}</ErrorNote> : null}
      </aside>
    </div>
  );
}
