import Link from "next/link";
import { ArrowUpRight, FileText, Palette } from "lucide-react";

import { categories } from "@/data/categories";

const assetCategories = [
  { label: "Logos", href: "/assets?category=LOGO" },
  { label: "Icons", href: "/assets?category=ICON" },
  { label: "Mockups", href: "/assets?category=MOCKUP" },
  { label: "Backgrounds", href: "/assets?category=BACKGROUND" },
];

export function PopularCategoriesSection() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Popular categories
          </p>
          <h2 className="mt-3 text-3xl font-bold text-foreground">
            Browse by what you need next
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Jump into template and asset categories that match common business,
            design, and document workflows.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-blue-50 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Templates</h3>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/templates/${category.slug}`}
                  className="group flex items-center justify-between rounded-md border border-border bg-background/70 px-4 py-3 text-sm font-semibold text-foreground transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                >
                  {category.name.replace(" Templates", "")}
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-blue-50 text-primary">
                <Palette className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Assets</h3>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {assetCategories.map((category) => (
                <Link
                  key={category.label}
                  href={category.href}
                  className="group flex items-center justify-between rounded-md border border-border bg-background/70 px-4 py-3 text-sm font-semibold text-foreground transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                >
                  {category.label}
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
