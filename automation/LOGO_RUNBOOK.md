# Daily logo run

One new free logo per day on https://mypixelogs.netlify.app/assets/logos, published without asking.
Be brief: don't read files this runbook doesn't name, don't explore the repo, keep replies short.

## Steps

1. Setup: `cd` to the repo, `git fetch -q origin main && git checkout -q -B "$(git branch --show-current)" origin/main`,
   then `npm ci --silent`.

2. Pick: `node scripts/logos/next.mjs`. It prints today's `style` (use it) plus industries, names and colours already used.
   Choose ONE industry not in `usedIndustries`, preferring businesses that need logos often in India: restaurants, cafes,
   bakeries, salons, clinics, dental, pharmacy, gyms, yoga, schools, coaching, tuition, real estate, construction,
   interiors, architects, textiles, boutiques, jewellery, photography, events, weddings, travel, logistics, IT services,
   startups, finance, CA firms, law, agriculture, dairy, organic food, temples and churches (respectfully), NGOs, sports.
   Invent a short, fictional, easy-to-say business name (not in `usedNames`, not a known brand) and a 2–3 word tagline.

3. Research (REQUIRED, 2 web searches): "<industry> logo design <style>" and "<style> logo design trends <year>".
   Note what makes strong logos of this style and industry (shapes, symbols, type, colours). Take ideas only:
   never copy or trace an existing logo, and never use real brand names or marks.

4. Design `logos/<slug>.svg` by hand, like a senior brand designer making a PREMIUM logo people want to download.
   Flat, minimal, one- or two-colour logos are NOT acceptable. Slug: `<name>-<industry>-<style>-logo`, kebab-case.

   Look and quality (aim for what sells on top logo marketplaces: rich, dimensional, polished):
   - Depth in every logo, built only from vectors:
     - metallic or glossy gradients (gold, silver, rose gold, copper, chrome: 4–6 stops light/dark/light);
     - a soft highlight (gloss) shape across the top;
     - darker gradient edges, inner and outer rings, bevel-like double strokes (light + dark);
     - cast shadows drawn as semi-transparent dark shapes, long shadows, overlapping translucent shapes;
     - a soft ground shadow ellipse under badges.
   - A detailed, illustrative symbol drawn for the industry (not a basic icon): 3–5 tones of the palette, light
     direction from the top left, highlights and shadows on the forms, fine details (steam, leaves, sparkles, lines,
     textures, stars), and clean, symmetrical geometry where it should be.
   - Use the style's typical ornaments: ribbons/banners with folded ends and shading, laurels, stars, ornamental
     dividers, shields, sunbursts, frames, "EST." lines. Wordmarks and lettermarks also need depth: a gradient fill,
     an offset darker copy below as a 3D shadow, an inline or a second-colour accent, and a crafted symbol or ligature.
   - Colour: 3–5 colours, one rich accent; strong contrast; it must still read at 64 px.
   - Typography: 1–2 Google Fonts with character (display serif, slab, script, condensed or geometric to match the
     industry), well kerned, with letter-spacing on small caps lines.

   Technical rules (the build checks them):
   - `viewBox="0 0 1000 1000"` for symbols, emblems, badges and mascots; `0 0 1600 700` for wordmarks and side-by-side marks.
   - Vectors only: `path`, `circle`, `rect`, `ellipse`, `polygon`, `line`, linear/radial gradients (in `<defs>`),
     `clipPath`, `mask`, `opacity`. NO `<image>`, NO filters (blur, drop shadow), NO CSS classes.
   - Every part in a top-level `<g data-name="...">` with a clear name (Shadow, Outer ring, Badge, Gloss, Symbol,
     Ribbon, Name, Tagline...); these become the PSD layers.
   - TEXT MUST STAY EDITABLE. Never draw letters as paths and never split a word into single letters.
     - Straight text: one `<text>` per line, in its OWN `<g data-name>` (it becomes a live Photoshop text layer),
       with `x`, `y`, `font-family`, `font-size`, `font-weight`, optional `letter-spacing`, `text-anchor`,
       `fill` (a colour or a gradient) and `stroke`.
     - Curved text (badges, emblems): ONE `<text>` with `<textPath href="#arcId" startOffset="50%" text-anchor="middle">`
       along an arc `<path id="arcId">` in `<defs>` (top arc drawn left to right; bottom arc drawn right to left so
       it reads upright).
     - A 3D text shadow is a second `<text>` with the same words in its own group ("Name shadow"), offset 4–8 px,
       in a dark colour.

5. Add an entry5. Add an entry to `src/data/logos.json` (keep the array valid; newest last):
   `{"slug", "title": "<Name> <Industry> <Style> Logo", "name", "style": "<style slug>", "industry": "<Industry>",
   "description": "<140–200 chars: what it shows, who it suits, 'Editable AI, SVG, PSD, EPS and PNG.'>",
   "colors": [{"name", "hex"}], "fonts": [{"family", "weight"}], "previewBg": "<soft colour that suits the logo>",
   "published": "<today YYYY-MM-DD>", "keywords": ["<3–5 search phrases>"]}`

6. Build: `NODE_USE_ENV_PROXY=1 node --no-warnings scripts/logos/build.mjs <slug>`. It prints `"ok": false` with problems
   to fix, or `"ok": true` (check `liveTextLayers` is at least 1). Then Read `public/logos/<slug>/preview.png` and judge
   it like an art director against this question: "Would a business owner pick this over the logos on Freepik or
   Envato?" It must look rich and dimensional (not flat), balanced and centred, with nothing clipped, curved text
   evenly spaced and not touching rings, and a clear, crafted symbol. Improve the SVG and rebuild (at most 3 tries).
   If it still doesn't look professional, delete the SVG, its entry and `public/logos/<slug>/`, and reply "skipped".

7. Check the site: `npx tsc --noEmit && npm run build 2>&1 | tail -3`. Fix only what you broke.

8. Publish: `git add -A`, commit `Add <title> (daily logo)` with the attribution lines from the system reminder, push the
   current branch, open a pull request into `main`, and merge it (merge method `merge`, pass `expectedHeadSha`).
   Netlify deploys `main` automatically.

9. Reply with 3 lines: logo name and style, page URL `https://mypixelogs.netlify.app/assets/logos/<slug>`, anything that failed.
