import { assets } from "@/data/assets";
import { assetCategories } from "@/data/asset-categories";
import type { Asset, AssetFile } from "@/types/asset";

export function getAssetBySlug(slug: string): Asset | undefined {
  return assets.find((asset) => asset.slug === slug);
}

export function getRelatedAssets(asset: Asset, limit = 3): Asset[] {
  return assets
    .filter((item) => item.category === asset.category && item.slug !== asset.slug)
    .slice(0, limit);
}

export function getAssetsByCategorySlug(categorySlug: string): Asset[] {
  const category = assetCategories.find((item) => item.slug === categorySlug);

  if (!category) {
    return [];
  }

  return assets.filter((asset) => {
    const haystack = `${asset.category} ${asset.title} ${asset.slug} ${asset.description}`.toUpperCase();
    return category.aliases.some((alias) => haystack.includes(alias.toUpperCase()));
  });
}

export function getAssetFiles(asset: Asset): AssetFile[] {
  if (asset.files && asset.files.length > 0) {
    return asset.files;
  }

  if (asset.downloadUrl) {
    return [
      {
        label: "Download",
        type: "FILE",
        url: asset.downloadUrl,
      },
    ];
  }

  return [];
}

export function getAssetRouteSlugs(): string[] {
  return Array.from(new Set([
    ...assetCategories.map((category) => category.slug),
    ...assets.map((asset) => asset.slug),
  ]));
}
