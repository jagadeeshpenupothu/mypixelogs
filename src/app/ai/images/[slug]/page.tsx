import { notFound } from "next/navigation";

import { aiRouteConfigs } from "@/app/ai/content-config";
import {
  generateAiMetadata,
  generateAiStaticParams,
  type AiDynamicPageProps,
} from "@/app/ai/route-pages";
import { AiImageDetailPage } from "@/components/content/AiImageDetailPage";
import { AiImageGallery } from "@/components/content/AiImageGallery";
import { aiImages } from "@/content/ai-images";
import { getRelatedContent } from "@/content";
import { getAbsoluteUrl } from "@/lib/metadata";

const config = aiRouteConfigs.images;

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

export default async function AiImageDynamicPage({ params }: AiDynamicPageProps) {
  const { slug } = await params;
  const categoryItems = aiImages.filter((item) => item.category === slug);

  if (categoryItems.length > 0) {
    const categoryTitle = formatCategoryTitle(slug);

    return (
      <AiImageGallery
        title={`${categoryTitle} AI Images`}
        description={`Browse reusable ${categoryTitle.toLowerCase()} AI images for campaigns, presentations, and digital projects.`}
        items={categoryItems}
        category={slug}
      />
    );
  }

  const item = aiImages.find((image) => image.slug === slug);

  if (!item) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    name: item.title,
    description: item.description,
    url: getAbsoluteUrl(`${config.baseHref}/${item.slug}`),
    image: getAbsoluteUrl(item.previewImage),
    datePublished: item.publishedAt,
    keywords: item.tags.join(", "),
    license: item.license,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AiImageDetailPage item={item} relatedItems={getRelatedContent(item, 8)} />
    </>
  );
}
