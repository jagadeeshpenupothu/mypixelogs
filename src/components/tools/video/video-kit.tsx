"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { Download, Film, Pause, Play, RotateCcw, Upload, Volume2, VolumeX, X } from "lucide-react";

import { formatSize, type FinishedFile } from "@/components/tools/video/use-video-tool";
import { Button } from "@/components/ui/button";
import { formatTimecode } from "@/lib/timecode";
import type { Progress } from "@/lib/video-ffmpeg";

export const VIDEO_TYPES = "video/*,.mkv,.avi,.flv,.wmv,.m4v,.ts,.3gp";

/** The upload box, and the frame around an open file. */
export function FileStage({
  accept = VIDEO_TYPES,
  hint,
  noun = "video",
  fileName,
  details,
  opening,
  busy,
  error,
  onFile,
  onClose,
  children,
}: {
  accept?: string;
  hint: string;
  noun?: string;
  fileName: string | null;
  details?: string;
  opening: boolean;
  busy: boolean;
  error: string;
  onFile: (file: File | undefined) => void;
  onClose: () => void;
  children?: ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <section
      aria-label={noun === "GIF" ? "GIF" : "Video"}
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
        onFile(event.dataTransfer.files[0]);
      }}
      className={`h-fit min-w-0 rounded-lg border bg-card p-4 transition-colors duration-200 sm:p-5 ${
        dragging ? "border-primary bg-primary/5" : fileName ? "border-border" : "border-dashed border-border"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        aria-label={`Choose a ${noun}`}
        onChange={(event) => {
          onFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      {fileName ? (
        <>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{fileName}</p>
              {details ? <p className="mt-0.5 text-xs text-muted-foreground">{details}</p> : null}
            </div>
            <div className="flex shrink-0 gap-1.5">
              <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
                <Upload className="h-4 w-4" aria-hidden="true" />
                Replace
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9" aria-label={`Close ${noun}`} disabled={busy} onClick={onClose}>
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
          {children}
        </>
      ) : (
        <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Film className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="mt-4 text-lg font-semibold text-foreground">{opening ? `Opening ${noun}...` : `Drag a ${noun} here`}</p>
          <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
          <Button type="button" className="mt-4" disabled={opening} onClick={() => inputRef.current?.click()}>
            <Upload className="h-4 w-4" aria-hidden="true" />
            Choose {noun}
          </Button>
          <div role="alert">{error ? <p className="mt-4 max-w-md text-sm leading-6 text-red-600 dark:text-red-400">{error}</p> : null}</div>
        </div>
      )}
    </section>
  );
}

/** A player with its own controls, so they stay upright whatever happens to the picture. */
export function VideoPlayer({
  src,
  videoRef,
  hasSound,
  aspect,
  frameStyle,
  videoStyle,
  overlay,
  onTime,
}: {
  src: string;
  videoRef?: RefObject<HTMLVideoElement | null>;
  hasSound: boolean;
  /** Shape of the visible frame, width divided by height. */
  aspect: number;
  frameStyle?: CSSProperties;
  videoStyle?: CSSProperties;
  overlay?: ReactNode;
  onTime?: (time: number) => void;
}) {
  const ownRef = useRef<HTMLVideoElement>(null);
  const ref = videoRef ?? ownRef;
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [length, setLength] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!playing) return;
    let request = 0;
    const tick = () => {
      if (ref.current) {
        setTime(ref.current.currentTime);
        onTime?.(ref.current.currentTime);
      }
      request = requestAnimationFrame(tick);
    };
    request = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(request);
  }, [playing, ref, onTime]);

  return (
    <div className="overflow-hidden rounded-md bg-black">
      <div className="flex h-[min(54vh,440px)] items-center justify-center [container-type:size]">
        {failed && !overlay ? (
          <p className="max-w-sm p-6 text-center text-sm leading-6 text-white/80">
            Your browser cannot play this format here, but it can still be processed.
          </p>
        ) : (
          <div
            className="relative overflow-hidden"
            data-testid="frame"
            style={{ aspectRatio: String(aspect), width: `min(100cqw, calc(100cqh * ${aspect}))`, ...frameStyle }}
          >
            <video
              ref={ref}
              src={src}
              muted={muted}
              playsInline
              preload="auto"
              aria-label="Video preview"
              className="absolute inset-0 h-full w-full max-w-none object-fill"
              style={videoStyle}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              onSeeked={(event) => {
                setTime(event.currentTarget.currentTime);
                onTime?.(event.currentTarget.currentTime);
              }}
              onLoadedMetadata={(event) => {
                setLength(event.currentTarget.duration);
                if (!event.currentTarget.videoWidth) setFailed(true);
              }}
              onError={() => setFailed(true)}
            />
            {failed ? (
              <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm leading-6 text-white/80">
                Your browser cannot show this format, but it can still be processed.
              </p>
            ) : null}
            {overlay}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 bg-[#101215] px-3 py-2 text-white">
        <button
          type="button"
          aria-label={playing ? "Pause" : "Play"}
          disabled={failed}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-40"
          onClick={() => {
            const video = ref.current;
            if (!video) return;
            if (video.paused) void video.play().catch(() => setFailed(true));
            else video.pause();
          }}
        >
          {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
        </button>
        <input
          type="range"
          min={0}
          max={length || 1}
          step={0.01}
          value={Math.min(time, length || 1)}
          disabled={failed}
          aria-label="Position in the video"
          className="h-9 min-w-0 flex-1 accent-white"
          onChange={(event) => {
            const next = Number(event.target.value);
            setTime(next);
            if (ref.current) ref.current.currentTime = next;
          }}
        />
        <span className="shrink-0 font-mono text-xs text-white/80">
          {formatTimecode(time).slice(3, 8)} / {formatTimecode(Number.isFinite(length) ? length : 0).slice(3, 8)}
        </span>
        {hasSound ? (
          <button
            type="button"
            aria-label={muted ? "Turn sound on" : "Turn sound off"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            onClick={() => setMuted((value) => !value)}
          >
            {muted ? <VolumeX className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section aria-label={title} className="min-w-0 rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="mb-3 flex min-h-9 items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** A row of choices where one is active. */
export function Choices<T extends string | number>({
  label,
  options,
  value,
  disabled,
  onChange,
  columns = 3,
}: {
  label: string;
  options: { value: T; label: string; note?: string; disabled?: boolean }[];
  value: T;
  disabled?: boolean;
  onChange: (value: T) => void;
  columns?: 2 | 3 | 4;
}) {
  const grid = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" }[columns];
  return (
    <div role="group" aria-label={label}>
      <p className="mb-1.5 text-sm font-medium text-foreground">{label}</p>
      <div className={`grid gap-1.5 ${grid}`}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={disabled || option.disabled}
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={`min-h-10 rounded-md border px-2 py-1.5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 disabled:pointer-events-none disabled:opacity-40 ${
              value === option.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-muted"
            }`}
          >
            {option.label}
            {option.note ? <span className="block text-[11px] font-medium opacity-80">{option.note}</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

/** A whole-number field that only commits sensible values. */
export function NumberField({
  label,
  value,
  min,
  max,
  disabled,
  onCommit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  disabled?: boolean;
  onCommit: (value: number) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  function commit() {
    if (draft === null) return;
    const number = Math.round(Number(draft));
    setDraft(null);
    if (draft.trim() !== "" && Number.isFinite(number)) onCommit(Math.min(max, Math.max(min, number)));
  }
  return (
    <label className="block min-w-0 text-sm font-medium text-foreground">
      {label}
      <input
        inputMode="numeric"
        value={draft ?? String(value)}
        disabled={disabled}
        autoComplete="off"
        onFocus={(event) => event.currentTarget.select()}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit();
          if (event.key === "Escape") setDraft(null);
        }}
        className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 disabled:opacity-50"
      />
    </label>
  );
}

export function Facts({ items }: { items: [string, string][] }) {
  return (
    <dl className="grid grid-cols-2 gap-3 rounded-md border border-border bg-background p-3 text-sm">
      {items.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="text-xs text-muted-foreground">{label}</dt>
          <dd className="mt-0.5 break-words font-semibold text-foreground" data-fact={label}>
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

const stageText: Record<Progress["stage"], string> = {
  loading: "Loading the video engine",
  working: "Processing",
  checking: "Checking the finished file",
};

function remainingText(seconds: number) {
  return seconds < 60 ? `about ${Math.max(1, Math.round(seconds))} s left` : `about ${Math.round(seconds / 60)} min left`;
}

/** The export button, its progress, messages and the finished file. */
export function ExportPanel({
  action,
  disabled,
  disabledReason,
  progress,
  result,
  error,
  notice,
  originalSize,
  onStart,
  onCancel,
  note,
}: {
  action: string;
  disabled: boolean;
  disabledReason?: string;
  progress: (Progress & { remaining: number | null }) | null;
  result: FinishedFile | null;
  error: string;
  notice: string;
  originalSize?: number;
  onStart: () => void;
  onCancel: () => void;
  note?: ReactNode;
}) {
  const percent = progress ? Math.round(progress.value * 100) : 0;
  return (
    <div className="min-w-0 rounded-lg border border-border bg-card p-4 sm:p-5">
      {progress ? (
        <>
          <div
            role="progressbar"
            aria-label={stageText[progress.stage]}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="h-2 overflow-hidden rounded-full bg-muted"
          >
            <div
              className={`h-full bg-primary ${progress.stage === "working" ? "transition-[width] duration-200" : "animate-pulse"}`}
              style={{ width: progress.stage === "working" ? `${percent}%` : "100%" }}
            />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {stageText[progress.stage]}
            {progress.stage === "working" ? ` (${percent}%${progress.remaining ? `, ${remainingText(progress.remaining)}` : ""})` : "..."}
          </p>
          <Button type="button" variant="outline" className="mt-3 w-full" onClick={onCancel}>
            Cancel
          </Button>
        </>
      ) : (
        <>
          <Button type="button" size="lg" className="w-full" disabled={disabled} onClick={onStart}>
            {action}
          </Button>
          {disabled && disabledReason ? <p className="mt-2 text-center text-sm text-muted-foreground">{disabledReason}</p> : null}
        </>
      )}
      <div role="status" className="text-sm leading-6">
        {error ? <p className="mt-3 text-red-600 dark:text-red-400">{error}</p> : null}
        {notice ? <p className="mt-3 text-muted-foreground">{notice}</p> : null}
      </div>
      {result ? (
        <div className="mt-4 rounded-md border border-border bg-background p-3" data-testid="result">
          {result.blob.type === "image/gif" ? (
            // eslint-disable-next-line @next/next/no-img-element -- a local file made in this tab
            <img src={result.url} alt="Finished GIF" className="max-h-64 w-full rounded bg-black/80 object-contain" />
          ) : (
            <video key={result.url} src={result.url} controls playsInline aria-label="Finished video" className="max-h-64 w-full rounded bg-black" />
          )}
          <p className="mt-2 break-all text-sm font-semibold text-foreground">{result.name}</p>
          <p className="text-sm text-muted-foreground">
            {originalSize ? `${formatSize(originalSize)} → ` : ""}
            {formatSize(result.blob.size)}
          </p>
          <Button asChild className="mt-3 w-full">
            <a href={result.url} download={result.name}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Download
            </a>
          </Button>
        </div>
      ) : null}
      <p className="mt-4 border-t border-border pt-3 text-xs leading-5 text-muted-foreground">
        {note ? <>{note} </> : null}
        Everything runs in your browser with{" "}
        <a className="underline hover:text-foreground" href="https://github.com/ffmpegwasm/ffmpeg.wasm" target="_blank" rel="noopener">
          FFmpeg.wasm
        </a>{" "}
        (GPL), and nothing is uploaded. The first run loads about 32 MB. Keep this tab open while it works.
      </p>
    </div>
  );
}

/** Preview on the left, settings on the right. */
export function ToolGrid({ main, side }: { main: ReactNode; side: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      {main}
      <div className="grid h-fit min-w-0 gap-4">{side}</div>
    </div>
  );
}

export const videoFormats = [
  { value: "mp4" as const, label: "MP4" },
  { value: "mov" as const, label: "MOV" },
  { value: "mkv" as const, label: "MKV" },
];
export type VideoFormat = (typeof videoFormats)[number]["value"];

export function ResetButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={onClick}>
      <RotateCcw className="h-4 w-4" aria-hidden="true" />
      Reset
    </Button>
  );
}

export function describeVideo(file: File, info: { width: number; height: number; frameRate: number; hasSound: boolean; hdr: boolean; duration: number }) {
  return [
    formatSize(file.size),
    info.width ? `${info.width}×${info.height}` : "",
    `${Math.round(info.frameRate * 100) / 100} fps`,
    formatTimecode(info.duration),
    info.hasSound ? "" : "no sound",
    info.hdr ? "HDR" : "",
  ]
    .filter(Boolean)
    .join(", ");
}
