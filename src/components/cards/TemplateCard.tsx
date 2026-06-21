import Link from "next/link";
import Image from "next/image";
import { Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
      className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md dark:hover:border-white/20 dark:hover:shadow-soft"
    >
      <div className="overflow-hidden bg-slate-50 dark:border-b dark:border-border">
        <Image
          src={template.thumbnail}
          alt={`${template.title} thumbnail`}
          width={720}
          height={510}
          className="aspect-[4/3] h-auto w-full object-cover transition-transform duration-200 group-hover:scale-[1.015]"
        />
      </div>
      <div className="p-5 sm:p-6">
        <Badge variant="secondary" className="bg-blue-50 text-primary">
          {categoryLabel}
        </Badge>
        <h3 className="mt-3 text-base font-semibold tracking-tight text-foreground">{template.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {template.description}
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Download className="h-4 w-4" aria-hidden="true" />
          {template.downloads.toLocaleString()} downloads
        </div>
      </div>
    </Link>
  );
}
