import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about mypixelogs, a free platform for professional templates, design resources, and browser-based online tools.",
};

const highlights = [
  {
    title: "Free Templates",
    description:
      "Ready-to-use invoices, receipts, resumes, certificates, and letterheads for business and personal workflows.",
  },
  {
    title: "Design Resources",
    description:
      "Downloadable PSD, Canva, logo, and icon resources built for fast creative work.",
  },
  {
    title: "Online Tools",
    description:
      "Browser-first utilities for converting, compressing, and generating files without complicated setup.",
  },
];

export default function AboutPage() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">About</p>
          <h1 className="mt-3 text-4xl font-bold text-foreground sm:text-5xl">
            Free business templates, resources, and tools for modern work.
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
            mypixelogs helps creators, freelancers, students, and small teams
            find practical digital assets faster. The platform brings together
            professional templates, editable design resources, and simple online
            tools in one clean, searchable place.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-border bg-card p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <h2 className="text-lg font-semibold text-foreground">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold text-foreground">What we are building</h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            The goal of mypixelogs is to make everyday documents and digital
            utilities easier to access. Every template and resource is organized
            with descriptive pages, categories, and related content so visitors
            can discover useful files without friction.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/templates">Browse templates</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/tools">Explore tools</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
