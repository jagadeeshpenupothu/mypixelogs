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

const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: "Information we collect",
    body: "MyPixelogs is a free content and tools website. To understand what people find useful, we count visits and actions: pages visited, downloads, music and sound plays, prompt copies, searches on the site, the site you came from, browser, device type, screen size, language, approximate location (country and city) and page loading speed. We do not collect names, email addresses or IP addresses in our own counter.",
  },
  {
    title: "Analytics",
    body: "We use Google Analytics and our own simple counter. Our counter gives each browser an anonymous random ID stored in your browser's local storage, so we can tell new visitors from returning ones. Google Analytics uses cookies; Google's practices are described at policies.google.com/privacy.",
  },
  {
    title: "Advertising and cookies",
    body: (
      <>
        We may show ads from Google AdSense. Third-party vendors, including Google, use cookies to serve ads based on your prior visits to
        this website or other websites. Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your
        visits to this and/or other sites on the internet. You can opt out of personalised advertising in{" "}
        <a href="https://adssettings.google.com" target="_blank" rel="noopener" className="text-primary hover:underline">Google Ads Settings</a>, or opt
        out of some third-party vendors&apos; use of cookies for personalised advertising at{" "}
        <a href="https://www.aboutads.info/choices" target="_blank" rel="noopener" className="text-primary hover:underline">aboutads.info</a>. Learn more in{" "}
        <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener" className="text-primary hover:underline">how Google uses cookies in advertising</a>.
        Visitors in the European Economic Area, the UK and Switzerland are asked for consent before personalised ads are shown.
      </>
    ),
  },
  {
    title: "Browser-based tools",
    body: "Our video, image and PDF tools run inside your browser. Files you open in them are processed on your own device and are never uploaded to our servers. We do not require accounts.",
  },
  {
    title: "Contact messages",
    body: "If you use the contact form, we store your message and any name or email address you choose to give, only to read and reply to it. We don't share it or add you to mailing lists.",
  },
  {
    title: "Local preferences",
    body: "The site may store preferences such as theme selection or tool settings in your browser so the experience works better when you return. You can clear them at any time in your browser settings.",
  },
  {
    title: "Downloads and external links",
    body: "Some templates open in other services (Google Docs, Canva, Photopea, Overleaf, ChatGPT) and some files come from third-party creators under their licences. Those websites have their own privacy practices.",
  },
  {
    title: "Children",
    body: "MyPixelogs is not directed at children under 13, and we do not knowingly collect personal information from them.",
  },
  {
    title: "Contact and changes",
    body: (
      <>
        For privacy questions, use our <a href="/contact" className="text-primary hover:underline">contact form</a>. We may update this policy as the
        site grows; the date below shows the latest change. Last updated: 27 November 2026.
      </>
    ),
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
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">{section.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
