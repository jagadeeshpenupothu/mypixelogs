"use client";

/* eslint-disable @next/next/no-img-element */

import {
  ChangeEvent,
  DragEvent,
  PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Download,
  FlipHorizontal2,
  FlipVertical2,
  ImageIcon,
  RotateCcw,
  RotateCw,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ExportFormat = "png" | "jpg" | "webp";
type CropMode = "free" | "preset" | "custom";
type DragAction = "move" | "resize";

type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ImageDetails = {
  name: string;
  type: string;
  size: number;
  width: number;
  height: number;
  originalUrl: string;
};

type CroppedImage = {
  url: string;
  blob: Blob;
  width: number;
  height: number;
  name: string;
};

type DragState = {
  action: DragAction;
  pointerId: number;
  startX: number;
  startY: number;
  startCrop: CropRect;
};

const supportedTypes = ["image/png", "image/jpeg", "image/webp"];
const exportFormats: ExportFormat[] = ["png", "jpg", "webp"];
const presetRatios = [
  { label: "1:1", description: "Instagram Post", ratio: 1 },
  { label: "4:5", description: "Instagram Portrait", ratio: 4 / 5 },
  { label: "16:9", description: "YouTube Thumbnail", ratio: 16 / 9 },
  { label: "9:16", description: "Reels/Stories", ratio: 9 / 16 },
  { label: "3:2", description: "Photo", ratio: 3 / 2 },
  { label: "4:3", description: "Classic", ratio: 4 / 3 },
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** unitIndex;

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function getMimeLabel(type: string) {
  return type.replace("image/", "").toUpperCase();
}

function getExportMimeType(format: ExportFormat) {
  if (format === "jpg") return "image/jpeg";
  return `image/${format}`;
}

function makeDownloadName(fileName: string, format: ExportFormat) {
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  return `${baseName}-cropped.${format}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
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
          reject(new Error("This browser could not export the cropped image."));
          return;
        }

        resolve(blob);
      },
      mimeType,
      quality / 100,
    );
  });
}

function normalizeCrop(crop: CropRect): CropRect {
  const minSize = 0.04;
  const width = clamp(crop.width, minSize, 1);
  const height = clamp(crop.height, minSize, 1);
  const x = clamp(crop.x, 0, 1 - width);
  const y = clamp(crop.y, 0, 1 - height);

  return { x, y, width, height };
}

function makeCenteredCrop(imageWidth: number, imageHeight: number, ratio: number | null): CropRect {
  if (!ratio) {
    return { x: 0.1, y: 0.1, width: 0.8, height: 0.8 };
  }

  let cropWidth = imageWidth * 0.82;
  let cropHeight = cropWidth / ratio;

  if (cropHeight > imageHeight * 0.82) {
    cropHeight = imageHeight * 0.82;
    cropWidth = cropHeight * ratio;
  }

  return {
    x: (imageWidth - cropWidth) / 2 / imageWidth,
    y: (imageHeight - cropHeight) / 2 / imageHeight,
    width: cropWidth / imageWidth,
    height: cropHeight / imageHeight,
  };
}

function getCroppedOutputSize(width: number, height: number, rotation: number) {
  const normalizedRotation = ((rotation % 360) + 360) % 360;

  if (normalizedRotation === 90 || normalizedRotation === 270) {
    return { width: height, height: width };
  }

  return { width, height };
}

async function cropImage({
  file,
  crop,
  imageDetails,
  format,
  quality,
  rotation,
  flipHorizontal,
  flipVertical,
}: {
  file: File;
  crop: CropRect;
  imageDetails: ImageDetails;
  format: ExportFormat;
  quality: number;
  rotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
}): Promise<CroppedImage> {
  const image = await loadImageFromFile(file);
  const sourceX = Math.round(crop.x * imageDetails.width);
  const sourceY = Math.round(crop.y * imageDetails.height);
  const sourceWidth = Math.max(1, Math.round(crop.width * imageDetails.width));
  const sourceHeight = Math.max(1, Math.round(crop.height * imageDetails.height));
  const outputSize = getCroppedOutputSize(sourceWidth, sourceHeight, rotation);
  const canvas = document.createElement("canvas");
  canvas.width = outputSize.width;
  canvas.height = outputSize.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is not available in this browser.");
  }

  const mimeType = getExportMimeType(format);

  if (mimeType === "image/jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.save();
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate((rotation * Math.PI) / 180);
  context.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    -sourceWidth / 2,
    -sourceHeight / 2,
    sourceWidth,
    sourceHeight,
  );
  context.restore();

  const blob = await canvasToBlob(canvas, mimeType, quality);

  return {
    url: URL.createObjectURL(blob),
    blob,
    width: canvas.width,
    height: canvas.height,
    name: makeDownloadName(file.name, format),
  };
}

export function ImageCropper() {
  const inputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [imageDetails, setImageDetails] = useState<ImageDetails | null>(null);
  const [croppedImage, setCroppedImage] = useState<CroppedImage | null>(null);
  const [crop, setCrop] = useState<CropRect>({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
  const [mode, setMode] = useState<CropMode>("free");
  const [selectedRatio, setSelectedRatio] = useState<number | null>(null);
  const [customRatioWidth, setCustomRatioWidth] = useState(1);
  const [customRatioHeight, setCustomRatioHeight] = useState(1);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [quality, setQuality] = useState(90);
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeRatio = useMemo(() => {
    if (mode === "preset") return selectedRatio;
    if (mode === "custom") return customRatioWidth / customRatioHeight;
    return null;
  }, [customRatioHeight, customRatioWidth, mode, selectedRatio]);

  const cropDimensions = useMemo(() => {
    if (!imageDetails) return { width: 0, height: 0 };

    const sourceWidth = Math.max(1, Math.round(crop.width * imageDetails.width));
    const sourceHeight = Math.max(1, Math.round(crop.height * imageDetails.height));

    return getCroppedOutputSize(sourceWidth, sourceHeight, rotation);
  }, [crop.height, crop.width, imageDetails, rotation]);

  function clearCroppedImage() {
    if (croppedImage) {
      URL.revokeObjectURL(croppedImage.url);
    }

    setCroppedImage(null);
  }

  async function handleFile(nextFile: File) {
    clearCroppedImage();
    setError(null);

    if (!supportedTypes.includes(nextFile.type)) {
      setFile(null);
      setImageDetails(null);
      setError("Unsupported file type. Please upload PNG, JPG, JPEG, or WEBP.");
      return;
    }

    try {
      const image = await loadImageFromFile(nextFile);
      const originalUrl = URL.createObjectURL(nextFile);
      const originalWidth = image.naturalWidth || image.width;
      const originalHeight = image.naturalHeight || image.height;

      setFile(nextFile);
      setImageDetails((previous) => {
        if (previous) URL.revokeObjectURL(previous.originalUrl);

        return {
          name: nextFile.name,
          type: getMimeLabel(nextFile.type),
          size: nextFile.size,
          width: originalWidth,
          height: originalHeight,
          originalUrl,
        };
      });
      setCrop(makeCenteredCrop(originalWidth, originalHeight, null));
      setMode("free");
      setSelectedRatio(null);
      setCustomRatioWidth(1);
      setCustomRatioHeight(1);
      setExportFormat(nextFile.type === "image/webp" ? "webp" : nextFile.type === "image/jpeg" ? "jpg" : "png");
      setQuality(90);
      setRotation(0);
      setFlipHorizontal(false);
      setFlipVertical(false);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
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

  function applyRatio(nextRatio: number | null, nextMode: CropMode) {
    setMode(nextMode);
    setSelectedRatio(nextRatio);

    if (imageDetails) {
      setCrop(makeCenteredCrop(imageDetails.width, imageDetails.height, nextRatio));
    }
  }

  function beginDrag(event: ReactPointerEvent<HTMLElement>, action: DragAction) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      action,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startCrop: crop,
    };
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const image = imageRef.current;

    if (!drag || !image || !imageDetails) return;

    const bounds = image.getBoundingClientRect();
    const deltaX = (event.clientX - drag.startX) / bounds.width;
    const deltaY = (event.clientY - drag.startY) / bounds.height;

    if (drag.action === "move") {
      setCrop(
        normalizeCrop({
          ...drag.startCrop,
          x: drag.startCrop.x + deltaX,
          y: drag.startCrop.y + deltaY,
        }),
      );
      return;
    }

    let nextWidth = clamp(drag.startCrop.width + deltaX, 0.04, 1 - drag.startCrop.x);
    let nextHeight = clamp(drag.startCrop.height + deltaY, 0.04, 1 - drag.startCrop.y);

    if (activeRatio) {
      const naturalWidth = nextWidth * imageDetails.width;
      const naturalHeight = naturalWidth / activeRatio;
      nextHeight = clamp(naturalHeight / imageDetails.height, 0.04, 1 - drag.startCrop.y);
      nextWidth = clamp((nextHeight * imageDetails.height * activeRatio) / imageDetails.width, 0.04, 1 - drag.startCrop.x);
    }

    setCrop(normalizeCrop({ ...drag.startCrop, width: nextWidth, height: nextHeight }));
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  }

  useEffect(() => {
    if (!file || !imageDetails) return;

    let isCancelled = false;

    Promise.resolve()
      .then(() => {
        if (isCancelled) return null;

        setIsCropping(true);
        setError(null);

        return cropImage({
          file,
          crop,
          imageDetails,
          format: exportFormat,
          quality,
          rotation,
          flipHorizontal,
          flipVertical,
        });
      })
      .then((nextImage) => {
        if (!nextImage) return;

        if (isCancelled) {
          URL.revokeObjectURL(nextImage.url);
          return;
        }

        setCroppedImage((previous) => {
          if (previous) URL.revokeObjectURL(previous.url);
          return nextImage;
        });
      })
      .catch((cropError) => {
        if (!isCancelled) {
          setError(cropError instanceof Error ? cropError.message : "Image crop failed.");
        }
      })
      .finally(() => {
        if (!isCancelled) setIsCropping(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [crop, exportFormat, file, flipHorizontal, flipVertical, imageDetails, quality, rotation]);

  useEffect(() => {
    return () => {
      if (imageDetails) URL.revokeObjectURL(imageDetails.originalUrl);
      if (croppedImage) URL.revokeObjectURL(croppedImage.url);
    };
  }, [croppedImage, imageDetails]);

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
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={handleInputChange}
          />
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-blue-50 text-primary shadow-sm">
            <ImageIcon className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-foreground">Upload an image</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Drag and drop a PNG, JPG, JPEG, or WEBP file here, or click to browse.
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
              <InfoBox label="Original dimensions" value={`${imageDetails.width} x ${imageDetails.height}px`} />
              <InfoBox label="Cropped dimensions" value={`${cropDimensions.width} x ${cropDimensions.height}px`} />
              <InfoBox label="Crop area" value={`${Math.round(crop.width * 100)}% x ${Math.round(crop.height * 100)}%`} />
            </div>
          </div>
        ) : null}

        {imageDetails ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-foreground">Original Image</h2>
                <p className="text-sm font-medium text-muted-foreground">
                  Drag crop area
                </p>
              </div>
              <div
                className="mt-4 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-border bg-slate-50 p-3"
                onPointerMove={handlePointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
              >
                <div className="relative max-h-full max-w-full">
                  <img
                    ref={imageRef}
                    src={imageDetails.originalUrl}
                    alt="Original upload"
                    className="max-h-[430px] max-w-full select-none object-contain"
                    draggable={false}
                  />
                  <div
                    className="absolute cursor-move border-2 border-primary bg-primary/10 shadow-[0_0_0_9999px_rgba(15,23,42,0.45)]"
                    style={{
                      left: `${crop.x * 100}%`,
                      top: `${crop.y * 100}%`,
                      width: `${crop.width * 100}%`,
                      height: `${crop.height * 100}%`,
                    }}
                    onPointerDown={(event) => beginDrag(event, "move")}
                  >
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                      {Array.from({ length: 9 }).map((_, index) => (
                        <span key={index} className="border border-white/35" />
                      ))}
                    </div>
                    <button
                      type="button"
                      aria-label="Resize crop area"
                      className="absolute -bottom-2 -right-2 h-5 w-5 rounded-full border-2 border-white bg-primary shadow"
                      onPointerDown={(event) => beginDrag(event, "resize")}
                    />
                  </div>
                </div>
              </div>
            </div>

            <PreviewCard
              title="Cropped Preview"
              imageUrl={croppedImage?.url}
              dimensions={`${cropDimensions.width} x ${cropDimensions.height}px`}
              loading={isCropping}
            />
          </div>
        ) : null}
      </div>

      <aside className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Crop modes</h2>
          <div className="mt-5 grid gap-2">
            <button
              type="button"
              onClick={() => applyRatio(null, "free")}
              className={modeButtonClass(mode === "free")}
            >
              Free Crop
            </button>
            <div className="grid grid-cols-2 gap-2">
              {presetRatios.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyRatio(preset.ratio, "preset")}
                  className={modeButtonClass(mode === "preset" && selectedRatio === preset.ratio)}
                >
                  <span className="block">{preset.label}</span>
                  <span className="block text-xs font-medium opacity-75">{preset.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-border bg-background p-4">
            <p className="text-sm font-semibold text-foreground">Custom Ratio</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Input
                type="number"
                min={1}
                value={customRatioWidth}
                onChange={(event) => {
                  const nextValue = Math.max(1, Number(event.target.value));
                  setCustomRatioWidth(nextValue);
                  applyRatio(nextValue / customRatioHeight, "custom");
                }}
              />
              <Input
                type="number"
                min={1}
                value={customRatioHeight}
                onChange={(event) => {
                  const nextValue = Math.max(1, Number(event.target.value));
                  setCustomRatioHeight(nextValue);
                  applyRatio(customRatioWidth / nextValue, "custom");
                }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Rotation</h2>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" onClick={() => setRotation((value) => value - 90)}>
              <RotateCcw className="h-4 w-4" />
              Rotate Left
            </Button>
            <Button type="button" variant="outline" onClick={() => setRotation((value) => value + 90)}>
              <RotateCw className="h-4 w-4" />
              Rotate Right
            </Button>
            <Button type="button" variant="outline" onClick={() => setFlipHorizontal((value) => !value)}>
              <FlipHorizontal2 className="h-4 w-4" />
              Flip H
            </Button>
            <Button type="button" variant="outline" onClick={() => setFlipVertical((value) => !value)}>
              <FlipVertical2 className="h-4 w-4" />
              Flip V
            </Button>
          </div>
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

          {exportFormat === "jpg" || exportFormat === "webp" ? (
            <label className="mt-5 block text-sm font-medium text-foreground">
              Quality: {quality}
              <input
                type="range"
                min={10}
                max={100}
                value={quality}
                onChange={(event) => setQuality(Number(event.target.value))}
                className="mt-3 w-full accent-primary"
              />
            </label>
          ) : null}

          {croppedImage ? (
            <Button asChild className="mt-6 w-full">
              <a href={croppedImage.url} download={croppedImage.name}>
                <Download className="h-4 w-4" />
                Download Cropped Image
              </a>
            </Button>
          ) : (
            <Button className="mt-6 w-full" disabled>
              <Download className="h-4 w-4" />
              Download Cropped Image
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

function modeButtonClass(isActive: boolean) {
  return cn(
    "rounded-md border border-border bg-background px-3 py-2 text-left text-sm font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary",
    isActive && "border-primary/40 bg-primary/10 text-primary",
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
