// Builds every download for a hand-designed flyer/poster/pamphlet (the daily "Pinterest-inspired" run).
//
//   node scripts/designs/build.mjs <slug>
//
// Source: designs/<slug>.svg and its entry in src/data/designs.json.
// Rules for the source:
//   - viewBox="0 0 1240 1754" (A4 portrait); every part in a top-level <g data-name="..."> (one PSD layer each);
//   - photos as <image href="/flyers/<file>.jpg|.webp|.png"> (files in public/, free-licence, credited in the entry);
//   - shapes, gradients, clipPath, mask, opacity; no filters, no CSS classes;
//   - text stays text: <text> with x, y, font-family (any Google Font), font-size, font-weight, optional
//     letter-spacing, text-anchor, fill; one line per <text>. A group holding one straight <text> becomes a live PSD
//     text layer, so give every line its own <g data-name>.
//
// Outputs public/downloads/<slug>.{svg,ai,pdf,eps,psd,png} (PNG 2480 x 3508, 300 dpi), <slug>-all-formats.zip with
// the fonts, and public/previews/<slug>.png.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

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
let source = readFileSync(path.join(root, "designs", `${slug}.svg`), "utf8").replace(/<\?xml[^>]*>\s*/, "");
const attr = (tag, name) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];

// ---- Checks ----
const problems = [];
if (/<filter\b|\sfilter="/.test(source)) problems.push("Remove filters (they turn into pictures in AI/EPS). Use gradients and semi-transparent shapes for shadows.");
if (/\sclass="/.test(source)) problems.push("Use attributes, not CSS classes.");
if (!/viewBox="0 0 1240 1754"/.test(source)) problems.push('Use viewBox="0 0 1240 1754" (A4 portrait).');
const layerNames = [...source.matchAll(/<g[^>]*\sdata-name="([^"]+)"/g)].map((m) => m[1]);
if (layerNames.length < 5) problems.push('Put each part in its own top-level <g data-name="..."> (a professional design has many layers).');
const textTags = [...source.matchAll(/<text\b([^>]*)>/g)].map((m) => m[1]);
if (textTags.length < 4) problems.push("A flyer needs real, editable text (<text>), not text drawn as shapes.");
for (const t of textTags) if (!attr(t, "font-family")) problems.push(`A <text> has no font-family: <text${t.slice(0, 60)}...>`);
// Photos: embed every local image as a data URI so all exports contain it.
const mime = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
source = source.replace(/<image\b([^>]*?)\s(?:xlink:)?href="([^"]+)"/g, (m, before, href) => {
  if (href.startsWith("data:")) return m;
  const file = path.join(root, "public", href);
  if (!href.startsWith("/") || !existsSync(file)) {
    problems.push(`Image not found in public/: ${href}`);
    return m;
  }
  return `<image${before} href="data:${mime[path.extname(file).toLowerCase()] ?? "image/jpeg"};base64,${readFileSync(file).toString("base64")}"`;
});
if (problems.length) {
  console.log(JSON.stringify({ ok: false, problems }, null, 1));
  process.exit(1);
}
const [vw, vh] = [1240, 1754];

