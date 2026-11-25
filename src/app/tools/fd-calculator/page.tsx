import type { Metadata } from "next";

import { FDCalculator } from "@/components/tools/FDCalculator";
import { createSocialMetadata } from "@/lib/metadata";

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
    <section className="pb-2">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            Calculate FD maturity and interest
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Estimate fixed deposit maturity amount, interest earned, yearly growth,
            and compare returns across different FD rates.
          </p>
        </div>

        <div className="mt-6">
          <FDCalculator />
        </div>
      </div>
    </section>
  );
}
