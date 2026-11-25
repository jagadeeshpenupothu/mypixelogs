import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  CanvasSink,
  Conversion,
  Input,
  Mp4OutputFormat,
  Output,
  Quality,
  VideoSampleSink,
  canEncodeVideo,
  type InputVideoTrack,
  type VideoSample,
} from "mediabunny";

import { frameSimilarity, ssim } from "@/lib/frame-similarity";

export type QualityLevel = "best" | "balanced" | "small";
export type OutputCodec = "avc" | "hevc";

export type CompressOptions = {
  level: QualityLevel;
  codec: OutputCodec;
  /** Longest allowed short side, such as 1080. 0 keeps the original size. */
  maxShortSide: number;
  removeSound: boolean;
};

export type VideoDetails = {
  width: number;
  height: number;
  duration: number;
  frameRate: number;
  bitrate: number;
  codec: string;
  hasSound: boolean;
};

export type CompressResult = {
  blob: Blob | null;
  size: number;
  /** Average similarity to the original, 0 to 1. */
  similarity: number;
  /** The least similar frame that was checked. */
  lowest: number;
  width: number;
  height: number;
  /** Why there is no file, when blob is null. */
  reason?: "no-gain" | "quality";
};

export type CompressProgress = { stage: "testing" | "encoding" | "checking"; value: number };

export class VideoCompressError extends Error {}
export class VideoCompressCanceled extends Error {}

/** Average and worst-frame similarity each level must reach: roughly x264 CRF 20, 26 and 30. */
export const qualityTargets: Record<QualityLevel, { average: number; lowest: number }> = {
  best: { average: 0.982, lowest: 0.935 },
  balanced: { average: 0.974, lowest: 0.915 },
  small: { average: 0.96, lowest: 0.89 },
};

/** Shares of the original bitrate to try, smallest first. */
const bitrateShares = [0.06, 0.09, 0.13, 0.19, 0.27, 0.38, 0.52, 0.68, 0.82];

export const MAX_FILE_SIZE = 2 * 1024 ** 3;

export function supportsCompression() {
  return typeof window !== "undefined" && "VideoEncoder" in window && "VideoDecoder" in window;
}

const openInput = (file: Blob) => new Input({ source: new BlobSource(file), formats: ALL_FORMATS });

async function videoTrackOf(input: Input): Promise<InputVideoTrack> {
  let track: InputVideoTrack | null;
  try {
    track = await input.getPrimaryVideoTrack();
  } catch {
    throw new VideoCompressError("This file is not a video that can be read here. Try MP4, MOV, MKV or WebM.");
  }
  if (!track) throw new VideoCompressError("No video was found in this file.");
  return track;
}

export async function readVideoDetails(file: File): Promise<VideoDetails> {
  const input = openInput(file);
  try {
    const track = await videoTrackOf(input);
    if (!(await track.canDecode())) {
      throw new VideoCompressError("Your browser cannot open this video's format. Try Chrome or Edge, or another file.");
    }
    if (await track.hasHighDynamicRange()) {
      throw new VideoCompressError("This is an HDR video. Compressing it here would change its colours, so it is not supported.");
    }
    const [width, height, duration, stats, codec, audio] = await Promise.all([
      track.getDisplayWidth(),
      track.getDisplayHeight(),
      input.computeDuration(),
      track.computePacketStats(),
      track.getCodec(),
      input.getPrimaryAudioTrack(),
    ]);
    if (!(duration > 0.2)) throw new VideoCompressError("This video is too short to compress.");
    return {
      width,
      height,
      duration,
      frameRate: stats.averagePacketRate,
      bitrate: stats.averageBitrate,
      codec: codec ?? "unknown",
      hasSound: audio !== null,
    };
  } finally {
    input.dispose();
  }
}

function summarise(scores: number[]) {
  return { average: scores.reduce((sum, value) => sum + value, 0) / scores.length, lowest: Math.min(...scores) };
}

const even = (value: number) => Math.max(2, Math.round(value / 2) * 2);

