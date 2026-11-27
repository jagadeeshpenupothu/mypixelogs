"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FileText, Pencil, Play, Search, Sheet, SlidersHorizontal, X } from "lucide-react";

import { Breadcrumbs } from "@/components/templates/Breadcrumbs";
import { matchScore, searchWords } from "@/lib/plain-search";
import { FORMATS, type FormatKey, type GalleryItem } from "@/lib/template-gallery";
import { cn } from "@/lib/utils";

/** A small coloured badge for each way a template can be opened. Colours follow each app's own colour. */
const FORMAT_LOOK: Record<FormatKey, { bg: string; glyph: React.ReactNode }> = {
  editor: { bg: "#475569", glyph: <Pencil className="h-3 w-3" aria-hidden="true" /> },
  word: { bg: "#2B579A", glyph: "W" },
  gdocs: { bg: "#4285F4", glyph: <FileText className="h-3 w-3" aria-hidden="true" /> },
  gsheets: { bg: "#0F9D58", glyph: <Sheet className="h-3 w-3" aria-hidden="true" /> },
  excel: { bg: "#217346", glyph: "X" },
  canva: { bg: "#00A3B4", glyph: "C" },
  latex: { bg: "#3D8B2F", glyph: <span className="text-[7px] tracking-tight">TeX</span> },
  pdf: { bg: "#D93025", glyph: <span className="text-[7px] tracking-tight">PDF</span> },
  video: { bg: "#7C3AED", glyph: <Play className="h-3 w-3" aria-hidden="true" /> },
};
const LABEL = Object.fromEntries(FORMATS.map((f) => [f.key, f.label])) as Record<FormatKey, string>;

export function FormatIcon({ format, size = "sm" }: { format: FormatKey; size?: "sm" | "md" }) {
  const look = FORMAT_LOOK[format];
  return (
    <span
      title={LABEL[format]}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[5px] font-bold leading-none text-[#fff]",
        size === "md" ? "h-6 w-6 text-[11px]" : "h-5 w-5 text-[10px]",
      )}
      style={{ backgroundColor: look.bg }}
    >
      {look.glyph}
      <span className="sr-only">{LABEL[format]}</span>
    </span>
  );
}

type Sort = "newest" | "oldest" | "az";
type Added = "any" | "7" | "30";

const selectClass =
  "h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70";
const chipClass = (on: boolean) =>
  cn(
    "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70",
    on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/60",
  );

function daysSince(date: string, today: number) {
  if (!date) return Infinity;
  return Math.floor((today - Date.parse(`${date}T00:00:00Z`)) / 86_400_000);
}

