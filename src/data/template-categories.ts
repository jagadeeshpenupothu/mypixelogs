import type { TemplateCategory } from "@/types/template";

export type TemplateCategoryMeta = {
  slug: TemplateCategory;
  title: string;
  label: string;
  description: string;
};

export const templateCategories: TemplateCategoryMeta[] = [
  {
    slug: "canva",
    title: "Free Canva Templates",
    label: "Canva Templates",
    description: "Browse editable Canva templates for social, business, and marketing designs.",
  },
  {
    slug: "word",
    title: "Free MS Word Templates",
    label: "MS Word Templates",
    description: "Browse editable Word templates for documents, invoices, resumes, and business workflows.",
  },
  {
    slug: "excel",
    title: "Free Excel Templates",
    label: "Excel Templates",
    description: "Browse spreadsheet templates for billing, tracking, calculations, and business records.",
  },
  {
    slug: "google-docs",
    title: "Free Google Docs Templates",
    label: "Google Docs Templates",
    description: "Browse document templates designed for Google Docs workflows.",
  },
  {
    slug: "pdf",
    title: "Free PDF Templates",
    label: "PDF Templates",
    description: "Browse printable PDF templates for business and personal documents.",
  },
  {
    slug: "psd",
    title: "Free PSD Templates",
    label: "PSD Templates",
    description: "Download editable Photoshop templates for print and digital design projects.",
  },
  {
    slug: "illustrator",
    title: "Free Illustrator Templates",
    label: "Illustrator Templates",
    description: "Browse editable Illustrator templates for vector-based design workflows.",
  },
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
  {
    slug: "flyer",
    title: "Free Flyer Templates",
    label: "Flyer Templates",
    description: "Browse editable flyer templates for events, promotions, and local businesses.",
  },
  {
    slug: "poster",
    title: "Free Poster Templates",
    label: "Poster Templates",
    description: "Download poster templates for campaigns, events, announcements, and promotions.",
  },
  {
    slug: "social-media",
    title: "Free Social Media Templates",
    label: "Social Media Templates",
    description: "Browse editable social media templates for posts, stories, banners, and campaigns.",
  },
];

export function getTemplateCategory(slug: string) {
  return templateCategories.find((category) => category.slug === slug);
}
