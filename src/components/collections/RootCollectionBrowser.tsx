"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calculator,
  Check,
  ChevronDown,
  Download,
  FileText,
  FolderOpen,
  Search,
  SlidersHorizontal,
  Wrench,
  X,
} from "lucide-react";

import { Breadcrumbs } from "@/components/templates/Breadcrumbs";

type RootCollectionKind = "template" | "tool" | "asset";

export type RootCollectionItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  badge: string;
  thumbnail?: string;
  downloadUrl?: string;
  comingSoon?: boolean;
  filters: Record<string, string[]>;
  searchText: string;
};

export type RootCollectionSection = {
  id: string;
  title: string;
  href: string;
  items: RootCollectionItem[];
};

export type RootFilterSection = {
  id: string;
  title: string;
  options: string[];
};

type RootCollectionBrowserProps = {
  kind: RootCollectionKind;
  title: string;
  totalLabel: string;
  searchPlaceholder: string;
  breadcrumbs: { label: string; href?: string }[];
  sections: RootCollectionSection[];
  filterSections: RootFilterSection[];
};

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
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

function ActiveFilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
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

function MarketplaceMiniCard({
  item,
  kind,
}: {
  item: RootCollectionItem;
  kind: RootCollectionKind;
}) {
  if (kind === "tool") {
    const Icon = item.badge.toLowerCase().includes("calculator")
      ? Calculator
      : item.badge.toLowerCase().includes("pdf")
        ? FileText
        : Wrench;

    const content = (
      <>
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-primary dark:bg-white/[0.06]">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="mt-3 min-w-0">
          <h3 className="line-clamp-2 text-sm font-semibold leading-[18px] text-foreground">
            {item.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{item.description}</p>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-bold text-primary">
            {item.badge}
          </span>
          {item.comingSoon ? (
            <span className="rounded-md border border-border bg-muted px-2 py-1 text-[11px] font-bold text-muted-foreground">
              Soon
            </span>
          ) : null}
        </div>
      </>
    );

    if (item.comingSoon) {
      return (
        <article className="group h-full rounded-lg border border-border bg-card p-3 opacity-80 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:border-primary/35 hover:shadow-md">
          {content}
        </article>
      );
    }

    return (
      <Link
        href={item.href}
        className="group block h-full rounded-lg border border-border bg-card p-3 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:border-primary/45 hover:shadow-md"
      >
        {content}
      </Link>
    );
  }

  const aspectClass = kind === "template" ? "aspect-[1/1.414]" : "aspect-square";

  return (
    <article className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:border-primary/45 hover:shadow-md dark:hover:border-primary/50">
      <Link href={item.href} className="absolute inset-0 z-10" aria-label={`Preview ${item.title}`} />
      <div className="overflow-hidden bg-slate-50 p-1.5 dark:bg-[#111111]">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt={`${item.title} thumbnail`}
            width={420}
            height={kind === "template" ? 594 : 420}
            className={`${aspectClass} h-auto w-full rounded-sm object-cover shadow-sm transition-transform duration-200 group-hover:scale-[1.02]`}
          />
        ) : (
          <div className={`${aspectClass} flex w-full items-center justify-center rounded-sm bg-muted`}>
            <FolderOpen className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-2">
        <h3 className="line-clamp-2 min-h-9 text-sm font-semibold leading-[18px] text-foreground">
          {item.title}
        </h3>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-bold text-primary">
            {item.badge}
          </span>
          {item.downloadUrl ? (
            <a
              href={item.downloadUrl}
              download
              className="relative z-20 inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Download
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function SeeMoreCard({
  href,
  count,
  label,
}: {
  href: string;
  count: number;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-full flex-col justify-center rounded-lg border border-primary/25 bg-blue-50/70 p-4 text-primary shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md dark:bg-white/[0.06]"
    >
      <p className="text-2xl font-bold">+{Math.max(count, 0)}</p>
      <p className="mt-1 text-sm font-semibold">{label}</p>
      <span className="mt-4 text-sm font-bold transition-transform duration-200 group-hover:translate-x-1">
        View All →
      </span>
    </Link>
  );
}

export function RootCollectionBrowser({
  kind,
  title,
  totalLabel,
  searchPlaceholder,
  breadcrumbs,
  sections,
  filterSections,
}: RootCollectionBrowserProps) {
  const [query, setQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [filterSearch, setFilterSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);

  const activeFilterCount = Object.values(selectedFilters).reduce((total, values) => total + values.length, 0);
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedFilterSearch = filterSearch.trim().toLowerCase();

  const filteredSections = useMemo(
    () =>
      sections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => {
            const matchesQuery = !normalizedQuery || item.searchText.includes(normalizedQuery);
            const matchesFilters = filterSections.every((filterSection) => {
              const selected = selectedFilters[filterSection.id] ?? [];
              if (selected.length === 0) return true;
              const values = item.filters[filterSection.id] ?? [];
              return selected.some((value) => values.includes(value));
            });

            return matchesQuery && matchesFilters;
          }),
        }))
        .filter((section) => section.items.length > 0),
    [filterSections, normalizedQuery, sections, selectedFilters],
  );

  const visibleCount = filteredSections.reduce((total, section) => total + section.items.length, 0);

  function clearFilters() {
    setSelectedFilters({});
  }

  function toggleFilter(sectionId: string, value: string) {
    setSelectedFilters((current) => ({
      ...current,
      [sectionId]: toggleValue(current[sectionId] ?? [], value),
    }));
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
          <Breadcrumbs items={breadcrumbs} />
          <p className="text-sm font-semibold text-foreground">{totalLabel}</p>
        </div>

        <div className="mt-1.5 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:max-w-3xl">
            <label className="relative block min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <span className="sr-only">Search {title.toLowerCase()}</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 w-full rounded-lg border border-input bg-card pl-10 pr-3 text-sm font-medium text-foreground outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground/80 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>

            <div className="relative shrink-0" ref={filtersRef}>
              <button
                type="button"
                onClick={() => {
                  setFilterSearch("");
                  setFiltersOpen((current) => !current);
                }}
                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-muted sm:w-auto"
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
                <div className="absolute right-0 z-40 mt-2 w-[min(900px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-card shadow-soft">
                  <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
                    <div>
                      <h2 className="text-sm font-bold text-foreground">
                        Filters{activeFilterCount > 0 ? ` (${activeFilterCount} selected)` : ""}
                      </h2>
                      <p className="mt-0.5 text-xs text-muted-foreground">Refine {title.toLowerCase()}</p>
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
                        onChange={(event) => setFilterSearch(event.target.value)}
                        placeholder="Search filters..."
                        className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm font-medium text-foreground outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground/80 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </label>

                    <div className={`mt-4 grid gap-5 ${filterSections.length > 2 ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
                      {filterSections.map((section) => {
                        const selected = selectedFilters[section.id] ?? [];
                        const options = section.options.filter((option) =>
                          option.toLowerCase().includes(normalizedFilterSearch),
                        );

                        return (
                          <div key={section.id} className="rounded-lg border border-border bg-background p-3">
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <p className="text-sm font-bold text-foreground">
                                {section.title}{" "}
                                <span className="font-semibold text-muted-foreground">({selected.length})</span>
                              </p>
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedFilters((current) => ({ ...current, [section.id]: [] }))
                                }
                                className="text-xs font-semibold text-primary transition-colors duration-200 hover:text-primary/80"
                              >
                                Clear
                              </button>
                            </div>
                            <div className="flex max-h-56 flex-wrap gap-2 overflow-auto pr-1">
                              {options.map((option) => (
                                <FilterChip
                                  key={option}
                                  label={option}
                                  active={selected.includes(option)}
                                  onClick={() => toggleFilter(section.id, option)}
                                />
                              ))}
                              {options.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No filters found.</p>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
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
                        {visibleCount.toLocaleString()} Results Found
                      </span>
                      <button
                        type="button"
                        onClick={() => setFiltersOpen(false)}
                        className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {activeFilterCount > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {filterSections.flatMap((section) =>
            (selectedFilters[section.id] ?? []).map((value) => (
              <ActiveFilterChip
                key={`${section.id}-${value}`}
                label={value}
                onRemove={() =>
                  setSelectedFilters((current) => ({
                    ...current,
                    [section.id]: (current[section.id] ?? []).filter((item) => item !== value),
                  }))
                }
              />
            )),
          )}
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-full px-2.5 py-1 text-xs font-semibold text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            Clear all
          </button>
        </div>
      ) : null}

      <div className="mt-3 space-y-8">
        {filteredSections.map((section) => {
          const previewItems = section.items.slice(0, 4);

          return (
            <section key={section.id} className="scroll-mt-28">
              <div className="mb-3 flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-foreground">{section.title}</h2>
                <Link
                  href={section.href}
                  className="text-sm font-semibold text-primary transition-colors duration-200 hover:text-primary/80"
                >
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
                {previewItems.map((item) => (
                  <MarketplaceMiniCard key={item.id} item={item} kind={kind} />
                ))}
                <SeeMoreCard
                  href={section.href}
                  count={section.items.length - previewItems.length}
                  label={kind === "tool" ? "More Tools" : kind === "asset" ? "More Assets" : "More Templates"}
                />
              </div>
            </section>
          );
        })}
      </div>

      {filteredSections.length === 0 ? (
        <div className="mt-8 rounded-lg border border-border bg-card px-4 py-10 text-center">
          <p className="text-sm font-semibold text-foreground">No results found</p>
          <p className="mt-2 text-sm text-muted-foreground">Try a different search or clear filters.</p>
        </div>
      ) : null}
    </div>
  );
}
