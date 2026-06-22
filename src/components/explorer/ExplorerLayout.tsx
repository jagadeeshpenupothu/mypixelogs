"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ChevronsLeft, ChevronsRight, Menu, X } from "lucide-react";

import { ExplorerSidebar } from "@/components/explorer/ExplorerSidebar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import type { ExplorerGroupData } from "@/lib/explorer";
import { cn } from "@/lib/utils";

type ExplorerLayoutProps = {
  groups: ExplorerGroupData[];
  children: ReactNode;
};

const collapsedStorageKey = "mypixelogs:explorer-sidebar-collapsed";

export function ExplorerLayout({ groups, children }: ExplorerLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMounted(true);

      try {
        const savedValue = window.localStorage.getItem(collapsedStorageKey);
        if (savedValue) {
          setIsCollapsed(savedValue === "true");
        }
      } catch {
        setIsCollapsed(false);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const closeDrawer = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setIsOpen(false);
      }
    };

    if (mediaQuery.matches) {
      const timeoutId = window.setTimeout(() => setIsOpen(false), 0);
      return () => window.clearTimeout(timeoutId);
    }

    mediaQuery.addEventListener("change", closeDrawer);

    return () => mediaQuery.removeEventListener("change", closeDrawer);
  }, [isOpen]);

  useEffect(() => {
    if (!mounted) return;

    try {
      window.localStorage.setItem(collapsedStorageKey, String(isCollapsed));
    } catch {
      // Ignore storage errors; the UI still updates for the current session.
    }
  }, [isCollapsed, mounted]);

  const showCollapsed = mounted && isCollapsed;

  function toggleCollapsed() {
    setIsCollapsed((current) => !current);
  }

  return (
    <div className="border-b border-border bg-white dark:bg-black">
      <div className="lg:hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(true)}>
            <Menu className="h-4 w-4" />
            Explorer
          </Button>
          <p className="text-sm font-semibold text-muted-foreground">MyPixelogs Library</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] lg:flex">
        <div
          className={cn(
            "relative hidden shrink-0 transition-[width] duration-200 lg:sticky lg:top-16 lg:block lg:h-[calc(100vh-4rem)]",
            showCollapsed ? "explorer-sidebar-collapsed" : "explorer-sidebar-expanded",
          )}
        >
          <ExplorerSidebar groups={groups} collapsed={showCollapsed} />
          <button
            type="button"
            onClick={toggleCollapsed}
            className="absolute bottom-6 right-0 z-30 flex h-10 w-10 translate-x-1/2 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-soft transition-[color,box-shadow,transform] duration-200 hover:scale-105 hover:text-foreground hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 dark:bg-[#111111]"
            aria-label={showCollapsed ? "Expand explorer sidebar" : "Collapse explorer sidebar"}
          >
            {showCollapsed ? (
              <ChevronsRight className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
          <Footer />
        </main>
      </div>

      {isOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[80] bg-black/40 lg:hidden"
            aria-label="Close explorer"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-[90] w-[min(320px,88vw)] border-r border-border bg-background shadow-soft lg:hidden">
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Explorer</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                aria-label="Close explorer"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-[calc(100vh-3.5rem)]">
              <ExplorerSidebar
                groups={groups}
                collapsed={false}
                onNavigate={() => setIsOpen(false)}
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
