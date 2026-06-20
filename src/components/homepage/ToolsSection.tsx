import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ToolCard } from "@/components/cards/ToolCard";
import { Button } from "@/components/ui/button";
import { tools } from "@/data/tools";

export function ToolsSection() {
  const prioritySlugs = ["converter", "image-compressor", "qr-generator"];
  const priorityTools = prioritySlugs
    .map((slug) => tools.find((tool) => tool.slug === slug))
    .filter((tool): tool is (typeof tools)[number] => Boolean(tool));
  const additionalTools = tools
    .filter((tool) => !prioritySlugs.includes(tool.slug))
    .slice(0, 3);
  const featuredTools = [...priorityTools, ...additionalTools];

  return (
    <section className="border-y border-border bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Popular Tools
            </p>
            <h2 className="mt-3 text-3xl font-bold text-foreground">
              Browser-first tools for everyday files
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              Convert files, compress images, and generate QR codes without
              account setup or server uploads.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/tools">
              Explore all tools
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featuredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
}
