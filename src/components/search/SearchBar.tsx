"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { SearchResults } from "@/components/search/SearchResults";
import { createSearchEngine, type SearchItem } from "@/lib/search";

const recentSearchesKey = "mypixelogs-recent-searches";

function readRecentSearches(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return JSON.parse(window.localStorage.getItem(recentSearchesKey) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return;
  }

  const nextSearches = [
    normalizedQuery,
    ...readRecentSearches().filter((item) => item.toLowerCase() !== normalizedQuery.toLowerCase()),
  ].slice(0, 5);

  window.localStorage.setItem(recentSearchesKey, JSON.stringify(nextSearches));
}

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchEngine = useMemo(() => createSearchEngine(), []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setRecentSearches(readRecentSearches()));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
      const nextUrl = query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search";
      router.replace(nextUrl, { scroll: false });
    }, 180);

    return () => window.clearTimeout(timer);
  }, [query, router]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      return;
    }

    saveRecentSearch(debouncedQuery);
    const frame = requestAnimationFrame(() => setRecentSearches(readRecentSearches()));
    return () => cancelAnimationFrame(frame);
  }, [debouncedQuery]);

  const results: SearchItem[] = useMemo(() => {
    const trimmedQuery = debouncedQuery.trim();
    if (!trimmedQuery) {
      return [];
    }

    return searchEngine.search(trimmedQuery).map((result) => result.item);
  }, [debouncedQuery, searchEngine]);

  function applyQuery(nextQuery: string) {
    setQuery(nextQuery);
    setDebouncedQuery(nextQuery);
  }

  return (
    <div>
      <div className="rounded-lg border border-border bg-card p-2 shadow-sm transition-[border-color,box-shadow] duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 dark:focus-within:ring-primary/25">
        <div className="flex items-center gap-3">
          <Search className="ml-3 h-5 w-5 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoFocus
            placeholder="Search invoices, resumes, PDF tools..."
              className="h-12 min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground/80"
          />
        </div>
      </div>

      {recentSearches.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Recent:</span>
          {recentSearches.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => applyQuery(item)}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-colors duration-200 hover:border-foreground/20 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 dark:bg-[#0A0A0A] dark:hover:border-white/20"
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-10">
        <SearchResults query={debouncedQuery} results={results} onSuggestionClick={applyQuery} />
      </div>
    </div>
  );
}
