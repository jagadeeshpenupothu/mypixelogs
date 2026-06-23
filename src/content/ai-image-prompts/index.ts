import type { AiImagePrompt } from "@/content/types";

export const aiImagePrompts: AiImagePrompt[] = [
  {
    kind: "ai-image-prompt",
    title: "Minimal Product Desk Scene Prompt",
    slug: "minimal-product-desk-scene-prompt",
    description:
      "A polished image prompt for creating clean product desk scenes for SaaS, stationery, or digital products.",
    category: "product",
    tags: ["product", "desk", "minimal", "commercial"],
    coverImage: "/og-image.png",
    publishedAt: "2026-06-23",
    style: "Minimal commercial photography",
    prompt:
      "Create a clean product desk scene with [product] centered on a modern work desk, soft natural light, subtle shadows, neutral background, premium editorial composition, high detail.",
  },
  {
    kind: "ai-image-prompt",
    title: "Modern Business Team Illustration Prompt",
    slug: "modern-business-team-illustration-prompt",
    description:
      "Generate a modern illustration concept for business websites, decks, and productivity content.",
    category: "business",
    tags: ["business", "team", "illustration", "startup"],
    coverImage: "/og-image.png",
    publishedAt: "2026-06-23",
    style: "Modern vector-inspired illustration",
    prompt:
      "Create a modern business team illustration showing people collaborating around a project board, clean shapes, balanced composition, professional color palette, website-ready style.",
  },
  {
    kind: "ai-image-prompt",
    title: "Social Media Food Poster Prompt",
    slug: "social-media-food-poster-prompt",
    description:
      "A prompt for generating appetizing food poster visuals for restaurants and local promotions.",
    category: "marketing",
    tags: ["food", "poster", "restaurant", "social media"],
    coverImage: "/og-image.png",
    publishedAt: "2026-06-23",
    style: "Bold social media poster",
    prompt:
      "Create a vibrant restaurant food poster featuring [dish], bold headline space, appetizing lighting, rich colors, clean layout, social media ad format, professional food photography look.",
  },
];
