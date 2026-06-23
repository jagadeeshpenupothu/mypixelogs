import Fuse from "fuse.js";

import { assets } from "@/data/assets";
import { aiContentItems } from "@/content";
import { resources } from "@/data/resources";
import { templates } from "@/data/templates";
import { tools } from "@/data/tools";
import { getTemplateCategoryLabel } from "@/lib/templates";

export type SearchResultType = "Template" | "Asset" | "Tool" | "AI Prompt" | "AI Image Prompt" | "AI Image";
export type SearchCategoryId =
  | "everything"
  | "ai-hub"
  | "ai-prompts"
  | "ai-image-prompts"
  | "ai-images"
  | "templates"
  | "canva-templates"
  | "psd-templates"
  | "illustrator-templates"
  | "document-templates"
  | "invoice-templates"
  | "resume-templates"
  | "certificate-templates"
  | "letterhead-templates"
  | "marketing-templates"
  | "flyer-templates"
  | "poster-templates"
  | "social-media-templates"
  | "tools"
  | "pdf-tools"
  | "merge-pdf"
  | "split-pdf"
  | "compress-pdf"
  | "pdf-to-jpg"
  | "jpg-to-pdf"
  | "image-tools"
  | "image-compressor"
  | "image-resizer"
  | "color-picker"
  | "converter"
  | "background-remover"
  | "developer-tools"
  | "json-formatter"
  | "json-validator"
  | "base64-encoder"
  | "base64-decoder"
  | "url-encoder"
  | "calculators"
  | "age-calculator"
  | "fd-calculator"
  | "emi-calculator"
  | "gst-calculator"
  | "assets"
  | "logos"
  | "icons"
  | "mockups"
  | "fonts"
  | "png-assets"
  | "svg-assets"
  | "illustrations"
  | "backgrounds";

export type SearchItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  keywords?: string;
  type: SearchResultType;
  href: string;
  searchCategories: SearchCategoryId[];
};

export type SearchCategoryOption = {
  id: SearchCategoryId;
  label: string;
  icon?: string;
  children?: SearchCategoryOption[];
};

