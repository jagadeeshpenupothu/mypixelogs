import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ToolCard } from "@/components/cards/ToolCard";
import { Button } from "@/components/ui/button";
import { tools } from "@/data/tools";

export function ToolsSection() {
  const featuredTools = tools.filter((tool) =>
    ["converter", "image-compressor", "qr-generator"].includes(tool.slug),
  );

  return (
    <section className="border-y border-border bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Featured tools
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
              Explore All Tools
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
