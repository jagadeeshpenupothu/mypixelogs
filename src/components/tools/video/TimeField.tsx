"use client";

import { useState } from "react";

import { formatTimecode, parseTimecode } from "@/lib/timecode";

export function TimeField({
  label,
  value,
  disabled,
  onCommit,
}: {
  label: string;
  value: number;
  disabled: boolean;
  onCommit: (value: number) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);

  function commit() {
    if (draft === null) return;
    const time = parseTimecode(draft);
    if (time === null) {
      setInvalid(true);
      return;
    }
    setDraft(null);
    setInvalid(false);
    onCommit(time);
  }

  return (
    <label className="block min-w-0">
      <span className="text-xs font-medium text-zinc-400">{label}</span>
      <input
        value={draft ?? formatTimecode(value)}
        disabled={disabled}
        aria-invalid={invalid}
        autoComplete="off"
        spellCheck={false}
        onFocus={(event) => event.currentTarget.select()}
        onChange={(event) => {
          setDraft(event.target.value);
          setInvalid(false);
        }}
        onBlur={commit}
        onKeyDown={(event) => {
          event.stopPropagation();
          if (event.key === "Enter") commit();
          if (event.key === "Escape") {
            setDraft(null);
            setInvalid(false);
          }
        }}
        className={`mt-1 h-10 w-full rounded-md border bg-black/40 px-3 font-mono text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-40 ${
          invalid ? "border-red-500" : "border-white/10"
        }`}
      />
      {invalid ? <span className="mt-1 block text-xs text-red-400">Use HH:MM:SS or seconds</span> : null}
    </label>
  );
}
