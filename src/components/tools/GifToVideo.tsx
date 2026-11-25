"use client";

import { useState } from "react";
import { Lock, Unlock } from "lucide-react";

import { baseName, formatSize, useVideoTool } from "@/components/tools/video/use-video-tool";
import { Choices, ExportPanel, Facts, FileStage, NumberField, Panel, ResetButton, ToolGrid } from "@/components/tools/video/video-kit";
import { Button } from "@/components/ui/button";
import { exactRate, type GifInfo } from "@/lib/gif-info";
import type { GifVideoSettings } from "@/lib/video-gif";

const readInfo = async (file: File) => (await import("@/lib/video-engine")).readGif(file);

type Size = "original" | "1080" | "720" | "480" | "custom";

const MAX_SIDE = 4096;
const even = (value: number) => Math.max(16, Math.round(value / 2) * 2);
const defaults = { format: "mp4" as GifVideoSettings["format"], fps: 0, quality: "high" as GifVideoSettings["quality"], background: "#ffffff" };

/** A size with the GIF's shape, limited by its longer side. */
function shaped(info: GifInfo, width: number) {
  const limited = Math.min(width, MAX_SIDE, (MAX_SIDE * info.width) / info.height);
  return { width: even(limited), height: even((limited * info.height) / info.width) };
}

function sizeFor(info: GifInfo, size: Size, custom: { width: number; height: number }) {
  if (size === "custom") return custom;
  if (size === "original") return shaped(info, info.width);
  const short = Number(size);
  return info.width >= info.height ? shaped(info, (short * info.width) / info.height) : shaped(info, short);
}

