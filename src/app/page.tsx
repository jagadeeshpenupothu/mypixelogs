import { CategoriesSection } from "@/components/homepage/CategoriesSection";
import { CTASection } from "@/components/homepage/CTASection";
import { HeroSection } from "@/components/homepage/HeroSection";
import { LatestTemplatesSection } from "@/components/homepage/LatestTemplatesSection";
import { PopularTemplatesSection } from "@/components/homepage/PopularTemplatesSection";
import { ResourcesSection } from "@/components/homepage/ResourcesSection";
import { StatsSection } from "@/components/homepage/StatsSection";
import { ToolsSection } from "@/components/homepage/ToolsSection";
import { siteConfig } from "@/constants/site";

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
    logo: `${siteConfig.url}/logo.svg`,
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
      <CategoriesSection />
      <PopularTemplatesSection />
      <ToolsSection />
      <ResourcesSection />
      <StatsSection />
      <LatestTemplatesSection />
      <CTASection />
    </>
  );
}
