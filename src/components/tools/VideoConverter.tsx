"use client";

import { useState } from "react";

import { baseName, formatSize, useVideoTool } from "@/components/tools/video/use-video-tool";
import { Choices, describeVideo, ExportPanel, Facts, FileStage, Panel, ResetButton, ToolGrid, VideoPlayer } from "@/components/tools/video/video-kit";
import {
  audioOptions,
  gifProblem,
  qualityValue,
  shape,
  videoOptions,
  type AudioCodec,
  type ConvertSettings,
  type Format,
  type VideoCodec,
} from "@/lib/convert-settings";
import type { VideoInfo } from "@/lib/video-ffmpeg";

const readInfo = async (file: File) => (await import("@/lib/video-engine")).readVideoInfo(file);

const formats: { value: Format; label: string }[] = [
  { value: "mp4", label: "MP4" },
  { value: "webm", label: "WebM" },
  { value: "mov", label: "MOV" },
  { value: "mkv", label: "MKV" },
  { value: "avi", label: "AVI" },
  { value: "gif", label: "GIF" },
];
const videoNames: Record<VideoCodec, string> = { h264: "H.264", vp8: "VP8", mpeg4: "MPEG-4", copy: "Keep original" };
const audioNames: Record<AudioCodec, string> = { copy: "Keep original", aac: "AAC", mp3: "MP3", opus: "Opus", flac: "FLAC", none: "No sound" };
const codecNames: Record<string, string> = { avc: "H.264", h264: "H.264", hevc: "H.265", vp8: "VP8", vp9: "VP9", av1: "AV1", mpeg4: "MPEG-4" };
const defaults: ConvertSettings = { format: "mp4", video: "h264", audio: "aac", quality: "high", crf: 20, resolution: 0 };

/** Keeps every choice valid for the format and the file. */
function fitSettings(info: VideoInfo, next: ConvertSettings, newFormat: boolean): ConvertSettings {
  const video = videoOptions(info, next.format, next.resolution);
  const audio = audioOptions(info, next.format);
  return {
    ...next,
    video: !newFormat && video.includes(next.video) ? next.video : (video[0] ?? "h264"),
    audio: !newFormat && audio.includes(next.audio) ? next.audio : audio[0],
  };
}