/** Templates as a full-width, Pinterest-style gallery with search, category, format, date and sort filters. */
export function TemplateGallery({
  items,
  title,
  intro,
  breadcrumbs,
  initialCategory = "all",
  initialFormats = [],
}: {
  items: GalleryItem[];
  title: string;
  intro: string;
  breadcrumbs: { label: string; href?: string }[];
  initialCategory?: string;
  initialFormats?: FormatKey[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [formats, setFormats] = useState<FormatKey[]>(initialFormats);
  const [added, setAdded] = useState<Added>("any");
  const [sort, setSort] = useState<Sort>("newest");
  // "New" badges and date filters use the viewer's today, known only after the page loads.
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the current date exists only in the browser
    setToday(Date.now());
  }, []);

  const categories = useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>();
    for (const item of items) {
      const entry = counts.get(item.category) ?? { label: item.categoryLabel, count: 0 };
      entry.count += 1;
      counts.set(item.category, entry);
    }
    return [...counts.entries()].sort((a, b) => b[1].count - a[1].count);
  }, [items]);

  const availableFormats = useMemo(() => FORMATS.filter((f) => items.some((i) => i.formats.includes(f.key))), [items]);

  const words = searchWords(query);
  const shown = useMemo(() => {
    const list = items.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (formats.length && !formats.every((f) => item.formats.includes(f))) return false;
      if (added !== "any" && today !== null && daysSince(item.published, today) > Number(added)) return false;
      if (words.length && matchScore(words, [item.title, item.categoryLabel, item.description, item.formats.map((f) => LABEL[f]).join(" ")]) <= 0) return false;
      return true;
    });
    return list.sort((a, b) => {
      if (sort === "az") return a.title.localeCompare(b.title);
      const da = a.published || "0000";
      const db = b.published || "0000";
      return sort === "newest" ? db.localeCompare(da) || a.title.localeCompare(b.title) : da.localeCompare(db) || a.title.localeCompare(b.title);
    });
  }, [items, category, formats, added, today, words, sort]);

  const filtered = Boolean(query) || category !== initialCategory || formats.join() !== initialFormats.join() || added !== "any";
  const clear = () => {
    setQuery("");
    setCategory(initialCategory);
    setFormats(initialFormats);
    setAdded("any");
  };
  const toggleFormat = (key: FormatKey) =>
    setFormats((current) => (current.includes(key) ? current.filter((f) => f !== key) : [...current, key]));

  return (
    <section className="pb-2">
      <Breadcrumbs items={breadcrumbs} />
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">{intro}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 grid gap-3 rounded-xl border border-border bg-card/60 p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-0 flex-1 basis-64">
            <span className="sr-only">Search templates</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, like invoice, resume or GST"
              className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </label>
          <div className="flex w-full gap-2 sm:w-auto">
          <label className="flex min-w-0 flex-1 items-center gap-2 text-sm text-muted-foreground sm:flex-none">
            
            <select aria-label="Added" className={cn(selectClass, "w-full sm:w-auto")} value={added} onChange={(e) => setAdded(e.target.value as Added)}>
              <option value="any">Added: any time</option>
              <option value="7">Added: last 7 days</option>
              <option value="30">Added: last 30 days</option>
            </select>
          </label>
          <label className="flex min-w-0 flex-1 items-center gap-2 text-sm text-muted-foreground sm:flex-none">
            <span className="sr-only sm:not-sr-only">Sort</span>
            <select aria-label="Sort" className={cn(selectClass, "w-full sm:w-auto")} value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="az">Name A–Z</option>
            </select>
          </label>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Category">
          <button type="button" className={chipClass(category === "all")} aria-pressed={category === "all"} onClick={() => setCategory("all")}>
            All <span className="opacity-70">{items.length}</span>
          </button>
          {categories.map(([slug, { label, count }]) => (
            <button key={slug} type="button" className={chipClass(category === slug)} aria-pressed={category === slug} onClick={() => setCategory(slug)}>
              {label} <span className="opacity-70">{count}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible" role="group" aria-label="Opens in">
          <span className="inline-flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> Opens in
          </span>
          {availableFormats.map(({ key, label }) => (
            <button key={key} type="button" className={chipClass(formats.includes(key))} aria-pressed={formats.includes(key)} onClick={() => toggleFormat(key)}>
              <FormatIcon format={key} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <p role="status">
          {shown.length} of {items.length} templates
        </p>
        {filtered ? (
          <button type="button" onClick={clear} className="font-semibold text-primary hover:underline">
            Clear filters
          </button>
        ) : null}
      </div>

      {/* Card grid: as many columns as fit (two on phones), up to six, filled left to right so sorting reads naturally. */}
      {shown.length ? (
        <div className="mt-4 grid items-start gap-x-3 gap-y-6 [grid-template-columns:repeat(auto-fill,minmax(max(150px,calc((100%-5*0.75rem)/6)),1fr))] sm:gap-x-5 sm:gap-y-8 sm:[grid-template-columns:repeat(auto-fill,minmax(max(230px,calc((100%-5*1rem)/6)),1fr))]">
          {shown.map((item) => {
            const isNew = today !== null && daysSince(item.published, today) <= 7;
            return (
              <Link
                key={item.slug}
                href={`/templates/${item.slug}`}
                className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {/* Pinterest style: the picture is the card; name and icons sit underneath with no box. */}
                <span className="relative block overflow-hidden rounded-xl bg-white ring-1 ring-border/70">
                  <Image
                    src={item.image}
                    alt={`${item.title} preview`}
                    width={item.width}
                    height={item.height}
                    sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 18vw"
                    className="h-auto w-full transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/10" />
                </span>
                <span className="block px-1 pt-2">
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold leading-5 text-foreground group-hover:underline">{item.title}</span>
                    {isNew ? <span className="mt-0.5 shrink-0 rounded-full bg-primary/15 px-2 py-px text-[11px] font-semibold text-primary">New</span> : null}
                  </span>
                  <span className="mt-1.5 flex flex-wrap gap-1">
                    {item.formats.map((f) => (
                      <FormatIcon key={f} format={f} />
                    ))}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-base font-semibold text-foreground">No templates match these filters.</p>
          <button type="button" onClick={clear} className="mt-2 text-sm font-semibold text-primary hover:underline">
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
}
