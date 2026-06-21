import type { MetadataRoute } from "next";

import { templateCategories } from "@/data/template-categories";
import { resources } from "@/data/resources";
import { templates } from "@/data/templates";
import { toolCategories, tools } from "@/data/tools";
import { siteConfig } from "@/constants/site";

const BASE_URL = siteConfig.url;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/templates", "/tools", "/resources", "/blog"].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  const categoryRoutes = templateCategories.map((category) => ({
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

  const resourceRoutes = resources.map((resource) => ({
    url: `${BASE_URL}/resources/${resource.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const toolCategoryRoutes = toolCategories.map((category) => ({
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

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...templateRoutes,
    ...resourceRoutes,
    ...toolCategoryRoutes,
    ...toolRoutes,
  ];
}
