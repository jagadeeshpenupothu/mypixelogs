"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronRight } from "lucide-react";

import { searchCategoryTree, type SearchCategoryId, type SearchCategoryOption } from "@/lib/search";
import { cn } from "@/lib/utils";

type SearchCategoryTreeProps = {
  selectedCategory: SearchCategoryId;
  onSelect: (category: SearchCategoryId, hasChildren: boolean) => void;
};

const expandedStorageKey = "mypixelogs:search-category-tree-expanded";
const defaultExpandedIds = ["templates"];

function readExpandedIds() {
  try {
    const savedValue = window.localStorage.getItem(expandedStorageKey);
    if (!savedValue) return defaultExpandedIds;

    const parsedValue: unknown = JSON.parse(savedValue);
    if (Array.isArray(parsedValue) && parsedValue.every((item) => typeof item === "string")) {
      return parsedValue;
    }
  } catch {
    return defaultExpandedIds;
  }

  return defaultExpandedIds;
}

function TreeNode({
  item,
  level,
  selectedCategory,
  expandedIds,
  onSelect,
  onToggle,
}: {
  item: SearchCategoryOption;
  level: number;
  selectedCategory: SearchCategoryId;
  expandedIds: string[];
  onSelect: (category: SearchCategoryId, hasChildren: boolean) => void;
  onToggle: (category: SearchCategoryId) => void;
}) {
  const hasChildren = Boolean(item.children?.length);
  const isExpanded = expandedIds.includes(item.id);
  const isSelected = selectedCategory === item.id;
  const isParentStyle = hasChildren || level === 0;
  const paddingLeft = level === 0 ? 8 : level === 1 ? 16 : level === 2 ? 32 : 48;

  return (
    <div>
      <button
        type="button"
        role="option"
        aria-selected={isSelected}
        onClick={() => {
          onSelect(item.id, hasChildren);
          if (hasChildren) onToggle(item.id);
        }}
        className={cn(
          "group flex min-h-8 w-full items-center gap-2 rounded-md py-1.5 pr-2 text-left text-sm transition-colors duration-150 hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
          isParentStyle ? "font-semibold text-foreground" : "font-normal text-muted-foreground hover:text-foreground",
          isSelected && "bg-blue-50 text-primary dark:bg-white/[0.06]",
        )}
        style={{ paddingLeft }}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown
              className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200"
              aria-hidden="true"
            />
          ) : (
            <ChevronRight
              className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200"
              aria-hidden="true"
            />
          )
        ) : (
          <span className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        )}
        {item.icon ? (
          <span className="shrink-0 text-sm" aria-hidden="true">
            {item.icon}
          </span>
        ) : null}
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        {isSelected ? <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /> : null}
      </button>

      {hasChildren ? (
        <div
          className={cn(
            "grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-out",
            isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="space-y-0.5 py-0.5">
              {item.children?.map((child) => (
                <TreeNode
                  key={child.id}
                  item={child}
                  level={level + 1}
                  selectedCategory={selectedCategory}
                  expandedIds={expandedIds}
                  onSelect={onSelect}
                  onToggle={onToggle}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function SearchCategoryTree({
  selectedCategory,
  onSelect,
}: SearchCategoryTreeProps) {
  const [mounted, setMounted] = useState(false);
  const [expandedIds, setExpandedIds] = useState<string[]>(defaultExpandedIds);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setExpandedIds(readExpandedIds());
      setMounted(true);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    try {
      window.localStorage.setItem(expandedStorageKey, JSON.stringify(expandedIds));
    } catch {
      // The tree still works for the current session.
    }
  }, [expandedIds, mounted]);

  function toggleCategory(category: SearchCategoryId) {
    setExpandedIds((current) =>
      current.includes(category) ? current.filter((id) => id !== category) : [...current, category],
    );
  }

  return (
    <div role="listbox" className="space-y-0.5">
      {searchCategoryTree.map((item) => (
        <TreeNode
          key={item.id}
          item={item}
          level={0}
          selectedCategory={selectedCategory}
          expandedIds={expandedIds}
          onSelect={(category, hasChildren) => {
            onSelect(category, hasChildren);
          }}
          onToggle={toggleCategory}
        />
      ))}
    </div>
  );
}
