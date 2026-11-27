import type { Metadata } from "next";

import { ContactForm } from "@/components/contact/ContactForm";
import { createSocialMetadata } from "@/lib/metadata";

const description = "Contact MyPixelogs: ask a question, request a template or tool, or report a problem. We read every message.";

export const metadata: Metadata = {
  title: "Contact",
  description,
  ...createSocialMetadata({ title: "Contact MyPixelogs", description, path: "/contact" }),
};

export default function ContactPage() {
  return (
    <section className="py-8 sm:py-14">
      <div className="mx-auto grid max-w-site gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 2xl:px-14">
        <div>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Contact MyPixelogs</h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            Have a question, found a bug, or want a template or tool we don&apos;t have yet? Send us a message. We read every one and
            usually reply within two working days.
          </p>
          <ul className="mt-6 space-y-2 text-sm leading-6 text-muted-foreground">
            <li>• Template or tool requests are welcome; popular requests get built first.</li>
            <li>• For a problem with a tool, tell us the page and what happened.</li>
            <li>• Please don&apos;t send passwords, bank details or other private information.</li>
          </ul>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
