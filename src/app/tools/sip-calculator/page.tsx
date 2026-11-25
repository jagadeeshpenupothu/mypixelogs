import type { Metadata } from "next";

import { SIPCalculator } from "@/components/tools/SIPCalculator";
import { createSocialMetadata } from "@/lib/metadata";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("sip-calculator");
const title = "SIP Calculator Online Free";
const description =
  "Calculate SIP returns, maturity value and wealth growth using our free SIP calculator.";

export const metadata: Metadata = {
  title,
  description,
  ...createSocialMetadata({
    title: `${title} | MyPixelogs`,
    description,
    path: "/tools/sip-calculator",
  }),
};

export default function SIPCalculatorPage() {
  return (
    <section className="pb-2">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            {tool?.name ?? "SIP Calculator"}
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            Calculate SIP returns and maturity value
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Estimate wealth growth from monthly SIP investments, expected returns,
            investment duration, and optional goal amount.
          </p>
        </div>

        <div className="mt-6">
          <SIPCalculator />
        </div>
      </div>
    </section>
  );
}
