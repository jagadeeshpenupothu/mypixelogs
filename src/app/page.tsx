import type { Metadata } from "next";

import { BrowseCategoriesSection } from "@/components/homepage/BrowseCategoriesSection";
import { CTASection } from "@/components/homepage/CTASection";
import { HeroSection } from "@/components/homepage/HeroSection";
import { PopularTemplatesSection } from "@/components/homepage/PopularTemplatesSection";
import { PopularNowSection } from "@/components/homepage/PopularNowSection";
import { RecentlyAddedSection } from "@/components/homepage/RecentlyAddedSection";
import { ResourcesSection } from "@/components/homepage/ResourcesSection";
import { StatsSection } from "@/components/homepage/StatsSection";
import { ToolsSection } from "@/components/homepage/ToolsSection";
import { siteConfig } from "@/constants/site";
import { createSocialMetadata } from "@/lib/metadata";

const homepageTitle = "MyPixelogs — Free PDF Tools, Templates, Calculators & Resources";

export const metadata: Metadata = {
  title: {
    absolute: homepageTitle,
  },
  description: siteConfig.description,
  ...createSocialMetadata({
    title: homepageTitle,
    description: siteConfig.description,
    path: "/",
    image: siteConfig.ogImage,
  }),
};

export default function Home() {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
    },
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}${siteConfig.logo}`,
    description: siteConfig.description,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <HeroSection />
      <StatsSection />
      <PopularNowSection />
      <BrowseCategoriesSection />
      <RecentlyAddedSection />
      <PopularTemplatesSection />
      <ToolsSection />
      <ResourcesSection />
      <CTASection />
    </>
  );
}
