"use client";

import { ChangeEvent, DragEvent, useMemo, useRef, useState } from "react";
import { Download, FileCheck2, FileUp, RefreshCcw, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  converterFormatLabels,
  getAvailableOutputFormats,
  isConverterFormat,
  type ConverterFormat,
} from "@/data/converter-formats";
import { cn } from "@/lib/utils";

type ConvertedFile = {
  name: string;
  url: string;
  type: ConverterFormat;
};

const canvasMimeTypes: Partial<Record<ConverterFormat, string>> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
};

function getFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** unitIndex;

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function createDownloadName(fileName: string, targetFormat: ConverterFormat): string {
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  return `${baseName}.${targetFormat === "jpeg" ? "jpg" : targetFormat}`;
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("The uploaded file could not be loaded as an image."));
    };
    image.src = objectUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("This browser could not export the selected format."));
          return;
        }

        if (blob.type !== mimeType) {
          reject(new Error("This browser does not support encoding the selected format."));
          return;
        }

        resolve(blob);
      },
      mimeType,
      0.92,
    );
  });
}

async function convertImage(file: File, targetFormat: ConverterFormat): Promise<Blob> {
  const mimeType = canvasMimeTypes[targetFormat];

  if (!mimeType) {
    throw new Error(
      `${converterFormatLabels[targetFormat]} export is listed for planning, but this browser-only MVP cannot encode it without an additional encoder.`,
    );
  }

  const image = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is not available in this browser.");
  }

  if (mimeType === "image/jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.drawImage(image, 0, 0);
  return canvasToBlob(canvas, mimeType);
}

export function UniversalConverter() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [sourceFormat, setSourceFormat] = useState<ConverterFormat | null>(null);
  const [targetFormat, setTargetFormat] = useState<ConverterFormat | null>(null);
  const [convertedFile, setConvertedFile] = useState<ConvertedFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const availableFormats = useMemo(
    () => (sourceFormat ? getAvailableOutputFormats(sourceFormat) : []),
    [sourceFormat],
  );

  function resetConversion() {
    if (convertedFile) {
      URL.revokeObjectURL(convertedFile.url);
    }
    setConvertedFile(null);
    setError(null);
  }

  function handleFile(nextFile: File) {
    resetConversion();

    const extension = getFileExtension(nextFile.name);
    if (!isConverterFormat(extension)) {
      setFile(nextFile);
      setSourceFormat(null);
      setTargetFormat(null);
      setError("Unsupported file type. Upload PNG, JPG, JPEG, WEBP, SVG, ICO, AVIF, BMP, TIFF, or PDF.");
      return;
    }

    const detectedFormat = extension;
    const nextFormats = getAvailableOutputFormats(detectedFormat);

    setFile(nextFile);
    setSourceFormat(detectedFormat);
    setTargetFormat(nextFormats[0] ?? null);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];
    if (nextFile) {
      handleFile(nextFile);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    const nextFile = event.dataTransfer.files[0];
    if (nextFile) {
      handleFile(nextFile);
    }
  }

  async function handleConvert() {
    if (!file || !sourceFormat || !targetFormat) {
      return;
    }

    resetConversion();
    setIsConverting(true);

    try {
      if (sourceFormat === "pdf") {
        throw new Error("PDF to image conversion needs a PDF renderer such as PDF.js in a future phase.");
      }

      if (sourceFormat === "ico" || sourceFormat === "tiff") {
        throw new Error(`${converterFormatLabels[sourceFormat]} decoding needs a browser-compatible decoder in a future phase.`);
      }

      if (targetFormat === "pdf") {
        throw new Error("Image to PDF packaging needs a PDF writer such as pdf-lib in a future phase.");
      }

      const blob = await convertImage(file, targetFormat);
      const url = URL.createObjectURL(blob);

      setConvertedFile({
        name: createDownloadName(file.name, targetFormat),
        type: targetFormat,
        url,
      });
    } catch (conversionError) {
      setError(conversionError instanceof Error ? conversionError.message : "Conversion failed.");
    } finally {
      setIsConverting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex min-h-[360px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-slate-50 p-8 text-center transition",
          isDragging ? "border-primary bg-blue-50" : "hover:border-primary/40 hover:bg-blue-50/50",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".png,.jpg,.jpeg,.webp,.svg,.ico,.avif,.bmp,.tiff,.pdf"
          onChange={handleInputChange}
        />
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-white">
          <FileUp className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-2xl font-bold text-foreground">Drop a file to convert</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          Upload PNG, JPG, WEBP, SVG, ICO, or PDF files. The converter detects the
          source format and shows matching export options.
        </p>
        <Button type="button" className="mt-6">
          Choose File
        </Button>
      </div>

      <aside className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Conversion details</h2>

        {file ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-md bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                File name
              </p>
              <p className="mt-2 break-words text-sm font-semibold text-foreground">{file.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  File size
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">{formatBytes(file.size)}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Source format
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {sourceFormat ? converterFormatLabels[sourceFormat] : "Unknown"}
                </p>
              </div>
            </div>

            {availableFormats.length > 0 ? (
              <div>
                <p className="text-sm font-semibold text-foreground">Available export formats</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {availableFormats.map((format) => (
                    <button
                      key={format}
                      type="button"
                      onClick={() => setTargetFormat(format)}
                      className={cn(
                        "rounded-md border px-3 py-2 text-sm font-semibold transition",
                        targetFormat === format
                          ? "border-primary bg-blue-50 text-primary"
                          : "border-border bg-white text-muted-foreground hover:border-primary/40 hover:text-foreground",
                      )}
                    >
                      {converterFormatLabels[format]}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <Button
              type="button"
              size="lg"
              className="w-full"
              disabled={!targetFormat || !sourceFormat || isConverting}
              onClick={handleConvert}
            >
              {isConverting ? (
                <RefreshCcw className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              Convert
            </Button>
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            File details and valid export formats appear here after upload.
          </p>
        )}

        {error ? (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
            {error}
          </div>
        ) : null}

        {convertedFile ? (
          <div className="mt-5 rounded-md border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <FileCheck2 className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Conversion ready</p>
                <p className="mt-1 text-sm text-muted-foreground">{convertedFile.name}</p>
              </div>
            </div>
            <Button asChild className="mt-4 w-full">
              <a href={convertedFile.url} download={convertedFile.name}>
                <Download className="h-4 w-4" />
                Download {converterFormatLabels[convertedFile.type]}
              </a>
            </Button>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
