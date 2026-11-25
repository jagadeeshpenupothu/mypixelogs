"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";

import { TrimTimeline } from "@/components/tools/TrimTimeline";
import { TimeField } from "@/components/tools/video/TimeField";
import { baseName, useVideoTool } from "@/components/tools/video/use-video-tool";
import { Choices, describeVideo, ExportPanel, Facts, FileStage, NumberField, Panel, ResetButton, ToolGrid, VideoPlayer } from "@/components/tools/video/video-kit";
import { Button } from "@/components/ui/button";
import { gifAdvice, gifFrames, type GifQuality } from "@/lib/gif-settings";
import type { VideoInfo } from "@/lib/video-ffmpeg";

const readInfo = async (file: File) => (await import("@/lib/video-engine")).readVideoInfo(file);

const THUMBNAILS = 12;
const MIN_LENGTH = 0.1;
const FIRST_LENGTH = 5;
const MAX_SIDE = 1920;

type Size = "original" | "480" | "360" | "240" | "custom";

function sizeFor(info: VideoInfo, size: Size, custom: number) {
  const limit = Math.min(MAX_SIDE, (MAX_SIDE * info.width) / info.height);
  const wanted = size === "original" ? info.width : size === "custom" ? custom : Math.min(Number(size), info.width);
  const width = Math.max(16, Math.round(Math.min(wanted, limit)));
  return { width, height: Math.max(16, Math.round((width * info.height) / info.width)) };
}

