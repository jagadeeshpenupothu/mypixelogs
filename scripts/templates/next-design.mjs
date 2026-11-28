// Suggests a design for the next template: for each dimension, the option used least (and not used last time),
// so consecutive templates look clearly different.   node scripts/templates/next-design.mjs [category]
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FONTS, HEADERS, HEADINGS, PALETTES, TABLES } from "./design.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const dir = path.join(root, "automation/specs");
const specs = readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => ({ f, t: statSync(path.join(dir, f)).mtimeMs, s: JSON.parse(readFileSync(path.join(dir, f), "utf8")) }))
  .sort((a, b) => (a.s.published ?? "").localeCompare(b.s.published ?? "") || a.t - b.t);
// Older templates (no "design") all have the original look: count them as that, so new ones move away from it.
const legacy = (s) => ({ palette: "navy", font: "classic", header: s.blocks?.find((b) => b.type === "header")?.style === "plain" ? "plain" : "band", table: "solid", heading: "rule" });
const designed = specs.map((x) => x.s.design ?? legacy(x.s));
const last = designed.at(-1) ?? {};
const category = process.argv[2] ?? "";
// Some styles suit some documents better; they are preferred when tied.
const prefer = {
  certificate: { header: ["centered", "topbar"], font: ["elegant", "editorial", "formal", "classic"], heading: ["caps", "rule"] },
  letter: { header: ["plain", "topbar", "centered"], font: ["classic", "elegant", "formal", "modern"], heading: ["rule", "caps"] },
  resume: { header: ["plain", "topbar", "split"], font: ["modern", "elegant", "mixed", "corporate"], heading: ["bar", "caps", "shade", "rule"] },
  invoice: { header: ["band", "split", "topbar"], font: ["modern", "corporate", "mixed"], table: ["solid", "tint", "minimal"] },
  receipt: { header: ["band", "split", "topbar"], font: ["modern", "corporate"] },
  business: { header: ["split", "band", "topbar", "plain"] },
  letterhead: { header: ["centered", "split", "topbar"] },
}[category] ?? {};
const pick = (key, options) => {
  const count = (o) => designed.filter((d) => d[key] === o).length;
  const pref = prefer[key] ?? [];
  return options.filter((o) => o !== last[key]).sort((a, b) => count(a) - count(b) || (pref.includes(a) ? pref.indexOf(a) : 99) - (pref.includes(b) ? pref.indexOf(b) : 99))[0];
};
console.log(JSON.stringify({ design: { palette: pick("palette", Object.keys(PALETTES)), font: pick("font", Object.keys(FONTS)), header: pick("header", HEADERS), table: pick("table", TABLES), heading: pick("heading", HEADINGS) }, previous: last }));
