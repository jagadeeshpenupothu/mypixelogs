import Link from "next/link";
import {
  Archive,
  FileImage,
  Files,
  ImageDown,
  ImagePlus,
  QrCode,
  SplitSquareHorizontal,
  Wand2,
} from "lucide-react";

import type { Tool } from "@/types/tool";

const icons = {
  Archive,
  FileImage,
  Files,
  ImageDown,
  ImagePlus,
  QrCode,
  SplitSquareHorizontal,
  Wand2,
};

type ToolCardProps = {
  tool: Tool;
};

export function ToolCard({ tool }: ToolCardProps) {
  const Icon = icons[tool.icon as keyof typeof icons] ?? Files;

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex h-full gap-4 rounded-lg border border-border bg-card p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-soft dark:ring-1 dark:ring-white/[0.02] dark:hover:ring-primary/20"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-blue-50 text-primary shadow-sm transition duration-300 group-hover:bg-primary group-hover:text-white group-hover:shadow-[0_12px_28px_rgba(37,99,235,0.28)]">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-base font-semibold tracking-tight text-foreground">{tool.name}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{tool.description}</p>
      </div>
    </Link>
  );
}
