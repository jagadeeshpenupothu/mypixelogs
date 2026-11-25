import { gifAdvice, gifFrames, type GifQuality, type GifSettings } from "@/lib/gif-settings";
import { exactRate, parseGif, type GifInfo } from "@/lib/gif-info";
import { displayFilter, h264, checkVideo, refuseHdr, runFFmpeg, VideoToolError, type Progress, type VideoInfo } from "@/lib/video-ffmpeg";

// ---------------------------------------------------------------- Video to GIF

const looks: Record<GifQuality, { colors: number; dither: string }> = {
  high: { colors: 256, dither: "sierra2_4a" },
  medium: { colors: 128, dither: "bayer:bayer_scale=3" },
  small: { colors: 64, dither: "bayer:bayer_scale=4" },
};

export async function makeGif(
  file: File,
  info: VideoInfo,
  settings: GifSettings,
  onProgress: (progress: Progress) => void,
  signal: AbortSignal,
) {
  refuseHdr(info);
  const advice = gifAdvice(settings);
  if (advice?.blocked) throw new VideoToolError(advice.text);
  const { colors, dither } = looks[settings.quality];
  const length = settings.end - settings.start;
  const frames = gifFrames(settings);
  const blob = await runFFmpeg(
    file,
    {
      codec: info.videoCodec,
      duration: length,
      steps: (source) => {
        const part = ["-ss", Math.max(0, settings.start - 0.001).toFixed(6), "-t", length.toFixed(6), "-i", source];
        const picture = [...displayFilter(info), "setpts=PTS-STARTPTS", `fps=${settings.fps}`, `scale=${settings.width}:${settings.height}:flags=lanczos`].join(",");
        return [
          { args: [...part, "-map", "0:v:0", "-vf", `${picture},palettegen=max_colors=${colors}`, "-frames:v", "1"], output: "/palette.png" },
          {
            args: [
              ...part, "-i", "/palette.png",
              "-lavfi", `[0:v:0]${picture},trim=end_frame=${frames}[p];[p][1:v]paletteuse=dither=${dither}:diff_mode=rectangle`,
              "-loop", "0",
            ],
            output: "/output.gif",
          },
        ];
      },
    },
    onProgress,
    signal,
  );
  const made = parseGif(new Uint8Array(await blob.arrayBuffer()));
  if (!made || made.width !== settings.width || made.height !== settings.height) {
    throw new VideoToolError("The finished GIF could not be read back, so it was not saved. Please try again.");
  }
  return blob;
}

// ---------------------------------------------------------------- GIF to video

const MAX_GIF_SIZE = 200 * 1024 ** 2;

export async function readGif(file: File): Promise<GifInfo> {
  if (file.size > MAX_GIF_SIZE) throw new VideoToolError("Please choose a GIF smaller than 200 MB.");
  const info = parseGif(new Uint8Array(await file.arrayBuffer()));
  if (!info) throw new VideoToolError("This file is not a GIF, or it is damaged.");
  if (info.frames < 2) throw new VideoToolError("This GIF has a single frame, so there is no animation to convert.");
  if (info.width * info.height > 4096 * 4096) throw new VideoToolError("This GIF is too large to convert in a browser.");
  return info;
}

export type GifVideoSettings = {
  format: "mp4" | "webm" | "mov";
  width: number;
  height: number;
  /** Null keeps the GIF's own timing exactly. */
  fps: number | null;
  quality: "high" | "medium" | "low";
  background: string;
};

export const vp8 = (crf: number, width: number, height: number, fps: number) => [
  "-c:v", "libvpx", "-deadline", "good", "-cpu-used", "4", "-pix_fmt", "yuv420p",
  "-crf", String(Math.min(40, Math.max(4, crf - 10))),
  // The limit for VP8's quality mode: far above what most videos need.
  "-b:v", String(Math.round(Math.max(2e6, width * height * Math.min(fps, 60) * 0.3))),
];

export async function gifToVideo(
  file: File,
  info: GifInfo,
  settings: GifVideoSettings,
  onProgress: (progress: Progress) => void,
  signal: AbortSignal,
) {
  const rate = settings.fps === null ? exactRate(info) : { text: String(settings.fps), value: settings.fps };
  const crf = { high: 16, medium: 22, low: 28 }[settings.quality];
  const webm = settings.format === "webm";
  const length = Math.max(1, Math.round(info.duration * rate.value));
  const last = info.delays[info.delays.length - 1];
  const color = webm ? "" : ":out_color_matrix=bt709";
  const blob = await runFFmpeg(
    file,
    {
      duration: info.duration,
      steps: (source) => [
        {
          args: [
            "-i", source,
            "-filter_complex",
            [
              // The last frame has no frame after it, so it is held for its own delay.
              `[0:v]fps=${rate.text}:round=near,tpad=stop_mode=clone:stop_duration=${(last + 0.5).toFixed(3)},trim=end_frame=${length},format=rgba[g]`,
              `color=c=0x${settings.background.slice(1)}:s=${info.width}x${info.height}:r=${rate.text}[b]`,
              `[b][g]overlay=shortest=1:format=rgb,scale=${settings.width}:${settings.height}:flags=lanczos${color},format=yuv420p,setsar=1[v]`,
            ].join(";"),
            "-map", "[v]", "-an",
            ...(webm
              ? vp8(crf, settings.width, settings.height, rate.value)
              : [...h264(crf), "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-movflags", "+faststart"]),
          ],
          output: `/output.${settings.format}`,
        },
      ],
    },
    onProgress,
    signal,
  );
  const made = await checkVideo(blob, settings.width, settings.height);
  if (Math.abs(made.length - info.duration) > 1 / rate.value + 0.1) {
    throw new VideoToolError("The finished video did not match the GIF's timing, so it was not saved. Please try again.");
  }
  return blob;
}
