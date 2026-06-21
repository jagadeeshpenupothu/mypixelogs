import { CheckCircle2 } from "lucide-react";

const reasons = [
  "Free Downloads",
  "No Registration Required",
  "SEO-Friendly Templates",
  "Professional Resources",
  "Fast Online Tools",
];

export function WhyMypixelogsSection() {
  return (
    <section className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Why MyPixelogs
          </p>
          <h2 className="mt-3 text-3xl font-bold text-foreground">
            Built for fast, practical creation
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            A focused library of business-ready templates, creative assets, and
            browser tools designed for repeat use.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {reasons.map((reason) => (
            <div
              key={reason}
              className="rounded-lg border border-border bg-card p-5 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md dark:hover:border-white/20 dark:hover:shadow-soft"
            >
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <h3 className="mt-4 text-base font-semibold text-foreground">{reason}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
