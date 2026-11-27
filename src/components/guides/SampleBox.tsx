"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** A sample letter or format, with a button to copy it. */
export function SampleBox({ title, text }: { title: string; text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <button
          type="button"
          data-track="sample_copy"
          data-track-title={title}
          onClick={async () => {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          }}
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/10"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap px-4 py-4 font-sans text-sm leading-7 text-foreground">{text}</pre>
    </div>
  );
}
