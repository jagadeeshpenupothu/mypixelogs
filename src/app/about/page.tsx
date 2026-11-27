import type { Metadata } from "next";
import Link from "next/link";

import { createSocialMetadata } from "@/lib/metadata";

const description =
  "MyPixelogs is a free set of simple tools for videos, photos and PDFs, plus ready-made templates. No sign-up, and files stay on your device.";

export const metadata: Metadata = {
  title: "About",
  description,
  ...createSocialMetadata({ title: "About MyPixelogs", description, path: "/about" }),
};

export default function AboutPage() {
  return (
    <section className="py-8 sm:py-14">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-10 2xl:px-14">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">About MyPixelogs</h1>
        <div className="mt-5 space-y-4 text-base leading-7 text-muted-foreground">
          <p>
            MyPixelogs is a set of free, simple tools for everyday jobs: making a video or PDF smaller, joining PDFs,
            resizing a photo, working out a loan EMI, and more. There are also ready-made templates you can fill in and
            download.
          </p>
          <p>
            There is no sign-up and nothing to install. Most tools run inside your browser, so your files stay on your own
            phone or computer.
          </p>
          <p>
            <Link href="/tools" className="font-semibold text-primary hover:underline">
              See all tools
            </Link>{" "}
            or{" "}
            <Link href="/templates" className="font-semibold text-primary hover:underline">
              browse templates
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
