import type { Metadata } from "next";
import { notFound } from "next/navigation";

import type { AiRouteConfig } from "@/app/ai/content-config";
import { AiCollectionPage } from "@/components/content/AiCollectionPage";
import { AiDetailPage } from "@/components/content/AiDetailPage";
import {
  getAllContentRouteEntries,
  getContentByCategory,
  getContentByKind,
  getContentBySlug,
  getContentCategories,
  getRelatedContent,
} from "@/content";
import { createSocialMetadata, getAbsoluteUrl } from "@/lib/metadata";

export type AiDynamicPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateAiStaticParams(config: AiRouteConfig) {
  return getAllContentRouteEntries(config.kind);
}

export async function generateAiMetadata(
  config: AiRouteConfig,
  { params }: AiDynamicPageProps,
): Promise<Metadata> {
  const { slug } = await params;
  const categoryItems = getContentByCategory(config.kind, slug);

  if (categoryItems.length > 0) {
    const title = `${slug.charAt(0).toUpperCase()}${slug.slice(1)} ${config.title}`;
    const description = `Browse ${config.title.toLowerCase()} in the ${slug} category on MyPixelogs.`;

    return {
      title,
      description,
      ...createSocialMetadata({
        title,
        description,
        path: `${config.baseHref}/${slug}`,
      }),
    };
  }

  const item = getContentBySlug(config.kind, slug);

  if (!item) {
    return {};
  }

  return {
    title: item.title,
    description: item.description,
    ...createSocialMetadata({
      title: `${item.title} | MyPixelogs`,
      description: item.description,
      path: `${config.baseHref}/${item.slug}`,
      image: item.coverImage,
      imageAlt: `${item.title} cover`,
    }),
  };
}

export async function AiDynamicPage({
  config,
  params,
}: AiDynamicPageProps & {
  config: AiRouteConfig;
}) {
  const { slug } = await params;
  const categoryItems = getContentByCategory(config.kind, slug);

  if (categoryItems.length > 0) {
    return (
      <AiCollectionPage
        title={`${slug.charAt(0).toUpperCase()}${slug.slice(1)} ${config.title}`}
        description={`Browse ${config.title.toLowerCase()} for ${slug} workflows.`}
        baseHref={config.baseHref}
        label={config.label}
        items={categoryItems}
        category={slug}
      />
    );
  }

  const item = getContentBySlug(config.kind, slug);

  if (!item) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": item.kind === "ai-image" ? "ImageObject" : "CreativeWork",
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
      <AiDetailPage
        item={item}
        relatedItems={getRelatedContent(item)}
        baseHref={config.baseHref}
        sectionLabel={config.label}
      />
    </>
  );
}

export function hasAiCategory(config: AiRouteConfig, slug: string) {
  return getContentCategories(config.kind).includes(slug);
}

export function getAiCollectionItems(config: AiRouteConfig) {
  return getContentByKind(config.kind);
}
