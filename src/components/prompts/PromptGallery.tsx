"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Search, X } from "lucide-react";

import { Breadcrumbs } from "@/components/templates/Breadcrumbs";
import type { ChatGptPrompt } from "@/data/chatgpt-prompts";
import { matchScore, searchWords } from "@/lib/plain-search";
import { cn } from "@/lib/utils";

const control =
  "h-9 shrink-0 rounded-full border border-border bg-card px-3 text-sm text-foreground hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70";

/** ChatGPT prompts: one slim toolbar, then simple text cards. */
export function PromptGallery({ items, categories, title, intro }: { items: ChatGptPrompt[]; categories: readonly string[]; title: string; intro: string }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const words = searchWords(query);
  const shown = items.filter((p) => (category === "all" || p.category === category) && (!words.length || matchScore(words, [p.title, p.summary, p.category, p.prompt]) > 0));

  return (
    <section className="pb-2">
      <h1 className="sr-only">{title}</h1>
      <p className="sr-only">{intro}</p>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "AI prompts" }]} />
        <div className="flex w-full items-center gap-2 overflow-x-auto pb-1 sm:w-auto sm:overflow-visible sm:pb-0" role="group" aria-label="Filter prompts">
          <label className="relative w-44 shrink-0 sm:w-56">
            <span className="sr-only">Search prompts</span>
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search, e.g. leave, invoice" className={cn(control, "w-full pl-8 pr-7")} />
            {query ? (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </label>
          <select aria-label="Category" className={control} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All emails ({items.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c} ({items.filter((p) => p.category === c).length})</option>
            ))}
          </select>
        </div>
      </div>
      <p role="status" className="sr-only">{shown.length} of {items.length} prompts</p>

      <ul className="mt-5 grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
        {shown.map((p) => (
          <li key={p.slug}>
            <Link
              prefetch={false}
              href={`/ai/prompts/${p.slug}`}
              className="group flex h-full flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
            >
              <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                {p.category}
              </span>
              <span className="mt-2 text-base font-semibold text-foreground group-hover:underline">{p.title}</span>
              <span className="mt-1 text-sm leading-6 text-muted-foreground">{p.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
      {!shown.length ? <p className="mt-10 text-center text-base text-muted-foreground">No prompts match. Try another word.</p> : null}
    </section>
  );
}
