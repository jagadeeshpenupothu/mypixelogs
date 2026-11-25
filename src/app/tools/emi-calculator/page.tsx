import type { Metadata } from "next";

import { EMICalculator } from "@/components/tools/EMICalculator";
import { createSocialMetadata } from "@/lib/metadata";

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
    <section className="pb-2">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            Calculate loan EMI instantly
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Estimate your monthly EMI, total interest, total payment, and month-by-month
            amortization schedule for loans in INR.
          </p>
        </div>

        <div className="mt-6">
          <EMICalculator />
        </div>
      </div>
    </section>
  );
}
