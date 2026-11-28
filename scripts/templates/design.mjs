// Design themes for the document templates, so templates don't all look the same.
// A spec picks one value per dimension in "design": {palette, font, header, table, heading}.
// Every font here exists in Word, Google Docs and (through metric-compatible stand-ins) the preview renderer.

export const PALETTES = {
  navy: { accent: "1B2F5B", accent2: "C9A227" },
  emerald: { accent: "0F6E56", accent2: "D4A017" },
  maroon: { accent: "7A1F2B", accent2: "C59B4A" },
  charcoal: { accent: "2B2D33", accent2: "E36414" },
  teal: { accent: "0E7C86", accent2: "F2A541" },
  purple: { accent: "5B2A86", accent2: "E0A526" },
  royal: { accent: "1F5FBF", accent2: "F28C28" },
  olive: { accent: "4F5D2F", accent2: "B5651D" },
  rust: { accent: "A44A1F", accent2: "2F4858" },
  slate: { accent: "334155", accent2: "B08D3A" },
  crimson: { accent: "B4232C", accent2: "1F2937" },
  forest: { accent: "1E5631", accent2: "A4C639" },
};

/** Heading font + body font. */
export const FONTS = {
  classic: { head: "Cambria", body: "Cambria" },
  modern: { head: "Calibri", body: "Calibri" },
  corporate: { head: "Arial", body: "Arial" },
  elegant: { head: "Georgia", body: "Calibri" },
  editorial: { head: "Georgia", body: "Georgia" },
  formal: { head: "Times New Roman", body: "Times New Roman" },
  mixed: { head: "Cambria", body: "Arial" },
};

export const HEADERS = ["band", "plain", "split", "centered", "topbar"];
export const TABLES = ["solid", "tint", "minimal"];
export const HEADINGS = ["rule", "bar", "caps", "shade"];

/** Mixes a hex colour with white: share 0..1 of white. */
export const tint = (hex, share) => {
  const c = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return c.map((v) => Math.round(v + (255 - v) * share).toString(16).padStart(2, "0")).join("").toUpperCase();
};

/** Resolves a spec's design (with the old look as the default, so older templates don't change). */
export function resolveDesign(spec) {
  const d = spec.design ?? {};
  const pal = PALETTES[d.palette] ?? { accent: (spec.accent ?? "1B2F5B").replace("#", "").toUpperCase(), accent2: "C9A227" };
  const font = FONTS[d.font] ?? FONTS.classic;
  const header = HEADERS.includes(d.header) ? d.header : null; // null = the block's own style (band/plain)
  return {
    accent: pal.accent,
    accent2: pal.accent2,
    soft: tint(pal.accent, 0.9),
    softer: tint(pal.accent, 0.95),
    head: font.head,
    body: font.body,
    header,
    table: TABLES.includes(d.table) ? d.table : "solid",
    heading: HEADINGS.includes(d.heading) ? d.heading : "rule",
  };
}

export function checkDesign(design, problems) {
  if (!design) return problems.push('Add "design": {palette, font, header, table, heading} (run: node scripts/templates/next-design.mjs).');
  const opts = { palette: Object.keys(PALETTES), font: Object.keys(FONTS), header: HEADERS, table: TABLES, heading: HEADINGS };
  for (const [k, list] of Object.entries(opts)) if (!list.includes(design[k])) problems.push(`design.${k} must be one of: ${list.join(", ")}`);
}
