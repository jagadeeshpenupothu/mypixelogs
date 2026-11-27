import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FontCard, fontGridClass } from "@/components/assets/FontCard";
import { Breadcrumbs } from "@/components/templates/Breadcrumbs";
import { assetGroups } from "@/lib/library";
import { fonts } from "@/lib/fonts";
import { createSocialMetadata } from "@/lib/metadata";

const title = "Free Design Assets";
const description = `Free fonts and design files for your flyers, posters and videos: ${fonts.length} fonts for Photoshop, Canva and Word, plus logo, icon and PSD packs.`;

export const metadata: Metadata = { title, description, ...createSocialMetadata({ title, description, path: "/assets" }) };

export default function AssetsPage() {
  const others = assetGroups("").filter((g) => g.href !== "/assets");
  return (
    <section className="pb-2">
      <h1 className="sr-only">{title}</h1>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Assets" }]} />

      <div className="mt-6 flex items-baseline justify-between gap-4">
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
