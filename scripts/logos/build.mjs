// Builds every download for a logo from its source drawing, keeping all text EDITABLE.
//
//   node scripts/logos/build.mjs <slug>
//
// Source: logos/<slug>.svg and its entry in src/data/logos.json.
// Rules for the source:
//   - a viewBox; every part inside a top-level <g data-name="..."> (one Photoshop layer each);
//   - vector only: shapes, paths, linear/radial gradients, clipPath, mask, opacity. No <image>, no filters;
//   - text stays text: <text> with x, y, font-family (any Google Font, fetched automatically), font-size,
//     font-weight, optional letter-spacing, text-anchor, fill (a colour or a gradient), stroke; curved text with
//     <textPath href="#arc">. A group holding a single straight <text> becomes a live text layer in the PSD.
//
// Outputs public/logos/<slug>/:
//   <slug>.svg (live text, fonts embedded), <slug>.ai and <slug>.pdf (live text, fonts embedded; Illustrator edits the
//   text when the font is installed), <slug>.eps (CorelDRAW), <slug>.psd (layers, live text layers), <slug>.png
//   (2000 px, transparent), <slug>-outlined.svg (text as shapes, for print shops and cutting machines),
//   preview.png, and <slug>-all-formats.zip with a fonts/ folder and a read-me.
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
const source = readFileSync(path.join(root, "logos", `${slug}.svg`), "utf8").replace(/<\?xml[^>]*>\s*/, "");
const attr = (tag, name) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];

