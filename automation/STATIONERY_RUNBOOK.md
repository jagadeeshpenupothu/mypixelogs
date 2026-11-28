# Daily stationery run (business cards, letterheads, ID cards, C4 envelopes)

One new print-ready stationery template per day on https://mypixelogs.netlify.app/templates, published without asking.
Be brief: don't read files this runbook doesn't name, don't explore the repo, keep replies short.

## Steps

1. Setup: `cd` to the repo, `git fetch -q origin main && git checkout -q -B "$(git branch --show-current)" origin/main`,
   then `npm ci --silent`.

2. Pick: `node scripts/designs/next-stationery.mjs`. It prints today's `type` (size, category, whether it has a back)
   and a `logo` from our free logo library that no stationery has used yet (its brand name, industry, colours, fonts).
   Build the design for that brand, so the template looks like a real company's stationery. If `logo` is null, invent
   a fictional Indian business and draw a simple, elegant vector mark yourself.

3. Research (REQUIRED, 2 web searches): "<type> design <industry> <year>" and "premium <type> design trends <year>".
   Note what the best examples share (layout, hierarchy, finishes, colour use). Take ideas only, never copy a design.
   What each type must contain:
   - business-card (90 x 54 mm, front + back): front = name, job title, phone, email, website, address (with small
     icons); back = logo, a short tagline, website. Elegant hierarchy, lots of space, one accent.
   - letterhead (A4, one side): top band or header with the logo, company name and a contact strip (address, phone,
     email, website, GSTIN), a large empty writing area (at least 60% of the page; optionally a 6–8% opacity
     watermark of the mark), and a footer strip. Put a light sample "Date:" and "Ref:" line under the header.
   - id-card (CR80 portrait 54 x 85.6 mm, front + back): front = organisation logo and name band, a photo frame
     (vector placeholder with a person silhouette and "PHOTO"), name, designation, employee ID, department, blood
     group, valid until; back = "If found, please return to" with the address, emergency contact, a QR code, and an
     "Authorised signature" line. Use a lanyard slot shape at the top centre.
   - c4-envelope (324 x 229 mm landscape, front + back): front = logo and return address top-left, a clearly
     defined "To" address area lower-right (lines or a soft panel), a brand stripe or pattern along one edge; back =
     brand pattern or a large faint mark with the logo and website on the flap area (top band).

4. Draw the sides by hand as SVG: `designs/<slug>.svg` (front) and, when the type has a back, `designs/<slug>-back.svg`.
   Slug: `<brand>-<industry>-<type>`, e.g. `ravya-salon-letterhead`. Rules (the build checks them):
   - viewBox (10 units = 1 mm): business-card `0 0 960 600`, id-card `0 0 600 916`, letterhead `0 0 2100 2970`,
     c4-envelope `0 0 3240 2290`. Cards include 3 mm bleed (30 units) on every side: backgrounds must run to the
     edge, and all text and logos stay at least 80 units from the edge (5 mm inside the trim).
   - Every part in its own top-level `<g data-name="...">` (Background, Pattern, Logo, Name, Title, Phone, ...);
     each text line is one `<text>` in its own group (it becomes a live Photoshop text layer) with `x`, `y`,
     `font-family` (the logo's fonts or 1–2 Google Fonts), `font-size`, `font-weight`, optional `letter-spacing`,
     `text-anchor` and `fill`. No filters, no CSS classes.
   - The logo: `python3 scripts/designs/logo_asset.py <logo-slug> public/flyers/<slug>-logo.webp [--mark-only]` and
     place it with `<image href="/flyers/<slug>-logo.webp" ...>` at its printed aspect ratio. Use `--mark-only` when
     the logo sits on a dark background (it drops small dark taglines and the ground shadow).
   - Quality bar: premium printed stationery, not a basic template. Use the brand palette with a metallic or rich
     accent (gradients), refined patterns (thin-line art deco, waves, geometric or floral motifs at low opacity),
     consistent margins, a clear hierarchy, and real-looking Indian details (+91 98765 43210-style phones, .in
     domains, an Indian city address, GSTIN on letterheads). Icons are simple vector shapes (no brand logos).
   - Photos or textures are optional (e.g. a subtle paper or marble texture via `find-image.mjs`, credited); the
     ID card photo stays a vector placeholder.

5. Add an entry to `src/data/designs.json` (keep the array valid; newest last):
   `{"slug", "title": "<Style> <Industry> <Business Card|Letterhead|ID Card|Envelope> Template", "description":
   "<140–200 chars, what it is, who it suits, 'print-ready', 'Editable PSD, AI, SVG, CorelDRAW and PDF.'>",
   "category": "<type.category>", "size": "<type.size>", "back": <type.back>, "logo": "<logo-slug or omit>",
   "published": "<today>", "features": [3], "useCases": [3], "credits": [<photos/textures if any>]}`

6. Build: `NODE_USE_ENV_PROXY=1 node --no-warnings scripts/designs/build.mjs <slug>`. Fix any `"ok": false` problems.
   Read `public/previews/<slug>.png` (it shows the sides on a desk) and judge it like a print designer: would a real
   business order this? Nothing outside the safe zone, text readable at actual size (body text at least 7 pt =
   about 25 units on cards), no crowding, good contrast, front and back clearly one brand. Improve and rebuild
   (at most 3 tries). If it still isn't professional, delete its files and entry and reply "skipped: <reason>".

7. Check the site: `npx tsc --noEmit && npm run build 2>&1 | tail -3`. Fix only what you broke.

8. Publish: `git add -A`, commit `Add <title> (daily stationery)` with the attribution lines from the system reminder,
   push the current branch, open a pull request into `main`, and merge it (merge method `merge`, pass `expectedHeadSha`).

9. Reply with 3 lines: template name, page URL `https://mypixelogs.netlify.app/templates/<slug>`, anything that failed.
