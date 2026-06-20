"use client";

/* eslint-disable @next/next/no-img-element */

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { Download, FileImage, Lock, RefreshCcw, Unlock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ResizeMode = "dimensions" | "percentage";
type ExportFormat = "png" | "jpg" | "webp";

type ImageDetails = {
  name: string;
  type: string;
  size: number;
  width: number;
  height: number;
  originalUrl: string;
};

type ResizedImage = {
  url: string;
  blob: Blob;
  width: number;
  height: number;
  name: string;
  format: ExportFormat;
};

const supportedTypes = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const percentageOptions = [25, 50, 75, 100, 150, 200];
const exportFormats: ExportFormat[] = ["png", "jpg", "webp"];

function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** unitIndex;

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function getMimeLabel(type: string) {
  if (type === "image/svg+xml") {
    return "SVG";
  }

  return type.replace("image/", "").toUpperCase();
}

function getExportMimeType(format: ExportFormat) {
  if (format === "jpg") {
    return "image/jpeg";
  }

  return `image/${format}`;
}

function makeDownloadName(fileName: string, format: ExportFormat) {
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  return `${baseName}-resized.${format}`;
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
      reject(new Error("The selected image could not be loaded."));
    };
    image.src = objectUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("This browser could not export the resized image."));
          return;
        }

        resolve(blob);
      },
      mimeType,
      quality / 100,
    );
  });
}

async function resizeImage({
  file,
  width,
  height,
  format,
  quality,
}: {
  file: File;
  width: number;
  height: number;
  format: ExportFormat;
  quality: number;
}): Promise<ResizedImage> {
  const image = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is not available in this browser.");
  }

  const outputMimeType = getExportMimeType(format);

  if (outputMimeType === "image/jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, width, height);

  const blob = await canvasToBlob(canvas, outputMimeType, quality);

  return {
    url: URL.createObjectURL(blob),
    blob,
    width,
    height,
    name: makeDownloadName(file.name, format),
    format,
  };
}

