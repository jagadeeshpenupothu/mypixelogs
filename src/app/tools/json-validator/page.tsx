import type { Metadata } from "next";

import { JSONValidator } from "@/components/tools/JSONValidator";
import { createSocialMetadata } from "@/lib/metadata";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("json-validator");
const title = "JSON Validator Online Free";
const description =
  "Validate JSON instantly. Detect errors, format JSON and download valid JSON files.";

export const metadata: Metadata = {
  title,
  description,
  ...createSocialMetadata({
    title: `${title} | MyPixelogs`,
    description,
    path: "/tools/json-validator",
  }),
};

export default function JSONValidatorPage() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            {tool?.name ?? "JSON Validator"}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal text-foreground sm:text-5xl">
            Validate, format, and minify JSON
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Paste JSON or upload a `.json` file to detect syntax errors, format
            clean output, minify data, copy, and download valid JSON.
          </p>
        </div>

        <div className="mt-10">
          <JSONValidator />
        </div>
      </div>
    </section>
  );
}
