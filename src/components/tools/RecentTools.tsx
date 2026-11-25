"use client";

import { useSyncExternalStore } from "react";

import { ToolTaskCard } from "@/components/cards/ItemCard";
import { readRecent } from "@/lib/recent";
import { getToolBySlug } from "@/lib/tools";

const subscribe = () => () => undefined;

/** A shortcut back to what this visitor used before. */
export function RecentTools() {
  const saved = useSyncExternalStore(subscribe, () => readRecent().join(","), () => "");
  const recent = saved.split(",").flatMap((slug) => getToolBySlug(slug) ?? []).slice(0, 3);
  if (recent.length === 0) return null;

  return (
    <section aria-labelledby="recent-title">
      <h2 id="recent-title" className="text-xl font-bold text-foreground sm:text-2xl">Continue where you left off</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {recent.map((tool) => (
          <ToolTaskCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
}
