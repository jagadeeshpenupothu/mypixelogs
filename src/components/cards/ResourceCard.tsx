import Link from "next/link";
import Image from "next/image";

import type { Resource } from "@/types/resource";

type ResourceCardProps = {
  resource: Resource;
};

export function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <Link
      href={`/assets/${resource.slug}`}
      className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:scale-[1.02] hover:border-primary/45 hover:shadow-md dark:hover:border-primary/50 dark:hover:shadow-soft"
    >
      <div className="aspect-[4/5] overflow-hidden bg-slate-50 p-3 dark:border-b dark:border-border dark:bg-[#111111]">
        <Image
          src={resource.thumbnail}
          alt={`${resource.title} preview`}
          width={640}
          height={800}
          className="h-full w-full rounded-sm object-cover shadow-sm transition-transform duration-200 group-hover:scale-[1.02]"
        />
      </div>
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-foreground">
            {resource.title}
          </h3>
          <span className="shrink-0 rounded-md border border-border bg-muted px-2 py-1 text-[11px] font-bold uppercase text-muted-foreground">
            {resource.category}
          </span>
        </div>
      </div>
    </Link>
  );
}
