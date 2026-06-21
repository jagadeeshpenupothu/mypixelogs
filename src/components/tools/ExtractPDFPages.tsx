"use client";

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Download, FileText, Files } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PdfInfo = {
  name: string;
  size: number;
  pageCount: number;
  pageSizes: Array<{
    width: number;
    height: number;
    rotation: number;
  }>;
};

type PageSelectionResult = {
  pages: number[];
  error: string | null;
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** unitIndex;

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function makeDownloadName(fileName: string) {
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  return `${baseName}-extracted.pdf`;
}

function normalizeRotation(value: number) {
  return ((value % 360) + 360) % 360;
}

function getPreviewOrientation(width: number, height: number, rotation: number) {
  const normalizedRotation = normalizeRotation(rotation);

  if (normalizedRotation === 90 || normalizedRotation === 270) {
    return { width: height, height: width };
  }

  return { width, height };
}

function parsePageSelection(input: string, pageCount: number): PageSelectionResult {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return { pages: [], error: "Enter at least one page number or range." };
  }

  const pages = new Set<number>();
  const segments = trimmedInput.split(",").map((part) => part.trim());

  for (const segment of segments) {
    if (!segment) {
      return { pages: [], error: "Remove empty page entries from the selection." };
    }

    if (segment.includes("-")) {
      const rangeParts = segment.split("-").map((part) => part.trim());

      if (rangeParts.length !== 2) {
        return { pages: [], error: `Invalid range: ${segment}` };
      }

      const start = Number(rangeParts[0]);
      const end = Number(rangeParts[1]);

      if (!Number.isInteger(start) || !Number.isInteger(end)) {
        return { pages: [], error: `Invalid range: ${segment}` };
      }

      if (start < 1 || end < 1 || start > pageCount || end > pageCount) {
        return { pages: [], error: `Range ${segment} is outside the PDF page count.` };
      }

      if (start > end) {
        return { pages: [], error: `Range ${segment} must start before it ends.` };
      }

      for (let page = start; page <= end; page += 1) {
        pages.add(page);
      }

      continue;
    }

    const page = Number(segment);

    if (!Number.isInteger(page)) {
      return { pages: [], error: `Invalid page number: ${segment}` };
    }

    if (page < 1 || page > pageCount) {
      return { pages: [], error: `Page ${page} is outside the PDF page count.` };
    }

    pages.add(page);
  }

  return {
    pages: [...pages].sort((a, b) => a - b),
    error: null,
  };
}

async function readPdfInfo(file: File): Promise<PdfInfo> {
  const bytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(bytes);
  const pages = pdfDoc.getPages();

  return {
    name: file.name,
    size: file.size,
    pageCount: pages.length,
    pageSizes: pages.map((page) => {
      const size = page.getSize();
      return {
        width: size.width,
        height: size.height,
        rotation: page.getRotation().angle,
      };
    }),
  };
}

async function extractPdfPages(file: File, selectedPages: number[]) {
  const bytes = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(bytes);
  const outputPdf = await PDFDocument.create();
  const copiedPages = await outputPdf.copyPages(
    sourcePdf,
    selectedPages.map((page) => page - 1),
  );

  copiedPages.forEach((page) => outputPdf.addPage(page));

  return outputPdf.save();
}

