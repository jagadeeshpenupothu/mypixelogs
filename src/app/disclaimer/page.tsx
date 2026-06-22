import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "Read the MyPixelogs disclaimer for free templates, downloadable assets, and browser-based tools.",
};

const sections = [
  {
    title: "Provided as-is",
    body: "Templates, assets, examples, and tools on MyPixelogs are provided as-is for general use. We do not guarantee that every file will fit every business, legal, financial, or creative requirement.",
  },
  {
    title: "No professional advice",
    body: "Content on MyPixelogs is informational and should not be treated as legal, financial, tax, design, or professional advice. Review documents with a qualified professional when needed.",
  },
  {
    title: "Accuracy and availability",
    body: "We aim to keep content useful and accurate, but files, descriptions, links, formats, and tool behavior may change or become unavailable over time.",
  },
  {
    title: "External websites",
    body: "MyPixelogs may link to external websites or file locations. We are not responsible for third-party content, policies, availability, or downloads.",
  },
];

export default function DisclaimerPage() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Disclaimer</p>
        <h1 className="mt-3 text-4xl font-bold text-foreground sm:text-5xl">Disclaimer</h1>
        <p className="mt-5 text-base leading-7 text-muted-foreground">
          This disclaimer explains the limits of the free templates, assets,
          and browser-based tools available on MyPixelogs.
        </p>

        <div className="mt-10 space-y-5">
          {sections.map((section) => (
            <article key={section.title} className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                {section.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
