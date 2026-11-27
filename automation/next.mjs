// Backlog helper for the daily template run. Prints only what the run needs, to save tokens.
//   node automation/next.mjs              -> next idea to build (highest score, still pending)
//   node automation/next.mjs --done SLUG  -> mark built
//   node automation/next.mjs --fail SLUG "reason" -> mark failed, so it is skipped
//   node automation/next.mjs --count      -> how many ideas are left
//   node automation/next.mjs --add '[{...}]' -> add ideas (skips slugs already present)
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const file = path.join(path.dirname(fileURLToPath(import.meta.url)), "backlog.json");
const backlog = JSON.parse(readFileSync(file, "utf8"));
const save = () => writeFileSync(file, `${JSON.stringify(backlog, null, 2)}\n`);
const today = new Date().toISOString().slice(0, 10);
const [cmd, slug, reason] = process.argv.slice(2);
const pending = () => backlog.filter((i) => i.status === "pending").sort((a, b) => b.score - a.score);

if (!cmd) {
  const next = pending()[0];
  console.log(next ? JSON.stringify(next) : "EMPTY");
} else if (cmd === "--count") {
  console.log(pending().length);
} else if (cmd === "--done" || cmd === "--fail") {
  const item = backlog.find((i) => i.slug === slug);
  if (!item) throw new Error(`No backlog item ${slug}`);
  item.status = cmd === "--done" ? "done" : "failed";
  item.date = today;
  if (reason) item.reason = reason;
  save();
  console.log(`${slug}: ${item.status}`);
} else if (cmd === "--add") {
  const known = new Set(backlog.map((i) => i.slug));
  const added = JSON.parse(slug).filter((i) => i.slug && !known.has(i.slug)).map((i) => ({ ...i, status: "pending" }));
  backlog.push(...added);
  save();
  console.log(`added ${added.length}`);
}