export function ExtractPDFPages() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pdfInfo, setPdfInfo] = useState<PdfInfo | null>(null);
  const [pageSelection, setPageSelection] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("");
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectionResult = useMemo(() => {
    if (!pdfInfo) {
      return { pages: [], error: null };
    }

    return parsePageSelection(pageSelection, pdfInfo.pageCount);
  }, [pageSelection, pdfInfo]);

  const estimatedOutputSize = useMemo(() => {
    if (!pdfInfo || selectionResult.pages.length === 0) {
      return 0;
    }

    return Math.max(1, Math.round((pdfInfo.size / pdfInfo.pageCount) * selectionResult.pages.length));
  }, [pdfInfo, selectionResult.pages.length]);

  function clearDownloadUrl() {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }

    setDownloadUrl(null);
    setOutputSize(null);
  }

  async function handleFile(nextFile: File) {
    clearDownloadUrl();
    setError(null);
    setPageSelection("");

    if (nextFile.type !== "application/pdf" && !nextFile.name.toLowerCase().endsWith(".pdf")) {
      setFile(null);
      setPdfInfo(null);
      setError("Unsupported file type. Please upload a PDF file.");
      return;
    }

    try {
      const nextPdfInfo = await readPdfInfo(nextFile);
      setFile(nextFile);
      setPdfInfo(nextPdfInfo);
      setDownloadName(makeDownloadName(nextFile.name));
    } catch (loadError) {
      setFile(null);
      setPdfInfo(null);
      setError(loadError instanceof Error ? loadError.message : "PDF upload failed.");
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];
    if (nextFile) void handleFile(nextFile);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    const nextFile = event.dataTransfer.files[0];
    if (nextFile) void handleFile(nextFile);
  }

  function togglePage(pageNumber: number) {
    const pages = selectionResult.pages.includes(pageNumber)
      ? selectionResult.pages.filter((page) => page !== pageNumber)
      : [...selectionResult.pages, pageNumber].sort((a, b) => a - b);

    setPageSelection(pages.join(","));
  }

  async function buildExtractedPdf() {
    if (!file || !pdfInfo) return;

    if (selectionResult.error) {
      clearDownloadUrl();
      setError(selectionResult.error);
      return;
    }

    if (selectionResult.pages.length === 0) {
      clearDownloadUrl();
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const extractedBytes = await extractPdfPages(file, selectionResult.pages);
      clearDownloadUrl();
      const pdfBuffer = extractedBytes.buffer.slice(
        extractedBytes.byteOffset,
        extractedBytes.byteOffset + extractedBytes.byteLength,
      ) as ArrayBuffer;
      const blob = new Blob([pdfBuffer], { type: "application/pdf" });
      setOutputSize(blob.size);
      setDownloadUrl(URL.createObjectURL(blob));
      setDownloadName(makeDownloadName(file.name));
    } catch (extractError) {
      setError(extractError instanceof Error ? extractError.message : "PDF extraction failed.");
    } finally {
      setIsProcessing(false);
    }
  }

  useEffect(() => {
    if (!file || !pdfInfo) return;

    void Promise.resolve().then(() => buildExtractedPdf());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, pageSelection, pdfInfo]);

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "cursor-pointer rounded-lg border border-dashed border-border bg-card p-8 text-center shadow-sm transition duration-200 hover:border-primary/50",
            isDragging && "border-primary bg-primary/5",
          )}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            onChange={handleInputChange}
          />
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-blue-50 text-primary shadow-sm">
            <FileText className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-foreground">Upload a PDF</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Drag and drop a PDF here, or click to browse. Extraction happens in your browser.
          </p>
        </div>

        {pdfInfo ? (
          <>
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <Badge variant="secondary" className="bg-blue-50 text-primary">
                    PDF
                  </Badge>
                  <h2 className="mt-3 text-xl font-semibold text-foreground">{pdfInfo.name}</h2>
                </div>
                <p className="text-sm font-medium text-muted-foreground">{formatBytes(pdfInfo.size)}</p>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <InfoBox label="File Name" value={pdfInfo.name} />
                <InfoBox label="File Size" value={formatBytes(pdfInfo.size)} />
                <InfoBox label="Page Count" value={pdfInfo.pageCount.toString()} />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Page thumbnails</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Click thumbnails or type pages like 1,3,5-10.
                  </p>
                </div>
                <Badge>{isProcessing ? "Generating PDF" : "Preview"}</Badge>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pdfInfo.pageSizes.map((page, index) => {
                  const pageNumber = index + 1;
                  const isSelected = selectionResult.pages.includes(pageNumber);
                  const previewSize = getPreviewOrientation(page.width, page.height, page.rotation);
                  const isPortrait = previewSize.height >= previewSize.width;

                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => togglePage(pageNumber)}
                      className={cn(
                        "rounded-lg border border-border bg-background p-4 text-left transition hover:border-primary/40",
                        isSelected && "border-primary/50 bg-primary/10",
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-foreground">Page {pageNumber}</span>
                        <span className="text-xs font-medium text-muted-foreground">
                          {isSelected ? "Selected" : "Click to select"}
                        </span>
                      </div>
                      <div className="mt-4 flex h-40 items-center justify-center rounded-md border border-border bg-slate-50 p-3">
                        <div
                          className={cn(
                            "flex items-center justify-center rounded border border-border bg-white text-xs font-semibold text-muted-foreground shadow-sm",
                            isPortrait ? "h-32 w-24" : "h-24 w-32",
                          )}
                        >
                          {previewSize.width.toFixed(0)} x {previewSize.height.toFixed(0)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}
      </div>

      <aside className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Page selection</h2>
          <label className="mt-5 block text-sm font-medium text-foreground">
            Pages to extract
            <Input
              value={pageSelection}
              onChange={(event) => setPageSelection(event.target.value)}
              placeholder="1 or 1,3,5,7 or 1-5 or 1,3,5-10"
              className="mt-2"
            />
          </label>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Supports single pages, comma-separated pages, ranges, and mixed selections.
          </p>
          {selectionResult.error ? (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {selectionResult.error}
            </p>
          ) : null}
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Info panel</h2>
          <div className="mt-5 space-y-4">
            <InfoRow label="Original page count" value={pdfInfo?.pageCount.toString() ?? "--"} />
            <InfoRow label="Selected page count" value={selectionResult.pages.length.toString()} />
            <InfoRow
              label="Estimated output size"
              value={outputSize ? formatBytes(outputSize) : formatBytes(estimatedOutputSize)}
            />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Download</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            The new PDF is generated locally with pdf-lib and contains only the selected pages.
          </p>
          {downloadUrl ? (
            <Button asChild className="mt-6 w-full">
              <a href={downloadUrl} download={downloadName}>
                <Download className="h-4 w-4" />
                Download Extracted PDF
              </a>
            </Button>
          ) : (
            <Button className="mt-6 w-full" disabled>
              {isProcessing ? <Files className="h-4 w-4 animate-pulse" /> : <Download className="h-4 w-4" />}
              Download Extracted PDF
            </Button>
          )}
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
            {error}
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 break-words text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