// ---- Checks ----
const problems = [];
if (/<image\b/.test(source)) problems.push("Logos must be vector only: remove <image>.");
if (/<filter\b|\sfilter="/.test(source)) problems.push("Remove filters (they turn into pictures in AI/EPS). Make shadows and glows with gradients and semi-transparent shapes.");
if (/\sclass="/.test(source)) problems.push("Use attributes, not CSS classes.");
const vb = /viewBox="([\d.\s-]+)"/.exec(source)?.[1]?.trim().split(/\s+/).map(Number);
if (!vb || vb.length !== 4) problems.push("The source needs a viewBox.");
const layerNames = [...source.matchAll(/<g[^>]*\sdata-name="([^"]+)"/g)].map((m) => m[1]);
if (!layerNames.length) problems.push('Put each part in a top-level <g data-name="...">.');
const textTags = [...source.matchAll(/<text\b([^>]*)>/g)].map((m) => m[1]);
for (const t of textTags) if (!attr(t, "font-family")) problems.push(`A <text> has no font-family: <text${t.slice(0, 60)}...>`);
if (problems.length) {
  console.log(JSON.stringify({ ok: false, problems }, null, 1));
  process.exit(1);
}
const [, , vw, vh] = vb;

// ---- Fonts: any Google Font, fetched once as TTF into logos/fonts/ ----
const fontDir = path.join(root, "logos/fonts");
mkdirSync(fontDir, { recursive: true });
const fonts = new Map(); // "Family|weight" -> { family, weight, file, ps }
for (const t of textTags) {
  const family = attr(t, "font-family").split(",")[0].replace(/['"]/g, "").trim();
  const weight = Number(attr(t, "font-weight") ?? 400);
  const key = `${family}|${weight}`;
  if (fonts.has(key)) continue;
  const file = path.join(fontDir, `${family.replace(/\s+/g, "")}-${weight}.ttf`);
  if (!existsSync(file)) {
    // An old browser name makes Google Fonts answer with plain TTF files.
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`, { headers: { "User-Agent": "Mozilla/4.0" } })).text();
    const url = /url\((https:[^)]+\.ttf)\)/.exec(css)?.[1];
    if (!url) throw new Error(`Google Fonts has no "${family}" in weight ${weight}`);
    writeFileSync(file, Buffer.from(await (await fetch(url)).arrayBuffer()));
  }
  const font = opentype.parse(readFileSync(file).buffer.slice(0));
  fonts.set(key, { family, weight, file, ps: font.names.postScriptName?.en ?? `${family.replace(/\s+/g, "")}-${weight}` });
}
// Fonts travel inside the SVG, so it renders right in browsers and tools that read @font-face.
const fontCss = [...fonts.values()]
  .map((f) => `@font-face{font-family:'${f.family}';font-weight:${f.weight};src:url(data:font/ttf;base64,${readFileSync(f.file).toString("base64")}) format('truetype')}`)
  .join("");
const withFonts = fontCss ? source.replace(/<svg\b[^>]*>/, (m) => `${m}<defs><style>${fontCss}</style></defs>`) : source;
const sized = (svg, w, h) => svg.replace(/<svg\b([^>]*)>/, (m, a) => `<svg${a.replace(/\s(width|height)="[^"]*"/g, "")} width="${w}" height="${h}">`);

const out = path.join(root, "public/logos", slug);
mkdirSync(out, { recursive: true });
const file = (ext) => path.join(out, `${slug}${ext}`);
writeFileSync(file(".svg"), `<?xml version="1.0" encoding="UTF-8"?>\n${sized(withFonts, vw, vh)}\n`);

// ---- Renders ----
const long = 2000;
const [pw, ph] = vw >= vh ? [long, Math.round((long * vh) / vw)] : [Math.round((long * vw) / vh), long];
const scale = pw / vw;
const browser = await chromium.launch();
const html = (svg, css = "") => `<!doctype html><html><head><style>html,body{margin:0;background:transparent}svg{display:block}${css}</style></head><body>${svg}</body></html>`;
const page = await browser.newPage({ viewport: { width: pw, height: ph } });
await page.setContent(html(sized(withFonts, pw, ph)));
await page.evaluate(() => document.fonts.ready);
const full = await page.screenshot({ type: "png", omitBackground: true });
writeFileSync(file(".png"), full);

// Website preview: the logo centred on a soft spotlight of its background colour, 1200 x 900.
const prev = await browser.newPage({ viewport: { width: 1200, height: 900 } });
const box = vw / vh > 1200 / 900 ? `width="900" height="${Math.round((900 * vh) / vw)}"` : `height="660" width="${Math.round((660 * vw) / vh)}"`;
const bg = meta.previewBg ?? "#FFFFFF";
await prev.setContent(
  `<!doctype html><html><body style="margin:0;height:900px;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 45%, color-mix(in srgb, ${bg} 70%, white) 0%, ${bg} 55%, color-mix(in srgb, ${bg} 82%, black) 100%)">` +
    `<div style="filter:drop-shadow(0 18px 30px rgba(0,0,0,.18))">${withFonts.replace(/<svg\b([^>]*)>/, (m, a) => `<svg${a.replace(/\s(width|height)="[^"]*"/g, "")} ${box}>`)}</div></body></html>`,
);
await prev.evaluate(() => document.fonts.ready);
await prev.screenshot({ path: path.join(out, "preview.png") });

// PDF / AI keep the text as real text with the fonts embedded; EPS is made from it for CorelDRAW.
const pdfPage = await browser.newPage();
await pdfPage.setContent(html(sized(withFonts, vw, vh), `@page{size:${vw}px ${vh}px;margin:0}`));
await pdfPage.evaluate(() => document.fonts.ready);
await pdfPage.pdf({ path: file(".pdf"), width: `${vw}px`, height: `${vh}px`, printBackground: true, pageRanges: "1" });
copyFileSync(file(".pdf"), file(".ai"));
execFileSync("pdftocairo", ["-eps", file(".pdf"), file(".eps")]);
execFileSync("pdftocairo", ["-svg", file(".pdf"), file("-outlined.svg")]);

// ---- Layered PSD; a group with one straight <text> becomes a live text layer ----
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
  if (text) {
    const family = text["font-family"].split(",")[0].replace(/['"]/g, "").trim();
    const f = fonts.get(`${family}|${Number(text["font-weight"] ?? 400)}`);
    const size = Number(text["font-size"]);
    let [x, y, a] = [Number(text.x ?? 0), Number(text.y ?? 0), 0];
    const rot = /rotate\(\s*([-\d.]+)(?:[\s,]+([-\d.]+)[\s,]+([-\d.]+))?\s*\)/.exec(text.transform ?? "");
    if (rot) {
      // Turn the anchor point around the rotation centre, then rotate the text itself.
      a = (Number(rot[1]) * Math.PI) / 180;
      const [cx, cy] = [Number(rot[2] ?? 0), Number(rot[3] ?? 0)];
      [x, y] = [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)];
    }
    if (f && (!text.transform || rot)) {
      layer.text = {
        text: text.value,
        transform: [Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), x * scale, y * scale],
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

// ---- Everything in one ZIP, with the fonts and a short read-me ----
const fontList = [...fonts.values()];
const readme = [
  `${meta.title} – free logo from MyPixelogs (https://mypixelogs.netlify.app/assets/logos/${slug})`,
  "",
  "FIRST install the fonts in the fonts folder (double-click each file > Install). Then the text is editable:",
  `  ${slug}.ai            Adobe Illustrator: click the text and type your business name`,
  `  ${slug}.svg           Inkscape, Figma, Illustrator, CorelDRAW (File > Import): editable text`,
  `  ${slug}.eps           CorelDRAW / older Illustrator (File > Import)`,
  `  ${slug}.pdf           Vector PDF; Illustrator and CorelDRAW open it too`,
  `  ${slug}.psd           Photoshop / Photopea: double-click a text layer to edit it`,
  `  ${slug}.png           2000 px, transparent background`,
  `  ${slug}-outlined.svg  Text converted to shapes: send this to print shops, sign makers and cutting machines`,
  "",
  "Colours: " + (meta.colors ?? []).map((c) => `${c.name} ${c.hex}`).join(", "),
  "Fonts: " + fontList.map((f) => `${f.family} ${f.weight} (Google Fonts, SIL Open Font License)`).join("; "),
  "Curved text follows its arc in Illustrator and Inkscape (text on a path); in the PSD it is a picture layer.",
  "",
  "Free for personal and commercial use. Change the name and colours to make it your own.",
  "Check that your final logo does not match someone else's registered trademark before you use it.",
].join("\n");
writeFileSync(path.join(out, "README.txt"), readme + "\n");
execFileSync("python3", [
  "-c",
  `import sys,zipfile,os
d,s=sys.argv[1],sys.argv[2]
with zipfile.ZipFile(os.path.join(d,s+'-all-formats.zip'),'w',zipfile.ZIP_DEFLATED) as z:
  for e in ['.ai','.svg','.eps','.pdf','.psd','.png','-outlined.svg']: z.write(os.path.join(d,s+e),s+e)
  z.write(os.path.join(d,'README.txt'),'README.txt')
  for f in sys.argv[3:]: z.write(f,'fonts/'+os.path.basename(f))`,
  out,
  slug,
  ...fontList.map((f) => f.file),
]);

console.log(JSON.stringify({ ok: true, slug, size: `${pw}x${ph}`, layers: layers.map((l) => l.name), liveTextLayers: liveText, fonts: fontList.map(({ family, weight }) => ({ family, weight })) }));
