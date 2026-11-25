"use client";

import { useState } from "react";
import { Archive, CheckCircle2, Download, Info, RefreshCw } from "lucide-react";

import { Choice, ErrorNote, FileDrop, Panel, PrivacyNote, Working } from "@/components/tools/pdf/PdfParts";
import { Button } from "@/components/ui/button";
import { baseName, bytesToBlob, formatBytes, isPdfFile, triggerDownload } from "@/lib/pdf/common";
import { type CompressLevel, compressPdf } from "@/lib/pdf/compress";

const levels: Array<{ value: CompressLevel; title: string; note: string }> = [
  { value: "light", title: "Light", note: "Photos stay very clear. Smaller saving." },
  { value: "medium", title: "Recommended", note: "Good balance for email and WhatsApp." },
  { value: "strong", title: "Strong", note: "Smallest file that keeps text selectable." },
  { value: "pictures", title: "Smallest (pages as pictures)", note: "For scanned PDFs. Text can't be selected after." },
];

type Result = { blob: Blob; level: CompressLevel; imagesShrunk: number; imagesFound: number };

export function CompressPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<CompressLevel>("medium");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  function choose(files: File[]) {
    const next = files[0];
    setResult(null);
    setError(null);
    if (!isPdfFile(next)) {
      setError("Please choose a PDF file.");
      return;
    }
    setFile(next);
  }

  async function run() {
    if (!file) return;
    setError(null);
    setResult(null);
    setProgress({ done: 0, total: 0 });
    try {
      const output = await compressPdf(file, level, (done, total) => setProgress({ done, total }));
      setResult({ blob: bytesToBlob(output.bytes, "application/pdf"), level, imagesShrunk: output.imagesShrunk, imagesFound: output.imagesFound });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "This PDF could not be made smaller.");
    } finally {
      setProgress(null);
    }
  }

  if (!file) {
    return (
      <div className="space-y-4">
        <FileDrop accept="application/pdf,.pdf" title="Choose a PDF to make smaller" hint="Best for PDFs with photos or scans." onFiles={choose} />
        {error ? <ErrorNote>{error}</ErrorNote> : null}
      </div>
    );
  }

  const saved = result ? file.size - result.blob.size : 0;
  const smaller = result !== null && saved > file.size * 0.02;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-foreground">{file.name}</p>
              <p className="text-sm text-muted-foreground">Now {formatBytes(file.size)}</p>
            </div>
            <Button variant="outline" onClick={() => { setFile(null); setResult(null); }}>
              <RefreshCw className="h-4 w-4" />
              Choose another
            </Button>
          </div>
        </Panel>

        <Panel title="How small?">
          <div className="grid gap-2 sm:grid-cols-2">
            {levels.map((option) => (
              <Choice
                key={option.value}
                active={level === option.value}
                onClick={() => { setLevel(option.value); setResult(null); }}
                title={option.title}
                note={option.note}
              />
            ))}
          </div>
        </Panel>

        {result ? (
          <Panel>
            {smaller ? (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" aria-hidden="true" />
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    {formatBytes(file.size)} → {formatBytes(result.blob.size)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round((saved / file.size) * 100)}% smaller.
                    {result.level === "pictures" ? " Each page is now a picture." : ` ${result.imagesShrunk} photo${result.imagesShrunk === 1 ? "" : "s"} made lighter; text is unchanged.`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" aria-hidden="true" />
                <div>
                  <p className="text-base font-semibold text-foreground">This PDF is already about as small as it can be at this level.</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {result.level !== "pictures" && result.imagesFound === 0
                      ? "It has no large photos to shrink; it is mostly text, which is already compact."
                      : "Try a stronger level. For scanned documents, “Smallest” usually helps most."}
                  </p>
                </div>
              </div>
            )}
          </Panel>
        ) : null}
      </div>

      <aside className="space-y-5">
        <Panel>
          {result && smaller ? (
            <Button size="lg" className="w-full" onClick={() => triggerDownload(result.blob, `${baseName(file.name)}-compressed.pdf`)}>
              <Download className="h-4 w-4" />
              Download ({formatBytes(result.blob.size)})
            </Button>
          ) : (
            <Button size="lg" className="w-full" onClick={run} disabled={progress !== null}>
              <Archive className="h-4 w-4" />
              {progress ? "Working…" : result ? "Try again" : "Make PDF smaller"}
            </Button>
          )}
          <div className="mt-3 space-y-2">
            {progress && progress.total > 0 ? (
              <Working>
                {level === "pictures" ? "Page" : "Photo"} {Math.min(progress.done + 1, progress.total)} of {progress.total}…
              </Working>
            ) : progress ? (
              <Working>Reading the PDF…</Working>
            ) : null}
            <PrivacyNote />
          </div>
        </Panel>
        {error ? <ErrorNote>{error}</ErrorNote> : null}
      </aside>
    </div>
  );
}
