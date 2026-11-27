// Christmas flyer on a photo background (AI image made in ChatGPT by the site owner).
// A4 portrait drawn at 1240 x 1754; exports render at 2x = 2480 x 3508 (300 dpi).
// The photo is a raster layer; every word is an editable text layer in the PSD.

export const FLYER_BG = "/flyers/christmas-nativity.jpg";

export const FLYER_DEFAULTS = {
  logo: "YOUR CHURCH",
  merry: "MERRY",
  christmas: "Christmas",
  tagline: "CELEBRATING THE BIRTH OF JESUS CHRIST",
  kicker: "JOIN US FOR A",
  event: "Candlelight Carol Service",
  details: "24 DEC 2026  ·  7:00 PM  ·  ST. MARK'S CHURCH",
  verse: "“For unto you is born this day a Saviour” — Luke 2:11",
};

export type FlyerFields = Record<keyof typeof FLYER_DEFAULTS, string>;

/** Text colour schemes (the photo stays the same). */
export const FLYER_THEMES = {
  gold: { name: "Gold", gold: ["#FFF7D6", "#F6C453", "#B8741A"], cream: "#FFF3DA", accent: "#F6C453" },
  rose: { name: "Rose gold", gold: ["#FFE9DF", "#F0A98C", "#B8644A"], cream: "#FFF0E8", accent: "#F0A98C" },
  silver: { name: "Silver", gold: ["#FFFFFF", "#DCE3EC", "#8C99A8"], cream: "#F4F7FB", accent: "#DCE3EC" },
} as const;

export type FlyerTheme = (typeof FLYER_THEMES)[keyof typeof FLYER_THEMES];
export type FlyerOptions = { fonts?: Record<string, string>; photo?: string | null; bg?: string; width?: number | string; height?: number | string };

export const FLYER_FONTS: [string, string, string][] = [
  ["Cinzel Decorative|900|normal", "CinzelDecorative-Black.woff2", "CinzelDecorative-Black"],
  ["Cinzel|600|normal", "Cinzel-SemiBold.woff2", "Cinzel-SemiBold"],
  ["Cinzel|700|normal", "Cinzel-Bold.woff2", "Cinzel-Bold"],
  ["Great Vibes|400|normal", "GreatVibes-Regular.woff2", "GreatVibes-Regular"],
  ["Playfair Display|700|italic", "PlayfairDisplay-BoldItalic.woff2", "PlayfairDisplay-BoldItalic"],
  ["Playfair Display|400|italic", "PlayfairDisplay-Italic.woff2", "PlayfairDisplay-Italic"],
];

/** PSD folders (bottom to top) and the layers in each, by layer name. */
export const FLYER_GROUPS: [string, string[]][] = [
  ["Photo", ["Nativity photo", "Top shade", "Bottom shade"]],
  ["Headline", ["Merry", "Christmas", "Flourish", "Tagline"]],
  ["Event", ["Kicker", "Event name", "Date, time and venue"]],
  ["Footer", ["Bible verse", "Logo frame", "Logo text"]],
];

const W = 1240;
const H = 1754;

