import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { Resource } from "@/types/resource";

type ResourceCardProps = {
  resource: Resource;
};

export function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <Link
      href={`/resources/${resource.id}`}
      className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft"
    >
      <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-blue-50 via-white to-sky-100 px-8">
        <div className="w-full rounded-md border border-blue-100 bg-white p-5 shadow-sm">
          <div className="h-3 w-20 rounded-full bg-blue-200" />
          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="h-14 rounded-md bg-blue-100" />
            <div className="h-14 rounded-md bg-sky-100" />
            <div className="h-14 rounded-md bg-slate-100" />
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {resource.category}
            </p>
            <h3 className="mt-2 text-base font-semibold text-foreground">{resource.title}</h3>
          </div>
          <ArrowUpRight className="h-5 w-5 text-muted-foreground transition group-hover:text-primary" />
        </div>
      </div>
    </Link>
  );
}
