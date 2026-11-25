import { gifSettings, qualityValue, shape, videoOptions, type AudioCodec, type ConvertSettings } from "@/lib/convert-settings";
import { makeGif, vp8 } from "@/lib/video-gif";
import {
  checkVideo,
  displayFilter,
  finishArgs,
  h264,
  readVideoInfo,
  refuseHdr,
  runFFmpeg,
  VideoToolError,
  type Progress,
  type VideoInfo,
} from "@/lib/video-ffmpeg";
import { even } from "@/lib/video-rules";

function steadyRate(rate: number) {
  const usual = [24000 / 1001, 30000 / 1001, 60000 / 1001];
  const names = ["24000/1001", "30000/1001", "60000/1001"];
  const match = usual.findIndex((value) => Math.abs(value - rate) < 0.02);
  if (match >= 0) return names[match];
  return String(Math.min(60, Math.max(1, Math.round(rate * 100) / 100)));
}

function videoArgs(info: VideoInfo, settings: ConvertSettings, width: number, height: number): string[] {
  const { video, format } = settings;
  if (video === "copy") return ["-c:v", "copy", ...(info.videoCodec === "hevc" && format !== "mkv" ? ["-tag:v", "hvc1"] : [])];
  const crf = qualityValue(settings);
  // AVI has no frame times of its own, so every frame must last equally long.
  const steady = format === "avi" ? ["-fps_mode", "cfr", "-r", steadyRate(info.frameRate)] : [];
  if (video === "vp8") return [...vp8(crf, width, height, info.frameRate), "-fps_mode", "vfr"];
  if (video === "mpeg4") return ["-c:v", "mpeg4", "-q:v", String(Math.max(2, Math.round((crf - 9) / 2.5))), "-vtag", "XVID", "-pix_fmt", "yuv420p", ...steady];
  return format === "avi" ? [...h264(crf), "-bf", "0", ...steady] : h264(crf);
}

const audioArgs: Record<AudioCodec, string[]> = {
  copy: ["-c:a", "copy"],
  aac: ["-c:a", "aac", "-b:a", "192k"],
  mp3: ["-c:a", "libmp3lame", "-b:a", "192k", "-ac", "2"],
  // Higher compression levels overflow the stack of this FFmpeg build.
  opus: ["-c:a", "libopus", "-b:a", "160k", "-ac", "2", "-ar", "48000", "-compression_level", "0"],
  flac: ["-c:a", "flac"],
  none: ["-an"],
};

export async function convertVideo(
  file: File,
  info: VideoInfo,
  settings: ConvertSettings,
  onProgress: (progress: Progress) => void,
  signal: AbortSignal,
) {
  const { width, height } = shape(info, settings.resolution);
  if (settings.format === "gif") return makeGif(file, info, gifSettings(info, settings), onProgress, signal);
  if (!videoOptions(info, settings.format, settings.resolution).includes(settings.video)) {
    throw new VideoToolError("This format cannot hold the chosen video codec.");
  }
  const copy = settings.video === "copy";
  if (!copy) refuseHdr(info);
  const size = copy ? { width, height } : { width: even(width), height: even(height) };
  const blob = await runFFmpeg(
    file,
    {
      codec: info.videoCodec,
      duration: info.duration,
      steps: (source) => [
        {
          args: [
            "-i", source, "-map", "0:v:0", ...(settings.audio === "none" ? [] : ["-map", "0:a?"]), "-sn", "-dn",
            ...(copy ? [] : ["-vf", [...displayFilter(info), `scale=${size.width}:${size.height}:flags=lanczos`, "setsar=1"].join(",")]),
            ...videoArgs(info, settings, size.width, size.height),
            ...(settings.audio === "none" ? ["-an"] : audioArgs[settings.audio]),
            ...finishArgs(settings.format),
          ],
          output: `/output.${settings.format}`,
        },
      ],
    },
    onProgress,
    signal,
  );
  if (settings.format === "avi") {
    const made = await readVideoInfo(new File([blob], "output.avi"));
    if (made.width !== size.width || made.height !== size.height) throw new VideoToolError("The finished video could not be read back, so it was not saved.");
  } else await checkVideo(blob, size.width, size.height);
  return blob;
}
