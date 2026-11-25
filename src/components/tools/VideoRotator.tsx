"use client";

import { useEffect, useRef, useState } from "react";
import { Download, RotateCcw, RotateCw, Upload, Video, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { rotateVideo, VideoRotateError, type Rotation } from "@/lib/video-rotate";

type LoadedVideo = { file: File; url: string };
type Exported = { url: string; name: string; size: number; angle: number };

const acceptedNames = /\.(mp4|mov|m4v)$/i;
const angles = [0, 90, 180, 270] as const;

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

function rotatedName(name: string) {
  const dot = name.lastIndexOf(".");
  return `${name.slice(0, dot)}-rotated${name.slice(dot)}`;
}

export function VideoRotator() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [video, setVideo] = useState<LoadedVideo | null>(null);
  const [angle, setAngle] = useState<number>(0);
  const [exported, setExported] = useState<Exported | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [size, setSize] = useState({ width: 16, height: 9 });
  const [error, setError] = useState("");

  useEffect(() => {
    const url = video?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [video]);

  useEffect(() => {
    const url = exported?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [exported]);

  useEffect(() => {
    // A file dropped beside the box would otherwise open in the tab.
    const ignore = (event: DragEvent) => event.preventDefault();
    window.addEventListener("dragover", ignore);
    window.addEventListener("drop", ignore);
    return () => {
      window.removeEventListener("dragover", ignore);
      window.removeEventListener("drop", ignore);
    };
  }, []);

  function loadFile(file: File | undefined) {
    if (!file) return;
    setExported(null);
    setError("");
    if (!acceptedNames.test(file.name)) {
      setVideo(null);
      setAngle(0);
      setError("Please choose an MP4, MOV or M4V video. Other formats cannot be rotated without losing quality.");
      return;
    }
    setPreviewFailed(false);
    setAngle(0);
    setSize({ width: 16, height: 9 });
    setVideo({ file, url: URL.createObjectURL(file) });
  }

  function chooseAngle(next: number) {
    setAngle(((next % 360) + 360) % 360);
    setExported(null);
    setError("");
  }

  function removeVideo() {
    setVideo(null);
    setExported(null);
    setError("");
    setAngle(0);
  }

  async function exportVideo() {
    if (!video || angle === 0) return;
    setBusy(true);
    setError("");
    try {
      const result = await rotateVideo(video.file, angle as Rotation);
      const next = { url: URL.createObjectURL(result), name: rotatedName(video.file.name), size: result.size, angle };
      setExported(next);
      const link = document.createElement("a");
      link.href = next.url;
      link.download = next.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (problem) {
      setError(
        problem instanceof VideoRotateError
          ? problem.message
          : "The video could not be read. Please choose the file again.",
      );
    } finally {
      setBusy(false);
    }
  }

  const sideways = angle % 180 !== 0;
  // Fit the turned video inside the preview box.
  const ratio = sideways ? size.height / size.width : size.width / size.height;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section
        aria-label="Video"
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          loadFile(event.dataTransfer.files[0]);
        }}
        className={`rounded-lg border bg-card p-4 transition-colors duration-200 sm:p-6 ${
          dragging ? "border-primary bg-primary/5" : "border-dashed border-border"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/x-m4v,.mp4,.mov,.m4v"
          className="sr-only"
          tabIndex={-1}
          aria-label="Choose a video"
          onChange={(event) => {
            loadFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />

        {video ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-semibold text-foreground">{video.file.name}</p>
              <Button type="button" variant="ghost" size="icon" aria-label="Remove video" onClick={removeVideo}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-3 flex h-[min(60vh,480px)] items-center justify-center overflow-hidden rounded-md bg-black [container-type:size]">
              {previewFailed ? (
                <p className="max-w-sm p-6 text-center text-sm leading-6 text-white/80">
                  Your browser cannot play this video here, but you can still rotate and export it.
                </p>
              ) : (
                <div
                  className="relative"
                  style={{ aspectRatio: `${ratio}`, width: `min(100cqw, calc(100cqh * ${ratio}))` }}
                >
                  <video
                    key={video.url}
                    src={video.url}
                    muted
                    loop
                    autoPlay
                    playsInline
                    onLoadedMetadata={(event) => {
                      const { videoWidth, videoHeight } = event.currentTarget;
                      if (videoWidth && videoHeight) setSize({ width: videoWidth, height: videoHeight });
                      else setPreviewFailed(true);
                    }}
                    onError={() => setPreviewFailed(true)}
                    aria-label="Rotation preview"
                    className="absolute left-1/2 top-1/2 max-w-none transition-transform duration-200"
                    style={{
                      width: sideways ? `${100 / ratio}%` : "100%",
                      transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                    }}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white">
              <Video className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="mt-4 text-lg font-semibold text-foreground">Drag a video here</p>
            <p className="mt-1 text-sm text-muted-foreground">MP4, MOV or M4V. It stays on your device.</p>
            <Button type="button" className="mt-4" onClick={() => inputRef.current?.click()}>
              <Upload className="h-4 w-4" aria-hidden="true" />
              Choose video
            </Button>
          </div>
        )}
      </section>

      <section aria-label="Rotation" className="h-fit rounded-lg border border-border bg-card p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">Rotation angle</h2>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" disabled={!video} onClick={() => chooseAngle(angle - 90)}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Left
          </Button>
          <Button type="button" variant="outline" disabled={!video} onClick={() => chooseAngle(angle + 90)}>
            <RotateCw className="h-4 w-4" aria-hidden="true" />
            Right
          </Button>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2" role="group" aria-label="Choose an angle">
          {angles.map((value) => (
            <button
              key={value}
              type="button"
              disabled={!video}
              aria-pressed={angle === value}
              onClick={() => chooseAngle(value)}
              className={`h-10 rounded-md border text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 disabled:opacity-50 ${
                angle === value && video
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              {value}°
            </button>
          ))}
        </div>

        <Button type="button" size="lg" className="mt-5 w-full" disabled={!video || angle === 0 || busy} onClick={exportVideo}>
          <Download className="h-4 w-4" aria-hidden="true" />
          {busy ? "Exporting..." : "Export video"}
        </Button>
        {video ? (
          <Button type="button" variant="ghost" className="mt-2 w-full" onClick={() => inputRef.current?.click()}>
            Choose another video
          </Button>
        ) : null}

        <div role="status" className="mt-3 text-sm leading-6">
          {error ? <p className="text-red-600 dark:text-red-400">{error}</p> : null}
          {!error && exported && video ? (
            <p className="text-muted-foreground">
              Exported at {exported.angle}°. Original {formatSize(video.file.size)}, exported {formatSize(exported.size)}.{" "}
              <a className="font-semibold text-primary" href={exported.url} download={exported.name}>
                Download again
              </a>
            </p>
          ) : null}
          {!error && !exported && video ? (
            <p className="text-muted-foreground">
              {angle === 0 ? "Choose an angle to export." : `Size stays ${formatSize(video.file.size)} after export.`}
            </p>
          ) : null}
        </div>

        <p className="mt-4 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
          The video is not re-encoded, so quality, sound and file size stay the same. The turn is saved as a rotation
          setting in the file. Most players and apps follow it, but a few older ones ignore it.
        </p>
      </section>
    </div>
  );
}
