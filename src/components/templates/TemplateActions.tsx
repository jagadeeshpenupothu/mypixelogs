import Link from "next/link";
import { Download, Eye, FileText, Pencil } from "lucide-react";

import { ShareButton } from "@/components/templates/ShareButton";
import { Button } from "@/components/ui/button";
import type { Template } from "@/types/template";

type TemplateActionsProps = {
  template: Template;
};

export function TemplateActions({ template }: TemplateActionsProps) {
  return (
    <aside className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">Use this template</h2>
      <div className="mt-5 grid gap-3">
        {template.editor ? (
          <Button asChild size="lg">
            <Link href={`/templates/${template.slug}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit online
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
        ) : (
          <Button asChild size="lg" variant={template.editor ? "outline" : "default"}>
            <a href={template.downloadPath} download>
              <Download className="h-4 w-4" />
              Download {template.formats[0]}
            </a>
          </Button>
        )}
        <Button asChild variant="outline" size="lg">
          <a href={template.previewImage} target="_blank" rel="noopener">
            <Eye className="h-4 w-4" />
            View full size
          </a>
        </Button>
        <ShareButton title={template.title} />
      </div>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        {template.googleDocId
          ? "Google asks you to make a copy. You edit your copy, and the original stays unchanged. A Google account is needed."
          : "Download the editable file and review the layout before using it in a client-facing or business document."}
      </p>
    </aside>
  );
}
