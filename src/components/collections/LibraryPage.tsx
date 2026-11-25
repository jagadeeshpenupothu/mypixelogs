"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

import { PictureCard, TaskCard } from "@/components/cards/ItemCard";
import { Breadcrumbs } from "@/components/templates/Breadcrumbs";
import { matchScore, searchWords } from "@/lib/plain-search";

export type LibraryItem = {
  id: string;
  href: string;
  title: string;
  note: string;
  /** Other words that should find this item. */
  words: string;
  icon?: string;
  tone?: string;
  image?: string;
  video?: boolean;
};

export type LibrarySection = { id: string; title: string; items: LibraryItem[] };

/** One simple list page: a search box, group links and cards. */
export function LibraryPage({
  title,
  intro,
  noun,
  breadcrumbs,
  groups,
  sections,
}: {
  title: string;
  intro: string;
  noun: string;
  breadcrumbs: { label: string; href?: string }[];
  groups: { label: string; href: string; active: boolean }[];
  sections: LibrarySection[];
}) {
  const [query, setQuery] = useState("");
  const words = searchWords(query);
  const total = sections.reduce((sum, section) => sum + section.items.length, 0);
  const shown = sections
    .map((section) => ({
      ...section,
      items: words.length
        ? section.items.filter((item) => matchScore(words, [item.title, item.note, item.words]) > 0)
        : section.items,
    }))
    .filter((section) => section.items.length > 0);

  return (
    <section className="pb-2">
      <div className="mx-auto max-w-7xl">
        <Breadcrumbs items={breadcrumbs} />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">{intro}</p>

        {groups.length > 2 ? (
          <nav aria-label={`Kinds of ${noun}`} className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {groups.map((group) => (
              <Link
                key={group.href}
                href={group.href}
                aria-current={group.active ? "page" : undefined}
                className={`inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 ${
                  group.active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                {group.label}
              </Link>
            ))}
          </nav>
        ) : null}

        {total > 8 ? (
          <label className="relative mt-4 block max-w-xl">
            <span className="sr-only">Search {noun}</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${noun}`}
              autoComplete="off"
              className="h-12 w-full rounded-xl border border-input bg-card pl-12 pr-4 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/25"
            />
          </label>
        ) : null}

        <p className="sr-only" role="status">
          {words.length ? `${shown.reduce((sum, section) => sum + section.items.length, 0)} found` : ""}
        </p>

        <div className="mt-8 grid gap-10">
          {shown.map((section) => (
            <section key={section.id} aria-label={section.title}>
              {sections.length > 1 ? <h2 className="mb-4 text-xl font-bold text-foreground">{section.title}</h2> : null}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {section.items.map((item) =>
                  item.image ? (
                    <PictureCard key={item.id} href={item.href} title={item.title} note={item.note} image={item.image} video={item.video} />
                  ) : (
                    <TaskCard key={item.id} href={item.href} title={item.title} note={item.note} icon={item.icon ?? ""} tone={item.tone ?? ""} />
                  ),
                )}
              </div>
            </section>
          ))}
        </div>

        {shown.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-lg font-semibold text-foreground">Nothing found for “{query}”</p>
            <p className="mt-1 text-base text-muted-foreground">Try a simpler word, such as video, photo or invoice.</p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-4 inline-flex h-11 items-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-semibold text-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Clear search
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
