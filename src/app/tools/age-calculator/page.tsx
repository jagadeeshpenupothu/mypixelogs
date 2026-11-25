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
    <section className="pb-2">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            {tool?.name ?? "Age Calculator"}
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            Calculate exact age and next birthday
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Find age in years, months, and days, plus total days lived, birthday
            details, milestones, and a shareable summary card.
          </p>
        </div>

        <div className="mt-6">
          <AgeCalculator />
        </div>
      </div>
    </section>
  );
}
