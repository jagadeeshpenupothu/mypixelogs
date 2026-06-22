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
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              QR generator
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-normal text-foreground sm:text-5xl">
              Create QR codes for every common workflow
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              Generate direct QR codes for links, messages, contacts, WiFi,
              events, maps, PDFs, and social profiles with PNG and SVG downloads.
            </p>
          </div>

          <div className="mt-10">
            <UniversalQrGenerator />
          </div>
        </div>
      </section>
    </>
  );
}
