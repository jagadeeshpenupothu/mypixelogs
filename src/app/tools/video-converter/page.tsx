import type { Metadata } from "next";

import { VideoConverter } from "@/components/tools/VideoConverter";
import { createSocialMetadata } from "@/lib/metadata";

const title = "Convert Video Online Free";
const description =
  "Convert videos to MP4, WebM, MOV, MKV, AVI or GIF in your browser. Nothing is uploaded.";

export const metadata: Metadata = {
  title,
  description,
  ...createSocialMetadata({ title: `${title} | MyPixelogs`, description, path: "/tools/video-converter" }),
};

export default function VideoConverterPage() {
  return (
    <section className="pb-2">
      <div className="mx-auto max-w-site">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            Convert a video to another format
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Choose a format, quality and resolution, then convert on your own device. Nothing is uploaded.
          </p>
        </div>
        <div className="mt-6">
          <VideoConverter />
        </div>
      </div>
    </section>
  );
}
