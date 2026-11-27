import type { Metadata } from "next";

import { VideoCompressor } from "@/components/tools/VideoCompressor";
import { createSocialMetadata } from "@/lib/metadata";

const title = "Compress Video Online Free";
const description =
  "Compress MP4, MOV, MKV and WebM videos in your browser. It checks the picture against your original and finds the smallest matching file.";

export const metadata: Metadata = {
  title,
  description,
  ...createSocialMetadata({ title: `${title} | MyPixelogs`, description, path: "/tools/video-compressor" }),
};

export default function VideoCompressorPage() {
  return (
    <section className="pb-2">
      <div className="mx-auto max-w-site">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            Make a video smaller and keep its quality
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            The tool tests your video, finds the smallest file that still matches the original, and shows you the result. Nothing is uploaded.
          </p>
        </div>
        <div className="mt-6">
          <VideoCompressor />
        </div>
      </div>
    </section>
  );
}
