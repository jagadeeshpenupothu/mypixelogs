import Link from "next/link";
import Image from "next/image";
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
    <div className="relative aspect-[5/4] w-full overflow-hidden rounded-lg border border-border bg-card">
      {tool.image ? (
        <Image
          src={tool.image}
          alt={tool.name}
          fill
          className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Icon className="h-12 w-12 text-primary" />
        </div>
      )}
    </div>

    <div className="mt-4 min-w-0">
      <h3 className="text-lg font-semibold text-red-500">
  TEST CARD
</h3>

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
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex h-full flex-col rounded-lg border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-md"
    >
      {cardContent}
    </Link>
  );
}
