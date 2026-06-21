import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ToolCard } from "@/components/cards/ToolCard";
import { Button } from "@/components/ui/button";
import { tools } from "@/data/tools";

export function RecentlyAddedSection() {
  const recentSlugs = [
    "json-validator",
    "age-calculator",
    "fd-calculator",
    "sip-calculator",
    "gst-calculator",
    "emi-calculator",
  ];

  const recentTools = recentSlugs
    .map((slug) => tools.find((tool) => tool.slug === slug))
    .filter((tool): tool is (typeof tools)[number] => Boolean(tool));

  return (
    <section className="border-y border-border bg-slate-50 py-12 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              New This Week
            </p>
            <h2 className="mt-3 text-3xl font-bold text-foreground">
              Recently added utilities
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Fresh browser-first tools added to the MyPixelogs library.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/tools">
              View tool library
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recentTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
}
