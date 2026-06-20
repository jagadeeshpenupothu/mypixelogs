"use client";

/* eslint-disable @next/next/no-img-element */

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { Download, FileImage, ImageDown, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ImageDetails = {
  name: string;
  type: string;
  size: number;
  width: number;
  height: number;
  originalUrl: string;
};

type CompressedImage = {
  url: string;
  size: number;
  name: string;
  type: string;
};

type CompressionStrategy = "preserve" | "webp";

const supportedTypes = ["image/jpeg", "image/png", "image/webp"];
const qualityPresets = [100, 90, 80, 70, 60, 50];
const recommendedQuality = 85;

function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** unitIndex;

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function getExtensionFromMime(type: string): string {
  if (type === "image/png") {
    return "png";
  }

  if (type === "image/webp") {
    return "webp";
  }

  return "jpg";
}

function makeOptimizedName(name: string, type: string): string {
  const baseName = name.replace(/\.[^/.]+$/, "");
  return `${baseName}-optimized.${getExtensionFromMime(type)}`;
}

function getOutputMimeType(file: File, strategy: CompressionStrategy): string {
  if (strategy === "webp") {
    return "image/webp";
  }

  return file.type;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("The selected file could not be loaded as an image."));
    };
    image.src = objectUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("This browser could not compress the image."));
          return;
        }

        resolve(blob);
      },
      type,
      quality,
    );
  });
}

async function compressImage(
  file: File,
  quality: number,
  strategy: CompressionStrategy,
): Promise<CompressedImage> {
  const image = await loadImage(file);
  const outputMimeType = getOutputMimeType(file, strategy);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is not available in this browser.");
  }

  if (outputMimeType === "image/jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.drawImage(image, 0, 0);

  const blob = await canvasToBlob(canvas, outputMimeType, quality / 100);
  console.info("[ImageCompressor]", {
    originalSize: file.size,
    currentQuality: quality,
    compressedBlobSize: blob.size,
    inputMimeType: file.type,
    outputMimeType: blob.type || outputMimeType,
    strategy,
  });

  return {
    url: URL.createObjectURL(blob),
    size: blob.size,
    name: makeOptimizedName(file.name, blob.type || outputMimeType),
    type: blob.type || outputMimeType,
  };
}

