import { notFound } from "next/navigation";

import { aiRouteConfigs } from "@/app/ai/content-config";
import {
  generateAiMetadata,
  generateAiStaticParams,
  type AiDynamicPageProps,
} from "@/app/ai/route-pages";
import { AiPromptDetailPage } from "@/components/content/AiPromptDetailPage";
import { AiPromptGallery } from "@/components/content/AiPromptGallery";
import { aiPrompts } from "@/content/ai-prompts";
import { getRelatedContent } from "@/content";
import { getAbsoluteUrl } from "@/lib/metadata";

const config = aiRouteConfigs.prompts;

function formatCategoryTitle(slug: string) {
  return slug
    .split("-")
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

export function generateStaticParams() {
  return generateAiStaticParams(config);
}

export function generateMetadata(props: AiDynamicPageProps) {
  return generateAiMetadata(config, props);
}

export default async function AiPromptDynamicPage({ params }: AiDynamicPageProps) {
  const { slug } = await params;
  const categoryItems = aiPrompts.filter((item) => item.category === slug);

  if (categoryItems.length > 0) {
    const categoryTitle = formatCategoryTitle(slug);

    return (
      <AiPromptGallery
        title={`${categoryTitle} AI Prompts`}
        description={`Browse practical ${categoryTitle.toLowerCase()} prompts for faster creative and business workflows.`}
        items={categoryItems}
        category={slug}
      />
    );
  }

  const item = aiPrompts.find((prompt) => prompt.slug === slug);

  if (!item) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: item.title,
    description: item.description,
    url: getAbsoluteUrl(`${config.baseHref}/${item.slug}`),
    image: getAbsoluteUrl(item.coverImage),
    datePublished: item.publishedAt,
    keywords: item.tags.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AiPromptDetailPage item={item} relatedItems={getRelatedContent(item, 8)} />
    </>
  );
}
