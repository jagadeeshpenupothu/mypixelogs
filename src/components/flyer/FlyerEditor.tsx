"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FileDown, ImagePlus, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FLYER_DESIGNS } from "@/lib/flyers/registry";


const inputClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70";

const toDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

function save(blob: Blob, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/** Fill in the flyer, pick colours, add a photo, and download a print-ready PNG or PDF. Everything stays in the browser. */
export function FlyerEditor({ title, design = "grand-opening" }: { title: string; design?: string }) {
  const d = FLYER_DESIGNS[design] ?? FLYER_DESIGNS["grand-opening"];
  const [fields, setFields] = useState<Record<string, string>>({ ...d.defaults });
  const [theme, setTheme] = useState<string>(Object.keys(d.themes)[0]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [fonts, setFonts] = useState<Record<string, string> | null>(null);
  const [busy, setBusy] = useState<"" | "png" | "pdf">("");
  const [bg, setBg] = useState<string | null>(null);
  const [assets, setAssets] = useState<Record<string, string> | null>(null);

  // Fonts are embedded in the drawing so downloads look exactly like the preview.
  useEffect(() => {
    let live = true;
    Promise.all(
      d.fonts.map(async ([key, file]) => [key, await toDataUrl(await (await fetch(`/fonts/flyer/${file}`)).blob())] as const),
    ).then((entries) => live && setFonts(Object.fromEntries(entries)));
    // A background photo is embedded too, so the downloaded PNG/PDF includes it.
    if (d.bg) void fetch(d.bg).then(async (r) => live && setBg(await toDataUrl(await r.blob())));
    if (d.assets)
      void Promise.all(d.assets.map(async (a) => [a, await toDataUrl(await (await fetch(a)).blob())] as const)).then((entries) => live && setAssets(Object.fromEntries(entries)));
    return () => {
      live = false;
    };
  }, [d.bg, d.fonts, d.assets]);

  const svg = useMemo(() => d.svg(fields, d.themes[theme], { fonts: fonts ?? undefined, photo, bg: bg ?? d.bg, assets: assets ?? undefined }), [d, fields, theme, fonts, photo, bg, assets]);
  const ready = Boolean(fonts) && (!d.bg || Boolean(bg)) && (!d.assets || Boolean(assets));

  const render = () =>
    new Promise<HTMLCanvasElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 2480;
        canvas.height = 3508;
        canvas.getContext("2d")!.drawImage(img, 0, 0, 2480, 3508);
        resolve(canvas);
      };
      img.onerror = reject;
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace('width="1240" height="1754"', 'width="2480" height="3508"'))}`;
    });

  const downloadPng = async () => {
    setBusy("png");
    try {
      const canvas = await render();
      canvas.toBlob((blob) => blob && save(blob, "flyer.png"), "image/png");
    } finally {
      setBusy("");
    }
  };

  const downloadPdf = async () => {
    setBusy("pdf");
    try {
      const canvas = await render();
      const { PDFDocument } = await import("pdf-lib");
      const pdf = await PDFDocument.create();
      const jpg = await pdf.embedJpg(await (await fetch(canvas.toDataURL("image/jpeg", 0.92))).arrayBuffer());
      const page = pdf.addPage([595.28, 841.89]); // A4 in points
      page.drawImage(jpg, { x: 0, y: 0, width: 595.28, height: 841.89 });
      save(new Blob([(await pdf.save()).slice()], { type: "application/pdf" }), "flyer.pdf");
    } finally {
      setBusy("");
    }
  };

  const set = (key: string, value: string) => setFields((f) => ({ ...f, [key]: value }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Change the words, colours and photo. Your photo never leaves your device.</p>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[360px_1fr]">
        <form className="grid gap-5 rounded-xl border border-border bg-card p-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <p className="text-sm font-semibold text-foreground">Colours</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.keys(d.themes).map((key) => {
                const t = d.themes[key];
                const [c1, c2] = d.swatch(t);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTheme(key)}
                    aria-pressed={theme === key}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${theme === key ? "border-primary ring-2 ring-primary/30" : "border-border"}`}
                  >
                    <span className="flex">
                      <span className="h-4 w-4 rounded-full" style={{ background: c1 }} />
                      <span className="-ml-1.5 h-4 w-4 rounded-full ring-2 ring-card" style={{ background: c2 }} />
                    </span>
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">{d.photoLabel}</p>
            <div className="mt-2 flex gap-2">
              <label className="flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border text-sm font-medium hover:border-primary">
                <ImagePlus className="h-4 w-4" aria-hidden="true" />
                {photo ? "Change photo" : "Add your photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) setPhoto(await toDataUrl(file));
                    e.target.value = "";
                  }}
                />
              </label>
              {photo ? (
                <Button type="button" variant="outline" size="icon" onClick={() => setPhoto(null)} aria-label="Remove photo">
                  <X className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>

          {d.sections.map((section) => (
            <fieldset key={section.title}>
              <legend className="text-sm font-semibold text-foreground">{section.title}</legend>
              <div className={section.row ? "mt-2 grid grid-cols-3 gap-2" : "mt-2 grid gap-2"}>
                {section.fields.map(([key, label]) => (
                  <label key={key} className="grid gap-1 text-xs font-medium text-muted-foreground">
                    {label}
                    <input className={inputClass} value={fields[key]} onChange={(e) => set(key, e.target.value)} />
                  </label>
                ))}
              </div>
            </fieldset>
          ))}

          <button type="button" onClick={() => setFields({ ...d.defaults })} className="flex items-center gap-1.5 justify-self-start text-sm font-medium text-muted-foreground hover:text-foreground">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset text
          </button>
        </form>

        <div className="order-first lg:order-none lg:sticky lg:top-20">
          <div className="mx-auto max-w-[620px] overflow-hidden rounded-md shadow-lg ring-1 ring-border [&_svg]:block [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
          <div className="mx-auto mt-4 flex max-w-[620px] flex-wrap gap-3">
            <Button size="lg" className="flex-1" onClick={downloadPng} disabled={!ready || busy !== ""}>
              <Download className="h-4 w-4" />
              {busy === "png" ? "Preparing…" : "Download PNG"}
            </Button>
            <Button size="lg" variant="outline" className="flex-1" onClick={downloadPdf} disabled={!ready || busy !== ""}>
              <FileDown className="h-4 w-4" />
              {busy === "pdf" ? "Preparing…" : "Download PDF"}
            </Button>
          </div>
          <p className="mx-auto mt-2 max-w-[620px] text-center text-xs text-muted-foreground">A4, 2480 × 3508 px (300 dpi), ready to print or share on WhatsApp.</p>
        </div>
      </div>
    </div>
  );
}
