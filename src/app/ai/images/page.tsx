import type { Metadata } from "next";

import { aiRouteConfigs } from "@/app/ai/content-config";
import { AiImageGallery } from "@/components/content/AiImageGallery";
import { aiImages } from "@/content/ai-images";
import { createSocialMetadata } from "@/lib/metadata";

const config = aiRouteConfigs.images;

export const metadata: Metadata = {
  title: config.title,
  description: config.description,
  ...createSocialMetadata({
    title: config.title,
    description: config.description,
    path: config.baseHref,
  }),
};

export default function AiImagesPage() {
  return <AiImageGallery title={config.title} description={config.description} items={aiImages} />;
}
