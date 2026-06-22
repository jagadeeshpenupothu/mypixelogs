import Link from "next/link";
import { Bell, Heart, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CommandSearch } from "@/components/layout/CommandSearch";
import { PreferencesMenu } from "@/components/layout/PreferencesMenu";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const quickActions = [
  { label: "Favorites", href: "/assets", icon: Heart },
  { label: "Saved", href: "/assets", icon: Star },
  { label: "Notifications", href: "/contact", icon: Bell },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 shadow-[0_1px_0_rgba(255,255,255,0.02)] backdrop-blur-xl dark:bg-black/78 dark:supports-[backdrop-filter]:bg-black/70">
      <div className="flex h-16 items-center">
        <Link
          href="/"
          className="flex h-full shrink-0 items-center gap-2 px-4 text-lg font-bold text-foreground transition-colors duration-200 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30 sm:px-6 lg:w-[320px]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-white shadow-[0_10px_24px_rgba(37,99,235,0.18)] dark:shadow-none">
            mp
          </span>
          <span className="hidden sm:inline">MyPixelogs</span>
        </Link>

        <div className="flex min-w-0 flex-1 justify-center px-4 sm:px-6 lg:justify-start lg:px-8">
          <div className="w-full min-w-0 max-w-[1000px] lg:min-w-[620px] xl:min-w-[800px]">
            <CommandSearch />
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 pr-4 sm:pr-6 lg:pr-8">
          <div className="hidden items-center gap-1 lg:flex">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Button key={action.label} asChild variant="ghost" size="icon" aria-label={action.label}>
                  <Link href={action.href} title={action.label}>
                    <Icon className="h-4 w-4" />
                  </Link>
                </Button>
              );
            })}
          </div>
          <ThemeToggle />
          <PreferencesMenu />
        </div>
      </div>
    </header>
  );
}