export function ImageCompressor() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [imageDetails, setImageDetails] = useState<ImageDetails | null>(null);
  const [compressedImage, setCompressedImage] = useState<CompressedImage | null>(null);
  const [recommendedImage, setRecommendedImage] = useState<CompressedImage | null>(null);
  const [quality, setQuality] = useState(recommendedQuality);
  const [strategy, setStrategy] = useState<CompressionStrategy>("preserve");
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const savings = useMemo(() => {
    if (!imageDetails || !compressedImage) {
      return null;
    }

    const saved = Math.max(imageDetails.size - compressedImage.size, 0);
    const reduction = imageDetails.size > 0 ? Math.round((saved / imageDetails.size) * 100) : 0;

    return { saved, reduction };
  }, [compressedImage, imageDetails]);

  function clearCompressedImage() {
    if (compressedImage) {
      URL.revokeObjectURL(compressedImage.url);
    }
    setCompressedImage(null);
  }

  async function handleFile(nextFile: File) {
    clearCompressedImage();
    if (recommendedImage) {
      URL.revokeObjectURL(recommendedImage.url);
    }
    setRecommendedImage(null);
    setError(null);
    setStrategy("preserve");

    if (!supportedTypes.includes(nextFile.type)) {
      setFile(null);
      setImageDetails(null);
      setError("Unsupported file type. Please upload JPG, JPEG, PNG, or WEBP.");
      return;
    }

    try {
      const image = await loadImage(nextFile);
      const originalUrl = URL.createObjectURL(nextFile);
      setFile(nextFile);
      setImageDetails((previous) => {
        if (previous) {
          URL.revokeObjectURL(previous.originalUrl);
        }

        return {
        name: nextFile.name,
        type: nextFile.type.replace("image/", "").toUpperCase(),
        size: nextFile.size,
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height,
        originalUrl,
        };
      });

      const recommended = await compressImage(nextFile, recommendedQuality, "preserve");
      setRecommendedImage(recommended);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Image upload failed.");
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

  useEffect(() => {
    if (!file) {
      return;
    }

    let isActive = true;

    const timer = window.setTimeout(() => {
      setIsCompressing(true);
      setError(null);
      setCompressedImage((previous) => {
        if (previous) {
          URL.revokeObjectURL(previous.url);
        }

        return null;
      });

      compressImage(file, quality, strategy)
        .then((result) => {
          if (!isActive) {
            URL.revokeObjectURL(result.url);
            return;
          }

          setCompressedImage((previous) => {
            if (previous) {
              URL.revokeObjectURL(previous.url);
            }
            return result;
          });
        })
        .catch((compressionError) => {
          if (isActive) {
            setError(
              compressionError instanceof Error
                ? compressionError.message
                : "Image compression failed.",
            );
          }
        })
        .finally(() => {
          if (isActive) {
            setIsCompressing(false);
          }
        });
    }, 180);

    return () => {
      isActive = false;
      window.clearTimeout(timer);
    };
  }, [file, quality, strategy]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
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
            "flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-slate-50 p-8 text-center transition",
            isDragging ? "border-primary bg-blue-50" : "hover:border-primary/40 hover:bg-blue-50/50",
          )}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={handleInputChange}
          />
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-white">
            <ImageDown className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-foreground">Upload an image</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            Compress JPG, JPEG, PNG, and WEBP files locally in your browser.
          </p>
          <Button type="button" className="mt-6">
            Choose Image
          </Button>
        </div>

        {imageDetails ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground">Original Image</h3>
              <div className="mt-4 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md bg-slate-50">
                <img
                  src={imageDetails.originalUrl}
                  alt="Original upload preview"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground">Compressed Image</h3>
              <div className="mt-4 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md bg-slate-50">
                {compressedImage ? (
                  <img
                    src={compressedImage.url}
                    alt="Compressed image preview"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RefreshCcw className="h-4 w-4 animate-spin" />
                    Compressing
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <aside className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Compression controls</h2>

        {imageDetails ? (
          <div className="mt-5 space-y-5">
            <div className="rounded-md bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                File name
              </p>
              <p className="mt-2 break-words text-sm font-semibold text-foreground">
                {imageDetails.name}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  File type
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">{imageDetails.type}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Dimensions
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {imageDetails.width} x {imageDetails.height}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground">Compression Strategy</p>
              <div className="mt-3 grid gap-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-white p-3 text-sm transition hover:border-primary/40">
                  <input
                    type="radio"
                    name="compression-strategy"
                    value="preserve"
                    checked={strategy === "preserve"}
                    onChange={() => setStrategy("preserve")}
                    className="mt-1 accent-blue-600"
                  />
                  <span>
                    <span className="block font-semibold text-foreground">Preserve Format</span>
                    <span className="block text-muted-foreground">
                      Keep {imageDetails.type} output for true compression.
                    </span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-white p-3 text-sm transition hover:border-primary/40">
                  <input
                    type="radio"
                    name="compression-strategy"
                    value="webp"
                    checked={strategy === "webp"}
                    onChange={() => setStrategy("webp")}
                    className="mt-1 accent-blue-600"
                  />
                  <span>
                    <span className="block font-semibold text-foreground">
                      Convert to WEBP (Maximum Compression)
                    </span>
                    <span className="block text-muted-foreground">
                      Explicitly convert the output to WEBP for smaller files.
                    </span>
                  </span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Original Format
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">{imageDetails.type}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Output Format
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {compressedImage
                    ? getExtensionFromMime(compressedImage.type).toUpperCase()
                    : strategy === "webp"
                      ? "WEBP"
                      : imageDetails.type}
                </p>
              </div>
            </div>

            {imageDetails.type === "PNG" && strategy === "preserve" ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                PNG is a lossless format, so quality-based compression savings may be
                limited when preserving PNG output.
              </div>
            ) : null}

            <div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-foreground">Quality</p>
                <p className="text-sm font-bold text-primary">{quality}%</p>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={quality}
                onChange={(event) => setQuality(Number(event.target.value))}
                className="mt-4 w-full accent-blue-600"
                aria-label="Compression quality"
              />
              <div className="mt-3 grid grid-cols-3 gap-2">
                {qualityPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setQuality(preset)}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm font-semibold transition",
                      quality === preset
                        ? "border-primary bg-blue-50 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    {preset}%
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Recommended Quality
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">{recommendedQuality}%</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Expected Size: {recommendedImage ? formatBytes(recommendedImage.size) : "Calculating"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Original
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {formatBytes(imageDetails.size)}
                </p>
              </div>
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Compressed
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {compressedImage ? formatBytes(compressedImage.size) : "Calculating"}
                </p>
              </div>
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Saved
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {savings ? formatBytes(savings.saved) : "Calculating"}
                </p>
              </div>
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Reduction
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {savings ? `${savings.reduction}%` : "Calculating"}
                </p>
              </div>
            </div>

            <Button asChild size="lg" className="w-full" disabled={!compressedImage || isCompressing}>
              <a
                href={compressedImage?.url ?? "#"}
                download={compressedImage?.name}
                aria-disabled={!compressedImage || isCompressing}
              >
                <Download className="h-4 w-4" />
                Download Optimized Image
              </a>
            </Button>
          </div>
        ) : (
          <div className="mt-5 rounded-md bg-slate-50 p-5 text-sm leading-6 text-muted-foreground">
            <FileImage className="mb-3 h-5 w-5 text-primary" />
            Upload an image to see file details, quality controls, live preview,
            and compression statistics.
          </div>
        )}

        {error ? (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
            {error}
          </div>
        ) : null}
      </aside>
    </div>
  );
}
