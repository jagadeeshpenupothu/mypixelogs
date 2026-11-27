import musicData from "@/data/music.json";
import sfxData from "@/data/sfx.json";

export type Track = {
  title: string;
  slug: string;
  mood: string;
  length: string;
  seconds: number;
  bpm: number | null;
  feel: string;
  instruments: string;
  description: string;
  preview: string;
  fileName: string;
  size: number;
  /** Google Drive file id once the full track is uploaded to the shared folder. */
  driveId: string | null;
  peaks: number[];
};

export type Sfx = { name: string; slug: string; category: string; seconds: number; file: string; size: number; source: string; peaks: number[] };

export const music = musicData as Track[];
export const sfx = sfxData as Sfx[];

/** Shared Google Drive folder that holds the full-quality music files. */
export const MUSIC_FOLDER = "https://drive.google.com/drive/folders/1RmoPQBOG2PlILs1u40EiFujLBE_dSYSA";
export const SFX_ZIP = "/downloads/mypixelogs-sound-effects.zip";

/** The credit Kevin MacLeod's CC BY 4.0 licence asks for, ready to paste into a video description. */
export function musicCredit(t: Track) {
  return `"${t.title}" Kevin MacLeod (incompetech.com)\nLicensed under Creative Commons: By Attribution 4.0 License\nhttp://creativecommons.org/licenses/by/4.0/`;
}

export function musicDownload(t: Track) {
  return t.driveId ? `https://drive.google.com/uc?export=download&id=${t.driveId}` : MUSIC_FOLDER;
}

export type AudioItem = {
  id: string;
  title: string;
  group: string;
  meta: string;
  preview: string;
  download: string;
  /** True when the download is a file on our own site. */
  direct: boolean;
  credit?: string;
  words: string;
  /** Waveform bars, 0-100. */
  peaks: number[];
  /** Length shown when not playing (the full track for music). */
  length: string;
  /** Small tags under the title. */
  tags: string[];
};

export const musicItems: AudioItem[] = music.map((t) => ({
  id: t.slug,
  title: t.title,
  group: t.mood,
  meta: [t.length, t.bpm ? `${t.bpm} BPM` : ""].filter(Boolean).join(" · "),
  preview: t.preview,
  download: musicDownload(t),
  direct: false,
  credit: musicCredit(t),
  words: `${t.feel} ${t.instruments} ${t.description}`,
  peaks: t.peaks,
  length: t.length,
  tags: (t.feel ?? "").split(",").map((x) => x.trim()).filter(Boolean).slice(0, 3),
}));

export const sfxItems: AudioItem[] = sfx.map((s) => ({
  id: s.slug,
  title: s.name,
  group: s.category,
  meta: `${s.seconds < 1 ? s.seconds.toFixed(1) : Math.round(s.seconds)} s`,
  preview: s.file,
  download: s.file,
  direct: true,
  words: s.source,
  peaks: s.peaks,
  length: `0:${String(Math.max(1, Math.round(s.seconds))).padStart(2, "0")}`,
  tags: [],
}));
