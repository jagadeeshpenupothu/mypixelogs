import type { Metadata } from "next";

import { EnglishToTelugu } from "@/components/tools/EnglishToTelugu";
import { createSocialMetadata } from "@/lib/metadata";

const title = "English to Telugu Typing Online Free";
const description =
  "Type Telugu using English letters and instantly convert English text into Telugu online for free.";

export const metadata: Metadata = {
  title,
  description,
  ...createSocialMetadata({
    title: `${title} | MyPixelogs`,
    description,
    path: "/tools/english-to-telugu",
  }),
};

export default function EnglishToTeluguPage() {
  return (
    <section className="pb-2">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            Type Telugu with an English keyboard
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Enter Telugu words using English letters and instantly convert them
            into Telugu script in your browser.
          </p>
        </div>

        <div className="mt-6">
          <EnglishToTelugu />
        </div>
      </div>
    </section>
  );
}
