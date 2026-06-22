import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Review the terms and conditions for using MyPixelogs templates, assets, and online tools.",
};

const sections = [
  {
    title: "Use of the website",
    body: "By using MyPixelogs, you agree to use the website, templates, assets, and tools for lawful purposes and in a way that does not disrupt the platform or other users.",
  },
  {
    title: "Templates and assets",
    body: "Free templates and assets are provided to help with common business, creative, and personal workflows. You are responsible for reviewing and adapting any downloaded file before using it in a professional setting.",
  },
  {
    title: "Online tools",
    body: "Tools are provided for convenience and may process files locally in your browser. You should keep backup copies of important files and verify output before relying on it.",
  },
  {
    title: "Intellectual property",
    body: "The MyPixelogs brand, website design, written content, and platform structure belong to MyPixelogs. Third-party names, formats, and trademarks remain the property of their respective owners.",
  },
  {
    title: "Changes to terms",
    body: "We may update these terms as the website evolves. Continued use of MyPixelogs after updates means you accept the revised terms.",
  },
];

export default function TermsPage() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Terms</p>
        <h1 className="mt-3 text-4xl font-bold text-foreground sm:text-5xl">
          Terms and Conditions
        </h1>
        <p className="mt-5 text-base leading-7 text-muted-foreground">
          These terms describe the basic rules for using MyPixelogs and the
          free content available on the platform.
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
