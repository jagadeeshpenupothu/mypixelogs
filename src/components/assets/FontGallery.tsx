"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { FontCard, fontGridClass } from "@/components/assets/FontCard";
import { Breadcrumbs } from "@/components/templates/Breadcrumbs";
import { fontCategories, SCRIPT_LABELS, styleCount, type FontFamily } from "@/lib/fonts";
import { matchScore, searchWords } from "@/lib/plain-search";
import { cn } from "@/lib/utils";

const control =
  "h-9 shrink-0 rounded-full border border-border bg-card px-3 text-sm text-foreground hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70";

/** All fonts with one slim toolbar: search, type, language and sort. */
export function FontGallery({ items, title, intro, breadcrumbs }: { items: FontFamily[]; title: string; intro: string; breadcrumbs: { label: string; href?: string }[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [script, setScript] = useState("any");
  const [sort, setSort] = useState<"popular" | "az" | "styles">("popular");

  const words = searchWords(query);
  const shown = useMemo(() => {
    const list = items.filter(
      (f) =>
        (category === "all" || f.category === category) &&
        (script === "any" || f.scripts.includes(script)) &&
        (!words.length || matchScore(words, [f.name, f.category, f.designer, f.scripts.map((s) => SCRIPT_LABELS[s] ?? s).join(" ")]) > 0),
    );
    if (sort === "az") return [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "styles") return [...list].sort((a, b) => styleCount(b) - styleCount(a));
    return list;
  }, [items, category, script, words, sort]);
  const filtered = Boolean(query) || category !== "all" || script !== "any";

  return (
    <section className="pb-2">
      <h1 className="sr-only">{title}</h1>
      <p className="sr-only">{intro}</p>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <Breadcrumbs items={breadcrumbs} />
        <div className="flex w-full items-center gap-2 overflow-x-auto pb-1 sm:w-auto sm:overflow-visible sm:pb-0" role="group" aria-label="Filter fonts">
          <label className="relative w-44 shrink-0 sm:w-52">
            <span className="sr-only">Search fonts</span>
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search fonts" className={cn(control, "w-full pl-8 pr-7")} />
            {query ? (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </label>
          <select aria-label="Type" className={control} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All types ({items.length})</option>
            {fontCategories.map((c) => {
              const n = items.filter((f) => f.category === c).length;
              return n ? <option key={c} value={c}>{c} ({n})</option> : null;
            })}
          </select>
          <select aria-label="Language" className={control} value={script} onChange={(e) => setScript(e.target.value)}>
            <option value="any">Any language</option>
            {Object.entries(SCRIPT_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select aria-label="Sort" className={control} value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
            <option value="popular">Popular</option>
            <option value="az">A–Z</option>
            <option value="styles">Most styles</option>
          </select>
          {filtered ? (
            <button type="button" onClick={() => { setQuery(""); setCategory("all"); setScript("any"); }} className="shrink-0 px-1 text-sm font-semibold text-primary hover:underline">
              Clear
            </button>
          ) : null}
        </div>
      </div>
      <p role="status" className="sr-only">{shown.length} of {items.length} fonts</p>

      {shown.length ? (
        <div className={cn("mt-5", fontGridClass)}>
          {shown.map((f) => (
            <FontCard key={f.slug} font={f} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-center text-base text-muted-foreground">No fonts match. Try another word.</p>
      )}
    </section>
  );
}
