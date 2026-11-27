import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";

import { Breadcrumbs } from "@/components/templates/Breadcrumbs";
import { guides } from "@/data/guides";
import { createSocialMetadata } from "@/lib/metadata";

const title = "How-to Guides: Letters, Invoices, Resumes";
const description = "Short, practical guides with formats and samples: leave applications, GST invoices, resignation letters, rent receipts, quotations and fresher resumes.";

export const metadata: Metadata = { title, description, ...createSocialMetadata({ title, description, path: "/guides" }) };

export default function GuidesPage() {
  return (
    <section className="pb-2">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Guides" }]} />
      <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">How-to guides</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Formats, samples and tips, each with a free template you can fill in.</p>
      <ul className="mt-6 grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
        {guides.map((g) => (
          <li key={g.slug}>
            <Link prefetch={false} href={`/guides/${g.slug}`} className="group flex h-full flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/60">
              <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                {g.category}
              </span>
              <span className="mt-2 text-base font-semibold text-foreground group-hover:underline">{g.title}</span>
              <span className="mt-1 text-sm leading-6 text-muted-foreground">{g.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
