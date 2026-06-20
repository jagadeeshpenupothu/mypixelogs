import type { TemplateCategory } from "@/types/template";

export type TemplateCategoryMeta = {
  slug: TemplateCategory;
  title: string;
  label: string;
  description: string;
};

export const templateCategories: TemplateCategoryMeta[] = [
  {
    slug: "invoice",
    title: "Free Invoice Templates",
    label: "Invoice Templates",
    description:
      "Download professional invoice templates for hotels, restaurants, freelancers, retail stores, and GST billing.",
  },
  {
    slug: "receipt",
    title: "Free Receipt Templates",
    label: "Receipt Templates",
    description:
      "Create clean rent, payment, cash, and school fee receipts for everyday business and personal records.",
  },
  {
    slug: "resume",
    title: "Free Resume Templates",
    label: "Resume Templates",
    description:
      "Browse editable resume templates for freshers, teachers, banking, accounting, and software engineering roles.",
  },
  {
    slug: "letterhead",
    title: "Free Letterhead Templates",
    label: "Letterhead Templates",
    description:
      "Use professional letterhead templates for companies, schools, hospitals, and construction businesses.",
  },
  {
    slug: "certificate",
    title: "Free Certificate Templates",
    label: "Certificate Templates",
    description:
      "Download certificate templates for participation, internship completion, appreciation, and training programs.",
  },
];

export function getTemplateCategory(slug: string) {
  return templateCategories.find((category) => category.slug === slug);
}
