// Builds every download for a logo from its source drawing.
//
//   node scripts/logos/build.mjs <slug>
//
// Source: logos/<slug>.svg (written by hand / by the daily run) and its entry in src/data/logos.json.
// Rules for the source: a viewBox, every part inside a top-level <g data-name="..."> (one Photoshop layer each),
// text as single-line <text> elements with x, y, font-family, font-size, font-weight, optional letter-spacing,
// text-anchor and fill (no <tspan>, no CSS classes). Any Google Font can be used; it is downloaded automatically.
//
// Outputs public/logos/<slug>/:
//   <slug>.svg (text converted to outlines), <slug>.ai (PDF-based, opens in Illustrator), <slug>.pdf,
//   <slug>.eps (CorelDRAW, Inkscape, older Illustrator), <slug>.psd (one layer per group), <slug>.png (2000 px,
//   transparent), preview.png (for the website) and <slug>-all-formats.zip.
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
  console.error("Usage: node scripts/logos/build.mjs <slug>");
  process.exit(2);
}
const meta = JSON.parse(readFileSync(path.join(root, "src/data/logos.json"), "utf8")).find((l) => l.slug === slug);
if (!meta) throw new Error(`No logo "${slug}" in src/data/logos.json`);
const source = readFileSync(path.join(root, "logos", `${slug}.svg`), "utf8");
const problems = [];

// ---- Fonts: any Google Font, fetched once as TTF into logos/fonts/ ----
const fontDir = path.join(root, "logos/fonts");
mkdirSync(fontDir, { recursive: true });
async function loadFont(family, weight) {
  const file = path.join(fontDir, `${family.replace(/\s+/g, "")}-${weight}.ttf`);
  if (!existsSync(file)) {
    // An old browser name makes Google Fonts answer with plain TTF files.
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`, { headers: { "User-Agent": "Mozilla/4.0" } })).text();
    const url = /url\((https:[^)]+\.ttf)\)/.exec(css)?.[1];
    if (!url) throw new Error(`Google Fonts has no "${family}" in weight ${weight}`);
    writeFileSync(file, Buffer.from(await (await fetch(url)).arrayBuffer()));
  }
  return opentype.parse(readFileSync(file).buffer.slice(0));
}

// ---- Text to outlines ----
const attr = (tag, name) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];
const fontsUsed = new Map();
async function outline(svg) {
  const texts = [...svg.matchAll(/<text\b([^>]*)>([^<]*)<\/text>/g)];
  if (/<tspan/.test(svg)) problems.push("Remove <tspan>: use one <text> per line.");
  for (const [whole, tag, raw] of texts) {
    const family = (attr(tag, "font-family") ?? "").split(",")[0].replace(/['"]/g, "").trim();
    const weight = attr(tag, "font-weight") ?? "400";
    if (!family) {
      problems.push(`Text "${raw}" has no font-family.`);
      continue;
    }
    const font = await loadFont(family, weight);
    fontsUsed.set(`${family}|${weight}`, { family, weight: Number(weight) });
    const text = raw.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"');
    const size = Number(attr(tag, "font-size"));
    const ls = Number(attr(tag, "letter-spacing") ?? 0);
    const scale = size / font.unitsPerEm;
    const glyphs = font.stringToGlyphs(text);
    let width = 0;
    const xs = glyphs.map((g, i) => {
      const at = width;
      width += g.advanceWidth * scale + (i < glyphs.length - 1 ? ls + (glyphs[i + 1] ? font.getKerningValue(g, glyphs[i + 1]) * scale : 0) : 0);
      return at;
    });
    const anchor = attr(tag, "text-anchor") ?? "start";
    const x0 = Number(attr(tag, "x") ?? 0) - (anchor === "middle" ? width / 2 : anchor === "end" ? width : 0);
    const y = Number(attr(tag, "y") ?? 0);
    const d = glyphs.map((g, i) => g.getPath(x0 + xs[i], y, size).toPathData(2)).join("");
    const keep = ["fill", "fill-opacity", "opacity", "stroke", "stroke-width", "stroke-linejoin", "transform", "filter"]
      .map((n) => (attr(tag, n) != null ? ` ${n}="${attr(tag, n)}"` : ""))
      .join("");
    svg = svg.replace(whole, `<path data-text="${raw.replace(/"/g, "&quot;")}" d="${d}"${keep || ' fill="#000"'}/>`);
  }
  return svg;
}

const outlined = await outline(source);
const vb = /viewBox="([\d.\s-]+)"/.exec(outlined)?.[1]?.trim().split(/\s+/).map(Number);
if (!vb || vb.length !== 4) throw new Error("The source needs a viewBox");
const [, , vw, vh] = vb;
const layerNames = [...outlined.matchAll(/<g[^>]*\sdata-name="([^"]+)"/g)].map((m) => m[1]);
if (!layerNames.length) problems.push('Put each part in a top-level <g data-name="...">.');
if (/<image\b/.test(outlined)) problems.push("Logos must be vector only: remove <image>.");
if (problems.length) {
  console.log(JSON.stringify({ ok: false, problems }, null, 1));
  process.exit(1);
}

const out = path.join(root, "public/logos", slug);
mkdirSync(out, { recursive: true });
const file = (ext) => path.join(out, `${slug}${ext}`);
const sized = (svg, w, h) => svg.replace(/<svg\b([^>]*)>/, (m, a) => `<svg${a.replace(/\s(width|height)="[^"]*"/g, "")} width="${w}" height="${h}">`);
const clean = outlined.replace(/<\?xml[^>]*>\s*/, "");
writeFileSync(file(".svg"), `<?xml version="1.0" encoding="UTF-8"?>\n${sized(clean, vw, vh)}\n`);

