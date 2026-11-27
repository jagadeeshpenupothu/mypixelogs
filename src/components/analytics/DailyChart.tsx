"use client";

import { useState } from "react";

type Bar = { label: string; visitors: number; pageViews: number };

/** Visitors over time: one series, thin bars on a quiet grid, hover or tap for the exact numbers. */
export function DailyChart({ data, firstLabel, lastLabel }: { data: Bar[]; firstLabel?: string; lastLabel?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.visitors));
  const step = Math.pow(10, Math.floor(Math.log10(max)));
  const top = Math.ceil(max / step) * step;
  const h = hover !== null ? data[hover] : null;

  return (
    <div className="relative">
      <div className="relative flex h-44 items-end gap-[2px] border-b border-border pl-8">
        <span className="absolute left-0 top-0 text-[11px] tabular-nums text-muted-foreground">{top}</span>
        <span className="absolute bottom-0 left-0 text-[11px] tabular-nums text-muted-foreground">0</span>
        <span className="pointer-events-none absolute inset-x-0 left-8 top-0 border-t border-dashed border-border/70" />
        {data.map((d, i) => (
          <button
            key={d.label}
            type="button"
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onClick={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onBlur={() => setHover(null)}
            aria-label={`${d.label}: ${d.visitors} visitors, ${d.pageViews} page views`}
            className="group relative flex h-full flex-1 items-end focus-visible:outline-none"
          >
            <span
              className="mx-auto w-full max-w-12 rounded-t-[4px] bg-primary transition-opacity group-hover:opacity-80 group-focus-visible:ring-2 group-focus-visible:ring-ring"
              style={{ height: `${(d.visitors / top) * 100}%`, minHeight: d.visitors ? 2 : 0 }}
            />
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-between pl-8 text-[11px] text-muted-foreground">
        <span>{firstLabel ?? data[0]?.label}</span>
        <span>{lastLabel ?? data.at(-1)?.label}</span>
      </div>
      {h ? (
        <div className="pointer-events-none absolute -top-2 right-0 rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
          <p className="font-semibold text-foreground">{h.label}</p>
          <p className="text-muted-foreground">
            <span className="tabular-nums text-foreground">{h.visitors}</span> visitors · <span className="tabular-nums text-foreground">{h.pageViews}</span> page views
          </p>
        </div>
      ) : null}
    </div>
  );
}
