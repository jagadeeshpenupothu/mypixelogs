import { gifAdvice, type GifQuality } from "@/lib/gif-settings";
import type { VideoInfo } from "@/lib/video-ffmpeg";
import { canCopySound, even } from "@/lib/video-rules";

export type Format = "mp4" | "webm" | "mov" | "mkv" | "avi" | "gif";
export type VideoCodec = "copy" | "h264" | "vp8" | "mpeg4";
export type AudioCodec = "copy" | "aac" | "mp3" | "opus" | "flac" | "none";
export type Quality = "high" | "medium" | "low" | "custom";
export type Resolution = 0 | 1080 | 720 | 480;

export type ConvertSettings = {
  format: Format;
  video: VideoCodec;
  audio: AudioCodec;
  quality: Quality;
  crf: number;
  resolution: Resolution;
};

const videoCodecs: Record<Format, VideoCodec[]> = {
  mp4: ["h264"],
  mov: ["h264"],
  mkv: ["h264", "vp8"],
  webm: ["vp8"],
  avi: ["h264", "mpeg4"],
  gif: [],
};
const audioCodecs: Record<Format, AudioCodec[]> = {
  mp4: ["aac", "mp3"],
  mov: ["aac", "mp3"],
  mkv: ["aac", "mp3", "opus", "flac"],
  webm: ["opus"],
  avi: ["mp3"],
  gif: [],
};
const copyable: Record<Format, string[]> = {
  mp4: ["avc", "h264", "hevc", "vp9", "av1"],
  mov: ["avc", "h264", "hevc"],
  mkv: ["avc", "h264", "hevc", "vp8", "vp9", "av1"],
  webm: ["vp8", "vp9", "av1"],
  avi: [],
  gif: [],
};

export function videoOptions(info: VideoInfo, format: Format, resolution: Resolution): VideoCodec[] {
  const canCopy =
    copyable[format].includes(info.videoCodec) &&
    shape(info, resolution).scaled === false &&
    // These two containers do not keep a rotation stored in the file.
    (info.rotation === 0 || format === "mp4" || format === "mov");
  return [...videoCodecs[format], ...(canCopy ? (["copy"] as const) : [])];
}

export function audioOptions(info: VideoInfo, format: Format): AudioCodec[] {
  if (!info.hasSound || format === "gif") return ["none"];
  return [...(canCopySound(info.audioCodec, format) ? (["copy"] as const) : []), ...audioCodecs[format], "none"];
}

/** Output size: the chosen short side, never larger than the original. */
export function shape(info: VideoInfo, resolution: Resolution) {
  const short = Math.min(info.width, info.height);
  if (resolution === 0 || short <= resolution || short === 0) {
    return { width: info.width, height: info.height, scaled: false };
  }
  const scale = resolution / short;
  return { width: even(info.width * scale), height: even(info.height * scale), scaled: true };
}

export function qualityValue({ quality, crf }: ConvertSettings) {
  return { high: 18, medium: 23, low: 28, custom: crf }[quality];
}

export function gifSettings(info: VideoInfo, settings: ConvertSettings) {
  const { width, height } = shape(info, settings.resolution);
  const value = qualityValue(settings);
  const quality: GifQuality = value <= 20 ? "high" : value <= 25 ? "medium" : "small";
  return { start: 0, end: info.duration, fps: 15, width, height, quality };
}

export const gifProblem = (info: VideoInfo, settings: ConvertSettings) =>
  settings.format === "gif" ? gifAdvice(gifSettings(info, settings)) : null;
