import type { Metadata } from "next";

import { TemplateGallery } from "@/components/templates/TemplateGallery";
import { templates } from "@/data/templates";
import { createSocialMetadata } from "@/lib/metadata";
import { toGalleryItem } from "@/lib/template-gallery";

const description =
  "Free templates for invoices, quotations, receipts, letters, resumes and more. Edit online or open in Word, Google Docs, Google Sheets, Excel or Overleaf.";

export const metadata: Metadata = {
  title: "Free Templates",
  description,
  ...createSocialMetadata({ title: "Free Templates", description, path: "/templates" }),
};

export default function TemplatesPage() {
  return (
    <TemplateGallery
      items={templates.map(toGalleryItem)}
      title="Templates"
      intro="Ready-made business documents. Pick one, then edit it online or open it in your favourite app."
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Templates" }]}
    />
  );
}
