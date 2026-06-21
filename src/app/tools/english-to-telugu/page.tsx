import type { Metadata } from "next";

import { EnglishToTelugu } from "@/components/tools/EnglishToTelugu";
import { createSocialMetadata } from "@/lib/metadata";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("english-to-telugu");
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
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            {tool?.name ?? "English to Telugu Typing"}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal text-foreground sm:text-5xl">
            Type Telugu with an English keyboard
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Enter Telugu words using English letters and instantly convert them
            into Telugu script in your browser.
          </p>
        </div>

        <div className="mt-10">
          <EnglishToTelugu />
        </div>
      </div>
    </section>
  );
}