export function VideoConverter() {
  const tool = useVideoTool(readInfo);
  const [settings, setSettings] = useState(defaults);
  const { loaded, busy } = tool;
  const info = loaded?.info;
  const locked = !loaded || busy;
  const gif = settings.format === "gif";
  const copy = settings.video === "copy" && !gif;
  const size = info ? shape(info, settings.resolution) : null;
  const problem = info ? gifProblem(info, settings) : null;
  const inputFormat = loaded ? (/\.([^.]+)$/.exec(loaded.file.name)?.[1] ?? "video").toUpperCase() : "–";
  const short = info ? Math.min(info.width, info.height) : 0;

  function change(part: Partial<ConvertSettings>) {
    if (!info) return;
    tool.changed();
    setSettings((current) => fitSettings(info, { ...current, ...part }, part.format !== undefined));
  }

  function start() {
    if (!loaded) return;
    const { file, info: details } = loaded;
    void tool.run(`${baseName(file.name)}-converted.${settings.format}`, async (onProgress, signal) => {
      const engine = await import("@/lib/video-engine");
      return engine.convertVideo(file, details, settings, onProgress, signal);
    });
  }

  return (
    <ToolGrid
      main={
        <FileStage
          hint="MP4, MOV, WebM, MKV, AVI, FLV, WMV and more, up to 2 GB. It stays on your device."
          fileName={loaded?.file.name ?? null}
          details={loaded ? describeVideo(loaded.file, loaded.info) : undefined}
          opening={tool.opening}
          busy={busy}
          error={loaded ? "" : tool.error}
          onFile={(file) => void tool.open(file, (details) => setSettings(fitSettings(details, defaults, true)))}
          onClose={tool.close}
        >
          {loaded && info ? (
            <>
              <VideoPlayer key={loaded.url} src={loaded.url} hasSound={info.hasSound} aspect={info.width / info.height || 16 / 9} />
              <div className="mt-3">
                <Facts
                  items={[
                    ["Input format", inputFormat],
                    ["Input size", formatSize(loaded.file.size)],
                    ["Video codec", codecNames[info.videoCodec] ?? info.videoCodec],
                    ["Audio codec", info.hasSound ? (info.audioCodec ?? "Unknown").toUpperCase() : "No sound"],
                  ]}
                />
              </div>
            </>
          ) : null}
        </FileStage>
      }
      side={
        <>
          <Panel
            title="Convert to"
            action={
              <ResetButton
                disabled={locked}
                onClick={() => {
                  tool.changed();
                  if (info) setSettings(fitSettings(info, defaults, true));
                }}
              />
            }
          >
            <div className="grid gap-4">
              <Choices label="Format" value={settings.format} options={formats} disabled={locked} onChange={(format) => change({ format })} />
              {gif ? null : (
                <>
                  <Choices
                    label="Video codec"
                    columns={2}
                    value={settings.video}
                    options={(info ? videoOptions(info, settings.format, settings.resolution) : (["h264"] as const)).map((value) => ({
                      value,
                      label: videoNames[value],
                      note: value === "copy" ? "No quality loss" : undefined,
                    }))}
                    disabled={locked}
                    onChange={(video) => change({ video })}
                  />
                  <Choices
                    label="Audio codec"
                    columns={2}
                    value={settings.audio}
                    options={(info ? audioOptions(info, settings.format) : (["aac"] as const)).map((value) => ({ value, label: audioNames[value] }))}
                    disabled={locked}
                    onChange={(audio) => change({ audio })}
                  />
                </>
              )}
              {copy ? (
                <p className="text-sm leading-6 text-muted-foreground">The picture is copied exactly, so quality settings do not apply.</p>
              ) : (
                <>
                  <Choices
                    label="Quality"
                    columns={4}
                    value={settings.quality}
                    options={[
                      { value: "high", label: "High" },
                      { value: "medium", label: "Medium" },
                      { value: "low", label: "Low" },
                      { value: "custom", label: "Custom" },
                    ]}
                    disabled={locked}
                    onChange={(quality) => change({ quality })}
                  />
                  {settings.quality === "custom" ? (
                    <label className="block text-sm font-medium text-foreground">
                      Custom quality: {settings.crf}
                      <input
                        type="range"
                        min={14}
                        max={35}
                        step={1}
                        value={settings.crf}
                        disabled={locked}
                        onChange={(event) => change({ crf: Number(event.target.value) })}
                        className="mt-2 h-8 w-full accent-primary"
                      />
                      <span className="flex justify-between text-xs font-normal text-muted-foreground">
                        <span>14, best</span>
                        <span>35, smallest</span>
                      </span>
                    </label>
                  ) : null}
                </>
              )}
              <Choices
                label="Resolution"
                columns={4}
                value={settings.resolution}
                options={([0, 1080, 720, 480] as const).map((value) => ({
                  value,
                  label: value === 0 ? "Original" : `${value}p`,
                  disabled: value !== 0 && info !== undefined && short <= value,
                }))}
                disabled={locked}
                onChange={(resolution) => change({ resolution })}
              />
              <Facts
                items={[
                  ["Output format", loaded ? settings.format.toUpperCase() : "–"],
                  ["Output picture", size ? `${size.width}×${size.height}` : "–"],
                  ["Video", !loaded ? "–" : gif ? "GIF, 15 fps" : videoNames[settings.video]],
                  ["Audio", !loaded ? "–" : audioNames[settings.audio]],
                  ["Quality", !loaded ? "–" : copy ? "Unchanged" : `${settings.quality} (${qualityValue(settings)})`],
                  ["Length", info ? `${info.duration.toFixed(1)} s` : "–"],
                ]}
              />
              {problem ? (
                <p className={`text-sm leading-6 ${problem.blocked ? "text-red-600 dark:text-red-400" : "text-amber-700 dark:text-amber-400"}`}>{problem.text}</p>
              ) : null}
              <p className="text-xs leading-5 text-muted-foreground">
                H.265, VP9 and AV1 cannot be encoded by this browser engine. Choose Keep original to move a video that already uses them.
              </p>
            </div>
          </Panel>
          <ExportPanel
            action={`Convert to ${settings.format.toUpperCase()}`}
            disabled={!loaded || problem?.blocked === true}
            disabledReason={loaded ? undefined : "Choose a video first."}
            progress={tool.progress}
            result={tool.result}
            error={loaded ? tool.error : ""}
            notice={tool.notice}
            originalSize={loaded?.file.size}
            onStart={start}
            onCancel={tool.cancel}
          />
        </>
      }
    />
  );
}
