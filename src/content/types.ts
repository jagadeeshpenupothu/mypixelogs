export type ContentKind =
  | "ai-prompt"
  | "ai-image-prompt"
  | "ai-image"
  | "stock-photo"
  | "wallpaper"
  | "poster"
  | "coloring-page"
  | "email-template"
  | "resume-library"
  | "cover-letter"
  | "excel-formula"
  | "linkedin-post"
  | "business-name"
  | "slogan";

export type BaseContentItem = {
  title: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  coverImage: string;
  publishedAt: string;
};

export type AiPrompt = BaseContentItem & {
  kind: "ai-prompt";
  prompt: string;
  useCases: string[];
  tips: string[];
  outputExampleImage: string;
};

export type AiImagePrompt = BaseContentItem & {
  kind: "ai-image-prompt";
  prompt: string;
  style: string;
};

export type AiImage = BaseContentItem & {
  kind: "ai-image";
  previewImage: string;
  downloadPath: string;
  width: number;
  height: number;
  license: string;
  promptUsed?: string;
};

export type ResourceFoundationItem = BaseContentItem & {
  kind:
    | "email-template"
    | "resume-library"
    | "cover-letter"
    | "excel-formula"
    | "linkedin-post"
    | "business-name"
    | "slogan";
};

export type AssetFoundationItem = BaseContentItem & {
  kind: "stock-photo" | "wallpaper" | "poster" | "coloring-page";
  previewImage: string;
  downloadPath: string;
};

export type ContentItem =
  | AiPrompt
  | AiImagePrompt
  | AiImage
  | ResourceFoundationItem
  | AssetFoundationItem;

export type ContentCollection = {
  id: string;
  title: string;
  description: string;
  href: string;
  items: ContentItem[];
};
