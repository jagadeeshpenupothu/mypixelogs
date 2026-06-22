import type { Metadata } from "next";

import {
  RootCollectionBrowser,
  type RootCollectionItem,
  type RootCollectionSection,
} from "@/components/collections/RootCollectionBrowser";
import { toolCategories, tools } from "@/data/tools";
import { createSocialMetadata } from "@/lib/metadata";
import { isToolInCategory } from "@/lib/tools";
import type { Tool } from "@/types/tool";

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

function toolItem(tool: Tool): RootCollectionItem {
  return {
    id: tool.id,
    title: tool.name,
    description: tool.description,
    href: `/tools/${tool.slug}`,
    badge: tool.subcategory ?? tool.category.replace(" Tools", ""),
    comingSoon: tool.comingSoon,
    filters: {
      category: [tool.category, ...(tool.secondaryCategories ?? [])],
      status: [tool.comingSoon ? "Coming Soon" : "Available"],
    },
    searchText: [
      tool.name,
      tool.slug,
      tool.description,
      tool.category,
      tool.subcategory,
      ...(tool.secondaryCategories ?? []),
      ...tool.tags,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  };
}

export default function ToolsPage() {
  const sections: RootCollectionSection[] = toolCategories
    .map((category) => ({
      id: category.slug,
      title: category.name,
      href: `/tools/${category.slug}`,
      items: tools.filter((tool) => isToolInCategory(tool, category.name)).map(toolItem),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <section className="bg-white py-1 sm:py-2 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RootCollectionBrowser
          kind="tool"
          title="Tools"
          totalLabel={`${tools.length.toLocaleString()} Tools`}
          searchPlaceholder="Search tools..."
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Tools" },
          ]}
          sections={sections}
          filterSections={[
            {
              id: "category",
              title: "Category",
              options: toolCategories.map((category) => category.name),
            },
            {
              id: "status",
              title: "Status",
              options: ["Available", "Coming Soon"],
            },
          ]}
        />
      </div>
    </section>
  );
}
