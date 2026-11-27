import type { Metadata } from "next";

import { UniversalQrGenerator } from "@/components/tools/UniversalQrGenerator";
import { createSocialMetadata } from "@/lib/metadata";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("qr-generator");
const title = tool?.name ?? "Universal QR Code Generator";
const description =
  tool?.description ??
  "Create website, text, email, phone, SMS, WhatsApp, vCard, WiFi, Maps, Event, PDF, and social media QR codes in your browser.";

export const metadata: Metadata = {
  title,
  description,
  ...createSocialMetadata({
    title: `${title} | MyPixelogs`,
    description,
    path: "/tools/qr-generator",
  }),
};

export default function QrGeneratorPage() {
  return (
    <>
      <section className="pb-2">
        <div className="mx-auto max-w-site">
          <div className="max-w-3xl">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
              Create QR codes for every common workflow
            </h1>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              Generate direct QR codes for links, messages, contacts, WiFi,
              events, maps, PDFs, and social profiles with PNG and SVG downloads.
            </p>
          </div>

          <div className="mt-6">
            <UniversalQrGenerator />
          </div>
        </div>
      </section>
    </>
  );
}
