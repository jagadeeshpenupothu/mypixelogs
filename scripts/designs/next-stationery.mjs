// Picks today's stationery design: the type made least so far, and a logo from our library that no stationery used yet.
//   node scripts/designs/next-stationery.mjs
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const designs = JSON.parse(readFileSync(path.join(root, "src/data/designs.json"), "utf8"));
const logos = JSON.parse(readFileSync(path.join(root, "src/data/logos.json"), "utf8"));
const TYPES = [
  { size: "business-card", category: "business-card", back: true },
  { size: "letterhead", category: "letterhead", back: false },
  { size: "id-card", category: "id-card", back: true },
  { size: "c4-envelope", category: "envelope", back: true },
];
const made = (t) => designs.filter((d) => d.size === t.size).length;
const lastSize = designs.filter((d) => TYPES.some((t) => t.size === d.size)).at(-1)?.size;
const type = TYPES.filter((t) => t.size !== lastSize).sort((a, b) => made(a) - made(b))[0];
const usedLogos = new Set(designs.map((d) => d.logo).filter(Boolean));
const logo = logos.filter((l) => !usedLogos.has(l.slug)).at(-1) ?? null;
console.log(JSON.stringify({ type, logo: logo && { slug: logo.slug, name: logo.name, industry: logo.industry, colors: logo.colors, fonts: logo.fonts }, madeSoFar: Object.fromEntries(TYPES.map((t) => [t.size, made(t)])) }, null, 1));
