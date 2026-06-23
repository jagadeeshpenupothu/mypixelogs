import { aiRouteConfigs } from "@/app/ai/content-config";
import {
  AiDynamicPage,
  generateAiMetadata,
  generateAiStaticParams,
  type AiDynamicPageProps,
} from "@/app/ai/route-pages";

const config = aiRouteConfigs["image-prompts"];

export function generateStaticParams() {
  return generateAiStaticParams(config);
}

export function generateMetadata(props: AiDynamicPageProps) {
  return generateAiMetadata(config, props);
}

export default function AiImagePromptDynamicPage(props: AiDynamicPageProps) {
  return <AiDynamicPage config={config} {...props} />;
}