// ---- Fonts: any Google Font, fetched once as TTF into logos/fonts/ (shared with the logo builds) ----
const fontDir = path.join(root, "logos/fonts");
mkdirSync(fontDir, { recursive: true });
const fonts = new Map();
for (const t of textTags) {
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
const withFonts = source.replace(/<svg\b[^>]*>/, (m) => `${m}<defs><style>${fontCss}</style></defs>`);
const sized = (svg, w, h) => svg.replace(/<svg\b([^>]*)>/, (m, a) => `<svg${a.replace(/\s(width|height)="[^"]*"/g, "")} width="${w}" height="${h}">`);

const downloads = path.join(root, "public/downloads");
const previews = path.join(root, "public/previews");
[downloads, previews].forEach((d) => mkdirSync(d, { recursive: true }));
const file = (ext) => path.join(downloads, `${slug}${ext}`);
writeFileSync(file(".svg"), `<?xml version="1.0" encoding="UTF-8"?>\n${sized(withFonts, "210mm", "297mm")}\n`);

// ---- Renders ----
const [pw, ph] = [2480, 3508];
const scale = pw / vw;
const browser = await chromium.launch();
const html = (svg, css = "") => `<!doctype html><html><head><style>html,body{margin:0;background:transparent}svg{display:block}${css}</style></head><body>${svg}</body></html>`;
const page = await browser.newPage({ viewport: { width: pw, height: ph } });
await page.setContent(html(sized(withFonts, pw, ph)));
await page.evaluate(() => document.fonts.ready);
const full = await page.screenshot({ type: "png" });
writeFileSync(file(".png"), full);
const small = await browser.newPage({ viewport: { width: 992, height: 1404 } });
await small.setContent(html(sized(withFonts, 992, 1404)));
await small.evaluate(() => document.fonts.ready);
await small.screenshot({ path: path.join(previews, `${slug}.png`) });

const pdfPage = await browser.newPage();
await pdfPage.setContent(html(sized(withFonts, "210mm", "297mm"), "@page{size:A4;margin:0}"));
await pdfPage.evaluate(() => document.fonts.ready);
await pdfPage.pdf({ path: file(".pdf"), width: "210mm", height: "297mm", printBackground: true, pageRanges: "1" });
copyFileSync(file(".pdf"), file(".ai"));
execFileSync("pdftocairo", ["-eps", file(".pdf"), file(".eps")]);

// ---- Layered PSD with live text layers ----
const hex = (h) => ({ r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16) });
const solid = (fill) => {
  if (/^#[0-9a-f]{6}$/i.test(fill ?? "")) return fill;
  const id = /url\(#([^)]+)\)/.exec(fill ?? "")?.[1];
  const grad = id && new RegExp(`<(?:linear|radial)Gradient[^>]*id="${id}"[^>]*>([\\s\\S]*?)</(?:linear|radial)Gradient>`).exec(source)?.[1];
  const stops = grad ? [...grad.matchAll(/stop-color="(#[0-9a-fA-F]{6})"/g)].map((m) => m[1]) : [];
  return stops[Math.floor(stops.length / 2)] ?? "#000000";
};
const groups = await page.evaluate(() =>
  [...document.querySelectorAll("svg g[data-name]")]
    .filter((g) => !g.parentElement.closest("g[data-name]"))
    .map((g) => {
      const t = g.children.length === 1 && g.firstElementChild.tagName === "text" && !g.firstElementChild.querySelector("textPath, tspan") ? g.firstElementChild : null;
      return { name: g.dataset.name, text: t && Object.fromEntries(["x", "y", "font-family", "font-weight", "font-size", "letter-spacing", "text-anchor", "fill", "transform"].map((a) => [a, t.getAttribute(a)]).concat([["value", t.textContent]])) };
    }),
);
const layers = [];
let liveText = 0;
for (const { name, text } of groups) {
  await page.evaluate((n) => {
    [...document.querySelectorAll("svg g[data-name]")].filter((g) => !g.parentElement.closest("g[data-name]")).forEach((g) => (g.style.display = g.dataset.name === n ? "" : "none"));
  }, name);
  const png = PNG.sync.read(await page.screenshot({ type: "png", omitBackground: true }));
  let [x0, y0, x1, y1] = [png.width, png.height, -1, -1];
  for (let y = 0; y < png.height; y++) for (let x = 0; x < png.width; x++) if (png.data[(y * png.width + x) * 4 + 3]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  if (x1 < 0) continue;
  const w = x1 - x0 + 1, h = y1 - y0 + 1, data = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) png.data.copy(data, y * w * 4, ((y + y0) * png.width + x0) * 4, ((y + y0) * png.width + x0 + w) * 4);
  const layer = { name, left: x0, top: y0, imageData: { width: w, height: h, data: new Uint8ClampedArray(data) } };
  if (text && !text.transform) {
    const family = text["font-family"].split(",")[0].replace(/['"]/g, "").trim();
    const f = fonts.get(`${family}|${Number(text["font-weight"] ?? 400)}`);
    const size = Number(text["font-size"]);
    if (f) {
      layer.text = {
        text: text.value,
        transform: [1, 0, 0, 1, Number(text.x ?? 0) * scale, Number(text.y ?? 0) * scale],
        style: { font: { name: f.ps }, fontSize: size * scale, fillColor: hex(solid(text.fill)), tracking: Math.round((Number(text["letter-spacing"] ?? 0) / size) * 1000) },
        paragraphStyle: { justification: { middle: "center", end: "right" }[text["text-anchor"]] ?? "left" },
      };
      liveText++;
    }
  }
  layers.push(layer);
}
await browser.close();
const fullPng = PNG.sync.read(full);
writeFileSync(file(".psd"), Buffer.from(writePsdBuffer({ width: pw, height: ph, imageData: { width: pw, height: ph, data: new Uint8ClampedArray(fullPng.data) }, children: layers }, { generateThumbnail: false, compress: true })));

// ---- ZIP with every format, the fonts and a read-me ----
const fontList = [...fonts.values()];
const readme = [
  `${meta.title} – free from MyPixelogs (https://mypixelogs.netlify.app/templates/${slug})`,
  "",
  "FIRST install the fonts in the fonts folder (double-click each file > Install). Then every text is editable:",
  `  ${slug}.psd  Photoshop / Photopea: double-click a text layer to edit it; every part is its own layer`,
  `  ${slug}.ai   Adobe Illustrator: click the text and type`,
  `  ${slug}.svg  Inkscape, Figma, Illustrator; CorelDRAW: File > Import`,
  `  ${slug}.eps  CorelDRAW / older Illustrator (File > Import)`,
  `  ${slug}.pdf  Print-ready A4 PDF`,
  `  ${slug}.png  A4 at 300 dpi (2480 x 3508)`,
  "",
  "Fonts: " + fontList.map((f) => `${f.family} ${f.weight} (Google Fonts, SIL Open Font License)`).join("; "),
  "Photos: " + (meta.credits ?? []).map((c) => `${c.creator || "unknown"} (${c.license}, ${c.source}${c.page ? `, ${c.page}` : ""})`).join("; "),
  "",
  "Free for personal and commercial use. Replace the sample text with your own details.",
].join("\n");
const readmeFile = path.join(root, "automation/out", `${slug}-README.txt`);
mkdirSync(path.dirname(readmeFile), { recursive: true });
writeFileSync(readmeFile, readme + "\n");
execFileSync("python3", [
  "-c",
  `import sys,zipfile,os
d,s,r=sys.argv[1],sys.argv[2],sys.argv[3]
with zipfile.ZipFile(os.path.join(d,s+'-all-formats.zip'),'w',zipfile.ZIP_DEFLATED) as z:
  for e in ['.psd','.ai','.svg','.eps','.pdf','.png']: z.write(os.path.join(d,s+e),s+e)
  z.write(r,'README.txt')
  for f in sys.argv[4:]: z.write(f,'fonts/'+os.path.basename(f))`,
  downloads,
  slug,
  readmeFile,
  ...fontList.map((f) => f.file),
]);

console.log(JSON.stringify({ ok: true, slug, layers: layers.length, liveTextLayers: liveText, fonts: fontList.map(({ family, weight }) => ({ family, weight })) }));
