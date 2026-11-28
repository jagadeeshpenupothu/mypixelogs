#!/usr/bin/env -S node
// Run with NODE_USE_ENV_PROXY=1 where traffic goes through a proxy (cloud sessions); npm run flyer:image does this.
// Finds free-licence photos for a flyer, shows the best ones, and saves the chosen photo with its licence.
//
//   node scripts/flyers/find-image.mjs search "diwali diya lamps" [--slug diwali-offer] [--sources stocksnap,wordpress,rawpixel]
//       → lists candidates and writes automation/out/<slug>-candidates.jpg (a numbered contact sheet to look at)
//   node scripts/flyers/find-image.mjs pick <slug> <number> [--focus top|center|bottom]
//       → downloads that candidate, crops it to A4 (2480 x 3508) into public/flyers/<slug>.jpg
//         and records the licence in public/flyers/<slug>.credit.json
//
// Only licences that let us change the photo and share it freely are used:
// CC0, Public Domain Mark and CC BY (credit the creator). Share-alike, non-commercial and no-derivatives are skipped.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outDir = path.join(root, "automation/out");
const flyerDir = path.join(root, "public/flyers");
const UA = "MyPixelogs-flyer-bot/1.0 (https://mypixelogs.netlify.app)";
const MIN_SIDE = 1500;

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : fallback;
};
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
const getJson = async (url) => {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} from ${new URL(url).host}`);
  return res.json();
};

async function openverse(q) {
  // --sources stocksnap,wordpress,rawpixel keeps to modern stock photos (people, products, food) and skips museum scans.
  const sources = arg("sources", "");
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&license=cc0,pdm,by&size=large&page_size=20&mature=false${sources ? `&source=${encodeURIComponent(sources)}` : ""}`;
  const d = await getJson(url).catch((e) => (console.error("Openverse:", e.message), { results: [] }));
  return d.results.map((r) => ({
    source: `Openverse · ${r.source}`,
    url: r.url,
    thumb: r.thumbnail,
    width: r.width ?? 0,
    height: r.height ?? 0,
    license: r.license === "by" ? `CC BY ${r.license_version ?? ""}`.trim() : r.license === "pdm" ? "Public Domain Mark" : "CC0",
    creator: r.creator ?? "",
    page: r.foreign_landing_url ?? r.url,
    title: r.title ?? "",
  }));
}

async function wikimedia(q) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=40&gsrsearch=${encodeURIComponent(q)}&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=400`;
  const d = await getJson(url).catch((e) => (console.error("Wikimedia:", e.message), {}));
  const ok = /^(cc0|public domain|pd|cc by \d(\.\d)?|cc-by-\d(\.\d)?)$/i;
  return Object.values(d.query?.pages ?? {})
    .map((p) => {
      const i = p.imageinfo?.[0] ?? {};
      const m = i.extmetadata ?? {};
      const license = String(m.LicenseShortName?.value ?? "");
      return {
        source: "Wikimedia Commons",
        url: i.url,
        thumb: i.thumburl,
        width: i.width ?? 0,
        height: i.height ?? 0,
        license,
        creator: String(m.Artist?.value ?? "").replace(/<[^>]+>/g, "").trim(),
        page: i.descriptionurl,
        title: p.title?.replace(/^File:/, "") ?? "",
      };
    })
    .filter((c) => ok.test(c.license.trim()) && /\.(jpe?g|png)$/i.test(c.url ?? ""));
}

/** Big enough to print, public domain first, then closest to a portrait page. */
function rank(list) {
  return list
    .filter((c) => c.url && Math.min(c.width, c.height) >= MIN_SIDE)
    .map((c) => {
      const ratio = c.height / c.width;
      const licenceScore = /cc0|public domain/i.test(c.license) ? 2 : 1;
      const shapeScore = ratio >= 1.2 ? 2 : ratio >= 0.9 ? 1 : 0;
      return { ...c, score: licenceScore * 10 + shapeScore * 3 + Math.min(c.width * c.height, 24e6) / 8e6 };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
}

async function download(url, file) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

const py = (code, ...args) => execFileSync("python3", ["-c", code, ...args], { stdio: ["ignore", "pipe", "inherit"] }).toString();

const [mode, a, b] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });

if (mode === "search") {
  const q = a;
  const slug = arg("slug", slugify(q));
  const list = rank([...(await openverse(q)), ...(arg("sources", "") ? [] : await wikimedia(q))]);
  writeFileSync(path.join(outDir, `${slug}-candidates.json`), JSON.stringify({ query: q, candidates: list }, null, 2));
  if (!list.length) {
    console.log(`No free-licence photos large enough for "${q}". Try other words, or use the ChatGPT prompt route.`);
    process.exit(1);
  }
  // Contact sheet: numbered thumbnails to look at before choosing.
  const thumbs = [];
  for (const [i, c] of list.entries()) {
    const f = path.join(outDir, `${slug}-thumb-${i + 1}.jpg`);
    try {
      await download(c.thumb || c.url, f);
      thumbs.push(f);
    } catch {
      // Some thumbnail servers refuse; fall back to the full image (the sheet shrinks it).
      try {
        await download(c.url, f);
        thumbs.push(f);
      } catch {
        thumbs.push("");
      }
    }
  }
  py(
    `import sys
