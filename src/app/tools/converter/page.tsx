import type { Metadata } from "next";

import { UniversalConverter } from "@/components/tools/UniversalConverter";
import { createSocialMetadata } from "@/lib/metadata";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("converter");
const title = tool?.name ?? "Universal File Converter";
const description =
  tool?.description ??
  "Convert images and files in your browser with automatic format detection and valid export options.";

export const metadata: Metadata = {
  title,
  description,
  ...createSocialMetadata({
    title: `${title} | MyPixelogs`,
    description,
    path: "/tools/converter",
  }),
};

export default function ConverterPage() {
  return (
    <section className="pb-2">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            Convert files by detected format
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Upload a file and MyPixelogs will detect its source format, show valid
            export options, and convert supported image formats directly in your browser.
          </p>
        </div>

        <div className="mt-6">
          <UniversalConverter />
        </div>
      </div>
    </section>
  );
}
