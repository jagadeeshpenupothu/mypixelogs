import { EncodedPacketSink } from "mediabunny";

import {
  VideoToolCanceled,
  VideoToolError,
  explainFailure,
  extensionOf,
  mimeTypes,
  mount,
  startFFmpeg,
  withTrack,
  type VideoInfo,
} from "@/lib/video-ffmpeg";

export { MAX_FILE_SIZE, drawThumbnails } from "@/lib/video-ffmpeg";
export { VideoToolCanceled as VideoTrimCanceled, VideoToolError as VideoTrimError, readVideoInfo as readTrimInfo } from "@/lib/video-ffmpeg";

const MAX_OUTPUT_SIZE = 800 * 1024 ** 2;
const MIN_SELECTION = 0.05;

export type TrimInfo = VideoInfo;
export type TrimProgress = { stage: "loading" | "trimming" | "checking"; value: number };
export type TrimResult = {
  blob: Blob;
  extension: string;
  duration: number;
  method: "lossless" | "precise";
};

/** Timestamps are often rounded to a millisecond, so times this close count as equal. */
const EPSILON = 0.0006;

type Scan = {
  /** The key frame at or before the start. */
  key: number;
  /** Frame times from that key frame on, in the order they are stored. */
  stored: number[];
};

/** Reads the frame index around a selection, without reading any picture data. */
async function scan(file: File, start: number, end: number): Promise<Scan | null> {
  return withTrack(file, async (track) => {
    const sink = new EncodedPacketSink(track);
    const first = (await sink.getKeyPacket(start + EPSILON)) ?? (await sink.getFirstKeyPacket());
    if (!first) return null;
    const stored: number[] = [];
    for await (const packet of sink.packets(first, undefined, { metadataOnly: true })) {
      stored.push(packet.timestamp);
      // The frames after a later key frame are stored after it too, so nothing earlier can follow.
      if (packet.timestamp > end + 2 || (packet.type === "key" && packet.timestamp > end + 0.5)) break;
    }
    return { key: first.timestamp, stored };
  });
}

/** How many stored frames make a lossless cut, or null when this cut needs re-encoding. */
function losslessFrames({ key, stored }: Scan, start: number, end: number, frame: number): number | null {
  if (Math.abs(key - start) > frame / 2 || stored.some((time) => time < key - EPSILON)) return null;
  const count = stored.filter((time) => time < end - EPSILON).length;
  return count > 0 && stored.slice(0, count).every((time) => time < end - EPSILON) ? count : null;
}

/** Moves a selection to the closest points that can be cut without re-encoding. */
export async function snapToLossless(
  file: File,
  info: TrimInfo,
  selection: { start: number; end: number },
): Promise<{ start: number; end: number } | null> {
  if (!info.hasIndex) return null;
  return withTrack(file, async (track) => {
    const sink = new EncodedPacketSink(track);
    const before = (await sink.getKeyPacket(selection.start + EPSILON)) ?? (await sink.getFirstKeyPacket());
    if (!before) return null;
    const after = await sink.getNextKeyPacket(before, { metadataOnly: true });
    const start =
      after && after.timestamp < selection.end - MIN_SELECTION &&
      Math.abs(after.timestamp - selection.start) < Math.abs(before.timestamp - selection.start)
        ? after.timestamp
        : before.timestamp;

    const from = (await sink.getKeyPacket(selection.end)) ?? before;
    const stored: number[] = [];
    let finished = true;
    for await (const packet of sink.packets(from, undefined, { metadataOnly: true })) {
      stored.push(packet.timestamp);
      if (packet.timestamp > selection.end + 5) {
        finished = false;
        break;
      }
    }
    // A clean end: everything stored before it is also shown before it.
    const ends: number[] = finished ? [info.duration] : [];
    let smallest = Infinity;
    const later: number[] = [];
    for (let index = stored.length - 1; index >= 0; index -= 1) {
      later[index] = smallest;
      smallest = Math.min(smallest, stored[index]);
    }
    ends.push(from.timestamp);
    let largest = -Infinity;
    for (const [index, time] of stored.entries()) {
      largest = Math.max(largest, time);
      if (later[index] !== Infinity && largest < later[index]) ends.push(later[index]);
    }
    const end = ends
      .filter((time) => time >= start + MIN_SELECTION)
      .sort((a, b) => Math.abs(a - selection.end) - Math.abs(b - selection.end))[0];
    return end === undefined ? null : { start: Math.max(0, start), end };
  });
}

