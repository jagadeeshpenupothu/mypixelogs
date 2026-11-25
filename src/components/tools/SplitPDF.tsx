"use client";

import { useMemo, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Download, FileArchive, RefreshCw, Scissors } from "lucide-react";

import { Choice, ErrorNote, FileDrop, Panel, PrivacyNote, Working } from "@/components/tools/pdf/PdfParts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { baseName, bytesToBlob, formatBytes, isPdfFile, loadPdf, parseRanges, triggerDownload } from "@/lib/pdf/common";
import { createZip } from "@/lib/pdf/zip";

type Mode = "every" | "chunks" | "ranges";
type Part = { name: string; label: string; bytes: Uint8Array };

function plannedRanges(mode: Mode, pageCount: number, chunk: number, rangeText: string) {
  if (mode === "every") {
    return { ranges: Array.from({ length: pageCount }, (_, i) => [i + 1, i + 1] as [number, number]), error: null };
  }
  if (mode === "chunks") {
    if (!Number.isInteger(chunk) || chunk < 1) return { ranges: [], error: "Type how many pages each part should have." };
    const ranges: Array<[number, number]> = [];
    for (let start = 1; start <= pageCount; start += chunk) ranges.push([start, Math.min(pageCount, start + chunk - 1)]);
    return { ranges, error: null };
  }
  return parseRanges(rangeText, pageCount);
}

export function SplitPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<Mode>("ranges");
  const [chunk, setChunk] = useState("2");
  const [rangeText, setRangeText] = useState("");
  const [parts, setParts] = useState<Part[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = useMemo(
    () => (pageCount ? plannedRanges(mode, pageCount, Number(chunk), rangeText) : { ranges: [], error: null }),
    [mode, pageCount, chunk, rangeText],
  );

  async function choose(files: File[]) {
    const next = files[0];
    setParts([]);
    setError(null);
    if (!isPdfFile(next)) {
      setError("Please choose a PDF file.");
      return;
    }
    try {
      const doc = await loadPdf(next);
      setFile(next);
      setPageCount(doc.getPageCount());
      const half = Math.ceil(doc.getPageCount() / 2);
      setRangeText(doc.getPageCount() > 1 ? `1-${half}, ${half + 1}-${doc.getPageCount()}` : "1");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "This PDF could not be opened.");
    }
  }

  async function split() {
    if (!file || plan.error || plan.ranges.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const source = await loadPdf(file);
      const name = baseName(file.name);
      const made: Part[] = [];
      for (const [start, end] of plan.ranges) {
        const output = await PDFDocument.create();
        const indices = Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i);
        const pages = await output.copyPages(source, indices);
        pages.forEach((page) => output.addPage(page));
        const label = start === end ? `page ${start}` : `pages ${start}-${end}`;
        made.push({
          name: `${name}-${start === end ? start : `${start}-${end}`}.pdf`,
          label,
          bytes: await output.save({ useObjectStreams: true }),
        });
      }
      setParts(made);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The PDF could not be split.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFile(null);
    setPageCount(0);
    setParts([]);
    setError(null);
  }

  if (!file) {
    return (
      <div className="space-y-4">
        <FileDrop
          accept="application/pdf,.pdf"
          title="Choose a PDF to split"
          hint="You will choose how to split it on the next step."
          onFiles={choose}
        />
        {error ? <ErrorNote>{error}</ErrorNote> : null}
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-foreground">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {pageCount} page{pageCount === 1 ? "" : "s"} · {formatBytes(file.size)}
              </p>
            </div>
            <Button variant="outline" onClick={reset}>
              <RefreshCw className="h-4 w-4" />
              Choose another
            </Button>
          </div>
        </Panel>

        <Panel title="How do you want to split it?">
          <div className="grid gap-2 sm:grid-cols-3">
            <Choice active={mode === "ranges"} onClick={() => setMode("ranges")} title="By page ranges" note="You type the parts" />
            <Choice active={mode === "chunks"} onClick={() => setMode("chunks")} title="Every few pages" note="Same size parts" />
            <Choice active={mode === "every"} onClick={() => setMode("every")} title="One file per page" note={`${pageCount} files`} />
          </div>

          {mode === "ranges" ? (
            <label className="mt-5 block text-sm font-medium text-foreground">
              Page ranges, one part for each
              <Input
                value={rangeText}
                onChange={(event) => {
                  setRangeText(event.target.value);
                  setParts([]);
                }}
                placeholder="1-3, 4-6, 7"
                className="mt-2 h-11 text-base"
                inputMode="numeric"
              />
              <span className="mt-2 block text-xs leading-5 text-muted-foreground">
                Example: <strong>1-3, 4-6, 7</strong> makes three PDFs.
              </span>
            </label>
          ) : null}

          {mode === "chunks" ? (
            <label className="mt-5 block text-sm font-medium text-foreground">
              Pages in each part
              <Input
                type="number"
                min={1}
                max={pageCount}
                value={chunk}
                onChange={(event) => {
                  setChunk(event.target.value);
                  setParts([]);
                }}
                className="mt-2 h-11 w-32 text-base"
              />
            </label>
          ) : null}

          {plan.error ? (
            <p className="mt-4 text-sm font-medium text-red-700 dark:text-red-300">{plan.error}</p>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              This makes <strong className="text-foreground">{plan.ranges.length}</strong> PDF file
              {plan.ranges.length === 1 ? "" : "s"}.
            </p>
          )}
        </Panel>
      </div>

      <aside className="space-y-5">
        <Panel title="Download">
          {parts.length === 0 ? (
            <>
              <Button size="lg" className="w-full" onClick={split} disabled={busy || Boolean(plan.error) || plan.ranges.length === 0}>
                <Scissors className="h-4 w-4" />
                {busy ? "Splitting…" : "Split PDF"}
              </Button>
              <div className="mt-3">
                <PrivacyNote />
              </div>
            </>
          ) : (
            <div className="space-y-3">
              {parts.length > 1 ? (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() =>
                    triggerDownload(createZip(parts.map((part) => ({ name: part.name, data: part.bytes }))), `${baseName(file.name)}-split.zip`)
                  }
                >
                  <FileArchive className="h-4 w-4" />
                  Download all (ZIP)
                </Button>
              ) : null}
              <ul className="max-h-80 space-y-2 overflow-y-auto">
                {parts.map((part) => (
                  <li key={part.name}>
                    <button
                      type="button"
                      onClick={() => triggerDownload(bytesToBlob(part.bytes, "application/pdf"), part.name)}
                      className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-left text-sm transition-colors hover:border-primary/60"
                    >
                      <span className="font-medium capitalize text-foreground">{part.label}</span>
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        {formatBytes(part.bytes.length)}
                        <Download className="h-4 w-4 text-primary" aria-hidden="true" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Panel>
        {busy ? <Working>Making your files…</Working> : null}
        {error ? <ErrorNote>{error}</ErrorNote> : null}
      </aside>
    </div>
  );
}
