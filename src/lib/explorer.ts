import { assets } from "@/data/assets";
import { aiImagePrompts } from "@/content/ai-image-prompts";
import { aiImages } from "@/content/ai-images";
import { aiPrompts } from "@/content/ai-prompts";
import { assetCategories } from "@/data/asset-categories";
import { templates } from "@/data/templates";
import { toolCategories, tools } from "@/data/tools";
import { getAssetsByCategorySlug } from "@/lib/assets";
import { getTemplatesByCategory } from "@/lib/templates";
import type { TemplateCategory } from "@/types/template";

export type ExplorerItemData = {
  id: string;
  label: string;
  href: string;
  count?: number;
  type: "template" | "tool" | "asset" | "ai" | "link";
  children?: ExplorerItemData[];
};

export type ExplorerGroupData = {
  id: string;
  label: string;
  href: string;
  count: number;
  items: ExplorerItemData[];
};

const templateGroups: { slug: TemplateCategory; label: string }[] = [
  { slug: "video", label: "Video Templates" },
  { slug: "canva", label: "Canva Templates" },
  { slug: "psd", label: "PSD Templates" },
  { slug: "illustrator", label: "Illustrator Templates" },
  { slug: "invoice", label: "Invoice Templates" },
  { slug: "receipt", label: "Receipt Templates" },
  { slug: "resume", label: "Resume Templates" },
  { slug: "certificate", label: "Certificate Templates" },
  { slug: "letterhead", label: "Letterhead Templates" },
  { slug: "flyer", label: "Flyer Templates" },
  { slug: "poster", label: "Poster Templates" },
  { slug: "social-media", label: "Social Media Templates" },
];

const hasItems = (item: ExplorerItemData) => (item.count ?? 0) > 0;

/** Sections without finished items are left out, so every link leads somewhere useful. */
export function getExplorerGroups(): ExplorerGroupData[] {
  const templateItems: ExplorerItemData[] = templateGroups
    .map(({ slug, label }) => ({
      id: `${slug}-templates`,
      label,
      href: `/templates/${slug}`,
      count: getTemplatesByCategory(slug).length,
      type: "template" as const,
    }))
    .filter(hasItems);

  const toolItems: ExplorerItemData[] = toolCategories
    .map((category) => {
      const items = tools.filter((tool) => tool.category === category.name);
      return {
        id: category.slug,
        label: category.name,
        href: `/tools/${category.slug}`,
        count: items.length,
        type: "tool" as const,
        children: items.map((tool) => ({
          id: tool.slug,
          label: tool.name,
          href: `/tools/${tool.slug}`,
          type: "tool" as const,
        })),
      };
    })
    .filter(hasItems);

  const assetItems: ExplorerItemData[] = assetCategories
    .map((category) => ({
      id: `asset-${category.slug}`,
      label: category.label,
      href: `/assets/${category.slug}`,
      count: getAssetsByCategorySlug(category.slug).length,
      type: "asset" as const,
    }))
    .filter(hasItems);

  const aiItems: ExplorerItemData[] = [
    { id: "ai-prompts", label: "AI Prompts", href: "/ai/prompts", count: aiPrompts.length, type: "ai" },
    {
      id: "ai-image-prompts",
      label: "AI Image Prompts",
      href: "/ai/image-prompts",
      count: aiImagePrompts.length,
      type: "ai",
    },
    { id: "ai-images", label: "AI Images", href: "/ai/images", count: aiImages.length, type: "ai" },
  ];

  return [
    {
      id: "templates",
      label: "Templates",
      href: "/templates",
      count: templates.length,
      items: templateItems,
    },
    {
      id: "tools",
      label: "Tools",
      href: "/tools",
      count: tools.length,
      items: toolItems,
    },
    {
      id: "ai-hub",
      label: "AI Hub",
      href: "/ai",
      count: aiPrompts.length + aiImagePrompts.length + aiImages.length,
      items: aiItems,
    },
    {
      id: "assets",
      label: "Assets",
      href: "/assets",
      count: assets.length,
      items: assetItems,
    },
  ].filter((group) => group.count > 0);
}
