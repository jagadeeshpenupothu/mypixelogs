import type { MetadataRoute } from "next";

import { guides } from "@/data/guides";
import { chatGptPrompts } from "@/lib/prompts";
import { templateCategories } from "@/data/template-categories";
import { templates } from "@/data/templates";
import { fonts } from "@/lib/fonts";
import { logos } from "@/lib/logos";
import { toolCategories, tools } from "@/data/tools";
import { getTemplatesByCategory } from "@/lib/templates";
import { getToolsByCategory } from "@/lib/tools";
import { siteConfig } from "@/constants/site";

const BASE_URL = siteConfig.url;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/templates", "/tools", "/ai", "/assets", "/assets/fonts", "/assets/fonts/telugu", "/assets/music", "/assets/sound-effects", "/assets/logos", "/guides"].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  const categoryRoutes = templateCategories
    .filter((category) => getTemplatesByCategory(category.slug).length > 0)
    .map((category) => ({
    url: `${BASE_URL}/templates/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const templateRoutes = templates.map((template) => ({
    url: `${BASE_URL}/templates/${template.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const editorRoutes = templates
    .filter((template) => template.editor)
    .map((template) => ({
      url: `${BASE_URL}/templates/${template.slug}/edit`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const toolCategoryRoutes = toolCategories
    .filter((category) => getToolsByCategory(category.name).length > 0)
    .map((category) => ({
    url: `${BASE_URL}/tools/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const toolRoutes = tools
    .filter((tool) => !tool.comingSoon)
    .map((tool) => ({
      url: `${BASE_URL}/tools/${tool.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  const aiDetailRoutes = chatGptPrompts.map((item) => ({
    url: `${BASE_URL}/ai/prompts/${item.slug}`,
    lastModified: new Date("2026-11-27"),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const guideRoutes = guides.map((g) => ({
    url: `${BASE_URL}/guides/${g.slug}`,
    lastModified: new Date(g.updated),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const fontRoutes = fonts.map((font) => ({
    url: `${BASE_URL}/assets/fonts/${font.slug}`,
    lastModified: new Date("2026-11-27"),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  const logoRoutes = logos.map((l) => ({ url: `${BASE_URL}/assets/logos/${l.slug}`, lastModified: new Date(`${l.published}T00:00:00`), changeFrequency: "monthly" as const, priority: 0.6 }));

  return [
    ...staticRoutes,
    ...logoRoutes,
    ...guideRoutes,
    ...fontRoutes,
    ...categoryRoutes,
    ...templateRoutes,
    ...editorRoutes,
    ...toolCategoryRoutes,
    ...toolRoutes,
    ...aiDetailRoutes,
  ];
}
