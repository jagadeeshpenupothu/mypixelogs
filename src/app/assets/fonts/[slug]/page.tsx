import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";

import { FontCard, fontGridClass } from "@/components/assets/FontCard";
import { FontTester } from "@/components/assets/FontTester";
import { Breadcrumbs } from "@/components/templates/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { fonts, formatSize, getFontBySlug, relatedFonts, SCRIPT_LABELS, styleCount } from "@/lib/fonts";
import { createSocialMetadata, metaDescription } from "@/lib/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return fonts.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const font = getFontBySlug((await params).slug);
  if (!font) return {};
  const title = `${font.name} Font Free Download`;
  const description = metaDescription(`Download the ${font.name} font free (${font.category.toLowerCase()}, ${styleCount(font)} styles, ${font.license}). Free for personal and commercial use in Photoshop, Illustrator, Word and Canva.`);
  return { title, description, ...createSocialMetadata({ title, description, path: `/assets/fonts/${font.slug}`, image: `/previews/fonts/${font.slug}.png` }) };
}

export default async function FontPage({ params }: PageProps) {
  const font = getFontBySlug((await params).slug);
  if (!font) notFound();
  const family = `Preview ${font.name}`;
  const languages = font.scripts.map((s) => SCRIPT_LABELS[s] ?? s.charAt(0).toUpperCase() + s.slice(1));

  return (
    <section className="pb-2">
      <style>{`@font-face{font-family:'${family}';src:url(/fonts/library/${font.slug}.woff2) format('woff2');font-display:swap;${font.variable ? `font-weight:${font.weights[0]} ${font.weights.at(-1)};` : ""}}`}</style>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Assets", href: "/assets" }, { label: "Fonts", href: "/assets/fonts" }, { label: font.name }]} />

      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <h1 className="break-words text-5xl leading-tight text-foreground sm:text-6xl" style={{ fontFamily: `'${family}', sans-serif` }}>
            {font.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {font.category} · {styleCount(font)} {styleCount(font) === 1 ? "style" : "styles"} · by {font.designer}
          </p>
          <div className="mt-6">
            <FontTester font={font} family={family} />
          </div>
        </div>

        <aside className="rounded-xl border border-border bg-card p-5 lg:sticky lg:top-20">
          <Button asChild size="lg" className="w-full">
            <a href={font.zip} download>
              <Download className="h-4 w-4" />
              Download font ({formatSize(font.size)})
            </a>
          </Button>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Free for personal and commercial use: print, logos, videos and client work. {font.license}.
          </p>
          <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Styles</dt>
            <dd className="text-foreground">{font.weights.join(", ")}{font.italic ? " + italics" : ""}{font.variable ? " (variable font)" : ""}</dd>
            <dt className="text-muted-foreground">Languages</dt>
            <dd className="text-foreground">{languages.join(", ")}</dd>
            <dt className="text-muted-foreground">Designer</dt>
            <dd className="text-foreground">{font.designer}</dd>
            <dt className="text-muted-foreground">Source</dt>
            <dd>
              <a href={`https://fonts.google.com/specimen/${font.name.replace(/ /g, "+")}`} target="_blank" rel="noopener" className="text-primary hover:underline">Google Fonts</a>
            </dd>
          </dl>
          <div className="mt-5 border-t border-border pt-4">
            <p className="text-sm font-semibold text-foreground">How to install</p>
            <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-sm leading-6 text-muted-foreground">
              <li>Unzip the download.</li>
              <li><strong className="font-medium text-foreground">Windows:</strong> right-click the .ttf file and choose Install. <strong className="font-medium text-foreground">Mac:</strong> double-click it and choose Install Font.</li>
              <li>Restart Photoshop, Illustrator or Word, and pick {font.name} from the font list. In Canva, upload it under Brand → Fonts.</li>
            </ol>
          </div>
        </aside>
      </div>

      {relatedFonts(font).length ? (
        <div className="mt-14">
          <h2 className="text-xl font-bold text-foreground">More {font.category.toLowerCase()} fonts</h2>
          <div className={`mt-4 ${fontGridClass}`}>
            {relatedFonts(font).map((f) => (
              <FontCard key={f.slug} font={f} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