export const searchCategoryTree: SearchCategoryOption[] = [
  {
    id: "everything",
    label: "Everything",
  },
  {
    id: "templates",
    label: "Templates",
    children: [
      { id: "canva-templates", label: "Canva Templates", icon: "📄" },
      { id: "psd-templates", label: "PSD Templates", icon: "📄" },
      { id: "illustrator-templates", label: "Illustrator Templates", icon: "📄" },
      {
        id: "document-templates",
        label: "Document Templates",
        children: [
          { id: "invoice-templates", label: "Invoice Templates", icon: "📄" },
          { id: "resume-templates", label: "Resume Templates", icon: "📄" },
          { id: "certificate-templates", label: "Certificate Templates", icon: "📄" },
          { id: "letterhead-templates", label: "Letterhead Templates", icon: "📄" },
        ],
      },
      {
        id: "marketing-templates",
        label: "Marketing Templates",
        children: [
          { id: "flyer-templates", label: "Flyer Templates", icon: "📄" },
          { id: "poster-templates", label: "Poster Templates", icon: "📄" },
          { id: "social-media-templates", label: "Social Media Templates", icon: "📄" },
        ],
      },
    ],
  },
  {
    id: "ai-hub",
    label: "AI Hub",
    children: [
      { id: "ai-prompts", label: "AI Prompts" },
      { id: "ai-image-prompts", label: "AI Image Prompts" },
      { id: "ai-images", label: "AI Images" },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    children: [
      {
        id: "pdf-tools",
        label: "PDF Tools",
        children: [
          { id: "merge-pdf", label: "Merge PDF" },
          { id: "split-pdf", label: "Split PDF" },
          { id: "compress-pdf", label: "Compress PDF" },
          { id: "pdf-to-jpg", label: "PDF to JPG" },
          { id: "jpg-to-pdf", label: "JPG to PDF" },
        ],
      },
      {
        id: "image-tools",
        label: "Image Tools",
        children: [
          { id: "image-compressor", label: "Image Compressor" },
          { id: "image-resizer", label: "Image Resizer" },
          { id: "color-picker", label: "Color Picker" },
          { id: "converter", label: "Image Converter" },
          { id: "background-remover", label: "Background Remover" },
        ],
      },
      {
        id: "developer-tools",
        label: "Developer Tools",
        children: [
          { id: "json-formatter", label: "JSON Formatter" },
          { id: "json-validator", label: "JSON Validator" },
          { id: "base64-encoder", label: "Base64 Encoder" },
          { id: "base64-decoder", label: "Base64 Decoder" },
          { id: "url-encoder", label: "URL Encoder" },
        ],
      },
      {
        id: "calculators",
        label: "Calculators",
        children: [
          { id: "age-calculator", label: "Age Calculator" },
          { id: "fd-calculator", label: "FD Calculator" },
          { id: "emi-calculator", label: "EMI Calculator" },
          { id: "gst-calculator", label: "GST Calculator" },
        ],
      },
    ],
  },
  {
    id: "assets",
    label: "Assets",
    children: [
      { id: "logos", label: "Logos" },
      { id: "icons", label: "Icons" },
      { id: "mockups", label: "Mockups" },
      { id: "fonts", label: "Fonts" },
      { id: "png-assets", label: "PNG Assets" },
      { id: "svg-assets", label: "SVG Assets" },
      { id: "illustrations", label: "Illustrations" },
      { id: "backgrounds", label: "Backgrounds" },
    ],
  },
];

function flattenSearchCategories(items: SearchCategoryOption[]): SearchCategoryOption[] {
  return items.flatMap((item) => [item, ...(item.children ? flattenSearchCategories(item.children) : [])]);
}

export function getSearchCategoryLabel(category: SearchCategoryId) {
  return (
    flattenSearchCategories(searchCategoryTree).find((item) => item.id === category)?.label ?? "Everything"
  );
}

function getTemplateSearchCategories(category: string): SearchCategoryId[] {
  const categories: SearchCategoryId[] = ["templates", "document-templates"];

  if (category === "invoice") categories.push("invoice-templates");
  if (category === "resume") categories.push("resume-templates");
  if (category === "certificate") categories.push("certificate-templates");
  if (category === "letterhead") categories.push("letterhead-templates");

  return categories;
}

function getDesignTemplateCategories(resource: (typeof resources)[number]): SearchCategoryId[] {
  const categories: SearchCategoryId[] = ["templates"];
  const normalizedTitle = resource.title.toLowerCase();

  if (resource.category === "Canva") categories.push("canva-templates");
  if (resource.category === "PSD") categories.push("psd-templates");
  if (normalizedTitle.includes("flyer")) categories.push("flyer-templates");
  if (normalizedTitle.includes("poster")) categories.push("poster-templates");
  if (
    normalizedTitle.includes("social") ||
    normalizedTitle.includes("instagram") ||
    normalizedTitle.includes("banner") ||
    normalizedTitle.includes("thumbnail")
  ) {
    categories.push("social-media-templates");
  }
  if (categories.some((category) => ["flyer-templates", "poster-templates", "social-media-templates"].includes(category))) {
    categories.push("marketing-templates");
  }

  return categories;
}

function getToolSearchCategories(tool: (typeof tools)[number]): SearchCategoryId[] {
  const categories: SearchCategoryId[] = ["tools"];

  if (tool.category === "PDF Tools") categories.push("pdf-tools");
  if (tool.category === "Image Tools") categories.push("image-tools");
  if (tool.category === "Developer Tools") categories.push("developer-tools");
  if (tool.category === "Calculator Tools") categories.push("calculators");
  if (flattenSearchCategories(searchCategoryTree).some((category) => category.id === tool.slug)) {
    categories.push(tool.slug as SearchCategoryId);
  }

  return categories;
}

function getAssetSearchCategories(category: string): SearchCategoryId[] {
  const categories: SearchCategoryId[] = ["assets"];

  if (category === "LOGO") categories.push("logos");
  if (category === "ICON") categories.push("icons");

  return categories;
}

function getAiSearchCategories(kind: string): SearchCategoryId[] {
  const categories: SearchCategoryId[] = ["ai-hub"];

  if (kind === "ai-prompt") categories.push("ai-prompts");
  if (kind === "ai-image-prompt") categories.push("ai-image-prompts");
  if (kind === "ai-image") categories.push("ai-images");

  return categories;
}

function getAiHref(kind: string, slug: string) {
  if (kind === "ai-prompt") return `/ai/prompts/${slug}`;
  if (kind === "ai-image-prompt") return `/ai/image-prompts/${slug}`;
  return `/ai/images/${slug}`;
}

function getAiType(kind: string): SearchResultType {
  if (kind === "ai-prompt") return "AI Prompt";
  if (kind === "ai-image-prompt") return "AI Image Prompt";
  return "AI Image";
}

export const searchIndex: SearchItem[] = [
  ...templates.map((template) => ({
    id: template.id,
    title: template.title,
    slug: template.slug,
    description: template.description,
    category: getTemplateCategoryLabel(template.category),
    type: "Template" as const,
    href: `/templates/${template.slug}`,
    searchCategories: getTemplateSearchCategories(template.category),
  })),
  ...resources
    .filter((resource) => resource.category === "Canva" || resource.category === "PSD")
    .map((resource) => ({
      id: `design-template-${resource.id}`,
      title: resource.title,
      slug: resource.slug,
      description: resource.description
        .replaceAll("design resource", "editable template")
        .replaceAll("resource", "template"),
      category: resource.category === "Canva" ? "Canva Templates" : "PSD Templates",
      type: "Template" as const,
      href: "/templates",
      searchCategories: getDesignTemplateCategories(resource),
  })),
  ...assets.map((asset) => ({
    id: asset.id,
    title: asset.title,
    slug: asset.slug,
    description: asset.description,
    category: asset.category,
    type: "Asset" as const,
    href: `/assets/${asset.slug}`,
    searchCategories: getAssetSearchCategories(asset.category),
  })),
  ...tools
    .filter((tool) => !tool.comingSoon)
    .map((tool) => ({
      id: tool.id,
      title: tool.name,
      slug: tool.slug,
      description: tool.description,
      category: tool.category,
      keywords: tool.tags.join(" "),
      type: "Tool" as const,
      href: `/tools/${tool.slug}`,
      searchCategories: getToolSearchCategories(tool),
    })),
  ...aiContentItems.map((item) => ({
    id: item.slug,
    title: item.title,
    slug: item.slug,
    description: item.description,
    category: item.category,
    keywords: item.tags.join(" "),
    type: getAiType(item.kind),
    href: getAiHref(item.kind, item.slug),
    searchCategories: getAiSearchCategories(item.kind),
  })),
];

export const fuseOptions = {
  keys: [
    { name: "title", weight: 0.42 },
    { name: "slug", weight: 0.24 },
    { name: "description", weight: 0.22 },
    { name: "category", weight: 0.08 },
    { name: "keywords", weight: 0.04 },
  ],
  threshold: 0.36,
  distance: 120,
  minMatchCharLength: 2,
  ignoreLocation: true,
  includeScore: true,
};

export const searchSuggestions = ["invoice", "resume", "pdf", "business prompt", "image prompt"];

export function createSearchEngine() {
  return new Fuse(searchIndex, fuseOptions);
}

export function filterSearchItems(items: SearchItem[], category: SearchCategoryId) {
  if (category === "everything") {
    return items;
  }

  return items.filter((item) => item.searchCategories.includes(category));
}
