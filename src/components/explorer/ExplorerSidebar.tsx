"use client";

import { useState } from "react";
import Link from "next/link";
import { Folder, LayoutGrid, Sparkles, Wrench } from "lucide-react";
import { usePathname } from "next/navigation";

import { ExplorerGroup } from "@/components/explorer/ExplorerGroup";
import type { ExplorerGroupData, ExplorerItemData } from "@/lib/explorer";
import { cn } from "@/lib/utils";

type ExplorerSidebarProps = {
  groups: ExplorerGroupData[];
  collapsed?: boolean;
  onNavigate?: () => void;
};

const groupIcons = {
  templates: Folder,
  tools: Wrench,
  "ai-hub": Sparkles,
  assets: LayoutGrid,
};

function isActiveHref(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

function hasActiveItem(items: ExplorerItemData[], pathname: string): boolean {
  return items.some((item) => {
    if (isActiveHref(pathname, item.href)) return true;
    return item.children ? hasActiveItem(item.children, pathname) : false;
  });
}

/** The current section (and sub-section), so the sidebar never jumps after loading. */
function getOpenIds(groups: ExplorerGroupData[], pathname: string) {
  const group = groups.find((item) => isActiveHref(pathname, item.href) || hasActiveItem(item.items, pathname));
  if (!group) return groups[0] ? [groups[0].id] : [];
  const item = group.items.find(
    (child) => isActiveHref(pathname, child.href) || (child.children ? hasActiveItem(child.children, pathname) : false),
  );
  return item ? [group.id, item.id] : [group.id];
}

export function ExplorerSidebar({
  groups,
  collapsed = false,
  onNavigate,
}: ExplorerSidebarProps) {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState(() => getOpenIds(groups, pathname));
  const [previousPathname, setPreviousPathname] = useState(pathname);

  if (pathname !== previousPathname) {
    setPreviousPathname(pathname);
    setExpandedGroups((current) => [...new Set([...current, ...getOpenIds(groups, pathname)])]);
  }

  function toggleGroup(groupId: string, siblingIds: string[] = groups.map((group) => group.id), forceOpen = false) {
    setExpandedGroups((currentGroups) => {
      const isOpen = currentGroups.includes(groupId);
      const withoutSiblings = currentGroups.filter((id) => !siblingIds.includes(id));

      if (isOpen && !forceOpen) {
        return withoutSiblings;
      }

      return [...withoutSiblings, groupId];
    });
  }

  return (
    <aside aria-label="Library" className="h-full w-full overflow-y-auto border-r border-border bg-slate-50/80 dark:bg-[#050505]">
      {collapsed ? (
        <div className="space-y-2 px-2 py-4">
          {groups.map((group) => {
            const Icon = groupIcons[group.id as keyof typeof groupIcons] ?? Folder;
            const isActive =
              isActiveHref(pathname, group.href) || hasActiveItem(group.items, pathname);

            return (
              <Link
                key={group.id}
                href={group.href}
                title={group.label}
                aria-label={group.label}
                onClick={onNavigate}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground",
                  isActive && "bg-blue-50 text-primary dark:bg-white/[0.06]",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2 px-2.5 py-3">
        {groups.map((group) => (
          <ExplorerGroup
            key={group.id}
            group={group}
            expandedIds={expandedGroups}
            onToggle={toggleGroup}
            onNavigate={onNavigate}
            siblingIds={groups.map((sibling) => sibling.id)}
          />
        ))}
        </div>
      )}
    </aside>
  );
}
