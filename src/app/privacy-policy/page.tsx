import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the mypixelogs privacy policy for our free templates, resources, and browser-based online tools.",
};

const sections = [
  {
    title: "Information we collect",
    body: "mypixelogs is designed as a free content and tools website. We may collect basic usage information such as pages visited, browser type, referring pages, and general device information to understand site performance and improve content.",
  },
  {
    title: "Browser-based tools",
    body: "Where tools run in your browser, files are processed locally in the browser session unless a page clearly states otherwise. We do not require accounts for the free tools currently provided on the website.",
  },
  {
    title: "Local preferences",
    body: "The site may store preferences such as theme selection, recent searches, or tool settings in your browser using localStorage or similar browser storage so the experience works better when you return.",
  },
  {
    title: "Downloads and external links",
    body: "Template and resource downloads may include links to downloadable files or third-party websites. External websites have their own privacy practices, and you should review their policies before sharing personal information.",
  },
  {
    title: "Contact",
    body: "For privacy questions, contact us at support@mypixelogs.com. We may update this policy as the platform grows and new features are added.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Privacy Policy</p>
        <h1 className="mt-3 text-4xl font-bold text-foreground sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-5 text-base leading-7 text-muted-foreground">
          This policy explains how mypixelogs approaches privacy for visitors
          using our free templates, resources, and online tools.
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
