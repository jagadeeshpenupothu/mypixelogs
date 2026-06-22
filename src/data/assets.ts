import { resources } from "@/data/resources";
import type { Asset } from "@/types/asset";

const assetCategories = new Set(["Logos", "Icons"]);

function getAssetCategoryLabel(category: string) {
  if (category.toLowerCase().includes("logo")) return "LOGO";
  if (category.toLowerCase().includes("icon")) return "ICON";
  return category.toUpperCase();
}

export const assets: Asset[] = resources
  .filter((resource) => assetCategories.has(resource.category))
  .map((resource) => ({
    ...resource,
    category: getAssetCategoryLabel(resource.category),
    description: resource.description
      .replaceAll("resource", "asset")
      .replaceAll("Resource", "Asset"),
  }));
