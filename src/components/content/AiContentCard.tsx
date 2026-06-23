import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { ContentItem } from "@/content/types";

type AiContentCardProps = {
  item: ContentItem;
  href: string;
  label: string;
};

export function AiContentCard({ item, href, label }: AiContentCardProps) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:border-primary/45 hover:shadow-md dark:hover:border-primary/50"
    >
      <div className="overflow-hidden bg-slate-50 p-1.5 dark:bg-[#111111]">
        <Image
          src={item.coverImage}
          alt={`${item.title} cover`}
          width={640}
          height={420}
          className="aspect-[5/3] h-auto w-full rounded-sm object-cover shadow-sm transition-transform duration-200 group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-bold text-primary">
            {label}
          </span>
          <span className="text-[11px] font-semibold uppercase text-muted-foreground">
            {item.category}
          </span>
        </div>
        <h3 className="mt-3 line-clamp-2 text-sm font-semibold leading-5 text-foreground">
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
          {item.description}
        </p>
        <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary">
          Open
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
