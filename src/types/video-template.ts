export type PhotoId = "groom" | "bride" | "couple";
export type ThemeId = "gold" | "pink";
export type SampleId = "te" | "en";

export type VideoTemplate = {
  slug: string;
  size: { width: number; height: number };
  assets: string;
  themes: { id: ThemeId; name: string; swatch: [string, string] }[];
  samples: Record<SampleId, Record<string, string>>;
  scenes: {
    id: string;
    name: string;
    /** A moment when everything in the scene is visible. */
    time: number;
    emblem?: boolean;
    photo?: PhotoId;
    fields: { id: string; label: string; lines?: number }[];
  }[];
  photoAreas: Record<PhotoId, { x: number; y: number; width: number; height: number }>;
};

export type PhotoEdit = {
  image: ImageBitmap | null;
  name: string;
  /** 1 just covers the area. */
  zoom: number;
  /** Share of the area, from its centre. */
  x: number;
  y: number;
  turns: number;
  flip: boolean;
  brightness: number;
};

export type FontId = "classic" | "elegant" | "bold" | "simple";

export type VideoContent = {
  theme: ThemeId;
  font: FontId;
  textSize: number;
  texts: Record<string, string>;
  photos: Record<PhotoId, PhotoEdit>;
  emblem: "cross" | "none" | "custom";
  emblemImage: ImageBitmap | null;
};
