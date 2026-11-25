"use client";

import { useState, type KeyboardEvent, type PointerEvent } from "react";
import { Crosshair } from "lucide-react";

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
import { largestBox, MIN_CROP, moveBox, resizeBox, tidy, type CropBox, type CropHandle } from "@/lib/crop-box";

const readInfo = async (file: File) => (await import("@/lib/video-engine")).readVideoInfo(file);

const ratios = [
  { value: "free", label: "Free", ratio: null },
  { value: "16:9", label: "16:9", ratio: 16 / 9 },
  { value: "9:16", label: "9:16", ratio: 9 / 16 },
  { value: "1:1", label: "1:1", ratio: 1 },
  { value: "4:3", label: "4:3", ratio: 4 / 3 },
  { value: "3:4", label: "3:4", ratio: 3 / 4 },
  { value: "4:5", label: "4:5", ratio: 4 / 5 },
  { value: "21:9", label: "21:9", ratio: 21 / 9 },
];

const handles: { id: CropHandle; place: string; cursor: string; mark: string }[] = [
  { id: "n", place: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/3", cursor: "cursor-ns-resize", mark: "h-1.5 w-6" },
  { id: "s", place: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3", cursor: "cursor-ns-resize", mark: "h-1.5 w-6" },
  { id: "e", place: "right-0 top-1/2 -translate-y-1/2 translate-x-1/3", cursor: "cursor-ew-resize", mark: "h-6 w-1.5" },
  { id: "w", place: "left-0 top-1/2 -translate-x-1/3 -translate-y-1/2", cursor: "cursor-ew-resize", mark: "h-6 w-1.5" },
  { id: "nw", place: "left-0 top-0 -translate-x-1/3 -translate-y-1/3", cursor: "cursor-nwse-resize", mark: "h-3.5 w-3.5" },
  { id: "ne", place: "right-0 top-0 -translate-y-1/3 translate-x-1/3", cursor: "cursor-nesw-resize", mark: "h-3.5 w-3.5" },
  { id: "sw", place: "bottom-0 left-0 -translate-x-1/3 translate-y-1/3", cursor: "cursor-nesw-resize", mark: "h-3.5 w-3.5" },
  { id: "se", place: "bottom-0 right-0 translate-x-1/3 translate-y-1/3", cursor: "cursor-nwse-resize", mark: "h-3.5 w-3.5" },
];

export function VideoCropper() {
  const tool = useVideoTool(readInfo);
  const [box, setBox] = useState<CropBox>({ x: 0, y: 0, w: 2, h: 2 });
  const [shape, setShape] = useState("free");
  const [format, setFormat] = useState<VideoFormat>("mp4");
  const [preview, setPreview] = useState(false);
  const [drag, setDrag] = useState<{ target: CropHandle | "move"; x: number; y: number; box: CropBox; scale: number } | null>(null);
  const { loaded, busy } = tool;
  const width = loaded?.info.width ?? 2;
  const height = loaded?.info.height ?? 2;
  const ratio = ratios.find((item) => item.value === shape)?.ratio ?? null;
  const locked = !loaded || busy;
  const full = { x: 0, y: 0, w: Math.floor(width / 2) * 2, h: Math.floor(height / 2) * 2 };
  const unchanged = box.w === full.w && box.h === full.h;

  function update(next: CropBox) {
    tool.changed();
    setBox(next);
  }

  function chooseShape(value: string) {
    setShape(value);
    tool.changed();
    const next = ratios.find((item) => item.value === value)?.ratio ?? null;
    if (next !== null) update(largestBox(next, width, height, { x: box.x + box.w / 2, y: box.y + box.h / 2 }));
  }

  function typeSize(side: "w" | "h", value: number) {
    let w = side === "w" ? value : box.w;
    let h = side === "h" ? value : box.h;
    if (ratio !== null) {
      if (side === "w") h = w / ratio;
      else w = h * ratio;
      const shrink = Math.min(1, width / w, height / h);
      const grow = Math.max(1, MIN_CROP / w, MIN_CROP / h);
      w *= shrink * grow;
      h *= shrink * grow;
    }
    const centre = { x: box.x + box.w / 2, y: box.y + box.h / 2 };
    update(tidy({ w, h, x: Math.max(0, centre.x - w / 2), y: Math.max(0, centre.y - h / 2) }, width, height));
  }

  const pointer = (target: CropHandle | "move") => ({
    onPointerDown(event: PointerEvent<HTMLElement>) {
      if (locked || event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      const frame = event.currentTarget.closest("[data-testid=frame]")?.getBoundingClientRect();
      if (!frame || frame.width === 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.focus({ preventScroll: true });
      setDrag({ target, x: event.clientX, y: event.clientY, box, scale: width / frame.width });
    },
    onPointerMove(event: PointerEvent<HTMLElement>) {
      if (!drag || drag.target !== target) return;
      const dx = (event.clientX - drag.x) * drag.scale;
      const dy = (event.clientY - drag.y) * drag.scale;
      update(
        target === "move" ? moveBox(drag.box, dx, dy, width, height) : resizeBox(drag.box, target, dx, dy, ratio, width, height),
      );
    },
    onPointerUp() {
      setDrag(null);
    },
    onPointerCancel() {
      setDrag(null);
    },
  });

  const keys = (target: CropHandle | "move") => ({
    onKeyDown(event: KeyboardEvent<HTMLElement>) {
      const step = event.shiftKey ? 20 : 2;
      const way = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[event.key];
      if (!way || locked) return;
      event.preventDefault();
      event.stopPropagation();
      update(target === "move" ? moveBox(box, way[0], way[1], width, height) : resizeBox(box, target, way[0], way[1], ratio, width, height));
    },
  });

  function start() {
    if (!loaded) return;
    const { file, info } = loaded;
    void tool.run(`${baseName(file.name)}-cropped.${format}`, async (onProgress, signal) => {
      const engine = await import("@/lib/video-engine");
      return engine.exportFiltered(
        file,
        info,
        { filters: [`crop=${box.w}:${box.h}:${box.x}:${box.y}`], width: box.w, height: box.h, container: format },
        onProgress,
        signal,
      );
    });
  }

  const percent = (value: number, whole: number) => `${(value / whole) * 100}%`;

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
              setShape("free");
              setPreview(false);
              // Starts a little inside the picture, so the box is easy to see and grab.
              setBox(tidy({ x: info.width * 0.1, y: info.height * 0.1, w: info.width * 0.8, h: info.height * 0.8 }, info.width, info.height));
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
                aspect={preview ? box.w / box.h : width / height}
                videoStyle={
                  preview
                    ? {
                        inset: "auto",
                        left: `${(-box.x / box.w) * 100}%`,
                        top: `${(-box.y / box.h) * 100}%`,
                        width: percent(width, box.w),
                        height: percent(height, box.h),
                      }
                    : undefined
                }
                overlay={
                  preview ? null : (
                    <div
                      data-testid="crop"
                      role="group"
                      tabIndex={0}
                      aria-label={`Crop area, ${box.w} by ${box.h} pixels at ${box.x}, ${box.y}. Use the arrow keys to move it.`}
                      className={`absolute touch-none border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] outline-none focus-visible:border-amber-300 ${
                        busy ? "" : "cursor-move"
                      }`}
                      style={{ left: percent(box.x, width), top: percent(box.y, height), width: percent(box.w, width), height: percent(box.h, height) }}
                      {...pointer("move")}
                      {...keys("move")}
                    >
                      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-1/3 w-1/3 border-x border-white/35" />
                      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/3 h-1/3 border-y border-white/35" />
                      {handles.map((handle) => (
                        <button
                          key={handle.id}
                          type="button"
                          data-handle={handle.id}
                          disabled={busy}
                          aria-label={`Resize crop, ${handle.id.toUpperCase()} side`}
                          className={`absolute flex h-8 w-8 touch-none items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${handle.place} ${handle.cursor}`}
                          {...pointer(handle.id)}
                          {...keys(handle.id)}
                        >
                          <span aria-hidden="true" className={`rounded-sm bg-[#fff] shadow-[0_0_0_1px_rgba(0,0,0,0.5)] ${handle.mark}`} />
                        </button>
                      ))}
                    </div>
                  )
                }
              />
              <div className="mt-3">
                <Choices
                  label="Show"
                  columns={2}
                  value={preview ? "result" : "edit"}
                  options={[
                    { value: "edit", label: "Crop box" },
                    { value: "result", label: "Cropped preview" },
                  ]}
                  onChange={(value) => setPreview(value === "result")}
                />
              </div>
            </>
          ) : null}
        </FileStage>
      }
      side={
        <>
          <Panel
            title="Crop"
            action={
              <ResetButton
                disabled={locked}
                onClick={() => {
                  setShape("free");
                  setPreview(false);
                  update(full);
                }}
              />
            }
          >
            <div className="grid gap-4">
              <Choices label="Shape" columns={4} value={shape} options={ratios} disabled={locked} onChange={chooseShape} />
              <div className="grid grid-cols-2 gap-3">
                <NumberField label="Width" value={box.w} min={MIN_CROP} max={full.w} disabled={locked} onCommit={(value) => typeSize("w", value)} />
                <NumberField label="Height" value={box.h} min={MIN_CROP} max={full.h} disabled={locked} onCommit={(value) => typeSize("h", value)} />
                <NumberField label="From left" value={box.x} min={0} max={width - box.w} disabled={locked} onCommit={(value) => update(tidy({ ...box, x: value }, width, height))} />
                <NumberField label="From top" value={box.y} min={0} max={height - box.h} disabled={locked} onCommit={(value) => update(tidy({ ...box, y: value }, width, height))} />
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={locked}
                onClick={() => update(tidy({ ...box, x: (width - box.w) / 2, y: (height - box.h) / 2 }, width, height))}
              >
                <Crosshair className="h-4 w-4" aria-hidden="true" />
                Center crop
              </Button>
              <Choices label="Format" value={format} options={videoFormats} disabled={locked} onChange={(value) => { tool.changed(); setFormat(value); }} />
              <Facts
                items={[
                  ["Original", loaded ? `${width}×${height}` : "–"],
                  ["Cropped", loaded ? `${box.w}×${box.h}` : "–"],
                ]}
              />
            </div>
          </Panel>
          <ExportPanel
            action="Crop video"
            disabled={!loaded || unchanged}
            disabledReason={loaded ? "Make the crop box smaller than the video." : "Choose a video first."}
            progress={tool.progress}
            result={tool.result}
            error={loaded ? tool.error : ""}
            notice={tool.notice}
            originalSize={loaded?.file.size}
            onStart={start}
            onCancel={tool.cancel}
            note="Sizes are rounded to even pixels, which video needs. The sound is kept."
          />
        </>
      }
    />
  );
}
