import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import type { Resource } from "@/types/resource";

type ResourceCardProps = {
  resource: Resource;
};

export function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <Link
      href={`/resources/${resource.slug}`}
      className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft"
    >
      <div className="overflow-hidden bg-slate-50">
        <Image
          src={resource.thumbnail}
          alt={`${resource.title} preview`}
          width={720}
          height={510}
          className="aspect-[4/3] h-auto w-full object-cover transition duration-200 group-hover:scale-[1.02]"
        />
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
