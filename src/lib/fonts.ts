import data from "@/data/fonts.json";

export type FontFamily = {
  name: string;
  slug: string;
  designer: string;
  category: string;
  license: string;
  weights: number[];
  italic: boolean;
  variable: boolean;
  scripts: string[];
  /** Native-script sample for Indian fonts. */
  sample: string | null;
  files: number;
  zip: string;
  size: number;
};

/** Free fonts from Google Fonts, in our chosen order (most useful first). */
export const fonts = data as FontFamily[];

export const fontCategories = ["Sans serif", "Serif", "Script", "Display", "Monospace"] as const;

export const SCRIPT_LABELS: Record<string, string> = { telugu: "Telugu", devanagari: "Hindi / Devanagari" };

export function getFontBySlug(slug: string) {
  return fonts.find((f) => f.slug === slug);
}

export function styleCount(f: FontFamily) {
  return f.weights.length * (f.italic ? 2 : 1);
}

export function formatSize(bytes: number) {
  return bytes >= 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.round(bytes / 1e3)} KB`;
}

export function relatedFonts(f: FontFamily, limit = 8) {
  return fonts.filter((x) => x.category === f.category && x.slug !== f.slug).slice(0, limit);
}
