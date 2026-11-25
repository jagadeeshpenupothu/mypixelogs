import Image from "next/image";
import Link from "next/link";

import type { ContentItem } from "@/content/types";

type AiContentCardProps = {
  item: ContentItem;
  href: string;
  /** Kept for callers; the card no longer prints it. */
  label?: string;
};

export function AiContentCard({ item, href }: AiContentCardProps) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:border-primary/45 hover:shadow-md dark:hover:border-primary/50"
    >
      <div className="overflow-hidden bg-slate-50 p-1.5 dark:bg-muted/60">
        <Image
          src={item.coverImage}
          alt={`${item.title} cover`}
          width={640}
          height={420}
          className="aspect-[5/3] h-auto w-full rounded-sm object-cover shadow-sm transition-transform duration-200 group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-foreground">
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
          {item.description}
        </p>
      </div>
    </Link>
  );
}
