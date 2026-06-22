import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ExplorerSearch() {
  return (
    <form action="/search" className="flex min-w-0 flex-1 items-center gap-3">
      <label className="relative block min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <span className="sr-only">Search MyPixelogs</span>
        <input
          name="q"
          placeholder="Search templates, tools, assets..."
          className="h-12 w-full rounded-lg border border-input bg-card pl-12 pr-16 text-base text-foreground shadow-sm outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground/80 hover:border-foreground/20 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-[#0A0A0A]"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-border bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground sm:block">
          ⌘ K
        </kbd>
      </label>
      <Button type="submit" className="hidden sm:inline-flex">
        Search
      </Button>
    </form>
  );
}
