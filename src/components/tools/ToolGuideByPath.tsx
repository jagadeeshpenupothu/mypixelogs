"use client";

import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { siteConfig } from "@/constants/site";
import { toolGuides } from "@/data/tool-guides";
import { getAbsoluteUrl } from "@/lib/metadata";
import { getToolBySlug } from "@/lib/tools";
import type { ToolCategory } from "@/types/tool";

const applicationCategory: Partial<Record<ToolCategory, string>> = {
  "Video Tools": "MultimediaApplication",
  "Image Tools": "MultimediaApplication",
  "Calculator Tools": "FinanceApplication",
  "Developer Tools": "DeveloperApplication",
};

/** "How to" steps and common questions under each tool, plus the same facts for search engines. */
export function ToolGuideByPath() {
  const pathname = usePathname();
  const slug = pathname.split("/").filter(Boolean).at(-1) ?? "";
  const tool = getToolBySlug(slug);
  const guide = toolGuides[slug];

  if (!tool || !guide) return null;

  const url = getAbsoluteUrl(`/tools/${tool.slug}`);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: tool.name,
      url,
      description: tool.description,
      applicationCategory: applicationCategory[tool.category] ?? "UtilitiesApplication",
      operatingSystem: "Any (runs in a web browser)",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: guide.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    },
  ];

  return (
    <section aria-labelledby="guide-title" className="mx-auto mt-14 grid max-w-site gap-8 lg:grid-cols-2">
      <div>
        <h2 id="guide-title" className="text-xl font-bold text-foreground sm:text-2xl">
          How to {guide.task}
        </h2>
        <ol className="mt-4 space-y-3">
          {guide.steps.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {index + 1}
              </span>
              <span className="pt-0.5 text-base leading-7 text-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">Questions people ask</h2>
        <div className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
          {guide.faqs.map((faq) => (
            <details key={faq.q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-base font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                {faq.q}
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="px-4 pb-4 text-sm leading-6 text-muted-foreground">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  );
}
