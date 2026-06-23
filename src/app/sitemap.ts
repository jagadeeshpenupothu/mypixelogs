import type { MetadataRoute } from "next";

import { assetCategories } from "@/data/asset-categories";
import { aiRouteConfigs } from "@/app/ai/content-config";
import { getContentByKind, getContentCategories } from "@/content";
import { templateCategories } from "@/data/template-categories";
import { assets } from "@/data/assets";
import { templates } from "@/data/templates";
import { toolCategories, tools } from "@/data/tools";
import { siteConfig } from "@/constants/site";

const BASE_URL = siteConfig.url;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/templates", "/tools", "/ai", "/assets", "/blog"].map((route) => ({
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

  const assetRoutes = assets.map((asset) => ({
    url: `${BASE_URL}/assets/${asset.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const assetCategoryRoutes = assetCategories.map((category) => ({
    url: `${BASE_URL}/assets/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
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

  const aiCollectionRoutes = Object.values(aiRouteConfigs).flatMap((config) => [
    {
      url: `${BASE_URL}${config.baseHref}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    ...getContentCategories(config.kind).map((category) => ({
      url: `${BASE_URL}${config.baseHref}/${category}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ]);

  const aiDetailRoutes = Object.values(aiRouteConfigs).flatMap((config) =>
    getContentByKind(config.kind).map((item) => ({
      url: `${BASE_URL}${config.baseHref}/${item.slug}`,
      lastModified: new Date(item.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  );

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...templateRoutes,
    ...assetCategoryRoutes,
    ...assetRoutes,
    ...toolCategoryRoutes,
    ...toolRoutes,
    ...aiCollectionRoutes,
    ...aiDetailRoutes,
  ];
}
