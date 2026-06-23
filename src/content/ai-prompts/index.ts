import type { AiPrompt } from "@/content/types";

export const aiPrompts: AiPrompt[] = [
  {
    kind: "ai-prompt",
    title: "Luxury Watch Product Photography",
    slug: "luxury-watch-product-photography",
    description:
      "Create a premium product photography scene for a luxury watch with polished lighting, rich materials, and editorial composition.",
    category: "product-photography",
    tags: ["luxury", "watch", "product", "studio", "commercial"],
    coverImage: "/ai/luxury-watch.svg",
    publishedAt: "2026-06-23",
    prompt:
      "Create a luxury watch product photo on a dark premium studio background. Use dramatic softbox lighting, subtle gold reflections, a polished metal watch case, detailed dial texture, shallow depth of field, elegant shadow falloff, and a high-end editorial advertising composition. The image should feel suitable for a luxury brand campaign.",
    useCases: [
      "Product campaign mockups",
      "E-commerce hero images",
      "Premium brand moodboards",
      "Social media product ads",
    ],
    tips: [
      "Replace the product type with your exact watch model or material.",
      "Add brand color notes if the image needs to match a campaign.",
      "Specify square, portrait, or banner composition before generating.",
    ],
    outputExampleImage: "/ai/luxury-watch.svg",
  },
  {
    kind: "ai-prompt",
    title: "Professional LinkedIn Headshot",
    slug: "professional-linkedin-headshot",
    description:
      "Generate a clean professional portrait suitable for LinkedIn, portfolio profiles, and business bios.",
    category: "portraits",
    tags: ["linkedin", "headshot", "portrait", "professional", "profile"],
    coverImage: "/ai/professional-portrait.svg",
    publishedAt: "2026-06-23",
    prompt:
      "Create a professional LinkedIn headshot of [person description] with natural studio lighting, a clean neutral background, confident expression, business-casual wardrobe, realistic skin texture, sharp eyes, flattering composition, and polished corporate portrait styling. Keep the image professional, approachable, and suitable for a public profile.",
    useCases: [
      "LinkedIn profile concepts",
      "Team profile placeholders",
      "Portfolio bio visuals",
      "Professional brand direction",
    ],
    tips: [
      "Describe wardrobe, background tone, and expression clearly.",
      "Avoid adding company logos unless you have rights to use them.",
      "Use a vertical crop for profile-focused output.",
    ],
    outputExampleImage: "/ai/professional-portrait.svg",
  },
  {
    kind: "ai-prompt",
    title: "Modern Startup Office Scene",
    slug: "modern-startup-office-scene",
    description:
      "Build a bright startup workspace visual for SaaS landing pages, pitch decks, and productivity content.",
    category: "business",
    tags: ["startup", "office", "workspace", "saas", "team"],
    coverImage: "/ai/startup-workspace.svg",
    publishedAt: "2026-06-23",
    prompt:
      "Create a modern startup office scene with a clean desk, open laptop, planning notes, soft daylight, plant accents, and subtle tech workspace details. The mood should feel productive, optimistic, and premium. Use a polished SaaS landing page aesthetic with balanced composition and room for headline text.",
    useCases: [
      "SaaS landing page visuals",
      "Startup pitch decks",
      "Productivity blog headers",
      "Workspace moodboards",
    ],
    tips: [
      "Specify whether people should be included or excluded.",
      "Add brand colors for stronger design-system alignment.",
      "Request empty negative space if you need room for text overlays.",
    ],
    outputExampleImage: "/ai/startup-workspace.svg",
  },
];
