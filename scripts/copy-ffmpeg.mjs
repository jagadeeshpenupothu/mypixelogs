// Puts the FFmpeg.wasm engine in public/, so the Video Trimmer loads it from this site.
// @ffmpeg/core is GPL-2.0-or-later (it includes x264). Source: https://github.com/ffmpegwasm/ffmpeg.wasm
import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const modules = path.join(root, "node_modules/@ffmpeg");
const { version } = JSON.parse(readFileSync(path.join(modules, "core/package.json"), "utf8"));
const target = path.join(root, "public/ffmpeg", version);

mkdirSync(target, { recursive: true });
for (const file of ["ffmpeg-core.js", "ffmpeg-core.wasm"]) cpSync(path.join(modules, "core/dist/esm", file), path.join(target, file));
for (const file of ["worker.js", "const.js", "errors.js"]) cpSync(path.join(modules, "ffmpeg/dist/esm", file), path.join(target, file));
writeFileSync(
  path.join(target, "NOTICE.txt"),
  `ffmpeg-core ${version} is licensed under GPL-2.0-or-later and contains FFmpeg, x264 and other libraries.\nSource code: https://github.com/ffmpegwasm/ffmpeg.wasm/tree/v${version}\n`,
);
console.log(`FFmpeg ${version} copied to public/ffmpeg/${version}`);
