"use client";

import { usePathname } from "next/navigation";

import { ToolCard } from "@/components/cards/ToolCard";
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
    <section className="bg-white pb-14">
      <div className="mx-auto max-w-7xl border-t border-border px-4 pt-10 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Related tools
        </p>
        <h2 className="mt-2 text-2xl font-bold text-foreground">
          More {currentTool.category.toLowerCase()}
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {relatedTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
}
