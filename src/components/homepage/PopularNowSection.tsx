import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AssetCard } from "@/components/cards/AssetCard";
import { ToolCard } from "@/components/cards/ToolCard";
import { Button } from "@/components/ui/button";
import { assets } from "@/data/assets";
import { tools } from "@/data/tools";

export function PopularNowSection() {
  const popularToolSlugs = [
    "image-compressor",
    "qr-generator",
    "json-validator",
    "emi-calculator",
    "age-calculator",
    "converter",
  ];

  const popularTools = popularToolSlugs
    .map((slug) => tools.find((tool) => tool.slug === slug))
    .filter((tool): tool is (typeof tools)[number] => Boolean(tool));

  const popularAssets = assets.slice(0, 2);

  return (
    <section className="bg-white py-12 sm:py-14 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Popular Right Now
            </p>
            <h2 className="mt-3 text-3xl font-bold text-foreground">
              Frequently used tools and assets
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Fast links to the tools and assets visitors are most likely to need first.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/tools">
              Explore all tools
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {popularTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
          {popularAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      </div>
    </section>
  );
}
