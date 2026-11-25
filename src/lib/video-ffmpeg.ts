import { FFmpeg, type FFFSType } from "@ffmpeg/ffmpeg";
import { ALL_FORMATS, BlobSource, CanvasSink, Input, type InputVideoTrack } from "mediabunny";

import { canCopySound } from "@/lib/video-rules";

/** Copied from node_modules by scripts/copy-ffmpeg.mjs, so nothing loads from another site. */
const FFMPEG_PATH = "/ffmpeg/0.12.10";

export const MAX_FILE_SIZE = 2 * 1024 ** 3;

export class VideoToolError extends Error {}
export class VideoToolCanceled extends Error {}

export type VideoInfo = {
  duration: number;
  /** Size as shown, after any rotation stored in the file. */
  width: number;
  height: number;
  frameRate: number;
  videoCodec: string;
  audioCodec: string | null;
  hasSound: boolean;
  hdr: boolean;
  /** Degrees of rotation stored in the file rather than in the picture. */
  rotation: number;
  /** Frames can be drawn for a timeline. */
  canDraw: boolean;
  /** The frame index could be read. */
  hasIndex: boolean;
};

export type Progress = { stage: "loading" | "working" | "checking"; value: number };

const openInput = (file: Blob) => new Input({ source: new BlobSource(file), formats: ALL_FORMATS });

export function extensionOf(name: string) {
  return (/\.([a-z0-9]{2,4})$/i.exec(name)?.[1] ?? "mp4").toLowerCase();
}

// ---------------------------------------------------------------- FFmpeg

export async function startFFmpeg(signal?: AbortSignal) {
  const ffmpeg = new FFmpeg();
  const base = `${window.location.origin}${FFMPEG_PATH}`;
  try {
    await ffmpeg.load(
      { coreURL: `${base}/ffmpeg-core.js`, wasmURL: `${base}/ffmpeg-core.wasm`, classWorkerURL: `${base}/worker.js` },
      { signal },
    );
  } catch {
    ffmpeg.terminate();
    if (signal?.aborted) throw new VideoToolCanceled();
    throw new VideoToolError("The video engine could not be loaded. Check your connection and try again.");
  }
  return ffmpeg;
}

/** Gives FFmpeg the file without copying it into memory. Returns its path. */
export async function mount(ffmpeg: FFmpeg, file: File) {
  const name = `input.${extensionOf(file.name)}`;
  await ffmpeg.createDir("/in");
  await ffmpeg.mount("WORKERFS" as FFFSType, { files: [new File([file], name)] }, "/in");
  return `/in/${name}`;
}

// ---------------------------------------------------------------- Reading

async function readWithIndex(file: File): Promise<VideoInfo | null> {
  const input = openInput(file);
  try {
    const track = await input.getPrimaryVideoTrack();
    if (!track) throw new VideoToolError("No video was found in this file.");
    const [duration, width, height, stats, codec, audio, hdr, rotation, canDraw] = await Promise.all([
      input.computeDuration(),
      track.getDisplayWidth(),
      track.getDisplayHeight(),
      track.computePacketStats(),
      track.getCodec(),
      input.getPrimaryAudioTrack(),
      track.hasHighDynamicRange(),
      track.getRotation(),
      track.canDecode(),
    ]);
    return {
      duration,
      width,
      height,
      frameRate: stats.averagePacketRate,
      videoCodec: codec ?? "unknown",
      audioCodec: audio ? await audio.getCodec() : null,
      hasSound: audio !== null,
      hdr,
      rotation,
      canDraw,
      hasIndex: true,
    };
  } catch (error) {
    if (error instanceof VideoToolError) throw error;
    return null;
  } finally {
    input.dispose();
  }
}

