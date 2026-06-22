"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ChevronDown, Download, Search, SlidersHorizontal, X } from "lucide-react";

import { Breadcrumbs } from "@/components/templates/Breadcrumbs";
import type { Asset } from "@/types/asset";
import type { Template } from "@/types/template";

type CollectionKind = "template" | "asset";
type CollectionItem = Template | Asset;
type SortOption = "popular" | "downloads" | "newest" | "oldest" | "az" | "za";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type CollectionPageProps = {
  kind: CollectionKind;
  title: string;
  items: CollectionItem[];
  breadcrumbs: BreadcrumbItem[];
  searchPlaceholder?: string;
};

type FilterSection = {
  id: string;
  title: string;
  options: string[];
};

const pageSize = 20;

const templatePlatformFilters = ["Canva", "PSD", "Illustrator", "Word", "Excel", "Google Docs", "PDF"];
const templateTypeFilters = [
  "Invoice",
  "Receipt",
  "Resume",
  "Certificate",
  "Letterhead",
  "Flyer",
  "Poster",
  "Social Media",
  "Canva",
  "Business Card",
  "Proposal",
  "Banner",
  "GST",
  "Tax",
  "Proforma",
  "Commercial",
  "Sales",
  "Purchase",
  "Retail",
  "Service",
  "Consulting",
  "Freelancer",
  "Hotel",
  "Restaurant",
  "Medical",
  "Construction",
  "Transport",
  "Rental",
  "Utility",
  "Credit",
  "Debit",
  "Recurring",
  "Timesheet",
  "Project",
  "E-commerce",
  "Small Business",
  "VAT",
];

const assetTypeFilters = [
  "Image",
  "Font",
  "Mockup",
  "Illustration",
  "Icon",
  "Logo",
  "SVG",
  "Texture",
  "Background",
  "Pattern",
  "UI Kit",
  "Sticker",
  "Vector",
];
const assetStyleFilters = ["Minimal", "Modern", "Vintage", "Corporate", "Creative"];
const assetFormatFilters = ["PNG", "JPG", "SVG", "AI", "PSD", "TTF", "OTF"];

const templateTypeAliases: Record<string, string[]> = {
  Invoice: ["invoice"],
  Receipt: ["receipt"],
  Resume: ["resume"],
  Certificate: ["certificate"],
  Letterhead: ["letterhead"],
  Flyer: ["flyer"],
  Poster: ["poster"],
  "Social Media": ["social media", "instagram", "facebook"],
  Canva: ["canva"],
  "Business Card": ["business card"],
  Proposal: ["proposal"],
  Banner: ["banner"],
  GST: ["gst"],
  Tax: ["tax", "gst"],
  Proforma: ["proforma"],
  Commercial: ["commercial"],
  Sales: ["sales"],
  Purchase: ["purchase", "wholesale"],
  Retail: ["retail"],
  Service: ["service", "maintenance"],
  Consulting: ["consulting", "consultancy"],
  Freelancer: ["freelancer", "graphic design", "photography"],
  Hotel: ["hotel"],
  Restaurant: ["restaurant"],
  Medical: ["medical"],
  Construction: ["construction", "contractor"],
  Transport: ["taxi", "courier", "travel", "transport"],
  Rental: ["rental", "rent", "car rental"],
  Utility: ["utility", "maintenance"],
  Credit: ["credit"],
  Debit: ["debit"],
  Recurring: ["recurring", "subscription"],
  Timesheet: ["timesheet"],
  Project: ["project", "event", "software"],
  "E-commerce": ["e-commerce", "retail", "sales", "wholesale"],
  "Small Business": ["agency", "contractor", "freelancer", "service"],
  VAT: ["vat", "gst", "tax"],
};

const assetStyleAliases: Record<string, string[]> = {
  Minimal: ["minimal", "simple", "clean"],
  Modern: ["modern", "technology", "startup"],
  Vintage: ["vintage", "retro", "classic"],
  Corporate: ["corporate", "business", "company", "professional"],
  Creative: ["creative", "design", "brand", "starter"],
};

function isTemplate(item: CollectionItem): item is Template {
  return "formats" in item;
}

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function templatePlatforms(template: Template) {
  return template.formats.map((format) => {
    if (format === "Word") return "Word";
    return format;
  });
}

function templatePlatformLabel(template: Template) {
  const platform = templatePlatforms(template)[0] ?? "PDF";
  return platform === "Word" ? "MS Word" : platform;
}

function assetTypeLabel(asset: Asset) {
  const category = asset.category.toUpperCase();
  if (category === "LOGO") return "Logo";
  if (category === "ICON") return "Icon";
  return asset.category
    .toLowerCase()
    .replace(/(^|\s)\S/g, (match) => match.toUpperCase());
}

function assetDownloadUrl(asset: Asset) {
  return asset.downloadUrl ?? asset.files?.[0]?.url ?? asset.previewImage;
}

