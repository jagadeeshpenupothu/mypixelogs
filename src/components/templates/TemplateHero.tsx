import { Download, FileCheck2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Template } from "@/types/template";

type TemplateHeroProps = {
  template: Template;
  categoryLabel: string;
};

export function TemplateHero({ template, categoryLabel }: TemplateHeroProps) {
  return (
    <header className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
      <div>
        <Badge variant="secondary" className="bg-blue-50 text-primary">
          {categoryLabel}
        </Badge>
        <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-normal text-foreground sm:text-5xl">
          {template.title}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
          {template.description}
        </p>
      </div>
      <div className="grid gap-3 rounded-lg border border-border bg-slate-50 p-5">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Download className="h-4 w-4" />
            Downloads
          </span>
          <strong className="text-xl text-foreground">{template.downloads.toLocaleString()}</strong>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <FileCheck2 className="h-4 w-4" />
            Formats
          </span>
          <span className="text-sm font-semibold text-foreground">
            {template.formats.join(", ")}
          </span>
        </div>
      </div>
    </header>
  );
}
