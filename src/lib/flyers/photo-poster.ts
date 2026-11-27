// A reusable photo flyer: a free-licence (or ChatGPT) photo as the background raster,
// with headline and details as editable text. Each flyer is a small settings file in
// src/data/flyer-specs.json, so new flyers need no new code.
// A4 portrait drawn at 1240 x 1754; exports render at 2x = 2480 x 3508 (300 dpi).

export type PosterSpec = {
  slug: string;
  title: string;
  description: string;
  published: string;
  /** Background photo in /public, e.g. /flyers/diwali-offer.jpg */
  bg: string;
  /** Where the text sits: over the photo's darkest, emptiest area. */
  layout: "top" | "center" | "bottom";
  style: "elegant" | "bold";
  /** Extra darkening (0–1) to keep text readable on a busy photo. */
  shade?: number;
  fields: PosterFields;
  features: string[];
  useCases: string[];
  credit: { title?: string; creator?: string; license: string; source: string; page?: string };
};

export type PosterFields = {
  kicker: string;
  title: string;
  script: string;
  subtitle: string;
  details: string;
  details2: string;
  footer: string;
  logo: string;
};

export const POSTER_THEMES = {
  gold: { name: "Gold", gold: ["#FFF7D6", "#F6C453", "#B8741A"], cream: "#FFF3DA", accent: "#F6C453" },
  white: { name: "White", gold: ["#FFFFFF", "#F2F2F2", "#BDBDBD"], cream: "#FFFFFF", accent: "#FFFFFF" },
  coral: { name: "Coral", gold: ["#FFE6DA", "#FF8A65", "#C9452B"], cream: "#FFF4EE", accent: "#FFB199" },
} as const;

export type PosterTheme = (typeof POSTER_THEMES)[keyof typeof POSTER_THEMES];

export const POSTER_FONTS: [string, string, string][] = [
  ["Cinzel Decorative|900|normal", "CinzelDecorative-Black.woff2", "CinzelDecorative-Black"],
  ["Cinzel|600|normal", "Cinzel-SemiBold.woff2", "Cinzel-SemiBold"],
  ["Cinzel|700|normal", "Cinzel-Bold.woff2", "Cinzel-Bold"],
  ["Great Vibes|400|normal", "GreatVibes-Regular.woff2", "GreatVibes-Regular"],
  ["Playfair Display|700|italic", "PlayfairDisplay-BoldItalic.woff2", "PlayfairDisplay-BoldItalic"],
  ["Playfair Display|400|italic", "PlayfairDisplay-Italic.woff2", "PlayfairDisplay-Italic"],
  ["Inter|600|normal", "Inter-SemiBold.woff2", "Inter-SemiBold"],
  ["Inter|900|normal", "Inter-Black.woff2", "Inter-Black"],
];

export const POSTER_GROUPS: [string, string[]][] = [
  ["Photo", ["Photo", "Shade"]],
  ["Headline", ["Kicker", "Title", "Script title", "Divider", "Subtitle"]],
  ["Details", ["Details", "Details line 2"]],
  ["Footer", ["Footer", "Logo frame", "Logo text"]],
];

export const POSTER_SECTIONS: { title: string; fields: [keyof PosterFields, string][] }[] = [
  { title: "Headline", fields: [["kicker", "Small line above"], ["title", "Title"], ["script", "Script line"], ["subtitle", "Line under the title"]] },
  { title: "Details", fields: [["details", "Details (date, offer…)"], ["details2", "Details line 2 (place, phone…)"]] },
  { title: "Footer", fields: [["footer", "Bottom line"], ["logo", "Business or organisation name"]] },
];

const W = 1240;
const H = 1754;

/** Font size that keeps a line inside the page width (average glyph width as a share of the size). */
const fit = (text: string, max: number, glyph: number, width = 1080) => Math.round(Math.min(max, width / Math.max(1, text.length * glyph)));

