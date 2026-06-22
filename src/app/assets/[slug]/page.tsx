import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";

import { AssetCard } from "@/components/cards/AssetCard";
import { CollectionPage } from "@/components/collections/CollectionPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAssetCategory } from "@/data/asset-categories";
import { createSocialMetadata } from "@/lib/metadata";
import {
  getAssetBySlug,
  getAssetFiles,
  getAssetRouteSlugs,
  getAssetsByCategorySlug,
  getRelatedAssets,
} from "@/lib/assets";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getAssetRouteSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const asset = getAssetBySlug(slug);
  const category = getAssetCategory(slug);

  if (category) {
    return {
      title: category.title,
      description: category.description,
      ...createSocialMetadata({
        title: `${category.title} | MyPixelogs`,
        description: category.description,
        path: `/assets/${category.slug}`,
      }),
    };
  }

  if (!asset) return {};

  const title = asset.title;
  const socialTitle = `${asset.title} | MyPixelogs`;
  const url = `/assets/${asset.slug}`;

  return {
    title,
    description: asset.description,
    ...createSocialMetadata({
      title: socialTitle,
      description: asset.description,
      path: url,
      image: asset.previewImage,
      imageAlt: `${asset.title} preview`,
    }),
  };
}

export default async function AssetPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getAssetCategory(slug);
  const asset = getAssetBySlug(slug);

  if (category) {
    const categoryAssets = getAssetsByCategorySlug(category.slug);

    return (
      <section className="bg-white py-1 sm:py-2 dark:bg-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <CollectionPage
            kind="asset"
            title={category.label}
            items={categoryAssets}
            searchPlaceholder={`Search ${category.label.toLowerCase()}...`}
            breadcrumbs={[
              { label: "Home", href: "/" },
              { label: "Assets", href: "/assets" },
              { label: category.label },
            ]}
          />
        </div>
      </section>
    );
  }

  if (!asset) {
    notFound();
  }

  const relatedAssets = getRelatedAssets(asset);
  const assetFiles = getAssetFiles(asset);

  return (
    <section className="bg-white py-10 sm:py-14 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              {asset.category} Asset
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-normal text-foreground sm:text-5xl">
              {asset.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
              {asset.description}
            </p>

            <div className="mt-10 overflow-hidden rounded-lg border border-border bg-slate-50 p-4 shadow-sm sm:p-6 dark:bg-[#111111]">
              <Image
                src={asset.previewImage}
                alt={`${asset.title} preview`}
                width={1200}
                height={850}
                className="h-auto w-full rounded-lg border border-border bg-white object-cover"
                priority
              />
            </div>
          </div>

          <aside className="rounded-lg border border-border bg-white p-5 shadow-sm dark:bg-[#0A0A0A]">
            <h2 className="text-lg font-semibold text-foreground">Available downloads</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Download the raw design files and use them inside your own templates,
              mockups, and creative projects.
            </p>
            <div className="mt-5 grid gap-3">
              {assetFiles.map((file) => (
                <div key={`${file.type}-${file.url}`} className="rounded-lg border border-border bg-slate-50 p-4 dark:bg-[#111111]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge variant="secondary" className="bg-blue-50 text-primary">
                        {file.type}
                      </Badge>
                      <p className="mt-3 text-sm font-semibold text-foreground">{file.label}</p>
                    </div>
                    <Button asChild size="sm">
                      <a href={file.url} download>
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        {relatedAssets.length > 0 ? (
          <section className="mt-14 border-t border-border pt-12">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Related assets
            </p>
            <h2 className="mt-3 text-3xl font-bold text-foreground">More raw assets</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedAssets.map((item) => (
                <AssetCard key={item.id} asset={item} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </section>
  );
}
