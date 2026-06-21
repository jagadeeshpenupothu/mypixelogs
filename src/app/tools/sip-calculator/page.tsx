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
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            {tool?.name ?? "SIP Calculator"}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal text-foreground sm:text-5xl">
            Calculate SIP returns and maturity value
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Estimate wealth growth from monthly SIP investments, expected returns,
            investment duration, and optional goal amount.
          </p>
        </div>

        <div className="mt-10">
          <SIPCalculator />
        </div>
      </div>
    </section>
  );
}