export function VideoToGif() {
  const tool = useVideoTool(readInfo);
  const videoRef = useRef<HTMLVideoElement>(null);
  const stopAtRef = useRef<number | null>(null);
  const [range, setRange] = useState({ start: 0, end: 1 });
  const [position, setPosition] = useState(0);
  const [thumbnails, setThumbnails] = useState<(string | null)[]>([]);
  const [fps, setFps] = useState(15);
  const [size, setSize] = useState<Size>("480");
  const [custom, setCustom] = useState(480);
  const [quality, setQuality] = useState<GifQuality>("high");
  const { loaded, busy } = tool;
  const info = loaded?.info;
  const duration = info?.duration ?? 1;
  const frame = info ? 1 / Math.max(info.frameRate, 1) : 0.04;
  const locked = !loaded || busy;
  const output = info ? sizeFor(info, size, custom) : { width: 0, height: 0 };
  const settings = { ...range, fps, ...output, quality };
  const advice = loaded ? gifAdvice(settings) : null;

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

  function seek(time: number) {
    const next = Math.min(Math.max(0, time), duration);
    stopAtRef.current = null;
    setPosition(next);
    if (videoRef.current) videoRef.current.currentTime = next;
  }

  function select(next: { start: number; end: number }, show: number) {
    tool.changed();
    setRange(next);
    videoRef.current?.pause();
    seek(show);
  }

  const setStart = (value: number) => {
    const start = Math.max(0, Math.min(value, range.end - MIN_LENGTH));
    select({ start, end: range.end }, start);
  };
  const setEnd = (value: number) => {
    const end = Math.min(duration, Math.max(value, range.start + MIN_LENGTH));
    select({ start: range.start, end }, end);
  };

  function watch(time: number) {
    setPosition(time);
    const video = videoRef.current;
    if (video && stopAtRef.current !== null && time >= stopAtRef.current - 0.01) {
      video.pause();
      video.currentTime = stopAtRef.current;
      stopAtRef.current = null;
    }
  }

  function playSelection() {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = range.start;
    stopAtRef.current = range.end;
    void video.play().catch(() => undefined);
  }

  function reset(details: VideoInfo) {
    setFps(15);
    setSize("480");
    setCustom(Math.min(480, details.width));
    setQuality("high");
    setRange({ start: 0, end: Math.min(FIRST_LENGTH, details.duration) });
    setPosition(0);
  }

  function change(apply: () => void) {
    tool.changed();
    apply();
  }

  function start() {
    if (!loaded) return;
    const { file, info: details } = loaded;
    videoRef.current?.pause();
    void tool.run(`${baseName(file.name)}.gif`, async (onProgress, signal) => {
      const engine = await import("@/lib/video-engine");
      return engine.makeGif(file, details, settings, onProgress, signal);
    });
  }

  return (
    <ToolGrid
      main={
        <FileStage
          hint="MP4, MOV, WebM, MKV, AVI and more, up to 2 GB. It stays on your device."
          fileName={loaded?.file.name ?? null}
          details={loaded ? describeVideo(loaded.file, loaded.info) : undefined}
          opening={tool.opening}
          busy={busy}
          error={loaded ? "" : tool.error}
          onFile={(file) =>
            void tool.open(file, (details) => {
              setThumbnails(Array.from({ length: THUMBNAILS }, () => null));
              reset(details);
            })
          }
          onClose={tool.close}
        >
          {loaded && info ? (
            <>
              <VideoPlayer
                key={loaded.url}
                src={loaded.url}
                videoRef={videoRef}
                hasSound={info.hasSound}
                aspect={info.width / info.height || 16 / 9}
                onTime={watch}
              />
              <div className="mt-3 rounded-lg bg-[#0b0d10] py-4 text-zinc-100 [color-scheme:dark]">
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
                <div className="mt-4 grid gap-3 px-4 sm:grid-cols-2">
                  <TimeField label="Start time" value={range.start} disabled={locked} onCommit={setStart} />
                  <TimeField label="End time" value={range.end} disabled={locked} onCommit={setEnd} />
                </div>
              </div>
              <Button type="button" variant="outline" className="mt-3 w-full" disabled={busy} onClick={playSelection}>
                <Play className="h-4 w-4" aria-hidden="true" />
                Preview selection
              </Button>
            </>
          ) : null}
        </FileStage>
      }
      side={
        <>
          <Panel
            title="GIF settings"
            action={
              <ResetButton
                disabled={locked}
                onClick={() => {
                  tool.changed();
                  videoRef.current?.pause();
                  seek(0);
                  if (info) reset(info);
                }}
              />
            }
          >
            <div className="grid gap-4">
              <Choices
                label="Frames per second"
                columns={4}
                value={fps}
                options={[5, 10, 15, 20, 25].map((value) => ({ value, label: String(value) }))}
                disabled={locked}
                onChange={(value) => change(() => setFps(value))}
              />
              <Choices
                label="Size"
                value={size}
                options={[
                  { value: "original", label: "Original" },
                  { value: "480", label: "480 px", disabled: info !== undefined && info.width < 480 },
                  { value: "360", label: "360 px", disabled: info !== undefined && info.width < 360 },
                  { value: "240", label: "240 px", disabled: info !== undefined && info.width < 240 },
                  { value: "custom", label: "Custom" },
                ]}
                disabled={locked}
                onChange={(value) =>
                  change(() => {
                    if (value === "custom") setCustom(output.width);
                    setSize(value);
                  })
                }
              />
              {size === "custom" && info ? (
                <div className="grid grid-cols-2 gap-3">
                  <NumberField label="Width" value={output.width} min={16} max={MAX_SIDE} disabled={locked} onCommit={(value) => change(() => setCustom(value))} />
                  <NumberField
                    label="Height"
                    value={output.height}
                    min={16}
                    max={MAX_SIDE}
                    disabled={locked}
                    onCommit={(value) => change(() => setCustom((value * info.width) / info.height))}
                  />
                </div>
              ) : null}
              <Choices
                label="Quality"
                value={quality}
                options={[
                  { value: "high", label: "High", note: "256 colours" },
                  { value: "medium", label: "Medium", note: "128 colours" },
                  { value: "small", label: "Small file", note: "64 colours" },
                ]}
                disabled={locked}
                onChange={(value) => change(() => setQuality(value))}
              />
              <Facts
                items={[
                  ["Original length", loaded ? `${duration.toFixed(2)} s` : "–"],
                  ["GIF length", loaded ? `${(gifFrames(settings) / fps).toFixed(2)} s` : "–"],
                  ["GIF size", loaded ? `${output.width}×${output.height}` : "–"],
                  ["Frames", loaded ? String(gifFrames(settings)) : "–"],
                ]}
              />
              {advice ? (
                <p className={`text-sm leading-6 ${advice.blocked ? "text-red-600 dark:text-red-400" : "text-amber-700 dark:text-amber-400"}`}>{advice.text}</p>
              ) : null}
            </div>
          </Panel>
          <ExportPanel
            action="Convert to GIF"
            disabled={!loaded || advice?.blocked === true}
            disabledReason={loaded ? undefined : "Choose a video first."}
            progress={tool.progress}
            result={tool.result}
            error={loaded ? tool.error : ""}
            notice={tool.notice}
            onStart={start}
            onCancel={tool.cancel}
            note="The shape is always kept, and the GIF repeats forever. GIFs have no sound."
          />
        </>
      }
    />
  );
}
