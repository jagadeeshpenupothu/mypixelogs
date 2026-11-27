import Link from "next/link";
import { Download, FileCode2, FileDown, FileSpreadsheet, FileText, Palette, Pencil, Sheet, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getAbsoluteUrl } from "@/lib/metadata";
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
            <Link href={`/templates/${template.slug}/edit`}>
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

      {template.googleDocId || template.platforms?.googleDocsId ? (
        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          Google opens a page asking you to make a copy. You edit your copy; the original stays unchanged. A Google account is needed.
        </p>
      ) : null}
    </aside>
  );
}
