"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CornerDownLeft, FileText, Image as ImageIcon, Search, Sparkles, Wrench, X } from "lucide-react";

import { popularTasks, searchExamples } from "@/data/navigation";
import { searchItems, type SearchItem } from "@/lib/search";
import { track } from "@/lib/track";

const typeIcons: Record<SearchItem["type"], typeof Wrench> = {
  Tool: Wrench,
  Template: FileText,
  Asset: ImageIcon,
  "AI Prompt": Sparkles,
  "AI Image Prompt": Sparkles,
  "AI Image": ImageIcon,
  Guide: FileText,
};

/** Search that answers while typing. People can use the mouse or the arrow keys. */
export function SiteSearch({ large = false }: { large?: boolean }) {
  const router = useRouter();
  const listId = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [marked, setMarked] = useState(-1);
  const typed = query.trim();
  const results = useMemo(() => (typed ? searchItems(typed).slice(0, 7) : []), [typed]);
  const options = typed
    ? results.map((item) => ({ key: `${item.type}-${item.id}`, href: item.href, title: item.title, note: item.description, type: item.type }))
    : popularTasks.slice(0, 5).map((task) => ({ key: task.href, href: task.href, title: task.title, note: task.note, type: task.href.startsWith("/templates") ? ("Template" as const) : ("Tool" as const) }));

  useEffect(() => {
    function outside(event: PointerEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function shortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", shortcut);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", shortcut);
    };
  }, []);

  function go(href: string) {
    if (typed) track("search", { search_term: typed, result: href, results: results.length });
    setOpen(false);
    setMarked(-1);
    setQuery("");
    inputRef.current?.blur();
    router.push(href);
  }

  return (
    <div
      ref={boxRef}
      role="search"
      className="relative w-full min-w-0"
      onBlur={(event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
      }}
    >
      <Search className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground ${large ? "left-5 h-6 w-6" : "left-3.5 h-5 w-5"}`} aria-hidden="true" />
      <input
        ref={inputRef}
        value={query}
        role="combobox"
        aria-label="Search MyPixelogs"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && marked >= 0 ? `${listId}-${marked}` : undefined}
        enterKeyHint="search"
        autoComplete="off"
        spellCheck={false}
        placeholder={large ? "What do you want to do?" : "Search"}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setMarked(-1);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
            setMarked(-1);
          } else if ((event.key === "ArrowDown" || event.key === "ArrowUp") && options.length > 0) {
            event.preventDefault();
            setOpen(true);
            const step = event.key === "ArrowDown" ? 1 : -1;
            setMarked((now) => (now < 0 && step < 0 ? options.length - 1 : (now + step + options.length) % options.length));
          } else if (event.key === "Enter") {
            event.preventDefault();
            if (marked >= 0 && options[marked]) go(options[marked].href);
            else if (typed) go(`/search?q=${encodeURIComponent(typed)}`);
          }
        }}
        className={`w-full min-w-0 border border-input bg-card text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/25 ${
          large ? "h-16 rounded-2xl pl-14 pr-14 text-lg shadow-md" : "h-11 rounded-xl pl-11 pr-11 text-base"
        }`}
      />
      {query ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setQuery("");
            inputRef.current?.focus();
          }}
          className={`absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground ${large ? "right-3" : "right-1"}`}
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      ) : null}

      {open ? (
        <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-[70] max-h-[min(460px,calc(100dvh-8rem))] overflow-auto rounded-2xl border border-border bg-card p-2 text-left shadow-xl">
          {options.length > 0 ? (
            <>
              <p className="px-3 pb-1 pt-1.5 text-sm font-semibold text-muted-foreground">{typed ? "Best matches" : "Start here"}</p>
              <ul id={listId} role="listbox" aria-label={typed ? "Best matches" : "Start here"}>
                {options.map((option, place) => {
                  const Icon = typeIcons[option.type];
                  return (
                    <li key={option.key} id={`${listId}-${place}`} role="option" aria-selected={marked === place}>
                      <Link prefetch={false}
                        href={option.href}
                        tabIndex={-1}
                        onClick={() => {
                          setOpen(false);
                          setQuery("");
                        }}
                        onMouseEnter={() => setMarked(place)}
                        className={`flex min-h-12 items-center gap-3 rounded-xl px-3 py-2 ${marked === place ? "bg-muted" : ""}`}
                      >
                        <Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-base font-semibold text-foreground">{option.title}</span>
                          <span className="block truncate text-sm text-muted-foreground">{option.note}</span>
                        </span>
                        {marked === place ? <CornerDownLeft className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" aria-hidden="true" /> : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <div className="px-3 py-4">
              <p className="text-base font-semibold text-foreground">Nothing found for “{typed}”</p>
              <p className="mt-1 text-sm text-muted-foreground">Try one of these:</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {searchExamples.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => {
                      setQuery(example);
                      inputRef.current?.focus();
                    }}
                    className="min-h-10 rounded-full border border-border px-3.5 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
