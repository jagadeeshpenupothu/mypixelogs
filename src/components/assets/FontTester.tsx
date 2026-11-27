"use client";

import { useState } from "react";

import type { FontFamily } from "@/lib/fonts";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 ₹&@?!";

/** Type your own words and see them in the font, at any size and weight. */
export function FontTester({ font, family }: { font: FontFamily; family: string }) {
  const [text, setText] = useState(font.sample ?? "Grand opening this Sunday");
  const [size, setSize] = useState(64);
  const [weight, setWeight] = useState(font.weights.includes(400) ? 400 : font.weights[0]);
  const style = { fontFamily: `'${family}', sans-serif`, fontWeight: font.variable ? weight : undefined };

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-3">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Your text</span>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type something"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
          />
        </label>
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          Size
          <input type="range" min={16} max={140} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-28 accent-[hsl(var(--primary))]" />
          <span className="w-8 tabular-nums">{size}</span>
        </label>
        {font.variable && font.weights.length > 1 ? (
          <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            Weight
            <select value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="h-9 rounded-full border border-border bg-background px-3 text-sm text-foreground">
              {font.weights.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      <p className="px-4 py-8 [overflow-wrap:anywhere] leading-tight text-foreground sm:px-6" style={{ ...style, fontSize: size }}>
        {text || "Type something"}
      </p>
      <div className="grid gap-4 border-t border-border p-4 sm:px-6">
        <p className="text-2xl leading-snug text-foreground [overflow-wrap:anywhere]" style={style}>{ALPHABET}</p>
        <p className="text-base leading-7 text-muted-foreground" style={style}>
          Good design is clear, honest and made for people. This font is free for posters, flyers, invitations, logos, videos and client work.
        </p>
        {font.variable && font.weights.length > 1 ? (
          <div className="grid gap-1.5">
            {font.weights.map((w) => (
              <p key={w} className="truncate text-xl text-foreground" style={{ fontFamily: style.fontFamily, fontWeight: w }}>
                <span className="mr-3 inline-block w-10 font-sans text-xs text-muted-foreground">{w}</span>
                {font.name}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
