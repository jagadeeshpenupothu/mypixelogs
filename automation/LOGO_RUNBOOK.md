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

4. Design `logos/<slug>.svg` by hand, like a senior brand designer. Slug: `<name>-<industry>-<style>-logo`, kebab-case.
   - `viewBox="0 0 1000 1000"` for symbols, emblems and badges; `0 0 1600 600` for wordmarks and side-by-side marks.
   - Only vector shapes: `path`, `circle`, `rect`, `ellipse`, `line`, `polygon`, `polyline`, gradients. No images, no filters
     (they don't survive in AI/EPS), no CSS classes, no `<tspan>`.
   - Every part in a top-level `<g data-name="...">` (e.g. Symbol, Ring, Name, Tagline, Stars); these become PSD layers.
   - Text: one line per `<text>` with `x`, `y`, `font-family` (any Google Font; 1–2 families), `font-size`, `font-weight`,
     optional `letter-spacing` and `text-anchor`, and `fill`. The build turns text into outlines.
   - 2–3 colours (one accent), strong contrast, readable at 64 px. Draw a real, distinctive symbol for the industry with
     clean geometry: symmetrical where it should be, consistent stroke widths, optical balance. Curved text on a badge:
     place each letter as its own `<text>` rotated around the centre with `transform="rotate(a 500 500)"`.
   - Avoid clichés done badly (generic swoosh, clip-art). Simple and memorable beats detailed.

5. Add an entry to `src/data/logos.json` (keep the array valid; newest last):
   `{"slug", "title": "<Name> <Industry> <Style> Logo", "name", "style": "<style slug>", "industry": "<Industry>",
   "description": "<140–200 chars: what it shows, who it suits, 'Editable AI, SVG, PSD, EPS and PNG.'>",
   "colors": [{"name", "hex"}], "fonts": [{"family", "weight"}], "previewBg": "<soft colour that suits the logo>",
   "published": "<today YYYY-MM-DD>", "keywords": ["<3–5 search phrases>"]}`

6. Build: `NODE_USE_ENV_PROXY=1 node --no-warnings scripts/logos/build.mjs <slug>`. It prints `"ok": false` with problems
   to fix, or `"ok": true`. Then Read `public/logos/<slug>/preview.png` and check like an art director: balanced, centred,
   nothing clipped, text spacing even, symbol clear and professional. Improve the SVG and rebuild (at most 3 tries).
   If it still doesn't look professional, delete the SVG, its entry and `public/logos/<slug>/`, and reply "skipped".

7. Check the site: `npx tsc --noEmit && npm run build 2>&1 | tail -3`. Fix only what you broke.

8. Publish: `git add -A`, commit `Add <title> (daily logo)` with the attribution lines from the system reminder, push the
   current branch, open a pull request into `main`, and merge it (merge method `merge`, pass `expectedHeadSha`).
   Netlify deploys `main` automatically.

9. Reply with 3 lines: logo name and style, page URL `https://mypixelogs.netlify.app/assets/logos/<slug>`, anything that failed.
