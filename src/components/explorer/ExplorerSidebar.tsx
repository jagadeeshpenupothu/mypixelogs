"use client";

import { useEffect, useMemo, useState } from "react";
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

const expandedGroupsStorageKey = "mypixelogs:explorer-expanded-groups";

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

function getActiveGroupId(groups: ExplorerGroupData[], pathname: string) {
  return groups.find((group) => isActiveHref(pathname, group.href) || hasActiveItem(group.items, pathname))?.id;
}

export function ExplorerSidebar({
  groups,
  collapsed = false,
  onNavigate,
}: ExplorerSidebarProps) {
  const pathname = usePathname();
  const defaultExpandedGroups = useMemo(() => (groups[0] ? [groups[0].id] : []), [groups]);
  const [mounted, setMounted] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(defaultExpandedGroups);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMounted(true);

      try {
        const storedValue = window.localStorage.getItem(expandedGroupsStorageKey);
        if (storedValue) {
          const parsedValue: unknown = JSON.parse(storedValue);
          if (Array.isArray(parsedValue) && parsedValue.every((item) => typeof item === "string")) {
            setExpandedGroups(parsedValue);
          }
        }
      } catch {
        setExpandedGroups(defaultExpandedGroups);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [defaultExpandedGroups]);

  useEffect(() => {
    if (!mounted) return;

    try {
      window.localStorage.setItem(expandedGroupsStorageKey, JSON.stringify(expandedGroups));
    } catch {
      // Ignore storage errors; the current state still updates.
    }
  }, [expandedGroups, mounted]);

  const visibleExpandedGroups = useMemo(() => {
    const activeGroupId = getActiveGroupId(groups, pathname);

    if (!mounted || !activeGroupId || expandedGroups.includes(activeGroupId)) {
      return expandedGroups;
    }

    const topLevelIds = groups.map((group) => group.id);
    const withoutTopLevelSiblings = expandedGroups.filter((id) => !topLevelIds.includes(id));

    return [...withoutTopLevelSiblings, activeGroupId];
  }, [expandedGroups, groups, mounted, pathname]);

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
    <aside className="h-full w-full overflow-y-auto border-r border-border bg-slate-50/80 dark:bg-[#050505]">
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
            expandedIds={visibleExpandedGroups}
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
