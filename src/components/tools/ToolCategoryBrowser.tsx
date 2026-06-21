"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { ToolCard } from "@/components/cards/ToolCard";
import type { Tool } from "@/types/tool";

type ToolCategoryBrowserProps = {
  tools: Tool[];
};

export function ToolCategoryBrowser({ tools }: ToolCategoryBrowserProps) {
  const [query, setQuery] = useState("");

  const filteredTools = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const sortedTools = [...tools].sort((firstTool, secondTool) => {
      if (firstTool.featured === secondTool.featured) {
        return firstTool.name.localeCompare(secondTool.name);
      }

      return firstTool.featured ? -1 : 1;
    });

    if (!normalizedQuery) return sortedTools;

    return sortedTools.filter((tool) =>
      [tool.name, tool.slug, tool.description, tool.subcategory, ...tool.tags]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [query, tools]);

  return (
    <section aria-labelledby="category-tools-heading" className="mt-12">
      <div className="flex flex-col justify-between gap-4 rounded-lg border border-border bg-card p-5 shadow-sm lg:flex-row lg:items-center">
        <div>
          <h2 id="category-tools-heading" className="text-2xl font-bold text-foreground">
            Tools in this category
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Search within this category or browse featured tools first.
          </p>
        </div>

        <label className="relative block w-full lg:w-80">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="sr-only">Search category tools</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tools..."
            className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm text-foreground outline-none transition-[color,background-color,border-color,box-shadow] duration-200 placeholder:text-muted-foreground/80 hover:border-foreground/20 focus:border-primary focus:ring-2 focus:ring-primary/25 dark:bg-[#0A0A0A] dark:hover:border-white/20"
          />
        </label>
      </div>

      {filteredTools.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-dashed border-border bg-card p-8 text-center">
          <h3 className="text-lg font-semibold text-foreground">No tools found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try a different search term within this category.
          </p>
        </div>
      )}
    </section>
  );
}
