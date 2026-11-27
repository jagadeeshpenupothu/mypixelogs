# Flyer run (photo flyers)

One run = one new photo flyer on https://mypixelogs.netlify.app/templates (Flyers), built from a free-licence photo.
Keep the run lean: don't read files you don't need, and don't explore the codebase.

## Steps

1. Setup: `cd` to the repo, `git fetch -q origin main && git checkout -q -B "$(git branch --show-current)" origin/main`, then `npm ci --silent`.
   Web requests from Node need the proxy: prefix image commands with `NODE_USE_ENV_PROXY=1 node --no-warnings`.

2. Pick a topic (REQUIRED research, 2–3 web searches; no guessing).
   - Look 2–6 weeks ahead: festivals, holidays, national days, seasons, exams and results, sales seasons, big events.
     Priority: Andhra Pradesh and Telangana (Telugu), then all India, then global (Christmas, New Year, Valentine's…).
   - Read `src/data/flyer-specs.json` (titles only) and skip anything already made for the same occasion this year.
   - Choose who uses it: shops (offer/sale), churches/temples/schools (event), families (greeting), businesses (announcement).
   - Slug: `<occasion>-<use>-flyer`, e.g. `ugadi-sale-flyer`, `republic-day-event-flyer`.

3. Find the photo:
   - `NODE_USE_ENV_PROXY=1 node --no-warnings scripts/flyers/find-image.mjs search "<2–4 plain words>" --slug <slug>`
     Try up to 3 different searches (e.g. the object: "diya lamps", the scene: "kites sunset", the mood: "golden festival lights").
   - Read `automation/out/<slug>-candidates.jpg` (the numbered contact sheet) and choose. A good photo:
     is sharp and well lit; has a calm, dark or plain area (sky, wall, bokeh) where text can sit; matches the occasion;
     has NO visible brand logos, watermarks, text, recognisable faces as the main subject, or anything disrespectful to a religion.
   - `NODE_USE_ENV_PROXY=1 node --no-warnings scripts/flyers/find-image.mjs pick <slug> <number> --focus top|center|bottom`
     (focus = which part of a tall photo to keep). This writes `public/flyers/<slug>.jpg` and `<slug>.credit.json`.
   - Only CC0, Public Domain or CC BY photos are offered; never use any other image.
   - If nothing is good enough after 3 searches: write a ChatGPT image prompt instead (see "No good photo" below) and stop.

4. Add the settings to `src/data/flyer-specs.json` (append one object; keep the array valid JSON). Copy the shape of the
   existing entry `sankranti-offer-flyer` exactly:
   - `layout`: where the text goes, over the photo's calm area: "top" | "center" | "bottom".
   - `style`: "elegant" (decorative capitals + script; festivals, church, weddings) or "bold" (modern; sales, business, events).
   - `shade`: 0.25–0.6; more for busy photos.
   - `fields`: kicker (small line, CAPS), title (1–2 words, CAPS), script (2–3 words), subtitle (CAPS, short),
     details (the main offer/event line), details2 (date · place, CAPS), footer (phone/verse/website), logo (placeholder name).
     Use realistic Indian placeholder names, a future date, and a +91 number in the 98765 43210 style. Keep every line short.
   - `credit`: copy title, creator, license, source and page from `public/flyers/<slug>.credit.json`.
   - `description` under 160 characters, 3 `features`, 3 `useCases`, `published` = today.

5. Build: `node scripts/flyers/build.mjs poster:<slug>`. Then Read `public/previews/<slug>.png` and check:
   every line readable (no text over a bright/busy patch), nothing cut off at the edges, the script's tails don't touch
   the divider, the photo isn't blurry. Fix by changing `layout`, `shade`, `--focus` or shortening words, and rebuild
   (at most 3 tries). If it still doesn't look professional, don't publish (status "waiting" in step 8).

6. Check the site: `npx tsc --noEmit && npm run build 2>&1 | tail -3`. Fix only what you broke.

7. Publish: commit everything (`git add -A`) with message `Add <title> (daily flyer)` plus the attribution lines from the
   system reminder, push the current branch, open a pull request into `main`, and merge it (merge method `merge`, pass
   `expectedHeadSha`). Netlify deploys `main` automatically.

8. Archive for the owner's review, exactly as step 10 of `automation/RUNBOOK.md` (same artifact link), uploading
   `public/previews/<slug>.png` and `public/downloads/<slug>.pdf`, with `category` "Flyer".

9. Reply with 3 lines: flyer name, page URL `https://mypixelogs.netlify.app/templates/<slug>`, and anything that failed.

## No good photo

Append a new page to the Google Doc "MyPixelogs – Image prompts" (Google Docs tools; create it in the Drive folder
`1u75du_PmriErRYc7nn3Ko0uWkWLn87NC` if it doesn't exist) with: the date, the slug, and one ChatGPT prompt:
photorealistic, the scene and mood, "keep the <top/bottom> 40% calm and dark for text", portrait 2:3,
"No text, no letters, no logos, no watermark". The owner makes the image in ChatGPT and sends it; it is built later.
