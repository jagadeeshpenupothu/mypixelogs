"use client";

import { useState } from "react";

/** Visitors per day: one series, thin bars on a quiet grid, hover for the exact numbers. */
export function DailyChart({ data }: { data: { date: string; visitors: number; pageViews: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.visitors));
  const step = Math.pow(10, Math.floor(Math.log10(max)));
  const top = Math.ceil(max / step) * step;
  const label = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const h = hover !== null ? data[hover] : null;

  return (
    <div className="relative">
      <div className="flex h-48 items-end gap-[2px] border-b border-border pl-8">
        <span className="absolute left-0 top-0 text-[11px] tabular-nums text-muted-foreground">{top}</span>
        <span className="absolute bottom-0 left-0 text-[11px] tabular-nums text-muted-foreground">0</span>
        <span className="pointer-events-none absolute inset-x-0 left-8 top-0 border-t border-dashed border-border/70" />
        {data.map((d, i) => (
          <button
            key={d.date}
            type="button"
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onBlur={() => setHover(null)}
            aria-label={`${label(d.date)}: ${d.visitors} visitors, ${d.pageViews} page views`}
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
        <span>{label(data[0].date)}</span>
        {data.length > 2 ? <span>{label(data.at(-1)!.date)}</span> : null}
      </div>
      {h ? (
        <div className="pointer-events-none absolute -top-2 right-0 rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
          <p className="font-semibold text-foreground">{label(h.date)}</p>
          <p className="text-muted-foreground"><span className="tabular-nums text-foreground">{h.visitors}</span> visitors · <span className="tabular-nums text-foreground">{h.pageViews}</span> page views</p>
        </div>
      ) : null}
    </div>
  );
}