/** Older formats such as AVI: FFmpeg reads the details instead. */
async function readWithFFmpeg(file: File): Promise<VideoInfo> {
  const ffmpeg = await startFFmpeg();
  try {
    const lines: string[] = [];
    ffmpeg.on("log", ({ message }) => lines.push(message));
    const path = await mount(ffmpeg, file);
    await ffmpeg.exec(["-hide_banner", "-i", path]);
    const log = lines.join("\n");
    const time = /Duration: (\d+):(\d+):([\d.]+)/.exec(log);
    const video = /Stream #.*Video: (\w+).*/.exec(log);
    if (!time || !video) throw new VideoToolError("This file is not a video that can be read here.");
    const size = /, (\d{2,5})x(\d{2,5})/.exec(video[0]);
    const rate = /([\d.]+) fps/.exec(video[0]);
    return {
      duration: Number(time[1]) * 3600 + Number(time[2]) * 60 + Number(time[3]),
      width: size ? Number(size[1]) : 0,
      height: size ? Number(size[2]) : 0,
      frameRate: rate ? Number(rate[1]) : 25,
      videoCodec: video[1],
      audioCodec: /Stream #.*Audio: (\w+)/.exec(log)?.[1] ?? null,
      hasSound: /Stream #.*Audio:/.test(log),
      hdr: /smpte2084|arib-std-b67/.test(video[0]),
      rotation: 0,
      canDraw: false,
      hasIndex: false,
    };
  } finally {
    ffmpeg.terminate();
  }
}

export async function readVideoInfo(file: File): Promise<VideoInfo> {
  const info = (await readWithIndex(file)) ?? (await readWithFFmpeg(file));
  if (!(info.duration > 0)) throw new VideoToolError("This video has no length, so it cannot be used.");
  return info;
}

export async function withTrack<T>(file: Blob, read: (track: InputVideoTrack) => Promise<T>): Promise<T | null> {
  const input = openInput(file);
  try {
    const track = await input.getPrimaryVideoTrack();
    return track ? await read(track) : null;
  } catch {
    return null;
  } finally {
    input.dispose();
  }
}

/** Small pictures for the timeline. Calls back as each one is ready. */
export async function drawThumbnails(
  file: File,
  info: VideoInfo,
  count: number,
  onThumbnail: (index: number, url: string) => void,
  signal: AbortSignal,
) {
  if (!info.canDraw) return;
  await withTrack(file, async (track) => {
    const sink = new CanvasSink(track, { height: 96, poolSize: 1 });
    for (let index = 0; index < count && !signal.aborted; index += 1) {
      const frame = await sink.getCanvas(((index + 0.5) / count) * info.duration);
      if (!frame || signal.aborted) continue;
      const copy = document.createElement("canvas");
      copy.width = frame.canvas.width;
      copy.height = frame.canvas.height;
      copy.getContext("2d")?.drawImage(frame.canvas, 0, 0);
      onThumbnail(index, copy.toDataURL("image/jpeg", 0.6));
    }
  });
}

export const mimeTypes: Record<string, string> = {
  mp4: "video/mp4",
  mov: "video/quicktime",
  mkv: "video/x-matroska",
  webm: "video/webm",
  avi: "video/x-msvideo",
  gif: "image/gif",
};

/** A sentence people can act on, from FFmpeg's last messages. */
export function explainFailure(log: string[], codec = "") {
  const text = log.join("\n");
  if (/memory|OOM|abort/i.test(text)) return "The browser ran out of memory. Try a shorter video, a smaller size or a lower quality.";
  if (/Decoder .*not found|no decoder|could not find codec|doesn't support hardware|Failed to get pixel format/i.test(text) || /^av1$/i.test(codec)) {
    return `This video uses a format (${codec || "unknown"}) that cannot be re-encoded here.`;
  }
  if (/Invalid data found|moov atom not found/i.test(text)) return "This file seems to be damaged or incomplete.";
  return "The video could not be processed. Its format may be damaged or unsupported.";
}

export type Step = { args: string[]; output: string };

/**
 * Runs FFmpeg steps on one file and returns the last step's output.
 * The worker always ends afterwards, which frees the mounted file, temporary files and memory.
 */
