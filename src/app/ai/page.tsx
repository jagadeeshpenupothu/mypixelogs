import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ImageIcon, Sparkles, WandSparkles } from "lucide-react";

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

const sectionIcons = {
  prompts: Sparkles,
  "image-prompts": WandSparkles,
  images: ImageIcon,
};

export default function AiHubPage() {
  return (
    <section className="bg-white py-6 sm:py-8 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "AI Hub" },
          ]}
        />

        <header className="mt-6 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">AI Hub</p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal text-foreground sm:text-5xl">
            AI prompts and visuals for faster creative work.
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
            Start with curated prompt frameworks, image prompt recipes, and
            reusable AI image assets built for business, marketing, and content workflows.
          </p>
        </header>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {Object.entries(aiRouteConfigs).map(([key, config]) => {
            const Icon = sectionIcons[key as keyof typeof sectionIcons];
            const count = getContentByKind(config.kind).length;

            return (
              <Link
                key={config.baseHref}
                href={config.baseHref}
                className="group rounded-lg border border-border bg-card p-5 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-primary dark:bg-white/[0.06]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                    {count}
                  </span>
                </div>
                <h2 className="mt-4 text-lg font-bold text-foreground">{config.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{config.description}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-primary">
                  Browse
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 space-y-10">
          {Object.values(aiRouteConfigs).map((config) => {
            const items = getContentByKind(config.kind).slice(0, 3);

            return (
              <section key={config.baseHref}>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h2 className="text-xl font-bold text-foreground">{config.title}</h2>
                  <Link href={config.baseHref} className="text-sm font-semibold text-primary hover:text-primary/80">
                    View all →
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
