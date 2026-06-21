import type { Metadata } from "next";

import { AgeCalculator } from "@/components/tools/AgeCalculator";
import { createSocialMetadata } from "@/lib/metadata";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("age-calculator");
const title = "Age Calculator Online Free";
const description =
  "Calculate exact age in years, months and days. Find next birthday, total days lived and more.";

export const metadata: Metadata = {
  title,
  description,
  ...createSocialMetadata({
    title: `${title} | MyPixelogs`,
    description,
    path: "/tools/age-calculator",
  }),
};

export default function AgeCalculatorPage() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            {tool?.name ?? "Age Calculator"}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal text-foreground sm:text-5xl">
            Calculate exact age and next birthday
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Find age in years, months, and days, plus total days lived, birthday
            details, milestones, and a shareable summary card.
          </p>
        </div>

        <div className="mt-10">
          <AgeCalculator />
        </div>
      </div>
    </section>
  );
}
