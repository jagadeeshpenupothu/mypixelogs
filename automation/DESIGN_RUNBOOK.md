# Daily Pinterest-inspired design run

One new professional flyer / poster / pamphlet per day on https://mypixelogs.netlify.app/templates, inspired by a
Pinterest pin the owner picked, published without asking. Be brief: don't read files this runbook doesn't name,
don't explore the repo, keep replies short.

## Steps

1. Setup: `cd` to the repo, `git fetch -q origin main && git checkout -q -B "$(git branch --show-current)" origin/main`,
   then `npm ci --silent && pip install -q "rembg[cpu]"`.

2. Take the next reference. Read the Google Doc "MyPixelogs – Pinterest references"
   (ID `1X3Udh5OOrTIg1OjwnUlBj9yIe68_PFe3EdwzJCAKKzo`) and take the FIRST Pinterest link under "LINKS".
   If there is none, reply "No Pinterest links in the Doc" and stop.

3. Open the pin (only that one link; never search or browse Pinterest):
   `curl -sL -A "Mozilla/5.0" "<link>" -o automation/out/pin.html`, take the `og:image` URL (or the first
   `https://i.pinimg.com/originals/...jpg`) and the `<title>`, download the image to `automation/out/pin.jpg`, and Read it.
   If the pin can't be opened, write "could not open" after the link in the Doc and go to the next link.
   Study it like a senior designer and note: layout grid and focal point, headline/sub/body hierarchy, font styles,
   colour palette and mood, how the photo is used (cut-out, full-bleed, blurred), and the tricks that make it
   professional (depth, overlap, UI elements, light, texture, whitespace).

4. Plan an ORIGINAL design with that level of craft. Keep the ideas, not the content:
   - Pick a business or occasion useful to Indian small businesses (the pin's own topic is fine if it is generic,
     e.g. "restaurant offer"); invent a business name, write new text, choose your own colours (same mood is fine).
   - NEVER copy the pin's text, logo, brand names, photos or exact composition, never use real brand logos
     (no Google/Instagram marks; draw generic icons), and never put the pin image into `public/`.
   - Category: "flyer" for offers, events, services; "poster" for big-headline promotional posters.
   - Slug: `<topic>-<use>-flyer` or `-poster`, kebab-case, not already in `src/data/designs.json`.

5. Photos: REQUIRED. Every design is built around 1–2 real photographic images (a person, product, food, place)
   with vector shapes only for panels, buttons, icons and decoration. An all-vector design is not allowed: it looks
   like a basic drawing. Get the photos from Canva AI (Canva connector), at most 3 images per design:
   a. `generate-image` with a detailed photo prompt: subject, Indian context where people appear, pose, clothing,
      plain or softly blurred background in the palette colour (so it blends), studio or natural light, lens,
      "photorealistic commercial advertising photography, sharp, high resolution, no text, no logos".
      Choose `aspectRatio` to match where it goes (PORTRAIT_3_4 / PORTRAIT_4_5 for a hero, SQUARE_1_1 for a product).
      Poll `get-generate-image-job` (wait about 15 s between polls) until SUCCESS; note the media id.
   b. Look at the thumbnail. Reject warped hands or faces, extra fingers, stray text or logos, and try again with a
      better prompt (this counts towards the 3 images).
   c. To get the full-size file: `create-design` with brief "A single page that contains only the referenced photo,
      filling the whole page edge to edge. No text, no shapes, no other elements, no borders.", a `format` with the
      same orientation (e.g. "Instagram Post (Portrait)"), and `references: [<media id>]`; poll
      `get-create-design-async-job`; then `export-design` with `{"type": "png"}` (if it says "not allowed", call
      `get-export-formats` once and export again). Download the URL with curl to `automation/out/<slug>-<n>.png`
      and Read it to check that it is only the photo.
   d. Prepare it in Python (Pillow): upscale to about 2160 px wide with LANCZOS and a light UnsharpMask, and save as
      `public/flyers/<slug>-<n>.jpg` (quality 88). Where the photo meets a flat background in the design, bake a
      soft fade into the photo instead (an alpha ramp over the top/side 15%) and save it as `.webp`; SVG masks don't
      survive in the AI/PDF. For a cut-out: `python3 scripts/flyers/cutout.py <png> public/flyers/<slug>-<n>.webp`
      and Read the `-check.jpg`.
   e. Credit each image as `{"creator": "Generated with Canva AI for MyPixelogs", "license": "Free to use", "source": "Canva"}`.
   If Canva is unavailable or its monthly AI limit is used up, use free photos instead:
   `NODE_USE_ENV_PROXY=1 node --no-warnings scripts/flyers/find-image.mjs search "<2–4 words>" --slug <slug>-1
   [--sources wordpress]`, Read the contact sheet, then `... pick <slug>-1 <n> --focus top|center|bottom` (originals at
   least 1500 px on the short side; credit from `public/flyers/<slug>-1.credit.json`). If neither gives a good photo,
   write "skipped: no photo" after the link in the Doc and stop; never publish an all-vector design.

