"use client";

import { useState } from "react";
import { Lock, Unlock } from "lucide-react";

import { baseName, useVideoTool } from "@/components/tools/video/use-video-tool";
import {
  Choices,
  describeVideo,
  ExportPanel,
  Facts,
  FileStage,
  NumberField,
  Panel,
  ResetButton,
  ToolGrid,
  videoFormats,
  VideoPlayer,
  type VideoFormat,
} from "@/components/tools/video/video-kit";
import { Button } from "@/components/ui/button";

const readInfo = async (file: File) => (await import("@/lib/video-engine")).readVideoInfo(file);

type Mode = "fit" | "fill" | "stretch";
const MAX_SIDE = 4096;
const presets = [2160, 1440, 1080, 720, 480, 360, 240];
const even = (value: number) => Math.max(16, Math.round(value / 2) * 2);

/** The size of the finished video for the chosen box. */
function outputSize(source: { width: number; height: number }, box: { width: number; height: number }, mode: Mode) {
  if (mode !== "fit") return { width: even(box.width), height: even(box.height) };
  const scale = Math.min(box.width / source.width, box.height / source.height);
  // The side that touches the box keeps its exact size.
  return { width: even(source.width * scale), height: even(source.height * scale) };
}

export function VideoResizer() {
  const tool = useVideoTool(readInfo);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [lock, setLock] = useState(true);
  const [mode, setMode] = useState<Mode>("fit");
  const [format, setFormat] = useState<VideoFormat>("mp4");
  const { loaded, busy } = tool;
  const source = { width: loaded?.info.width ?? 16, height: loaded?.info.height ?? 9 };
  const locked = !loaded || busy;
  const aspect = source.width / source.height;
  const output = loaded ? outputSize(source, box, lock ? "stretch" : mode) : source;
  const preset = presets.find((value) => Math.min(output.width, output.height) === value) ?? 0;
  const upscaled = output.width > source.width * 1.01 || output.height > source.height * 1.01;
  const same = output.width === source.width && output.height === source.height;

  function update(next: { width: number; height: number }) {
    tool.changed();
    setBox(next);
  }

  /** Keeps the shape without passing the largest side. */
  function shaped(width: number) {
    const limited = Math.min(width, MAX_SIDE, MAX_SIDE * aspect);
    return { width: even(limited), height: even(limited / aspect) };
  }

  function choosePreset(value: number) {
    update(aspect >= 1 ? { width: even(value * aspect), height: value } : { width: value, height: even(value / aspect) });
  }

  function reset() {
    setLock(true);
    setMode("fit");
    setFormat("mp4");
    update({ width: even(source.width), height: even(source.height) });
  }

  function start() {
    if (!loaded) return;
    const { file, info } = loaded;
    const fill = !lock && mode === "fill";
    void tool.run(`${baseName(file.name)}-${output.width}x${output.height}.${format}`, async (onProgress, signal) => {
      const engine = await import("@/lib/video-engine");
      return engine.exportFiltered(
        file,
        info,
        {
          filters: fill
            ? [
                `scale=${output.width}:${output.height}:force_original_aspect_ratio=increase:flags=lanczos`,
                `crop=${output.width}:${output.height}`,
              ]
            : [`scale=${output.width}:${output.height}:flags=lanczos`],
          width: output.width,
          height: output.height,
          container: format,
        },
        onProgress,
        signal,
      );
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
            void tool.open(file, (info) => {
              setLock(true);
              setMode("fit");
              setBox({ width: even(info.width), height: even(info.height) });
            })
          }
          onClose={tool.close}
        >
          {loaded ? (
            <>
              <VideoPlayer
                key={loaded.url}
                src={loaded.url}
                hasSound={loaded.info.hasSound}
                aspect={output.width / output.height}
                videoStyle={{ objectFit: !lock && mode === "fill" ? "cover" : "fill" }}
              />
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Preview of the finished shape: {output.width}×{output.height}
              </p>
            </>
          ) : null}
        </FileStage>
      }
      side={
        <>
          <Panel title="Size" action={<ResetButton disabled={locked} onClick={reset} />}>
            <div className="grid gap-4">
              <Choices
                label="Presets"
                columns={4}
                value={preset}
                options={presets.map((value) => ({
                  value,
                  label: `${value}p`,
                  disabled: Math.max(value * aspect, value / aspect) > MAX_SIDE,
                }))}
                disabled={locked}
                onChange={choosePreset}
              />
              <div>
                <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-2">
                  <NumberField
                    label="Width"
                    value={loaded ? box.width : 0}
                    min={16}
                    max={MAX_SIDE}
                    disabled={locked}
                    onCommit={(value) => update(lock ? shaped(value) : { ...box, width: even(value) })}
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
                      if (!lock) update(shaped(box.width));
                      else tool.changed();
                      setLock(!lock);
                    }}
                  >
                    {lock ? <Lock className="h-4 w-4" aria-hidden="true" /> : <Unlock className="h-4 w-4" aria-hidden="true" />}
                  </Button>
                  <NumberField
                    label="Height"
                    value={loaded ? box.height : 0}
                    min={16}
                    max={MAX_SIDE}
                    disabled={locked}
                    onCommit={(value) => update(lock ? shaped(value * aspect) : { ...box, height: even(value) })}
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {lock ? "The shape is locked to the original." : "The shape is unlocked. Choose how the video fits."}
                </p>
              </div>
              {lock ? null : (
                <Choices
                  label="How it fits"
                  value={mode}
                  options={[
                    { value: "fit", label: "Fit", note: "No cropping" },
                    { value: "fill", label: "Fill", note: "Crops edges" },
                    { value: "stretch", label: "Stretch", note: "Changes shape" },
                  ]}
                  disabled={locked}
                  onChange={(value) => {
                    tool.changed();
                    setMode(value);
                  }}
                />
              )}
              <Choices label="Format" value={format} options={videoFormats} disabled={locked} onChange={(value) => { tool.changed(); setFormat(value); }} />
              <Facts
                items={[
                  ["Original", loaded ? `${source.width}×${source.height}` : "–"],
                  ["Output", loaded ? `${output.width}×${output.height}` : "–"],
                ]}
              />
              {loaded && upscaled ? (
                <p className="text-sm leading-6 text-amber-700 dark:text-amber-400">
                  This is larger than the original. It adds no detail, and it takes longer.
                </p>
              ) : null}
            </div>
          </Panel>
          <ExportPanel
            action="Resize video"
            disabled={!loaded || same}
            disabledReason={loaded ? "Choose a different size first." : "Choose a video first."}
            progress={tool.progress}
            result={tool.result}
            error={loaded ? tool.error : ""}
            notice={tool.notice}
            originalSize={loaded?.file.size}
            onStart={start}
            onCancel={tool.cancel}
            note="Sizes are rounded to even pixels. The sound is kept."
          />
        </>
      }
    />
  );
}
