"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { SearchCategoryTree } from "@/components/search/SearchCategoryTree";
import { SearchResults } from "@/components/search/SearchResults";
import {
  createSearchEngine,
  filterSearchItems,
  getSearchCategoryLabel,
  type SearchCategoryId,
  type SearchItem,
} from "@/lib/search";

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
  const initialCategory = (searchParams.get("category") ?? "everything") as SearchCategoryId;
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<SearchCategoryId>(initialCategory);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchEngine = useMemo(() => createSearchEngine(), []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setRecentSearches(readRecentSearches()));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (selectedCategory !== "everything") params.set("category", selectedCategory);
      const nextUrl = params.toString() ? `/search?${params.toString()}` : "/search";
      router.replace(nextUrl, { scroll: false });
    }, 180);

    return () => window.clearTimeout(timer);
  }, [query, router, selectedCategory]);

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

    return filterSearchItems(
      searchEngine.search(trimmedQuery).map((result) => result.item),
      selectedCategory,
    );
  }, [debouncedQuery, searchEngine, selectedCategory]);

  function applyQuery(nextQuery: string) {
    setQuery(nextQuery);
    setDebouncedQuery(nextQuery);
  }

  return (
    <div>
      <div className="rounded-lg border border-border bg-card p-2 shadow-sm transition-[border-color,box-shadow] duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 dark:focus-within:ring-primary/25">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCategoryOpen((current) => !current)}
              className="flex h-12 max-w-[180px] items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 dark:bg-[#0A0A0A]"
              aria-label="Choose search category"
              aria-haspopup="listbox"
              aria-expanded={isCategoryOpen}
            >
              <span className="truncate">{getSearchCategoryLabel(selectedCategory)}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>

            {isCategoryOpen ? (
              <div
                className="absolute left-0 top-[calc(100%+0.5rem)] z-[60] max-h-[min(520px,calc(100vh-8rem))] w-72 overflow-auto rounded-xl border border-border bg-card p-2 shadow-soft"
              >
                <SearchCategoryTree
                  selectedCategory={selectedCategory}
                  onSelect={(category, hasChildren) => {
                    setSelectedCategory(category);
                    if (!hasChildren) setIsCategoryOpen(false);
                  }}
                />
              </div>
            ) : null}
          </div>
          <Search className="ml-3 h-5 w-5 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoFocus
            placeholder="Search templates, tools, assets..."
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
        <SearchResults
          query={debouncedQuery}
          results={results}
          onSuggestionClick={applyQuery}
          categoryLabel={getSearchCategoryLabel(selectedCategory)}
        />
      </div>
    </div>
  );
}
