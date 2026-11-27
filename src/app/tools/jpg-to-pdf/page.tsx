import type { Metadata } from "next";

import { JPGToPDF } from "@/components/tools/JPGToPDF";
import { createSocialMetadata } from "@/lib/metadata";

const title = "JPG to PDF Converter Online Free";
const description =
  "Convert JPG, PNG and WebP photos into one PDF. Choose A4 or Letter, set the border, and download. Free and private.";

export const metadata: Metadata = {
  title,
  description,
  ...createSocialMetadata({ title: `${title} | MyPixelogs`, description, path: "/tools/jpg-to-pdf" }),
};

export default function JpgToPdfPage() {
  return (
    <section className="pb-2">
      <div className="mx-auto max-w-site">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">Turn photos into a PDF</h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Add one or many photos, put them in order, and download a single PDF. Nothing is uploaded.
          </p>
        </div>
        <div className="mt-6">
          <JPGToPDF />
        </div>
      </div>
    </section>
  );
}
