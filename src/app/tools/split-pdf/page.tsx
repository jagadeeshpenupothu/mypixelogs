import type { Metadata } from "next";

import { SplitPDF } from "@/components/tools/SplitPDF";
import { createSocialMetadata } from "@/lib/metadata";

const title = "Split PDF Online Free – Separate PDF Pages";
const description =
  "Split a PDF into several files by page ranges, every few pages, or one file per page. Free, private and works on your phone.";

export const metadata: Metadata = {
  title,
  description,
  ...createSocialMetadata({ title: `${title} | MyPixelogs`, description, path: "/tools/split-pdf" }),
};

export default function SplitPdfPage() {
  return (
    <section className="pb-2">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">Split a PDF into separate files</h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Choose where to cut, then download each part or all of them in one ZIP. Nothing is uploaded.
          </p>
        </div>
        <div className="mt-6">
          <SplitPDF />
        </div>
      </div>
    </section>
  );
}
