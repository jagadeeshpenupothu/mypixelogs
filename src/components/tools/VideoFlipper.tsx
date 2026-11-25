"use client";

import { useState } from "react";
import { FlipHorizontal2, FlipVertical2 } from "lucide-react";

import { baseName, formatSize, useVideoTool } from "@/components/tools/video/use-video-tool";
import {
  Choices,
  describeVideo,
  ExportPanel,
  Facts,
  FileStage,
  Panel,
  ResetButton,
  ToolGrid,
  videoFormats,
  VideoPlayer,
  type VideoFormat,
} from "@/components/tools/video/video-kit";
import { evenDown } from "@/lib/video-rules";

const readInfo = async (file: File) => (await import("@/lib/video-engine")).readVideoInfo(file);

export function VideoFlipper() {
  const tool = useVideoTool(readInfo);
  const [flip, setFlip] = useState({ horizontal: false, vertical: false });
  const [format, setFormat] = useState<VideoFormat>("mp4");
  const [view, setView] = useState<"flipped" | "original">("flipped");
  const { loaded, busy } = tool;
  const flipped = flip.horizontal || flip.vertical;
  const state = [flip.horizontal ? "Horizontal" : "", flip.vertical ? "Vertical" : ""].filter(Boolean).join(" + ") || "None";

  function change(next: typeof flip) {
    tool.changed();
    setFlip(next);
    setView("flipped");
  }

  function start() {
    if (!loaded) return;
    const { file, info } = loaded;
    void tool.run(`${baseName(file.name)}-flipped.${format}`, async (onProgress, signal) => {
      const engine = await import("@/lib/video-engine");
      const width = evenDown(info.width);
      const height = evenDown(info.height);
      return engine.exportFiltered(
        file,
        info,
        {
          filters: [
            ...(width !== info.width || height !== info.height ? [`crop=${width}:${height}:0:0:exact=1`] : []),
            ...(flip.horizontal ? ["hflip"] : []),
            ...(flip.vertical ? ["vflip"] : []),
          ],
          width,
          height,
          container: format,
        },
        onProgress,
        signal,
      );
    });
  }

  const choices = [
    { key: "horizontal" as const, label: "Flip horizontally", note: "Left and right swap", Icon: FlipHorizontal2 },
    { key: "vertical" as const, label: "Flip vertically", note: "Top and bottom swap", Icon: FlipVertical2 },
  ];

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
          onFile={(file) => void tool.open(file, () => change({ horizontal: false, vertical: false }))}
          onClose={tool.close}
        >
          {loaded ? (
            <>
              <VideoPlayer
                key={loaded.url}
                src={loaded.url}
                hasSound={loaded.info.hasSound}
                aspect={loaded.info.width / loaded.info.height}
                videoStyle={{
                  transform:
                    view === "flipped" ? `scale(${flip.horizontal ? -1 : 1}, ${flip.vertical ? -1 : 1})` : undefined,
                }}
              />
              <div className="mt-3">
                <Choices
                  label="Show"
                  columns={2}
                  value={view}
                  options={[
                    { value: "original", label: "Original" },
                    { value: "flipped", label: "Flipped" },
                  ]}
                  onChange={setView}
                />
              </div>
            </>
          ) : null}
        </FileStage>
      }
      side={
        <>
          <Panel title="Flip" action={<ResetButton disabled={!loaded || busy || !flipped} onClick={() => change({ horizontal: false, vertical: false })} />}>
            <div className="grid gap-2">
              {choices.map(({ key, label, note, Icon }) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={flip[key]}
                  disabled={!loaded || busy}
                  onClick={() => change({ ...flip, [key]: !flip[key] })}
                  className={`flex min-h-14 items-center gap-3 rounded-md border px-3 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 disabled:opacity-40 ${
                    flip[key] ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{label}</span>
                    <span className="block text-xs opacity-80">{note}</span>
                  </span>
                  <span className="text-xs font-bold">{flip[key] ? "On" : "Off"}</span>
                </button>
              ))}
            </div>
            <div className="mt-4">
              <Choices label="Format" value={format} options={videoFormats} disabled={!loaded || busy} onChange={(value) => { tool.changed(); setFormat(value); }} />
            </div>
            <div className="mt-4">
              <Facts
                items={[
                  ["Flip", state],
                  ["Original size", loaded ? formatSize(loaded.file.size) : "–"],
                ]}
              />
            </div>
          </Panel>
          <ExportPanel
            action="Flip video"
            disabled={!loaded || !flipped}
            disabledReason={loaded ? "Choose a direction first." : "Choose a video first."}
            progress={tool.progress}
            result={tool.result}
            error={loaded ? tool.error : ""}
            notice={tool.notice}
            originalSize={loaded?.file.size}
            onStart={start}
            onCancel={tool.cancel}
            note="The picture is re-encoded at high quality and the sound is kept."
          />
        </>
      }
    />
  );
}
