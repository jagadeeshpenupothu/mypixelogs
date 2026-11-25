import type { Metadata } from "next";

import { CompressPDF } from "@/components/tools/CompressPDF";
import { createSocialMetadata } from "@/lib/metadata";

const title = "Compress PDF Online Free – Reduce PDF File Size";
const description =
  "Make a PDF smaller for email, WhatsApp or upload forms. Text stays sharp; only photos are made lighter. Free and private.";

export const metadata: Metadata = {
  title,
  description,
  ...createSocialMetadata({ title: `${title} | MyPixelogs`, description, path: "/tools/compress-pdf" }),
};

export default function CompressPdfPage() {
  return (
    <section className="pb-2">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">Make a PDF file smaller</h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Shrinks the photos inside your PDF and keeps the text sharp. You see the new size before you download. Nothing is uploaded.
          </p>
        </div>
        <div className="mt-6">
          <CompressPDF />
        </div>
      </div>
    </section>
  );
}
