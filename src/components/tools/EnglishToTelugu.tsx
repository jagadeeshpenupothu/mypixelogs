"use client";

import { useEffect, useMemo, useState } from "react";
import Sanscript from "@indic-transliteration/sanscript";
import { Check, Clipboard, Download, Eraser, Languages, Repeat2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const storageKey = "mypixelogs:english-to-telugu";

const commonPhrases = [
  { label: "Namaskaram", value: "namaskaram" },
  { label: "Dhanyavadalu", value: "dhanyavadalu" },
  { label: "Shubhodhayam", value: "shubhodhayam" },
  { label: "Ela Unnaru", value: "ela unnaru" },
  { label: "Andhra Pradesh", value: "andhra pradesh" },
  { label: "Telangana", value: "telangana" },
];

const phraseOverrides = new Map<string, string>([
  ["namaskaram", "నమస్కారం"],
  ["meeru ela unnaru", "మీరు ఎలా ఉన్నారు"],
  ["dhanyavadalu", "ధన్యవాదాలు"],
  ["shubhodhayam", "శుభోదయం"],
  ["ela unnaru", "ఎలా ఉన్నారు"],
  ["andhra pradesh", "ఆంధ్ర ప్రదేశ్"],
  ["telangana", "తెలంగాణ"],
]);

const wordNormalizations = new Map<string, string>([
  ["namaskaram", "namaskaaraM"],
  ["dhanyavadalu", "dhanyavaadaalu"],
  ["shubhodhayam", "shubhodayam"],
  ["meeru", "mIru"],
  ["unnaru", "unnAru"],
]);

function normalizeRomanInput(input: string) {
  return input
    .split(/(\s+)/)
    .map((part) => wordNormalizations.get(part.toLowerCase()) ?? part)
    .join("");
}

function transliterateToTelugu(input: string) {
  const trimmedInput = input.trim().toLowerCase().replace(/\s+/g, " ");

  if (phraseOverrides.has(trimmedInput)) {
    return phraseOverrides.get(trimmedInput) ?? "";
  }

  const normalizedInput = normalizeRomanInput(input);
  return Sanscript.t(normalizedInput, "itrans", "telugu");
}

function romanizeTelugu(input: string) {
  return Sanscript.t(input, "telugu", "itrans");
}

function countWords(input: string) {
  return input.trim().split(/\s+/).filter(Boolean).length;
}

function downloadTxt(text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "telugu-text.txt";
  link.click();
  URL.revokeObjectURL(url);
}

export function EnglishToTelugu() {
  const [englishText, setEnglishText] = useState("");
  const [teluguText, setTeluguText] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const savedText = window.localStorage.getItem(storageKey) ?? "";
      setEnglishText(savedText);
      setTeluguText(transliterateToTelugu(savedText));
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const counts = useMemo(
    () => ({
      englishCharacters: englishText.length,
      englishWords: countWords(englishText),
      teluguCharacters: teluguText.length,
      teluguWords: countWords(teluguText),
    }),
    [englishText, teluguText],
  );

  function updateEnglishText(nextText: string) {
    const nextTeluguText = transliterateToTelugu(nextText);
    setEnglishText(nextText);
    setTeluguText(nextTeluguText);
    setCopied(false);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, nextText);
    }
  }

  function updateTeluguText(nextText: string) {
    setTeluguText(nextText);
    setCopied(false);
  }

  async function copyTeluguText() {
    await navigator.clipboard.writeText(teluguText);
    setCopied(true);
  }

  function clearText() {
    setEnglishText("");
    setTeluguText("");
    setCopied(false);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey);
    }
  }

  function swapText() {
    const nextEnglishText = romanizeTelugu(teluguText);
    const nextTeluguText = transliterateToTelugu(englishText);
    setEnglishText(nextEnglishText);
    setTeluguText(nextTeluguText);
    setCopied(false);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, nextEnglishText);
    }
  }

  function insertPhrase(phrase: string) {
    const nextText = englishText ? `${englishText.trimEnd()} ${phrase}` : phrase;
    updateEnglishText(nextText);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <Badge variant="secondary" className="bg-blue-50 text-primary">
              Browser-only
            </Badge>
            <h2 className="mt-4 text-2xl font-bold tracking-normal text-foreground">
              Live English to Telugu transliteration
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Type naturally with English letters. Telugu output updates instantly
              and stays editable for final corrections.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={copyTeluguText} disabled={!teluguText}>
              {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
              {copied ? "Copied" : "Copy Telugu"}
            </Button>
            <Button type="button" variant="outline" onClick={swapText} disabled={!englishText && !teluguText}>
              <Repeat2 className="h-4 w-4" />
              Swap
            </Button>
            <Button type="button" variant="outline" onClick={clearText} disabled={!englishText && !teluguText}>
              <Eraser className="h-4 w-4" />
              Clear
            </Button>
            <Button type="button" onClick={() => downloadTxt(teluguText)} disabled={!teluguText}>
              <Download className="h-4 w-4" />
              TXT
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <EditorPanel
          title="English Input"
          description="Type Telugu words using English letters."
          value={englishText}
          onChange={updateEnglishText}
          placeholder="namaskaram&#10;meeru ela unnaru"
          characters={counts.englishCharacters}
          words={counts.englishWords}
        />
        <EditorPanel
          title="Telugu Output"
          description="Copy, edit, or download the Telugu text."
          value={teluguText}
          onChange={updateTeluguText}
          placeholder="నమస్కారం&#10;మీరు ఎలా ఉన్నారు"
          characters={counts.teluguCharacters}
          words={counts.teluguWords}
          telugu
        />
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Languages className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-foreground">Common phrases</h2>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {commonPhrases.map((phrase) => (
            <button
              key={phrase.value}
              type="button"
              onClick={() => insertPhrase(phrase.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary"
            >
              {phrase.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 text-sm leading-6 text-muted-foreground shadow-sm">
        Examples: <span className="font-semibold text-foreground">namaskaram</span> becomes{" "}
        <span className="font-semibold text-foreground">నమస్కారం</span>, and{" "}
        <span className="font-semibold text-foreground">meeru ela unnaru</span> becomes{" "}
        <span className="font-semibold text-foreground">మీరు ఎలా ఉన్నారు</span>.
      </div>
    </div>
  );
}

function EditorPanel({
  title,
  description,
  value,
  onChange,
  placeholder,
  characters,
  words,
  telugu,
}: {
  title: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  characters: number;
  words: number;
  telugu?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex gap-2 text-xs font-semibold text-muted-foreground">
          <span className="rounded-md bg-muted px-2.5 py-1">{characters} chars</span>
          <span className="rounded-md bg-muted px-2.5 py-1">{words} words</span>
        </div>
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        className="mt-5 min-h-[320px] w-full resize-y rounded-lg border border-input bg-background p-4 text-base leading-8 text-foreground shadow-sm outline-none transition-[color,background-color,border-color,box-shadow] duration-200 placeholder:text-muted-foreground/80 hover:border-foreground/20 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/25 dark:bg-[#0A0A0A] dark:hover:border-white/20"
        lang={telugu ? "te" : "en"}
      />
    </div>
  );
}
