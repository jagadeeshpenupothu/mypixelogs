import type { Metadata } from "next";

import { FDCalculator } from "@/components/tools/FDCalculator";
import { createSocialMetadata } from "@/lib/metadata";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("fd-calculator");
const title = "FD Calculator Online Free";
const description =
  "Calculate FD maturity amount, interest earned and investment growth using our free FD calculator.";

export const metadata: Metadata = {
  title,
  description,
  ...createSocialMetadata({
    title: `${title} | MyPixelogs`,
    description,
    path: "/tools/fd-calculator",
  }),
};

export default function FDCalculatorPage() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            {tool?.name ?? "FD Calculator"}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal text-foreground sm:text-5xl">
            Calculate FD maturity and interest
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Estimate fixed deposit maturity amount, interest earned, yearly growth,
            and compare returns across different FD rates.
          </p>
        </div>

        <div className="mt-10">
          <FDCalculator />
        </div>
      </div>
    </section>
  );
}
