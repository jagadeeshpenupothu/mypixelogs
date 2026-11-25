export type GifQuality = "high" | "medium" | "small";
export type GifSettings = { start: number; end: number; fps: number; width: number; height: number; quality: GifQuality };

const MAX_FRAMES = 1500;
const MAX_PIXELS = 500e6;

export const gifFrames = ({ start, end, fps }: Pick<GifSettings, "start" | "end" | "fps">) => Math.max(1, Math.round((end - start) * fps));

/** Why these settings cannot be used, or a warning about them. */
export function gifAdvice(settings: GifSettings): { blocked: boolean; text: string } | null {
  const frames = gifFrames(settings);
  const pixels = frames * settings.width * settings.height;
  if (frames > MAX_FRAMES || pixels > MAX_PIXELS) {
    return { blocked: true, text: "This GIF would be too large for a browser. Choose a shorter part, a smaller size or fewer frames per second." };
  }
  if (settings.end - settings.start > 15 || pixels > 80e6) {
    return { blocked: false, text: "This will make a large GIF and take a while. A shorter part, a smaller size or fewer frames per second helps." };
  }
  return null;
}
