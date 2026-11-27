import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { IconBadge, PictureCard, TaskCard } from "@/components/cards/ItemCard";
import { Footer } from "@/components/layout/Footer";
import { SiteSearch } from "@/components/layout/SiteSearch";
import { RecentTools } from "@/components/tools/RecentTools";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/constants/site";
import { categoryLooks, popularTasks } from "@/data/navigation";
import { templates } from "@/data/templates";
import { toolCategories, tools } from "@/data/tools";
import { createSocialMetadata } from "@/lib/metadata";
import { isToolInCategory } from "@/lib/tools";

const homepageTitle = "MyPixelogs — Free Video, Image and PDF Tools and Templates";

export const metadata: Metadata = {
  title: { absolute: homepageTitle },
  description: siteConfig.description,
  ...createSocialMetadata({ title: homepageTitle, description: siteConfig.description, path: "/", image: siteConfig.ogImage }),
};


const heading = "text-xl font-bold tracking-tight text-foreground sm:text-2xl";

export default function Home() {
  const categories = toolCategories
    .map((category) => ({ ...category, count: tools.filter((tool) => isToolInCategory(tool, category.name)).length }))
    .filter((category) => category.count > 0)
    .sort((a, b) => b.count - a.count);
  const video = templates.find((template) => template.previewVideo);
  const documents = templates.filter((template) => template !== video).sort((a, b) => Number(Boolean(b.editor)) - Number(Boolean(a.editor))).slice(0, 3);

  return (
    <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-10 2xl:px-14">
      <header className="mx-auto max-w-3xl pb-10 pt-10 text-center sm:pb-14 sm:pt-16">
        <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          Free tools for videos, photos and documents
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-muted-foreground">
          Easy for anyone. No sign-up, nothing to install.
        </p>
        <div className="mt-7">
          <SiteSearch large />
        </div>
        <p className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          Our tools work on your own device. Files are not uploaded.
        </p>
      </header>

      <div className="grid gap-14">
        <RecentTools />

        <section aria-labelledby="popular-title">
          <h2 id="popular-title" className={heading}>Start here</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popularTasks.map((task) => (
              <TaskCard key={task.href} href={task.href} title={task.title} note={task.note} icon={task.icon} tone={categoryLooks[task.category].tone} />
            ))}
          </div>
        </section>

        {video ? (
          <section aria-labelledby="video-title" className="grid overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-[1.35fr_1fr]">
            <Link prefetch={false} href={`/templates/${video.slug}`} className="block" tabIndex={-1} aria-hidden="true">
              <Image src={video.previewImage} alt="" width={1600} height={676} className="h-full min-h-40 w-full object-cover" priority />
            </Link>
            <div className="flex flex-col justify-center p-6 sm:p-8">
              <p className="text-sm font-semibold text-primary">New</p>
              <h2 id="video-title" className={`mt-1 ${heading}`}>Make a wedding invitation video</h2>
              <p className="mt-2 text-base leading-7 text-muted-foreground">
                Type your names, add three photos and download. No editing skills needed.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild size="lg">
                  <Link prefetch={false} href={`/templates/${video.slug}/edit`}>Start editing</Link>
                </Button>
              </div>
            </div>
          </section>
        ) : null}

        <section aria-labelledby="kinds-title">
          <div className="flex items-end justify-between gap-4">
            <h2 id="kinds-title" className={heading}>All tools by type</h2>
            <Link prefetch={false} href="/tools" className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-base font-semibold text-primary hover:underline">
              See all {tools.length}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {categories.map((category) => {
              const look = categoryLooks[category.name];
              return (
                <Link prefetch={false}
                  key={category.slug}
                  href={`/tools/${category.slug}`}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-[border-color,box-shadow] duration-200 hover:border-primary/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 sm:flex-row sm:items-center"
                >
                  <IconBadge icon={look.icon} tone={look.tone} />
                  <span>
                    <span className="block text-base font-semibold text-foreground">{look.short}</span>
                    <span className="block text-sm text-muted-foreground">{category.count === 1 ? "1 tool" : `${category.count} tools`}</span>
                  </span>
                </Link>
              );
            })}
            <Link prefetch={false}
              href="/ai"
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-[border-color,box-shadow] duration-200 hover:border-primary/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 sm:flex-row sm:items-center"
            >
              <IconBadge icon="Wand2" tone="bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300" />
              <span>
                <span className="block text-base font-semibold text-foreground">AI prompts</span>
                <span className="block text-sm text-muted-foreground">Ideas to copy</span>
              </span>
            </Link>
          </div>
        </section>

        <section aria-labelledby="templates-title">
          <div className="flex items-end justify-between gap-4">
            <h2 id="templates-title" className={heading}>Ready-made templates</h2>
            <Link prefetch={false} href="/templates" className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-base font-semibold text-primary hover:underline">
              See all {templates.length}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((template) => (
              <PictureCard key={template.id} href={`/templates/${template.slug}`} title={template.title} note={template.editor ? "Fill in online, then download" : template.formats.join(", ")} image={template.thumbnail} />
            ))}
          </div>
        </section>

      </div>
      <Footer />
    </div>
  );
}
