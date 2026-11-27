// Builds every format of a template from its spec, checks quality, and registers it on the site.
//
//   node scripts/templates/build.mjs <slug>      build one template (slug without .json)
//   node scripts/templates/build.mjs --register  only rebuild src/data/generated-templates.json
//
// Outputs: public/downloads/<slug>.{docx,xlsx,tex,pdf}, public/downloads/<slug>-canva.html,
// public/previews/<slug>.png, and automation/out/<slug>-google.docx (for the Google Docs upload).
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderDocx } from "./docx.mjs";
import { renderHtml } from "./html.mjs";
import { loadSpec, plain } from "./spec.mjs";
import { renderTex } from "./tex.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const specsDir = path.join(root, "automation/specs");
const downloads = path.join(root, "public/downloads");
const previews = path.join(root, "public/previews");
const outDir = path.join(root, "automation/out");
const registryFile = path.join(root, "src/data/generated-templates.json");

const run = (cmd, args) => execFileSync(cmd, args, { stdio: ["ignore", "pipe", "pipe"] }).toString();
const sha = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");

function toPdf(file, dir) {
  run("soffice", ["--headless", "-env:UserInstallation=file:///tmp/lo-mypixelogs", "--convert-to", "pdf", "--outdir", dir, file]);
  return path.join(dir, path.basename(file).replace(/\.[^.]+$/, ".pdf"));
}
const pages = (pdf) => Number(run("pdfinfo", [pdf]).match(/Pages:\s+(\d+)/)[1]);

function register() {
  const specs = existsSync(specsDir) ? readdirSync(specsDir).filter((f) => f.endsWith(".json")).sort() : [];
  const entries = specs.map((f) => {
    const s = loadSpec(path.join(specsDir, f));
    const p = s.platforms;
    const formats = ["Word", p.googleDocsId && "Google Docs", p.googleSheetsId && "Google Sheets", "Excel", p.canvaUrl && "Canva", "Overleaf (LaTeX)", "PDF"].filter(Boolean);
    return {
      id: s.slug.replace(/-template$/, ""),
      title: s.title,
      slug: s.slug,
      description: plain(s.description),
      category: s.category,
      features: s.features.map(plain),
      useCases: s.useCases.map(plain),
      formats,
      platforms: {
        ...(p.googleDocsId ? { googleDocsId: p.googleDocsId } : {}),
        ...(p.googleSheetsId ? { googleSheetsId: p.googleSheetsId } : {}),
        ...(p.canvaUrl ? { canvaUrl: p.canvaUrl } : {}),
        excelPath: `/downloads/${s.slug}.xlsx`,
        latexPath: `/downloads/${s.slug}.tex`,
        pdfPath: `/downloads/${s.slug}.pdf`,
      },
      published: s.published ?? null,
    };
  });
  writeFileSync(registryFile, `${JSON.stringify(entries, null, 2)}\n`);
  return entries.length;
}

async function build(slug) {
  const specFile = path.join(specsDir, `${slug.replace(/\.json$/, "")}.json`);
  const spec = loadSpec(specFile);
  if (spec.slug !== path.basename(specFile, ".json")) throw new Error(`File name must match slug "${spec.slug}"`);
  [downloads, previews, outDir].forEach((d) => mkdirSync(d, { recursive: true }));
  const tmp = path.join(outDir, `tmp-${spec.slug}`);
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });

  const file = (ext) => path.join(downloads, `${spec.slug}${ext}`);
  writeFileSync(file(".docx"), await renderDocx(spec, "word"));
  const googleDocx = path.join(outDir, `${spec.slug}-google.docx`);
  writeFileSync(googleDocx, await renderDocx(spec, "google"));
  writeFileSync(file(".tex"), renderTex(spec));
  writeFileSync(file("-canva.html"), renderHtml(spec));
  run("python3", [path.join(root, "scripts/templates/xlsx.py"), specFile, file(".xlsx")]);

  // PDF and preview come from the Word file, so they show exactly what people download.
  const pdf = toPdf(file(".docx"), tmp);
  writeFileSync(file(".pdf"), readFileSync(pdf));
  run("pdftoppm", ["-png", "-r", "120", "-scale-to-x", "992", "-scale-to-y", "1404", "-singlefile", file(".pdf"), path.join(previews, spec.slug)]);

  // ---- Quality checks ----
  const problems = [];
  const check = (ok, message) => { if (!ok) problems.push(message); };
  check(pages(file(".pdf")) === 1, `Word version is ${pages(file(".pdf"))} pages; it must fit on 1. Shorten the spec.`);
  check(pages(toPdf(googleDocx, tmp)) === 1, "Google Docs version runs over 1 page. Shorten the spec.");
  check(pages(toPdf(file(".xlsx"), tmp)) === 1, "Excel version runs over 1 page. Shorten the spec.");
  const text = run("pdftotext", [file(".pdf"), "-"]);
  const titleBlock = spec.blocks.find((b) => b.type === "header" || b.type === "title");
  check(text.includes(plain(titleBlock?.title ?? titleBlock?.text ?? spec.title).slice(0, 12)), "Title text missing from the PDF.");
  for (const bad of ["undefined", "NaN", "[object Object]", "**"]) check(!text.includes(bad), `Output contains "${bad}".`);
  // Quality bar: researched against real examples, and a full, usable page rather than a starter file.
  const refs = (spec.references ?? []).filter((u) => /^https:\/\/\S+$/.test(u));
  check(refs.length >= 3, `Add "references": at least 3 https links to real examples you studied (found ${refs.length}).`);
  check(typeof spec.research === "string" && spec.research.length >= 60, 'Add "research": 1-2 sentences on what the references have in common.');
  const lines = text.split("\n").filter((l) => l.trim().length > 2).length;
  check(lines >= 28, `The page looks thin (${lines} lines of text). Real versions have more: add the fields, terms and details the references show.`);
  check(spec.blocks.some((b) => b.type === "header"), 'Start with a "header" block (logo area, organisation details, document title and numbers), as professional documents do.');
  const others = existsSync(specsDir) ? readdirSync(specsDir).filter((f) => f.endsWith(".json") && f !== `${spec.slug}.json`) : [];
  for (const f of others) {
    const words = (s) => new Set(JSON.stringify(s.blocks).toLowerCase().match(/[a-z]{4,}/g));
    const a = words(spec);
    const b = words(JSON.parse(readFileSync(path.join(specsDir, f), "utf8")));
    const shared = [...a].filter((w) => b.has(w)).length / Math.max(a.size, 1);
    check(shared < 0.85, `Too similar to ${f} (${Math.round(shared * 100)}% same words). Make it clearly different.`);
  }
  rmSync(tmp, { recursive: true, force: true });

  const count = register();
  const result = {
    ok: problems.length === 0,
    problems,
    slug: spec.slug,
    templatesOnSite: count,
    googleUpload: {
      docs: { path: googleDocx, sha256: sha(googleDocx), mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
      sheets: { path: file(".xlsx"), sha256: sha(file(".xlsx")), mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
    },
  };
  console.log(JSON.stringify(result, null, 2));
  if (problems.length) process.exitCode = 1;
}

const arg = process.argv[2];
if (!arg) {
  console.error("Usage: node scripts/templates/build.mjs <slug> | --register");
  process.exit(2);
}
if (arg === "--register") console.log(`Registered ${register()} templates.`);
else await build(arg);