export function flyerSvg(f: FlyerFields, t: FlyerTheme, opts: FlyerOptions = {}): string {
  const esc = (s: string) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const hex = (h: string) => ({ r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16) });
  const fonts = opts.fonts
    ? "<style>" +
      Object.keys(opts.fonts)
        .map((k) => {
          const [family, weight, style] = k.split("|");
          return `@font-face{font-family:'${family}';font-weight:${weight};font-style:${style};src:url(${opts.fonts![k]}) format('woff2')}`;
        })
        .join("") +
      "</style>"
    : "";
  type Txt = { family: string; size: number; weight: number; fill: string; ls?: number; italic?: boolean; filter?: string; psdFill?: string; psdFx?: object };
  const txt = (id: string, s: string, x: number, y: number, o: Txt) =>
    `<text id="${id}" x="${x}" y="${y}" text-anchor="middle" font-family="'${o.family}', serif" font-size="${o.size}" font-weight="${o.weight}"` +
    (o.italic ? ' font-style="italic"' : "") +
    (o.ls ? ` letter-spacing="${o.ls}"` : "") +
    (o.filter ? ` filter="url(#${o.filter})"` : "") +
    (o.psdFill ? ` data-psd-fill="${o.psdFill}"` : "") +
    (o.psdFx ? ` data-psd-fx='${JSON.stringify(o.psdFx)}'` : "") +
    ` fill="${o.fill}">${esc(s)}</text>`;
  const g = (layer: string, name: string, body: string) => `<g data-layer="${layer}" data-name="${name}">${body}</g>`;
  const shadowFx = { dropShadow: [{ enabled: true, blendMode: "multiply", color: { r: 0, g: 0, b: 0 }, opacity: 0.75, angle: 90, distance: { units: "Pixels", value: 6 }, size: { units: "Pixels", value: 22 } }] };
  const goldFx = {
    gradientOverlay: [{ enabled: true, blendMode: "normal", opacity: 1, angle: 90, type: "linear", gradient: { name: "Gold", type: "solid", colorStops: t.gold.map((c, i) => ({ color: hex(c), location: [1, 0.5, 0][i], midpoint: 50 })), opacityStops: [{ opacity: 1, location: 0, midpoint: 50 }, { opacity: 1, location: 1, midpoint: 50 }] } }],
    outerGlow: { enabled: true, blendMode: "screen", color: hex(t.gold[1]), opacity: 0.5, size: { units: "Pixels", value: 40 } },
    ...shadowFx,
  };

  const defs = `<defs>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.gold[0]}"/><stop offset=".5" stop-color="${t.gold[1]}"/><stop offset="1" stop-color="${t.gold[2]}"/></linearGradient>
    <linearGradient id="topShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".25"/><stop offset=".35" stop-color="#000" stop-opacity=".45"/><stop offset=".62" stop-color="#000" stop-opacity=".25"/><stop offset=".75" stop-color="#000" stop-opacity="0"/></linearGradient>
    <linearGradient id="bottomShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".6" stop-color="#000" stop-opacity=".65"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></linearGradient>
    <filter id="textGlow" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur in="SourceAlpha" stdDeviation="12" result="b"/><feFlood flood-color="${t.gold[1]}" flood-opacity=".5"/><feComposite in2="b" operator="in" result="glow"/><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity=".8" in="SourceGraphic" result="shadow"/><feMerge><feMergeNode in="glow"/><feMergeNode in="shadow"/></feMerge></filter>
    <filter id="shadow" x="-20%" y="-40%" width="140%" height="180%"><feDropShadow dx="0" dy="4" stdDeviation="7" flood-color="#000" flood-opacity=".85"/></filter>
  </defs>`;

  const photo = opts.photo ?? opts.bg ?? FLYER_BG;
  const flourish =
    `<g fill="none" stroke="url(#gold)" stroke-width="4" stroke-linecap="round" filter="url(#shadow)">` +
    `<path d="M620 800 C560 780 500 830 430 807 C390 794 380 763 405 757 C425 753 432 779 412 785"/>` +
    `<path d="M620 800 C680 780 740 830 810 807 C850 794 860 763 835 757 C815 753 808 779 828 785"/></g>` +
    `<path d="M620 786 L634 800 L620 814 L606 800Z" fill="url(#gold)"/>`;

  const body =
    g("photo", "Nativity photo", `<image href="${photo}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMin slice"/>`) +
    g("topShade", "Top shade", `<rect width="${W}" height="${H}" fill="url(#topShade)"/>`) +
    g("bottomShade", "Bottom shade", `<rect y="1460" width="${W}" height="${H - 1460}" fill="url(#bottomShade)"/>`) +
    g("merry", "Merry", txt("merryT", f.merry, 620, 520, { family: "Cinzel Decorative", size: 124, weight: 900, fill: t.cream, ls: 8, filter: "shadow", psdFx: shadowFx })) +
    g("christmas", "Christmas", txt("christmasT", f.christmas, 620, 745, { family: "Great Vibes", size: 280, weight: 400, fill: "url(#gold)", filter: "textGlow", psdFill: t.gold[1], psdFx: goldFx })) +
    g("flourish", "Flourish", flourish) +
    g("tagline", "Tagline", txt("taglineT", f.tagline, 620, 866, { family: "Cinzel", size: 26, weight: 600, fill: t.cream, ls: 5, filter: "shadow", psdFx: shadowFx })) +
    g("kicker", "Kicker", txt("kickerT", f.kicker, 620, 948, { family: "Cinzel", size: 22, weight: 600, fill: t.accent, ls: 8, filter: "shadow", psdFx: shadowFx })) +
    g("event", "Event name", txt("eventT", f.event, 620, 1010, { family: "Playfair Display", size: 60, weight: 700, italic: true, fill: t.cream, filter: "shadow", psdFx: shadowFx })) +
    g("details", "Date, time and venue", txt("detailsT", f.details, 620, 1060, { family: "Cinzel", size: 26, weight: 700, fill: t.accent, ls: 2, filter: "shadow", psdFx: shadowFx })) +
    g("verse", "Bible verse", txt("verseT", f.verse, 620, 1650, { family: "Playfair Display", size: 26, weight: 400, italic: true, fill: t.cream })) +
    g("logoFrame", "Logo frame", `<rect x="470" y="1676" width="300" height="50" rx="25" fill="none" stroke="${t.accent}" stroke-opacity=".8" stroke-width="2"/>`) +
    g("logo", "Logo text", txt("logoT", f.logo, 620, 1708, { family: "Cinzel", size: 18, weight: 700, fill: t.cream, ls: 4 }));

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${opts.width ?? W}" height="${opts.height ?? H}">${fonts}${defs}${body}</svg>`;
}
