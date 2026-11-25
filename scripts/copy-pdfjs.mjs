// Puts the PDF.js worker and its helper files in public/, so PDF tools load them from this site.
// pdfjs-dist is Apache-2.0. Source: https://github.com/mozilla/pdf.js
import { cpSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = path.join(root, "node_modules/pdfjs-dist");
const { version } = JSON.parse(readFileSync(path.join(pkg, "package.json"), "utf8"));
const target = path.join(root, "public/pdfjs", version);

mkdirSync(target, { recursive: true });
cpSync(path.join(pkg, "build/pdf.worker.min.mjs"), path.join(target, "pdf.worker.min.mjs"));
for (const dir of ["cmaps", "standard_fonts", "wasm", "iccs"]) {
  cpSync(path.join(pkg, dir), path.join(target, dir), { recursive: true });
}
cpSync(path.join(pkg, "LICENSE"), path.join(target, "LICENSE"));
console.log(`PDF.js ${version} copied to public/pdfjs/${version}`);
