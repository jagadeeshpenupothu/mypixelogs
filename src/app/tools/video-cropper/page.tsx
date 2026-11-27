import type { Metadata } from "next";

import { VideoCropper } from "@/components/tools/VideoCropper";
import { createSocialMetadata } from "@/lib/metadata";

const title = "Crop Video Online Free";
const description =
  "Crop MP4, MOV, WebM, MKV and AVI videos in your browser with a draggable box or preset shapes. Nothing is uploaded.";

export const metadata: Metadata = {
  title,
  description,
  ...createSocialMetadata({ title: `${title} | MyPixelogs`, description, path: "/tools/video-cropper" }),
};

export default function VideoCropperPage() {
  return (
    <section className="pb-2">
      <div className="mx-auto max-w-site">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            Crop a video to any shape
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Drag the box, pick a shape or type a size, check the preview, then export. Nothing is uploaded.
          </p>
        </div>
        <div className="mt-6">
          <VideoCropper />
        </div>
      </div>
    </section>
  );
}