export function outputSize(details: VideoDetails, maxShortSide: number) {
  const short = Math.min(details.width, details.height);
  const scale = maxShortSide > 0 && short > maxShortSide ? maxShortSide / short : 1;
  return { width: even(details.width * scale), height: even(details.height * scale), scale };
}

export async function canUseCodec(codec: OutputCodec, width: number, height: number) {
  try {
    return await canEncodeVideo(codec, { width: even(width), height: even(height), quality: new Quality({ bitrate: 4_000_000 }) });
  } catch {
    return false;
  }
}

/** The brightness plane straight from the decoder. Colour conversion would clip and hide differences. */
async function brightness(sample: VideoSample) {
  if (!sample.format || !["I420", "I422", "I444", "NV12"].includes(sample.format)) return null;
  const { width, height } = sample.visibleRect;
  const data = new Uint8Array(sample.allocationSize());
  const [layout] = await sample.copyTo(data);
  const values = new Float32Array(width * height);
  for (let y = 0; y < height; y += 1) {
    const row = layout.offset + y * layout.stride;
    for (let x = 0; x < width; x += 1) values[y * width + x] = data[row + x];
  }
  return { values, width, height };
}

async function compareSamples(original: VideoSampleSink, copy: VideoSampleSink, time: number, copyTime: number) {
  const a = await original.getSample(time);
  const b = await copy.getSample(copyTime);
  try {
    if (!a || !b) return null;
    const first = await brightness(a);
    const second = await brightness(b);
    if (!first || !second || first.width !== second.width || first.height !== second.height) return null;
    return ssim(first.values, second.values, first.width, first.height);
  } finally {
    a?.close();
    b?.close();
  }
}

