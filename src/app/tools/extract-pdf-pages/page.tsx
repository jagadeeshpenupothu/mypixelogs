import type { Metadata } from "next";

import { ExtractPDFPages } from "@/components/tools/ExtractPDFPages";
import { createSocialMetadata } from "@/lib/metadata";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("extract-pdf-pages");
const title = "Extract PDF Pages Online Free";
const description = "Extract selected pages from a PDF file and download a new PDF instantly.";

export const metadata: Metadata = {
  title,
  description,
  ...createSocialMetadata({
    title: `${title} | MyPixelogs`,
    description,
    path: "/tools/extract-pdf-pages",
  }),
};

export default function ExtractPDFPagesPage() {
  return (
    <section className="pb-2">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            {tool?.name ?? "Extract PDF Pages"}
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            Extract selected pages from a PDF
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Upload a PDF, choose individual pages or ranges, and download a new
            PDF containing only the pages you need.
          </p>
        </div>

        <div className="mt-6">
          <ExtractPDFPages />
        </div>
      </div>
    </section>
  );
}