function getTemplateTypes(template: Template) {
  const haystack = `${template.title} ${template.slug} ${template.description} ${template.category}`.toLowerCase();
  const matches = templateTypeFilters.filter((type) =>
    templateTypeAliases[type]?.some((alias) => haystack.includes(alias)),
  );

  return matches.length > 0 ? matches : [template.category];
}

function getAssetTypes(asset: Asset) {
  const category = assetTypeLabel(asset);
  const haystack = `${asset.title} ${asset.slug} ${asset.description} ${asset.category}`.toLowerCase();
  const matches = assetTypeFilters.filter((type) => haystack.includes(type.toLowerCase()));

  return Array.from(new Set([category, ...matches]));
}

function getAssetStyles(asset: Asset) {
  const haystack = `${asset.title} ${asset.slug} ${asset.description}`.toLowerCase();
  return assetStyleFilters.filter((style) =>
    assetStyleAliases[style]?.some((alias) => haystack.includes(alias)),
  );
}

function getAssetFormats(asset: Asset) {
  const formats = new Set<string>();

  asset.files?.forEach((file) => {
    formats.add(file.type.toUpperCase());
  });

  if (asset.downloadUrl) {
    const extension = asset.downloadUrl.split(".").pop()?.toUpperCase();
    if (extension) formats.add(extension);
  }

  return Array.from(formats);
}

function itemSearchText(item: CollectionItem) {
  return `${item.title} ${item.slug} ${item.description}`.toLowerCase();
}

function itemHref(item: CollectionItem, kind: CollectionKind) {
  return kind === "template" ? `/templates/${item.slug}` : `/assets/${item.slug}`;
}

function itemDownloadUrl(item: CollectionItem) {
  return isTemplate(item) ? item.downloadPath : assetDownloadUrl(item);
}

function itemBadge(item: CollectionItem) {
  return isTemplate(item) ? templatePlatformLabel(item) : assetTypeLabel(item);
}

function itemSortValue(item: CollectionItem) {
  return isTemplate(item) ? item.downloads : 0;
}

function sortItems(items: CollectionItem[], sort: SortOption, source: CollectionItem[]) {
  return [...items].sort((a, b) => {
    if (sort === "az") return a.title.localeCompare(b.title);
    if (sort === "za") return b.title.localeCompare(a.title);
    if (sort === "oldest") return source.indexOf(a) - source.indexOf(b);
    if (sort === "newest") return source.indexOf(b) - source.indexOf(a);
    return itemSortValue(b) - itemSortValue(a);
  });
}

function filterSections(kind: CollectionKind): FilterSection[] {
  if (kind === "template") {
    return [
      { id: "platform", title: "Platform", options: templatePlatformFilters },
      { id: "templateType", title: "Template Type", options: templateTypeFilters },
    ];
  }

  return [
    { id: "resourceType", title: "Resource Type", options: assetTypeFilters },
    { id: "style", title: "Style", options: assetStyleFilters },
    { id: "format", title: "Format", options: assetFormatFilters },
  ];
}

