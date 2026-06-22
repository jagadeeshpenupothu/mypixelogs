"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import type { ExplorerItemData } from "@/lib/explorer";

type ExplorerItemProps = {
  item: ExplorerItemData;
  onNavigate?: () => void;
};

export function ExplorerItem({ item, onNavigate }: ExplorerItemProps) {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "group flex min-h-8 items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground",
        isActive && "bg-blue-50 text-primary dark:bg-white/[0.06]",
      )}
    >
      <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {typeof item.count === "number" ? (
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground group-hover:text-foreground">
          {item.count}
        </span>
      ) : null}
    </Link>
  );
}
