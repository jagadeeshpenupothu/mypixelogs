import type { Metadata } from "next";

import { PDFToJPG } from "@/components/tools/PDFToJPG";
import { createSocialMetadata } from "@/lib/metadata";

const title = "PDF to JPG Converter Online Free";
const description =
  "Save PDF pages as JPG or PNG pictures at 72, 150 or 300 DPI. Convert every page or just the ones you need. Free and private.";

export const metadata: Metadata = {
  title,
  description,
  ...createSocialMetadata({ title: `${title} | MyPixelogs`, description, path: "/tools/pdf-to-jpg" }),
};

export default function PdfToJpgPage() {
  return (
    <section className="pb-2">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">Save PDF pages as JPG pictures</h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Every page you pick becomes its own picture. Download one, or all of them in a ZIP. Nothing is uploaded.
          </p>
        </div>
        <div className="mt-6">
          <PDFToJPG />
        </div>
      </div>
    </section>
  );
}
