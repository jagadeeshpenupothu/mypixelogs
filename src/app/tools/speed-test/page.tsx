import type { Metadata } from "next";

import { SpeedTest } from "@/components/tools/SpeedTest";
import { createSocialMetadata } from "@/lib/metadata";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("speed-test");
const title = tool?.name ?? "Internet Speed Test";
const description =
  tool?.description ??
  "Free internet speed test. Check your download and upload speed, ping and jitter in your browser.";

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
    <section className="pb-2">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            Test your connection in the browser
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            See your download and upload speed, ping and jitter.
          </p>
        </div>

        <div className="mt-6">
          <SpeedTest />
        </div>
      </div>
    </section>
  );
}
