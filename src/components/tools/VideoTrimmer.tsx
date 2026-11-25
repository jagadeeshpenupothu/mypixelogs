"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Magnet, Pause, Play, RotateCcw, Scissors, SkipBack, SkipForward, Upload, Volume2, VolumeX, X } from "lucide-react";

import { TimeField } from "@/components/tools/video/TimeField";
import { formatSize } from "@/components/tools/video/use-video-tool";
import { TrimTimeline } from "@/components/tools/TrimTimeline";
import { formatTimecode } from "@/lib/timecode";
import type { TrimInfo, TrimProgress, TrimResult } from "@/lib/video-trim";

type Loaded = { file: File; url: string; info: TrimInfo };
type Finished = TrimResult & { url: string; name: string };

const THUMBNAILS = 12;
const MIN_LENGTH = 0.05;

const stages: Record<TrimProgress["stage"], string> = {
  loading: "Loading the video engine",
  trimming: "Trimming the video",
  checking: "Checking the finished video",
};

const button =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 text-sm font-semibold text-zinc-100 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:pointer-events-none disabled:opacity-40";
const primary =
  "inline-flex h-12 items-center justify-center gap-2 rounded-md bg-amber-400 px-5 text-base font-bold text-black transition-colors hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:pointer-events-none disabled:opacity-40";

