import type { Metadata } from "next";

import { ImageCompressor } from "@/components/tools/ImageCompressor";
import { createSocialMetadata } from "@/lib/metadata";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("image-compressor");
const title = tool?.name ?? "Image Compressor";
const description =
  tool?.description ??
  "Compress JPG, PNG, and WEBP images in your browser with live preview, quality controls, and instant download.";

export const metadata: Metadata = {
  title,
  description,
  ...createSocialMetadata({
    title: `${title} | MyPixelogs`,
    description,
    path: "/tools/image-compressor",
  }),
};

export default function ImageCompressorPage() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Image compressor
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal text-foreground sm:text-5xl">
            Compress images privately in your browser
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Reduce JPG, PNG, and WEBP file sizes with live quality controls,
            side-by-side previews, and instant downloads without server uploads.
          </p>
        </div>

        <div className="mt-10">
          <ImageCompressor />
        </div>
      </div>
    </section>
  );
}
