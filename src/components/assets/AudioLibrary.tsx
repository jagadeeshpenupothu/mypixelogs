"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Download, Pause, Play, Search, X } from "lucide-react";

import { Breadcrumbs } from "@/components/templates/Breadcrumbs";
import type { AudioItem } from "@/lib/audio-library";
import { matchScore, searchWords } from "@/lib/plain-search";
import { cn } from "@/lib/utils";

const control =
  "h-9 shrink-0 rounded-full border border-border bg-card px-3 text-sm text-foreground hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70";

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** The waveform: played part in the brand colour; click or drag anywhere to jump there. */
function Waveform({ peaks, progress, active, onSeek }: { peaks: number[]; progress: number; active: boolean; onSeek: (fraction: number) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const dragging = useRef(false);
  const at = (e: React.PointerEvent) => {
    const r = box.current!.getBoundingClientRect();
    return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
  };
  return (
    <div
      ref={box}
      role="slider"
      tabIndex={0}
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") onSeek(Math.min(1, progress + 0.05));
        if (e.key === "ArrowLeft") onSeek(Math.max(0, progress - 0.05));
      }}
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        onSeek(at(e));
      }}
      onPointerMove={(e) => {
        setHover(at(e));
        if (dragging.current) onSeek(at(e));
      }}
      onPointerUp={() => (dragging.current = false)}
      onPointerLeave={() => setHover(null)}
      className="group/wave relative flex h-12 w-full cursor-pointer touch-none items-center gap-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
    >
      {peaks.map((h, i) => {
        const x = (i + 0.5) / peaks.length;
        const played = active && x <= progress;
        const hovered = hover !== null && x <= hover;
        return (
          <span
            key={i}
            className={cn("min-w-[1px] flex-1 rounded-full transition-colors", played ? "bg-primary" : hovered ? "bg-foreground/45" : "bg-foreground/20")}
            style={{ height: `${h}%` }}
          />
        );
      })}
    </div>
  );
}

/** Pixabay-style list: one sound per row, waveform in the middle, only one sound plays at a time. */
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
  const [active, setActive] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [time, setTime] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const frame = useRef(0);

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      audio.current?.pause();
    },
    [],
  );

  const groups = [...new Set(items.map((i) => i.group))];
  const words = searchWords(query);
  const shown = items.filter((i) => (group === "all" || i.group === group) && (!words.length || matchScore(words, [i.title, i.group, i.words, i.tags.join(" ")]) > 0));

  const tick = () => {
    const a = audio.current;
    if (!a) return;
    setTime(a.currentTime);
    setProgress(a.duration ? a.currentTime / a.duration : 0);
    if (!a.paused) frame.current = requestAnimationFrame(tick);
  };

  const player = () => {
    if (!audio.current) {
      const a = new Audio();
      a.preload = "auto";
      a.addEventListener("play", () => {
        setPlaying(true);
        frame.current = requestAnimationFrame(tick);
      });
      a.addEventListener("pause", () => setPlaying(false));
      a.addEventListener("ended", () => {
        setPlaying(false);
        setProgress(1);
      });
      audio.current = a;
    }
    return audio.current;
  };

  /** Play a row from a point (0-1), switching rows if needed. */
  const playAt = (item: AudioItem, fraction?: number) => {
    const a = player();
    if (active !== item.id) {
      a.src = item.preview;
      setActive(item.id);
      setProgress(fraction ?? 0);
      setTime(0);
      const start = () => {
        if (fraction !== undefined && a.duration) a.currentTime = fraction * a.duration;
        void a.play();
      };
      if (fraction !== undefined) a.addEventListener("loadedmetadata", start, { once: true });
      else void a.play();
      return;
    }
    if (fraction !== undefined) {
      if (a.duration) a.currentTime = fraction * a.duration;
      setProgress(fraction);
      if (a.paused) void a.play();
    } else if (a.paused) {
      if (a.ended) a.currentTime = 0;
      void a.play();
    } else a.pause();
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

      {note ? <p className="mt-4 text-sm leading-6 text-muted-foreground">{note}</p> : null}
      <p role="status" className="sr-only">{shown.length} of {items.length}</p>

      <ul className="mt-4 divide-y divide-border border-y border-border">
        {shown.map((item) => {
          const isActive = active === item.id;
          const on = isActive && playing;
          return (
            <li
              key={item.id}
              className={cn(
                "grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1 px-1 py-2.5 transition-colors sm:px-3 md:grid-cols-[auto_minmax(180px,260px)_1fr_auto_auto]",
                isActive ? "bg-primary/[0.05]" : "hover:bg-muted/50",
              )}
            >
              <button
                type="button"
                onClick={() => playAt(item)}
                aria-label={`${on ? "Pause" : "Play"} ${item.title}`}
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
                  on ? "bg-primary text-primary-foreground" : "bg-foreground text-background hover:bg-primary hover:text-primary-foreground",
                )}
              >
                {on ? <Pause className="h-4 w-4" fill="currentColor" /> : <Play className="ml-0.5 h-4 w-4" fill="currentColor" />}
              </button>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-0.5 flex h-5 flex-wrap gap-1 overflow-hidden">
                  <span className="rounded-full bg-muted px-2 py-px text-[11px] text-muted-foreground">{item.group}</span>
                  {item.tags.slice(0, 2).map((t) => (
                    <span key={t} className="hidden rounded-full bg-muted px-2 py-px text-[11px] text-muted-foreground lg:inline">{t}</span>
                  ))}
                </p>
              </div>

              <div className="col-span-3 row-start-2 md:col-span-1 md:row-start-auto">
                <Waveform peaks={item.peaks} progress={isActive ? progress : 0} active={isActive} onSeek={(f) => playAt(item, f)} />
              </div>

              <span className="col-start-3 row-start-1 w-16 text-right text-xs tabular-nums text-muted-foreground md:col-start-auto md:row-start-auto">
                {isActive ? clock(time) : item.length}
              </span>

              <div className="col-start-3 row-start-1 hidden items-center gap-1 md:col-start-auto md:row-start-auto md:flex">
                {item.credit ? (
                  <button type="button" onClick={() => copy(item)} title="Copy the credit line for your video description" aria-label={`Copy credit for ${item.title}`} className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground">
                    {copied === item.id ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                  </button>
                ) : null}
                <a
                  href={item.download}
                  download={item.fileName}
                  className="flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-sm font-medium text-foreground hover:border-primary/60"
                >
                  <Download className="h-4 w-4" /> Download
                </a>
              </div>

              {/* Phones: actions under the waveform. */}
              <div className="col-span-3 flex justify-end gap-1 md:hidden">
                {item.credit ? (
                  <button type="button" onClick={() => copy(item)} className="flex h-8 items-center gap-1.5 rounded-full px-3 text-xs text-muted-foreground hover:bg-muted">
                    {copied === item.id ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />} Credit
                  </button>
                ) : null}
                <a href={item.download} download={item.fileName} className="flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium text-foreground">
                  <Download className="h-3.5 w-3.5" /> Download
                </a>
              </div>
            </li>
          );
        })}
      </ul>
      {!shown.length ? <p className="mt-10 text-center text-base text-muted-foreground">Nothing matches. Try another word.</p> : null}
    </section>
  );
}
