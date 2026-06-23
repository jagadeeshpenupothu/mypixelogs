import { Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Breadcrumbs } from "@/components/templates/Breadcrumbs";
import type { AiImage } from "@/content/types";

type AiImageGalleryProps = {
  items: AiImage[];
  title: string;
  description: string;
  category?: string;
};

export function AiImageGallery({ items, title, description, category }: AiImageGalleryProps) {
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
                { label: "AI Images" },
              ]}
            />
            <p className="text-sm font-semibold text-foreground">{items.length} Images</p>
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
                href={`/ai/images/${nextCategory}`}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors duration-200 hover:border-primary/40 hover:text-primary"
              >
                {nextCategory}
              </Link>
            ))}
          </div>
        ) : null}

        {items.length > 0 ? (
          <div className="mt-4 columns-1 gap-3 min-[480px]:columns-2 md:columns-3 xl:columns-4 2xl:columns-5">
            {items.map((item) => (
              <article
                key={item.slug}
                className="group relative mb-3 block break-inside-avoid overflow-hidden rounded-xl bg-muted shadow-sm transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-xl focus-within:shadow-xl"
              >
                <Link href={`/ai/images/${item.slug}`} className="block" aria-label={`View ${item.title}`}>
                  <Image
                    src={item.previewImage}
                    alt={`${item.title} preview`}
                    width={item.width}
                    height={item.height}
                    sizes="(min-width: 1536px) 16vw, (min-width: 1280px) 20vw, (min-width: 768px) 28vw, (min-width: 480px) 45vw, 92vw"
                    loading="lazy"
                    className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                  />
                </Link>

                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/0 opacity-85 transition-opacity duration-300 group-hover:opacity-100"
                  aria-hidden="true"
                />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 text-white">
                  <p className="line-clamp-2 text-sm font-bold leading-5 drop-shadow">{item.title}</p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-white/75">{item.category}</p>
                </div>

                <div className="absolute bottom-2 right-2 translate-y-1 opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  <a
                    href={item.downloadPath}
                    download
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-black shadow-md backdrop-blur transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    aria-label={`Download ${item.title}`}
                    title="Download"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-border bg-card px-4 py-10 text-center">
            <p className="text-sm font-semibold text-foreground">No images found</p>
            <p className="mt-2 text-sm text-muted-foreground">New AI images will appear here as the gallery grows.</p>
          </div>
        )}
      </div>
    </section>
  );
}
