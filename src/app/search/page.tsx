import type { Metadata } from "next";
import { Suspense } from "react";

import { SearchBar } from "@/components/search/SearchBar";
import { createSocialMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Search",
  description: "Search templates, assets, and tools on MyPixelogs.",
  ...createSocialMetadata({
    title: "Search MyPixelogs",
    description: "Search templates, assets, and tools on MyPixelogs.",
    path: "/search",
  }),
  robots: {
    index: false,
    follow: true,
  },
};

export default function SearchPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Search</h1>
      <div className="mt-5">
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>
    </section>
  );
}
