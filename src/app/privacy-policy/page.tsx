import type { Metadata } from "next";

import { createSocialMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the MyPixelogs privacy policy for our free templates, assets, and browser-based online tools.",
  ...createSocialMetadata({
    title: "Privacy Policy",
    description:
      "Read the MyPixelogs privacy policy for our free templates, assets, and browser-based online tools.",
    path: "/privacy-policy",
  }),
};

const sections = [
  {
    title: "Information we collect",
    body: "MyPixelogs is a free content and tools website. To understand what people find useful, we count visits and actions: pages visited, downloads, music and sound plays, prompt copies, searches on the site, the site you came from, browser, device type and country. We use Google Analytics and our own simple counter, which gives each browser an anonymous random ID kept in browser storage. We do not collect names, email addresses or IP addresses in our own counter, and files you open in our tools are never uploaded.",
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
    body: "Template and asset downloads may include links to downloadable files or third-party websites. External websites have their own privacy practices, and you should review their policies before sharing personal information.",
  },
  {
    title: "Contact",
    body: "For privacy questions, see our Contact page. We may update this policy as the platform grows and new features are added.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <section className="py-8 sm:py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-10 2xl:px-14">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-5 text-base leading-7 text-muted-foreground">
          This policy explains how MyPixelogs approaches privacy for visitors
          using our free templates, assets, and online tools.
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
