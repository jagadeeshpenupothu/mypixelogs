import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ToolCategoryMarketplace } from "@/components/tools/ToolCategoryMarketplace";
import { toolCategories } from "@/data/tools";
import { createSocialMetadata } from "@/lib/metadata";
import { getToolCategoryBySlug, getToolsByCategory } from "@/lib/tools";

type PageProps = {
  params: Promise<{
    category: string;
  }>;
};

export function generateStaticParams() {
  return toolCategories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = getToolCategoryBySlug(categorySlug);

  if (!category) {
    return {};
  }

  const title = `Free ${category.name} Online`;

  return {
    title,
    description: category.seoDescription,
    ...createSocialMetadata({
      title: `${title} | MyPixelogs`,
      description: category.seoDescription,
      path: `/tools/${category.slug}`,
    }),
  };
}

export default async function ToolCategoryPage({ params }: PageProps) {
  const { category: categorySlug } = await params;
  const category = getToolCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  return (
    <section className="bg-white py-1 sm:py-2 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ToolCategoryMarketplace
          title={category.name}
          categorySlug={category.slug}
          tools={getToolsByCategory(category.name)}
        />
      </div>
    </section>
  );
}
