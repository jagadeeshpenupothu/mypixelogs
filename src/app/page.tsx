import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Braces,
  Crop,
  Download,
  ArrowRight,
  Files,
  FolderOpen,
  Grid3X3,
  ImageDown,
  Layers3,
  Maximize2,
  QrCode,
  RotateCw,
  Wand2,
} from "lucide-react";

import { ExplorerLayout } from "@/components/explorer/ExplorerLayout";
import { siteConfig } from "@/constants/site";
import { assets } from "@/data/assets";
import { templates } from "@/data/templates";
import { tools } from "@/data/tools";
import { getExplorerGroups } from "@/lib/explorer";
import { createSocialMetadata } from "@/lib/metadata";
import { getTemplateCategoryLabel } from "@/lib/templates";
import type { Asset } from "@/types/asset";
import type { Template } from "@/types/template";
import type { Tool } from "@/types/tool";

const homepageTitle = "MyPixelogs — Free PDF Tools, Templates, Calculators & Assets";

export const metadata: Metadata = {
  title: {
    absolute: homepageTitle,
  },
  description: siteConfig.description,
  ...createSocialMetadata({
    title: homepageTitle,
    description: siteConfig.description,
    path: "/",
    image: siteConfig.ogImage,
  }),
};

const toolIcons = {
  Braces,
  Crop,
  Files,
  ImageDown,
  Maximize2,
  QrCode,
  RotateCw,
  Wand2,
};

function sectionTitle(title: string) {
  return <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">{title}</h2>;
}

function HomeToolCard({ tool }: { tool: Tool }) {
  const Icon = toolIcons[tool.icon as keyof typeof toolIcons] ?? Files;
  const content = (
    <>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-50 text-primary dark:bg-[#171717]">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold text-foreground">{tool.name}</h3>
        <p className="mt-1 line-clamp-1 text-xs leading-5 text-muted-foreground">{tool.description}</p>
      </div>
    </>
  );

  if (tool.comingSoon) {
    return (
      <article className="flex min-h-[92px] gap-3 rounded-lg border border-border bg-card p-4 opacity-90 shadow-sm">
        {content}
      </article>
    );
  }

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex min-h-[92px] gap-3 rounded-lg border border-border bg-card p-4 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md dark:hover:border-white/20"
    >
      {content}
    </Link>
  );
}

function HomeTemplateCard({ template }: { template: Template }) {
  return (
    <Link
      href={`/templates/${template.slug}`}
      className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:scale-[1.02] hover:border-primary/45 hover:shadow-md dark:hover:border-primary/50"
    >
      <div className="aspect-[4/5] overflow-hidden bg-slate-50 p-3 dark:border-b dark:border-border dark:bg-[#111111]">
        <Image
          src={template.thumbnail}
          alt={`${template.title} thumbnail`}
          width={640}
          height={800}
          className="h-full w-full rounded-sm object-contain shadow-sm transition-transform duration-200 group-hover:scale-[1.02]"
        />
      </div>
      <div className="p-3.5">
        <h3 className="line-clamp-1 text-sm font-semibold text-foreground">{template.title}</h3>
        <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span className="truncate font-medium">{getTemplateCategoryLabel(template.category)}</span>
          <span className="flex shrink-0 items-center gap-1">
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            {template.downloads.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}

function HomeAssetCard({ asset }: { asset: Asset }) {
  return (
    <Link
      href={`/assets/${asset.slug}`}
      className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:scale-[1.02] hover:border-primary/45 hover:shadow-md dark:hover:border-primary/50"
    >
      <div className="aspect-[4/5] overflow-hidden bg-slate-50 p-3 dark:border-b dark:border-border dark:bg-[#111111]">
        <Image
          src={asset.thumbnail}
          alt={`${asset.title} preview`}
          width={640}
          height={800}
          className="h-full w-full rounded-sm object-cover shadow-sm transition-transform duration-200 group-hover:scale-[1.02]"
        />
      </div>
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-foreground">
            {asset.title}
          </h3>
          <span className="shrink-0 rounded-md border border-border bg-muted px-2 py-1 text-[11px] font-bold uppercase text-muted-foreground">
            {asset.category}
          </span>
        </div>
      </div>
    </Link>
  );
}

function MoreCard({
  href,
  label,
  count,
  icon: Icon,
}: {
  href: string;
  label: string;
  count: number;
  icon: typeof Grid3X3;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-[92px] flex-col justify-between rounded-lg border border-dashed border-border bg-card p-4 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md dark:hover:border-white/20"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-primary dark:bg-[#171717]">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="text-xs font-semibold text-muted-foreground">{count.toLocaleString()} total</span>
      </div>
      <span className="mt-4 text-sm font-semibold text-foreground">{label} &rarr;</span>
    </Link>
  );
}

function DiscoveryMoreCard({
  href,
  count,
  noun,
  action,
  icon: Icon,
}: {
  href: string;
  count: number;
  noun: string;
  action: string;
  icon: typeof Grid3X3;
}) {
  return (
    <Link
      href={href}
      className="group flex h-full min-h-full flex-col overflow-hidden rounded-lg border border-primary/25 bg-card shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:scale-[1.02] hover:border-primary/60 hover:shadow-md dark:hover:border-primary/70"
    >
      <div className="flex aspect-[4/5] flex-col items-center justify-center gap-4 bg-blue-50/70 p-5 text-center dark:bg-[#111111]">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary/15 bg-background text-primary shadow-sm dark:bg-[#171717]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <div className="text-3xl font-bold tracking-tight text-foreground">+{count.toLocaleString()}</div>
          <div className="mt-1 text-sm font-semibold text-muted-foreground">{noun}</div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 p-3.5 text-sm font-semibold text-foreground">
        <span>{action}</span>
        <ArrowRight className="h-4 w-4 shrink-0 text-primary transition-transform duration-200 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

export default function Home() {
  const explorerGroups = getExplorerGroups();
  const popularToolSlugs = [
    "image-compressor",
    "converter",
    "qr-generator",
    "age-calculator",
    "json-validator",
    "image-resizer",
    "image-cropper",
    "rotate-pdf",
    "extract-pdf-pages",
  ];
  const popularTools = popularToolSlugs
    .map((slug) => tools.find((tool) => tool.slug === slug))
    .filter((tool): tool is (typeof tools)[number] => Boolean(tool));
  const popularTemplates = [...templates].sort((a, b) => b.downloads - a.downloads).slice(0, 9);
  const popularAssets = assets.slice(0, 9);

  return (
    <>
      <ExplorerLayout groups={explorerGroups}>
        <div className="space-y-10">
          <section>
            {sectionTitle("Popular Tools")}
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {popularTools.map((tool) => (
                <HomeToolCard key={tool.id} tool={tool} />
              ))}
              <MoreCard href="/tools" label="More Tools" count={tools.length} icon={FolderOpen} />
            </div>
          </section>

          <section>
            {sectionTitle("Popular Templates")}
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {popularTemplates.map((template) => (
                <HomeTemplateCard key={template.id} template={template} />
              ))}
              <DiscoveryMoreCard
                href="/templates"
                count={templates.length}
                noun="Templates"
                action="Browse Full Library"
                icon={Grid3X3}
              />
            </div>
          </section>

          <section>
            {sectionTitle("Popular Assets")}
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {popularAssets.map((asset) => (
                <HomeAssetCard key={asset.id} asset={asset} />
              ))}
              <DiscoveryMoreCard
                href="/assets"
                count={assets.length}
                noun="Assets"
                action="Explore Collection"
                icon={Layers3}
              />
            </div>
          </section>
        </div>
      </ExplorerLayout>
    </>
  );
}
