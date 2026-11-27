// Builds every file for a flyer from its design module (src/lib/flyers/<name>.ts).
//
//   node scripts/flyers/build.mjs grand-opening
//
// Outputs public/downloads/<slug>.{psd,ai,svg,pdf,png} and public/previews/<slug>.png.
// The PSD has one layer per drawing group, in folders, and every text is a live, editable text layer.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const { PNG } = require("pngjs");
const { writePsdBuffer } = require("ag-psd");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const name = process.argv[2];
if (!name) { console.error("Usage: node scripts/flyers/build.mjs <design-name>"); process.exit(2); }
const { flyerSvg, FLYER_DEFAULTS: F, FLYER_THEMES, FLYER_GROUPS } = await import(path.join(root, `src/lib/flyers/${name}.ts`));
const slug = `${name}-flyer`;
const theme = Object.values(FLYER_THEMES)[0];
const fontDir = path.join(root, "public/fonts/flyer");
const font = (f) => "data:font/woff2;base64," + readFileSync(path.join(fontDir, f)).toString("base64");
export const FONT_FILES = { "Inter|500|normal": "Inter-Medium.woff2", "Inter|600|normal": "Inter-SemiBold.woff2", "Inter|700|normal": "Inter-Bold.woff2", "Inter|900|normal": "Inter-Black.woff2", "Playfair Display|700|italic": "PlayfairDisplay-BoldItalic.woff2" };
const FONTS = Object.fromEntries(Object.entries(FONT_FILES).map(([k, f]) => [k, font(f)]));
// PostScript names Photoshop and Photopea look for.
const POSTSCRIPT = { "Inter|500": "Inter-Medium", "Inter|600": "Inter-SemiBold", "Inter|700": "Inter-Bold", "Inter|900": "Inter-Black", "Playfair Display|700": "PlayfairDisplay-BoldItalic" };

const downloads = path.join(root, "public/downloads"), previews = path.join(root, "public/previews");
[downloads, previews].forEach((d) => mkdirSync(d, { recursive: true }));
const out = (ext) => path.join(downloads, `${slug}${ext}`);
const html = (svg, css = "") => `<!doctype html><html><head><style>html,body{margin:0;background:transparent}svg{display:block}${css}</style></head><body>${svg}</body></html>`;

const browser = await chromium.launch();
const open = async (svg, viewport, scale = 1, css) => {
  const page = await browser.newPage({ viewport, deviceScaleFactor: scale });
  await page.setContent(html(svg, css));
  await page.evaluate(() => document.fonts.ready);
  return page;
};

const page = await open(flyerSvg(F, theme, { fonts: FONTS }), { width: 1240, height: 1754 }, 2);
const full = await page.screenshot({ type: "png" });
writeFileSync(out(".png"), full);
const small = await open(flyerSvg(F, theme, { fonts: FONTS, width: 992, height: 1404 }), { width: 992, height: 1404 });
await small.screenshot({ path: path.join(previews, `${slug}.png`) });
const print = await open(flyerSvg(F, theme, { fonts: FONTS, width: "210mm", height: "297mm" }), { width: 794, height: 1123 }, 1, "@page{size:A4;margin:0}");
await print.pdf({ path: out(".pdf"), width: "210mm", height: "297mm", printBackground: true, pageRanges: "1" });
copyFileSync(out(".pdf"), out(".ai")); // Illustrator opens PDF-based .ai files with text kept as text.
writeFileSync(out(".svg"), flyerSvg(F, theme, { width: "210mm", height: "297mm" }));

// ---- Layered PSD ----
const groups = await page.evaluate(() => [...document.querySelectorAll("g[data-layer]")].map((g) => {
  const t = g.children.length === 1 && g.firstElementChild.tagName === "text" ? g.firstElementChild : null;
  const rot = /rotate\(([-\d.]+)/.exec(g.getAttribute("transform") || "");
  return { id: g.dataset.layer, name: g.dataset.name, text: t && { value: t.textContent, family: t.getAttribute("font-family").split(",")[0].replace(/'/g, "").trim(), weight: t.getAttribute("font-weight"),
    size: +t.getAttribute("font-size"), fill: t.getAttribute("fill"), ls: +(t.getAttribute("letter-spacing") || 0), x: +t.getAttribute("x"), y: +t.getAttribute("y"), rot: rot ? +rot[1] : 0 } };
}));
const rgb = (h) => ({ r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16) });
const layers = new Map();
for (const { id, name: layerName, text } of groups) {
  await page.evaluate((id) => document.querySelectorAll("g[data-layer]").forEach((g) => (g.style.display = g.dataset.layer === id ? "" : "none")), id);
  const png = PNG.sync.read(await page.screenshot({ type: "png", omitBackground: true }));
  let [x0, y0, x1, y1] = [png.width, png.height, -1, -1];
  for (let y = 0; y < png.height; y++) for (let x = 0; x < png.width; x++) if (png.data[(y * png.width + x) * 4 + 3]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  if (x1 < 0) continue;
  const w = x1 - x0 + 1, h = y1 - y0 + 1, data = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) png.data.copy(data, y * w * 4, ((y + y0) * png.width + x0) * 4, ((y + y0) * png.width + x0 + w) * 4);
  const layer = { name: layerName, left: x0, top: y0, imageData: { width: w, height: h, data: new Uint8ClampedArray(data) } };
  if (text) {
    const r = (text.rot * Math.PI) / 180;
    const fontName = POSTSCRIPT[`${text.family}|${text.weight}`];
    if (!fontName) throw new Error(`No PostScript name for ${text.family} ${text.weight}`);
    layer.text = { text: text.value, transform: [Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), text.x * 2, text.y * 2],
      style: { font: { name: fontName }, fontSize: text.size * 2, fillColor: rgb(text.fill), tracking: Math.round((text.ls / text.size) * 1000) }, paragraphStyle: { justification: "center" } };
  }
  layers.set(layerName, layer);
}
const fullPng = PNG.sync.read(full);
const psd = {
  width: 2480, height: 3508, imageData: { width: fullPng.width, height: fullPng.height, data: new Uint8ClampedArray(fullPng.data) },
  // Folders bottom to top, as Photoshop lists them reversed.
  children: FLYER_GROUPS.map(([folder, names]) => ({ name: folder, children: names.map((n) => layers.get(n)).filter(Boolean) })),
};
const placed = psd.children.reduce((n, f) => n + f.children.length, 0);
if (placed !== layers.size) throw new Error(`FLYER_GROUPS places ${placed} of ${layers.size} layers`);
writeFileSync(out(".psd"), Buffer.from(writePsdBuffer(psd, { generateThumbnail: false })));
await browser.close();
console.log(`Built ${slug}: ${layers.size} layers, ${groups.filter((g) => g.text).length} editable text layers.`);
