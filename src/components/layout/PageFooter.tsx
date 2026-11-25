"use client";

import { usePathname } from "next/navigation";

import { Footer } from "@/components/layout/Footer";

const librarySections = ["/templates", "/tools", "/ai", "/assets", "/resources"];

/** Library pages already show the footer beside the sidebar. */
export function PageFooter() {
  const pathname = usePathname();
  const isLibraryPage =
    pathname === "/" || librarySections.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (isLibraryPage) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <Footer />
    </div>
  );
}
