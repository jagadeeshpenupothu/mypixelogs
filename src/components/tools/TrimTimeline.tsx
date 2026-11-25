"use client";

import { useState, type KeyboardEvent, type PointerEvent } from "react";

import { formatTimecode } from "@/lib/timecode";

type Target = "start" | "end" | "playhead";

type TrimTimelineProps = {
  duration: number;
  frame: number;
  start: number;
  end: number;
  position: number;
  thumbnails: (string | null)[];
  disabled: boolean;
  onStart: (value: number) => void;
  onEnd: (value: number) => void;
  onSeek: (value: number) => void;
};

export function TrimTimeline({
  duration,
  frame,
  start,
  end,
  position,
  thumbnails,
  disabled,
  onStart,
  onEnd,
  onSeek,
}: TrimTimelineProps) {
  const [dragging, setDragging] = useState<Target | null>(null);
  const percent = (value: number) => `${(Math.min(Math.max(value, 0), duration) / duration) * 100}%`;

  function timeAt(event: PointerEvent<HTMLElement>) {
    const box = event.currentTarget.closest("[data-testid=timeline]")?.getBoundingClientRect();
    const { clientX } = event;
    if (!box || box.width === 0) return 0;
    return Math.min(1, Math.max(0, (clientX - box.left) / box.width)) * duration;
  }

  function move(target: Target, value: number) {
    if (target === "start") onStart(value);
    else if (target === "end") onEnd(value);
    else onSeek(value);
  }

  const pointer = (target: Target) => ({
    onPointerDown(event: PointerEvent<HTMLElement>) {
      if (disabled || event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.focus({ preventScroll: true });
      setDragging(target);
      if (target === "playhead") move(target, timeAt(event));
    },
    onPointerMove(event: PointerEvent<HTMLElement>) {
      if (dragging === target) move(target, timeAt(event));
    },
    onPointerUp() {
      setDragging(null);
    },
    onPointerCancel() {
      setDragging(null);
    },
  });

  function keys(target: "start" | "end", value: number) {
    return (event: KeyboardEvent<HTMLElement>) => {
      const step = event.shiftKey ? 1 : frame;
      const next =
        event.key === "ArrowLeft" || event.key === "ArrowDown"
          ? value - step
          : event.key === "ArrowRight" || event.key === "ArrowUp"
            ? value + step
            : event.key === "Home"
              ? 0
              : event.key === "End"
                ? duration
                : null;
      if (next === null || disabled) return;
      event.preventDefault();
      event.stopPropagation();
      move(target, next);
    };
  }

  const handle = (target: "start" | "end", value: number) => (
    <div
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={target === "start" ? "Start of selection" : "End of selection"}
      aria-valuemin={0}
      aria-valuemax={Number(duration.toFixed(3))}
      aria-valuenow={Number(value.toFixed(3))}
      aria-valuetext={formatTimecode(value)}
      aria-disabled={disabled}
      {...pointer(target)}
      onKeyDown={keys(target, value)}
      className="group absolute -bottom-1 -top-1 z-20 w-11 touch-none focus-visible:outline-none"
      style={{ left: percent(value), transform: `translateX(${target === "start" ? "-100%" : "0"}) translateX(${target === "start" ? "10px" : "-10px"})` }}
    >
      <span
        className={`absolute inset-y-0 flex w-3.5 cursor-ew-resize items-center justify-center bg-amber-400 group-focus-visible:ring-2 group-focus-visible:ring-white ${
          target === "start" ? "right-2.5 rounded-l-md" : "left-2.5 rounded-r-md"
        }`}
      >
        <span className="h-5 w-0.5 rounded bg-black/60" />
      </span>
    </div>
  );

  return (
    <div className="select-none px-4">
      <div
        data-testid="timeline"
        {...pointer("playhead")}
        className={`relative h-16 touch-none rounded-md bg-[#15181d] sm:h-20 ${disabled ? "opacity-60" : "cursor-pointer"}`}
      >
        <div className="absolute inset-0 flex overflow-hidden rounded-md">
          {thumbnails.map((url, index) => (
            <div
              key={index}
              className="h-full flex-1 border-r border-black/30 bg-cover bg-center last:border-r-0"
              style={url ? { backgroundImage: `url(${url})` } : undefined}
            />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 rounded-l-md bg-black/70" style={{ width: percent(start) }} />
        <div className="pointer-events-none absolute inset-y-0 right-0 rounded-r-md bg-black/70" style={{ left: percent(end) }} />
        <div
          className="pointer-events-none absolute inset-y-0 border-y-2 border-amber-400"
          style={{ left: percent(start), right: `calc(100% - ${percent(end)})` }}
        />
        <div
          className="pointer-events-none absolute -bottom-2 -top-2 z-10 w-0.5 -translate-x-1/2 bg-white shadow"
          style={{ left: percent(position) }}
        >
          <span className="absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-white" />
        </div>
        {handle("start", start)}
        {handle("end", end)}
      </div>
      <div className="mt-3 flex justify-between font-mono text-[11px] text-zinc-500" aria-hidden="true">
        {[0, 0.25, 0.5, 0.75, 1].map((share) => (
          <span key={share} className={share === 0.25 || share === 0.75 ? "hidden sm:inline" : undefined}>
            {formatTimecode(duration * share).slice(duration >= 3600 ? 0 : 3, -4)}
          </span>
        ))}
      </div>
    </div>
  );
}
