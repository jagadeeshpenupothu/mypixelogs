// Builds every download for a hand-made print design: flyers and posters (A4), and stationery (business cards,
// ID cards, letterheads, C4 envelopes), with an optional back side.
//
//   node scripts/designs/build.mjs <slug>
//
// Source: designs/<slug>.svg (front) and optionally designs/<slug>-back.svg, plus the entry in src/data/designs.json
// whose "size" (see scripts/designs/sizes.mjs) sets the page. Rules for the sources:
//   - the viewBox of the size (for cards it includes 3 mm bleed on every side; keep text 5 mm inside the trim);
//   - every part in a top-level <g data-name="..."> (one PSD layer each);
//   - photos as <image href="/flyers/<file>.jpg|.webp|.png"> (files in public/), logos and shapes as vectors;
//   - shapes, gradients, clipPath, mask, opacity; no filters, no CSS classes;
//   - text stays text: one line per <text> with x, y, font-family (any Google Font), font-size, font-weight,
//     optional letter-spacing, text-anchor, fill. A group holding one straight <text> becomes a live PSD text layer.
//
// Outputs public/downloads/<slug>.{svg,ai,pdf,eps,psd,png} (front; the PDF/AI hold every side), <slug>-back.{svg,eps,psd,png}
// when there is a back, <slug>-all-formats.zip with the fonts, and public/previews/<slug>.png.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

import { SIZES } from "./sizes.mjs";

const require = createRequire(import.meta.url);
const opentype = require("opentype.js");
const { chromium } = require("playwright");
const { PNG } = require("pngjs");
const { writePsdBuffer } = require("ag-psd");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const slug = process.argv[2];
if (!slug) {
  console.error("Usage: node scripts/designs/build.mjs <slug>");
  process.exit(2);
}
const meta = JSON.parse(readFileSync(path.join(root, "src/data/designs.json"), "utf8")).find((d) => d.slug === slug);
if (!meta) throw new Error(`No design "${slug}" in src/data/designs.json`);
const size = SIZES[meta.size ?? "a4"];
if (!size) throw new Error(`Unknown size "${meta.size}". Use one of: ${Object.keys(SIZES).join(", ")}`);
const attr = (tag, name) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];

// ---- Sources and checks ----
const problems = [];
const mime = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
const sideFiles = [["front", path.join(root, "designs", `${slug}.svg`)], ["back", path.join(root, "designs", `${slug}-back.svg`)]].filter(([, f]) => existsSync(f));
if (!sideFiles.length) throw new Error(`Missing designs/${slug}.svg`);
if (size.sides === 2 && sideFiles.length < 2) problems.push(`A ${size.label} needs a back side too: designs/${slug}-back.svg.`);
const sides = sideFiles.map(([name, f]) => {
  let svg = readFileSync(f, "utf8").replace(/<\?xml[^>]*>\s*/, "");
  if (/<filter\b|\sfilter="/.test(svg)) problems.push(`${name}: remove filters (they turn into pictures in AI/EPS). Use gradients and semi-transparent shapes for shadows.`);
  if (/\sclass="/.test(svg)) problems.push(`${name}: use attributes, not CSS classes.`);
  if (!svg.includes(`viewBox="0 0 ${size.vb[0]} ${size.vb[1]}"`)) problems.push(`${name}: use viewBox="0 0 ${size.vb[0]} ${size.vb[1]}" (${size.label}).`);
  const layers = [...svg.matchAll(/<g[^>]*\sdata-name="([^"]+)"/g)].length;
  if (layers < (size.minLayers ?? 5)) problems.push(`${name}: put each part in its own top-level <g data-name="..."> (found ${layers}).`);
  const texts = [...svg.matchAll(/<text\b([^>]*)>/g)].map((m) => m[1]);
  if (texts.length < (name === "front" ? (size.minTexts ?? 4) : 1)) problems.push(`${name}: needs real, editable text (<text>), not text drawn as shapes.`);
  for (const t of texts) if (!attr(t, "font-family")) problems.push(`${name}: a <text> has no font-family: <text${t.slice(0, 60)}...>`);
  // Photos and pictures are embedded as data URIs so every export contains them.
  svg = svg.replace(/<image\b([^>]*?)\s(?:xlink:)?href="([^"]+)"/g, (m, before, href) => {
    if (href.startsWith("data:")) return m;
    const file = path.join(root, "public", href);
    if (!href.startsWith("/") || !existsSync(file)) {
      problems.push(`${name}: image not found in public/: ${href}`);
      return m;
    }
    return `<image${before} href="data:${mime[path.extname(file).toLowerCase()] ?? "image/jpeg"};base64,${readFileSync(file).toString("base64")}"`;
  });
  return { name, svg, texts };
});
if (problems.length) {
  console.log(JSON.stringify({ ok: false, problems }, null, 1));
  process.exit(1);
}
const [vw, vh] = size.vb;

