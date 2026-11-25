import Fuse from "fuse.js";

import { assets } from "@/data/assets";
import { aiContentItems } from "@/content";
import { toolTasks } from "@/data/navigation";
import { templates } from "@/data/templates";
import { tools } from "@/data/tools";
import { matchScore, searchWords } from "@/lib/plain-search";
import { getTemplateCategoryLabel } from "@/lib/templates";

export type SearchResultType = "Template" | "Asset" | "Tool" | "AI Prompt" | "AI Image Prompt" | "AI Image";
export type SearchItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  keywords?: string;
  type: SearchResultType;
  href: string;
};

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
  })),
  ...assets.map((asset) => ({
    id: asset.id,
    title: asset.title,
    slug: asset.slug,
    description: asset.description,
    category: asset.category,
    type: "Asset" as const,
    href: `/assets/${asset.slug}`,
  })),
  ...tools
    .filter((tool) => !tool.comingSoon)
    .map((tool) => ({
      id: tool.id,
      title: tool.name,
      slug: tool.slug,
      description: tool.description,
      category: tool.category,
      keywords: `${toolTasks[tool.slug] ?? ""} ${tool.tags.join(" ")}`,
      type: "Tool" as const,
      href: `/tools/${tool.slug}`,
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
  })),
];

const fuse = new Fuse(searchIndex, {
  keys: [
    { name: "title", weight: 0.6 },
    { name: "keywords", weight: 0.25 },
    { name: "description", weight: 0.15 },
  ],
  threshold: 0.38,
  minMatchCharLength: 2,
  ignoreLocation: true,
});

function rank(words: string[], loose: boolean) {
  return searchIndex
    .map((item) => ({ item, score: matchScore(words, [item.title, item.keywords ?? "", item.category, item.description], loose) }))
    .filter(({ score }) => score > 0)
    .map(({ item, score }) => ({ item, score: score + (item.type === "Tool" || item.type === "Template" ? 1 : 0) }))
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}

/** Finds things by everyday words first, then by some of the words, then allows spelling mistakes. */
export function searchItems(query: string): SearchItem[] {
  const words = searchWords(query);
  if (words.length === 0) return [];
  const found = rank(words, false);
  if (found.some(({ type }) => type === "Tool" || type === "Template")) return found;
  const close = rank(words, true).filter((item) => !found.includes(item)).slice(0, 6);
  if (close.length > 0) return [...close, ...found];
  return fuse.search(words.join(" ")).slice(0, 12).map((result) => result.item);
}
