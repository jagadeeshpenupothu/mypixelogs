"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { ChevronDown, Download, FlipHorizontal2, ImagePlus, Music2, Pause, Play, RotateCcw, RotateCw, Trash2, X } from "lucide-react";

import "@fontsource/noto-serif-telugu/500.css";
import "@fontsource/noto-serif-telugu/700.css";
import "@fontsource/noto-sans-telugu/500.css";
import "@fontsource/noto-sans-telugu/600.css";
import "@fontsource/tiro-telugu/400.css";
import "@fontsource/ramaraja/400.css";
import "@fontsource/mallanna/400.css";
import "@fontsource/playfair-display/500.css";
import "@fontsource/playfair-display/700.css";

import { Choices } from "@/components/tools/video/video-kit";
import { formatSize } from "@/components/tools/video/use-video-tool";
import { Button } from "@/components/ui/button";
import { weddingVideo as template } from "@/data/video-templates/wedding";
import type { Artwork, ExportSize, Music, TextCache } from "@/lib/video-template";
import type { FontId, PhotoEdit, PhotoId, SampleId, ThemeId, VideoContent } from "@/types/video-template";

const loadEngine = () => import("@/lib/video-template");
const STORAGE_KEY = `mypixelogs-${template.slug}`;
const LENGTH = 50.53;
const emptyPhoto: PhotoEdit = { image: null, name: "", zoom: 1, x: 0, y: 0, turns: 0, flip: false, brightness: 1 };
const photoNames: Record<PhotoId, string> = { groom: "Groom's photo", bride: "Bride's photo", couple: "Couple's photo" };
const PREVIEW = { width: 1280, height: 540 };
const MAX_PHOTO = 3000;

const firstContent: VideoContent = {
  theme: "gold",
  font: "classic",
  textSize: 1,
  texts: template.samples.te,
  photos: { groom: emptyPhoto, bride: emptyPhoto, couple: emptyPhoto },
  emblem: "cross",
  emblemImage: null,
};

const clock = (time: number) => `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, "0")}`;

/** Opens a picture the right way up, small enough to draw smoothly. */
async function readPicture(file: File) {
  const image = await createImageBitmap(file, { imageOrientation: "from-image" });
  const longest = Math.max(image.width, image.height);
  if (longest <= MAX_PHOTO) return image;
  const scale = MAX_PHOTO / longest;
  const smaller = await createImageBitmap(image, {
    resizeWidth: Math.round(image.width * scale),
    resizeHeight: Math.round(image.height * scale),
    resizeQuality: "high",
  });
  image.close();
  return smaller;
}

function Slider({ label, value, min, max, step, text, disabled, onChange }: {
  label: string; value: number; min: number; max: number; step: number; text: string; disabled?: boolean; onChange: (value: number) => void;
}) {
  return (
    <label className="block text-sm font-medium text-foreground">
      <span className="flex justify-between gap-2">
        {label}
        <span className="font-normal text-muted-foreground">{text}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} disabled={disabled} onChange={(event) => onChange(Number(event.target.value))} className="mt-1 h-8 w-full accent-primary" />
    </label>
  );
}

