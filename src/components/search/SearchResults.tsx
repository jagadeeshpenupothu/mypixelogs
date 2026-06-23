import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { SearchItem, SearchResultType } from "@/lib/search";
import { searchSuggestions } from "@/lib/search";

const resultOrder: SearchResultType[] = [
  "Template",
  "Tool",
  "AI Prompt",
  "AI Image Prompt",
  "AI Image",
  "Asset",
];

type SearchResultsProps = {
  query: string;
  results: SearchItem[];
  onSuggestionClick: (query: string) => void;
  categoryLabel?: string;
};

export function SearchResults({
  query,
  results,
  onSuggestionClick,
  categoryLabel = "Everything",
}: SearchResultsProps) {
  const groupedResults = resultOrder.map((type) => ({
    type,
    items: results.filter((item) => item.type === type),
  }));

  if (!query.trim()) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-semibold text-foreground">Start searching</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Search {categoryLabel.toLowerCase()} from one place.
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-semibold text-foreground">No results found for:</p>
        <p className="mt-2 text-lg font-bold text-foreground">&quot;{query}&quot;</p>
        <p className="mt-2 text-sm text-muted-foreground">
          No matches in {categoryLabel.toLowerCase()}.
        </p>
        <p className="mt-5 text-sm text-muted-foreground">Try searching for:</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {searchSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onSuggestionClick(suggestion)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors duration-200 hover:border-foreground/20 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 dark:bg-[#0A0A0A] dark:hover:border-white/20"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groupedResults.map(({ type, items }) => (
        <section key={type}>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-foreground">
              {type}s ({items.length})
            </h2>
          </div>
          {items.length > 0 ? (
            <div className="mt-4 grid gap-3">
              {items.map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={item.href}
                  className="group rounded-lg border border-border bg-card p-5 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md dark:hover:border-white/20 dark:hover:shadow-soft"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-primary">
                        {item.type}
                      </span>
                      <h3 className="mt-3 text-base font-semibold tracking-tight text-foreground">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </p>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-primary">
                        {item.category}
                      </p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground transition group-hover:text-primary" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">
              No {type.toLowerCase()} results.
            </p>
          )}
        </section>
      ))}
    </div>
  );
}
