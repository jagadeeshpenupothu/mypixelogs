import Link from "next/link";
import { Archive, FileImage, Files, ImagePlus, SplitSquareHorizontal } from "lucide-react";

import type { Tool } from "@/types/tool";

const icons = {
  Archive,
  FileImage,
  Files,
  ImagePlus,
  SplitSquareHorizontal,
};

type ToolCardProps = {
  tool: Tool;
};

export function ToolCard({ tool }: ToolCardProps) {
  const Icon = icons[tool.icon as keyof typeof icons] ?? Files;

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex h-full gap-4 rounded-lg border border-border bg-card p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-blue-50 text-primary transition group-hover:bg-primary group-hover:text-white">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-foreground">{tool.name}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{tool.description}</p>
      </div>
    </Link>
  );
}
