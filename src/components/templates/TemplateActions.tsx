import Link from "next/link";
import { Download, FileCode2, FileDown, FileImage, FileSpreadsheet, FileText, Layers, PenTool, Palette, Pencil, Sheet, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getAbsoluteUrl } from "@/lib/metadata";
import { guides } from "@/data/guides";
import type { Template } from "@/types/template";

type TemplateActionsProps = {
  template: Template;
};

type PlatformLink = { label: string; note: string; href: string; Icon: LucideIcon; download?: boolean };

/** Every other place this template can be opened, in the order people most often use them. */
function platformLinks(template: Template): PlatformLink[] {
  const p = template.platforms;
  if (!p) return [];
  const links: PlatformLink[] = [];
  if (p.googleDocsId) links.push({ label: "Google Docs", note: "Makes your own copy", href: `https://docs.google.com/document/d/${p.googleDocsId}/copy`, Icon: FileText });
  if (p.googleSheetsId) links.push({ label: "Google Sheets", note: "Makes your own copy", href: `https://docs.google.com/spreadsheets/d/${p.googleSheetsId}/copy`, Icon: Sheet });
  if (p.excelPath) links.push({ label: "Excel", note: "Download .xlsx", href: p.excelPath, Icon: FileSpreadsheet, download: true });
  if (p.canvaUrl) links.push({ label: "Canva", note: "Makes your own copy", href: p.canvaUrl, Icon: Palette });
  if (p.psdPath) {
    links.push({ label: "Photopea", note: "Free, opens in your browser", href: `https://www.photopea.com/#${encodeURIComponent(JSON.stringify({ files: [getAbsoluteUrl(p.psdPath)] }))}`, Icon: Layers });
    if (p.psdPath !== template.downloadPath) links.push({ label: "Photoshop", note: "Download layered .psd", href: p.psdPath, Icon: FileImage, download: true });
  }
  if (p.aiPath) links.push({ label: "Illustrator", note: "Download .ai", href: p.aiPath, Icon: PenTool, download: true });
  if (p.svgPath) links.push({ label: "SVG", note: "For Inkscape or Figma", href: p.svgPath, Icon: FileCode2, download: true });
  if (p.epsPath) links.push({ label: "CorelDRAW", note: "Download .eps (File › Import)", href: p.epsPath, Icon: PenTool, download: true });
  if (p.pngPath) links.push({ label: "PNG", note: "A4, 300 dpi", href: p.pngPath, Icon: FileImage, download: true });
  if (p.zipPath) links.push({ label: "All formats", note: "ZIP with fonts", href: p.zipPath, Icon: Download, download: true });
  if (p.latexPath) {
    links.push({
      label: "Overleaf",
      note: "Opens as a LaTeX project",
      href: `https://www.overleaf.com/docs?snip_uri=${encodeURIComponent(getAbsoluteUrl(p.latexPath))}&engine=pdflatex`,
      Icon: FileCode2,
    });
  }
  if (p.pdfPath) links.push({ label: "PDF", note: "Download to print", href: p.pdfPath, Icon: FileDown, download: true });
  return links;
}

export function TemplateActions({ template }: TemplateActionsProps) {
  const others = platformLinks(template);

  return (
    <aside className="rounded-xl border border-border bg-card p-5">
      <div className="grid gap-3">
        {template.editor ? (
          <Button asChild size="lg">
            <Link prefetch={false} href={`/templates/${template.slug}/edit`}>
              <Pencil className="h-4 w-4" />
              {template.previewVideo ? "Edit this video" : "Edit online"}
            </Link>
          </Button>
        ) : null}
        {template.googleDocId ? (
          <Button asChild size="lg">
            <a href={template.downloadPath} target="_blank" rel="noopener">
              <FileText className="h-4 w-4" aria-hidden="true" />
              Edit in Google Docs
            </a>
          </Button>
        ) : template.previewVideo ? null : (
          <Button asChild size="lg" variant={template.editor ? "outline" : "default"}>
            <a href={template.downloadPath} download>
              <Download className="h-4 w-4" />
              Download {template.formats[0]}
            </a>
          </Button>
        )}
      </div>

      {others.length ? (
        <div className="mt-5">
          <p className="text-sm font-semibold text-foreground">Also open in</p>
          <ul className="mt-2 divide-y divide-border">
            {others.map(({ label, note, href, Icon, download }) => (
              <li key={label}>
                <a
                  href={href}
                  {...(download ? { download: true } : { target: "_blank", rel: "noopener" })}
                  className="flex items-center gap-3 py-2.5 text-sm transition-colors hover:text-primary"
                >
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="font-medium">{label}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{note}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {guides
        .filter((g) => g.templates.includes(template.slug))
        .slice(0, 1)
        .map((g) => (
          <Link prefetch={false} key={g.slug} href={`/guides/${g.slug}`} className="mt-4 block rounded-lg bg-muted/60 px-3 py-2.5 text-sm text-foreground hover:bg-muted">
            <span className="text-xs text-muted-foreground">Guide · </span>
            {g.title.replace(/ \(.*\)$/, "")}
          </Link>
        ))}

      {template.photoCredits?.length ? (
        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          Photos:{" "}
          {template.photoCredits.map((c, i) => (
            <span key={i}>
              {i ? "; " : ""}
              {c.page ? (
                <a href={c.page} target="_blank" rel="noopener" className="underline hover:text-foreground">
                  {c.creator || "source"}
                </a>
              ) : (
                c.creator || "unknown"
              )}{" "}
              ({c.license}, {c.source})
            </span>
          ))}
        </p>
      ) : null}

      {template.photoCredit ? (
        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          Photo:{" "}
          {template.photoCredit.page ? (
            <a href={template.photoCredit.page} target="_blank" rel="noopener" className="underline hover:text-foreground">
              {template.photoCredit.creator || "source"}
            </a>
          ) : (
            template.photoCredit.creator || "unknown"
          )}{" "}
          · {template.photoCredit.license} · {template.photoCredit.source}
        </p>
      ) : null}

      {template.googleDocId || template.platforms?.googleDocsId ? (
        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          Google opens a page asking you to make a copy. You edit your copy; the original stays unchanged. A Google account is needed.
        </p>
      ) : null}
    </aside>
  );
}
