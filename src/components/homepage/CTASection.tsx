import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-border bg-white px-6 py-12 text-center shadow-sm sm:px-10">
          <h2 className="text-3xl font-bold text-foreground">
            Free templates, assets and tools for creators.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            Find the template, tool, or design asset that gets your next document
            finished with less friction.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/templates">
                Browse Templates
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/tools">Explore Tools</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
