import type { Metadata } from "next";

import { VideoTrimmer } from "@/components/tools/VideoTrimmer";
import { createSocialMetadata } from "@/lib/metadata";

const title = "Trim Video Online Free";
const description =
  "Trim MP4, MOV, WebM, MKV and AVI videos in your browser with exact start and end times. Nothing is uploaded.";

export const metadata: Metadata = {
  title,
  description,
  ...createSocialMetadata({ title: `${title} | MyPixelogs`, description, path: "/tools/video-trimmer" }),
};

export default function VideoTrimmerPage() {
  return (
    <section className="pb-2">
      <div className="mx-auto max-w-site">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            Trim a video to the exact frame
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Drag the handles or type the times, preview your selection, then export. Nothing is uploaded.
          </p>
        </div>
        <div className="mt-6">
          <VideoTrimmer />
        </div>
      </div>
    </section>
  );
}
