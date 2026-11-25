"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { Breadcrumbs } from "@/components/templates/Breadcrumbs";
import { toolCategories } from "@/data/tools";
import { addRecent } from "@/lib/recent";
import { getToolBySlug } from "@/lib/tools";

/** Shows where a tool is, with a way back to similar tools. */
export function ToolTrail() {
  const pathname = usePathname();
  const tool = getToolBySlug(pathname.split("/").filter(Boolean).at(-1) ?? "");
  const slug = tool?.slug;

  useEffect(() => {
    if (slug) addRecent(slug);
  }, [slug]);

  if (!tool) return null;
  const category = toolCategories.find((item) => item.name === tool.category);

  return (
    <div className="mx-auto mb-4 max-w-7xl">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          ...(category ? [{ label: category.name, href: `/tools/${category.slug}` }] : []),
          { label: tool.name },
        ]}
      />
    </div>
  );
}
