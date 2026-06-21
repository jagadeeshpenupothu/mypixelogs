"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { Braces, CheckCircle2, Clipboard, Download, Eraser, FileUp, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ValidationResult =
  | {
      status: "idle";
    }
  | {
      status: "valid";
      parsed: unknown;
      totalKeys: number;
      totalObjects: number;
      totalArrays: number;
    }
  | {
      status: "invalid";
      message: string;
      line: number | null;
      column: number | null;
    };

const placeholderJson = `{
  "name": "MyPixelogs",
  "tool": "JSON Validator"
}`;

function countJsonStats(value: unknown) {
  let totalKeys = 0;
  let totalObjects = 0;
  let totalArrays = 0;

  function walk(nextValue: unknown) {
    if (Array.isArray(nextValue)) {
      totalArrays += 1;
      nextValue.forEach(walk);
      return;
    }

    if (nextValue && typeof nextValue === "object") {
      totalObjects += 1;
      const entries = Object.entries(nextValue as Record<string, unknown>);
      totalKeys += entries.length;
      entries.forEach(([, entryValue]) => walk(entryValue));
    }
  }

  walk(value);

  return { totalKeys, totalObjects, totalArrays };
}

function getLineColumnFromPosition(input: string, position: number) {
  const beforeError = input.slice(0, Math.max(0, position));
  const lines = beforeError.split("\n");

  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

function getErrorLocation(input: string, message: string) {
  const positionMatch = message.match(/position\s+(\d+)/i);

  if (positionMatch?.[1]) {
    return getLineColumnFromPosition(input, Number(positionMatch[1]));
  }

  const lineColumnMatch = message.match(/line\s+(\d+)\s+column\s+(\d+)/i);

  if (lineColumnMatch?.[1] && lineColumnMatch[2]) {
    return {
      line: Number(lineColumnMatch[1]),
      column: Number(lineColumnMatch[2]),
    };
  }

  return { line: null, column: null };
}

function validateJson(input: string): ValidationResult {
  try {
    const parsed = JSON.parse(input);
    return {
      status: "valid",
      parsed,
      ...countJsonStats(parsed),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON";
    const location = getErrorLocation(input, message);

    return {
      status: "invalid",
      message,
      line: location.line,
      column: location.column,
    };
  }
}

function downloadJson(input: string) {
  const blob = new Blob([input], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "formatted.json";
  link.click();
  URL.revokeObjectURL(url);
}

export function JSONValidator() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [jsonText, setJsonText] = useState(placeholderJson);
  const [validation, setValidation] = useState<ValidationResult>(() => validateJson(placeholderJson));
  const [copied, setCopied] = useState(false);

  const characterCount = jsonText.length;
  const canFormat = validation.status === "valid";

  const lineCount = useMemo(() => jsonText.split("\n").length, [jsonText]);

  function updateJsonText(nextText: string) {
    setJsonText(nextText);
    setValidation(validateJson(nextText));
    setCopied(false);
  }

  function formatJson() {
    if (validation.status !== "valid") return;
    updateJsonText(JSON.stringify(validation.parsed, null, 2));
  }

  function minifyJson() {
    if (validation.status !== "valid") return;
    updateJsonText(JSON.stringify(validation.parsed));
  }

  async function copyJson() {
    await navigator.clipboard.writeText(jsonText);
    setCopied(true);
  }

  function clearJson() {
    setJsonText("");
    setValidation({ status: "idle" });
    setCopied(false);
  }

  async function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const content = await file.text();
    updateJsonText(content);
    event.target.value = "";
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Braces className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-foreground">JSON editor</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => setValidation(validateJson(jsonText))}>
              Validate JSON
            </Button>
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <FileUp className="h-4 w-4" />
              Upload .json
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-lg border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground">
            <span>{lineCount} lines</span>
            <span>{characterCount.toLocaleString()} characters</span>
          </div>
          <textarea
            value={jsonText}
            onChange={(event) => updateJsonText(event.target.value)}
            placeholder={placeholderJson}
            spellCheck={false}
            className="min-h-[560px] w-full resize-y bg-background p-4 font-mono text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <aside className="space-y-6">
        <div
          className={cn(
            "rounded-lg border bg-card p-6 shadow-sm",
            validation.status === "valid" && "border-green-500/30",
            validation.status === "invalid" && "border-red-500/30",
            validation.status === "idle" && "border-border",
          )}
        >
          {validation.status === "valid" ? (
            <div>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Valid JSON</h2>
              </div>
              <div className="mt-5 space-y-4">
                <InfoRow label="Total Keys" value={validation.totalKeys.toLocaleString()} />
                <InfoRow label="Total Objects" value={validation.totalObjects.toLocaleString()} />
                <InfoRow label="Total Arrays" value={validation.totalArrays.toLocaleString()} />
                <InfoRow label="Character Count" value={characterCount.toLocaleString()} />
              </div>
            </div>
          ) : null}

          {validation.status === "invalid" ? (
            <div>
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Invalid JSON</h2>
              </div>
              <div className="mt-5 space-y-4">
                <InfoRow label="Error Message" value={validation.message} />
                <InfoRow label="Error Line" value={validation.line?.toString() ?? "Unknown"} />
                <InfoRow label="Error Column" value={validation.column?.toString() ?? "Unknown"} />
              </div>
            </div>
          ) : null}

          {validation.status === "idle" ? (
            <div>
              <h2 className="text-lg font-semibold text-foreground">No JSON yet</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Paste JSON or upload a `.json` file to validate it.
              </p>
            </div>
          ) : null}
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Formatting</h2>
          <div className="mt-5 grid gap-3">
            <Button type="button" variant="outline" onClick={formatJson} disabled={!canFormat}>
              Format JSON
            </Button>
            <Button type="button" variant="outline" onClick={minifyJson} disabled={!canFormat}>
              Minify JSON
            </Button>
            <Button type="button" variant="outline" onClick={copyJson} disabled={!jsonText}>
              {copied ? <CheckCircle2 className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
              {copied ? "Copied" : "Copy JSON"}
            </Button>
            <Button type="button" variant="outline" onClick={clearJson} disabled={!jsonText}>
              <Eraser className="h-4 w-4" />
              Clear
            </Button>
            <Button type="button" onClick={() => downloadJson(jsonText)} disabled={!canFormat}>
              <Download className="h-4 w-4" />
              Download formatted.json
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border pb-3 last:border-b-0 last:pb-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
