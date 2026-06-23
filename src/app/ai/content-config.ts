import type { ContentKind } from "@/content/types";

export type AiRouteConfig = {
  kind: ContentKind;
  title: string;
  label: string;
  description: string;
  baseHref: string;
};

export const aiRouteConfigs = {
  prompts: {
    kind: "ai-prompt",
    title: "AI Prompts",
    label: "AI Prompts",
    description:
      "Browse practical AI prompts for business planning, marketing strategy, customer support, and everyday work.",
    baseHref: "/ai/prompts",
  },
  "image-prompts": {
    kind: "ai-image-prompt",
    title: "AI Image Prompts",
    label: "AI Image Prompts",
    description:
      "Explore polished image prompt recipes for product visuals, illustrations, posters, and social media concepts.",
    baseHref: "/ai/image-prompts",
  },
  images: {
    kind: "ai-image",
    title: "AI Images",
    label: "AI Images",
    description:
      "Discover reusable AI-generated visual assets for presentations, campaigns, and digital projects.",
    baseHref: "/ai/images",
  },
} satisfies Record<string, AiRouteConfig>;
