import type { MetadataRoute } from "next";

import { siteConfig } from "@/constants/site";

const BASE_URL = siteConfig.url;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