export function VideoTemplateEditor({ title }: { title: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef(firstContent);
  const artworkRef = useRef<Artwork | null>(null);
  const cacheRef = useRef<TextCache | null>(null);
  const timeRef = useRef(template.scenes[0].time);
  const drawingRef = useRef(false);
  const againRef = useRef(false);
  const musicRef = useRef<Music | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [content, setContent] = useState(firstContent);
  const [scene, setScene] = useState(template.scenes[0].id);
  const [time, setTime] = useState(template.scenes[0].time);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState<number | null>(0);
  const [problem, setProblem] = useState("");
  const [note, setNote] = useState("");
  const [music, setMusicState] = useState<Music | null>(null);
  const [size, setSize] = useState<ExportSize>("full");
  const [progress, setProgress] = useState<{ value: number; remaining: number | null } | null>(null);
  const [result, setResult] = useState<{ url: string; size: number; name: string } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const busy = progress !== null;
  const ready = loading === null && !problem;
  const currentScene = template.scenes.find((item) => item.id === scene) ?? template.scenes[0];

  // ---------------------------------------------------------- drawing
  const draw = useCallback(async () => {
    if (drawingRef.current) {
      againRef.current = true;
      return;
    }
    drawingRef.current = true;
    try {
      const engine = await loadEngine();
      do {
        againRef.current = false;
        const artwork = artworkRef.current;
        const canvas = canvasRef.current;
        if (!artwork || !canvas) break;
        cacheRef.current ??= new engine.TextCache();
        await engine.drawFrame(canvas, timeRef.current, contentRef.current, artwork, cacheRef.current);
      } while (againRef.current);
    } catch {
      // The artwork was replaced while drawing. The next draw uses the new one.
    } finally {
      drawingRef.current = false;
    }
  }, []);

  const update = useCallback(
    (change: (content: VideoContent) => VideoContent) => {
      contentRef.current = change(contentRef.current);
      setContent(contentRef.current);
      setResult(null);
      void draw();
    },
    [draw],
  );

  const goTo = useCallback(
    (next: number) => {
      timeRef.current = Math.min(LENGTH - 0.04, Math.max(0, next));
      setTime(timeRef.current);
      void draw();
    },
    [draw],
  );

  // ---------------------------------------------------------- saved words
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<VideoContent> | null;
      if (!saved?.texts) return;
      const texts = { ...template.samples.te };
      for (const id of Object.keys(texts) as (keyof typeof texts)[]) if (typeof saved.texts[id] === "string") texts[id] = saved.texts[id];
      contentRef.current = {
        ...contentRef.current,
        texts,
        theme: saved.theme === "pink" ? "pink" : "gold",
        font: (["classic", "elegant", "bold", "simple"] as const).find((id) => id === saved.font) ?? "classic",
        textSize: typeof saved.textSize === "number" ? Math.min(1.3, Math.max(0.7, saved.textSize)) : 1,
        emblem: saved.emblem === "none" ? "none" : "cross",
      };
      setContent(contentRef.current);
    } catch {
      // Nothing saved, or storage is off.
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const { theme, font, textSize, texts, emblem } = content;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme, font, textSize, texts, emblem }));
      } catch {
        // Storage is off or full.
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [content]);

  // ---------------------------------------------------------- artwork
  useEffect(() => {
    const controller = new AbortController();
    let mine: Artwork | null = null;
    void (async () => {
      const engine = await loadEngine();
      try {
        const [artwork] = await Promise.all([
          engine.loadArtwork(content.theme, (value) => setLoading(value), controller.signal),
          engine.loadFonts(contentRef.current.font, contentRef.current.texts),
        ]);
        if (controller.signal.aborted) {
          await engine.disposeArtwork(artwork);
          return;
        }
        mine = artwork;
        artworkRef.current = artwork;
        setLoading(null);
        void draw();
      } catch (error) {
        if (controller.signal.aborted) return;
        setLoading(null);
        setProblem(error instanceof engine.VideoTemplateError ? error.message : "The template could not be opened.");
      }
    })();
    return () => {
      controller.abort();
      setLoading(0);
      setProblem("");
      if (mine) {
        const old = mine;
        artworkRef.current = null;
        // Waits for a frame that is being drawn.
        const release = () => (drawingRef.current ? setTimeout(release, 50) : void loadEngine().then((engine) => engine.disposeArtwork(old)));
        release();
      }
    };
  }, [content.theme, attempt, draw]);

  useEffect(() => {
    void loadEngine()
      .then((engine) => engine.loadFonts(content.font, content.texts))
      .then(() => {
        cacheRef.current = null;
        void draw();
      });
  }, [content.font, content.texts, draw]);

  useEffect(() => () => abortRef.current?.abort(), []);
  useEffect(() => {
    const url = result?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [result]);
  useEffect(() => {
    if (!busy) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [busy]);

  // ---------------------------------------------------------- playing
  useEffect(() => {
    if (!playing) return;
    let active = true;
    let audio: AudioContext | null = null;
    const from = timeRef.current;
    let begin = performance.now();
    void (async () => {
      const engine = await loadEngine();
      if (musicRef.current && active) {
        audio = new AudioContext();
        await audio.resume();
        engine.connectMusic(audio, musicRef.current, from);
      }
      begin = performance.now();
      let shown = 0;
      while (active) {
        const now = from + (performance.now() - begin) / 1000;
        if (now >= LENGTH - 0.04) {
          timeRef.current = 0;
          setTime(0);
          setPlaying(false);
          void draw();
          break;
        }
        timeRef.current = now;
        await draw();
        if (performance.now() - shown > 120) {
          shown = performance.now();
          setTime(now);
          const current = template.scenes.findLast((item, place) => place === 0 || now >= sceneStart(place));
          if (current) setScene(current.id);
        }
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
    })();
    return () => {
      active = false;
      void audio?.close();
    };
  }, [playing, draw]);

  function openScene(id: string) {
    const next = template.scenes.find((item) => item.id === id);
    if (!next) return;
    setPlaying(false);
    setScene(id);
    goTo(next.time);
  }

  // ---------------------------------------------------------- photos
  const setPhoto = useCallback(
    (id: PhotoId, part: Partial<PhotoEdit>) => update((now) => ({ ...now, photos: { ...now.photos, [id]: { ...now.photos[id], ...part } } })),
    [update],
  );

  async function choosePhoto(id: PhotoId, file: File | undefined) {
    if (!file) return;
    try {
      const image = await readPicture(file);
      contentRef.current.photos[id].image?.close();
      const { photoLayout } = await loadEngine();
      const fresh = { ...emptyPhoto, image, name: file.name };
      // Faces are usually near the top of an upright photo.
      setPhoto(id, { ...fresh, y: photoLayout(fresh, id).limitY * (image.height > image.width ? 0.65 : 0) });
      setNote("");
      const place = template.scenes.find((item) => item.photo === id);
      if (place) openScene(place.id);
    } catch {
      setNote("This picture could not be opened. Try a JPG, PNG or WebP file.");
    }
  }

  async function chooseEmblem(file: File | undefined) {
    if (!file) return;
    try {
      const emblemImage = await readPicture(file);
      contentRef.current.emblemImage?.close();
      update((now) => ({ ...now, emblem: "custom", emblemImage }));
      setNote("");
      openScene("verse");
    } catch {
      setNote("This picture could not be opened. Try a PNG with a clear background.");
    }
  }

  const dragRef = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);
  const photoHere = currentScene.photo && content.photos[currentScene.photo].image ? currentScene.photo : null;

  function dragPhoto(event: PointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    if (!drag || !photoHere) return;
    const box = event.currentTarget.getBoundingClientRect();
    const area = template.photoAreas[photoHere];
    const toTemplate = template.size.width / box.width;
    void loadEngine().then(({ photoLayout }) => {
      const photo = contentRef.current.photos[photoHere];
      const x = drag.startX + ((event.clientX - drag.x) * toTemplate) / area.width;
      const y = drag.startY + ((event.clientY - drag.y) * toTemplate) / area.height;
      const inside = photoLayout({ ...photo, x, y }, photoHere);
      setPhoto(photoHere, { x: inside.x, y: inside.y });
    });
  }

  // ---------------------------------------------------------- music and export
  function setMusic(next: Music | null) {
    musicRef.current = next;
    setMusicState(next);
    setResult(null);
    setPlaying(false);
  }

  async function chooseMusic(file: File | undefined) {
    if (!file) return;
    const engine = await loadEngine();
    try {
      const buffer = await engine.readMusic(file);
      setMusic({ buffer, name: file.name, start: 0, volume: 0.9 });
      setNote("");
    } catch (error) {
      setNote(error instanceof engine.VideoTemplateError ? error.message : "This music file could not be opened.");
    }
  }

  async function exportNow() {
    const artwork = artworkRef.current;
    if (!artwork || busy) return;
    setPlaying(false);
    setResult(null);
    setNote("");
    const controller = new AbortController();
    abortRef.current = controller;
    setProgress({ value: 0, remaining: null });
    while (drawingRef.current) await new Promise((resolve) => setTimeout(resolve, 30));
    drawingRef.current = true;
    const started = performance.now();
    const engine = await loadEngine();
    try {
      const blob = await engine.exportVideo(
        contentRef.current,
        artwork,
        musicRef.current,
        size,
        (value) => {
          const seconds = (performance.now() - started) / 1000;
          setProgress({ value, remaining: value > 0.04 ? (seconds / value) * (1 - value) : null });
        },
        controller.signal,
      );
      const names = [content.texts.groom, content.texts.bride].map((name) => name.trim()).filter(Boolean).join("-");
      setResult({ url: URL.createObjectURL(blob), size: blob.size, name: `${names || "wedding"}-invitation.mp4`.replace(/[\\/:*?"<>|\s]+/g, "-") });
    } catch (error) {
      if (error instanceof engine.VideoTemplateCanceled) setNote("Cancelled. No video was made.");
      else setNote(error instanceof engine.VideoTemplateError ? error.message : "The video could not be made. Please try again.");
    } finally {
      drawingRef.current = false;
      abortRef.current = null;
      setProgress(null);
      void draw();
    }
  }

  function startAgain() {
    if (!window.confirm("Clear your words, photos and music, and start again?")) return;
    setPlaying(false);
    for (const photo of Object.values(contentRef.current.photos)) photo.image?.close();
    contentRef.current.emblemImage?.close();
    setMusic(null);
    update(() => firstContent);
    openScene("verse");
  }

  function fillSample(id: SampleId) {
    const changed = Object.values(template.samples).every((sample) => JSON.stringify(sample) !== JSON.stringify(contentRef.current.texts));
    if (changed && !window.confirm("Replace the words you typed with the sample words?")) return;
    update((now) => ({ ...now, texts: template.samples[id] }));
  }

  const missing = (Object.keys(photoNames) as PhotoId[]).filter((id) => !content.photos[id].image);
  const percent = progress ? Math.round(progress.value * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
      {/* On small screens the preview stays in view above the fields. */}
      <div className="contents min-w-0 xl:block">
        <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
        <p className="mt-2 text-base leading-7 text-muted-foreground">
          Type your words, add your photos and download the video. Your photos never leave your device.
        </p>
        </div>
        <div className="sticky top-16 z-20 -mx-1 min-w-0 bg-background px-1 pb-1 pt-2 xl:top-20 xl:mx-0 xl:mt-4 xl:px-0">
          <div className="relative overflow-hidden rounded-lg border border-border bg-white">
            <canvas
              ref={canvasRef}
              width={PREVIEW.width}
              height={PREVIEW.height}
              role="img"
              aria-label={`Preview, ${currentScene.name} scene`}
              className={`block aspect-[64/27] w-full ${photoHere && !busy ? "cursor-grab touch-none active:cursor-grabbing" : ""}`}
              onPointerDown={(event) => {
                if (!photoHere || busy) return;
                setPlaying(false);
                event.currentTarget.setPointerCapture(event.pointerId);
                dragRef.current = { x: event.clientX, y: event.clientY, startX: content.photos[photoHere].x, startY: content.photos[photoHere].y };
              }}
              onPointerMove={dragPhoto}
              onPointerUp={() => {
                dragRef.current = null;
              }}
              onPointerCancel={() => {
                dragRef.current = null;
              }}
            />
            {loading !== null ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#fbfaf8] text-[#333]" role="status">
                <p className="text-sm font-semibold">Loading template ({Math.round(loading * 100)}%)</p>
                <div className="mt-3 h-1.5 w-48 overflow-hidden rounded-full bg-black/10">
                  <div className="h-full bg-primary" style={{ width: `${loading * 100}%` }} />
                </div>
              </div>
            ) : null}
            {problem ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#fbfaf8] p-6 text-center text-sm text-[#333]" role="alert">
                {problem}
                <Button type="button" size="sm" onClick={() => setAttempt((value) => value + 1)}>Try again</Button>
              </div>
            ) : null}
          </div>
          <div className="mt-2 flex items-center gap-3">
            <Button type="button" size="icon" className="h-10 w-10 shrink-0" aria-label={playing ? "Pause" : "Play"} disabled={!ready || busy} onClick={() => setPlaying((value) => !value)}>
              {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
            </Button>
            <input
              type="range"
              min={0}
              max={LENGTH}
              step={0.03}
              value={time}
              disabled={!ready || busy}
              aria-label="Position in the video"
              className="h-10 min-w-0 flex-1 accent-primary"
              onChange={(event) => {
                setPlaying(false);
                goTo(Number(event.target.value));
                const now = Number(event.target.value);
                const current = template.scenes.findLast((item, place) => place === 0 || now >= sceneStart(place));
                if (current) setScene(current.id);
              }}
            />
            <span className="shrink-0 font-mono text-xs text-muted-foreground">
              {clock(time)} / {clock(LENGTH)}
            </span>
          </div>
          <div role="group" aria-label="Scenes" className="mt-2 flex gap-1.5 overflow-x-auto pb-2">
            {template.scenes.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={scene === item.id}
                disabled={busy}
                onClick={() => openScene(item.id)}
                className={`min-h-10 shrink-0 rounded-md border px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 disabled:opacity-50 ${
                  scene === item.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
          {photoHere ? <p className="text-sm text-muted-foreground">Drag the photo in the preview to move it.</p> : null}
        </div>
      </div>

      <div className="grid h-fit min-w-0 gap-4">
        <section aria-label="Style" className="grid gap-4 rounded-lg border border-border bg-card p-4">
          <div>
            <div className="mb-2 flex min-h-9 items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Style</h2>
              <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={startAgain}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Start again
              </Button>
            </div>
            <div role="group" aria-label="Colours" className="grid grid-cols-2 gap-1.5">
              {template.themes.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  aria-pressed={content.theme === theme.id}
                  disabled={busy || loading !== null}
                  onClick={() => {
                    setPlaying(false);
                    update((now) => ({ ...now, theme: theme.id as ThemeId }));
                  }}
                  className={`flex min-h-11 items-center gap-2 rounded-md border px-3 text-sm font-semibold text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 disabled:opacity-60 ${
                    content.theme === theme.id ? "border-primary bg-primary/10" : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  <span aria-hidden="true" className="h-5 w-5 shrink-0 rounded-full" style={{ background: `linear-gradient(135deg, ${theme.swatch[0]} 50%, ${theme.swatch[1]} 50%)` }} />
                  {theme.name}
                </button>
              ))}
            </div>
          </div>
          <Choices
            label="Letters"
            columns={4}
            value={content.font}
            disabled={busy}
            options={[
              { value: "classic", label: "Classic" },
              { value: "elegant", label: "Elegant" },
              { value: "bold", label: "Bold" },
              { value: "simple", label: "Simple" },
            ]}
            onChange={(font: FontId) => update((now) => ({ ...now, font }))}
          />
          <Slider label="Text size" value={content.textSize} min={0.7} max={1.3} step={0.05} text={`${Math.round(content.textSize * 100)}%`} disabled={busy} onChange={(textSize) => update((now) => ({ ...now, textSize }))} />
          <div className="flex flex-wrap gap-1.5">
            <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => fillSample("te")}>Telugu sample</Button>
            <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => fillSample("en")}>English sample</Button>
          </div>
        </section>

        {template.scenes.map((item) => {
          const open = item.id === scene;
          const photo = item.photo ? content.photos[item.photo] : null;
          return (
            <section key={item.id} aria-label={item.name} className="rounded-lg border border-border bg-card">
              <h2>
                <button
                  type="button"
                  aria-expanded={open}
                  disabled={busy}
                  onClick={() => openScene(item.id)}
                  className="flex min-h-12 w-full items-center justify-between gap-3 px-4 text-left text-base font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
                >
                  {item.name}
                  <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
                </button>
              </h2>
              {open ? (
                <div className="grid gap-3 px-4 pb-4">
                  {item.photo && photo ? (
                    <PhotoControls
                      id={item.photo}
                      photo={photo}
                      disabled={busy}
                      onFile={(file) => void choosePhoto(item.photo!, file)}
                      onChange={(part) => setPhoto(item.photo!, part)}
                      onRemove={() => {
                        photo.image?.close();
                        setPhoto(item.photo!, emptyPhoto);
                      }}
                    />
                  ) : null}
                  {item.emblem ? (
                    <div>
                      <Choices
                        label="Symbol at the top"
                        value={content.emblem}
                        disabled={busy}
                        options={[
                          { value: "cross", label: "Cross" },
                          { value: "custom", label: "Your own", disabled: !content.emblemImage },
                          { value: "none", label: "None" },
                        ]}
                        onChange={(emblem) => update((now) => ({ ...now, emblem }))}
                      />
                      <FileButton label="Upload your own symbol" accept="image/png,image/webp,image/jpeg" disabled={busy} onFile={(file) => void chooseEmblem(file)} />
                    </div>
                  ) : null}
                  {item.fields.map((field) => {
                    const props = {
                      value: content.texts[field.id] ?? "",
                      disabled: busy,
                      maxLength: 160,
                      onFocus: () => {
                        if (playing) openScene(item.id);
                      },
                      className:
                        "mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70",
                    };
                    const set = (value: string) =>
                      update((now) => ({
                        ...now,
                        texts: {
                          ...now.texts,
                          [field.id]: value,
                          // The names are shown twice, so the second place follows the first.
                          ...(field.id === "groom" ? { groom2: value } : field.id === "bride" ? { bride2: value } : {}),
                        },
                      }));
                    return (
                      <label key={field.id} className="block text-sm font-medium text-foreground">
                        {field.label}
                        {field.lines ? (
                          <textarea rows={field.lines} {...props} onChange={(event) => set(event.target.value)} />
                        ) : (
                          <input {...props} onChange={(event) => set(event.target.value)} />
                        )}
                      </label>
                    );
                  })}
                </div>
              ) : null}
            </section>
          );
        })}

        <section aria-label="Music" className="rounded-lg border border-border bg-card p-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Music2 className="h-4 w-4" aria-hidden="true" />
            Music
          </h2>
          {music ? (
            <div className="mt-3 grid gap-3">
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 truncate text-sm font-medium text-foreground">{music.name}</p>
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" aria-label="Remove music" disabled={busy} onClick={() => setMusic(null)}>
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
              <Slider label="Start the song at" value={music.start} min={0} max={Math.max(0, Math.floor(music.buffer.duration - 5))} step={1} text={clock(music.start)} disabled={busy} onChange={(start) => setMusic({ ...music, start })} />
              <Slider label="Volume" value={music.volume} min={0} max={1} step={0.05} text={`${Math.round(music.volume * 100)}%`} disabled={busy} onChange={(volume) => setMusic({ ...music, volume })} />
            </div>
          ) : (
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Add a song you have permission to use. Without one, the video is silent.</p>
          )}
          <FileButton label={music ? "Change song" : "Add a song"} accept="audio/*,.mp3,.m4a,.wav" disabled={busy} onFile={(file) => void chooseMusic(file)} />
        </section>

        <section aria-label="Download" className="rounded-lg border border-border bg-card p-4">
          <Choices
            label="Video size"
            columns={2}
            value={size}
            disabled={busy}
            options={[
              { value: "full", label: "Best quality", note: "1920×810" },
              { value: "small", label: "For WhatsApp", note: "1280×540" },
            ]}
            onChange={(value) => {
              setSize(value);
              setResult(null);
            }}
          />
          <div className="mt-4">
            {progress ? (
              <>
                <div role="progressbar" aria-label="Making your video" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary transition-[width] duration-200" style={{ width: `${percent}%` }} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Making your video ({percent}%{progress.remaining ? `, about ${Math.max(1, Math.round(progress.remaining))} s left` : ""}). Keep this tab open.
                </p>
                <Button type="button" variant="outline" className="mt-3 w-full" onClick={() => abortRef.current?.abort()}>Cancel</Button>
              </>
            ) : (
              <Button type="button" size="lg" className="w-full" disabled={!ready} onClick={() => void exportNow()}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Make my video
              </Button>
            )}
          </div>
          {missing.length && !busy ? (
            <p className="mt-2 text-sm leading-6 text-amber-700 dark:text-amber-400">Not added yet: {missing.map((id) => photoNames[id].toLowerCase()).join(", ")}.</p>
          ) : null}
          <div role="status">{note ? <p className="mt-2 text-sm leading-6 text-red-600 dark:text-red-400">{note}</p> : null}</div>
          {result ? (
            <div className="mt-4 rounded-md border border-border bg-background p-3" data-testid="result">
              <video src={result.url} controls playsInline aria-label="Your finished video" className="w-full rounded bg-black" />
              <p className="mt-2 text-sm text-muted-foreground">{formatSize(result.size)}</p>
              <Button asChild className="mt-2 w-full">
                <a href={result.url} download={result.name}>
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download MP4
                </a>
              </Button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

const sceneStarts = [0, 8.03, 16, 23.67, 27.83, 31.47, 39.03, 44.7, 47.2];
const sceneStart = (place: number) => sceneStarts[place] ?? 0;

function FileButton({ label, accept, disabled, onFile }: { label: string; accept: string; disabled: boolean; onFile: (file: File | undefined) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        aria-label={label}
        onChange={(event) => {
          onFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <Button type="button" variant="outline" size="sm" className="mt-2 w-full" disabled={disabled} onClick={() => ref.current?.click()}>
        {label}
      </Button>
    </>
  );
}

function PhotoControls({ id, photo, disabled, onFile, onChange, onRemove }: {
  id: PhotoId;
  photo: PhotoEdit;
  disabled: boolean;
  onFile: (file: File | undefined) => void;
  onChange: (part: Partial<PhotoEdit>) => void;
  onRemove: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const area = template.photoAreas[id];
  const sideways = photo.turns % 2 === 1;
  const width = photo.image ? (sideways ? photo.image.height : photo.image.width) : 1;
  const height = photo.image ? (sideways ? photo.image.width : photo.image.height) : 1;
  const scale = Math.max(area.width / width, area.height / height) * photo.zoom;
  const limitX = Math.max(0, (width * scale - area.width) / 2 / area.width);
  const limitY = Math.max(0, (height * scale - area.height) / 2 / area.height);

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        if (!disabled) onFile(event.dataTransfer.files[0]);
      }}
      className={`rounded-md border p-3 ${over ? "border-primary bg-primary/5" : photo.image ? "border-border" : "border-dashed border-border"}`}
    >
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-label={photoNames[id]}
        onChange={(event) => {
          onFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-sm font-medium text-foreground">{photo.image ? photo.name : photoNames[id]}</p>
        <div className="flex shrink-0 gap-1.5">
          <Button type="button" size="sm" variant={photo.image ? "outline" : "default"} disabled={disabled} onClick={() => ref.current?.click()}>
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
            {photo.image ? "Change" : "Add photo"}
          </Button>
          {photo.image ? (
            <Button type="button" size="icon" variant="ghost" className="h-9 w-9" aria-label="Remove photo" disabled={disabled} onClick={onRemove}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      </div>
      {photo.image ? (
        <div className="mt-3 grid gap-2">
          <Slider label="Zoom" value={photo.zoom} min={1} max={4} step={0.02} text={`${Math.round(photo.zoom * 100)}%`} disabled={disabled} onChange={(zoom) => onChange({ zoom })} />
          <Slider label="Left and right" value={Math.max(-limitX, Math.min(limitX, photo.x))} min={-limitX} max={limitX} step={0.002} text="" disabled={disabled || limitX < 0.004} onChange={(x) => onChange({ x })} />
          <Slider label="Up and down" value={Math.max(-limitY, Math.min(limitY, photo.y))} min={-limitY} max={limitY} step={0.002} text="" disabled={disabled || limitY < 0.004} onChange={(y) => onChange({ y })} />
          <Slider label="Brightness" value={photo.brightness} min={0.6} max={1.5} step={0.02} text={`${Math.round(photo.brightness * 100)}%`} disabled={disabled} onChange={(brightness) => onChange({ brightness })} />
          <div className="grid grid-cols-3 gap-1.5">
            <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={() => onChange({ turns: (photo.turns + 1) % 4, x: 0, y: 0 })}>
              <RotateCw className="h-4 w-4" aria-hidden="true" />
              Turn
            </Button>
            <Button type="button" size="sm" variant={photo.flip ? "default" : "outline"} aria-pressed={photo.flip} disabled={disabled} onClick={() => onChange({ flip: !photo.flip })}>
              <FlipHorizontal2 className="h-4 w-4" aria-hidden="true" />
              Flip
            </Button>
            <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={() => onChange({ ...emptyPhoto, image: photo.image, name: photo.name })}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-1 text-xs leading-5 text-muted-foreground">Drop a photo here or press Add photo. JPG, PNG or WebP.</p>
      )}
    </div>
  );
}
