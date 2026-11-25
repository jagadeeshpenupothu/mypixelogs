"use client";

import { useState } from "react";
import { Download, RefreshCw, Trash2 } from "lucide-react";

import { ErrorNote, FileDrop, PageThumb, Panel, PrivacyNote, usePdfDrawing } from "@/components/tools/pdf/PdfParts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  baseName,
  bytesToBlob,
  describePages,
  formatBytes,
  isPdfFile,
  loadPdf,
  parsePages,
  triggerDownload,
} from "@/lib/pdf/common";
import { cn } from "@/lib/utils";

export function DeletePDFPages() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { doc, error: drawError } = usePdfDrawing(file);

  async function choose(files: File[]) {
    const next = files[0];
    setError(null);
    setMarked(new Set());
    setTyped("");
    if (!isPdfFile(next)) {
      setError("Please choose a PDF file.");
      return;
    }
    try {
      const pdf = await loadPdf(next);
      setFile(next);
      setPageCount(pdf.getPageCount());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "This PDF could not be opened.");
    }
  }

  function toggle(page: number) {
    const next = new Set(marked);
    if (next.has(page)) next.delete(page);
    else next.add(page);
    setMarked(next);
    setTyped(describePages([...next]));
    setError(null);
  }

  function applyTyped(value: string) {
    setTyped(value);
    if (!value.trim()) {
      setMarked(new Set());
      setError(null);
      return;
    }
    const result = parsePages(value, pageCount);
    if (result.error) {
      setError(result.error);
      return;
    }
    setError(null);
    setMarked(new Set(result.pages));
  }

  async function save() {
    if (!file || marked.size === 0 || marked.size >= pageCount) return;
    setBusy(true);
    setError(null);
    try {
      const pdf = await loadPdf(file);
      [...marked].sort((a, b) => b - a).forEach((page) => pdf.removePage(page - 1));
      const bytes = await pdf.save({ useObjectStreams: true });
      triggerDownload(bytesToBlob(bytes, "application/pdf"), `${baseName(file.name)}-edited.pdf`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The pages could not be removed.");
    } finally {
      setBusy(false);
    }
  }

  if (!file) {
    return (
      <div className="space-y-4">
        <FileDrop accept="application/pdf,.pdf" title="Choose a PDF" hint="Then tap the pages you want to remove." onFiles={choose} />
        {error ? <ErrorNote>{error}</ErrorNote> : null}
      </div>
    );
  }

  const keeping = pageCount - marked.size;

  return (
    <div className="space-y-5">
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-foreground">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {pageCount} pages · {formatBytes(file.size)}
            </p>
          </div>
          <Button variant="outline" onClick={() => setFile(null)}>
            <RefreshCw className="h-4 w-4" />
            Choose another
          </Button>
        </div>
        <label className="mt-5 block text-sm font-medium text-foreground">
          Pages to remove
          <Input
            value={typed}
            onChange={(event) => applyTyped(event.target.value)}
            placeholder="Tap pages below, or type like 2, 5-7"
            className="mt-2 h-11 text-base"
          />
        </label>
      </Panel>

      {error ? <ErrorNote>{error}</ErrorNote> : null}
      {drawError ? <ErrorNote>{drawError}</ErrorNote> : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => {
          const isMarked = marked.has(page);
          return (
            <button
              key={page}
              type="button"
              aria-pressed={isMarked}
              aria-label={`${isMarked ? "Keep" : "Remove"} page ${page}`}
              onClick={() => toggle(page)}
              className={cn(
                "relative rounded-lg border-2 border-transparent bg-card p-1.5 text-left transition-colors hover:border-primary/50",
                isMarked && "border-red-500 hover:border-red-500",
              )}
            >
              <PageThumb doc={doc} pageNumber={page} className={cn(isMarked && "opacity-40")} />
              {isMarked ? (
                <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-[#fff]">
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </span>
              ) : null}
              <span className={cn("mt-1.5 block text-center text-xs font-semibold", isMarked ? "text-red-700 dark:text-red-300" : "text-muted-foreground")}>
                {isMarked ? `Page ${page} · removed` : `Page ${page}`}
              </span>
            </button>
          );
        })}
      </div>

      <div className="sticky bottom-20 z-10 rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur md:bottom-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {marked.size === 0
                ? "Tap the pages you want to remove"
                : marked.size >= pageCount
                  ? "You can't remove every page"
                  : `Removing ${marked.size}, keeping ${keeping} page${keeping === 1 ? "" : "s"}`}
            </p>
            <PrivacyNote />
          </div>
          <Button size="lg" onClick={save} disabled={busy || marked.size === 0 || marked.size >= pageCount}>
            <Download className="h-4 w-4" />
            {busy ? "Saving…" : "Download new PDF"}
          </Button>
        </div>
      </div>
    </div>
  );
}
