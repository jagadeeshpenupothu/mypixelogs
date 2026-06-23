"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Archive,
  Check,
  ChevronDown,
  Crop,
  FileImage,
  FileText,
  Files,
  Search,
  SlidersHorizontal,
  SplitSquareHorizontal,
  Wrench,
  X,
} from "lucide-react";

import { Breadcrumbs } from "@/components/templates/Breadcrumbs";
import type { Tool } from "@/types/tool";

type ToolCategoryMarketplaceProps = {
  title: string;
  categorySlug: string;
  tools: Tool[];
};

type SortOption = "popular" | "newest" | "oldest" | "az" | "za";

const toolTypeOptions = [
  "Convert",
  "Compress",
  "Merge",
  "Split",
  "Extract",
  "Edit",
];
const statusOptions = ["Available", "Coming Soon"];

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function toolTypes(tool: Tool) {
  const haystack =
    `${tool.name} ${tool.slug} ${tool.description} ${tool.tags.join(" ")}`.toLowerCase();
  const matches = toolTypeOptions.filter((type) =>
    haystack.includes(type.toLowerCase()),
  );

  if (
    haystack.includes("rotate") ||
    haystack.includes("crop") ||
    haystack.includes("resize")
  ) {
    matches.push("Edit");
  }

  return Array.from(new Set(matches.length > 0 ? matches : ["Edit"]));
}

function toolStatus(tool: Tool) {
  return tool.comingSoon ? "Coming Soon" : "Available";
}

function toolHref(tool: Tool, categorySlug: string) {
  return tool.comingSoon ? `/tools/${categorySlug}` : `/tools/${tool.slug}`;
}

const previewIcons = {
  Archive,
  Crop,
  FileImage,
  FileText,
  Files,
  SplitSquareHorizontal,
  Wrench,
};

function previewIconKey(tool: Tool): keyof typeof previewIcons {
  const types = toolTypes(tool);
  const haystack = `${tool.name} ${tool.slug}`.toLowerCase();

  if (types.includes("Compress")) return "Archive";
  if (types.includes("Split")) return "SplitSquareHorizontal";
  if (types.includes("Merge")) return "Files";
  if (types.includes("Extract")) return "FileText";
  if (haystack.includes("jpg") || haystack.includes("image"))
    return "FileImage";
  if (haystack.includes("rotate") || haystack.includes("crop")) return "Crop";
  return "Wrench";
}

function sortTools(items: Tool[], sort: SortOption, source: Tool[]) {
  return [...items].sort((a, b) => {
    if (sort === "az") return a.name.localeCompare(b.name);
    if (sort === "za") return b.name.localeCompare(a.name);
    if (sort === "oldest") return source.indexOf(a) - source.indexOf(b);
    if (sort === "newest") return source.indexOf(b) - source.indexOf(a);
    return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
  });
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors duration-200"
          : "rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors duration-200 hover:border-foreground/20 hover:text-foreground"
      }
    >
      {active ? <Check className="h-3 w-3" aria-hidden="true" /> : null}
      {label}
    </button>
  );
}

function ActiveFilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-primary transition-colors duration-200 hover:border-primary/40 dark:bg-white/[0.06]"
    >
      {label}
      <X className="h-3 w-3" aria-hidden="true" />
    </button>
  );
}

