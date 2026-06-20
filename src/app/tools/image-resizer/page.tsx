import type { Metadata } from "next";

import { ImageResizer } from "@/components/tools/ImageResizer";
import { createSocialMetadata } from "@/lib/metadata";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("image-resizer");
const title = "Free Image Resizer Online";
const description =
  "Resize PNG, JPG, JPEG, WEBP and SVG images online for free directly in your browser.";

export const metadata: Metadata = {
  title,
  description,
  ...createSocialMetadata({
    title: `${title} | mypixelogs`,
    description,
    path: "/tools/image-resizer",
  }),
};

export default function ImageResizerPage() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            {tool?.name ?? "Image Resizer"}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal text-foreground sm:text-5xl">
            Resize images online for free
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Resize PNG, JPG, JPEG, WEBP, and SVG files by custom dimensions or
            percentage directly in your browser.
          </p>
        </div>

        <div className="mt-10">
          <ImageResizer />
        </div>
      </div>
    </section>
  );
}
