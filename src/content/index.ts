import { aiImagePrompts } from "@/content/ai-image-prompts";
import { aiImages } from "@/content/ai-images";
import { aiPrompts } from "@/content/ai-prompts";
import { validateContentItems } from "@/content/schemas";
import type { ContentItem, ContentKind } from "@/content/types";

export const aiContentItems: ContentItem[] = [
  ...aiPrompts,
  ...aiImagePrompts,
  ...aiImages,
];

export const contentValidation = validateContentItems(aiContentItems);

export function getContentByKind(kind: ContentKind) {
  return aiContentItems.filter((item) => item.kind === kind);
}

export function getContentBySlug(kind: ContentKind, slug: string) {
  return getContentByKind(kind).find((item) => item.slug === slug);
}

export function getContentCategories(kind: ContentKind) {
  return Array.from(new Set(getContentByKind(kind).map((item) => item.category))).sort();
}

export function getContentByCategory(kind: ContentKind, category: string) {
  return getContentByKind(kind).filter((item) => item.category === category);
}

export function getRelatedContent(item: ContentItem, limit = 3) {
  return aiContentItems
    .filter((candidate) => candidate.slug !== item.slug)
    .filter((candidate) => candidate.kind === item.kind || candidate.category === item.category)
    .slice(0, limit);
}

export function getAllContentRouteEntries(kind: ContentKind) {
  return [
    ...getContentCategories(kind).map((slug) => ({ slug })),
    ...getContentByKind(kind).map((item) => ({ slug: item.slug })),
  ];
}
