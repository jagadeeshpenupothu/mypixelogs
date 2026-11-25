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
    <section className="pb-2">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            {tool?.name ?? "GST Calculator"}
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            Calculate GST, CGST and SGST instantly
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Add GST to a base amount or remove included GST from a final amount
            with a clear CGST and SGST split.
          </p>
        </div>

        <div className="mt-6">
          <GSTCalculator />
        </div>
      </div>
    </section>
  );
}
