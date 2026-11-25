"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Search } from "lucide-react";

import { popularTasks, searchExamples } from "@/data/navigation";
import { searchItems } from "@/lib/search";

export function SearchBar() {
  const router = useRouter();
  const asked = useSearchParams().get("q") ?? "";
  const [synced, setSynced] = useState(asked);
  const [query, setQuery] = useState(asked);
  if (asked !== synced) {
    setSynced(asked);
    setQuery(asked);
  }
  const typed = query.trim();
  const results = useMemo(() => (typed ? searchItems(typed) : []), [typed]);

  return (
    <>
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          router.replace(typed ? `/search?q=${encodeURIComponent(typed)}` : "/search");
        }}
        className="relative"
      >
        <Search className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="What do you want to do?"
          placeholder="What do you want to do?"
          autoComplete="off"
          enterKeyHint="search"
          className="h-16 w-full rounded-2xl border border-input bg-card pl-14 pr-5 text-lg text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/25"
        />
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        {searchExamples.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setQuery(example)}
            className="min-h-11 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
          >
            {example}
          </button>
        ))}
      </div>
      <p role="status" className="mt-8 text-lg font-semibold text-foreground">
        {typed ? (results.length ? `${results.length} found for “${typed}”` : `Nothing found for “${typed}”. Try a simpler word.`) : "Start here"}
      </p>
      <ul className="mt-3 grid gap-2">
        {(typed
          ? results.map((item) => ({ key: `${item.type}-${item.id}`, href: item.href, title: item.title, note: item.description, type: item.type as string }))
          : popularTasks.map((task) => ({ key: task.href, href: task.href, title: task.title, note: task.note, type: "" }))
        ).map((item) => (
          <li key={item.key}>
            <Link href={item.href} className="flex min-h-16 items-center gap-4 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70">
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-foreground">{item.title}</span>
                <span className="line-clamp-2 text-sm text-muted-foreground">{item.note}</span>
              </span>
              {item.type ? <span className="hidden shrink-0 text-sm text-muted-foreground sm:block">{item.type}</span> : null}
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
