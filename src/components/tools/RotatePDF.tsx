"use client";

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { degrees, PDFDocument } from "pdf-lib";
import { Download, FileText, RotateCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type RotateMode = "all" | "selected" | "range";
type RotationOption = 90 | -90 | 180;

type PdfInfo = {
  name: string;
  size: number;
  pageCount: number;
  pageSizes: Array<{
    width: number;
    height: number;
    baseRotation: number;
  }>;
};

const rotationOptions: Array<{ label: string; value: RotationOption }> = [
  { label: "90° Clockwise", value: 90 },
  { label: "90° Counter Clockwise", value: -90 },
  { label: "180°", value: 180 },
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** unitIndex;

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function makeDownloadName(fileName: string) {
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  return `${baseName}-rotated.pdf`;
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

function parsePageSelection(input: string, pageCount: number): number[] {
  const pages = new Set<number>();

  input
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      if (part.includes("-")) {
        const [startText, endText] = part.split("-");
        const start = Number(startText);
        const end = Number(endText);

        if (!Number.isInteger(start) || !Number.isInteger(end)) return;

        const min = Math.max(1, Math.min(start, end));
        const max = Math.min(pageCount, Math.max(start, end));

        for (let page = min; page <= max; page += 1) {
          pages.add(page);
        }

        return;
      }

      const page = Number(part);
      if (Number.isInteger(page) && page >= 1 && page <= pageCount) {
        pages.add(page);
      }
    });

  return [...pages].sort((a, b) => a - b);
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
        baseRotation: page.getRotation().angle,
      };
    }),
  };
}

async function rotatePdf(file: File, pagesToRotate: number[], rotation: RotationOption) {
  const bytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(bytes);
  const pages = pdfDoc.getPages();

  pagesToRotate.forEach((pageNumber) => {
    const page = pages[pageNumber - 1];
    if (!page) return;

    page.setRotation(degrees(normalizeRotation(page.getRotation().angle + rotation)));
  });

  return pdfDoc.save();
}