export async function runFFmpeg(
  file: File,
  options: { codec?: string; duration: number; steps: (source: string) => Step[] },
  onProgress: (progress: Progress) => void,
  signal: AbortSignal,
): Promise<Blob> {
  onProgress({ stage: "loading", value: 0 });
  const ffmpeg = await startFFmpeg(signal);
  const stop = () => ffmpeg.terminate();
  signal.addEventListener("abort", stop);
  const log: string[] = [];
  let step = 0;
  try {
    const source = await mount(ffmpeg, file);
    const steps = options.steps(source);
    ffmpeg.on("log", ({ message }) => {
      log.push(message);
      if (log.length > 60) log.shift();
      const time = /time=(\d+):(\d+):([\d.]+)/.exec(message);
      if (!time) return;
      const done = (Number(time[1]) * 3600 + Number(time[2]) * 60 + Number(time[3])) / options.duration;
      onProgress({ stage: "working", value: Math.min(0.99, (step + Math.min(1, Math.max(0, done))) / steps.length) });
    });
    onProgress({ stage: "working", value: 0 });
    for (const [index, { args, output }] of steps.entries()) {
      step = index;
      const code = await ffmpeg.exec(["-hide_banner", "-y", ...args, output]);
      if (signal.aborted) throw new VideoToolCanceled();
      if (code !== 0) throw new VideoToolError(explainFailure(log, options.codec));
    }
    const { output } = steps[steps.length - 1];
    const data = (await ffmpeg.readFile(output)) as Uint8Array<ArrayBuffer>;
    if (data.byteLength < 100) throw new VideoToolError(explainFailure(log, options.codec));
    onProgress({ stage: "checking", value: 1 });
    return new Blob([data], { type: mimeTypes[extensionOf(output)] });
  } catch (error) {
    if (signal.aborted) throw new VideoToolCanceled();
    if (error instanceof VideoToolError) throw error;
    throw new VideoToolError(explainFailure([...log, String(error)].map((line) => line.replace(/out of bounds/, "memory")), options.codec));
  } finally {
    signal.removeEventListener("abort", stop);
    ffmpeg.terminate();
  }
}

// ---------------------------------------------------------------- Settings shared by the tools


export function refuseHdr(info: VideoInfo) {
  if (info.hdr) throw new VideoToolError("This is an HDR video. Re-encoding it here would change its colours, so it is not supported.");
}

/** Square pixels at the size people see, so coordinates always match the preview. */
export function displayFilter(info: VideoInfo) {
  return info.width > 0 && info.hasIndex ? [`scale=${info.width}:${info.height}`, "setsar=1"] : ["setsar=1"];
}

export function h264(crf = 18) {
  return ["-c:v", "libx264", "-preset", "veryfast", "-crf", String(crf), "-pix_fmt", "yuv420p", "-fps_mode", "vfr"];
}

/** Keeps the sound as it is when the container allows it. */
export function soundArgs(info: VideoInfo, container: string): string[] {
  if (!info.hasSound) return [];
  if (canCopySound(info.audioCodec, container)) return ["-c:a", "copy"];
  return ["-c:a", "aac", "-b:a", "192k"];
}

export const finishArgs = (container: string) => [
  "-map_metadata", "0",
  ...(container === "mp4" || container === "mov" ? ["-movflags", "+faststart"] : []),
];

/** Re-encodes the picture through filters and keeps the sound. */
export async function exportFiltered(
  file: File,
  info: VideoInfo,
  options: { filters: string[]; width: number; height: number; container: "mp4" | "mov" | "mkv"; crf?: number },
  onProgress: (progress: Progress) => void,
  signal: AbortSignal,
) {
  refuseHdr(info);
  const blob = await runFFmpeg(
    file,
    {
      codec: info.videoCodec,
      duration: info.duration,
      steps: (source) => [
        {
          args: [
            "-i", source, "-map", "0:v:0", "-map", "0:a?", "-sn", "-dn",
            "-vf", [...displayFilter(info), ...options.filters, "setsar=1"].join(","),
            ...h264(options.crf), ...soundArgs(info, options.container), ...finishArgs(options.container),
          ],
          output: `/output.${options.container}`,
        },
      ],
    },
    onProgress,
    signal,
  );
  await checkVideo(blob, options.width, options.height);
  return blob;
}

/** Reads the finished file back, so a broken export is never offered as a download. */
export async function checkVideo(blob: Blob, width?: number, height?: number) {
  const size = await withTrack(blob, async (track) => ({
    width: await track.getDisplayWidth(),
    height: await track.getDisplayHeight(),
    length: await track.computeDuration(),
  }));
  if (!size || !(size.length > 0)) throw new VideoToolError("The finished video could not be read back, so it was not saved.");
  if (width && height && (size.width !== width || size.height !== height)) {
    throw new VideoToolError(`The finished video came out at ${size.width}×${size.height}, so it was not saved. Please try again.`);
  }
  return size;
}