function ToolMarketplaceCard({
  tool,
  categorySlug,
}: {
  tool: Tool;
  categorySlug: string;
}) {
  const iconKey = previewIconKey(tool);
  const Icon = previewIcons[iconKey];

  return (
    <Link
      href={toolHref(tool, categorySlug)}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:border-primary/45 hover:shadow-md dark:hover:border-primary/50"
    >
      <div className="overflow-hidden bg-slate-50 p-1.5 dark:bg-[#111111]">
        <div className="relative aspect-[5/4] overflow-hidden rounded-sm border border-border bg-background">
          {tool.image ? (
            <Image
              src={tool.image}
              alt={`${tool.name} preview`}
              fill
              sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 50vw"
              className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Icon className="h-10 w-10 text-primary" aria-hidden="true" />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-2.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-[18px] text-foreground">
          {tool.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
          {tool.description}
        </p>
      </div>
    </Link>
  );
}

export function ToolCategoryMarketplace({
  title,
  categorySlug,
  tools,
}: ToolCategoryMarketplaceProps) {
  const [query, setQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [filterSearch, setFilterSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState<SortOption>("popular");
  const filtersRef = useRef<HTMLDivElement>(null);

  const activeFilterCount = selectedStatuses.length + selectedTypes.length;
  const normalizedFilterSearch = filterSearch.trim().toLowerCase();
  const visibleStatuses = statusOptions.filter((status) =>
    status.toLowerCase().includes(normalizedFilterSearch),
  );
  const visibleTypes = toolTypeOptions.filter((type) =>
    type.toLowerCase().includes(normalizedFilterSearch),
  );

  const filteredTools = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = tools.filter((tool) => {
      const searchText =
        `${tool.name} ${tool.slug} ${tool.description} ${tool.tags.join(" ")}`.toLowerCase();
      const matchesQuery =
        !normalizedQuery || searchText.includes(normalizedQuery);
      const matchesStatus =
        selectedStatuses.length === 0 ||
        selectedStatuses.includes(toolStatus(tool));
      const types = toolTypes(tool);
      const matchesType =
        selectedTypes.length === 0 ||
        selectedTypes.some((type) => types.includes(type));

      return matchesQuery && matchesStatus && matchesType;
    });

    return sortTools(filtered, sort, tools);
  }, [query, selectedStatuses, selectedTypes, sort, tools]);

  function clearFilters() {
    setSelectedStatuses([]);
    setSelectedTypes([]);
  }

  useEffect(() => {
    if (!filtersOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        filtersRef.current &&
        event.target instanceof Node &&
        !filtersRef.current.contains(event.target)
      ) {
        setFiltersOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setFiltersOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [filtersOpen]);

  return (
    <div>
      <div className="sticky top-16 z-30 -mx-4 border-b border-border bg-white/95 px-4 py-2 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 dark:bg-black/90">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Tools", href: "/tools" },
              { label: title },
            ]}
          />
          <p className="text-sm font-semibold text-foreground">
            {filteredTools.length.toLocaleString()} Tools
          </p>
        </div>

        <div className="mt-1.5 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {title}
          </h1>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:max-w-3xl">
            <label className="relative block min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <span className="sr-only">Search {title.toLowerCase()}</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${title.toLowerCase()}...`}
                className="h-9 w-full rounded-lg border border-input bg-card pl-10 pr-3 text-sm font-medium text-foreground outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground/80 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>

            <div className="flex shrink-0 gap-2">
              <div className="relative" ref={filtersRef}>
                <button
                  type="button"
                  onClick={() => {
                    setFilterSearch("");
                    setFiltersOpen((current) => !current);
                  }}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-muted"
                  aria-expanded={filtersOpen}
                >
                  <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                  Filters
                  {activeFilterCount > 0 ? (
                    <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                      {activeFilterCount}
                    </span>
                  ) : null}
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                      filtersOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {filtersOpen ? (
                  <div className="absolute right-0 z-40 mt-2 w-[min(720px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-card shadow-soft">
                    <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
                      <div>
                        <h2 className="text-sm font-bold text-foreground">
                          Filters
                          {activeFilterCount > 0
                            ? ` (${activeFilterCount} selected)`
                            : ""}
                        </h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Refine {title.toLowerCase()}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="text-sm font-semibold text-primary transition-colors duration-200 hover:text-primary/80"
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="p-4">
                      <label className="relative block">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <span className="sr-only">Search filters</span>
                        <input
                          value={filterSearch}
                          onChange={(event) =>
                            setFilterSearch(event.target.value)
                          }
                          placeholder="Search filters..."
                          className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm font-medium text-foreground outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground/80 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </label>

                      <div className="mt-4 grid gap-5 lg:grid-cols-2">
                        <div className="rounded-lg border border-border bg-background p-3">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <p className="text-sm font-bold text-foreground">
                              Tool Status{" "}
                              <span className="font-semibold text-muted-foreground">
                                ({selectedStatuses.length})
                              </span>
                            </p>
                            <button
                              type="button"
                              onClick={() => setSelectedStatuses([])}
                              className="text-xs font-semibold text-primary transition-colors duration-200 hover:text-primary/80"
                            >
                              Clear
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {visibleStatuses.map((status) => (
                              <FilterChip
                                key={status}
                                label={status}
                                active={selectedStatuses.includes(status)}
                                onClick={() =>
                                  setSelectedStatuses((current) =>
                                    toggleValue(current, status),
                                  )
                                }
                              />
                            ))}
                          </div>
                        </div>

                        <div className="rounded-lg border border-border bg-background p-3">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <p className="text-sm font-bold text-foreground">
                              Tool Type{" "}
                              <span className="font-semibold text-muted-foreground">
                                ({selectedTypes.length})
                              </span>
                            </p>
                            <button
                              type="button"
                              onClick={() => setSelectedTypes([])}
                              className="text-xs font-semibold text-primary transition-colors duration-200 hover:text-primary/80"
                            >
                              Clear
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {visibleTypes.map((type) => (
                              <FilterChip
                                key={type}
                                label={type}
                                active={selectedTypes.includes(type)}
                                onClick={() =>
                                  setSelectedTypes((current) =>
                                    toggleValue(current, type),
                                  )
                                }
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-border bg-muted/35 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="h-10 rounded-lg border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-muted"
                      >
                        Clear All
                      </button>
                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <span className="text-sm font-semibold text-muted-foreground">
                          {filteredTools.length.toLocaleString()} Results Found
                        </span>
                        <button
                          type="button"
                          onClick={() => setFiltersOpen(false)}
                          className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
                        >
                          Apply Filters ({filteredTools.length.toLocaleString()}{" "}
                          Results)
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <label>
                <span className="sr-only">Sort {title.toLowerCase()}</span>
                <select
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value as SortOption)
                  }
                  className="h-9 rounded-lg border border-input bg-card px-3 pr-8 text-sm font-semibold text-foreground outline-none transition-[border-color,box-shadow] duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="az">A-Z</option>
                  <option value="za">Z-A</option>
                </select>
              </label>
            </div>
          </div>
        </div>
      </div>

      {activeFilterCount > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedStatuses.map((status) => (
            <ActiveFilterChip
              key={status}
              label={status}
              onRemove={() =>
                setSelectedStatuses((current) =>
                  current.filter((item) => item !== status),
                )
              }
            />
          ))}
          {selectedTypes.map((type) => (
            <ActiveFilterChip
              key={type}
              label={type}
              onRemove={() =>
                setSelectedTypes((current) =>
                  current.filter((item) => item !== type),
                )
              }
            />
          ))}
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-full px-2.5 py-1 text-xs font-semibold text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            Clear all
          </button>
        </div>
      ) : null}

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {filteredTools.map((tool) => (
          <ToolMarketplaceCard
            key={tool.id}
            tool={tool}
            categorySlug={categorySlug}
          />
        ))}
      </div>

      {filteredTools.length === 0 ? (
        <div className="mt-8 rounded-lg border border-border bg-card px-4 py-10 text-center">
          <p className="text-sm font-semibold text-foreground">
            No tools found
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try a different search or clear filters.
          </p>
        </div>
      ) : null}
    </div>
  );
}
