import Link from "next/link";
import {
  Archive,
  Binary,
  BriefcaseBusiness,
  Calculator,
  CalendarDays,
  CaseSensitive,
  Clock,
  Contrast,
  Crop,
  FileImage,
  FileJson,
  FilePenLine,
  Files,
  FileText,
  FileX2,
  Fingerprint,
  Gauge,
  ImageDown,
  ImagePlus,
  KeyRound,
  Languages,
  Braces,
  Link2,
  Maximize2,
  Paintbrush,
  Palette,
  Pipette,
  QrCode,
  Receipt,
  ReceiptText,
  Regex,
  RotateCw,
  ShieldCheck,
  Signature,
  SplitSquareHorizontal,
  TextCursorInput,
  Wand2,
} from "lucide-react";

import type { Tool } from "@/types/tool";

const icons = {
  Archive,
  Binary,
  BriefcaseBusiness,
  Calculator,
  CalendarDays,
  CaseSensitive,
  Clock,
  Contrast,
  Crop,
  FileImage,
  FileJson,
  FilePenLine,
  Files,
  FileText,
  FileX2,
  Fingerprint,
  Gauge,
  ImageDown,
  ImagePlus,
  KeyRound,
  Languages,
  Braces,
  Link2,
  Maximize2,
  Paintbrush,
  Palette,
  Pipette,
  QrCode,
  Receipt,
  ReceiptText,
  Regex,
  RotateCw,
  ShieldCheck,
  Signature,
  SplitSquareHorizontal,
  TextCursorInput,
  Wand2,
};

type ToolCardProps = {
  tool: Tool;
};

export function ToolCard({ tool }: ToolCardProps) {
  const Icon = icons[tool.icon as keyof typeof icons] ?? Files;

  const cardContent = (
    <>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-blue-50 text-primary shadow-sm transition-[color,background-color,border-color,box-shadow] duration-200 group-hover:bg-blue-100 dark:bg-[#171717] dark:shadow-none dark:group-hover:bg-[#1F1F1F]">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold tracking-tight text-foreground">{tool.name}</h3>
          {tool.comingSoon ? (
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Coming soon
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-primary">
          {tool.subcategory ?? tool.category}
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{tool.description}</p>
      </div>
    </>
  );

  if (tool.comingSoon) {
    return (
      <article
        className="group flex h-full gap-4 rounded-lg border border-border bg-card p-6 opacity-90 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md dark:hover:border-white/20"
        aria-label={`${tool.name} coming soon`}
      >
        {cardContent}
      </article>
    );
  }

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex h-full gap-4 rounded-lg border border-border bg-card p-6 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md dark:hover:border-white/20 dark:hover:shadow-soft"
    >
      {cardContent}
    </Link>
  );
}