// ---- Raster, PDF/AI/EPS and PSD ----
const long = 2000;
const [pw, ph] = vw >= vh ? [long, Math.round((long * vh) / vw)] : [Math.round((long * vw) / vh), long];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: pw, height: ph } });
const show = (svg, bg = "transparent") => page.setContent(`<!doctype html><html><head><style>html,body{margin:0;background:${bg}}svg{display:block}</style></head><body>${sized(clean, pw, ph)}</body></html>`).then(() => svg);
await show();
const full = await page.screenshot({ type: "png", omitBackground: true });
writeFileSync(file(".png"), full);

// Website preview: the logo centred on its background colour, 1200 x 900.
const prev = await browser.newPage({ viewport: { width: 1200, height: 900 } });
const fit = vw / vh > 1200 / 900 ? `width="900" height="${Math.round((900 * vh) / vw)}"` : `height="660" width="${Math.round((660 * vw) / vh)}"`;
await prev.setContent(`<!doctype html><html><body style="margin:0;height:900px;display:flex;align-items:center;justify-content:center;background:${meta.previewBg ?? "#FFFFFF"}">${clean.replace(/<svg\b([^>]*)>/, (m, a) => `<svg${a.replace(/\s(width|height)="[^"]*"/g, "")} ${fit}>`)}</body></html>`);
await prev.screenshot({ path: path.join(out, "preview.png") });

const pdfPage = await browser.newPage();
await pdfPage.setContent(`<!doctype html><html><head><style>@page{size:${vw}px ${vh}px;margin:0}html,body{margin:0}svg{display:block}</style></head><body>${sized(clean, vw, vh)}</body></html>`);
await pdfPage.pdf({ path: file(".pdf"), width: `${vw}px`, height: `${vh}px`, printBackground: true, pageRanges: "1" });
copyFileSync(file(".pdf"), file(".ai")); // Illustrator opens PDF-based .ai files as editable vectors.
execFileSync("pdftocairo", ["-eps", file(".pdf"), file(".eps")]);

const layers = [];
for (const name of layerNames) {
  await page.evaluate((n) => {
    const top = [...document.querySelectorAll("svg > g[data-name], svg > * g[data-name]")].filter((g) => !g.parentElement.closest("g[data-name]"));
    top.forEach((g) => (g.style.display = g.dataset.name === n ? "" : "none"));
  }, name);
  const png = PNG.sync.read(await page.screenshot({ type: "png", omitBackground: true }));
  let [x0, y0, x1, y1] = [png.width, png.height, -1, -1];
  for (let y = 0; y < png.height; y++) for (let x = 0; x < png.width; x++) if (png.data[(y * png.width + x) * 4 + 3]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  if (x1 < 0) continue;
  const w = x1 - x0 + 1, h = y1 - y0 + 1, data = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) png.data.copy(data, y * w * 4, ((y + y0) * png.width + x0) * 4, ((y + y0) * png.width + x0 + w) * 4);
  layers.push({ name, left: x0, top: y0, imageData: { width: w, height: h, data: new Uint8ClampedArray(data) } });
}
await browser.close();
const fullPng = PNG.sync.read(full);
writeFileSync(file(".psd"), Buffer.from(writePsdBuffer({ width: pw, height: ph, imageData: { width: pw, height: ph, data: new Uint8ClampedArray(fullPng.data) }, children: layers }, { generateThumbnail: false, compress: true })));

// ---- Everything in one ZIP, with a short read-me ----
const readme = [
  `${meta.title} – free logo from MyPixelogs (https://mypixelogs.netlify.app/assets/logos/${slug})`,
  "",
  `${slug}.ai   Adobe Illustrator (vector, editable)`,
  `${slug}.svg  Vector for Inkscape, Figma, Canva, websites`,
  `${slug}.eps  CorelDRAW (File > Import), older Illustrator`,
  `${slug}.pdf  Vector PDF for print; CorelDRAW opens it too`,
  `${slug}.psd  Photoshop / Photopea, one layer per part`,
  `${slug}.png  2000 px, transparent background`,
  "",
  "Colours: " + (meta.colors ?? []).map((c) => `${c.name} ${c.hex}`).join(", "),
  "Fonts (free, Google Fonts): " + [...fontsUsed.values()].map((f) => `${f.family} ${f.weight}`).join(", "),
  "Text is converted to outlines, so the files look right without installing the fonts.",
  "To change the name, install the font above and retype it, or edit the PSD text layer area.",
  "",
  "Free for personal and commercial use. Change the name and colours to make it your own.",
  "Check that your final logo does not match someone else's registered trademark before you use it.",
].join("\n");
writeFileSync(path.join(out, "README.txt"), readme + "\n");
execFileSync("python3", ["-c", `import sys,zipfile,os
d,s=sys.argv[1],sys.argv[2]
with zipfile.ZipFile(os.path.join(d,s+'-all-formats.zip'),'w',zipfile.ZIP_DEFLATED) as z:
  for e in ['.ai','.svg','.eps','.pdf','.psd','.png']: z.write(os.path.join(d,s+e),s+e)
  z.write(os.path.join(d,'README.txt'),'README.txt')`, out, slug]);

// Fonts used go back into the catalogue entry, so the page can list them.
console.log(JSON.stringify({ ok: true, slug, size: `${pw}x${ph}`, layers: layers.map((l) => l.name), fonts: [...fontsUsed.values()] }));
