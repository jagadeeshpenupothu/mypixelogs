// Generates one image with the OpenAI Images API (the key is added by the environment's network proxy).
//
//   NODE_USE_ENV_PROXY=1 node --no-warnings scripts/flyers/gen-image.mjs <out-file> --prompt "<text>"
//       [--size portrait|landscape|square] [--transparent] [--quality high|medium|low] [--model gpt-image-2]
//
// --transparent asks for a real alpha background (PNG), for people, products and overlays; without it the image
// fills the frame (JPEG), for backgrounds. Prints the output path and the size.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const out = process.argv[2];
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : fallback;
};
const prompt = arg("prompt");
if (!out || !prompt) {
  console.error('Usage: gen-image.mjs <out-file> --prompt "<text>" [--size portrait|landscape|square] [--transparent] [--quality high] [--model gpt-image-2]');
  process.exit(2);
}
const transparent = process.argv.includes("--transparent");
const size = { portrait: "1024x1536", landscape: "1536x1024", square: "1024x1024" }[arg("size", "portrait")] ?? arg("size");
const body = {
  // gpt-image-2 makes the best full scenes but has no transparency; gpt-image-1.5 supports a real alpha background.
  model: arg("model", transparent ? "gpt-image-1.5" : "gpt-image-2"),
  prompt,
  size,
  quality: arg("quality", "high"),
  n: 1,
  background: transparent ? "transparent" : "opaque",
  output_format: transparent ? "png" : "jpeg",
};
const res = await fetch("https://api.openai.com/v1/images/generations", {
  method: "POST",
  // The proxy replaces this placeholder with the saved key.
  headers: { "Content-Type": "application/json", Authorization: "Bearer proxy-injected" },
  body: JSON.stringify(body),
});
const data = await res.json();
if (!res.ok) {
  console.error(`OpenAI error ${res.status}: ${data.error?.message ?? JSON.stringify(data).slice(0, 300)}`);
  process.exit(1);
}
mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
writeFileSync(out, Buffer.from(data.data[0].b64_json, "base64"));
console.log(JSON.stringify({ ok: true, file: out, model: body.model, size, transparent, usage: data.usage ?? null }));
