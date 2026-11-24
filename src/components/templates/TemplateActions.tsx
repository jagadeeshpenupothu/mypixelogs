import Link from "next/link";
import { Download, Eye, Pencil, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Template } from "@/types/template";

type TemplateActionsProps = {
  template: Template;
};

export function TemplateActions({ template }: TemplateActionsProps) {
  const shareHref = `mailto:?subject=${encodeURIComponent(template.title)}&body=${encodeURIComponent(
    `Check out this free template: /templates/${template.slug}`,
  )}`;

  return (
    <aside className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">Template actions</h2>
      <div className="mt-5 grid gap-3">
        {template.editor ? (
          <Button asChild size="lg">
            <Link href={`/templates/${template.slug}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit online
            </Link>
          </Button>
        ) : null}
        <Button asChild size="lg" variant={template.editor ? "outline" : "default"}>
          <a href={template.downloadPath} download>
            <Download className="h-4 w-4" />
            Download
          </a>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href={template.previewImage} target="_blank">
            <Eye className="h-4 w-4" />
            Preview
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <a href={shareHref}>
            <Share2 className="h-4 w-4" />
            Share
          </a>
        </Button>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        Download the editable file and review the layout before using it in a
        client-facing or business document.
      </p>
    </aside>
  );
}
