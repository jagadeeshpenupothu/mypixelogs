import { templateCategories } from "@/data/template-categories";
import type { Template } from "@/types/template";

/** Every way a template can be opened, in the order the icons appear. */
export const FORMATS = [
  { key: "editor", label: "Edit online" },
  { key: "word", label: "Word" },
  { key: "gdocs", label: "Google Docs" },
  { key: "gsheets", label: "Google Sheets" },
  { key: "excel", label: "Excel" },
  { key: "canva", label: "Canva" },
  { key: "latex", label: "Overleaf (LaTeX)" },
  { key: "pdf", label: "PDF" },
  { key: "video", label: "MP4 video" },
] as const;

export type FormatKey = (typeof FORMATS)[number]["key"];

/** What the gallery needs to know about one template. Plain data, so it can go to the browser. */
export type GalleryItem = {
  slug: string;
  title: string;
  category: string;
  categoryLabel: string;
  description: string;
  image: string;
  width: number;
  height: number;
  formats: FormatKey[];
  /** YYYY-MM-DD, or "" when the date is not known. */
  published: string;
};

export function formatsOf(t: Template): FormatKey[] {
  const p = t.platforms ?? {};
  const has: Record<FormatKey, boolean> = {
    editor: Boolean(t.editor),
    word: t.downloadPath.endsWith(".docx") || t.formats.includes("Word"),
    gdocs: Boolean(t.googleDocId || p.googleDocsId),
    gsheets: Boolean(p.googleSheetsId),
    excel: Boolean(p.excelPath) || t.formats.includes("Excel"),
    canva: Boolean(p.canvaUrl) || t.formats.includes("Canva"),
    latex: Boolean(p.latexPath),
    pdf: Boolean(p.pdfPath) || t.downloadPath.endsWith(".pdf"),
    video: Boolean(t.previewVideo),
  };
  return FORMATS.map((f) => f.key).filter((key) => has[key]);
}

export function toGalleryItem(t: Template): GalleryItem {
  const wide = /\.jpe?g$/i.test(t.thumbnail) && Boolean(t.previewVideo);
  return {
    slug: t.slug,
    title: t.title,
    category: t.category,
    categoryLabel: templateCategories.find((c) => c.slug === t.category)?.label.replace(/ Templates$/, "") ?? t.category,
    description: t.description,
    image: t.thumbnail,
    width: wide ? 1600 : 992,
    height: wide ? 676 : 1404,
    formats: formatsOf(t),
    published: t.published ?? "",
  };
}