export function GifToVideo() {
  const tool = useVideoTool(readInfo);
  const [options, setOptions] = useState(defaults);
  const [size, setSize] = useState<Size>("original");
  const [custom, setCustom] = useState({ width: 16, height: 16 });
  const [lock, setLock] = useState(true);
  const { loaded, busy } = tool;
  const info = loaded?.info;
  const locked = !loaded || busy;
  const output = info ? sizeFor(info, size, custom) : { width: 0, height: 0 };
  const rate = info ? (options.fps === 0 ? exactRate(info).value : options.fps) : 0;
  const upscaled = info !== undefined && (output.width > info.width + 1 || output.height > info.height + 1);
  const tooLarge = output.width * output.height > 4096 * 2304 || output.width * output.height * rate * (info?.duration ?? 0) > 12e9;

  function change(part: Partial<typeof defaults>) {
    tool.changed();
    setOptions((current) => ({ ...current, ...part }));
  }

  function reset() {
    tool.changed();
    setOptions(defaults);
    setSize("original");
    setLock(true);
  }

  function start() {
    if (!loaded) return;
    const { file, info: details } = loaded;
    void tool.run(`${baseName(file.name)}.${options.format}`, async (onProgress, signal) => {
      const engine = await import("@/lib/video-engine");
      return engine.gifToVideo(
        file,
        details,
        { ...options, fps: options.fps === 0 ? null : options.fps, width: output.width, height: output.height },
        onProgress,
        signal,
      );
    });
  }

  return (
    <ToolGrid
      main={
        <FileStage
          noun="GIF"
          accept="image/gif,.gif"
          hint="Animated GIF files up to 200 MB. It stays on your device."
          fileName={loaded?.file.name ?? null}
          opening={tool.opening}
          busy={busy}
          error={loaded ? "" : tool.error}
          onFile={(file) => void tool.open(file, reset)}
          onClose={tool.close}
        >
          {loaded && info ? (
            <>
              <div
                className="flex h-[min(54vh,440px)] items-center justify-center overflow-hidden rounded-md"
                style={{ backgroundColor: options.background }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- a local file opened in this tab */}
                <img src={loaded.url} alt="The GIF, playing" className="h-full w-full object-contain" />
              </div>
              <div className="mt-3">
                <Facts
                  items={[
                    ["File size", formatSize(loaded.file.size)],
                    ["Dimensions", `${info.width}×${info.height}`],
                    ["Frames", String(info.frames)],
                    ["Length", `${info.duration.toFixed(2)} s`],
                  ]}
                />
              </div>
            </>
          ) : null}
        </FileStage>
      }
      side={
        <>
          <Panel title="Video settings" action={<ResetButton disabled={locked} onClick={reset} />}>
            <div className="grid gap-4">
              <Choices
                label="Format"
                value={options.format}
                options={[
                  { value: "mp4", label: "MP4", note: "H.264" },
                  { value: "webm", label: "WebM", note: "VP8" },
                  { value: "mov", label: "MOV", note: "H.264" },
                ]}
                disabled={locked}
                onChange={(format) => change({ format })}
              />
              <Choices
                label="Resolution"
                value={size}
                options={[
                  { value: "original", label: "Original" },
                  { value: "1080", label: "1080p" },
                  { value: "720", label: "720p" },
                  { value: "480", label: "480p" },
                  { value: "custom", label: "Custom" },
                ]}
                disabled={locked}
                onChange={(value) => {
                  tool.changed();
                  if (value === "custom") setCustom(output);
                  setSize(value);
                }}
              />
              {size === "custom" && info ? (
                <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-2">
                  <NumberField
                    label="Width"
                    value={custom.width}
                    min={16}
                    max={MAX_SIDE}
                    disabled={locked}
                    onCommit={(value) => {
                      tool.changed();
                      setCustom(lock ? shaped(info, value) : { ...custom, width: even(value) });
                    }}
                  />
                  <Button
                    type="button"
                    variant={lock ? "default" : "outline"}
                    size="icon"
                    className="h-10 w-10"
                    aria-pressed={lock}
                    aria-label="Lock the shape"
                    disabled={locked}
                    onClick={() => {
                      tool.changed();
                      if (!lock) setCustom(shaped(info, custom.width));
                      setLock(!lock);
                    }}
                  >
                    {lock ? <Lock className="h-4 w-4" aria-hidden="true" /> : <Unlock className="h-4 w-4" aria-hidden="true" />}
                  </Button>
                  <NumberField
                    label="Height"
                    value={custom.height}
                    min={16}
                    max={MAX_SIDE}
                    disabled={locked}
                    onCommit={(value) => {
                      tool.changed();
                      setCustom(lock ? shaped(info, (value * info.width) / info.height) : { ...custom, height: even(value) });
                    }}
                  />
                </div>
              ) : null}
              <Choices
                label="Frame rate"
                columns={4}
                value={options.fps}
                options={[0, 10, 15, 24, 25, 30, 50, 60].map((value) => ({ value, label: value === 0 ? "Same" : String(value) }))}
                disabled={locked}
                onChange={(fps) => change({ fps })}
              />
              <Choices
                label="Quality"
                value={options.quality}
                options={[
                  { value: "high", label: "High" },
                  { value: "medium", label: "Medium" },
                  { value: "low", label: "Low" },
                ]}
                disabled={locked}
                onChange={(quality) => change({ quality })}
              />
              <label className="flex items-center justify-between gap-3 text-sm font-medium text-foreground">
                Colour behind transparent areas
                <input
                  type="color"
                  value={options.background}
                  disabled={locked}
                  onChange={(event) => change({ background: event.target.value })}
                  className="h-10 w-14 cursor-pointer rounded-md border border-border bg-background p-1"
                />
              </label>
              <Facts
                items={[
                  ["Output format", loaded ? `${options.format.toUpperCase()}, ${options.format === "webm" ? "VP8" : "H.264"}` : "–"],
                  ["Output size", loaded ? `${output.width}×${output.height}` : "–"],
                  ["Output rate", loaded ? `${Math.round(rate * 100) / 100} fps` : "–"],
                  ["Output length", info ? `${info.duration.toFixed(2)} s` : "–"],
                ]}
              />
              {tooLarge ? (
                <p className="text-sm leading-6 text-red-600 dark:text-red-400">This is too large for a browser. Choose a smaller size or frame rate.</p>
              ) : upscaled ? (
                <p className="text-sm leading-6 text-amber-700 dark:text-amber-400">This is larger than the GIF. It adds no detail.</p>
              ) : null}
            </div>
          </Panel>
          <ExportPanel
            action="Convert to video"
            disabled={!loaded || tooLarge}
            disabledReason={loaded ? undefined : "Choose a GIF first."}
            progress={tool.progress}
            result={tool.result}
            error={loaded ? tool.error : ""}
            notice={tool.notice}
            originalSize={loaded?.file.size}
            onStart={start}
            onCancel={tool.cancel}
            note="Same keeps the GIF's own timing. Sizes are rounded to even pixels."
          />
        </>
      }
    />
  );
}
