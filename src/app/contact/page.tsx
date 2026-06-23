import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSocialMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact MyPixelogs for questions about free templates, downloadable assets, and online tools.",
  ...createSocialMetadata({
    title: "Contact MyPixelogs",
    description:
      "Contact MyPixelogs for questions about free templates, downloadable assets, and online tools.",
    path: "/contact",
  }),
};

export default function ContactPage() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Contact</p>
          <h1 className="mt-3 text-4xl font-bold text-foreground sm:text-5xl">
            Get in touch with MyPixelogs.
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            Have a question about templates, assets, or tools? Send a message
            and the MyPixelogs team will review it.
          </p>
          <div className="mt-8 rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Email</h2>
            <p className="mt-2 text-sm text-muted-foreground">support@mypixelogs.com</p>
          </div>
        </div>

        <form
          action="mailto:support@mypixelogs.com"
          method="post"
          encType="text/plain"
          className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8"
        >
          <div className="grid gap-5">
            <div>
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Name
              </label>
              <Input id="name" name="name" className="mt-2" placeholder="Your name" />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                className="mt-2"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="subject" className="text-sm font-medium text-foreground">
                Subject
              </label>
              <Input
                id="subject"
                name="subject"
                className="mt-2"
                placeholder="How can we help?"
              />
            </div>
            <div>
              <label htmlFor="message" className="text-sm font-medium text-foreground">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                className="mt-2 flex w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground shadow-sm transition-[color,background-color,border-color,box-shadow] duration-200 placeholder:text-muted-foreground/80 hover:border-foreground/20 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 dark:bg-[#0A0A0A] dark:hover:border-white/20 md:text-sm"
                placeholder="Tell us what you need."
              />
            </div>
            <Button type="submit" className="w-full sm:w-fit">
              Send Message
            </Button>
            <p className="text-xs leading-5 text-muted-foreground">
              Submitting opens your email app so you can send the message
              directly to support@mypixelogs.com.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
