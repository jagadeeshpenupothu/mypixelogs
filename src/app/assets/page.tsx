import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Music, Volume2 } from "lucide-react";

import { FontCard, fontGridClass } from "@/components/assets/FontCard";
import { Breadcrumbs } from "@/components/templates/Breadcrumbs";
import { music, sfx } from "@/lib/audio-library";
import { assetGroups } from "@/lib/library";
import { fonts } from "@/lib/fonts";
import { createSocialMetadata } from "@/lib/metadata";

const title = "Free Design Assets";
const description = `Free assets for flyers, posters and videos: ${fonts.length} fonts, 100 background music tracks and 100 sound effects, plus logo, icon and PSD packs.`;

export const metadata: Metadata = { title, description, ...createSocialMetadata({ title, description, path: "/assets" }) };

export default function AssetsPage() {
  const others = assetGroups("").filter((g) => g.href !== "/assets");
  const telugu = fonts.filter((f) => f.scripts.includes("telugu") && !["Noto Sans", "Noto Serif"].includes(f.name));
  return (
    <section className="pb-2">
      <h1 className="sr-only">{title}</h1>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Assets" }]} />

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {[
          { href: "/assets/music", Icon: Music, title: "Background music", note: `${music.length} tracks for YouTube and reels · happy, calm, epic, suspense` },
          { href: "/assets/sound-effects", Icon: Volume2, title: "Sound effects", note: `${sfx.length} SFX · clicks, swooshes, impacts, sci-fi, jingles` },
        ].map(({ href, Icon, title: label, note }) => (
          <Link key={href} href={href} className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/60">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block font-semibold text-foreground group-hover:underline">{label}</span>
              <span className="block truncate text-sm text-muted-foreground">{note}</span>
            </span>
            <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </Link>
        ))}
      </div>

      <div className="mt-10 flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground">
          Fonts <span className="text-base font-medium text-muted-foreground">· {fonts.length} free</span>
        </h2>
        <Link href="/assets/fonts" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          See all fonts <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <div className={`mt-4 ${fontGridClass}`}>
        {fonts.slice(0, 12).map((f) => (
          <FontCard key={f.slug} font={f} />
        ))}
      </div>

      <div className="mt-12 flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground">
          Telugu fonts <span className="text-base font-medium text-muted-foreground">· {telugu.length} free</span>
        </h2>
        <Link href="/assets/fonts/telugu" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          See all Telugu fonts <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <div className={`mt-4 ${fontGridClass}`}>
        {telugu.slice(0, 8).map((f) => (
          <FontCard key={f.slug} font={f} />
        ))}
      </div>

      {others.length ? (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-foreground">Design files</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {others.map((g) => (
              <Link key={g.href} href={g.href} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-primary/60">
                {g.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
