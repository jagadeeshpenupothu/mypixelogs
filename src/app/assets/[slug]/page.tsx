import type { Metadata } from "next";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { Download } from "lucide-react";

import { AssetCard } from "@/components/cards/AssetCard";
import { LibraryPage } from "@/components/collections/LibraryPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAssetCategory } from "@/data/asset-categories";
import { allResources } from "@/data/resources";
import { assetGroups, assetSections } from "@/lib/library";
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
    if (categoryAssets.length === 0) redirect("/assets");

    return (
      <LibraryPage
        title={category.label}
        intro={category.description}
        noun="design files"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Design files", href: "/assets" },
          { label: category.label },
        ]}
        groups={assetGroups(category.slug)}
        sections={assetSections(category.slug)}
      />
    );
  }

  if (!asset) {
    if (allResources.some((resource) => resource.slug === slug)) redirect("/assets");
    notFound();
  }

  const relatedAssets = getRelatedAssets(asset);
  const assetFiles = getAssetFiles(asset);

  return (
    <section className="pb-2">
      <div className="mx-auto max-w-site">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px] lg:items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
              {asset.title}
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
              {asset.description}
            </p>

            <div className="mt-10 overflow-hidden rounded-lg border border-border bg-slate-50 p-4 shadow-sm sm:p-6 dark:bg-muted/60">
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

          <aside className="rounded-lg border border-border bg-white p-5 shadow-sm dark:bg-card">
            <h2 className="text-lg font-semibold text-foreground">Available downloads</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Download the raw design files and use them inside your own templates,
              mockups, and creative projects.
            </p>
            <div className="mt-5 grid gap-3">
              {assetFiles.map((file) => (
                <div key={`${file.type}-${file.url}`} className="rounded-lg border border-border bg-slate-50 p-4 dark:bg-muted/60">
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
            <h2 className="text-2xl font-bold text-foreground">More like this</h2>
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
