"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, Pause, Play, Search, X } from "lucide-react";

import { Breadcrumbs } from "@/components/templates/Breadcrumbs";
import type { AudioItem } from "@/lib/audio-library";
import { matchScore, searchWords } from "@/lib/plain-search";
import { cn } from "@/lib/utils";

const control =
  "h-9 shrink-0 rounded-full border border-border bg-card px-3 text-sm text-foreground hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70";

/** A playable list of music or sound effects with one slim toolbar. Only one sound plays at a time. */
export function AudioLibrary({
  items,
  title,
  intro,
  breadcrumbs,
  groupLabel,
  note,
}: {
  items: AudioItem[];
  title: string;
  intro: string;
  breadcrumbs: { label: string; href?: string }[];
  groupLabel: string;
  note?: React.ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const [playing, setPlaying] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => audio.current?.pause(), []);

  const groups = useMemo(() => [...new Set(items.map((i) => i.group))], [items]);
  const words = searchWords(query);
  const shown = items.filter((i) => (group === "all" || i.group === group) && (!words.length || matchScore(words, [i.title, i.group, i.words]) > 0));

  const toggle = (item: AudioItem) => {
    if (!audio.current) {
      audio.current = new Audio();
      audio.current.addEventListener("timeupdate", () => {
        const a = audio.current!;
        setProgress(a.duration ? a.currentTime / a.duration : 0);
      });
      audio.current.addEventListener("ended", () => setPlaying(null));
    }
    const a = audio.current;
    if (playing === item.id) {
      a.pause();
      setPlaying(null);
      return;
    }
    a.src = item.preview;
    setProgress(0);
    void a.play();
    setPlaying(item.id);
  };

  const copy = async (item: AudioItem) => {
    if (!item.credit) return;
    await navigator.clipboard.writeText(item.credit);
    setCopied(item.id);
    setTimeout(() => setCopied((c) => (c === item.id ? null : c)), 1800);
  };

  return (
    <section className="pb-2">
      <h1 className="sr-only">{title}</h1>
      <p className="sr-only">{intro}</p>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <Breadcrumbs items={breadcrumbs} />
        <div className="flex w-full items-center gap-2 overflow-x-auto pb-1 sm:w-auto sm:overflow-visible sm:pb-0" role="group" aria-label={`Filter ${title}`}>
          <label className="relative w-44 shrink-0 sm:w-52">
            <span className="sr-only">Search</span>
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className={cn(control, "w-full pl-8 pr-7")} />
            {query ? (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </label>
          <select aria-label={groupLabel} className={control} value={group} onChange={(e) => setGroup(e.target.value)}>
            <option value="all">All ({items.length})</option>
            {groups.map((g) => (
              <option key={g} value={g}>{g} ({items.filter((i) => i.group === g).length})</option>
            ))}
          </select>
        </div>
      </div>

      {note ? <div className="mt-4 rounded-xl border border-border bg-card/60 px-4 py-3 text-sm leading-6 text-muted-foreground">{note}</div> : null}
      <p role="status" className="sr-only">{shown.length} of {items.length}</p>

      <ul className="mt-5 grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
        {shown.map((item) => {
          const on = playing === item.id;
          return (
            <li key={item.id} className={cn("relative overflow-hidden rounded-xl border bg-card transition-colors", on ? "border-primary/60" : "border-border")}>
              <div className="flex items-center gap-3 p-3">
                <button
                  type="button"
                  onClick={() => toggle(item)}
                  aria-label={`${on ? "Pause" : "Play"} ${item.title}`}
                  className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors", on ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-primary hover:text-primary-foreground")}
                >
                  {on ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.group} · {item.meta}</p>
                </div>
                {item.credit ? (
                  <button type="button" onClick={() => copy(item)} title="Copy the credit line for your video description" aria-label={`Copy credit for ${item.title}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground">
                    {copied === item.id ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                  </button>
                ) : null}
                <a
                  href={item.download}
                  {...(item.direct ? { download: `${item.title}.mp3` } : { target: "_blank", rel: "noopener" })}
                  aria-label={`Download ${item.title}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>
              {on ? <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-primary" style={{ transform: `scaleX(${progress})` }} /> : null}
            </li>
          );
        })}
      </ul>
      {!shown.length ? <p className="mt-10 text-center text-base text-muted-foreground">Nothing matches. Try another word.</p> : null}
    </section>
  );
}
