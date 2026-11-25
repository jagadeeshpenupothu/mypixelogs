import Link from "next/link";

import { CommandSearch } from "@/components/layout/CommandSearch";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-0 lg:pr-8">
        <Link
          href="/"
          aria-label="MyPixelogs home"
          className="flex h-full shrink-0 items-center gap-2 text-lg font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/60 lg:w-[320px] lg:px-6"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-white">
            mp
          </span>
          <span className="hidden sm:inline">MyPixelogs</span>
        </Link>
        <div className="min-w-0 flex-1 lg:max-w-[1000px] lg:pl-8">
          <CommandSearch />
        </div>
        <div className="ml-auto shrink-0">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
