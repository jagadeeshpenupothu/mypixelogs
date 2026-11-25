import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { LibraryPage } from "@/components/collections/LibraryPage";
import { toolCategories } from "@/data/tools";
import { toolGroups, toolSections } from "@/lib/library";
import { createSocialMetadata } from "@/lib/metadata";
import { getToolCategoryBySlug, getToolsByCategory } from "@/lib/tools";

type PageProps = {
  params: Promise<{
    category: string;
  }>;
};

export function generateStaticParams() {
  return toolCategories
    .filter((category) => getToolsByCategory(category.name).length > 0)
    .map((category) => ({ category: category.slug }));
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

  if (getToolsByCategory(category.name).length === 0) redirect("/tools");

  return (
    <LibraryPage
      title={category.name}
      intro={category.description}
      noun="tools"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Tools", href: "/tools" }, { label: category.name }]}
      groups={toolGroups(category.slug)}
      sections={toolSections(category.slug)}
    />
  );
}
