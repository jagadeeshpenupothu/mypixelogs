import type { Metadata } from "next";

import { DeletePDFPages } from "@/components/tools/DeletePDFPages";
import { createSocialMetadata } from "@/lib/metadata";

const title = "Delete PDF Pages Online Free";
const description =
  "Remove pages from a PDF by tapping them, then download the new file. See every page before you delete. Free and private.";

export const metadata: Metadata = {
  title,
  description,
  ...createSocialMetadata({ title: `${title} | MyPixelogs`, description, path: "/tools/delete-pdf-pages" }),
};

export default function DeletePdfPagesPage() {
  return (
    <section className="pb-2">
      <div className="mx-auto max-w-site">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">Remove pages from a PDF</h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Tap the pages you don&apos;t want, then download the PDF without them. Nothing is uploaded.
          </p>
        </div>
        <div className="mt-6">
          <DeletePDFPages />
        </div>
      </div>
    </section>
  );
}
