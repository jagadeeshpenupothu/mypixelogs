import type { Metadata } from "next";

import { VideoRotator } from "@/components/tools/VideoRotator";
import { createSocialMetadata } from "@/lib/metadata";

const title = "Rotate Video Online Free";
const description =
  "Rotate MP4, MOV and M4V videos by 90, 180 or 270 degrees in your browser. No re-encoding, so quality and file size stay the same.";

export const metadata: Metadata = {
  title,
  description,
  ...createSocialMetadata({ title: `${title} | MyPixelogs`, description, path: "/tools/video-rotator" }),
};

export default function VideoRotatorPage() {
  return (
    <section className="pb-2">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Video rotator</p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            Rotate a video without losing quality
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Add a video, choose an angle and export. The file size stays the same, and nothing is uploaded.
          </p>
        </div>
        <div className="mt-6">
          <VideoRotator />
        </div>
      </div>
    </section>
  );
}
