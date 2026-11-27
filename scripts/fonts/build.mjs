// After fetch.py: makes a small web font (for the live preview) and a card image for every font,
// then writes src/data/fonts.json for the site.
//
//   node scripts/fonts/build.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const full = JSON.parse(readFileSync(path.join(os.tmpdir(), "mypixelogs-fonts/fonts-full.json"), "utf8"));
const order = JSON.parse(readFileSync(path.join(root, "scripts/fonts/families.json"), "utf8"));
const webDir = path.join(root, "public/fonts/library");
const cardDir = path.join(root, "public/previews/fonts");
[webDir, cardDir].forEach((d) => mkdirSync(d, { recursive: true }));

const LATIN = "U+0020-007E,U+00A0-00FF,U+2013-2014,U+2018-201D,U+2022,U+2026,U+20B9";
const SCRIPT_RANGES = { telugu: "U+0C00-0C7F", devanagari: "U+0900-097F" };
/** A native sample for Indian-script fonts. */
const SAMPLES = { telugu: "తెలుగు అక్షరాలు అందంగా", devanagari: "सुंदर हिंदी अक्षर" };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 720, height: 240 } });
const fonts = [];
for (const f of order.map((name) => full.find((x) => x.name === name)).filter(Boolean)) {
  const indian = f.scripts.find((s) => SCRIPT_RANGES[s]);
  const unicodes = [LATIN, indian && SCRIPT_RANGES[indian]].filter(Boolean).join(",");
  const web = path.join(webDir, `${f.slug}.woff2`);
  execFileSync("pyftsubset", [f.sample, `--unicodes=${unicodes}`, "--layout-features=*", "--flavor=woff2", `--output-file=${web}`]);
  const url = "data:font/woff2;base64," + readFileSync(web).toString("base64");
  // Card image: the font's own name, as large as fits, in dark ink on a clear background.
  await page.setContent(`<style>@font-face{font-family:F;src:url(${url})}html,body{margin:0;background:transparent}
    div{width:720px;height:240px;display:flex;align-items:center;justify-content:center;font-family:F;color:#18181b;white-space:nowrap}</style><div id="t">${f.scripts.includes("telugu") ? "తెలుగు అక్షరాలు" : f.name}</div>`);
  await page.evaluate(async () => {
    await document.fonts.ready;
    const t = document.getElementById("t");
    let size = 96;
    t.style.fontSize = size + "px";
    const r = document.createRange();
    r.selectNodeContents(t);
    while ((r.getBoundingClientRect().width > 640 || r.getBoundingClientRect().height > 190) && size > 20) t.style.fontSize = --size + "px";
  });
  await page.screenshot({ path: path.join(cardDir, `${f.slug}.png`), omitBackground: true });
  fonts.push({
    name: f.name, slug: f.slug, designer: f.designer, category: f.category, license: f.license,
    weights: f.weights, italic: f.italic, variable: f.variable,
    scripts: f.scripts.filter((s) => !s.endsWith("-ext") && s !== "vietnamese"),
    sample: indian ? SAMPLES[indian] : null, files: f.files.length,
    zip: `/downloads/fonts/${f.slug}.zip`, size: statSync(path.join(root, `public/downloads/fonts/${f.slug}.zip`)).size,
  });
}
await browser.close();
writeFileSync(path.join(root, "src/data/fonts.json"), JSON.stringify(fonts, null, 1) + "\n");
console.log(`${fonts.length} fonts: web previews ${(fonts.reduce((n, f) => n + statSync(path.join(webDir, `${f.slug}.woff2`)).size, 0) / 1e6).toFixed(1)} MB`);
