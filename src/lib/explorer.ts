import { assets } from "@/data/assets";
import { resources } from "@/data/resources";
import { templates } from "@/data/templates";
import { tools } from "@/data/tools";

export type ExplorerItemData = {
  id: string;
  label: string;
  href: string;
  count?: number;
  type: "template" | "tool" | "asset" | "link";
  children?: ExplorerItemData[];
};

export type ExplorerGroupData = {
  id: string;
  label: string;
  href: string;
  count: number;
  items: ExplorerItemData[];
};

function countTemplates(category: string) {
  return templates.filter((template) => template.category === category).length;
}

function countDesignTemplates(category: string) {
  return resources.filter((resource) => resource.category.toLowerCase() === category.toLowerCase()).length;
}

function countAssets(category: string) {
  return assets.filter((asset) => asset.category.toLowerCase() === category.toLowerCase()).length;
}

function countTools(category: string) {
  return tools.filter((tool) => tool.category === category).length;
}

function toolItem(slug: string, fallbackLabel: string, fallbackHref: string): ExplorerItemData {
  const tool = tools.find((item) => item.slug === slug);

  return {
    id: slug,
    label: tool?.name ?? fallbackLabel,
    href: tool && !tool.comingSoon ? `/tools/${tool.slug}` : fallbackHref,
    type: "tool",
  };
}

export function getExplorerGroups(): ExplorerGroupData[] {
  const templateItems: ExplorerItemData[] = [
    { id: "canva-templates", label: "Canva Templates", href: "/templates/canva", count: countDesignTemplates("Canva"), type: "template" },
    { id: "psd-templates", label: "PSD Templates", href: "/templates/psd", count: countDesignTemplates("PSD"), type: "template" },
    { id: "illustrator-templates", label: "Illustrator Templates", href: "/templates/illustrator", count: 0, type: "template" },
    { id: "invoice-templates", label: "Invoice Templates", href: "/templates/invoice", count: countTemplates("invoice"), type: "template" },
    { id: "resume-templates", label: "Resume Templates", href: "/templates/resume", count: countTemplates("resume"), type: "template" },
    { id: "certificate-templates", label: "Certificate Templates", href: "/templates/certificate", count: countTemplates("certificate"), type: "template" },
    { id: "letterhead-templates", label: "Letterhead Templates", href: "/templates/letterhead", count: countTemplates("letterhead"), type: "template" },
    { id: "flyer-templates", label: "Flyer Templates", href: "/templates/flyer", count: resources.filter((resource) => resource.slug.includes("flyer")).length, type: "template" },
    { id: "poster-templates", label: "Poster Templates", href: "/templates/poster", count: resources.filter((resource) => resource.slug.includes("poster")).length, type: "template" },
    { id: "social-media-templates", label: "Social Media Templates", href: "/templates/social-media", count: resources.filter((resource) => resource.slug.includes("social") || resource.slug.includes("instagram")).length, type: "template" },
  ];

  const toolItems: ExplorerItemData[] = [
    {
      id: "pdf-tools",
      label: "PDF Tools",
      href: "/tools/pdf-tools",
      count: countTools("PDF Tools"),
      type: "tool",
      children: [
        toolItem("merge-pdf", "Merge PDF", "/tools/pdf-tools"),
        toolItem("split-pdf", "Split PDF", "/tools/pdf-tools"),
        toolItem("compress-pdf", "Compress PDF", "/tools/pdf-tools"),
        toolItem("pdf-to-jpg", "PDF to JPG", "/tools/pdf-tools"),
        toolItem("jpg-to-pdf", "JPG to PDF", "/tools/pdf-tools"),
        toolItem("rotate-pdf", "PDF Rotate", "/tools/pdf-tools"),
        toolItem("extract-pdf-pages", "PDF Extract", "/tools/pdf-tools"),
      ],
    },
    {
      id: "image-tools",
      label: "Image Tools",
      href: "/tools/image-tools",
      count: countTools("Image Tools"),
      type: "tool",
      children: [
        toolItem("image-compressor", "Image Compressor", "/tools/image-tools"),
        toolItem("image-resizer", "Image Resizer", "/tools/image-tools"),
        toolItem("color-picker", "Color Picker", "/tools/image-tools"),
        toolItem("converter", "Image Converter", "/tools/image-tools"),
        toolItem("background-remover", "Background Remover", "/tools/image-tools"),
      ],
    },
    {
      id: "calculators",
      label: "Calculators",
      href: "/tools/calculator-tools",
      count: countTools("Calculator Tools"),
      type: "tool",
      children: [
        toolItem("age-calculator", "Age Calculator", "/tools/calculator-tools"),
        toolItem("fd-calculator", "FD Calculator", "/tools/calculator-tools"),
        toolItem("emi-calculator", "EMI Calculator", "/tools/calculator-tools"),
        toolItem("gst-calculator", "GST Calculator", "/tools/calculator-tools"),
      ],
    },
    {
      id: "developer-tools",
      label: "Developer Tools",
      href: "/tools/developer-tools",
      count: countTools("Developer Tools"),
      type: "tool",
      children: [
        toolItem("json-formatter", "JSON Formatter", "/tools/developer-tools"),
        toolItem("json-validator", "JSON Validator", "/tools/developer-tools"),
        toolItem("base64-encoder", "Base64 Encoder", "/tools/developer-tools"),
        toolItem("base64-decoder", "Base64 Decoder", "/tools/developer-tools"),
        toolItem("url-encoder", "URL Encoder", "/tools/developer-tools"),
      ],
    },
  ];

  const assetItems: ExplorerItemData[] = [
    { id: "logos", label: "Logos", href: "/assets/logos", count: countAssets("LOGO"), type: "asset" },
    { id: "icons", label: "Icons", href: "/assets/icons", count: countAssets("ICON"), type: "asset" },
    { id: "mockups", label: "Mockups", href: "/assets/mockups", count: 0, type: "asset" },
    { id: "fonts", label: "Fonts", href: "/assets/fonts", count: 0, type: "asset" },
    { id: "png-assets", label: "PNG Assets", href: "/assets/images", count: 0, type: "asset" },
    { id: "svg-assets", label: "SVG Assets", href: "/assets/svg-assets", count: 0, type: "asset" },
    { id: "illustrations", label: "Illustrations", href: "/assets/illustrations", count: 0, type: "asset" },
    { id: "backgrounds", label: "Backgrounds", href: "/assets/backgrounds", count: 0, type: "asset" },
  ];

  return [
    {
      id: "templates",
      label: "Templates",
      href: "/templates",
      count: templates.length,
      items: templateItems,
    },
    {
      id: "tools",
      label: "Tools",
      href: "/tools",
      count: tools.length,
      items: toolItems,
    },
    {
      id: "assets",
      label: "Assets",
      href: "/assets",
      count: assets.length,
      items: assetItems,
    },
  ];
}
