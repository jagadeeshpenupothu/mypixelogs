import Image from "next/image";
import Link from "next/link";

import { styleCount, type FontFamily } from "@/lib/fonts";

/** A font shown by its own name, written in itself. No box: the picture is the card. */
export function FontCard({ font }: { font: FontFamily }) {
  return (
    <Link
      href={`/assets/fonts/${font.slug}`}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <span className="block overflow-hidden rounded-xl bg-card ring-1 ring-border/70 transition-colors group-hover:ring-primary/60">
        <Image
          src={`/previews/fonts/${font.slug}.png`}
          alt={`${font.name} font preview`}
          width={720}
          height={240}
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 22vw"
          className="h-auto w-full px-3 transition-transform duration-300 group-hover:scale-[1.03] dark:invert"
        />
      </span>
      <span className="flex items-baseline justify-between gap-2 px-1 pt-2">
        <span className="text-sm font-semibold text-foreground group-hover:underline">{font.name}</span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {font.category} · {styleCount(font)} {styleCount(font) === 1 ? "style" : "styles"}
        </span>
      </span>
    </Link>
  );
}

export const fontGridClass = "grid gap-x-4 gap-y-6 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))] sm:gap-x-5";
