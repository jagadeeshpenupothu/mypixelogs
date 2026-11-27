"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { blanksOf, chatGptUrl, fillPrompt } from "@/lib/prompts";

/** Fill in the blanks, watch the prompt update, then copy it or open it in ChatGPT. */
export function PromptBuilder({ prompt }: { prompt: string }) {
  const blanks = useMemo(() => blanksOf(prompt), [prompt]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const filled = fillPrompt(prompt, values);
  const done = blanks.filter((b) => values[b.label]?.trim()).length;

  const copy = async () => {
    await navigator.clipboard.writeText(filled);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Highlight the blanks that are still empty.
  const parts = filled.split(/(\[[^\]\n]+\])/g);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(280px,380px)_1fr]">
      <form className="grid gap-3 rounded-xl border border-border bg-card p-4" onSubmit={(e) => e.preventDefault()}>
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-semibold text-foreground">Your details</p>
          <p className="text-xs text-muted-foreground">{done} of {blanks.length} filled · optional</p>
        </div>
        {blanks.map((b) => (
          <label key={b.label} className="grid gap-1 text-xs font-medium text-muted-foreground">
            {b.label}
            <input
              value={values[b.label] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [b.label]: e.target.value }))}
              placeholder={b.example}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
            />
          </label>
        ))}
        {done ? (
          <button type="button" onClick={() => setValues({})} className="flex items-center gap-1.5 justify-self-start text-sm font-medium text-muted-foreground hover:text-foreground">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Clear
          </button>
        ) : null}
      </form>

      <div className="min-w-0 lg:sticky lg:top-20">
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <p className="text-sm font-semibold text-foreground">Prompt</p>
            <p className="text-xs text-muted-foreground">Empty boxes stay as [brackets]; ChatGPT will leave space for them.</p>
          </div>
          <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap break-words px-4 py-4 font-sans text-sm leading-7 text-foreground">
            {parts.map((part, i) =>
              /^\[[^\]]+\]$/.test(part) ? (
                <mark key={i} className="rounded bg-primary/10 px-1 text-primary">{part}</mark>
              ) : (
                <span key={i}>{part}</span>
              ),
            )}
          </pre>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button size="lg" className="flex-1" asChild>
            <a href={chatGptUrl(filled)} target="_blank" rel="noopener">
              <ExternalLink className="h-4 w-4" /> Open in ChatGPT
            </a>
          </Button>
          <Button size="lg" variant="outline" className="flex-1" onClick={copy} data-track="prompt_copy" data-track-filled={done}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy prompt"}
          </Button>
        </div>
      </div>
    </div>
  );
}
