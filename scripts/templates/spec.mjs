// Reads and checks a template spec (automation/specs/<slug>.json).
// A spec describes one document as a list of blocks; every output format is drawn from it.
import { readFileSync } from "node:fs";

export const CATEGORIES = ["resume", "invoice", "receipt", "letter", "certificate", "business", "letterhead"];
const BLOCKS = ["header", "title", "contact", "heading", "text", "entry", "bullets", "fields", "table", "columns", "parties", "note", "signature", "spacer"];

export function loadSpec(path) {
  const spec = JSON.parse(readFileSync(path, "utf8"));
  const problems = [];
  const need = (ok, message) => { if (!ok) problems.push(message); };

  need(/^[a-z0-9-]+-template$/.test(spec.slug ?? ""), "slug must be lowercase words ending in -template");
  need(typeof spec.title === "string" && spec.title.length > 5, "title is required");
  need(CATEGORIES.includes(spec.category), `category must be one of ${CATEGORIES.join(", ")}`);
  need(typeof spec.description === "string" && spec.description.length >= 80, "description needs 80+ characters");
  need(Array.isArray(spec.features) && spec.features.length === 3, "features needs exactly 3 items");
  need(Array.isArray(spec.useCases) && spec.useCases.length === 3, "useCases needs exactly 3 items");
  need(Array.isArray(spec.blocks) && spec.blocks.length >= 4, "blocks needs 4+ items");
  (spec.blocks ?? []).forEach((block, i) => {
    need(BLOCKS.includes(block.type), `block ${i}: unknown type "${block.type}"`);
    if (block.type === "table") {
      need(Array.isArray(block.columns) && block.columns.length >= 2 && block.columns.length <= 7, `block ${i}: table needs 2-7 columns`);
      (block.rows ?? []).forEach((row, r) => need(row.length === block.columns.length, `block ${i}: row ${r} has ${row.length} cells, expected ${block.columns.length}`));
    }
    if (block.type === "header") need(typeof block.title === "string" && block.title.length > 1, `block ${i}: header needs a title`);
    if (block.type === "parties") need(Array.isArray(block.groups) && block.groups.length >= 2 && block.groups.length <= 3 && block.groups.every((g) => g.heading && Array.isArray(g.lines)), `block ${i}: parties needs 2-3 groups of {heading, lines[]}`);
    if (block.type === "note") need(typeof block.text === "string" || Array.isArray(block.text), `block ${i}: note needs text`);
    if (block.type === "columns") need(block.groups?.length >= 1 && block.groups.length <= 3, `block ${i}: columns needs 1-3 groups`);
    if (block.type === "fields") need(Array.isArray(block.items) && block.items.every((it) => Array.isArray(it) && it.length === 2), `block ${i}: fields items are [label, value] pairs`);
  });
  if (problems.length) throw new Error(`Spec ${path} has problems:\n- ${problems.join("\n- ")}`);

  spec.accent = (spec.accent ?? "1B2F5B").replace("#", "").toUpperCase();
  spec.platforms ??= {};
  return spec;
}

/** Splits "Normal **bold** normal" into [[text, bold], ...]. */
export function parts(text) {
  return String(text ?? "")
    .split(/(\*\*[^*]+\*\*)/)
    .filter(Boolean)
    .map((piece) => (piece.startsWith("**") && piece.endsWith("**") ? [piece.slice(2, -2), true] : [piece, false]));
}

export const plain = (text) => String(text ?? "").replace(/\*\*/g, "");
