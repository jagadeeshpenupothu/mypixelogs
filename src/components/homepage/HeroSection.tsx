import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

const popularSearches = [
  { label: "Invoice Template", href: "/search?q=invoice%20template" },
  { label: "Age Calculator", href: "/tools/age-calculator" },
  { label: "PDF Merge", href: "/tools/pdf-tools" },
  { label: "JSON Formatter", href: "/tools/developer-tools" },
  { label: "Image Compressor", href: "/tools/image-compressor" },
  { label: "QR Generator", href: "/tools/qr-generator" },
];

const quickAccess = [
  { label: "Trending", icon: "🔥", href: "/tools" },
  { label: "PDF Tools", icon: "📄", href: "/tools/pdf-tools" },
  { label: "Calculators", icon: "🧮", href: "/tools/calculator-tools" },
  { label: "Developer Tools", icon: "💻", href: "/tools/developer-tools" },
  { label: "Image Tools", icon: "🖼️", href: "/tools/image-tools" },
  { label: "Text Tools", icon: "📝", href: "/tools/text-tools" },
  { label: "Templates", icon: "📁", href: "/templates" },
  { label: "Assets", icon: "📚", href: "/assets" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-white dark:bg-black">
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-20">
        <div className="flex flex-col justify-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">
            Free business-ready assets
          </p>
          <h1 className="max-w-4xl text-4xl font-bold tracking-normal text-foreground sm:text-5xl lg:text-6xl lg:leading-[1.05]">
            Free Templates, Tools & Design Assets
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Download professional templates, business documents, PDF tools, Canva
            templates, logos, icon packs and more.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/templates">
                Browse Templates
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/tools">Explore Tools</Link>
            </Button>
          </div>
          <div className="mt-8 max-w-3xl rounded-lg border border-border bg-card p-3 shadow-sm">
            <form action="/search" className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex min-h-12 flex-1 items-center gap-3 rounded-md border border-input bg-background px-4 transition-[border-color,box-shadow] duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 dark:bg-[#0A0A0A]">
                <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
                <input
                  name="q"
                  aria-label="Search templates, tools and assets"
                  placeholder="Search templates, PDF tools, calculators, developer tools and assets..."
                  className="h-12 min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground/80"
                />
              </div>
              <Button type="submit" size="lg" className="sm:h-12">
                Search
              </Button>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              {popularSearches.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-colors duration-200 hover:border-foreground/20 hover:text-foreground dark:bg-[#0A0A0A] dark:hover:border-white/20"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
              {quickAccess.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground transition-colors duration-200 hover:border-foreground/20 hover:bg-muted dark:bg-[#0A0A0A] dark:hover:border-white/20"
                >
                  <span aria-hidden="true">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center lg:justify-end">
          <div className="w-full max-w-lg rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border border-blue-100 bg-blue-50 p-4 dark:bg-[#171717]">
                <div className="h-3 w-20 rounded-full bg-blue-300 dark:bg-white/20" />
                <div className="mt-6 space-y-2">
                  <div className="h-2 rounded-full bg-white dark:bg-white/10" />
                  <div className="h-2 w-4/5 rounded-full bg-white dark:bg-white/10" />
                  <div className="h-2 w-3/5 rounded-full bg-white dark:bg-white/10" />
                </div>
                <div className="mt-8 h-20 rounded-md bg-white/80 dark:bg-black/40" />
              </div>
              <div className="space-y-4">
                <div className="rounded-md border border-border bg-white/50 p-4 dark:bg-white/[0.03]">
                  <div className="h-10 w-10 rounded-md bg-primary" />
                  <div className="mt-4 h-2 rounded-full bg-slate-200" />
                  <div className="mt-2 h-2 w-2/3 rounded-full bg-slate-200" />
                </div>
                <div className="rounded-md border border-border bg-white/50 p-4 dark:bg-white/[0.03]">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-12 rounded bg-blue-100 dark:bg-white/10" />
                    <div className="h-12 rounded bg-sky-100 dark:bg-white/[0.14]" />
                    <div className="h-12 rounded bg-slate-100 dark:bg-black/40" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
