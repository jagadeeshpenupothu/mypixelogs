import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, ExternalLink } from "lucide-react";

import { Breadcrumbs } from "@/components/templates/Breadcrumbs";
import { getLogo, logoFile, logos, relatedLogos, styleOf } from "@/lib/logos";
import { createSocialMetadata, getAbsoluteUrl, metaDescription } from "@/lib/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return logos.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const l = getLogo((await params).slug);
  if (!l) return {};
  const description = metaDescription(l.description);
  return { title: `${l.title} – Free AI, SVG, PSD, EPS`, description, ...createSocialMetadata({ title: l.title, description, path: `/assets/logos/${l.slug}` }) };
}

const FORMATS = [
  { ext: ".ai", label: "Illustrator (AI)", note: "Editable vector" },
  { ext: ".svg", label: "SVG", note: "Inkscape, Figma, Canva, web" },
  { ext: ".psd", label: "Photoshop (PSD)", note: "One layer per part" },
  { ext: ".eps", label: "CorelDRAW (EPS)", note: "File › Import in CorelDRAW" },
  { ext: ".pdf", label: "PDF", note: "Vector, for print" },
  { ext: ".png", label: "PNG", note: "2000 px, transparent" },
];

export default async function LogoPage({ params }: PageProps) {
  const l = getLogo((await params).slug);
  if (!l) notFound();
  const style = styleOf(l.style);
  const photopea = `https://www.photopea.com/#${encodeURIComponent(JSON.stringify({ files: [getAbsoluteUrl(logoFile(l, ".psd"))] }))}`;
  const related = relatedLogos(l);
  const fontsLine = l.fonts.map((f) => `${f.family} ${f.weight}`).join(" and ");

  return (
    <article className="pb-2">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Assets", href: "/assets" }, { label: "Logos", href: "/assets/logos" }, { label: l.title }]} />
      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          <Image src={`/logos/${l.slug}/preview.png`} alt={`${l.title}: ${style?.name} logo for ${l.industry}`} width={1200} height={900} priority className="w-full rounded-xl border border-border" sizes="(min-width: 1024px) 60vw, 100vw" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-border bg-white p-6">
              <Image src={logoFile(l, ".png")} alt="On white" width={400} height={400} className="max-h-full w-auto object-contain" />
            </div>
            <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-border bg-neutral-900 p-6">
              <Image src={logoFile(l, ".png")} alt="On dark" width={400} height={400} className="max-h-full w-auto object-contain" />
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">{style?.name} logo · {l.industry}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{l.title}</h1>
          <p className="mt-3 text-muted-foreground">{l.description}</p>

          <a href={`/logos/${l.slug}/${l.slug}-all-formats.zip`} download className="mt-6 flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90">
            <Download className="h-4 w-4" aria-hidden="true" /> Download all formats (ZIP)
          </a>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {FORMATS.map((f) => (
              <li key={f.ext}>
                <a href={logoFile(l, f.ext)} download className="block rounded-lg border border-border px-3 py-2 hover:border-primary">
                  <span className="block text-sm font-semibold text-foreground">{f.label}</span>
                  <span className="block text-xs text-muted-foreground">{f.note}</span>
                </a>
              </li>
            ))}
            <li className="col-span-2">
              <a href={photopea} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-lg border border-border px-3 py-2 hover:border-primary">
                <span>
                  <span className="block text-sm font-semibold text-foreground">Open in Photopea</span>
                  <span className="block text-xs text-muted-foreground">Free online Photoshop, nothing to install</span>
                </span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </a>
            </li>
          </ul>

          <h2 className="mt-8 text-sm font-semibold text-foreground">Colours</h2>
          <ul className="mt-2 flex flex-wrap gap-3">
            {l.colors.map((c) => (
              <li key={c.hex} className="flex items-center gap-2 text-sm">
                <span className="h-7 w-7 rounded-full border border-border" style={{ background: c.hex }} />
                <span>
                  <span className="block font-medium text-foreground">{c.name}</span>
                  <span className="block font-mono text-xs text-muted-foreground">{c.hex}</span>
                </span>
              </li>
            ))}
          </ul>

          <h2 className="mt-6 text-sm font-semibold text-foreground">Fonts</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {l.fonts.map((f, i) => (
              <span key={f.family + f.weight}>
                {i ? ", " : ""}
                <a className="text-primary hover:underline" href={`https://fonts.google.com/specimen/${f.family.replace(/\s+/g, "+")}`} target="_blank" rel="noopener noreferrer">
                  {f.family}
                </a>{" "}
                {f.weight}
              </span>
            ))}{" "}
            (free). Text is already converted to outlines, so the logo looks right without them.
          </p>
        </div>
      </div>

      <section className="mt-12 max-w-3xl">
        <h2 className="text-xl font-bold text-foreground">How to put your business name on it</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-foreground/90">
          <li><strong>Illustrator or CorelDRAW:</strong> open the AI (CorelDRAW: File › Import the EPS or AI), delete the sample name, and type yours with {fontsLine || "the fonts listed above"}.</li>
          <li><strong>Photopea or Photoshop:</strong> open the PSD, hide the name layer, and add a text layer with your name in the same font and colour.</li>
          <li><strong>Canva or Figma:</strong> upload the SVG, ungroup it, and replace the name with a text box.</li>
          <li>Change colours by selecting a shape and picking a new fill; keep good contrast so it reads at small sizes.</li>
        </ol>
        <p className="mt-4 text-sm text-muted-foreground">
          Free for personal and commercial use. {style?.about}{" "}Before you register or print it widely, check that your final logo isn&apos;t too close to an existing trademark.
        </p>
      </section>

      {related.length ? (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-foreground">More free logos</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((r) => (
              <Link prefetch={false} key={r.slug} href={`/assets/logos/${r.slug}`} className="group overflow-hidden rounded-xl border border-border bg-card hover:border-primary/60">
                <Image src={`/logos/${r.slug}/preview.png`} alt={r.title} width={1200} height={900} className="aspect-[4/3] w-full object-cover" sizes="25vw" />
                <span className="block truncate p-3 text-sm font-semibold text-foreground group-hover:underline">{r.title}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
