import { CategoriesSection } from "@/components/homepage/CategoriesSection";
import { CTASection } from "@/components/homepage/CTASection";
import { HeroSection } from "@/components/homepage/HeroSection";
import { LatestTemplatesSection } from "@/components/homepage/LatestTemplatesSection";
import { PopularTemplatesSection } from "@/components/homepage/PopularTemplatesSection";
import { ResourcesSection } from "@/components/homepage/ResourcesSection";
import { StatsSection } from "@/components/homepage/StatsSection";
import { ToolsSection } from "@/components/homepage/ToolsSection";

export default function Home() {
  return (
    <>
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
