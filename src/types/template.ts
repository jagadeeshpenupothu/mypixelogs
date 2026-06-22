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
  previewImage: string;
  downloadPath: string;
  formats: string[];
  features: string[];
  useCases: string[];
};