from PIL import Image, ImageDraw
files=sys.argv[2:]; W,H=300,300; cols=4; rows=(len(files)+cols-1)//cols
sheet=Image.new('RGB',(cols*W,rows*(H+30)),'white'); d=ImageDraw.Draw(sheet)
for i,f in enumerate(files):
  x,y=(i%cols)*W,(i//cols)*(H+30)
  if f:
    try:
      im=Image.open(f).convert('RGB'); im.thumbnail((W-10,H-10)); sheet.paste(im,(x+5,y+5))
    except Exception: pass
  d.text((x+8,y+H+6),f'#{i+1}',fill='black')
sheet.save(sys.argv[1],quality=85)`,
    path.join(outDir, `${slug}-candidates.jpg`),
    ...thumbs,
  );
  list.forEach((c, i) => console.log(`#${i + 1}  ${c.width}x${c.height}  ${c.license}  ${c.source}  ${c.title.slice(0, 50)}`));
  console.log(`\nLook at automation/out/${slug}-candidates.jpg, then: node scripts/flyers/find-image.mjs pick ${slug} <number>`);
} else if (mode === "pick") {
  const slug = a;
  const n = Number(b);
  const data = JSON.parse(readFileSync(path.join(outDir, `${slug}-candidates.json`), "utf8"));
  const c = data.candidates[n - 1];
  if (!c) throw new Error(`No candidate #${n}`);
  mkdirSync(flyerDir, { recursive: true });
  const raw = path.join(outDir, `${slug}-original${path.extname(new URL(c.url).pathname) || ".jpg"}`);
  await download(c.url, raw);
  const focus = arg("focus", "center");
  // Cover-crop to A4 portrait at 300 dpi; "focus" keeps the top, middle or bottom of tall photos.
  py(
    `import sys
from PIL import Image, ImageFilter
im=Image.open(sys.argv[1]).convert('RGB'); W,H=2480,3508; focus=sys.argv[3]
s=max(W/im.width,H/im.height); im=im.resize((round(im.width*s),round(im.height*s)),Image.LANCZOS)
x=(im.width-W)//2; y={'top':0,'bottom':im.height-H}.get(focus,(im.height-H)//2)
im=im.crop((x,y,x+W,y+H))
if s>1.2: im=im.filter(ImageFilter.UnsharpMask(radius=2,percent=50,threshold=3))
im.save(sys.argv[2],quality=86,optimize=True,progressive=True)`,
    raw,
    path.join(flyerDir, `${slug}.jpg`),
    focus,
  );
  const credit = { title: c.title, creator: c.creator, license: c.license, source: c.source, page: c.page, original: c.url, query: data.query, downloaded: new Date().toISOString().slice(0, 10) };
  writeFileSync(path.join(flyerDir, `${slug}.credit.json`), JSON.stringify(credit, null, 2) + "\n");
  console.log(`Saved public/flyers/${slug}.jpg (2480x3508) and its licence: ${c.license} — ${c.creator || "unknown creator"}`);
} else {
  console.error('Usage: find-image.mjs search "<words>" [--slug s]  |  find-image.mjs pick <slug> <number> [--focus top|center|bottom]');
  process.exit(2);
}
