import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-white">
      <div className="absolute inset-x-0 top-0 h-64 bg-[linear-gradient(180deg,#eff6ff_0%,rgba(239,246,255,0)_100%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
        <div className="flex flex-col justify-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">
            Free business-ready assets
          </p>
          <h1 className="max-w-4xl text-4xl font-bold tracking-normal text-foreground sm:text-5xl lg:text-6xl">
            Free Templates, Tools & Design Resources
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Download professional templates, business documents, PDF tools, Canva
            resources, logos, PSD files and more.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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
          <div className="mt-8 max-w-xl rounded-lg border border-border bg-white p-2 shadow-soft">
            <div className="flex items-center gap-2">
              <Search className="ml-2 h-5 w-5 text-muted-foreground" />
              <Input
                aria-label="Search templates and tools"
                placeholder="Search invoices, resumes, PDF tools..."
                className="border-0 shadow-none focus-visible:ring-0"
              />
              <Button className="hidden sm:inline-flex">Search</Button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center lg:justify-end">
          <div className="w-full max-w-lg rounded-lg border border-border bg-white p-4 shadow-soft">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
                <div className="h-3 w-20 rounded-full bg-blue-300" />
                <div className="mt-6 space-y-2">
                  <div className="h-2 rounded-full bg-white" />
                  <div className="h-2 w-4/5 rounded-full bg-white" />
                  <div className="h-2 w-3/5 rounded-full bg-white" />
                </div>
                <div className="mt-8 h-20 rounded-md bg-white/80" />
              </div>
              <div className="space-y-4">
                <div className="rounded-md border border-border p-4">
                  <div className="h-10 w-10 rounded-md bg-primary" />
                  <div className="mt-4 h-2 rounded-full bg-slate-200" />
                  <div className="mt-2 h-2 w-2/3 rounded-full bg-slate-200" />
                </div>
                <div className="rounded-md border border-border p-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-12 rounded bg-blue-100" />
                    <div className="h-12 rounded bg-sky-100" />
                    <div className="h-12 rounded bg-slate-100" />
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
