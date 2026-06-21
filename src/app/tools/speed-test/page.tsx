import type { Metadata } from "next";

import { SpeedTest } from "@/components/tools/SpeedTest";
import { createSocialMetadata } from "@/lib/metadata";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("speed-test");
const title = tool?.name ?? "Internet Speed Test";
const description =
  tool?.description ??
  "Run a real LibreSpeed-powered internet speed test for download, upload, ping, jitter, and connection quality.";

export const metadata: Metadata = {
  title,
  description,
  ...createSocialMetadata({
    title: `${title} | MyPixelogs`,
    description,
    path: "/tools/speed-test",
  }),
};

export default function SpeedTestPage() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Internet speed test
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal text-foreground sm:text-5xl">
            Test your connection in the browser
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Measure real download speed, upload speed, ping, jitter, network type,
            and connection suitability against your configured LibreSpeed backend.
          </p>
        </div>

        <div className="mt-10">
          <SpeedTest />
        </div>
      </div>
    </section>
  );
}
