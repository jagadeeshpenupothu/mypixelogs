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
  FlipHorizontal2,
  ArrowRightLeft,
  ImagePlay,
  Clapperboard,
  Scissors,
  ShieldCheck,
  Signature,
  SplitSquareHorizontal,
  TextCursorInput,
  Wand2,
} from "lucide-react";

import type { Tool } from "@/types/tool";

export const toolIcons = {
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
  FlipHorizontal2,
  ArrowRightLeft,
  ImagePlay,
  Clapperboard,
  Scissors,
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
  const Icon = toolIcons[tool.icon as keyof typeof toolIcons] ?? Files;

  const cardContent = (
  <>
    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-primary dark:bg-muted">
      <Icon className="h-5 w-5" aria-hidden="true" />
    </div>

    <div className="mt-3 min-w-0">
      <h3 className="text-base font-semibold text-foreground">{tool.name}</h3>

      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
        {tool.description}
      </p>
    </div>
  </>
);

  if (tool.comingSoon) {
    return (
      <article
        className="group flex h-full flex-col rounded-lg border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-md"
        aria-label={`${tool.name} coming soon`}
      >
        {cardContent}
      </article>
    );
  }

  return (
    <Link prefetch={false}
      href={`/tools/${tool.slug}`}
      className="group flex h-full flex-col rounded-lg border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-md"
    >
      {cardContent}
    </Link>
  );
}
