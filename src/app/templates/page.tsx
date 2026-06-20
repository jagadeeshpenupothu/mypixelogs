import type { Metadata } from "next";
import Link from "next/link";

import { CategoryCard } from "@/components/cards/CategoryCard";
import { TemplateCard } from "@/components/cards/TemplateCard";
import { Button } from "@/components/ui/button";
import { categories } from "@/data/categories";
import { templates } from "@/data/templates";

export const metadata: Metadata = {
  title: "Free Templates",
  description: "Browse free invoice, resume, letterhead, and business document templates.",
};

export default function TemplatesPage() {
  const popularTemplates = [...templates].sort((a, b) => b.downloads - a.downloads).slice(0, 6);

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Templates</p>
          <h1 className="mt-3 text-4xl font-bold text-foreground">Free professional templates</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            A growing catalog of ready-to-edit files for invoices, resumes,
            letterheads, receipts, and business documents.
          </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/templates/invoice">Browse invoice templates</Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

        <div className="mt-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Popular templates
            </p>
            <h2 className="mt-3 text-3xl font-bold text-foreground">
              Most downloaded resources
            </h2>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {popularTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>

        <div className="mt-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              All templates
            </p>
            <h2 className="mt-3 text-3xl font-bold text-foreground">Complete catalog</h2>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