// ---------------------------------------------------------------- Trimming

const copyContainers: Record<string, string> = { mp4: "mp4", m4v: "mp4", mov: "mov", mkv: "mkv", webm: "webm" };

/** Reads back the finished file: where its picture starts and how long it is. */
async function measure(blob: Blob) {
  return withTrack(blob, async (track) => {
    const first = await track.getFirstTimestamp();
    const end = await track.computeDuration();
    const { packetCount } = await track.computePacketStats();
    return { first, length: end - first, frames: packetCount };
  });
}

/** The first stored frame's size: proves that a copy starts on the right frame. */
async function firstFrameSize(blob: Blob, time: number) {
  return withTrack(blob, async (track) => {
    const sink = new EncodedPacketSink(track);
    const packet = (await sink.getKeyPacket(time + EPSILON)) ?? (await sink.getFirstKeyPacket());
    return packet?.byteLength ?? null;
  });
}

export async function trimVideo(
  file: File,
  info: TrimInfo,
  selection: { start: number; end: number },
  onProgress: (progress: TrimProgress) => void,
  signal: AbortSignal,
): Promise<TrimResult> {
  const { start, end } = selection;
  const length = end - start;
  const frame = 1 / Math.max(info.frameRate, 1);
  if (!(length >= MIN_SELECTION)) throw new VideoToolError("Please select a longer part.");
  if ((file.size / info.duration) * length > MAX_OUTPUT_SIZE) {
    throw new VideoToolError("This part is too large to export in a browser. Please select a shorter part.");
  }

  onProgress({ stage: "loading", value: 0 });
  const ffmpeg = await startFFmpeg(signal);
  const stop = () => ffmpeg.terminate();
  signal.addEventListener("abort", stop);
  const log: string[] = [];

  try {
    const source = await mount(ffmpeg, file);
    ffmpeg.on("log", ({ message }) => {
      log.push(message);
      if (log.length > 60) log.shift();
      const time = /time=(\d+):(\d+):([\d.]+)/.exec(message);
      if (!time) return;
      const done = Number(time[1]) * 3600 + Number(time[2]) * 60 + Number(time[3]);
      onProgress({ stage: "trimming", value: Math.min(0.99, Math.max(0, done / length)) });
    });

    const save = async (args: string[], output: string) => {
      onProgress({ stage: "trimming", value: 0 });
      const code = await ffmpeg.exec(["-hide_banner", "-y", ...args, output]);
      if (signal.aborted) throw new VideoToolCanceled();
      if (code !== 0) await ffmpeg.deleteFile(output).catch(() => false);
      return code === 0;
    };

    const run = async (args: string[], extension: string) => {
      const output = `/output.${extension}`;
      if (!(await save(args, output))) return null;
      const data = (await ffmpeg.readFile(output)) as Uint8Array<ArrayBuffer>;
      await ffmpeg.deleteFile(output);
      if (data.byteLength < 100) return null;
      return new Blob([data], { type: mimeTypes[extension] });
    };

    const seconds = (value: number) => Math.max(0, value).toFixed(6);
    const tolerance = frame * 0.6 + 0.002;

    // 1. Some cuts can be copied without any loss: the frame index says which.
    const container = copyContainers[extensionOf(file.name)];
    const index = info.hasIndex ? await scan(file, start, end) : null;
    const copied = container && index ? losslessFrames(index, start, end, frame) : null;
    if (container && index && copied !== null) {
      // Seeking a moment past the key frame never lands on the one before it.
      const nudge = index.key > frame ? 0.002 : 0;
      const fast = container === "mp4" || container === "mov" ? ["-movflags", "+faststart"] : [];
      const part = [
        ...(nudge > 0 ? ["-ss", seconds(index.key + nudge)] : []),
        "-t", seconds(end - index.key - nudge),
        "-i", source,
      ];
      const picture = [...part, "-map", "0:v:0", "-c", "copy", "-frames:v", String(copied), "-output_ts_offset", seconds(nudge)];
      let blob: Blob | null;
      if (info.hasSound) {
        // FFmpeg ends every stream at the frame limit, so the sound is added in a second step.
        const pictureFile = `/picture.${container}`;
        blob = (await save(picture, pictureFile))
          ? await run(["-i", pictureFile, ...part, "-map", "0:v:0", "-map", "1:a", "-c", "copy", "-map_metadata", "1", ...fast], container)
          : null;
        await ffmpeg.deleteFile(pictureFile).catch(() => false);
      } else {
        blob = await run([...picture, "-map_metadata", "0", ...fast], container);
      }
      onProgress({ stage: "checking", value: 1 });
      const real = blob ? await measure(blob) : null;
      // Keep it only when it starts on the right frame and has exactly the frames selected.
      if (blob && real && real.frames === copied && Math.abs(real.first) <= tolerance) {
        const [from, to] = await Promise.all([firstFrameSize(file, index.key), firstFrameSize(blob, 0)]);
        if (from !== null && from === to) return { blob, extension: container, duration: real.length, method: "lossless" };
      }
    }

    // 2. Otherwise re-encode, which can start and end on any frame.
    if (info.hdr) {
      throw new VideoToolError(
        container === "mkv"
          ? "This is an HDR video in an MKV file, and cutting it here would change its colours."
          : "This is an HDR video, and a cut at these points would change its colours. Press Snap to lossless points, then trim again.",
      );
    }
    const shown = index ? index.stored.filter((time) => time >= start - EPSILON && time < end - EPSILON) : null;
    if (shown && shown.length === 0) throw new VideoToolError("There is no full frame in this selection. Select a longer part.");
    const from = shown ? Math.min(...shown) : start;
    const blob = await run(
      [
        // Just early enough to keep the frame exactly at the start.
        "-ss", seconds(from - 0.001),
        "-i", source,
        // With a frame index the picture ends by frame count, which is exact in every container.
        "-t", seconds(shown ? end - from + 1 : length),
        "-map", "0:v:0", "-map", "0:a?", "-sn", "-dn",
        "-vf", `${shown ? `trim=end_frame=${shown.length},` : ""}setpts=PTS-STARTPTS,scale=trunc(iw/2)*2:trunc(ih/2)*2`,
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "17", "-pix_fmt", "yuv420p", "-fps_mode", "vfr",
        ...(info.hasSound
          ? ["-af", `aresample=async=1:first_pts=0,atrim=end=${seconds(end - from)}`, "-c:a", "aac", "-b:a", "192k"]
          : []),
        "-map_metadata", "0", "-movflags", "+faststart",
      ],
      "mp4",
    );
    if (!blob) {
      const text = log.join("\n");
      if (/Decoder .*not found|could not find codec|no decoder/i.test(text) || /av1/i.test(info.videoCodec)) {
        throw new VideoToolError("This video's format cannot be cut at these exact points. Press Snap to lossless points, then trim again.");
      }
      throw new VideoToolError(explainFailure(log, info.videoCodec));
    }
    onProgress({ stage: "checking", value: 1 });
    const real = await measure(blob);
    if (!real || (shown && real.frames !== shown.length)) {
      throw new VideoToolError("The finished video did not match your selection, so it was not saved. Please try again.");
    }
    return { blob, extension: "mp4", duration: real.length, method: "precise" };
  } catch (error) {
    if (signal.aborted) throw new VideoToolCanceled();
    if (error instanceof VideoToolError) throw error;
    throw new VideoToolError("The video could not be trimmed. Select a shorter part, or try Chrome or Edge on a computer.");
  } finally {
    // Ends the worker, which frees the mounted file, temporary files and memory.
    signal.removeEventListener("abort", stop);
    ffmpeg.terminate();
  }
}
