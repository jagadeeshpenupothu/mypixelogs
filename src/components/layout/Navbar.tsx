import Link from "next/link";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const navItems = [
  { href: "/templates", label: "Templates" },
  { href: "/tools", label: "Tools" },
  { href: "/resources", label: "Resources" },
  { href: "/blog", label: "Blog" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 shadow-[0_1px_0_rgba(255,255,255,0.02)] backdrop-blur-xl dark:bg-black/78 dark:supports-[backdrop-filter]:bg-black/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm text-white shadow-[0_10px_24px_rgba(37,99,235,0.18)] dark:shadow-none">
            mp
          </span>
          mypixelogs
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition duration-200 hover:bg-muted hover:text-foreground dark:hover:bg-white/[0.06]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="icon" aria-label="Search">
            <Link href="/search">
              <Search className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/templates">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
