import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ResourceCard } from "@/components/cards/ResourceCard";
import { Button } from "@/components/ui/button";
import { resources } from "@/data/resources";

export function ResourcesSection() {
  const featuredResources = resources.slice(0, 4);

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Featured resources
            </p>
            <h2 className="mt-3 text-3xl font-bold text-foreground">
              Assets for polished business work
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              PSD resources, Canva-style packs, logo assets, and icon collections
              for faster creative workflows.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/resources">
              View All Resources
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </div>
    </section>
  );
}
