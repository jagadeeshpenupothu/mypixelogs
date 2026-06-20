import { templateCategories } from "@/data/template-categories";
import { templates } from "@/data/templates";
import type { Template, TemplateCategory } from "@/types/template";

export function getTemplateBySlug(slug: string): Template | undefined {
  return templates.find((template) => template.slug === slug);
}

export function getTemplatesByCategory(category: TemplateCategory): Template[] {
  return templates.filter((template) => template.category === category);
}

export function getRelatedTemplates(template: Template, limit = 4): Template[] {
  return templates
    .filter((item) => item.category === template.category && item.slug !== template.slug)
    .slice(0, limit);
}

export function getTemplateCategoryLabel(category: TemplateCategory): string {
  return templateCategories.find((item) => item.slug === category)?.label ?? category;
}

export function getTemplateRouteSlugs(): string[] {
  return [
    ...templateCategories.map((category) => category.slug),
    ...templates.map((template) => template.slug),
  ];
}
