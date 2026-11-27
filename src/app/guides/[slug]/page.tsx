import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Mail } from "lucide-react";

import { SampleBox } from "@/components/guides/SampleBox";
import { Breadcrumbs } from "@/components/templates/Breadcrumbs";
import { siteConfig } from "@/constants/site";
import { getGuide, guides } from "@/data/guides";
import { createSocialMetadata, getAbsoluteUrl, metaDescription } from "@/lib/metadata";
import { getPromptBySlug } from "@/lib/prompts";
import { getTemplateBySlug } from "@/lib/templates";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return guides.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const g = getGuide((await params).slug);
  if (!g) return {};
  const description = metaDescription(g.description);
  return { title: g.title, description, ...createSocialMetadata({ title: g.title, description, path: `/guides/${g.slug}` }) };
}

const readMinutes = (words: number) => Math.max(2, Math.round(words / 200));

export default async function GuidePage({ params }: PageProps) {
  const g = getGuide((await params).slug);
  if (!g) notFound();
  const templates = g.templates.map(getTemplateBySlug).filter((t): t is NonNullable<typeof t> => Boolean(t));
  const prompts = g.prompts.map(getPromptBySlug).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const words = [g.intro, ...g.sections.flatMap((s) => [...(s.paragraphs ?? []), ...(s.list ?? []), s.sample ?? ""])].join(" ").split(/\s+/).length;
  const date = new Date(`${g.updated}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const url = getAbsoluteUrl(`/guides/${g.slug}`);
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "Article", headline: g.title, description: g.description, dateModified: g.updated, mainEntityOfPage: url, author: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url }, publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url } },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: g.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
  ];
  const first = templates[0];

  return (
    <article className="pb-2">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Guides", href: "/guides" }, { label: g.title }]} />
      <div className="mt-6 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">{g.category}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{g.title}</h1>
          <p className="mt-2 text-xs text-muted-foreground">Updated {date} · {readMinutes(words)} min read</p>
          <p className="mt-5 text-lg leading-8 text-foreground">{g.intro}</p>

          {first ? (
            <Link prefetch={false} href={`/templates/${first.slug}`} className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-semibold text-foreground hover:border-primary/60">
              <span>Skip the formatting: use our free {first.title.replace(/ Template$/, "").toLowerCase()} template</span>
              <ArrowRight className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            </Link>
          ) : null}

          {g.sections.map((s) => (
            <section key={s.heading} className="mt-9">
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">{s.heading}</h2>
              {s.paragraphs?.map((p) => (
                <p key={p.slice(0, 40)} className="mt-3 text-base leading-7 text-foreground/90">{p}</p>
              ))}
              {s.list ? (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-7 text-foreground/90">
                  {s.list.map((item) => (
                    <li key={item.slice(0, 40)}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {s.sample ? <SampleBox title={s.heading.replace(/^Sample:\s*/i, "Sample: ")} text={s.sample} /> : null}
            </section>
          ))}

          <section className="mt-10">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">Questions people ask</h2>
            <div className="mt-3 divide-y divide-border rounded-xl border border-border bg-card">
              {g.faqs.map((f) => (
                <details key={f.q} className="group">
                  <summary className="cursor-pointer list-none px-4 py-3.5 text-base font-semibold text-foreground [&::-webkit-details-marker]:hidden">{f.q}</summary>
                  <p className="px-4 pb-4 text-sm leading-6 text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {g.sources?.length ? (
            <section className="mt-8 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Sources</p>
              <ul className="mt-1 space-y-1">
                {g.sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noopener" className="text-primary hover:underline">{s.label}</a>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs">This guide is general information, not legal or tax advice. Rules change; check the official source or a professional for your case.</p>
            </section>
          ) : null}
        </div>

        <aside className="grid gap-4 lg:sticky lg:top-20">
          {templates.length ? (
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-semibold text-foreground">Free templates</p>
              <ul className="mt-3 grid gap-3">
                {templates.map((t) => (
                  <li key={t.slug}>
                    <Link prefetch={false} href={`/templates/${t.slug}`} className="group flex items-center gap-3">
                      <span className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-white ring-1 ring-border">
                        <Image src={t.thumbnail} alt="" fill sizes="48px" className="object-cover object-top" />
                      </span>
                      <span className="text-sm font-medium text-foreground group-hover:underline">{t.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {prompts.length ? (
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-semibold text-foreground">Let ChatGPT write it</p>
              <ul className="mt-2 grid gap-1.5">
                {prompts.map((p) => (
                  <li key={p.slug}>
                    <Link prefetch={false} href={`/ai/prompts/${p.slug}`} className="flex items-center gap-2 text-sm text-foreground hover:text-primary hover:underline">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>

      <section className="mt-14">
        <h2 className="text-lg font-bold text-foreground">More guides</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {guides.filter((x) => x.slug !== g.slug).map((x) => (
            <li key={x.slug}>
              <Link prefetch={false} href={`/guides/${x.slug}`} className="block rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-primary/60">
                {x.title.replace(/ \(.*\)$/, "")}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </article>
  );
}
