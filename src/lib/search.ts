import Fuse from "fuse.js";

import { resources } from "@/data/resources";
import { templates } from "@/data/templates";
import { tools } from "@/data/tools";
import { getTemplateCategoryLabel } from "@/lib/templates";

export type SearchResultType = "Template" | "Resource" | "Tool";

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
  ...resources.map((resource) => ({
    id: resource.id,
    title: resource.title,
    slug: resource.slug,
    description: resource.description,
    category: resource.category,
    type: "Resource" as const,
    href: `/resources/${resource.slug}`,
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

export const searchSuggestions = ["invoice", "receipt", "resume", "certificate"];

export function createSearchEngine() {
  return new Fuse(searchIndex, fuseOptions);
}
