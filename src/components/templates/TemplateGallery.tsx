"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FileText, Pencil, Play, Search, Sheet, X } from "lucide-react";

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
  psd: { bg: "#001E36", glyph: <span className="text-[9px] text-[#31A8FF]">Ps</span> },
  photopea: { bg: "#18A497", glyph: <span className="text-[9px]">Pp</span> },
  ai: { bg: "#330000", glyph: <span className="text-[9px] text-[#FF9A00]">Ai</span> },
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
  "h-9 shrink-0 rounded-full border border-border bg-card px-3 text-sm text-foreground hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70";

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

  return (
    <section className="pb-2">
      {/* The heading stays for search engines and screen readers; the page itself starts with one slim toolbar. */}
      <h1 className="sr-only">{title}</h1>
      <p className="sr-only">{intro}</p>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <Breadcrumbs items={breadcrumbs} />
        <div className="flex w-full items-center gap-2 overflow-x-auto pb-1 sm:w-auto sm:overflow-visible sm:pb-0" role="group" aria-label="Filter templates">
          <label className="relative w-44 shrink-0 sm:w-52">
            <span className="sr-only">Search templates</span>
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className={cn(selectClass, "w-full pl-8 pr-7")}
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </label>
          <select aria-label="Category" className={selectClass} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All types ({items.length})</option>
            {categories.map(([slug, { label, count }]) => (
              <option key={slug} value={slug}>{label} ({count})</option>
            ))}
          </select>
          <select aria-label="Opens in" className={selectClass} value={formats[0] ?? ""} onChange={(e) => setFormats(e.target.value ? [e.target.value as FormatKey] : [])}>
            <option value="">Any app</option>
            {availableFormats.map(({ key, label }) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select aria-label="Added" className={selectClass} value={added} onChange={(e) => setAdded(e.target.value as Added)}>
            <option value="any">Any time</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>
          <select aria-label="Sort" className={selectClass} value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="az">A–Z</option>
          </select>
          {filtered ? (
            <button type="button" onClick={clear} className="shrink-0 px-1 text-sm font-semibold text-primary hover:underline">
              Clear
            </button>
          ) : null}
        </div>
      </div>
      <p role="status" className="sr-only">
        {shown.length} of {items.length} templates
      </p>

      {/* Card grid: as many columns as fit (two on phones), up to six, filled left to right so sorting reads naturally. */}
      {shown.length ? (
        <div className="mt-5 grid items-start gap-x-3 gap-y-6 [grid-template-columns:repeat(auto-fill,minmax(max(150px,calc((100%-5*0.75rem)/6)),1fr))] sm:gap-x-5 sm:gap-y-8 sm:[grid-template-columns:repeat(auto-fill,minmax(max(230px,calc((100%-5*1rem)/6)),1fr))]">
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
