import type { Metadata } from "next";

import { RotatePDF } from "@/components/tools/RotatePDF";
import { createSocialMetadata } from "@/lib/metadata";

const title = "Rotate PDF Online Free";
const description =
  "Rotate PDF pages online for free. Rotate all pages or selected pages and download instantly.";

export const metadata: Metadata = {
  title,
  description,
  ...createSocialMetadata({
    title: `${title} | MyPixelogs`,
    description,
    path: "/tools/rotate-pdf",
  }),
};

export default function RotatePDFPage() {
  return (
    <section className="pb-2">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            Rotate PDF pages online
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Upload a PDF, rotate every page or choose specific pages and ranges,
            then download the updated PDF directly from your browser.
          </p>
        </div>

        <div className="mt-6">
          <RotatePDF />
        </div>
      </div>
    </section>
  );
}
