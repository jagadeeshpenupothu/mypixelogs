import type { Metadata } from "next";

import {
  RootCollectionBrowser,
  type RootCollectionItem,
  type RootCollectionSection,
} from "@/components/collections/RootCollectionBrowser";
import { assetCategories } from "@/data/asset-categories";
import { assets } from "@/data/assets";
import { getAssetsByCategorySlug } from "@/lib/assets";
import type { Asset } from "@/types/asset";

export const metadata: Metadata = {
  title: "Free Design Assets",
  description: "Discover free logo packs, icon packs, and raw design assets for creative projects.",
};

function assetTypeLabel(asset: Asset) {
  const category = asset.category.toUpperCase();
  if (category === "LOGO") return "Logo";
  if (category === "ICON") return "Icon";
  return asset.category
    .toLowerCase()
    .replace(/(^|\s)\S/g, (match) => match.toUpperCase());
}

function assetFormats(asset: Asset) {
  return asset.files?.map((file) => file.type.toUpperCase()) ?? [];
}

function assetDownloadUrl(asset: Asset) {
  return asset.downloadUrl ?? asset.files?.[0]?.url ?? asset.previewImage;
}

function assetItem(asset: Asset): RootCollectionItem {
  const type = assetTypeLabel(asset);
  const formats = assetFormats(asset);

  return {
    id: asset.id,
    title: asset.title,
    description: asset.description,
    href: `/assets/${asset.slug}`,
    badge: type,
    thumbnail: asset.thumbnail,
    downloadUrl: assetDownloadUrl(asset),
    filters: {
      resourceType: [type],
      format: formats,
      style: ["Modern"],
    },
    searchText: `${asset.title} ${asset.slug} ${asset.description} ${asset.category} ${formats.join(" ")}`.toLowerCase(),
  };
}

export default function AssetsPage() {
  const sections: RootCollectionSection[] = assetCategories
    .map((category) => ({
      id: category.slug,
      title: category.label,
      href: `/assets/${category.slug}`,
      items: getAssetsByCategorySlug(category.slug).map(assetItem),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <section className="bg-white py-1 sm:py-2 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RootCollectionBrowser
          kind="asset"
          title="Assets"
          totalLabel={`${assets.length.toLocaleString()} Assets`}
          searchPlaceholder="Search assets..."
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Assets" },
          ]}
          sections={sections}
          filterSections={[
            {
              id: "resourceType",
              title: "Resource Type",
              options: [
                "Image",
                "Font",
                "Mockup",
                "Illustration",
                "Icon",
                "Logo",
                "SVG",
                "Texture",
                "Background",
                "Pattern",
                "UI Kit",
                "Sticker",
                "Vector",
              ],
            },
            {
              id: "style",
              title: "Style",
              options: ["Minimal", "Modern", "Vintage", "Corporate", "Creative"],
            },
            {
              id: "format",
              title: "Format",
              options: ["PNG", "JPG", "SVG", "AI", "PSD", "TTF", "OTF"],
            },
          ]}
        />
      </div>
    </section>
  );
}
