import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ToolCard } from "@/components/cards/ToolCard";
import { ToolCategoryBrowser } from "@/components/tools/ToolCategoryBrowser";
import { Button } from "@/components/ui/button";
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

  const categoryTools = getToolsByCategory(category.name);
  const featuredTools = categoryTools.filter((tool) => tool.featured);
  const relatedCategories = getRelatedCategories(category.slug);
  const liveTools = categoryTools.filter((tool) => !tool.comingSoon);

  return (
    <section className="bg-white py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-sm font-medium text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="transition hover:text-primary">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/tools" className="transition hover:text-primary">
                Tools
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-foreground" aria-current="page">
              {category.name}
            </li>
          </ol>
        </nav>

        <header className="mt-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Tool category
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal text-foreground sm:text-5xl">
            {category.name}
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            {category.description}
          </p>
        </header>

        <section aria-label={`${category.name} stats`} className="mt-10 grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Tools" value={categoryTools.length.toLocaleString()} />
          <StatCard label="Featured Tools" value={featuredTools.length.toLocaleString()} />
          <StatCard label="Categories" value={toolCategories.length.toLocaleString()} />
        </section>

        {featuredTools.length > 0 ? (
          <section className="mt-12" aria-labelledby="featured-category-tools-heading">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                  Featured
                </p>
                <h2
                  id="featured-category-tools-heading"
                  className="mt-2 text-2xl font-bold text-foreground"
                >
                  Featured {category.name.toLowerCase()}
                </h2>
              </div>
              <p className="text-sm font-semibold text-muted-foreground">
                {liveTools.length} live tools
              </p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featuredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        ) : null}

        <ToolCategoryBrowser tools={categoryTools} />

        <section className="mt-14 border-t border-border pt-10" aria-labelledby="related-categories-heading">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                Keep exploring
              </p>
              <h2 id="related-categories-heading" className="mt-2 text-2xl font-bold text-foreground">
                Related categories
              </h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/tools">View all tools</Link>
            </Button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedCategories.map((relatedCategory) => {
              const relatedTools = getToolsByCategory(relatedCategory.name);

              return (
                <Link
                  key={relatedCategory.slug}
                  href={`/tools/${relatedCategory.slug}`}
                  className="group rounded-lg border border-border bg-card p-5 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md dark:hover:border-white/20 dark:hover:shadow-soft"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-base font-semibold text-foreground">
                      {relatedCategory.name}
                    </h3>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                      {relatedTools.length}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {relatedCategory.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function getRelatedCategories(currentSlug: string) {
  const relationMap: Record<string, string[]> = {
    "image-tools": ["design-tools", "utility-tools", "pdf-tools"],
    "pdf-tools": ["image-tools", "business-tools", "utility-tools"],
    "developer-tools": ["utility-tools", "text-tools", "design-tools"],
    "calculator-tools": ["business-tools", "utility-tools", "developer-tools"],
    "text-tools": ["developer-tools", "business-tools", "utility-tools"],
    "business-tools": ["calculator-tools", "pdf-tools", "text-tools"],
    "design-tools": ["image-tools", "developer-tools", "utility-tools"],
    "utility-tools": ["image-tools", "developer-tools", "design-tools"],
  };

  const relatedSlugs = relationMap[currentSlug] ?? [];
  return relatedSlugs
    .map((slug) => toolCategories.find((category) => category.slug === slug))
    .filter((category): category is (typeof toolCategories)[number] => Boolean(category));
}
