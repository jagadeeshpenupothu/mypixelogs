import type { Metadata } from "next";

import { LibraryPage } from "@/components/collections/LibraryPage";
import { templateGroups, templateSections } from "@/lib/library";
import { createSocialMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Free Templates",
  description: "Free video invitation and invoice templates you can edit online or download.",
  ...createSocialMetadata({
    title: "Free Templates",
    description: "Free video invitation and invoice templates you can edit online or download.",
    path: "/templates",
  }),
};

export default function TemplatesPage() {
  return (
    <LibraryPage
      title="Templates"
      intro="Pick a design, change the words and make it yours."
      noun="templates"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Templates" }]}
      groups={templateGroups("")}
      sections={templateSections()}
    />
  );
}
