import type { Metadata } from "next";

import { aiRouteConfigs } from "@/app/ai/content-config";
import { AiPromptGallery } from "@/components/content/AiPromptGallery";
import { aiPrompts } from "@/content/ai-prompts";
import { createSocialMetadata } from "@/lib/metadata";

const config = aiRouteConfigs.prompts;

export const metadata: Metadata = {
  title: config.title,
  description: config.description,
  ...createSocialMetadata({
    title: config.title,
    description: config.description,
    path: config.baseHref,
  }),
};

export default function AiPromptsPage() {
  return <AiPromptGallery title={config.title} description={config.description} items={aiPrompts} />;
}
