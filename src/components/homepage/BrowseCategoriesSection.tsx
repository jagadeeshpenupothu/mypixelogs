import Link from "next/link";
import { ArrowUpRight, Calculator, Code2, FileText, FolderOpen, FileStack } from "lucide-react";

const browseCategories = [
  {
    title: "PDF Tools",
    description: "Rotate, extract, convert and organize PDF files in your browser.",
    href: "/tools/pdf-tools",
    icon: FileStack,
  },
  {
    title: "Calculators",
    description: "EMI, GST, SIP, FD and age calculators for everyday planning.",
    href: "/tools/calculator-tools",
    icon: Calculator,
  },
  {
    title: "Developer Tools",
    description: "Validate JSON and discover utilities for common developer workflows.",
    href: "/tools/developer-tools",
    icon: Code2,
  },
  {
    title: "Templates",
    description: "Invoices, resumes, receipts, certificates and letterheads.",
    href: "/templates",
    icon: FileText,
  },
  {
    title: "Resources",
    description: "PSD files, Canva-style assets, logos, and icon packs.",
    href: "/resources",
    icon: FolderOpen,
  },
];

export function BrowseCategoriesSection() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Featured Categories
          </p>
          <h2 className="mt-3 text-3xl font-bold text-foreground">
            Browse the platform by task
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Jump into the most useful areas of MyPixelogs without digging through menus.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {browseCategories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.href}
                href={category.href}
                className="group flex h-full flex-col rounded-lg border border-border bg-card p-6 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md dark:hover:border-white/20 dark:hover:shadow-soft"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-50 text-primary shadow-sm transition-colors duration-200 group-hover:bg-blue-100 dark:bg-[#171717] dark:group-hover:bg-[#1F1F1F]">
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
