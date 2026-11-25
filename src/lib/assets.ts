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
    // Match on the category only: words in descriptions (like "Photoshop") would put files in the wrong group.
    const assetCategory = asset.category.toUpperCase();
    return category.aliases.some((alias) => assetCategory === alias.toUpperCase());
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
    ...assetCategories
      .filter((category) => getAssetsByCategorySlug(category.slug).length > 0)
      .map((category) => category.slug),
    ...assets.map((asset) => asset.slug),
  ]));
}
