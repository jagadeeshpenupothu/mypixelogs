import type { Metadata } from "next";

import { VideoFlipper } from "@/components/tools/VideoFlipper";
import { createSocialMetadata } from "@/lib/metadata";

const title = "Flip Video Online Free";
const description =
  "Flip or mirror a video horizontally, vertically or both in your browser. Nothing is uploaded.";

export const metadata: Metadata = {
  title,
  description,
  ...createSocialMetadata({ title: `${title} | MyPixelogs`, description, path: "/tools/video-flipper" }),
};

export default function VideoFlipperPage() {
  return (
    <section className="pb-2">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            Flip or mirror a video
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Flip it left to right, top to bottom or both, and see it instantly. Nothing is uploaded.
          </p>
        </div>
        <div className="mt-6">
          <VideoFlipper />
        </div>
      </div>
    </section>
  );
}
