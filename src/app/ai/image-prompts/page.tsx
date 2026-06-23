import type { Metadata } from "next";

import { aiRouteConfigs } from "@/app/ai/content-config";
import { AiCollectionPage } from "@/components/content/AiCollectionPage";
import { getContentByKind } from "@/content";
import { createSocialMetadata } from "@/lib/metadata";

const config = aiRouteConfigs["image-prompts"];

export const metadata: Metadata = {
  title: config.title,
  description: config.description,
  ...createSocialMetadata({
    title: config.title,
    description: config.description,
    path: config.baseHref,
  }),
};

export default function AiImagePromptsPage() {
  return (
    <AiCollectionPage
      title={config.title}
      description={config.description}
      baseHref={config.baseHref}
      label={config.label}
      items={getContentByKind(config.kind)}
    />
  );
}