export function RotatePDF() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pdfInfo, setPdfInfo] = useState<PdfInfo | null>(null);
  const [mode, setMode] = useState<RotateMode>("all");
  const [rotation, setRotation] = useState<RotationOption>(90);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [pageRange, setPageRange] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pagesToRotate = useMemo(() => {
    if (!pdfInfo) return [];

    if (mode === "all") {
      return Array.from({ length: pdfInfo.pageCount }, (_, index) => index + 1);
    }

    if (mode === "selected") {
      return selectedPages;
    }

    return parsePageSelection(pageRange, pdfInfo.pageCount);
  }, [mode, pageRange, pdfInfo, selectedPages]);

  const rotationLabel = useMemo(() => {
    return rotationOptions.find((option) => option.value === rotation)?.label ?? "90° Clockwise";
  }, [rotation]);

  function clearDownloadUrl() {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }

    setDownloadUrl(null);
  }

  async function handleFile(nextFile: File) {
    clearDownloadUrl();
    setError(null);
    setSelectedPages([]);
    setPageRange("");
    setMode("all");

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

  function toggleSelectedPage(pageNumber: number) {
    setSelectedPages((current) =>
      current.includes(pageNumber)
        ? current.filter((page) => page !== pageNumber)
        : [...current, pageNumber].sort((a, b) => a - b),
    );
  }

  async function buildRotatedPdf() {
    if (!file || !pdfInfo) return;

    if (pagesToRotate.length === 0) {
      setError("Choose at least one page to rotate.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const rotatedBytes = await rotatePdf(file, pagesToRotate, rotation);
      clearDownloadUrl();
      const pdfBuffer = rotatedBytes.buffer.slice(
        rotatedBytes.byteOffset,
        rotatedBytes.byteOffset + rotatedBytes.byteLength,
      ) as ArrayBuffer;
      const blob = new Blob([pdfBuffer], { type: "application/pdf" });
      setDownloadUrl(URL.createObjectURL(blob));
      setDownloadName(makeDownloadName(file.name));
    } catch (rotateError) {
      setError(rotateError instanceof Error ? rotateError.message : "PDF rotation failed.");
    } finally {
      setIsProcessing(false);
    }
  }

  useEffect(() => {
    if (!file || !pdfInfo) return;

    void Promise.resolve().then(() => buildRotatedPdf());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, mode, pageRange, pdfInfo, rotation, selectedPages]);

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
            Drag and drop a PDF here, or click to browse. Your file stays in the browser.
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
                <InfoBox label="Total Pages" value={pdfInfo.pageCount.toString()} />
                <InfoBox label="File Size" value={formatBytes(pdfInfo.size)} />
                <InfoBox label="Rotation Applied" value={`${rotationLabel} (${pagesToRotate.length} pages)`} />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Page thumbnails</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Select pages in Selected Pages mode. Thumbnails show resulting orientation.
                  </p>
                </div>
                <Badge>{isProcessing ? "Updating preview" : "Live preview"}</Badge>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pdfInfo.pageSizes.map((page, index) => {
                  const pageNumber = index + 1;
                  const isRotated = pagesToRotate.includes(pageNumber);
                  const previewRotation = normalizeRotation(page.baseRotation + (isRotated ? rotation : 0));
                  const previewSize = getPreviewOrientation(page.width, page.height, previewRotation);
                  const isSelected = selectedPages.includes(pageNumber);
                  const isPortrait = previewSize.height >= previewSize.width;

                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => {
                        if (mode === "selected") toggleSelectedPage(pageNumber);
                      }}
                      className={cn(
                        "rounded-lg border border-border bg-background p-4 text-left transition hover:border-primary/40",
                        mode === "selected" && "cursor-pointer",
                        isSelected && "border-primary/50 bg-primary/10",
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-foreground">Page {pageNumber}</span>
                        <span className="text-xs font-medium text-muted-foreground">{previewRotation}°</span>
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
                      <p className="mt-3 text-xs text-muted-foreground">
                        {isRotated ? "Rotation applied" : "Original orientation"}
                      </p>
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
          <h2 className="text-lg font-semibold text-foreground">Rotation</h2>
          <div className="mt-5 grid gap-2">
            {rotationOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRotation(option.value)}
                className={cn(
                  "rounded-md border border-border bg-background px-3 py-2 text-left text-sm font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary",
                  rotation === option.value && "border-primary/40 bg-primary/10 text-primary",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Mode</h2>
          <div className="mt-5 grid gap-2">
            <ModeButton active={mode === "all"} onClick={() => setMode("all")}>
              Entire PDF
            </ModeButton>
            <ModeButton active={mode === "selected"} onClick={() => setMode("selected")}>
              Selected Pages
            </ModeButton>
            <ModeButton active={mode === "range"} onClick={() => setMode("range")}>
              Multiple Page Range
            </ModeButton>
          </div>

          {mode === "range" ? (
            <label className="mt-5 block text-sm font-medium text-foreground">
              Pages
              <Input
                value={pageRange}
                onChange={(event) => setPageRange(event.target.value)}
                placeholder="1-5 or 1,3,5,7"
                className="mt-2"
              />
              <span className="mt-2 block text-xs leading-5 text-muted-foreground">
                Examples: 1, 3, 5 or 1-5 or 1,3,5,7
              </span>
            </label>
          ) : null}

          {mode === "selected" ? (
            <p className="mt-5 text-sm leading-6 text-muted-foreground">
              Click page thumbnails to select pages. Selected:{" "}
              <span className="font-semibold text-foreground">
                {selectedPages.length > 0 ? selectedPages.join(", ") : "None"}
              </span>
            </p>
          ) : null}
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Download</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            The rotated PDF is generated locally with pdf-lib and never uploaded.
          </p>
          {downloadUrl ? (
            <Button asChild className="mt-6 w-full">
              <a href={downloadUrl} download={downloadName}>
                <Download className="h-4 w-4" />
                Download Rotated PDF
              </a>
            </Button>
          ) : (
            <Button className="mt-6 w-full" disabled>
              {isProcessing ? (
                <RotateCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download Rotated PDF
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

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border border-border bg-background px-3 py-2 text-left text-sm font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary",
        active && "border-primary/40 bg-primary/10 text-primary",
      )}
    >
      {children}
    </button>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}
