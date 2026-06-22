import type { Metadata } from "next";

import {
  RootCollectionBrowser,
  type RootCollectionItem,
  type RootCollectionSection,
} from "@/components/collections/RootCollectionBrowser";
import { templateCategories } from "@/data/template-categories";
import { templates } from "@/data/templates";
import { getTemplateCategoryLabel, getTemplatesByCategory } from "@/lib/templates";
import type { Template, TemplateCategory } from "@/types/template";

export const metadata: Metadata = {
  title: "Free Templates",
  description: "Browse free invoice, resume, letterhead, and business document templates.",
};

const rootTemplateSections: { slug: TemplateCategory; title: string; href: string }[] = [
  { slug: "word", title: "MS Word Templates", href: "/templates/word" },
  { slug: "excel", title: "Excel Templates", href: "/templates/excel" },
  { slug: "pdf", title: "PDF Templates", href: "/templates/pdf" },
  { slug: "invoice", title: "Invoice Templates", href: "/templates/invoice" },
  { slug: "resume", title: "Resume Templates", href: "/templates/resume" },
  { slug: "certificate", title: "Certificate Templates", href: "/templates/certificate" },
  { slug: "letterhead", title: "Letterhead Templates", href: "/templates/letterhead" },
  { slug: "receipt", title: "Receipt Templates", href: "/templates/receipt" },
  { slug: "canva", title: "Canva Templates", href: "/templates/canva" },
  { slug: "psd", title: "PSD Templates", href: "/templates/psd" },
  { slug: "google-docs", title: "Google Docs Templates", href: "/templates/google-docs" },
];

function templateBadge(template: Template) {
  const format = template.formats[0] ?? "PDF";
  return format === "Word" ? "MS Word" : format;
}

function templateFilters(template: Template) {
  return {
    platform: template.formats.map((format) => (format === "Word" ? "Word" : format)),
    templateType: [getTemplateCategoryLabel(template.category)],
  };
}

function templateItem(template: Template): RootCollectionItem {
  return {
    id: template.id,
    title: template.title,
    description: template.description,
    href: `/templates/${template.slug}`,
    badge: templateBadge(template),
    thumbnail: template.thumbnail,
    downloadUrl: template.downloadPath,
    filters: templateFilters(template),
    searchText: `${template.title} ${template.slug} ${template.description} ${template.category} ${template.formats.join(" ")}`.toLowerCase(),
  };
}

export default function TemplatesPage() {
  const sections: RootCollectionSection[] = rootTemplateSections
    .map((section) => ({
      id: section.slug,
      title: section.title,
      href: section.href,
      items: getTemplatesByCategory(section.slug).map(templateItem),
    }))
    .filter((section) => section.items.length > 0);

  const templateTypeOptions = templateCategories.map((category) => category.label);

  return (
    <section className="bg-white py-1 sm:py-2 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RootCollectionBrowser
          kind="template"
          title="Templates"
          totalLabel={`${templates.length.toLocaleString()} Templates`}
          searchPlaceholder="Search templates..."
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Templates" },
          ]}
          sections={sections}
          filterSections={[
            {
              id: "platform",
              title: "Platform",
              options: ["Canva", "PSD", "Illustrator", "Word", "Excel", "Google Docs", "PDF"],
            },
            {
              id: "templateType",
              title: "Template Type",
              options: templateTypeOptions,
            },
          ]}
        />
      </div>
    </section>
  );
}
