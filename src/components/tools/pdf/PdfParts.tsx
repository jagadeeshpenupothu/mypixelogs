"use client";

import { type ChangeEvent, type DragEvent, type ReactNode, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { FileText, Loader2, Upload } from "lucide-react";

import { closePdf, openPdfForDrawing, renderThumbnail } from "@/lib/pdf/render";
import { cn } from "@/lib/utils";

/** A box people can tap to choose files, or drop files onto. */
export function FileDrop({
  accept,
  multiple = false,
  title,
  hint,
  compact = false,
  onFiles,
}: {
  accept: string;
  multiple?: boolean;
  title: string;
  hint: string;
  compact?: boolean;
  onFiles: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function take(list: FileList | null) {
    const files = list ? Array.from(list) : [];
    if (files.length > 0) onFiles(multiple ? files : files.slice(0, 1));
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragging(false);
        take(event.dataTransfer.files);
      }}
      className={cn(
        "cursor-pointer rounded-xl border-2 border-dashed border-border bg-card text-center transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70",
        compact ? "p-4" : "p-8 sm:p-10",
        dragging && "border-primary bg-primary/5",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          take(event.target.files);
          event.target.value = "";
        }}
      />
      {compact ? (
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <Upload className="h-4 w-4" aria-hidden="true" />
          {title}
        </span>
      ) : (
        <>
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-300">
            <FileText className="h-7 w-7" aria-hidden="true" />
          </span>
          <span className="mt-4 block text-lg font-semibold text-foreground">{title}</span>
          <span className="mx-auto mt-1 block max-w-md text-sm leading-6 text-muted-foreground">{hint}</span>
          <span className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground">
            <Upload className="h-4 w-4" aria-hidden="true" />
            Choose {multiple ? "files" : "file"}
          </span>
        </>
      )}
    </div>
  );
}

export function Panel({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5 sm:p-6", className)}>
      {title ? <h2 className="text-lg font-semibold text-foreground">{title}</h2> : null}
      <div className={title ? "mt-4" : undefined}>{children}</div>
    </div>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm leading-6 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
      {children}
    </p>
  );
}

export function Working({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      {children}
    </p>
  );
}

export function Choice({
  active,
  onClick,
  title,
  note,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  note?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border border-border bg-background px-4 py-3 text-left transition-colors hover:border-primary/60",
        active && "border-primary bg-primary/10",
      )}
    >
      <span className={cn("block text-sm font-semibold", active ? "text-primary" : "text-foreground")}>{title}</span>
      {note ? <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{note}</span> : null}
    </button>
  );
}

/** Opens a PDF for drawing page pictures, and closes it when the file changes. */
export function usePdfDrawing(file: File | null) {
  const [state, setState] = useState<{ file: File | null; doc: PDFDocumentProxy | null; error: string | null }>({
    file: null,
    doc: null,
    error: null,
  });

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    let opened: PDFDocumentProxy | null = null;

    file
      .arrayBuffer()
      .then((data) => openPdfForDrawing(data))
      .then((next) => {
        opened = next;
        if (cancelled) closePdf(next);
        else setState({ file, doc: next, error: null });
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setState({ file, doc: null, error: reason instanceof Error ? reason.message : "This PDF could not be opened." });
        }
      });

    return () => {
      cancelled = true;
      if (opened) closePdf(opened);
    };
  }, [file]);

  // Answers that belong to an earlier file are ignored.
  const current = file !== null && state.file === file;
  return { doc: current ? state.doc : null, error: current ? state.error : null };
}

/** A page picture that is drawn only when it scrolls into view. */
export function PageThumb({
  doc,
  pageNumber,
  rotation = 0,
  className,
}: {
  doc: PDFDocumentProxy | null;
  pageNumber: number;
  rotation?: number;
  className?: string;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const element = holder.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!doc || !visible) return;
    let cancelled = false;
    let made: string | null = null;
    renderThumbnail(doc, pageNumber)
      .then((blob) => {
        if (cancelled) return;
        made = URL.createObjectURL(blob);
        setUrl(made);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      if (made) URL.revokeObjectURL(made);
    };
  }, [doc, pageNumber, visible]);

  return (
    <div ref={holder} className={cn("flex aspect-[3/4] items-center justify-center overflow-hidden rounded-md bg-muted p-2", className)}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={`Page ${pageNumber}`}
          className="max-h-full max-w-full bg-white shadow-sm transition-transform duration-200"
          style={rotation ? { transform: `rotate(${rotation}deg)` } : undefined}
        />
      ) : (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-label={`Loading page ${pageNumber}`} />
      )}
    </div>
  );
}

export function PrivacyNote() {
  return (
    <p className="text-xs leading-5 text-muted-foreground">
      Your files stay on your device. Nothing is uploaded.
    </p>
  );
}
