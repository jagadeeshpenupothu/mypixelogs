import type { Metadata } from "next";

import { GSTCalculator } from "@/components/tools/GSTCalculator";
import { createSocialMetadata } from "@/lib/metadata";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("gst-calculator");
const title = "GST Calculator Online Free";
const description =
  "Calculate GST, CGST and SGST instantly. Add or remove GST from any amount using our free GST calculator.";

export const metadata: Metadata = {
  title,
  description,
  ...createSocialMetadata({
    title: `${title} | MyPixelogs`,
    description,
    path: "/tools/gst-calculator",
  }),
};

export default function GSTCalculatorPage() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            {tool?.name ?? "GST Calculator"}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal text-foreground sm:text-5xl">
            Calculate GST, CGST and SGST instantly
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Add GST to a base amount or remove included GST from a final amount
            with a clear CGST and SGST split.
          </p>
        </div>

        <div className="mt-10">
          <GSTCalculator />
        </div>
      </div>
    </section>
  );
}
