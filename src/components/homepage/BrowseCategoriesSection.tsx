import Link from "next/link";
import { ArrowUpRight, FileText, FolderOpen, Newspaper, Wrench } from "lucide-react";

const browseCategories = [
  {
    title: "Templates",
    description: "Invoices, resumes, receipts, certificates, and letterheads.",
    href: "/templates",
    icon: FileText,
  },
  {
    title: "Tools",
    description: "Browser-first converters, compressors, QR tools, and file utilities.",
    href: "/tools",
    icon: Wrench,
  },
  {
    title: "Resources",
    description: "PSD files, Canva-style assets, logos, and icon packs.",
    href: "/resources",
    icon: FolderOpen,
  },
  {
    title: "Blog",
    description: "Guides and updates for templates, design files, and online tools.",
    href: "/blog",
    icon: Newspaper,
  },
];

export function BrowseCategoriesSection() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Browse Categories
          </p>
          <h2 className="mt-3 text-3xl font-bold text-foreground">
            Find the right starting point
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Explore the core areas of mypixelogs from one content discovery hub.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {browseCategories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.href}
                href={category.href}
                className="group flex h-full flex-col rounded-lg border border-border bg-card p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-soft dark:ring-1 dark:ring-white/[0.02] dark:hover:ring-primary/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-50 text-primary shadow-sm transition duration-300 group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground transition group-hover:text-primary" />
                </div>
                <h3 className="mt-6 text-lg font-semibold tracking-tight text-foreground">
                  {category.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {category.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
