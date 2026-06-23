import Link from "next/link";

import { AiContentCard } from "@/components/content/AiContentCard";
import { Breadcrumbs } from "@/components/templates/Breadcrumbs";
import type { ContentItem } from "@/content/types";

type AiCollectionPageProps = {
  title: string;
  description: string;
  baseHref: string;
  label: string;
  items: ContentItem[];
  category?: string;
};

export function AiCollectionPage({
  title,
  description,
  baseHref,
  label,
  items,
  category,
}: AiCollectionPageProps) {
  const categories = Array.from(new Set(items.map((item) => item.category))).sort();

  return (
    <section className="bg-white py-1 sm:py-2 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="sticky top-16 z-30 -mx-4 border-b border-border bg-white/95 px-4 py-2 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 dark:bg-black/90">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "AI Hub", href: "/ai" },
                { label: title },
              ]}
            />
            <p className="text-sm font-semibold text-foreground">
              {items.length.toLocaleString()} {label}
            </p>
          </div>
          <div className="mt-1.5 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </div>

        {category ? null : (
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((nextCategory) => (
              <Link
                key={nextCategory}
                href={`${baseHref}/${nextCategory}`}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors duration-200 hover:border-primary/40 hover:text-primary"
              >
                {nextCategory}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {items.map((item) => (
            <AiContentCard
              key={item.slug}
              item={item}
              href={`${baseHref}/${item.slug}`}
              label={label}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
