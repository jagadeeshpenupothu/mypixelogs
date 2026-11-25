/** Settings the pages need before the video engine is loaded. */

export const evenDown = (value: number) => Math.max(2, Math.floor(value / 2) * 2);
export const even = (value: number) => Math.max(2, Math.round(value / 2) * 2);

const copyableSound: Record<string, string[]> = {
  mp4: ["aac", "mp3", "ac3", "eac3"],
  mov: ["aac", "mp3", "ac3", "pcm-s16", "pcm-s24"],
  mkv: ["aac", "mp3", "opus", "vorbis", "flac", "ac3", "eac3", "pcm-s16"],
  webm: ["opus", "vorbis"],
  avi: ["mp3", "ac3"],
};

export const canCopySound = (codec: string | null, container: string) =>
  codec !== null && copyableSound[container]?.includes(codec) === true;
