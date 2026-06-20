import type { Metadata } from "next";

import { ResourceCard } from "@/components/cards/ResourceCard";
import { resources } from "@/data/resources";

export const metadata: Metadata = {
  title: "Free Design Resources",
  description: "Discover free Canva templates, PSD files, icons, logo templates, and business assets.",
};

export default function ResourcesPage() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Resources</p>
          <h1 className="mt-3 text-4xl font-bold text-foreground">Free design resources</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Canva templates, PSD resources, icon sets, and logo files for modern
            business and creative workflows.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </div>
    </section>
  );
}
