# Daily template run

One new template per day, published to https://mypixelogs.netlify.app without asking.
Be brief: don't read files this runbook doesn't name, don't explore the repo, keep replies short.

## Steps

1. Setup: `cd` to the repo, `git fetch -q origin main && git checkout -q -B "$(git branch --show-current)" origin/main`, then `npm ci --silent && python3 -m pip install -q openpyxl`.
2. Pick: `node automation/next.mjs`. It prints one idea as JSON (`slug`, `title`, `category`, `keyword`, `notes`).
   - If it prints `EMPTY` or `node automation/next.mjs --count` is below 5, first add 15 ideas (see "Refilling").
3. Research (REQUIRED; never build blindly). The goal is a template a real business would use as-is, so it earns visits and revenue.
   - Run 2-3 web searches such as "<keyword>", "<keyword> sample India", "<document> template professional".
   - Open 3-5 real references: official or authoritative pages (government, ICAI/GST/HR guidance, banks), leading template sites
     (Vyapar, Tally, Zoho, Canva, Template.net, Microsoft), real company samples, or Pinterest pins of real documents.
   - Write down which fields and sections MOST references share, plus anything Indian rules require. That consensus is your field list.
   - Take ideas only. Never copy another site's wording, layout or logo; write your own text.
4. Write `automation/specs/<slug>.json`. Read only `automation/specs/quotation-template.json` and match its quality and shape. Rules:
   - DESIGN (required, so templates don't all look alike): run `node scripts/templates/next-design.mjs <category>` and copy
     its `"design"` object into the spec (palette, font, header, table, heading). You may change a value to suit the
     document (e.g. a centred header and an elegant font for a certificate, a split or band header for an invoice), but
     never repeat the previous template's palette or header. Don't set `accent`; the palette sets it.
     Options: palette navy|emerald|maroon|charcoal|teal|purple|royal|olive|rust|slate|crimson|forest;
     font classic|modern|corporate|elegant|editorial|formal|mixed; header band|plain|split|centered|topbar;
     table solid|tint|minimal; heading rule|bar|caps|shade.
   - Write it compactly: one block per line, like the example.
   - Add `"references": [3-5 https links you studied]` and `"research": "<1-2 sentences: what the references have in common>"`.
   - Look like a real corporate document: start with a `header` block (logo area, organisation, address/GSTIN/contact lines,
     document title, and its numbers such as No./Date/Valid until). Use `parties` for From/To or Bill to/Ship to, `table` with totals
     where money is involved, `note` for terms/declarations, and `signature` at the end.
   - Realistic sample data inside brackets, e.g. `[Sharma IT Solutions Pvt. Ltd.]`, `[QT/2026-27/0142]`, never just `[Name]`.
     Numbers must add up exactly (check totals, tax and amount in words). Use only tax rates you are sure of; when unsure, use 18%.
   - Indian context (₹, GST, PAN, DD/MM/YYYY) unless the idea says otherwise. Fill 70-95% of ONE A4 page; no more than 9 table rows.
   - `description` 140-220 characters, includes the search keyword and "Word, Google Docs, Google Sheets, Excel or Overleaf".
   - Set `"published": "<today YYYY-MM-DD>"`. Leave `platforms` out.
   - Block types: `header` {org, lines[], title, meta: [[label, value]], style?: "band"|"plain", logo?: false},
     `parties` {groups: [{heading, lines[]}]} (2-3), `note` {heading?, text or [text]}, `title` {text, subtitle?, align?},
     `contact` {items[], rule?}, `heading` {text}, `text` {text or [text], align?}, `entry` {title, after?, right?, lines?, bullets?},
     `bullets` {items}, `fields` {items: [[label, value]], columns?: 1|2}, `table` {columns: [{label, width, align?}], rows, totals?},
     `columns` {groups: [{heading, items}]} (max 3), `signature` {items?}, `spacer` {size?}.
   - Letters (leave, resignation, offer, NOC...): `header` with `style: "plain"`, then date/ref fields, subject, 3-5 well-written
     paragraphs, closing and signature. Certificates: centred title, formal wording, and signature lines with designation.
5. Build: `node scripts/templates/build.mjs <slug>`. If `"ok": false`, fix the spec using the listed problems and build again (at most 3 tries).
   The build refuses specs without 3 references, without a header, or with a thin page. Fix those; don't work around them.
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
10. Archive for the owner's review (always do this, even if publishing failed), at https://claude.ai/artifact/LrxWoWrmWeRSDxFottH8Y8 :
    - Upload with the Artifact tool, ONE file per call (`file_path`, never `file_paths`): `action` publish, `url` = that link,
      `asset: true`, first the absolute path of `public/previews/<slug>.png`, then of `public/downloads/<slug>.pdf`. Note both ids.
    - If the template did NOT reach `main`: `git format-patch -1 --stdout > automation/out/<slug>.patch.txt` and upload that file
      the same way; note its id.
    - Write one row with the ArtifactData tool: `action` set, same `url`, `collection` "runs", `doc_id` "<today>-<slug>", `data`:
      {"date": "<today>", "slug": "<slug>", "title": "<title>", "category": "<Category>", "status": "live" | "waiting" | "failed",
       "note": "<one short sentence: what happened>", "previewId": "<id>", "pdfId": "<id>", "patchId": "<id, only if uploaded>"}.
      Use "live" only if it was merged into `main`; "waiting" if it was built but not published; "failed" if it could not be built.
    - If these tools are unavailable, skip this step and say so in the reply.
11. Reply with 3 lines: template name, page URL `https://mypixelogs.netlify.app/templates/<slug>`, and anything that failed.

## Refilling the backlog

Find what people search for (Google autocomplete or a few web searches for "<category> format", "<category> template"), focused on India.
Add ideas with `node automation/next.mjs --add '[{"slug":"...-template","title":"...","category":"resume|invoice|receipt|letter|certificate|business","keyword":"...","score":1-100,"notes":"what it must contain"}]'`.
Never add documents that could be misused as fake proof: medical certificates, government IDs or forms, degree certificates, bank statements, legal affidavits.
