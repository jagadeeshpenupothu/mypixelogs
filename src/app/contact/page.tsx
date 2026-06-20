import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact mypixelogs for questions about free templates, downloadable resources, and online tools.",
};

export default function ContactPage() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Contact</p>
          <h1 className="mt-3 text-4xl font-bold text-foreground sm:text-5xl">
            Get in touch with mypixelogs.
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            Have a question about templates, resources, tools, or future
            content? Use the form UI below as a placeholder for your production
            contact workflow.
          </p>
          <div className="mt-8 rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Email</h2>
            <p className="mt-2 text-sm text-muted-foreground">support@mypixelogs.com</p>
          </div>
        </div>

        <form className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
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
                className="mt-2 flex w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
                placeholder="Tell us what you need."
              />
            </div>
            <Button type="button" className="w-full sm:w-fit">
              Send Message
            </Button>
            <p className="text-xs leading-5 text-muted-foreground">
              This contact form is a front-end placeholder and does not submit
              messages yet.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
