export type TemplateCategory =
  | "canva"
  | "word"
  | "excel"
  | "google-docs"
  | "pdf"
  | "psd"
  | "illustrator"
  | "invoice"
  | "receipt"
  | "resume"
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
  editor?: "gst" | "freelancer";
  previewImage: string;
  downloadPath: string;
  formats: string[];
  features: string[];
  useCases: string[];
};