// ---- Fonts: any Google Font, fetched once as TTF into logos/fonts/ (shared with the logo builds) ----
const fontDir = path.join(root, "logos/fonts");
mkdirSync(fontDir, { recursive: true });
const fonts = new Map();
for (const t of sides.flatMap((s) => s.texts)) {
  const family = attr(t, "font-family").split(",")[0].replace(/['"]/g, "").trim();
  const weight = Number(attr(t, "font-weight") ?? 400);
  const key = `${family}|${weight}`;
  if (fonts.has(key)) continue;
  const file = path.join(fontDir, `${family.replace(/\s+/g, "")}-${weight}.ttf`);
  if (!existsSync(file)) {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`, { headers: { "User-Agent": "Mozilla/4.0" } })).text();
    const url = /url\((https:[^)]+\.ttf)\)/.exec(css)?.[1];
    if (!url) throw new Error(`Google Fonts has no "${family}" in weight ${weight}`);
    writeFileSync(file, Buffer.from(await (await fetch(url)).arrayBuffer()));
  }
  const font = opentype.parse(readFileSync(file).buffer.slice(0));
  fonts.set(key, { family, weight, file, ps: font.names.postScriptName?.en ?? `${family.replace(/\s+/g, "")}-${weight}` });
}
const fontCss = [...fonts.values()]
  .map((f) => `@font-face{font-family:'${f.family}';font-weight:${f.weight};src:url(data:font/ttf;base64,${readFileSync(f.file).toString("base64")}) format('truetype')}`)
  .join("");
for (const s of sides) s.withFonts = s.svg.replace(/<svg\b[^>]*>/, (m) => `${m}<defs><style>${fontCss}</style></defs>`);
const sized = (svg, w, h) => svg.replace(/<svg\b([^>]*)>/, (m, a) => `<svg${a.replace(/\s(width|height)="[^"]*"/g, "")} width="${w}" height="${h}">`);

const downloads = path.join(root, "public/downloads");
const previews = path.join(root, "public/previews");
[downloads, previews].forEach((d) => mkdirSync(d, { recursive: true }));
const file = (ext, side = "front") => path.join(downloads, `${slug}${side === "back" ? "-back" : ""}${ext}`);
const [mmW, mmH] = size.mm;
for (const s of sides) writeFileSync(file(".svg", s.name), `<?xml version="1.0" encoding="UTF-8"?>\n${sized(s.withFonts, `${mmW}mm`, `${mmH}mm`)}\n`);

// ---- Renders: 300 dpi PNG per side, one PDF with every side, EPS per side ----
const pw = Math.round((mmW / 25.4) * 300);
const ph = Math.round((mmH / 25.4) * 300);
const scale = pw / vw;
const browser = await chromium.launch();
const html = (body, css = "") => `<!doctype html><html><head><style>html,body{margin:0;background:transparent}svg{display:block}${css}</style></head><body>${body}</body></html>`;
for (const s of sides) {
  s.page = await browser.newPage({ viewport: { width: pw, height: ph } });
  await s.page.setContent(html(sized(s.withFonts, pw, ph)));
  await s.page.evaluate(() => document.fonts.ready);
  s.png = await s.page.screenshot({ type: "png" });
  writeFileSync(file(".png", s.name), s.png);
}
const pdfPage = await browser.newPage();
await pdfPage.setContent(html(sides.map((s) => `<div style="page-break-after:always">${sized(s.withFonts, `${mmW}mm`, `${mmH}mm`)}</div>`).join(""), `@page{size:${mmW}mm ${mmH}mm;margin:0}`));
await pdfPage.evaluate(() => document.fonts.ready);
await pdfPage.pdf({ path: file(".pdf"), width: `${mmW}mm`, height: `${mmH}mm`, printBackground: true, pageRanges: `1-${sides.length}` });
copyFileSync(file(".pdf"), file(".ai"));
sides.forEach((s, i) => execFileSync("pdftocairo", ["-eps", "-f", String(i + 1), "-l", String(i + 1), file(".pdf"), file(".eps", s.name)]));

// Website preview (992 x 1404): A4 designs as they are; cards and envelopes shown on a soft desk background.
const previewFile = path.join(previews, `${slug}.png`);
const prev = await browser.newPage({ viewport: { width: 992, height: 1404 } });
if (meta.size === "a4" || !meta.size) {
  await prev.setContent(html(sized(sides[0].withFonts, 992, 1404)));
} else {
  const img = (s) => `data:image/png;base64,${s.png.toString("base64")}`;
  // Cards: front above back, slightly rotated; envelope/letter-size: one large sheet.
  const cards = sides
    .map((s, i) => `<img src="${img(s)}" style="width:${size.preview.width}px;display:block;margin:${i ? 70 : 0}px auto 0;border-radius:${size.preview.radius ?? 0}px;transform:rotate(${i ? 2.5 : -2.5}deg);box-shadow:0 30px 60px rgba(20,24,40,.28),0 6px 14px rgba(20,24,40,.18)">`)
    .join("");
  await prev.setContent(
    `<!doctype html><html><body style="margin:0;width:992px;height:1404px;display:flex;flex-direction:column;justify-content:center;background:radial-gradient(circle at 50% 40%,#FBFAF7 0%,#EEEAE2 60%,#DDD7CC 100%)">${cards}<p style="font:600 22px/1.2 Arial,sans-serif;color:#6B6458;text-align:center;margin:56px 0 0">${size.label}${sides.length > 1 ? " · front and back" : ""} · ${size.mmLabel}</p></body></html>`,
  );
}
await prev.waitForTimeout(100);
await prev.screenshot({ path: previewFile });

// ---- Layered PSD per side, with live text layers ----
const hex = (h) => ({ r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16) });
let liveText = 0;
let layerCount = 0;
for (const s of sides) {
  const solid = (fill) => {
    if (/^#[0-9a-f]{6}$/i.test(fill ?? "")) return fill;
    const id = /url\(#([^)]+)\)/.exec(fill ?? "")?.[1];
    const grad = id && new RegExp(`<(?:linear|radial)Gradient[^>]*id="${id}"[^>]*>([\\s\\S]*?)</(?:linear|radial)Gradient>`).exec(s.svg)?.[1];
    const stops = grad ? [...grad.matchAll(/stop-color="(#[0-9a-fA-F]{6})"/g)].map((m) => m[1]) : [];
    return stops[Math.floor(stops.length / 2)] ?? "#000000";
  };
  const groups = await s.page.evaluate(() =>
    [...document.querySelectorAll("svg g[data-name]")]
      .filter((g) => !g.parentElement.closest("g[data-name]"))
      .map((g) => {
        const t = g.children.length === 1 && g.firstElementChild.tagName === "text" && !g.firstElementChild.querySelector("textPath, tspan") ? g.firstElementChild : null;
        return { name: g.dataset.name, text: t && Object.fromEntries(["x", "y", "font-family", "font-weight", "font-size", "letter-spacing", "text-anchor", "fill", "transform"].map((a) => [a, t.getAttribute(a)]).concat([["value", t.textContent]])) };
      }),
  );
  const layers = [];
  for (const { name, text } of groups) {
    await s.page.evaluate((n) => {
      [...document.querySelectorAll("svg g[data-name]")].filter((g) => !g.parentElement.closest("g[data-name]")).forEach((g) => (g.style.display = g.dataset.name === n ? "" : "none"));
    }, name);
    const png = PNG.sync.read(await s.page.screenshot({ type: "png", omitBackground: true }));
    let [x0, y0, x1, y1] = [png.width, png.height, -1, -1];
    for (let y = 0; y < png.height; y++) for (let x = 0; x < png.width; x++) if (png.data[(y * png.width + x) * 4 + 3]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    if (x1 < 0) continue;
    const w = x1 - x0 + 1, h = y1 - y0 + 1, data = Buffer.alloc(w * h * 4);
    for (let y = 0; y < h; y++) png.data.copy(data, y * w * 4, ((y + y0) * png.width + x0) * 4, ((y + y0) * png.width + x0 + w) * 4);
    const layer = { name, left: x0, top: y0, imageData: { width: w, height: h, data: new Uint8ClampedArray(data) } };
    if (text && !text.transform) {
      const family = text["font-family"].split(",")[0].replace(/['"]/g, "").trim();
      const f = fonts.get(`${family}|${Number(text["font-weight"] ?? 400)}`);
      const fsize = Number(text["font-size"]);
      if (f) {
        layer.text = {
          text: text.value,
          transform: [1, 0, 0, 1, Number(text.x ?? 0) * scale, Number(text.y ?? 0) * scale],
          style: { font: { name: f.ps }, fontSize: fsize * scale, fillColor: hex(solid(text.fill)), tracking: Math.round((Number(text["letter-spacing"] ?? 0) / fsize) * 1000) },
          paragraphStyle: { justification: { middle: "center", end: "right" }[text["text-anchor"]] ?? "left" },
        };
        liveText++;
      }
    }
    layers.push(layer);
  }
  layerCount += layers.length;
  const full = PNG.sync.read(s.png);
  writeFileSync(file(".psd", s.name), Buffer.from(writePsdBuffer({ width: pw, height: ph, imageData: { width: pw, height: ph, data: new Uint8ClampedArray(full.data) }, children: layers }, { generateThumbnail: false, compress: true })));
}
await browser.close();

// ---- ZIP with every format, the fonts and a read-me ----
const fontList = [...fonts.values()];
const back = sides.length > 1;
const readme = [
  `${meta.title} – free from MyPixelogs (https://mypixelogs.netlify.app/templates/${slug})`,
  `Size: ${size.label}, ${size.mmLabel}${size.bleed ? ` (files include ${size.bleed} mm bleed on every side; keep text 5 mm inside the trim line)` : ""}.`,
  "",
  "FIRST install the fonts in the fonts folder (double-click each file > Install). Then every text is editable:",
  `  ${slug}.psd${back ? ` / ${slug}-back.psd` : ""}  Photoshop / Photopea: double-click a text layer to edit it`,
  `  ${slug}.ai   Adobe Illustrator (every side is a page): click the text and type`,
  `  ${slug}.svg${back ? ` / ${slug}-back.svg` : ""}  Inkscape, Figma, Illustrator; CorelDRAW: File > Import`,
  `  ${slug}.eps${back ? ` / ${slug}-back.eps` : ""}  CorelDRAW / older Illustrator (File > Import)`,
  `  ${slug}.pdf  Print-ready PDF${back ? " (page 1 front, page 2 back)" : ""}`,
  `  ${slug}.png${back ? ` / ${slug}-back.png` : ""}  300 dpi`,
  "",
  "Fonts: " + fontList.map((f) => `${f.family} ${f.weight} (Google Fonts, SIL Open Font License)`).join("; "),
  ...(meta.credits?.length ? ["Images: " + meta.credits.map((c) => `${c.creator || "unknown"} (${c.license}, ${c.source}${c.page ? `, ${c.page}` : ""})`).join("; ")] : []),
  "",
  "Free for personal and commercial use. Replace the sample text and logo with your own details.",
].join("\n");
const readmeFile = path.join(root, "automation/out", `${slug}-README.txt`);
mkdirSync(path.dirname(readmeFile), { recursive: true });
writeFileSync(readmeFile, readme + "\n");
const zipped = [".psd", ".ai", ".svg", ".eps", ".pdf", ".png"].flatMap((e) => [`${slug}${e}`, ...(back && e !== ".ai" && e !== ".pdf" ? [`${slug}-back${e}`] : [])]);
execFileSync("python3", [
  "-c",
  `import sys,zipfile,os,json
d,s,r,names=sys.argv[1],sys.argv[2],sys.argv[3],json.loads(sys.argv[4])
with zipfile.ZipFile(os.path.join(d,s+'-all-formats.zip'),'w',zipfile.ZIP_DEFLATED) as z:
  for n in names: z.write(os.path.join(d,n),n)
  z.write(r,'README.txt')
  for f in sys.argv[5:]: z.write(f,'fonts/'+os.path.basename(f))`,
  downloads,
  slug,
  readmeFile,
  JSON.stringify(zipped),
  ...fontList.map((f) => f.file),
]);

console.log(JSON.stringify({ ok: true, slug, size: meta.size ?? "a4", sides: sides.map((s) => s.name), layers: layerCount, liveTextLayers: liveText, fonts: fontList.map(({ family, weight }) => ({ family, weight })) }));