export function VideoTrimmer() {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const turnRef = useRef(0);
  const stopAtRef = useRef<number | null>(null);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [opening, setOpening] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [thumbnails, setThumbnails] = useState<(string | null)[]>([]);
  const [range, setRange] = useState({ start: 0, end: 0 });
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [noPreview, setNoPreview] = useState(false);
  const [progress, setProgress] = useState<TrimProgress | null>(null);
  const [result, setResult] = useState<Finished | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const busy = progress !== null;
  const info = loaded?.info;
  const duration = info?.duration ?? 0;
  const frame = info ? 1 / Math.max(info.frameRate, 1) : 0.04;
  const locked = !loaded || busy;

  // ---------------------------------------------------------- cleanup
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

  // ---------------------------------------------------------- timeline pictures
  useEffect(() => {
    if (!loaded) return;
    const controller = new AbortController();
    void import("@/lib/video-engine").then((engine) =>
      engine.drawThumbnails(
        loaded.file,
        loaded.info,
        THUMBNAILS,
        (index, url) => setThumbnails((current) => current.map((item, place) => (place === index ? url : item))),
        controller.signal,
      ),
    );
    return () => controller.abort();
  }, [loaded]);

  // ---------------------------------------------------------- playback
  useEffect(() => {
    if (!playing) return;
    let request = 0;
    const tick = () => {
      const video = videoRef.current;
      if (video) {
        const stopAt = stopAtRef.current;
        if (stopAt !== null && video.currentTime >= stopAt - 0.01) {
          video.pause();
          video.currentTime = stopAt;
          stopAtRef.current = null;
        }
        setPosition(video.currentTime);
      }
      request = requestAnimationFrame(tick);
    };
    request = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(request);
  }, [playing]);

  const seek = useCallback(
    (time: number) => {
      const next = Math.min(Math.max(0, time), duration);
      stopAtRef.current = null;
      setPosition(next);
      if (videoRef.current) videoRef.current.currentTime = next;
    },
    [duration],
  );

  function play() {
    const video = videoRef.current;
    if (!video) return;
    stopAtRef.current = null;
    if (!video.paused) video.pause();
    else void video.play().catch(() => setNoPreview(true));
  }

  function playSelection() {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = range.start;
    setPosition(range.start);
    stopAtRef.current = range.end;
    void video.play().catch(() => setNoPreview(true));
  }

  // ---------------------------------------------------------- selection
  function select(next: { start: number; end: number }, show: number) {
    setRange(next);
    setResult(null);
    setError("");
    setMessage("");
    videoRef.current?.pause();
    seek(show);
  }

  function setStart(value: number) {
    const start = Math.min(Math.max(0, value), range.end - MIN_LENGTH);
    select({ start, end: range.end }, start);
  }

  function setEnd(value: number) {
    const end = Math.max(Math.min(duration, value), range.start + MIN_LENGTH);
    select({ start: range.start, end }, end);
  }

  function reset() {
    select({ start: 0, end: duration }, 0);
  }

  async function snap() {
    if (!loaded) return;
    const engine = await import("@/lib/video-engine");
    const points = await engine.snapToLossless(loaded.file, loaded.info, range);
    if (!points) {
      setMessage("No lossless cut points were found near your selection.");
      return;
    }
    select(points, points.start);
    setMessage(`Moved to ${formatTimecode(points.start)} – ${formatTimecode(points.end)}, where the video can be cut without re-encoding.`);
  }

  // ---------------------------------------------------------- files
  function close() {
    turnRef.current += 1;
    setLoaded(null);
    setResult(null);
    setError("");
    setMessage("");
    setPlaying(false);
    setPosition(0);
    stopAtRef.current = null;
  }

  async function openFile(file: File | undefined) {
    if (!file || busy) return;
    close();
    const turn = turnRef.current;
    setOpening(true);
    const engine = await import("@/lib/video-engine");
    try {
      if (file.size === 0) throw new engine.VideoTrimError("This file is empty.");
      if (file.size > engine.MAX_FILE_SIZE) throw new engine.VideoTrimError("Please choose a video smaller than 2 GB.");
      const details = await engine.readTrimInfo(file);
      if (turn !== turnRef.current) return;
      setThumbnails(Array.from({ length: THUMBNAILS }, () => null));
      setRange({ start: 0, end: details.duration });
      setNoPreview(false);
      setLoaded({ file, url: URL.createObjectURL(file), info: details });
    } catch (problem) {
      if (turn !== turnRef.current) return;
      setError(problem instanceof engine.VideoTrimError ? problem.message : "This file is not a video that can be opened here.");
    } finally {
      if (turn === turnRef.current) setOpening(false);
    }
  }

  async function trim() {
    if (!loaded || busy) return;
    const controller = new AbortController();
    abortRef.current = controller;
    videoRef.current?.pause();
    setResult(null);
    setError("");
    setMessage("");
    setProgress({ stage: "loading", value: 0 });
    const engine = await import("@/lib/video-engine");
    try {
      const done = await engine.trimVideo(loaded.file, loaded.info, range, setProgress, controller.signal);
      const base = loaded.file.name.replace(/\.[^.]+$/, "");
      setResult({ ...done, url: URL.createObjectURL(done.blob), name: `${base}-trimmed.${done.extension}` });
    } catch (problem) {
      if (problem instanceof engine.VideoTrimCanceled) setMessage("Trimming was cancelled.");
      else setError(problem instanceof engine.VideoTrimError ? problem.message : "The video could not be trimmed.");
    } finally {
      setProgress(null);
      abortRef.current = null;
    }
  }

  const percent = progress ? Math.round(progress.value * 100) : 0;

  return (
    <div
      className="overflow-hidden rounded-xl border border-white/10 bg-[#0b0d10] text-zinc-100 shadow-2xl [color-scheme:dark]"
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
        void openFile(event.dataTransfer.files[0]);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*,.mkv,.avi,.flv,.wmv,.m4v,.ts,.3gp"
        className="sr-only"
        tabIndex={-1}
        aria-label="Choose a video"
        onChange={(event) => {
          void openFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {!loaded || !info ? (
        <div className="p-4 sm:p-6">
          <div
            className={`flex min-h-[320px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
              dragging ? "border-amber-400 bg-amber-400/10" : "border-white/15"
            }`}
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-400 text-black">
              <Scissors className="h-7 w-7" aria-hidden="true" />
            </span>
            <p className="mt-4 text-lg font-semibold">{opening ? "Opening video..." : "Drag a video here"}</p>
            <p className="mt-1 text-sm text-zinc-400">MP4, MOV, WebM, MKV, AVI and more, up to 2 GB. It stays on your device.</p>
            <button type="button" className={`${primary} mt-5`} disabled={opening} onClick={() => inputRef.current?.click()}>
              <Upload className="h-5 w-5" aria-hidden="true" />
              Choose video
            </button>
            <div role="alert">{error ? <p className="mt-4 max-w-md text-sm leading-6 text-red-400">{error}</p> : null}</div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{loaded.file.name}</p>
              <p className="mt-0.5 truncate text-xs text-zinc-400">
                {formatSize(loaded.file.size)}
                {info.width ? `, ${info.width}×${info.height}` : ""}, {Math.round(info.frameRate * 100) / 100} fps
                {info.hasSound ? "" : ", no sound"}
                {info.hdr ? ", HDR" : ""}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" className={button} disabled={busy} onClick={() => inputRef.current?.click()}>
                <Upload className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Replace</span>
                <span className="sr-only sm:hidden">Replace video</span>
              </button>
              <button type="button" className={`${button} w-10 px-0`} aria-label="Close video" disabled={busy} onClick={close}>
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className={`relative flex h-[min(52vh,460px)] items-center justify-center bg-black ${dragging ? "ring-2 ring-inset ring-amber-400" : ""}`}>
            {noPreview ? (
              <p className="max-w-sm p-6 text-center text-sm leading-6 text-zinc-400">
                Your browser cannot play this format here. You can still set the times and trim it.
              </p>
            ) : (
              <video
                ref={videoRef}
                key={loaded.url}
                src={loaded.url}
                muted={muted}
                playsInline
                preload="auto"
                aria-label="Video preview"
                className="h-full w-full object-contain"
                onClick={play}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
                onError={() => setNoPreview(true)}
                onLoadedMetadata={(event) => {
                  if (!event.currentTarget.videoWidth) setNoPreview(true);
                }}
              />
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-y border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <button type="button" className={`${button} w-10 px-0`} aria-label="Back one frame" disabled={locked || noPreview} onClick={() => { videoRef.current?.pause(); seek(position - frame); }}>
                <SkipBack className="h-4 w-4" aria-hidden="true" />
              </button>
              <button type="button" className={`${button} w-12 px-0`} aria-label={playing ? "Pause" : "Play"} disabled={noPreview} onClick={play}>
                {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
              </button>
              <button type="button" className={`${button} w-10 px-0`} aria-label="Forward one frame" disabled={locked || noPreview} onClick={() => { videoRef.current?.pause(); seek(position + frame); }}>
                <SkipForward className="h-4 w-4" aria-hidden="true" />
              </button>
              <button type="button" className={`${button} w-10 px-0`} aria-label={muted ? "Turn sound on" : "Turn sound off"} disabled={noPreview || !info.hasSound} onClick={() => setMuted((value) => !value)}>
                {muted ? <VolumeX className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
              </button>
              <button type="button" className={button} disabled={noPreview || busy} onClick={playSelection}>
                <Play className="h-4 w-4 text-amber-400" aria-hidden="true" />
                Preview selection
              </button>
            </div>
            <p className="font-mono text-sm text-zinc-300">
              {formatTimecode(position)} <span className="text-zinc-500">/ {formatTimecode(duration)}</span>
            </p>
          </div>

          <div className="py-5">
            <TrimTimeline
              duration={duration}
              frame={frame}
              start={range.start}
              end={range.end}
              position={position}
              thumbnails={thumbnails}
              disabled={busy}
              onStart={setStart}
              onEnd={setEnd}
              onSeek={seek}
            />
          </div>

          <div className="grid gap-5 border-t border-white/10 p-4 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-w-0">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <TimeField label="Start time" value={range.start} disabled={locked} onCommit={setStart} />
                  <button type="button" className={`${button} mt-2 w-full`} disabled={locked || noPreview} onClick={() => setStart(position)}>
                    Set to playhead
                  </button>
                </div>
                <div>
                  <TimeField label="End time" value={range.end} disabled={locked} onCommit={setEnd} />
                  <button type="button" className={`${button} mt-2 w-full`} disabled={locked || noPreview} onClick={() => setEnd(position)}>
                    Set to playhead
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className={button} disabled={locked} onClick={reset}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
                {info.hasIndex ? (
                  <button type="button" className={button} disabled={locked} onClick={snap}>
                    <Magnet className="h-4 w-4" aria-hidden="true" />
                    Snap to lossless points
                  </button>
                ) : null}
              </div>
            </div>

            <div className="min-w-0">
              <dl className="grid grid-cols-2 gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm">
                <div>
                  <dt className="text-xs text-zinc-400">Original</dt>
                  <dd className="mt-0.5 font-mono">{formatTimecode(duration)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-400">Selected</dt>
                  <dd className="mt-0.5 font-mono text-amber-300" data-testid="selected">
                    {formatTimecode(range.end - range.start)}
                  </dd>
                </div>
              </dl>
              {progress ? (
                <div className="mt-3">
                  <div
                    role="progressbar"
                    aria-label={stages[progress.stage]}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={percent}
                    className="h-2 overflow-hidden rounded-full bg-white/10"
                  >
                    <div
                      className={`h-full bg-amber-400 ${progress.stage === "trimming" ? "transition-[width] duration-200" : "animate-pulse"}`}
                      style={{ width: progress.stage === "trimming" ? `${percent}%` : "100%" }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-zinc-300">
                    {stages[progress.stage]}
                    {progress.stage === "trimming" ? ` (${percent}%)` : "..."}
                  </p>
                  <button type="button" className={`${button} mt-2 w-full`} onClick={() => abortRef.current?.abort()}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button type="button" className={`${primary} mt-3 w-full`} onClick={trim}>
                  <Scissors className="h-5 w-5" aria-hidden="true" />
                  Trim Video
                </button>
              )}
            </div>
          </div>

          <div role="status" className="px-4 text-sm leading-6">
            {error ? <p className="pb-4 text-red-400">{error}</p> : null}
            {message ? <p className="pb-4 text-zinc-300">{message}</p> : null}
          </div>

          {result ? (
            <div className="grid gap-4 border-t border-white/10 p-4 lg:grid-cols-[minmax(0,1fr)_300px]" data-testid="result">
              <video key={result.url} src={result.url} controls playsInline aria-label="Trimmed video" className="max-h-[320px] w-full rounded-md bg-black" />
              <div className="min-w-0">
                <p className="text-base font-semibold">Your video is ready</p>
                <p className="mt-1 break-all text-sm text-zinc-400">{result.name}</p>
                <p className="mt-1 text-sm text-zinc-400">
                  {formatTimecode(result.duration)}, {formatSize(result.blob.size)}
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  {result.method === "lossless"
                    ? "Cut without re-encoding, so quality is unchanged."
                    : "Re-encoded at high quality so it starts and ends on the exact frames."}
                </p>
                <a href={result.url} download={result.name} className={`${primary} mt-3 w-full`}>
                  <Download className="h-5 w-5" aria-hidden="true" />
                  Download
                </a>
              </div>
            </div>
          ) : null}

          <p className="border-t border-white/10 px-4 py-3 text-xs leading-5 text-zinc-500">
            Everything runs in your browser with{" "}
            <a className="underline hover:text-zinc-300" href="https://github.com/ffmpegwasm/ffmpeg.wasm" target="_blank" rel="noopener">
              FFmpeg.wasm
            </a>{" "}
            (GPL). The first trim loads about 32 MB. Exact cuts of long or large videos can take a while, so keep this tab open.
          </p>
        </>
      )}
    </div>
  );
}
