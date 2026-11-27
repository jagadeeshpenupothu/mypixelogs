// Prints what today's logo should be: the least-used style, and the industries and names already used.
//   node scripts/logos/next.mjs
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const logos = JSON.parse(readFileSync(path.join(root, "src/data/logos.json"), "utf8"));
const src = readFileSync(path.join(root, "src/lib/logos.ts"), "utf8");
const styles = [...src.matchAll(/\{ slug: "([a-z-]+)", name: "([^"]+)", about: "([^"]+)" \}/g)].map(([, slug, name, about]) => ({ slug, name, about }));
const count = (s) => logos.filter((l) => l.style === s).length;
// Least used first; among equals, the one used longest ago, then list order.
const last = (s) => logos.filter((l) => l.style === s).map((l) => l.published).sort().pop() ?? "";
const style = styles.slice().sort((a, b) => count(a.slug) - count(b.slug) || last(a.slug).localeCompare(last(b.slug)))[0];
console.log(JSON.stringify({ style, total: logos.length, usedIndustries: [...new Set(logos.map((l) => l.industry))], usedNames: logos.map((l) => l.name), recentColours: logos.slice(-5).flatMap((l) => l.colors.map((c) => c.hex)) }, null, 1));
