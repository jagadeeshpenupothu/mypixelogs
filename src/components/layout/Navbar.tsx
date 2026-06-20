import Link from "next/link";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/templates", label: "Templates" },
  { href: "/tools", label: "Tools" },
  { href: "/resources", label: "Resources" },
  { href: "/blog", label: "Blog" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm text-white">
            mp
          </span>
          mypixelogs
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="h-4 w-4" />
          </Button>
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/templates">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
