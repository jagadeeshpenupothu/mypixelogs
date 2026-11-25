import type { Metadata } from "next";

import { VideoResizer } from "@/components/tools/VideoResizer";
import { createSocialMetadata } from "@/lib/metadata";

const title = "Resize Video Online Free";
const description =
  "Resize videos to 2160p, 1080p, 720p or any custom size in your browser. Nothing is uploaded.";

export const metadata: Metadata = {
  title,
  description,
  ...createSocialMetadata({ title: `${title} | MyPixelogs`, description, path: "/tools/video-resizer" }),
};

export default function VideoResizerPage() {
  return (
    <section className="pb-2">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Video Resizer</p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            Resize a video to any resolution
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Pick a preset or type a size, choose how it fits, then export. Nothing is uploaded.
          </p>
        </div>
        <div className="mt-6">
          <VideoResizer />
        </div>
      </div>
    </section>
  );
}
