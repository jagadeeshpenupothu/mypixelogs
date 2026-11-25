import type { Metadata } from "next";

import { MergePDF } from "@/components/tools/MergePDF";
import { createSocialMetadata } from "@/lib/metadata";

const title = "Merge PDF Online Free – Combine PDF Files";
const description =
  "Combine two or more PDF files into one, in the order you choose. Free, no sign-up, and your files never leave your device.";

export const metadata: Metadata = {
  title,
  description,
  ...createSocialMetadata({ title: `${title} | MyPixelogs`, description, path: "/tools/merge-pdf" }),
};

export default function MergePdfPage() {
  return (
    <section className="pb-2">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">Merge PDF files into one</h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Pick your PDFs, put them in the right order, and download one joined PDF. Nothing is uploaded.
          </p>
        </div>
        <div className="mt-6">
          <MergePDF />
        </div>
      </div>
    </section>
  );
}
