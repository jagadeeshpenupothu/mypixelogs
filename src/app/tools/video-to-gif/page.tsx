import type { Metadata } from "next";

import { VideoToGif } from "@/components/tools/VideoToGif";
import { createSocialMetadata } from "@/lib/metadata";

const title = "Convert Video to GIF Online Free";
const description =
  "Turn part of a video into a high-quality GIF in your browser. Nothing is uploaded.";

export const metadata: Metadata = {
  title,
  description,
  ...createSocialMetadata({ title: `${title} | MyPixelogs`, description, path: "/tools/video-to-gif" }),
};

export default function VideoToGifPage() {
  return (
    <section className="pb-2">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            Turn a video into a GIF
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Pick the part on the timeline, set the size and frame rate, then convert. Nothing is uploaded.
          </p>
        </div>
        <div className="mt-6">
          <VideoToGif />
        </div>
      </div>
    </section>
  );
}
