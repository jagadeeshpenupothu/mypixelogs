import type { Metadata } from "next";

import { LibraryPage } from "@/components/collections/LibraryPage";
import { assetGroups, assetSections } from "@/lib/library";
import { createSocialMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Free Design Assets",
  description: "Discover free logo packs, icon packs, and raw design assets for creative projects.",
  ...createSocialMetadata({
    title: "Free Design Assets",
    description: "Discover free logo packs, icon packs, and raw design assets for creative projects.",
    path: "/assets",
  }),
};

export default function AssetsPage() {
  return (
    <LibraryPage
      title="Design files"
      intro="Files you can download and use in your own designs."
      noun="design files"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Design files" }]}
      groups={assetGroups("")}
      sections={assetSections()}
    />
  );
}
