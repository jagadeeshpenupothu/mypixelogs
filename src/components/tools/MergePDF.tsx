"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { ArrowDown, ArrowUp, Download, Files, X } from "lucide-react";

import { ErrorNote, FileDrop, Panel, PrivacyNote, Working } from "@/components/tools/pdf/PdfParts";
import { Button } from "@/components/ui/button";
import { bytesToBlob, formatBytes, isPdfFile, loadPdf, triggerDownload } from "@/lib/pdf/common";

type Item = { id: string; file: File; pages: number };

let nextId = 0;

export function MergePDF() {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [merging, setMerging] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; pages: number } | null>(null);

  async function addFiles(files: File[]) {
    setError(null);
    setResult(null);
    setReading(true);
    const added: Item[] = [];
    const problems: string[] = [];

    for (const file of files) {
      if (!isPdfFile(file)) {
        problems.push(`${file.name} is not a PDF.`);
        continue;
      }
      try {
        const doc = await loadPdf(file);
        added.push({ id: `pdf-${(nextId += 1)}`, file, pages: doc.getPageCount() });
      } catch (reason) {
        problems.push(`${file.name}: ${reason instanceof Error ? reason.message : "could not be read."}`);
      }
    }

    setItems((current) => [...current, ...added]);
    if (problems.length > 0) setError(problems.join(" "));
    setReading(false);
  }

  function move(index: number, step: -1 | 1) {
    setResult(null);
    setItems((current) => {
      const next = [...current];
      const target = index + step;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function remove(id: string) {
    setResult(null);
    setItems((current) => current.filter((item) => item.id !== id));
  }

  async function merge() {
    if (items.length < 2) return;
    setMerging(true);
    setError(null);
    try {
      const output = await PDFDocument.create();
      for (const item of items) {
        const source = await loadPdf(item.file);
        const pages = await output.copyPages(source, source.getPageIndices());
        pages.forEach((page) => output.addPage(page));
      }
      const bytes = await output.save({ useObjectStreams: true });
      setResult({ blob: bytesToBlob(bytes, "application/pdf"), pages: output.getPageCount() });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The PDFs could not be joined.");
    } finally {
      setMerging(false);
    }
  }

  const totalPages = items.reduce((sum, item) => sum + item.pages, 0);

  return (
    <div className="space-y-5">
      {items.length === 0 ? (
        <FileDrop
          accept="application/pdf,.pdf"
          multiple
          title="Choose the PDFs to join"
          hint="Pick two or more PDF files. You can change their order next."
          onFiles={addFiles}
        />
      ) : (
        <Panel title={`Your files (${items.length})`}>
          <p className="text-sm text-muted-foreground">
            The files are joined from top to bottom. Use the arrows to change the order.
          </p>
          <ol className="mt-4 space-y-2">
            {items.map((item, index) => (
              <li key={item.id} className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-bold text-foreground">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">{item.file.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {item.pages} page{item.pages === 1 ? "" : "s"} · {formatBytes(item.file.size)}
                  </span>
                </span>
                <span className="flex shrink-0 gap-1">
                  <IconButton label={`Move ${item.file.name} up`} disabled={index === 0} onClick={() => move(index, -1)}>
                    <ArrowUp className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                    label={`Move ${item.file.name} down`}
                    disabled={index === items.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </IconButton>
                  <IconButton label={`Remove ${item.file.name}`} onClick={() => remove(item.id)}>
                    <X className="h-4 w-4" />
                  </IconButton>
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-4">
            <FileDrop accept="application/pdf,.pdf" multiple compact title="Add more PDFs" hint="" onFiles={addFiles} />
          </div>
        </Panel>
      )}

      {reading ? <Working>Reading your files…</Working> : null}
      {error ? <ErrorNote>{error}</ErrorNote> : null}

      {items.length > 0 ? (
        <Panel>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-base font-semibold text-foreground">
                {items.length < 2 ? "Add at least one more PDF" : `${totalPages} pages in total`}
              </p>
              <PrivacyNote />
            </div>
            {result ? (
              <Button size="lg" onClick={() => triggerDownload(result.blob, "merged.pdf")}>
                <Download className="h-4 w-4" />
                Download merged PDF ({formatBytes(result.blob.size)})
              </Button>
            ) : (
              <Button size="lg" onClick={merge} disabled={items.length < 2 || merging || reading}>
                <Files className="h-4 w-4" />
                {merging ? "Joining…" : "Join PDFs"}
              </Button>
            )}
          </div>
        </Panel>
      ) : null}
    </div>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}
