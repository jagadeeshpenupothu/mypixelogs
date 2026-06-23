import { Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Breadcrumbs } from "@/components/templates/Breadcrumbs";
import type { AiImage, ContentItem } from "@/content/types";

type AiImageDetailPageProps = {
  item: AiImage;
  relatedItems: ContentItem[];
};

export function AiImageDetailPage({ item, relatedItems }: AiImageDetailPageProps) {
  const relatedImages = relatedItems.filter((related): related is AiImage => related.kind === "ai-image");

  return (
    <article className="bg-white py-3 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "AI Hub", href: "/ai" },
            { label: "AI Images", href: "/ai/images" },
            { label: item.title },
          ]}
        />

        <section className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
          <div className="overflow-hidden rounded-xl border border-border bg-slate-50 p-2 dark:bg-[#111111]">
            <Image
              src={item.previewImage}
              alt={`${item.title} preview`}
              width={item.width}
              height={item.height}
              priority
              className="h-auto w-full rounded-lg object-cover"
            />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-primary">{item.category}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{item.title}</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>

            <a
              href={item.downloadPath}
              download
              className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download Image
            </a>

            <div className="mt-5 rounded-xl border border-border bg-card p-4">
              <h2 className="text-sm font-bold text-foreground">License</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.license}</p>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-foreground">Related Images</h2>
            <Link href="/ai/images" className="text-sm font-semibold text-primary hover:underline">
              Browse all
            </Link>
          </div>
          {relatedImages.length > 0 ? (
            <div className="mt-4 columns-1 gap-3 sm:columns-2 xl:columns-3">
              {relatedImages.map((related) => (
                <Link
                  key={related.slug}
                  href={`/ai/images/${related.slug}`}
                  className="group relative mb-3 block break-inside-avoid overflow-hidden rounded-xl bg-muted shadow-sm transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <Image
                    src={related.previewImage}
                    alt={`${related.title} preview`}
                    width={related.width}
                    height={related.height}
                    sizes="(min-width: 1280px) 24vw, (min-width: 640px) 42vw, 92vw"
                    loading="lazy"
                    className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/0" aria-hidden="true" />
                  <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                    <h3 className="line-clamp-2 text-sm font-bold drop-shadow">{related.title}</h3>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-white/75">{related.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-border bg-card px-4 py-8 text-center">
              <p className="text-sm font-semibold text-foreground">No related images yet</p>
            </div>
          )}
        </section>
      </div>
    </article>
  );
}
