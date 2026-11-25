import type { Metadata } from "next";

import { GifToVideo } from "@/components/tools/GifToVideo";
import { createSocialMetadata } from "@/lib/metadata";

const title = "Convert GIF to MP4 Online Free";
const description =
  "Convert an animated GIF to an MP4, WebM or MOV video in your browser. Nothing is uploaded.";

export const metadata: Metadata = {
  title,
  description,
  ...createSocialMetadata({ title: `${title} | MyPixelogs`, description, path: "/tools/gif-to-video" }),
};

export default function GifToVideoPage() {
  return (
    <section className="pb-2">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">GIF to Video</p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            Turn a GIF into a video
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Open an animated GIF, choose the format and size, then convert. Nothing is uploaded.
          </p>
        </div>
        <div className="mt-6">
          <GifToVideo />
        </div>
      </div>
    </section>
  );
}
