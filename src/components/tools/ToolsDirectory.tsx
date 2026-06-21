"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { ToolCard } from "@/components/cards/ToolCard";
import { Button } from "@/components/ui/button";
import { toolCategories, tools } from "@/data/tools";
import { isToolInCategory } from "@/lib/tools";
import { cn } from "@/lib/utils";
import type { ToolCategory } from "@/types/tool";

const allCategoriesLabel = "All Categories";

export function ToolsDirectory() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ToolCategory | typeof allCategoriesLabel>(
    allCategoriesLabel,
  );

  const categoryCounts = useMemo(
    () =>
      toolCategories.map((category) => ({
        ...category,
        count: tools.filter((tool) => isToolInCategory(tool, category.name)).length,
        availableCount: tools.filter(
          (tool) => isToolInCategory(tool, category.name) && !tool.comingSoon,
        ).length,
      })),
    [],
  );

  const featuredTools = useMemo(() => tools.filter((tool) => tool.featured), []);

  const filteredTools = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return tools.filter((tool) => {
      const matchesCategory =
        activeCategory === allCategoriesLabel || isToolInCategory(tool, activeCategory);
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [tool.name, tool.slug, tool.description, tool.category, tool.subcategory, ...tool.tags]
          .filter((value): value is string => Boolean(value))
          .some((value) => value.toLowerCase().includes(normalizedQuery));

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  const groupedTools = useMemo(
    () =>
      toolCategories.map((category) => ({
        ...category,
        tools: filteredTools.filter((tool) => isToolInCategory(tool, category.name)),
      })),
    [filteredTools],
  );

  return (
    <div className="space-y-16">
      <section aria-labelledby="tool-categories-heading">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 id="tool-categories-heading" className="text-2xl font-bold text-foreground">
              Browse by category
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Explore focused tool collections built to scale from today&apos;s utilities to a
              complete library of browser-first tools.
            </p>
          </div>
          <p className="text-sm font-semibold text-muted-foreground">
            {tools.length} tools planned, {tools.filter((tool) => !tool.comingSoon).length} live
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categoryCounts.map((category) => (
            <Link
              key={category.name}
              href={`/tools/${category.slug}`}
              className="group rounded-lg border border-border bg-card p-5 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md dark:hover:border-white/20 dark:hover:shadow-soft"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-base font-semibold text-foreground">{category.name}</h3>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                  {category.count}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{category.description}</p>
              <p className="mt-4 text-sm font-semibold text-primary">
                {category.availableCount} available
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="featured-tools-heading">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Featured</p>
            <h2 id="featured-tools-heading" className="mt-2 text-2xl font-bold text-foreground">
              Popular tools
            </h2>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {featuredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      <section aria-labelledby="tools-directory-heading">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 id="tools-directory-heading" className="text-2xl font-bold text-foreground">
                Tool directory
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Search by tool name or filter by category.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <label className="relative block w-full sm:w-80">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="sr-only">Search tools</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search tools..."
                  className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm text-foreground outline-none transition-[color,background-color,border-color,box-shadow] duration-200 placeholder:text-muted-foreground/80 hover:border-foreground/20 focus:border-primary focus:ring-2 focus:ring-primary/25 dark:bg-[#0A0A0A] dark:hover:border-white/20"
                />
              </label>

              <label>
                <span className="sr-only">Filter by category</span>
                <select
                  value={activeCategory}
                  onChange={(event) =>
                    setActiveCategory(event.target.value as ToolCategory | typeof allCategoriesLabel)
                  }
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground outline-none transition-[color,background-color,border-color,box-shadow] duration-200 hover:border-foreground/20 focus:border-primary focus:ring-2 focus:ring-primary/25 dark:bg-[#0A0A0A] dark:hover:border-white/20 sm:w-56"
                >
                  <option>{allCategoriesLabel}</option>
                  {toolCategories.map((category) => (
                    <option key={category.name}>{category.name}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant={activeCategory === allCategoriesLabel ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(allCategoriesLabel)}
            >
              All
            </Button>
            {toolCategories.map((category) => (
              <Button
                key={category.name}
                type="button"
                variant={activeCategory === category.name ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category.name)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-12">
          {groupedTools.map((category) => {
            if (category.tools.length === 0) return null;

            return (
              <section key={category.name} id={category.slug} className="scroll-mt-24">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{category.name}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">
                    {category.tools.length} tools
                  </span>
                </div>
                <div
                  className={cn(
                    "mt-5 grid gap-4 md:grid-cols-2",
                    category.tools.length > 2 && "lg:grid-cols-3",
                  )}
                >
                  {category.tools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {filteredTools.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed border-border bg-card p-8 text-center">
            <h3 className="text-lg font-semibold text-foreground">No tools found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try searching for image, PDF, JSON, calculator, QR, or language tools.
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
