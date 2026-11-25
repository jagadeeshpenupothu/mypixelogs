import Link from "next/link";
import { Download, FileText, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Template } from "@/types/template";

type TemplateActionsProps = {
  template: Template;
};

export function TemplateActions({ template }: TemplateActionsProps) {
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
      {template.googleDocId ? (
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Google asks you to make a copy. You edit your copy; the original stays unchanged.
        </p>
      ) : null}
    </aside>
  );
}
