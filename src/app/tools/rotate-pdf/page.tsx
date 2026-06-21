import type { Metadata } from "next";

import { RotatePDF } from "@/components/tools/RotatePDF";
import { createSocialMetadata } from "@/lib/metadata";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("rotate-pdf");
const title = "Rotate PDF Online Free";
const description =
  "Rotate PDF pages online for free. Rotate all pages or selected pages and download instantly.";

export const metadata: Metadata = {
  title,
  description,
  ...createSocialMetadata({
    title: `${title} | MyPixelogs`,
    description,
    path: "/tools/rotate-pdf",
  }),
};

export default function RotatePDFPage() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            {tool?.name ?? "Rotate PDF"}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal text-foreground sm:text-5xl">
            Rotate PDF pages online
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Upload a PDF, rotate every page or choose specific pages and ranges,
            then download the updated PDF directly from your browser.
          </p>
        </div>

        <div className="mt-10">
          <RotatePDF />
        </div>
      </div>
    </section>
  );
}