6. Design `designs/<slug>.svg` by hand, A4 portrait `viewBox="0 0 1240 1754"`. Quality bar: it must look like the
   pin's level (agency-made, ready to post), never flat or empty:
   - a clear focal point, strong hierarchy (one huge headline, a supporting line, 2–4 details), generous margins (≥ 70),
     a consistent spacing rhythm, aligned edges;
   - depth: gradients, soft shadow shapes (semi-transparent dark shapes, not filters), overlapping layers, a light source;
   - the photos are the heart of the design: big, well lit, blending into the background colour, with cut-outs
     overlapping shapes and text like the reference; place with `<image href="/flyers/<file>" x y width height
     preserveAspectRatio="xMidYMid slice">`, inside a `clipPath` for rounded/circle crops;
   - 1–2 Google Fonts with character; realistic Indian details (₹ prices, a future date, a +91 98765 43210-style
     phone, a .in website or @handle);
   - every part in its own top-level `<g data-name="...">` (Background, Photo, Headline 1, Button, ...); each text
     line is one `<text>` in its own group (it becomes a live Photoshop text layer) with `x`, `y`, `font-family`,
     `font-size`, `font-weight`, optional `letter-spacing`, `text-anchor`, `fill`. No filters, no CSS classes.

7. Add an entry to `src/data/designs.json` (keep the array valid; newest last):
   `{"slug", "title": "<Topic> <Flyer|Poster> Template", "description": "<140–200 chars, what it is, who it suits,
   'Editable PSD, AI, SVG, CorelDRAW and PDF.'>", "category": "flyer"|"poster", "published": "<today>",
   "features": [3], "useCases": [3], "credits": [{"creator", "license", "source", "page"} per photo]}`

8. Build: `NODE_USE_ENV_PROXY=1 node --no-warnings scripts/designs/build.mjs <slug>`. Fix any `"ok": false` problems.
   Read `public/previews/<slug>.png` and compare it side by side with `automation/out/pin.jpg`: is it at the same
   professional level? Nothing cut off, no text over busy areas, no empty dead zones, no overlapping text, good
   contrast. Improve and rebuild (at most 3 tries). If it still isn't good, don't publish: delete its files and entry,
   write "skipped: <reason>" after the link in the Doc, and stop.

9. Check the site: `npx tsc --noEmit && npm run build 2>&1 | tail -3`. Fix only what you broke.

10. Publish: `git add -A`, commit `Add <title> (daily design)` with the attribution lines from the system reminder,
    push the current branch, open a pull request into `main`, and merge it (merge method `merge`, pass `expectedHeadSha`).

11. Remove the used link from the Doc: `update_doc` with one `replaceAllText` request replacing the exact link text
    with "" (no revision guard needed for replaceAllText).

12. Reply with 3 lines: design name, page URL `https://mypixelogs.netlify.app/templates/<slug>`, anything that failed.
