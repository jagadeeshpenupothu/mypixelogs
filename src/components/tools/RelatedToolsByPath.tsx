"use client";

import { usePathname } from "next/navigation";

import { ToolTaskCard } from "@/components/cards/ItemCard";
import { getRelatedTools, getToolBySlug } from "@/lib/tools";

export function RelatedToolsByPath() {
  const pathname = usePathname();
  const slug = pathname.split("/").filter(Boolean).at(-1);

  if (!slug || pathname === "/tools") {
    return null;
  }

  const currentTool = getToolBySlug(slug);

  if (!currentTool) {
    return null;
  }

  const relatedTools = getRelatedTools(currentTool, 6);

  if (relatedTools.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="related-title" className="mx-auto max-w-7xl pt-14">
      <h2 id="related-title" className="text-xl font-bold text-foreground sm:text-2xl">You may also need</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {relatedTools.map((tool) => (
          <ToolTaskCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
}