export async function compressVideo(
  file: File,
  details: VideoDetails,
  options: CompressOptions,
  onProgress: (progress: CompressProgress) => void,
  signal: AbortSignal,
): Promise<CompressResult> {
  const size = outputSize(details, options.maxShortSide);
  const target = qualityTargets[options.level];
  const basis = details.bitrate * Math.min(1, size.scale * size.scale);
  const stopIfCanceled = () => {
    if (signal.aborted) throw new VideoCompressCanceled();
  };

  async function encode(
    bitrate: number,
    part: { start: number; end: number } | null,
    onValue?: (value: number) => void,
  ): Promise<ArrayBuffer> {
    stopIfCanceled();
    const input = openInput(file);
    const output = new Output({ format: new Mp4OutputFormat({ fastStart: "in-memory" }), target: new BufferTarget() });
    let conversion: Conversion | undefined;
    const cancel = () => void conversion?.cancel();
    signal.addEventListener("abort", cancel);
    try {
      conversion = await Conversion.init({
        input,
        output,
        showWarnings: false,
        trim: part ?? undefined,
        video: {
          codec: options.codec,
          quality: new Quality({ bitrate: Math.round(bitrate), bitrateMode: "variable" }),
          forceTranscode: true,
          keyFrameInterval: 4,
          ...(size.width !== details.width || size.height !== details.height
            ? { width: size.width, height: size.height, fit: "fill" as const }
            : {}),
        },
        // Sound is copied as it is whenever the MP4 format allows it.
        audio: part || options.removeSound ? { discard: true } : {},
      });
      const lost = conversion.discardedTracks.filter(({ reason }) => reason !== "discarded_by_user");
      if (!part && !options.removeSound && lost.some(({ track }) => track.type === "audio")) {
        throw new VideoCompressError("The sound in this video cannot be kept in this browser. Try Chrome or Edge.");
      }
      if (!conversion.isValid) throw new VideoCompressError("Your browser cannot compress this video. Try Chrome or Edge.");
      if (onValue) conversion.onProgress = onValue;
      stopIfCanceled();
      await conversion.execute();
      const buffer = output.target.buffer;
      if (!buffer) throw new VideoCompressError("The compressed video could not be saved.");
      return buffer;
    } catch (error) {
      if (signal.aborted) throw new VideoCompressCanceled();
      throw error;
    } finally {
      signal.removeEventListener("abort", cancel);
      input.dispose();
    }
  }

  async function compare(buffer: ArrayBuffer, offset: number, times: number[]) {
    const original = openInput(file);
    const copy = openInput(new Blob([buffer]));
    try {
      const originalTrack = await videoTrackOf(original);
      const copyTrack = await videoTrackOf(copy);
      const sinkOptions = { width: size.width, height: size.height, fit: "fill" as const, poolSize: 1 };
      const originalFrames = new VideoSampleSink(originalTrack);
      const copyFrames = new VideoSampleSink(copyTrack);
      const originalCanvases = new CanvasSink(originalTrack, sinkOptions);
      const copyCanvases = new CanvasSink(copyTrack, sinkOptions);
      const scores: number[] = [];
      for (const time of times) {
        stopIfCanceled();
        const copyTime = Math.max(0, time - offset);
        const direct = await compareSamples(originalFrames, copyFrames, time, copyTime);
        if (direct !== null) {
          scores.push(direct);
          continue;
        }
        // Different sizes or layouts: compare the drawn frames instead.
        const a = await originalCanvases.getCanvas(time);
        const b = await copyCanvases.getCanvas(copyTime);
        if (a && b) scores.push(frameSimilarity(a.canvas, b.canvas));
      }
      if (scores.length === 0) throw new VideoCompressError("The quality of this video could not be checked.");
      return { ...summarise(scores), scores };
    } finally {
      original.dispose();
      copy.dispose();
    }
  }

  const passes = (score: { average: number; lowest: number }) =>
    score.average >= target.average && score.lowest >= target.lowest;

  // Half a frame later, so rounding never picks a neighbouring frame.
  const half = 0.5 / Math.max(details.frameRate, 1);
  const partLength = Math.min(1.6, details.duration);
  const partCount = details.duration < 4 ? 1 : 3;
  const parts = Array.from({ length: partCount }, (_, index) => {
    const start = partCount === 1 ? 0 : (details.duration - partLength) * [0.1, 0.5, 0.88][index];
    return { start, end: Math.min(start + partLength, details.duration) };
  });

  // 1. Find the smallest bitrate whose test clips still match the original.
  const candidates = bitrateShares.map((share) => Math.max(120_000, basis * share));
  let low = 0;
  let high = candidates.length - 1;
  let chosen = -1;
  let tests = 0;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const clips: number[] = [];
    for (const [index, part] of parts.entries()) {
      onProgress({ stage: "testing", value: Math.min(0.98, (tests + index / parts.length) / 4) });
      const buffer = await encode(candidates[middle], part);
      const span = part.end - part.start;
      const times = [0.25, 0.6, 0.9].map((share) => part.start + span * share + half);
      const score = await compare(buffer, part.start, times);
      clips.push(...score.scores);
      if (score.lowest < target.lowest) break;
    }
    const good = passes(summarise(clips));
    tests += 1;
    if (good) {
      chosen = middle;
      high = middle - 1;
    } else {
      low = middle + 1;
    }
  }
  if (chosen === -1) {
    return { blob: null, size: file.size, similarity: 0, lowest: 0, width: size.width, height: size.height, reason: "quality" };
  }

  // 2. Encode the whole video, then check the finished file. Step up if any part falls short.
  for (let index = chosen; index < candidates.length; index += 1) {
    const buffer = await encode(candidates[index], null, (value) => onProgress({ stage: "encoding", value }));
    if (buffer.byteLength >= file.size * 0.95) {
      return { blob: null, size: file.size, similarity: 0, lowest: 0, width: size.width, height: size.height, reason: "no-gain" };
    }
    onProgress({ stage: "checking", value: 1 });
    const count = Math.min(16, Math.max(6, Math.ceil(details.duration / 4)));
    const times = Array.from({ length: count }, (_, step) => ((step + 0.5) / count) * details.duration * 0.98 + half);
    const score = await compare(buffer, 0, times);
    if (passes(score)) {
      return {
        blob: new Blob([buffer], { type: "video/mp4" }),
        size: buffer.byteLength,
        similarity: score.average,
        lowest: score.lowest,
        width: size.width,
        height: size.height,
      };
    }
  }
  return { blob: null, size: file.size, similarity: 0, lowest: 0, width: size.width, height: size.height, reason: "quality" };
}
