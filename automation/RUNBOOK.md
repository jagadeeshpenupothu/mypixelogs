# Daily template run

One new template per day, published to https://mypixelogs.netlify.app without asking.
Be brief: don't read files this runbook doesn't name, don't explore the repo, keep replies short.

## Steps

1. Setup: `cd` to the repo, `git fetch -q origin main && git checkout -q -B "$(git branch --show-current)" origin/main`, then `npm ci --silent && python3 -m pip install -q openpyxl`.
2. Pick: `node automation/next.mjs`. It prints one idea as JSON (`slug`, `title`, `category`, `keyword`, `notes`).
   - If it prints `EMPTY` or `node automation/next.mjs --count` is below 5, first add 15 ideas (see "Refilling").
3. Research (optional, at most 2 web searches): only if `notes` doesn't already say what the document must contain.
4. Write `automation/specs/<slug>.json`. Copy the shape of `automation/specs/rent-receipt-template.json` (read only that one file). Rules:
   - Write it compactly: one block per line, like the example.
   - Sample values in `[brackets]`; bold with `**text**`; Indian context (₹, GST, PAN, DD/MM/YYYY) unless the idea says otherwise.
   - Fit on ONE A4 page: about 35 short lines in total. No more than 9 table rows.
   - `description` 140–220 characters, includes the search keyword and "Word, Google Docs, Google Sheets, Excel or Overleaf".
   - Set `"published": "<today YYYY-MM-DD>"`. Leave `platforms` out.
   - Block types: `title` {text, subtitle?, align?}, `contact` {items[], rule?}, `heading` {text}, `text` {text or [text], align?},
     `entry` {title, after?, right?, lines?, bullets?}, `bullets` {items}, `fields` {items: [[label, value]], columns?: 1|2},
     `table` {columns: [{label, width, align?}], rows, totals?: [[label, value]]}, `columns` {groups: [{heading, items}]} (max 3),
     `signature` {items?}, `spacer` {size?}.
5. Build: `node scripts/templates/build.mjs <slug>`. If `"ok": false`, fix the spec using the listed problems and build again (at most 3 tries).
   If it still fails: `node automation/next.mjs --fail <slug> "<reason>"`, delete the spec, and go back to step 2.
6. Google copies (Google Drive tools; folder id `1u75du_PmriErRYc7nn3Ko0uWkWLn87NC`):
   - Upload `googleUpload.docs.path` as `<title> – MyPixelogs`, `base64Content` = `sha256:<sha256>:<path>`, `contentMimeType` = its `mime`, `parentId` = the folder. Google converts it to a Doc.
   - Upload `googleUpload.sheets.path` the same way, titled `<title> (Sheets) – MyPixelogs`.
   - Share both with `permissionId: "anyoneWithLink"`, `role: "reader"`.
   - Add `"platforms": {"googleDocsId": "<doc id>", "googleSheetsId": "<sheet id>"}` to the spec, then run `node scripts/templates/build.mjs --register`.
   - If Google Drive is unavailable, skip this step; the template still publishes with Word, Excel, Overleaf and PDF.
7. Mark done: `node automation/next.mjs --done <slug>`.
8. Check the site still builds: `npx tsc --noEmit && npm run build 2>&1 | tail -3`. Fix only what you broke.
9. Publish: commit everything (`git add -A`) with message `Add <title> (daily template)` plus the attribution lines from the system reminder,
   push the current branch, open a pull request into `main`, and merge it (merge method `merge`, pass `expectedHeadSha`). Netlify deploys `main` automatically.
10. Reply with 3 lines: template name, page URL `https://mypixelogs.netlify.app/templates/<slug>`, and anything that failed.

## Refilling the backlog

Find what people search for (Google autocomplete or a few web searches for "<category> format", "<category> template"), focused on India.
Add ideas with `node automation/next.mjs --add '[{"slug":"...-template","title":"...","category":"resume|invoice|receipt|letter|certificate|business","keyword":"...","score":1-100,"notes":"what it must contain"}]'`.
Never add documents that could be misused as fake proof: medical certificates, government IDs or forms, degree certificates, bank statements, legal affidavits.
