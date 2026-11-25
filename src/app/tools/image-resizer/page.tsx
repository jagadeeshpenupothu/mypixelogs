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
    title: `${title} | MyPixelogs`,
    description,
    path: "/tools/image-resizer",
  }),
};

export default function ImageResizerPage() {
  return (
    <section className="pb-2">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            {tool?.name ?? "Image Resizer"}
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            Resize images online for free
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Resize PNG, JPG, JPEG, WEBP, and SVG files by custom dimensions or
            percentage directly in your browser.
          </p>
        </div>

        <div className="mt-6">
          <ImageResizer />
        </div>
      </div>
    </section>
  );
}