function getSectionValues(item: CollectionItem, sectionId: string) {
  if (isTemplate(item)) {
    if (sectionId === "platform") return templatePlatforms(item);
    if (sectionId === "templateType") return getTemplateTypes(item);
    return [];
  }

  if (sectionId === "resourceType") return getAssetTypes(item);
  if (sectionId === "style") return getAssetStyles(item);
  if (sectionId === "format") return getAssetFormats(item);
  return [];
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

function CollectionCard({ item, kind }: { item: CollectionItem; kind: CollectionKind }) {
  const href = itemHref(item, kind);
  const thumbnailClass =
    kind === "template"
      ? "aspect-[1/1.414] object-cover"
      : "aspect-square object-cover";

  return (
    <article className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:border-primary/45 hover:shadow-md dark:hover:border-primary/50">
      <Link href={href} className="absolute inset-0 z-10" aria-label={`Preview ${item.title}`} />

      <div className="overflow-hidden bg-slate-50 p-1.5 dark:bg-[#111111]">
        <Image
          src={item.thumbnail}
          alt={`${item.title} thumbnail`}
          width={420}
          height={kind === "template" ? 594 : 420}
          className={`${thumbnailClass} h-auto w-full rounded-sm shadow-sm transition-transform duration-200 group-hover:scale-[1.02]`}
        />
      </div>

      <div className="flex flex-1 flex-col p-2">
        <h3 className="line-clamp-2 min-h-9 text-sm font-semibold leading-[18px] text-foreground">
          {item.title}
        </h3>

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-bold text-primary">
            {itemBadge(item)}
          </span>
          <a
            href={itemDownloadUrl(item)}
            download
            className="relative z-20 inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Download
          </a>
        </div>
      </div>
    </article>
  );
}

export function CollectionPage({
  kind,
  title,
  items,
  breadcrumbs,
  searchPlaceholder,
}: CollectionPageProps) {
  const [query, setQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [filterSearch, setFilterSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState<SortOption>("popular");
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const filtersRef = useRef<HTMLDivElement>(null);

  const sections = useMemo(() => filterSections(kind), [kind]);
  const activeFilterCount = Object.values(selectedFilters).reduce((total, values) => total + values.length, 0);
  const normalizedFilterSearch = filterSearch.trim().toLowerCase();

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = items.filter((item) => {
      const matchesQuery = !normalizedQuery || itemSearchText(item).includes(normalizedQuery);
      const matchesFilters = sections.every((section) => {
        const selected = selectedFilters[section.id] ?? [];
        if (selected.length === 0) return true;
        const values = getSectionValues(item, section.id);
        return selected.some((value) => values.includes(value));
      });

      return matchesQuery && matchesFilters;
    });

    return sortItems(filtered, sort, items);
  }, [items, query, sections, selectedFilters, sort]);

  const visibleItems = filteredItems.slice(0, visibleCount);

  function resetVisibleCount() {
    setVisibleCount(pageSize);
  }

  function clearFilters() {
    setSelectedFilters({});
    resetVisibleCount();
  }

  function toggleFilter(sectionId: string, value: string) {
    setSelectedFilters((current) => ({
      ...current,
      [sectionId]: toggleValue(current[sectionId] ?? [], value),
    }));
    resetVisibleCount();
  }

  function removeFilter(sectionId: string, value: string) {
    setSelectedFilters((current) => ({
      ...current,
      [sectionId]: (current[sectionId] ?? []).filter((item) => item !== value),
    }));
    resetVisibleCount();
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
      if (event.key === "Escape") {
        setFiltersOpen(false);
      }
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
          <p className="text-sm font-semibold text-foreground">
            {filteredItems.length.toLocaleString()} {kind === "template" ? "Templates" : "Assets"} Found
          </p>
        </div>

        <div className="mt-1.5 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:max-w-3xl">
            <label className="relative block min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <span className="sr-only">Search {title.toLowerCase()}</span>
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  resetVisibleCount();
                }}
                placeholder={searchPlaceholder ?? `Search ${title.toLowerCase()}...`}
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

                      <div className={`mt-4 grid gap-5 ${sections.length > 2 ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
                        {sections.map((section) => {
                          const selected = selectedFilters[section.id] ?? [];
                          const visibleOptions = section.options.filter((option) =>
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
                                  onClick={() => {
                                    setSelectedFilters((current) => ({ ...current, [section.id]: [] }));
                                    resetVisibleCount();
                                  }}
                                  className="text-xs font-semibold text-primary transition-colors duration-200 hover:text-primary/80"
                                >
                                  Clear
                                </button>
                              </div>
                              <div className="flex max-h-56 flex-wrap gap-2 overflow-auto pr-1">
                                {visibleOptions.map((option) => (
                                  <FilterChip
                                    key={option}
                                    label={option}
                                    active={selected.includes(option)}
                                    onClick={() => toggleFilter(section.id, option)}
                                  />
                                ))}
                                {visibleOptions.length === 0 ? (
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
                          {filteredItems.length.toLocaleString()} Results Found
                        </span>
                        <button
                          type="button"
                          onClick={() => setFiltersOpen(false)}
                          className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
                        >
                          Apply Filters ({filteredItems.length.toLocaleString()} Results)
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <label className="relative">
                <span className="sr-only">Sort {title.toLowerCase()}</span>
                <select
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value as SortOption);
                    resetVisibleCount();
                  }}
                  className="h-9 rounded-lg border border-input bg-card px-3 pr-8 text-sm font-semibold text-foreground outline-none transition-[border-color,box-shadow] duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="popular">Most Popular</option>
                  <option value="downloads">Most Downloaded</option>
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
          {sections.flatMap((section) =>
            (selectedFilters[section.id] ?? []).map((value) => (
              <ActiveFilterChip
                key={`${section.id}-${value}`}
                label={value}
                onRemove={() => removeFilter(section.id, value)}
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

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {visibleItems.map((item) => (
          <CollectionCard key={item.id} item={item} kind={kind} />
        ))}
      </div>

      {visibleItems.length === 0 ? (
        <div className="mt-8 rounded-lg border border-border bg-card px-4 py-10 text-center">
          <p className="text-sm font-semibold text-foreground">No results found</p>
          <p className="mt-2 text-sm text-muted-foreground">Try a different search or clear filters.</p>
        </div>
      ) : null}

      {visibleItems.length < filteredItems.length ? (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((current) => current + pageSize)}
            className="h-11 rounded-lg border border-border bg-card px-5 text-sm font-semibold text-foreground shadow-sm transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted"
          >
            Load More {kind === "template" ? "Templates" : "Assets"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
