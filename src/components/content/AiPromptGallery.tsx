import Image from "next/image";
import Link from "next/link";

import { CopyPromptButton } from "@/components/content/CopyPromptButton";
import { Breadcrumbs } from "@/components/templates/Breadcrumbs";
import type { AiPrompt } from "@/content/types";

type AiPromptGalleryProps = {
  items: AiPrompt[];
  title: string;
  description: string;
  category?: string;
};

export function AiPromptGallery({ items, title, description, category }: AiPromptGalleryProps) {
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
                { label: "AI Prompts" },
              ]}
            />
            <p className="text-sm font-semibold text-foreground">{items.length} Prompts</p>
          </div>
          <div className="mt-1.5 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </div>

        {!category ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((nextCategory) => (
              <Link
                key={nextCategory}
                href={`/ai/prompts/${nextCategory}`}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors duration-200 hover:border-primary/40 hover:text-primary"
              >
                {nextCategory}
              </Link>
            ))}
          </div>
        ) : null}

        {items.length > 0 ? (
          <div className="mt-3 columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
            {items.map((item, index) => (
              <article
                key={item.slug}
                className="mb-4 break-inside-avoid overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
              >
                <Link href={`/ai/prompts/${item.slug}`} className="block overflow-hidden bg-slate-50 p-1.5 dark:bg-[#111111]">
                  <Image
                    src={item.coverImage}
                    alt={`${item.title} preview`}
                    width={640}
                    height={index % 2 === 0 ? 780 : 560}
                    className="h-auto w-full rounded-sm object-cover transition-transform duration-200 hover:scale-[1.02]"
                  />
                </Link>
                <div className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-bold text-primary">
                      {item.category}
                    </span>
                  </div>
                  <Link href={`/ai/prompts/${item.slug}`}>
                    <h2 className="mt-3 line-clamp-2 text-sm font-bold leading-5 text-foreground">
                      {item.title}
                    </h2>
                  </Link>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-full border border-border bg-background px-2 py-1 text-[11px] font-semibold text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3">
                    <CopyPromptButton prompt={item.prompt} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-border bg-card px-4 py-10 text-center">
            <p className="text-sm font-semibold text-foreground">No prompts found</p>
            <p className="mt-2 text-sm text-muted-foreground">New AI prompts will appear here as the library grows.</p>
          </div>
        )}
      </div>
    </section>
  );
}
