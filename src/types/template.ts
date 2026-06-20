export type TemplateCategory = "invoice" | "receipt" | "resume" | "letterhead" | "certificate";

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
