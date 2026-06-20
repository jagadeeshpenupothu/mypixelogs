import type { Metadata } from "next";

import { ImageCropper } from "@/components/tools/ImageCropper";
import { createSocialMetadata } from "@/lib/metadata";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("image-cropper");
const title = "Free Image Cropper Online";
const description =
  "Crop PNG, JPG and WEBP images online using freeform and social-media aspect ratios.";

export const metadata: Metadata = {
  title,
  description,
  ...createSocialMetadata({
    title: `${title} | mypixelogs`,
    description,
    path: "/tools/image-cropper",
  }),
};

export default function ImageCropperPage() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            {tool?.name ?? "Image Cropper"}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal text-foreground sm:text-5xl">
            Crop images for social media and documents
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Upload an image, choose a freeform crop or popular aspect ratio, rotate
            and flip, then download the cropped file directly from your browser.
          </p>
        </div>

        <div className="mt-10">
          <ImageCropper />
        </div>
      </div>
    </section>
  );
}
