import type { Metadata } from "next";

import { UniversalConverter } from "@/components/tools/UniversalConverter";

export const metadata: Metadata = {
  title: "Universal File Converter",
  description:
    "Convert images and files in your browser with automatic format detection and valid export options.",
};

export default function ConverterPage() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Universal converter
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal text-foreground sm:text-5xl">
            Convert files by detected format
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Upload a file and mypixelogs will detect its source format, show valid
            export options, and convert supported image formats directly in your browser.
          </p>
        </div>

        <div className="mt-10">
          <UniversalConverter />
        </div>
      </div>
    </section>
  );
}
