import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { createSocialMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Blog",
  description: "Guides for templates, document workflows, PDF tools, and business assets.",
  ...createSocialMetadata({
    title: "Document Workflow Guides",
    description: "Guides for templates, document workflows, PDF tools, and business assets.",
    path: "/blog",
  }),
};

const posts = [
  {
    title: "How to choose the right invoice template",
    description:
      "Compare invoice formats, business use cases, and editable file types before downloading.",
    href: "/templates/invoice",
  },
  {
    title: "A practical checklist for business document design",
    description:
      "Browse templates that keep invoices, resumes, certificates, and letterheads consistent.",
    href: "/templates",
  },
  {
    title: "PDF workflow ideas for small teams",
    description:
      "Explore browser-based PDF tools for rotating, extracting, compressing, and converting documents.",
    href: "/tools/pdf-tools",
  },
];

export default function BlogPage() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Blog</p>
          <h1 className="mt-3 text-4xl font-bold text-foreground">Document workflow guides</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Editorial infrastructure for SEO guides, template roundups, and tool
            explainers when the content engine is ready.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.title}
              href={post.href}
              className="group rounded-lg border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft"
            >
              <h2 className="text-lg font-semibold text-foreground">{post.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {post.description}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Read guide
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