export function posterSvg(spec: PosterSpec, f: PosterFields, t: PosterTheme, opts: { fonts?: Record<string, string>; photo?: string | null; bg?: string; width?: number | string; height?: number | string } = {}): string {
  const esc = (s: string) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const hex = (h: string) => ({ r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16) });
  const fonts = opts.fonts
    ? "<style>" + Object.keys(opts.fonts).map((k) => {
        const [family, weight, style] = k.split("|");
        return `@font-face{font-family:'${family}';font-weight:${weight};font-style:${style};src:url(${opts.fonts![k]}) format('woff2')}`;
      }).join("") + "</style>"
    : "";
  type Txt = { family: string; size: number; weight: number; fill: string; ls?: number; italic?: boolean; filter?: string; psdFill?: string; psdFx?: object };
  const txt = (id: string, s: string, x: number, y: number, o: Txt) =>
    s.trim()
      ? `<text id="${id}" x="${x}" y="${y}" text-anchor="middle" font-family="'${o.family}', serif" font-size="${o.size}" font-weight="${o.weight}"` +
        (o.italic ? ' font-style="italic"' : "") + (o.ls ? ` letter-spacing="${o.ls}"` : "") + (o.filter ? ` filter="url(#${o.filter})"` : "") +
        (o.psdFill ? ` data-psd-fill="${o.psdFill}"` : "") + (o.psdFx ? ` data-psd-fx='${JSON.stringify(o.psdFx)}'` : "") +
        ` fill="${o.fill}">${esc(s)}</text>`
      : "";
  const g = (layer: string, name: string, body: string) => (body ? `<g data-layer="${layer}" data-name="${name}">${body}</g>` : "");
  const shadowFx = { dropShadow: [{ enabled: true, blendMode: "multiply", color: { r: 0, g: 0, b: 0 }, opacity: 0.75, angle: 90, distance: { units: "Pixels", value: 6 }, size: { units: "Pixels", value: 22 } }] };
  const goldFx = {
    gradientOverlay: [{ enabled: true, blendMode: "normal", opacity: 1, angle: 90, type: "linear", gradient: { name: "Accent", type: "solid", colorStops: t.gold.map((c, i) => ({ color: hex(c), location: [1, 0.5, 0][i], midpoint: 50 })), opacityStops: [{ opacity: 1, location: 0, midpoint: 50 }, { opacity: 1, location: 1, midpoint: 50 }] } }],
    outerGlow: { enabled: true, blendMode: "screen", color: hex(t.gold[1]), opacity: 0.45, size: { units: "Pixels", value: 36 } },
    ...shadowFx,
  };

  const elegant = spec.style === "elegant";
  const titleFont = elegant ? { family: "Cinzel Decorative", weight: 900, glyph: 0.78, ls: 6 } : { family: "Inter", weight: 900, glyph: 0.66, ls: 2 };
  const scriptFont = elegant ? { family: "Great Vibes", weight: 400, italic: false, glyph: 0.4 } : { family: "Playfair Display", weight: 700, italic: true, glyph: 0.5 };
  const smallFont = elegant ? { family: "Cinzel", weight: 600 } : { family: "Inter", weight: 600 };
  const titleSize = fit(f.title, 130, titleFont.glyph);
  const scriptSize = fit(f.script, elegant ? 250 : 150, scriptFont.glyph);

  // Vertical rhythm of the text block, anchored to the chosen area of the page.
  const blockTop = { top: 210, center: 520, bottom: 960 }[spec.layout];
  let y = blockTop;
  const at = (gap: number) => (y += gap);
  const yKicker = f.kicker ? at(30) : y;
  const yTitle = f.title ? at(titleSize + 10) : y;
  const yScript = f.script ? at(scriptSize * 0.78 + 8) : y;
  // Leave room for the script's descenders (g, y, p) before the divider.
  const yDivider = at(f.script ? Math.round(scriptSize * 0.3) + 30 : 48);
  const ySubtitle = f.subtitle ? at(56) : y;
  const yDetails = f.details ? at(76) : y;
  const yDetails2 = f.details2 ? at(48) : y;

  const shade = Math.min(1, Math.max(0, spec.shade ?? 0.45));
  const shadeGrad =
    spec.layout === "top"
      ? `<stop offset="0" stop-opacity="${shade + 0.2}"/><stop offset="${Math.min(0.95, (yDetails2 + 80) / H)}" stop-opacity="${shade}"/><stop offset="${Math.min(1, (yDetails2 + 260) / H)}" stop-opacity="0.05"/><stop offset=".9" stop-opacity=".35"/><stop offset="1" stop-opacity=".6"/>`
      : spec.layout === "bottom"
        ? `<stop offset="0" stop-opacity=".35"/><stop offset="${blockTop / H - 0.12}" stop-opacity="0.05"/><stop offset="${blockTop / H}" stop-opacity="${shade}"/><stop offset="1" stop-opacity="${shade + 0.3}"/>`
        : `<stop offset="0" stop-opacity=".35"/><stop offset="${(blockTop - 200) / H}" stop-opacity="${shade * 0.4}"/><stop offset="${(blockTop + 250) / H}" stop-opacity="${shade + 0.1}"/><stop offset="${(yDetails2 + 200) / H}" stop-opacity="${shade * 0.4}"/><stop offset="1" stop-opacity=".6"/>`;

  const defs = `<defs>
    <linearGradient id="accent" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.gold[0]}"/><stop offset=".5" stop-color="${t.gold[1]}"/><stop offset="1" stop-color="${t.gold[2]}"/></linearGradient>
    <linearGradient id="shadeGrad" x1="0" y1="0" x2="0" y2="1" color="#000">${shadeGrad.replace(/<stop /g, '<stop stop-color="#000" ')}</linearGradient>
    <filter id="glow" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur in="SourceAlpha" stdDeviation="12" result="b"/><feFlood flood-color="${t.gold[1]}" flood-opacity=".45"/><feComposite in2="b" operator="in" result="glow"/><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity=".8" in="SourceGraphic" result="shadow"/><feMerge><feMergeNode in="glow"/><feMergeNode in="shadow"/></feMerge></filter>
    <filter id="shadow" x="-20%" y="-40%" width="140%" height="180%"><feDropShadow dx="0" dy="4" stdDeviation="7" flood-color="#000" flood-opacity=".85"/></filter>
  </defs>`;

  const photo = opts.photo ?? opts.bg ?? spec.bg;
  const divider = `<g filter="url(#shadow)"><line x1="470" y1="${yDivider - 18}" x2="590" y2="${yDivider - 18}" stroke="${t.gold[1]}" stroke-width="3"/><path d="M620 ${yDivider - 30} L632 ${yDivider - 18} L620 ${yDivider - 6} L608 ${yDivider - 18}Z" fill="url(#accent)"/><line x1="650" y1="${yDivider - 18}" x2="770" y2="${yDivider - 18}" stroke="${t.gold[1]}" stroke-width="3"/></g>`;
  const logoY = spec.layout === "top" ? 1676 : 46;
  // The name box grows with the name (letter-spacing included); the text only shrinks for very long names.
  const logoText = f.logo.trim().toUpperCase();
  const logoSize = Math.min(18, Math.round(620 / Math.max(1, logoText.length * 0.72 * 1.25)));
  const logoW = Math.min(680, Math.max(240, Math.round(logoText.length * (logoSize * 0.72 + 4) + 70)));

  const body =
    g("photo", "Photo", `<image href="${photo}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>`) +
    g("shade", "Shade", `<rect width="${W}" height="${H}" fill="url(#shadeGrad)"/>`) +
    g("kicker", "Kicker", txt("kickerT", f.kicker, 620, yKicker, { family: smallFont.family, size: 26, weight: smallFont.weight, fill: t.accent, ls: 8, filter: "shadow", psdFx: shadowFx })) +
    g("title", "Title", txt("titleT", f.title, 620, yTitle, { family: titleFont.family, size: titleSize, weight: titleFont.weight, fill: t.cream, ls: titleFont.ls, filter: "shadow", psdFx: shadowFx })) +
    g("script", "Script title", txt("scriptT", f.script, 620, yScript, { family: scriptFont.family, size: scriptSize, weight: scriptFont.weight, italic: scriptFont.italic, fill: "url(#accent)", filter: "glow", psdFill: t.gold[1], psdFx: goldFx })) +
    g("divider", "Divider", divider) +
    g("subtitle", "Subtitle", txt("subtitleT", f.subtitle, 620, ySubtitle, { family: smallFont.family, size: fit(f.subtitle, 28, 0.62), weight: smallFont.weight, fill: t.cream, ls: 4, filter: "shadow", psdFx: shadowFx })) +
    g("details", "Details", txt("detailsT", f.details, 620, yDetails, { family: "Playfair Display", size: fit(f.details, 52, 0.5), weight: 700, italic: true, fill: t.cream, filter: "shadow", psdFx: shadowFx })) +
    g("details2", "Details line 2", txt("details2T", f.details2, 620, yDetails2, { family: smallFont.family, size: fit(f.details2, 26, 0.62), weight: 700, fill: t.accent, ls: 2, filter: "shadow", psdFx: shadowFx })) +
    g("footer", "Footer", txt("footerT", f.footer, 620, spec.layout === "top" ? 1640 : 1712, { family: "Playfair Display", size: fit(f.footer, 26, 0.48), weight: 400, italic: true, fill: t.cream, filter: "shadow", psdFx: shadowFx })) +
    (f.logo.trim()
      ? g("logoFrame", "Logo frame", `<rect x="${620 - logoW / 2}" y="${logoY}" width="${logoW}" height="50" rx="25" fill="#000" fill-opacity=".25" stroke="${t.accent}" stroke-opacity=".85" stroke-width="2"/>`) +
        g("logo", "Logo text", txt("logoT", f.logo, 620, logoY + 32, { family: smallFont.family, size: logoSize, weight: 700, fill: t.cream, ls: 4 }))
      : "");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${opts.width ?? W}" height="${opts.height ?? H}">${fonts}${defs}${body}</svg>`;
}
