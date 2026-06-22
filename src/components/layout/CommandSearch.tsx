"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";

import { SearchCategoryTree } from "@/components/search/SearchCategoryTree";
import {
  createSearchEngine,
  filterSearchItems,
  getSearchCategoryLabel,
  type SearchCategoryId,
  type SearchItem,
} from "@/lib/search";

function getSuggestionIcon(item: SearchItem) {
  if (item.type === "Tool") return "🧰";
  if (item.type === "Asset") return item.category === "ICON" ? "◈" : "◆";
  if (item.category.includes("PSD") || item.category.includes("Canva")) return "🎨";
  return "📄";
}

export function CommandSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SearchCategoryId>("everything");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchEngine = useMemo(() => createSearchEngine(), []);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleShortcut(event: KeyboardEvent) {
      const usesCommandKey = event.metaKey || event.ctrlKey;
      if (usesCommandKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen(true);
        window.setTimeout(() => inputRef.current?.focus(), 0);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleShortcut);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  const groupedResults = useMemo(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return [];
    }

    return filterSearchItems(
      searchEngine.search(trimmedQuery).map((result) => result.item),
      selectedCategory,
    ).slice(0, 8);
  }, [query, searchEngine, selectedCategory]);

  const hasQuery = query.trim().length > 0;
  const hasResults = groupedResults.length > 0;
  const selectedCategoryLabel = getSearchCategoryLabel(selectedCategory);

  function submitSearch() {
    const trimmedQuery = query.trim();
    const params = new URLSearchParams();

    if (trimmedQuery) params.set("q", trimmedQuery);
    if (selectedCategory !== "everything") params.set("category", selectedCategory);

    window.location.href = params.toString() ? `/search?${params.toString()}` : "/search";
  }

  return (
    <div ref={containerRef} className="relative w-full min-w-0">
      <div className="flex h-11 min-w-0 items-center rounded-lg border border-border bg-card shadow-sm transition-[border-color,box-shadow] duration-200 focus-within:border-primary/60 focus-within:shadow-[0_12px_30px_rgba(15,23,42,0.08)] focus-within:ring-2 focus-within:ring-primary/10 dark:bg-[#0A0A0A] dark:focus-within:shadow-none">
        <button
          type="button"
          onClick={() => {
            setIsCategoryOpen((current) => !current);
            setIsOpen(true);
          }}
          className="flex h-full max-w-[150px] shrink-0 items-center gap-1.5 rounded-l-lg border-r border-border px-3 text-xs font-semibold text-foreground transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 sm:max-w-[190px]"
          aria-label="Choose search category"
          aria-haspopup="listbox"
          aria-expanded={isCategoryOpen}
        >
          <span className="truncate">{selectedCategoryLabel}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        </button>
        <Search className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submitSearch();
            }
          }}
          placeholder="Search templates, tools, assets..."
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/80"
        />
        <kbd className="mr-3 hidden rounded-md border border-border bg-muted px-2 py-1 text-[11px] font-bold text-muted-foreground sm:inline-flex">
          ⌘ K
        </kbd>
      </div>

      {isCategoryOpen ? (
        <div
          className="absolute left-0 top-[calc(100%+0.5rem)] z-[90] max-h-[min(520px,calc(100vh-6rem))] w-72 overflow-auto rounded-xl border border-border bg-card p-2 shadow-soft"
        >
          <SearchCategoryTree
            selectedCategory={selectedCategory}
            onSelect={(category, hasChildren) => {
              setSelectedCategory(category);
              setIsOpen(true);
              if (!hasChildren) setIsCategoryOpen(false);
              inputRef.current?.focus();
            }}
          />
        </div>
      ) : null}

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[70] max-h-[min(540px,calc(100vh-6rem))] overflow-auto rounded-xl border border-border bg-card p-2 shadow-soft">
          {hasQuery ? (
            hasResults ? (
              <div className="space-y-1">
                {groupedResults.map((item) => (
                  <Link
                    key={`${item.type}-${item.id}`}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="block rounded-lg px-3 py-2 transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="shrink-0 text-base" aria-hidden="true">
                          {getSuggestionIcon(item)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-foreground">
                            {item.title}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                            {item.description}
                          </span>
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                        {item.category}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="rounded-lg bg-muted px-3 py-3 text-sm text-muted-foreground">
                No suggestions found.
              </p>
            )
          ) : (
            <p className="rounded-lg bg-muted px-3 py-3 text-sm text-muted-foreground">
              Search in {selectedCategoryLabel.toLowerCase()}.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
