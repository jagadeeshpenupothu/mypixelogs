"use client";

import Link from "next/link";
import { ChevronRight, FileText, Folder } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import type { ExplorerGroupData, ExplorerItemData } from "@/lib/explorer";

type ExplorerGroupProps = {
  group: ExplorerGroupData;
  expandedIds: string[];
  onToggle: (id: string, siblingIds?: string[], forceOpen?: boolean) => void;
  onNavigate?: () => void;
  siblingIds?: string[];
};

function hasActiveChild(items: ExplorerItemData[], pathname: string): boolean {
  return items.some((item) => {
    if (pathname === item.href) return true;
    return item.children ? hasActiveChild(item.children, pathname) : false;
  });
}

function ExplorerTreeItem({
  item,
  level,
  expandedIds,
  onToggle,
  onNavigate,
  siblingIds,
}: {
  item: ExplorerItemData;
  level: number;
  expandedIds: string[];
  onToggle: (id: string, siblingIds?: string[], forceOpen?: boolean) => void;
  onNavigate?: () => void;
  siblingIds: string[];
}) {
  const pathname = usePathname();
  const hasChildren = Boolean(item.children?.length);
  const isOpen = expandedIds.includes(item.id);
  const isActive = pathname === item.href || (item.children ? hasActiveChild(item.children, pathname) : false);
  const Icon = hasChildren ? Folder : FileText;
  const isTopLevel = level === 0;
  const paddingLeft = level === 0 ? 10 : level === 1 ? 16 : 28;

  return (
    <div className={isTopLevel ? "my-3 first:mt-0" : undefined}>
      <div
        className={cn(
          "group flex items-center rounded-md text-muted-foreground transition-[background-color,color] duration-150 hover:bg-muted/60 hover:text-foreground",
          isTopLevel
            ? "min-h-[42px] py-2 pr-2.5 text-base font-semibold"
            : "min-h-9 py-1.5 pr-2.5 text-sm font-medium",
          isActive && "bg-muted/70 text-foreground dark:bg-white/[0.04]",
        )}
        style={{ paddingLeft }}
      >
        <Link
          href={item.href}
          onClick={() => {
            if (hasChildren) {
              onToggle(item.id, siblingIds, true);
            }
            onNavigate?.();
          }}
          className={cn(
            "flex min-w-0 flex-1 items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
            isTopLevel ? "gap-2.5" : "gap-2",
          )}
        >
          <Icon
            className={cn(
              "shrink-0",
              isTopLevel ? "h-4 w-4" : "h-3.5 w-3.5",
              hasChildren ? "text-amber-500" : "text-muted-foreground",
            )}
            aria-hidden="true"
          />
          <span className="truncate">{item.label}</span>
        </Link>

        {typeof item.count === "number" ? (
          <span className="ml-2 flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-semibold text-muted-foreground transition-colors duration-150 group-hover:text-foreground">
            {item.count}
          </span>
        ) : null}

        {hasChildren ? (
          <button
            type="button"
            aria-label={`${isOpen ? "Collapse" : "Expand"} ${item.label}`}
            aria-expanded={isOpen}
            aria-controls={`${item.id}-items`}
            onClick={() => onToggle(item.id, siblingIds)}
            className="ml-2.5 shrink-0 rounded p-0.5 text-muted-foreground transition-colors duration-150 hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            <ChevronRight
              className={cn("h-3.5 w-3.5 transition-transform duration-200", isOpen && "rotate-90")}
              aria-hidden="true"
            />
          </button>
        ) : (
          <span className="ml-2.5 h-4 w-4 shrink-0" aria-hidden="true" />
        )}
      </div>

      {hasChildren ? (
        <div
          id={`${item.id}-items`}
          className={cn(
            "grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-out",
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="space-y-0.5 py-0.5">
              {item.children?.map((child) => (
                <ExplorerTreeItem
                  key={child.id}
                  item={child}
                  level={level + 1}
                  expandedIds={expandedIds}
                  onToggle={onToggle}
                  onNavigate={onNavigate}
                  siblingIds={item.children?.map((sibling) => sibling.id) ?? []}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ExplorerGroup({
  group,
  expandedIds,
  onToggle,
  onNavigate,
  siblingIds = [],
}: ExplorerGroupProps) {
  return (
    <ExplorerTreeItem
      item={{
        id: group.id,
        label: group.label,
        href: group.href,
        count: group.count,
        type: "link",
        children: group.items,
      }}
      level={0}
      expandedIds={expandedIds}
      onToggle={onToggle}
      onNavigate={onNavigate}
      siblingIds={siblingIds}
    />
  );
}
