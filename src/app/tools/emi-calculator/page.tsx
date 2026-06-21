import type { Metadata } from "next";

import { EMICalculator } from "@/components/tools/EMICalculator";
import { createSocialMetadata } from "@/lib/metadata";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("emi-calculator");
const title = "EMI Calculator Online Free";
const description =
  "Calculate monthly EMI, total interest and loan repayment instantly using our free EMI calculator.";

export const metadata: Metadata = {
  title,
  description,
  ...createSocialMetadata({
    title: `${title} | MyPixelogs`,
    description,
    path: "/tools/emi-calculator",
  }),
};

export default function EMICalculatorPage() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            {tool?.name ?? "EMI Calculator"}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal text-foreground sm:text-5xl">
            Calculate loan EMI instantly
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Estimate your monthly EMI, total interest, total payment, and month-by-month
            amortization schedule for loans in INR.
          </p>
        </div>

        <div className="mt-10">
          <EMICalculator />
        </div>
      </div>
    </section>
  );
}
