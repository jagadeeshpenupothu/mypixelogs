import type { Metadata } from "next";

import { ToolCard } from "@/components/cards/ToolCard";
import { tools } from "@/data/tools";
import { createSocialMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Free PDF Tools",
  description: "Explore free PDF tools including merge, split, compress, JPG to PDF, and PDF to JPG.",
  ...createSocialMetadata({
    title: "Free PDF and Image Tools | mypixelogs",
    description: "Explore free PDF tools including merge, split, compress, JPG to PDF, and PDF to JPG.",
    path: "/tools",
  }),
};

export default function ToolsPage() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Tools</p>
          <h1 className="mt-3 text-4xl font-bold text-foreground">Free PDF and image tools</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            A clean foundation for browser-first file utilities, ready for future
            PDF processing and storage integrations.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
}
