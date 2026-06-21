import type { Metadata } from "next";

import { ToolsDirectory } from "@/components/tools/ToolsDirectory";
import { createSocialMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Free Online Tools",
  description:
    "Browse free image, PDF, developer, calculator, language, business, design, and utility tools.",
  ...createSocialMetadata({
    title: "Free Online Tools | MyPixelogs",
    description:
      "Browse free image, PDF, developer, calculator, language, business, design, and utility tools.",
    path: "/tools",
  }),
};

export default function ToolsPage() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Tools</p>
          <h1 className="mt-3 text-4xl font-bold text-foreground">Free online tools</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Browse browser-first utilities by category, from image and PDF tools to
            developer helpers, calculators, language tools, and everyday utilities.
          </p>
        </div>
        <div className="mt-10">
          <ToolsDirectory />
        </div>
      </div>
    </section>
  );
}
