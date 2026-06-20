import type { Metadata } from "next";
import { Suspense } from "react";

import { SearchBar } from "@/components/search/SearchBar";

export const metadata: Metadata = {
  title: "Search",
  description: "Search templates, resources, and tools on mypixelogs.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function SearchPage() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Search</p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal text-foreground sm:text-5xl">
            Search mypixelogs
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Find templates, resources, and tools from one fast browser-side search.
          </p>
        </div>

        <div className="mt-10">
          <Suspense>
            <SearchBar />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
