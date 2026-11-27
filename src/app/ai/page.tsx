import type { Metadata } from "next";
import Link from "next/link";

import { AiContentCard } from "@/components/content/AiContentCard";
import { Breadcrumbs } from "@/components/templates/Breadcrumbs";
import { aiRouteConfigs } from "@/app/ai/content-config";
import { createSocialMetadata } from "@/lib/metadata";
import { getContentByKind } from "@/content";

export const metadata: Metadata = {
  title: "AI Hub",
  description:
    "Browse AI prompts, AI image prompts, and AI-generated image resources for modern creative and business workflows.",
  ...createSocialMetadata({
    title: "AI Hub",
    description:
      "Browse AI prompts, AI image prompts, and AI-generated image resources for modern creative and business workflows.",
    path: "/ai",
  }),
};


export default function AiHubPage() {
  return (
    <section className="pb-2">
      <div className="mx-auto max-w-site">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "AI Hub" },
          ]}
        />

        <header className="mt-6 max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            AI prompts and images
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Prompts to copy into ChatGPT or an image app, and free AI pictures to download.
          </p>
        </header>

        <div className="mt-10 space-y-10">
          {Object.values(aiRouteConfigs).map((config) => {
            const items = getContentByKind(config.kind).slice(0, 3);

            return (
              <section key={config.baseHref}>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h2 className="text-xl font-bold text-foreground">{config.title}</h2>
                  <Link href={config.baseHref} className="text-sm font-semibold text-primary hover:text-primary/80">
                    See all
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
                  {items.map((item) => (
                    <AiContentCard
                      key={item.slug}
                      item={item}
                      href={`${config.baseHref}/${item.slug}`}
                      label={config.label}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
