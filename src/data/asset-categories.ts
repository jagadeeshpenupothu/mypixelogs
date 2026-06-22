export type AssetCategoryMeta = {
  slug: string;
  title: string;
  label: string;
  description: string;
  aliases: string[];
};

export const assetCategories: AssetCategoryMeta[] = [
  {
    slug: "images",
    title: "Free Images",
    label: "Images",
    description: "Browse image assets for creative and business projects.",
    aliases: ["IMAGE", "PHOTO", "JPG", "PNG"],
  },
  {
    slug: "icons",
    title: "Free Icon Assets",
    label: "Icons",
    description: "Download icon packs and reusable interface symbols.",
    aliases: ["ICON", "ICONS"],
  },
  {
    slug: "illustrations",
    title: "Free Illustrations",
    label: "Illustrations",
    description: "Discover illustration assets for layouts, templates, and campaigns.",
    aliases: ["ILLUSTRATION", "ILLUSTRATIONS", "VECTOR"],
  },
  {
    slug: "mockups",
    title: "Free Mockups",
    label: "Mockups",
    description: "Find mockup assets for presenting brands, products, and interfaces.",
    aliases: ["MOCKUP", "MOCKUPS"],
  },
  {
    slug: "fonts",
    title: "Free Fonts",
    label: "Fonts",
    description: "Browse font assets for typography and brand design.",
    aliases: ["FONT", "FONTS", "TTF", "OTF"],
  },
  {
    slug: "textures",
    title: "Free Textures",
    label: "Textures",
    description: "Download texture assets for backgrounds and visual effects.",
    aliases: ["TEXTURE", "TEXTURES"],
  },
  {
    slug: "backgrounds",
    title: "Free Backgrounds",
    label: "Backgrounds",
    description: "Explore background assets for digital and print designs.",
    aliases: ["BACKGROUND", "BACKGROUNDS"],
  },
  {
    slug: "patterns",
    title: "Free Patterns",
    label: "Patterns",
    description: "Find repeatable pattern assets for creative projects.",
    aliases: ["PATTERN", "PATTERNS"],
  },
  {
    slug: "ui-kits",
    title: "Free UI Kits",
    label: "UI Kits",
    description: "Browse interface kits and reusable UI design assets.",
    aliases: ["UI KIT", "UI KITS"],
  },
  {
    slug: "stickers",
    title: "Free Stickers",
    label: "Stickers",
    description: "Download sticker assets for social and creative designs.",
    aliases: ["STICKER", "STICKERS"],
  },
  {
    slug: "svg-assets",
    title: "Free SVG Assets",
    label: "SVG Assets",
    description: "Explore scalable SVG assets for web and design projects.",
    aliases: ["SVG"],
  },
  {
    slug: "vectors",
    title: "Free Vectors",
    label: "Vectors",
    description: "Browse vector assets for editable design workflows.",
    aliases: ["VECTOR", "AI", "SVG"],
  },
  {
    slug: "logos",
    title: "Free Logo Assets",
    label: "Logos",
    description: "Download logo packs and branding assets.",
    aliases: ["LOGO", "LOGOS"],
  },
];

export function getAssetCategory(slug: string) {
  return assetCategories.find((category) => category.slug === slug);
}
