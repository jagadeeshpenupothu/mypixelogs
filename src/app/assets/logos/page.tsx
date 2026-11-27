import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Breadcrumbs } from "@/components/templates/Breadcrumbs";
import { LOGO_STYLES, logos, styleOf } from "@/lib/logos";
import { createSocialMetadata } from "@/lib/metadata";

const title = "Free Logo Templates (AI, SVG, PSD, EPS)";
const description = "Free editable logo templates in every format: Illustrator AI, SVG, Photoshop PSD, CorelDRAW EPS, PDF and transparent PNG. Emblems, wordmarks, monograms and more.";

export const metadata: Metadata = { title, description, ...createSocialMetadata({ title, description, path: "/assets/logos" }) };

export default function LogosPage() {
  const used = LOGO_STYLES.filter((s) => logos.some((l) => l.style === s.slug));
  return (
    <section className="pb-2">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Assets", href: "/assets" }, { label: "Logos" }]} />
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">Free logo templates</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Every logo comes as Illustrator (AI), SVG, Photoshop (PSD, also opens in Photopea), CorelDRAW (EPS), PDF and a transparent PNG. Change the name and colours and make it yours. A new logo is added every day.
      </p>

      {logos.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">The first logos are being designed. Check back tomorrow.</p>
      ) : (
        <>
          {used.length > 1 ? (
            <nav aria-label="Logo styles" className="mt-6 flex flex-wrap gap-2">
              {used.map((s) => (
                <a key={s.slug} href={`#${s.slug}`} className="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:border-primary">
                  {s.name}
                </a>
              ))}
            </nav>
          ) : null}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {logos.map((l, i) => (
              <Link prefetch={false} key={l.slug} id={logos.findIndex((x) => x.style === l.style) === i ? l.style : undefined} href={`/assets/logos/${l.slug}`} className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/60">
                <Image src={`/logos/${l.slug}/preview.png`} alt={`${l.title} preview`} width={1200} height={900} className="aspect-[4/3] w-full object-cover" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" />
                <span className="block p-3">
                  <span className="block truncate text-sm font-semibold text-foreground group-hover:underline">{l.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">{styleOf(l.style)?.name} · {l.industry}</span>
                </span>
              </Link>
            ))}
          </div>
        </>
      )}

      <section className="mt-14 max-w-3xl">
        <h2 className="text-xl font-bold text-foreground">Logo styles explained</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          {LOGO_STYLES.map((s) => (
            <div key={s.slug}>
              <dt className="font-semibold text-foreground">{s.name}</dt>
              <dd className="text-sm text-muted-foreground">{s.about}</dd>
            </div>
          ))}
        </dl>
      </section>
    </section>
  );
}
