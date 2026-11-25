"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Film, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  CompressOptions,
  CompressProgress,
  CompressResult,
  OutputCodec,
  QualityLevel,
  VideoDetails,
} from "@/lib/video-compress";

type Loaded = { file: File; url: string; details: VideoDetails; hevc: boolean; avc: boolean };
type Finished = CompressResult & { url: string | null; name: string };

const levels: { id: QualityLevel; label: string; note: string }[] = [
  { id: "best", label: "Keep quality", note: "Very close to the original" },
  { id: "balanced", label: "Balanced", note: "Small differences up close, smaller file" },
  { id: "small", label: "Smallest file", note: "Some loss you may notice" },
];

const stageText: Record<CompressProgress["stage"], string> = {
  testing: "Finding the smallest file that keeps this quality",
  encoding: "Compressing the video",
  checking: "Checking quality against the original",
};

const selectClass =
  "mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 disabled:opacity-50";

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

function formatTime(seconds: number) {
  const whole = Math.round(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

export function VideoCompressor() {
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const loadRef = useRef(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [opening, setOpening] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [level, setLevel] = useState<QualityLevel>("best");
  const [codec, setCodec] = useState<OutputCodec>("avc");
  const [maxShortSide, setMaxShortSide] = useState(0);
  const [removeSound, setRemoveSound] = useState(false);
  const [progress, setProgress] = useState<CompressProgress | null>(null);
  const [result, setResult] = useState<Finished | null>(null);
  const [error, setError] = useState("");
  const busy = progress !== null;

  useEffect(() => {
    const url = loaded?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [loaded]);

  useEffect(() => {
    const url = result?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [result]);

  useEffect(() => {
    const ignore = (event: DragEvent) => event.preventDefault();
    window.addEventListener("dragover", ignore);
    window.addEventListener("drop", ignore);
    return () => {
      window.removeEventListener("dragover", ignore);
      window.removeEventListener("drop", ignore);
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!busy) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [busy]);

  async function loadFile(file: File | undefined) {
    if (!file || busy) return;
    const turn = (loadRef.current += 1);
    setLoaded(null);
    setResult(null);
    setError("");
    setOpening(true);
    try {
      const engine = await import("@/lib/video-compress");
      if (!engine.supportsCompression()) throw new engine.VideoCompressError("This browser cannot compress video. Try the latest Chrome, Edge or Safari.");
      if (file.size > engine.MAX_FILE_SIZE) throw new engine.VideoCompressError("Please choose a video smaller than 2 GB.");
      const details = await engine.readVideoDetails(file);
      const [avc, hevc] = await Promise.all([
        engine.canUseCodec("avc", details.width, details.height),
        engine.canUseCodec("hevc", details.width, details.height),
      ]);
      if (!avc && !hevc) throw new engine.VideoCompressError("This browser cannot compress a video of this size. Try Chrome or Edge.");
      if (turn !== loadRef.current) return;
      setCodec(avc ? "avc" : "hevc");
      setMaxShortSide(0);
      setLoaded({ file, url: URL.createObjectURL(file), details, avc, hevc });
    } catch (problem) {
      if (turn !== loadRef.current) return;
      const engine = await import("@/lib/video-compress").catch(() => null);
      setError(
        engine && problem instanceof engine.VideoCompressError
          ? problem.message
          : "This video could not be opened. Try MP4, MOV, MKV or WebM.",
      );
    } finally {
      if (turn === loadRef.current) setOpening(false);
    }
  }

  function change<T>(set: (value: T) => void, value: T) {
    set(value);
    setResult(null);
    setError("");
  }

  async function start() {
    if (!loaded || busy) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setResult(null);
    setError("");
    setProgress({ stage: "testing", value: 0 });
    const engine = await import("@/lib/video-compress");
    try {
      const options: CompressOptions = { level, codec, maxShortSide, removeSound };
      const done = await engine.compressVideo(loaded.file, loaded.details, options, setProgress, controller.signal);
      const base = loaded.file.name.replace(/\.[^.]+$/, "");
      setResult({ ...done, url: done.blob ? URL.createObjectURL(done.blob) : null, name: `${base}-compressed.mp4` });
    } catch (problem) {
      if (!(problem instanceof engine.VideoCompressCanceled)) {
        setError(
          problem instanceof engine.VideoCompressError
            ? problem.message
            : "The video could not be compressed. Try a smaller size, another format or Chrome.",
        );
      }
    } finally {
      setProgress(null);
      abortRef.current = null;
    }
  }

  const details = loaded?.details;
  const shortSide = details ? Math.min(details.width, details.height) : 0;
  const sizes = [2160, 1440, 1080, 720, 480].filter((value) => value < shortSide);
  const percent = progress ? Math.round(Math.min(1, Math.max(0, progress.value)) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section
        aria-label="Video"
        onDragOver={(event) => {
          event.preventDefault();
          if (!busy) setDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void loadFile(event.dataTransfer.files[0]);
        }}
        className={`h-fit rounded-lg border bg-card p-4 transition-colors duration-200 sm:p-6 ${
          dragging ? "border-primary bg-primary/5" : "border-dashed border-border"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/*,.mkv"
          className="sr-only"
          tabIndex={-1}
          aria-label="Choose a video"
          onChange={(event) => {
            void loadFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        {loaded && details ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-semibold text-foreground">{loaded.file.name}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove video"
                disabled={busy}
                onClick={() => {
                  setLoaded(null);
                  setResult(null);
                  setError("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <video
              key={result?.url ?? loaded.url}
              src={result?.url ?? loaded.url}
              controls
              muted
              playsInline
              aria-label={result?.url ? "Compressed video" : "Original video"}
              className="mt-3 max-h-[min(56vh,460px)] w-full rounded-md bg-black"
            />
            <p className="mt-3 text-sm text-muted-foreground">
              {result?.url ? "Showing the compressed video. " : ""}
              Original: {formatSize(loaded.file.size)}, {details.width}×{details.height}, {Math.round(details.frameRate)} fps,{" "}
              {formatTime(details.duration)}, {(details.bitrate / 1e6).toFixed(1)} Mbps
            </p>
          </>
        ) : (
          <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white">
              <Film className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="mt-4 text-lg font-semibold text-foreground">{opening ? "Opening video..." : "Drag a video here"}</p>
            <p className="mt-1 text-sm text-muted-foreground">MP4, MOV, MKV or WebM, up to 2 GB. It stays on your device.</p>
            <Button type="button" className="mt-4" disabled={opening} onClick={() => inputRef.current?.click()}>
              <Upload className="h-4 w-4" aria-hidden="true" />
              Choose video
            </Button>
          </div>
        )}
      </section>

      <section aria-label="Settings" className="h-fit rounded-lg border border-border bg-card p-4 sm:p-6">
        <fieldset disabled={!loaded || busy}>
          <legend className="text-lg font-semibold text-foreground">Quality</legend>
          <div className="mt-3 grid gap-2">
            {levels.map((item) => (
              <label
                key={item.id}
                className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 ${
                  level === item.id ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <input
                  type="radio"
                  name="quality"
                  className="mt-1"
                  checked={level === item.id}
                  onChange={() => change(setLevel, item.id)}
                />
                <span>
                  <span className="block text-sm font-semibold text-foreground">{item.label}</span>
                  <span className="block text-xs text-muted-foreground">{item.note}</span>
                </span>
              </label>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <label className="block text-sm font-medium text-foreground">
              Format
              <select className={selectClass} value={codec} onChange={(event) => change(setCodec, event.target.value as OutputCodec)}>
                {!loaded || loaded.avc ? <option value="avc">H.264: plays everywhere</option> : null}
                {loaded?.hevc ? <option value="hevc">H.265: smaller, newer devices</option> : null}
              </select>
            </label>
            <label className="block text-sm font-medium text-foreground">
              Size
              <select
                className={selectClass}
                value={maxShortSide}
                onChange={(event) => change(setMaxShortSide, Number(event.target.value))}
              >
                <option value={0}>Keep original{details ? ` (${details.width}×${details.height})` : ""}</option>
                {sizes.map((value) => (
                  <option key={value} value={value}>
                    Reduce to {value}p
                  </option>
                ))}
              </select>
            </label>
          </div>
          {details?.hasSound ? (
            <label className="mt-3 flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={removeSound} onChange={(event) => change(setRemoveSound, event.target.checked)} />
              Remove sound
            </label>
          ) : null}
        </fieldset>

        {busy ? (
          <div className="mt-5">
            <div
              role="progressbar"
              aria-label={stageText[progress.stage]}
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-2 overflow-hidden rounded-full bg-muted"
            >
              <div className="h-full bg-primary transition-[width] duration-200" style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {stageText[progress.stage]}
              {progress.stage === "checking" ? "" : ` (${percent}%)`}
            </p>
            <Button type="button" variant="outline" className="mt-3 w-full" onClick={() => abortRef.current?.abort()}>
              Cancel
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">Keep this tab open and in front until it finishes.</p>
          </div>
        ) : (
          <Button type="button" size="lg" className="mt-5 w-full" disabled={!loaded} onClick={start}>
            Compress video
          </Button>
        )}

        <div role="status" className="text-sm leading-6">
          {error ? <p className="mt-3 text-red-600 dark:text-red-400">{error}</p> : null}
          {result && loaded ? (
            result.url ? (
              <div className="mt-4 rounded-md border border-border bg-background p-4">
                <p className="text-lg font-semibold text-foreground">
                  {formatSize(loaded.file.size)} → {formatSize(result.size)}
                </p>
                <p className="text-muted-foreground">
                  {Math.round((1 - result.size / loaded.file.size) * 100)}% smaller. Picture match{" "}
                  {(result.similarity * 100).toFixed(1)}%
                  {maxShortSide > 0 && result.width < loaded.details.width ? ` at ${result.width}×${result.height}` : ""}.
                </p>
                <Button asChild className="mt-3 w-full">
                  <a href={result.url} download={result.name}>
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Download video
                  </a>
                </Button>
              </div>
            ) : (
              <p className="mt-3 text-muted-foreground">
                {result.reason === "no-gain"
                  ? "This video is already well compressed, so your original is the better file. No new file was made."
                  : "This video cannot get smaller without losing this much quality. Try Balanced, H.265 or a smaller size."}
              </p>
            )
          ) : null}
        </div>

        <p className="mt-4 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
          Compressing always re-encodes the picture. The tool compares sample frames with your original and only gives you
          a file when they match closely enough. Sound is copied unchanged where possible.
        </p>
      </section>
    </div>
  );
}
