import type { Metadata } from "next";

import { LibraryPage } from "@/components/collections/LibraryPage";
import { toolGroups, toolSections } from "@/lib/library";
import { createSocialMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Free Online Tools",
  description:
    "Browse free image, PDF, developer, calculator, language, business, design, and utility tools.",
  ...createSocialMetadata({
    title: "Free Online Tools | MyPixelogs",
    description:
      "Browse free image, PDF, developer, calculator, language, business, design, and utility tools.",
    path: "/tools",
  }),
};

export default function ToolsPage() {
  return (
    <LibraryPage
      title="All tools"
      intro="Free to use. Your files stay on your device."
      noun="tools"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Tools" }]}
      groups={toolGroups("")}
      sections={toolSections()}
    />
  );
}
