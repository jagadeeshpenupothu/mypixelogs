import type { LibraryItem, LibrarySection } from "@/components/collections/LibraryPage";
import { categoryLooks, toolTasks } from "@/data/navigation";
import { assetCategories } from "@/data/asset-categories";
import { templateCategories } from "@/data/template-categories";
import { toolCategories, tools } from "@/data/tools";
import { getAssetsByCategorySlug } from "@/lib/assets";
import { getTemplatesByCategory } from "@/lib/templates";
import { isToolInCategory } from "@/lib/tools";
import type { Asset } from "@/types/asset";
import type { Template, TemplateCategory } from "@/types/template";
import type { Tool } from "@/types/tool";

const toolItem = (tool: Tool): LibraryItem => ({
  id: tool.id,
  href: `/tools/${tool.slug}`,
  title: tool.name,
  note: toolTasks[tool.slug] ?? tool.description,
  words: `${tool.category} ${tool.tags.join(" ")} ${tool.description}`,
  icon: tool.icon,
  tone: categoryLooks[tool.category].tone,
});

const templateItem = (template: Template): LibraryItem => ({
  id: template.id,
  href: `/templates/${template.slug}`,
  title: template.title,
  note: template.previewVideo ? "Edit here, then download MP4" : template.editor ? "Fill in online, then download" : template.formats.join(", "),
  words: `${template.category} ${template.formats.join(" ")} ${template.description}`,
  image: template.thumbnail,
  video: Boolean(template.previewVideo),
});

const assetItem = (asset: Asset): LibraryItem => ({
  id: asset.id,
  href: `/assets/${asset.slug}`,
  title: asset.title,
  note: asset.category,
  words: asset.description,
  image: asset.thumbnail,
});

const toolKinds = toolCategories
  .map((category) => ({ ...category, items: tools.filter((tool) => isToolInCategory(tool, category.name)) }))
  .filter((category) => category.items.length > 0);

export const toolGroups = (active: string) => [
  { label: "All", href: "/tools", active: active === "" },
  ...toolKinds.map(({ name, slug }) => ({ label: categoryLooks[name].short, href: `/tools/${slug}`, active: active === slug })),
];

export const toolSections = (slug?: string): LibrarySection[] =>
  toolKinds
    .filter((category) => !slug || category.slug === slug)
    .map((category) => ({
      id: category.slug,
      title: category.name,
      // On the full list each tool appears once.
      items: category.items.filter((tool) => slug || tool.category === category.name).map(toolItem),
    }))
    .filter((section) => section.items.length > 0);

/** Kinds that describe what a template is for, rather than its file type. */
const fileTypes: TemplateCategory[] = ["canva", "word", "excel", "google-docs", "pdf", "psd", "illustrator"];
const templateKinds = templateCategories
  .map((category) => ({ ...category, items: getTemplatesByCategory(category.slug) }))
  .filter((category) => category.items.length > 0);

export const templateGroups = (active: string) => [
  { label: "All", href: "/templates", active: active === "" },
  ...templateKinds.map(({ label, slug }) => ({ label: label.replace(" Templates", ""), href: `/templates/${slug}`, active: active === slug })),
];

export const templateSections = (slug?: string): LibrarySection[] =>
  templateKinds
    .filter((category) => (slug ? category.slug === slug : !fileTypes.includes(category.slug)))
    .map((category) => ({ id: category.slug, title: category.label, items: category.items.map(templateItem) }));

const assetKinds = assetCategories
  .map((category) => ({ ...category, items: getAssetsByCategorySlug(category.slug) }))
  .filter((category) => category.items.length > 0);

export const assetGroups = (active: string) => [
  { label: "All", href: "/assets", active: active === "" },
  ...assetKinds.map(({ label, slug }) => ({ label, href: `/assets/${slug}`, active: active === slug })),
];

export const assetSections = (slug?: string): LibrarySection[] =>
  assetKinds
    .filter((category) => !slug || category.slug === slug)
    .map((category) => ({ id: category.slug, title: category.label, items: category.items.map(assetItem) }));
