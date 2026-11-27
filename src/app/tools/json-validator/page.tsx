import type { Metadata } from "next";

import { JSONValidator } from "@/components/tools/JSONValidator";
import { createSocialMetadata } from "@/lib/metadata";

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
    <section className="pb-2">
      <div className="mx-auto max-w-site">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            Validate, format, and minify JSON
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Paste JSON or upload a `.json` file to detect syntax errors, format
            clean output, minify data, copy, and download valid JSON.
          </p>
        </div>

        <div className="mt-6">
          <JSONValidator />
        </div>
      </div>
    </section>
  );
}
