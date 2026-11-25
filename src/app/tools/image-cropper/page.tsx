import type { Metadata } from "next";

import { ImageCropper } from "@/components/tools/ImageCropper";
import { createSocialMetadata } from "@/lib/metadata";

const title = "Free Image Cropper Online";
const description =
  "Crop PNG, JPG and WEBP images online using freeform and social-media aspect ratios.";

export const metadata: Metadata = {
  title,
  description,
  ...createSocialMetadata({
    title: `${title} | MyPixelogs`,
    description,
    path: "/tools/image-cropper",
  }),
};

export default function ImageCropperPage() {
  return (
    <section className="pb-2">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            Crop images for social media and documents
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Upload an image, choose a freeform crop or popular aspect ratio, rotate
            and flip, then download the cropped file directly from your browser.
          </p>
        </div>

        <div className="mt-6">
          <ImageCropper />
        </div>
      </div>
    </section>
  );
}
