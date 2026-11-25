"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutTemplate, Sparkles, Wrench } from "lucide-react";

import { SiteSearch } from "@/components/layout/SiteSearch";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { mainNav } from "@/data/navigation";
import { toolCategories } from "@/data/tools";
import { getToolBySlug } from "@/lib/tools";

/** The section a page belongs to, so the menu can show where you are. */
function currentSection(pathname: string) {
  const [first, second] = pathname.split("/").filter(Boolean);
  if (first !== "tools") return first ? `/${first}` : "/";
  const tool = second ? getToolBySlug(second) : undefined;
  const category = toolCategories.find((item) => (tool ? item.name === tool.category : item.slug === second));
  return category ? `/tools/${category.slug}` : "/tools";
}

export function Navbar() {
  const pathname = usePathname();
  const section = currentSection(pathname);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="MyPixelogs home" className="flex h-11 shrink-0 items-center gap-2 rounded-md text-lg font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">mp</span>
          <span className={pathname === "/" ? "" : "hidden sm:inline"}>MyPixelogs</span>
        </Link>
        <nav aria-label="Main" className="ml-3 hidden items-center lg:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={section === item.href ? "page" : undefined}
              className={`flex h-11 items-center rounded-md px-3 text-[15px] font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 ${
                section === item.href ? "text-primary" : "text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto min-w-0 flex-1 lg:max-w-xs">{pathname === "/" ? null : <SiteSearch />}</div>
        <ThemeToggle />
      </div>
    </header>
  );
}

const tabs = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/tools", label: "Tools", Icon: Wrench },
  { href: "/templates", label: "Templates", Icon: LayoutTemplate },
  { href: "/ai", label: "AI prompts", Icon: Sparkles },
];

/** On phones the main places are always within thumb reach. */
export function TabBar() {
  const pathname = usePathname();
  // Editors need the whole screen.
  if (pathname.endsWith("/edit")) return null;

  return (
    <>
      <div className="h-16 lg:hidden" aria-hidden="true" />
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <ul className="mx-auto grid h-16 max-w-lg grid-cols-4">
          {tabs.map(({ href, label, Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-full flex-col items-center justify-center gap-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/70 ${active ? "text-primary" : "text-muted-foreground"}`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
