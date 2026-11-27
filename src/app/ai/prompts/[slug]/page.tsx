import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PromptBuilder } from "@/components/prompts/PromptBuilder";
import { Breadcrumbs } from "@/components/templates/Breadcrumbs";
import { chatGptPrompts, getPromptBySlug, relatedPrompts } from "@/lib/prompts";
import { createSocialMetadata, metaDescription } from "@/lib/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return chatGptPrompts.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const p = getPromptBySlug((await params).slug);
  if (!p) return {};
  const title = `${p.title}: ChatGPT Prompt`;
  const description = metaDescription(`${p.summary} A ready ChatGPT prompt for a ${p.title.toLowerCase()}: fill in your details, then copy it or open it in ChatGPT. Free.`);
  return { title, description, ...createSocialMetadata({ title, description, path: `/ai/prompts/${p.slug}` }) };
}

export default async function PromptPage({ params }: PageProps) {
  const p = getPromptBySlug((await params).slug);
  if (!p) notFound();
  const related = relatedPrompts(p);

  return (
    <section className="pb-2">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "AI prompts", href: "/ai" }, { label: p.title }]} />
      <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{p.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {p.category} · ChatGPT prompt · {p.summary}
      </p>
      <div className="mt-6">
        <PromptBuilder prompt={p.prompt} />
      </div>

      {related.length ? (
        <div className="mt-12">
          <h2 className="text-lg font-bold text-foreground">More emails: {p.category}</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link prefetch={false} href={`/ai/prompts/${r.slug}`} className="block rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-primary/60">
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
