export type TemplateCategory =
  | "canva"
  | "word"
  | "excel"
  | "google-docs"
  | "pdf"
  | "psd"
  | "illustrator"
  | "video"
  | "invoice"
  | "receipt"
  | "resume"
  | "letter"
  | "business"
  | "letterhead"
  | "certificate"
  | "flyer"
  | "poster"
  | "social-media";

export type Template = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: TemplateCategory;
  thumbnail: string;
  downloads: number;
  /** Real, finished file: listed first on the homepage. */
  featured?: boolean;
  /** Only templates with a finished file are shown on the site. */
  ready?: boolean;
  /** Google Docs file id: visitors get their own copy, the original stays locked. */
  googleDocId?: string;
  /** Online editor for this template, if it has one. */
  editor?: "gst" | "freelancer" | "wedding-video" | "resume" | "flyer";
  /** Which flyer design the online editor opens (see src/lib/flyers/registry.ts). */
  flyerDesign?: string;
  /** A short silent clip of a video template. */
  previewVideo?: string;
  /** Date added to the site (YYYY-MM-DD), when known. */
  published?: string;
  /** Other places the same template can be opened or downloaded. */
  platforms?: TemplatePlatforms;
  previewImage: string;
  downloadPath: string;
  formats: string[];
  features: string[];
  useCases: string[];
};

/** Where else a template is available. Google ids make a private copy for each visitor. */
export type TemplatePlatforms = {
  googleDocsId?: string;
  googleSheetsId?: string;
  /** Canva "template link": each visitor gets their own copy. */
  canvaUrl?: string;
  /** Files in /public/downloads. */
  excelPath?: string;
  latexPath?: string;
  pdfPath?: string;
  /** Layered Photoshop file; also opens in Photopea, the free online editor. */
  psdPath?: string;
  /** Illustrator file and plain SVG. */
  aiPath?: string;
  svgPath?: string;
};
