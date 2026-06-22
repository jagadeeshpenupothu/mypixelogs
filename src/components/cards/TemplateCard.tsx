import Link from "next/link";
import Image from "next/image";
import { Download } from "lucide-react";

import { getTemplateCategoryLabel } from "@/lib/templates";
import type { Template } from "@/types/template";

type TemplateCardProps = {
  template: Template;
};

export function TemplateCard({ template }: TemplateCardProps) {
  const categoryLabel = getTemplateCategoryLabel(template.category);

  return (
    <Link
      href={`/templates/${template.slug}`}
      className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:scale-[1.02] hover:border-primary/45 hover:shadow-md dark:hover:border-primary/50 dark:hover:shadow-soft"
    >
      <div className="aspect-[4/5] overflow-hidden bg-slate-50 p-3 dark:border-b dark:border-border dark:bg-[#111111]">
        <Image
          src={template.thumbnail}
          alt={`${template.title} thumbnail`}
          width={640}
          height={800}
          className="h-full w-full rounded-sm object-contain shadow-sm transition-transform duration-200 group-hover:scale-[1.02]"
        />
      </div>
      <div className="p-3.5">
        <h3 className="line-clamp-1 text-sm font-semibold text-foreground">{template.title}</h3>
        <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span className="truncate font-medium">{categoryLabel}</span>
          <span className="flex shrink-0 items-center gap-1">
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            {template.downloads.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
