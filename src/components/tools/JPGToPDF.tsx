"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Download, FileText, X } from "lucide-react";

import { Choice, ErrorNote, FileDrop, Panel, PrivacyNote, Working } from "@/components/tools/pdf/PdfParts";
import { Button } from "@/components/ui/button";
import { bytesToBlob, formatBytes, triggerDownload } from "@/lib/pdf/common";
import { imagesToPdf, type Margin, type Orientation, type PageSize, prepareImage } from "@/lib/pdf/images";

type Item = { id: string; file: File; url: string };

const accepted = "image/jpeg,image/png,image/webp,image/gif,image/bmp,.jpg,.jpeg,.png,.webp,.gif,.bmp";
let nextId = 0;

export function JPGToPDF() {
  const [items, setItems] = useState<Item[]>([]);
  const [size, setSize] = useState<PageSize>("a4");
  const [orientation, setOrientation] = useState<Orientation>("auto");
  const [margin, setMargin] = useState<Margin>(18);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Blob | null>(null);

  useEffect(() => () => items.forEach((item) => URL.revokeObjectURL(item.url)), []); // eslint-disable-line react-hooks/exhaustive-deps

  function add(files: File[]) {
    setResult(null);
    const pictures = files.filter((file) => file.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|bmp)$/i.test(file.name));
    const skipped = files.length - pictures.length;
    setError(skipped > 0 ? `${skipped} file${skipped === 1 ? " was" : "s were"} skipped because ${skipped === 1 ? "it is" : "they are"} not a picture.` : null);
    setItems((current) => [
      ...current,
      ...pictures.map((file) => ({ id: `img-${(nextId += 1)}`, file, url: URL.createObjectURL(file) })),
    ]);
  }

  function move(index: number, step: -1 | 1) {
    setResult(null);
    setItems((current) => {
      const target = index + step;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function remove(id: string) {
    setResult(null);
    setItems((current) => {
      const gone = current.find((item) => item.id === id);
      if (gone) URL.revokeObjectURL(gone.url);
      return current.filter((item) => item.id !== id);
    });
  }

  async function convert() {
    setBusy(true);
    setError(null);
    try {
      const prepared = [];
      for (const item of items) prepared.push(await prepareImage(item.file));
      const bytes = await imagesToPdf(prepared, { size, orientation, margin });
      const blob = bytesToBlob(bytes, "application/pdf");
      setResult(blob);
      triggerDownload(blob, items.length === 1 ? `${item0Name(items)}.pdf` : "images.pdf");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The PDF could not be made.");
    } finally {
      setBusy(false);
    }
  }

  function changed<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setResult(null);
    };
  }

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <FileDrop
          accept={accepted}
          multiple
          title="Choose your photos"
          hint="JPG, PNG or WebP. Pick one or many; each picture becomes one page."
          onFiles={add}
        />
        {error ? <ErrorNote>{error}</ErrorNote> : null}
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-4">
        <Panel title={`Pages (${items.length})`}>
          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {items.map((item, index) => (
              <li key={item.id} className="rounded-lg border border-border bg-background p-2">
                <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-md bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt={`Page ${index + 1}: ${item.file.name}`} className="max-h-full max-w-full object-contain" />
                </div>
                <p className="mt-2 truncate text-xs font-medium text-foreground" title={item.file.name}>
                  {index + 1}. {item.file.name}
                </p>
                <div className="mt-2 flex justify-between gap-1">
                  <SmallButton label="Move earlier" disabled={index === 0} onClick={() => move(index, -1)}>
                    <ArrowLeft className="h-4 w-4" />
                  </SmallButton>
                  <SmallButton label="Remove" onClick={() => remove(item.id)}>
                    <X className="h-4 w-4" />
                  </SmallButton>
                  <SmallButton label="Move later" disabled={index === items.length - 1} onClick={() => move(index, 1)}>
                    <ArrowRight className="h-4 w-4" />
                  </SmallButton>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-4">
            <FileDrop accept={accepted} multiple compact title="Add more photos" hint="" onFiles={add} />
          </div>
        </Panel>
        {error ? <ErrorNote>{error}</ErrorNote> : null}
      </div>

      <aside className="space-y-5">
        <Panel title="Page size">
          <div className="grid gap-2">
            <Choice active={size === "a4"} onClick={() => changed(setSize)("a4")} title="A4" note="Best for printing in India, UK, Europe" />
            <Choice active={size === "letter"} onClick={() => changed(setSize)("letter")} title="US Letter" note="Best for printing in the US" />
            <Choice active={size === "fit"} onClick={() => changed(setSize)("fit")} title="Same as photo" note="Each page matches its picture" />
          </div>
          {size !== "fit" ? (
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Choice active={orientation === "auto"} onClick={() => changed(setOrientation)("auto")} title="Auto" />
              <Choice active={orientation === "portrait"} onClick={() => changed(setOrientation)("portrait")} title="Tall" />
              <Choice active={orientation === "landscape"} onClick={() => changed(setOrientation)("landscape")} title="Wide" />
            </div>
          ) : null}
        </Panel>
        <Panel title="White border">
          <div className="grid grid-cols-3 gap-2">
            <Choice active={margin === 0} onClick={() => changed(setMargin)(0)} title="None" />
            <Choice active={margin === 18} onClick={() => changed(setMargin)(18)} title="Small" />
            <Choice active={margin === 36} onClick={() => changed(setMargin)(36)} title="Large" />
          </div>
        </Panel>
        <Panel>
          {result ? (
            <Button size="lg" className="w-full" onClick={() => triggerDownload(result, items.length === 1 ? `${item0Name(items)}.pdf` : "images.pdf")}>
              <Download className="h-4 w-4" />
              Download again ({formatBytes(result.size)})
            </Button>
          ) : (
            <Button size="lg" className="w-full" onClick={convert} disabled={busy}>
              <FileText className="h-4 w-4" />
              {busy ? "Making PDF…" : "Make PDF"}
            </Button>
          )}
          <div className="mt-3 space-y-2">
            {busy ? <Working>Placing {items.length} picture{items.length === 1 ? "" : "s"}…</Working> : null}
            <PrivacyNote />
          </div>
        </Panel>
      </aside>
    </div>
  );
}

function item0Name(items: Item[]) {
  return items[0].file.name.replace(/\.[^/.]+$/, "") || "image";
}

function SmallButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 flex-1 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}