export function ImageResizer() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [imageDetails, setImageDetails] = useState<ImageDetails | null>(null);
  const [resizedImage, setResizedImage] = useState<ResizedImage | null>(null);
  const [mode, setMode] = useState<ResizeMode>("dimensions");
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [percentage, setPercentage] = useState(100);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [quality, setQuality] = useState(90);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aspectRatio = useMemo(() => {
    if (!imageDetails || imageDetails.height === 0) {
      return 1;
    }

    return imageDetails.width / imageDetails.height;
  }, [imageDetails]);

  const targetDimensions = useMemo(() => {
    if (!imageDetails) {
      return { width: 0, height: 0 };
    }

    if (mode === "percentage") {
      return {
        width: Math.max(1, Math.round(imageDetails.width * (percentage / 100))),
        height: Math.max(1, Math.round(imageDetails.height * (percentage / 100))),
      };
    }

    return {
      width: Math.max(1, Math.round(width || imageDetails.width)),
      height: Math.max(1, Math.round(height || imageDetails.height)),
    };
  }, [height, imageDetails, mode, percentage, width]);

  function clearResizedImage() {
    if (resizedImage) {
      URL.revokeObjectURL(resizedImage.url);
    }

    setResizedImage(null);
  }

  async function handleFile(nextFile: File) {
    clearResizedImage();
    setError(null);

    if (!supportedTypes.includes(nextFile.type)) {
      setFile(null);
      setImageDetails(null);
      setError("Unsupported file type. Please upload PNG, JPG, JPEG, WEBP, or SVG.");
      return;
    }

    try {
      const image = await loadImageFromFile(nextFile);
      const originalUrl = URL.createObjectURL(nextFile);
      const originalWidth = image.naturalWidth || image.width;
      const originalHeight = image.naturalHeight || image.height;

      setFile(nextFile);
      setImageDetails((previous) => {
        if (previous) {
          URL.revokeObjectURL(previous.originalUrl);
        }

        return {
          name: nextFile.name,
          type: getMimeLabel(nextFile.type),
          size: nextFile.size,
          width: originalWidth,
          height: originalHeight,
          originalUrl,
        };
      });
      setMode("dimensions");
      setWidth(originalWidth);
      setHeight(originalHeight);
      setPercentage(100);
      setLockAspectRatio(true);
      setExportFormat(nextFile.type === "image/webp" ? "webp" : nextFile.type === "image/jpeg" ? "jpg" : "png");
      setQuality(90);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];
    if (nextFile) {
      void handleFile(nextFile);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    const nextFile = event.dataTransfer.files[0];
    if (nextFile) {
      void handleFile(nextFile);
    }
  }

  function updateWidth(nextWidth: number) {
    const safeWidth = Math.max(1, nextWidth);
    setWidth(safeWidth);

    if (lockAspectRatio) {
      setHeight(Math.max(1, Math.round(safeWidth / aspectRatio)));
    }
  }

  function updateHeight(nextHeight: number) {
    const safeHeight = Math.max(1, nextHeight);
    setHeight(safeHeight);

    if (lockAspectRatio) {
      setWidth(Math.max(1, Math.round(safeHeight * aspectRatio)));
    }
  }

  useEffect(() => {
    if (!file || !imageDetails) {
      return;
    }

    let isCancelled = false;

    Promise.resolve()
      .then(() => {
        if (isCancelled) {
          return null;
        }

        setIsResizing(true);
        setError(null);

        return resizeImage({
          file,
          width: targetDimensions.width,
          height: targetDimensions.height,
          format: exportFormat,
          quality,
        });
      })
      .then((nextImage) => {
        if (!nextImage) {
          return;
        }

        if (isCancelled) {
          URL.revokeObjectURL(nextImage.url);
          return;
        }

        setResizedImage((previous) => {
          if (previous) {
            URL.revokeObjectURL(previous.url);
          }

          return nextImage;
        });
      })
      .catch((resizeError) => {
        if (!isCancelled) {
          setError(resizeError instanceof Error ? resizeError.message : "Image resize failed.");
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsResizing(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [exportFormat, file, imageDetails, quality, targetDimensions.height, targetDimensions.width]);

  useEffect(() => {
    return () => {
      if (imageDetails) {
        URL.revokeObjectURL(imageDetails.originalUrl);
      }

      if (resizedImage) {
        URL.revokeObjectURL(resizedImage.url);
      }
    };
  }, [imageDetails, resizedImage]);

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
            if (event.key === "Enter" || event.key === " ") {
              inputRef.current?.click();
            }
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="sr-only"
            onChange={handleInputChange}
          />
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-blue-50 text-primary shadow-sm">
            <FileImage className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-foreground">Upload an image</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Drag and drop a PNG, JPG, JPEG, WEBP, or SVG file here, or click to browse.
          </p>
        </div>

        {imageDetails ? (
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <Badge variant="secondary" className="bg-blue-50 text-primary">
                  {imageDetails.type}
                </Badge>
                <h2 className="mt-3 text-xl font-semibold text-foreground">{imageDetails.name}</h2>
              </div>
              <p className="text-sm font-medium text-muted-foreground">{formatBytes(imageDetails.size)}</p>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <InfoBox label="Original width" value={`${imageDetails.width}px`} />
              <InfoBox label="Original height" value={`${imageDetails.height}px`} />
              <InfoBox label="New dimensions" value={`${targetDimensions.width} x ${targetDimensions.height}px`} />
            </div>
          </div>
        ) : null}

        {imageDetails ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <PreviewCard title="Original Image" imageUrl={imageDetails.originalUrl} dimensions={`${imageDetails.width} x ${imageDetails.height}px`} />
            <PreviewCard
              title="Resized Preview"
              imageUrl={resizedImage?.url}
              dimensions={`${targetDimensions.width} x ${targetDimensions.height}px`}
              loading={isResizing}
            />
          </div>
        ) : null}
      </div>

      <aside className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Resize options</h2>
          <div className="mt-5 grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setMode("dimensions")}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition",
                mode === "dimensions" && "bg-background text-foreground shadow-sm",
              )}
            >
              Dimensions
            </button>
            <button
              type="button"
              onClick={() => setMode("percentage")}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition",
                mode === "percentage" && "bg-background text-foreground shadow-sm",
              )}
            >
              Percentage
            </button>
          </div>

          {mode === "dimensions" ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <label className="text-sm font-medium text-foreground">
                Width
                <Input
                  type="number"
                  min={1}
                  value={width || ""}
                  onChange={(event) => updateWidth(Number(event.target.value))}
                  className="mt-2"
                />
              </label>
              <label className="text-sm font-medium text-foreground">
                Height
                <Input
                  type="number"
                  min={1}
                  value={height || ""}
                  onChange={(event) => updateHeight(Number(event.target.value))}
                  className="mt-2"
                />
              </label>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-3 gap-2">
              {percentageOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setPercentage(option)}
                  className={cn(
                    "rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary",
                    percentage === option && "border-primary/40 bg-primary/10 text-primary",
                  )}
                >
                  {option}%
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setLockAspectRatio((current) => !current)}
            className="mt-5 inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
          >
            {lockAspectRatio ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            {lockAspectRatio ? "Aspect ratio locked" : "Aspect ratio unlocked"}
          </button>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Export options</h2>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {exportFormats.map((format) => (
              <button
                key={format}
                type="button"
                onClick={() => setExportFormat(format)}
                className={cn(
                  "rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold uppercase text-muted-foreground transition hover:border-primary/40 hover:text-primary",
                  exportFormat === format && "border-primary/40 bg-primary/10 text-primary",
                )}
              >
                {format}
              </button>
            ))}
          </div>

          {(exportFormat === "jpg" || exportFormat === "webp") ? (
            <label className="mt-5 block text-sm font-medium text-foreground">
              Quality: {quality}
              <input
                type="range"
                min={10}
                max={100}
                step={1}
                value={quality}
                onChange={(event) => setQuality(Number(event.target.value))}
                className="mt-3 w-full accent-primary"
              />
            </label>
          ) : null}

          {resizedImage ? (
            <Button asChild className="mt-6 w-full">
              <a href={resizedImage.url} download={resizedImage.name}>
                {isResizing ? (
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download Resized Image
              </a>
            </Button>
          ) : (
            <Button className="mt-6 w-full" disabled>
              {isResizing ? (
                <RefreshCcw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download Resized Image
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
      <p className="mt-2 text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}

function PreviewCard({
  title,
  imageUrl,
  dimensions,
  loading,
}: {
  title: string;
  imageUrl?: string;
  dimensions: string;
  loading?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm font-medium text-muted-foreground">{dimensions}</p>
      </div>
      <div className="mt-4 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-border bg-slate-50">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="max-h-full max-w-full object-contain" />
        ) : (
          <p className="text-sm text-muted-foreground">
            {loading ? "Generating preview..." : "Preview will appear here"}
          </p>
        )}
      </div>
    </div>
  );
}
