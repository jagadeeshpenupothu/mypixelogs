import Image from "next/image";
import Link from "next/link";

import { AiContentCard } from "@/components/content/AiContentCard";
import { Breadcrumbs } from "@/components/templates/Breadcrumbs";
import type { AiImage, AiImagePrompt, AiPrompt, ContentItem } from "@/content/types";

type AiDetailPageProps = {
  item: ContentItem;
  relatedItems: ContentItem[];
  baseHref: string;
  sectionLabel: string;
};

function isAiPrompt(item: ContentItem): item is AiPrompt {
  return item.kind === "ai-prompt";
}

function isAiImagePrompt(item: ContentItem): item is AiImagePrompt {
  return item.kind === "ai-image-prompt";
}

function isAiImage(item: ContentItem): item is AiImage {
  return item.kind === "ai-image";
}

export function AiDetailPage({
  item,
  relatedItems,
  baseHref,
  sectionLabel,
}: AiDetailPageProps) {
  return (
    <section className="bg-white py-6 sm:py-8 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "AI Hub", href: "/ai" },
            { label: sectionLabel, href: baseHref },
            { label: item.title },
          ]}
        />

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
          <article>
            <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold uppercase text-primary">
              {item.category}
            </span>
            <h1 className="mt-3 text-4xl font-bold tracking-normal text-foreground sm:text-5xl">
              {item.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
              {item.description}
            </p>

            <div className="mt-8 overflow-hidden rounded-lg border border-border bg-slate-50 p-3 shadow-sm dark:bg-[#111111]">
              <Image
                src={item.coverImage}
                alt={`${item.title} cover`}
                width={1200}
                height={720}
                className="h-auto w-full rounded-md object-cover"
                priority
              />
            </div>

            {isAiPrompt(item) || isAiImagePrompt(item) ? (
              <div className="mt-8 rounded-lg border border-border bg-card p-5 shadow-sm">
                <h2 className="text-xl font-bold text-foreground">Prompt</h2>
                <pre className="mt-4 whitespace-pre-wrap rounded-lg border border-border bg-background p-4 text-sm leading-7 text-foreground">
                  {item.prompt}
                </pre>
              </div>
            ) : null}

            {isAiImagePrompt(item) ? (
              <div className="mt-6 rounded-lg border border-border bg-card p-5 shadow-sm">
                <h2 className="text-xl font-bold text-foreground">Style Direction</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.style}</p>
              </div>
            ) : null}

            {isAiImage(item) ? (
              <div className="mt-6 rounded-lg border border-border bg-card p-5 shadow-sm">
                <h2 className="text-xl font-bold text-foreground">Download</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.license}</p>
                <a
                  href={item.downloadPath}
                  download
                  className="mt-4 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
                >
                  Download Image
                </a>
              </div>
            ) : null}
          </article>

          <aside className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Details</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="font-semibold text-foreground">Category</dt>
                <dd className="mt-1 text-muted-foreground">{item.category}</dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Published</dt>
                <dd className="mt-1 text-muted-foreground">
                  {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(item.publishedAt))}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Tags</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </aside>
        </div>

        {relatedItems.length > 0 ? (
          <section className="mt-12 border-t border-border pt-10">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-foreground">Related {sectionLabel}</h2>
              <Link href={baseHref} className="text-sm font-semibold text-primary hover:text-primary/80">
                View all →
              </Link>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
              {relatedItems.map((relatedItem) => (
                <AiContentCard
                  key={relatedItem.slug}
                  item={relatedItem}
                  href={`${baseHref}/${relatedItem.slug}`}
                  label={sectionLabel}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </section>
  );
}
