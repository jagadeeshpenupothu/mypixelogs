// Grand Opening flyer (shared by the online editor and scripts/flyers/build.mjs): one SVG source for the PSD, Illustrator, PDF, preview and the online editor.
// A4 portrait drawn at 1240 x 1754 (150 dpi); exports render at 2x = 2480 x 3508 (300 dpi).
export type FlyerFields = Record<keyof typeof FLYER_DEFAULTS, string>;
export type FlyerTheme = (typeof FLYER_THEMES)[keyof typeof FLYER_THEMES];
export type FlyerOptions = { fonts?: Record<string, string>; photo?: string | null; width?: number | string; height?: number | string };

export const FLYER_DEFAULTS = {
  kicker: "YOU'RE INVITED TO OUR",
  h1: "Grand",
  h2: "OPENING",
  business: "Chai & Co. Café",
  offerTop: "FLAT",
  offerBig: "20%",
  offerBottom: "OFF",
  date: "Sun, 14 Dec 2026",
  time: "10 AM onwards",
  place: "MG Road, Benz Circle",
  footer1: "Free masala chai for the first 100 guests",
  footer2: "Call / WhatsApp  +91 98765 43210",
} as const;

export const FLYER_THEMES = {
  teal: { name: "Teal & coral", bg: "#FBF4E8", main: "#0F4C4A", main2: "#1B6662", accent: "#E4572E", gold: "#F4A62A", gold2: "#C77D0A", ink: "#1D2B2A", line: "#E3D5BF", leaf: "#2E7D4F" },
  maroon: { name: "Maroon & gold", bg: "#FFF6EC", main: "#6B1D2A", main2: "#842B3A", accent: "#D4881C", gold: "#F2B630", gold2: "#A86A0C", ink: "#2A1A1C", line: "#EBD9C4", leaf: "#3F7A3A" },
  navy: { name: "Navy & orange", bg: "#F5F7FB", main: "#14274E", main2: "#22396B", accent: "#F26B1D", gold: "#F5B82E", gold2: "#C2780A", ink: "#151C2C", line: "#DCE2EE", leaf: "#2F7A55" },
} as const;

export function flyerSvg(f: FlyerFields, t: FlyerTheme, opts: FlyerOptions = {}): string {
  const esc = function (s: string) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); };
  const fonts = opts.fonts
    ? "<style>" + Object.keys(opts.fonts).map(function (k: string) {
        const p = k.split("|");
        return "@font-face{font-family:'" + p[0] + "';font-weight:" + p[1] + ";font-style:" + p[2] + ";src:url(" + opts.fonts![k] + ") format('woff2')}";
      }).join("") + "</style>"
    : "";
  const INTER = "Inter, Arial, sans-serif";
  const SERIF = "'Playfair Display', Georgia, serif";
  type Extra = { serif?: number; italic?: number; ls?: number };
  const txt = function (id: string, s: string, x: number, y: number, size: number, weight: number, fill: string, extra?: Extra) {
    return '<text id="' + id + '" x="' + x + '" y="' + y + '" text-anchor="middle" font-family="' + (extra && extra.serif ? SERIF : INTER) + '" font-size="' + size + '" font-weight="' + weight + '"' +
      (extra && extra.italic ? ' font-style="italic"' : "") + (extra && extra.ls ? ' letter-spacing="' + extra.ls + '"' : "") + ' fill="' + fill + '">' + esc(s) + "</text>";
  };
  const g = function (layer: string, name: string, body: string, attrs?: string) { return '<g data-layer="' + layer + '" data-name="' + name + '"' + (attrs || "") + ">" + body + "</g>"; };

  // Toran (festive garland) along the top: marigolds and mango leaves on a curved string.
  let toran = '<path d="M-10 36 Q620 176 1250 36" fill="none" stroke="#8A5A2B" stroke-width="4"/>';
  for (let i = 0; i <= 16; i++) {
    const u = i / 16, x = 1240 * u, y = 36 + 140 * u * (1 - u) + 4;
    toran += '<line x1="' + x + '" y1="' + y + '" x2="' + x + '" y2="' + (y + 22) + '" stroke="#8A5A2B" stroke-width="2"/>';
    if (i % 2 === 0) toran += '<circle cx="' + x + '" cy="' + (y + 40) + '" r="21" fill="' + t.gold + '"/><circle cx="' + x + '" cy="' + (y + 40) + '" r="8" fill="' + t.gold2 + '"/>';
    else toran += '<path d="M' + x + " " + (y + 18) + " C" + (x + 20) + " " + (y + 40) + " " + (x + 12) + " " + (y + 66) + " " + x + " " + (y + 78) + " C" + (x - 12) + " " + (y + 66) + " " + (x - 20) + " " + (y + 40) + " " + x + " " + (y + 18) + 'Z" fill="' + t.leaf + '"/>';
  }

  const arch = "M190 1010 L190 650 A430 430 0 0 1 1050 650 L1050 1010 Z";
  const archFrame = "M170 1030 L170 650 A450 450 0 0 1 1070 650 L1070 1030 Z";
  const photo = opts.photo
    ? '<clipPath id="archClip"><path d="' + arch + '"/></clipPath><image href="' + opts.photo + '" x="190" y="220" width="860" height="790" preserveAspectRatio="xMidYMid slice" clip-path="url(#archClip)"/>'
    : '<path d="' + arch + '" fill="' + t.main + '"/>' +
      [360, 290, 220].map(function (r: number) { return '<path d="M' + (620 - r) + " 1010 L" + (620 - r) + " " + (1010 - r * 0.85) + " A" + r + " " + r + " 0 0 1 " + (620 + r) + " " + (1010 - r * 0.85) + " L" + (620 + r) + ' 1010" fill="none" stroke="' + t.main2 + '" stroke-width="3"/>'; }).join("") +
      txt("photoHint", "Place your photo here", 620, 640, 30, 500, t.bg, { ls: 1 });

  const detail = function (cx: number, label: string, value: string, id: string, name: string) {
    return g(id + "Label", name + " label", txt(id + "LabelT", label, cx, 1500, 20, 700, t.gold2, { ls: 4 })) + g(id, name, txt(id + "T", value, cx, 1548, 30, 600, t.ink));
  };

  const body =
    g("bg", "Background", '<rect width="1240" height="1754" fill="' + t.bg + '"/>') +
    g("toran", "Toran garland", toran) +
    g("frame", "Arch frame", '<path d="' + archFrame + '" fill="none" stroke="' + t.gold + '" stroke-width="5"/>') +
    g("photo", "Photo (replace me)", photo) +
    g("badge", "Offer badge", '<circle cx="1010" cy="940" r="135" fill="' + t.accent + '"/><circle cx="1010" cy="940" r="117" fill="none" stroke="' + t.bg + '" stroke-width="2.5" stroke-dasharray="7 8"/>') +
    g("offerTop", "Offer line 1", txt("offerTopT", f.offerTop, 1010, 893, 30, 700, t.bg, { ls: 4 }), ' transform="rotate(-12 1010 940)"') +
    g("offerBig", "Offer amount", txt("offerBigT", f.offerBig, 1010, 974, 92, 900, t.bg), ' transform="rotate(-12 1010 940)"') +
    g("offerBottom", "Offer line 2", txt("offerBottomT", f.offerBottom, 1010, 1014, 30, 700, t.bg, { ls: 4 }), ' transform="rotate(-12 1010 940)"') +
    g("kicker", "Kicker", txt("kickerT", f.kicker, 620, 1095, 28, 600, t.main, { ls: 8 })) +
    g("h1", "Headline 1", txt("h1T", f.h1, 620, 1238, 156, 700, t.accent, { serif: 1, italic: 1 })) +
    g("h2", "Headline 2", txt("h2T", f.h2, 620, 1362, 132, 900, t.main, { ls: 6 })) +
    g("business", "Business name", txt("businessT", f.business, 620, 1424, 36, 500, t.ink, { ls: 1 })) +
    g("dividers", "Dividers", '<line x1="440" y1="1474" x2="440" y2="1562" stroke="' + t.line + '" stroke-width="2"/><line x1="800" y1="1474" x2="800" y2="1562" stroke="' + t.line + '" stroke-width="2"/>') +
    detail(260, "DATE", f.date, "date", "Date") +
    detail(620, "TIME", f.time, "time", "Time") +
    detail(980, "VENUE", f.place, "place", "Venue") +
    g("footer", "Footer band", '<rect y="1630" width="1240" height="124" fill="' + t.main + '"/>') +
    g("footer1", "Footer line 1", txt("footer1T", f.footer1, 620, 1684, 30, 600, t.bg)) +
    g("footer2", "Footer line 2", txt("footer2T", f.footer2, 620, 1726, 26, 500, t.gold, { ls: 1 }));

  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1240 1754" width="' + (opts.width || 1240) + '" height="' + (opts.height || 1754) + '">' + fonts + body + "</svg>";
}


/** PSD folders (bottom to top) and the layers in each, by layer name. */
export const FLYER_GROUPS: [string, string[]][] = [
  ["Background", ["Background", "Toran garland"]],
  ["Photo", ["Arch frame", "Photo (replace me)"]],
  ["Offer badge", ["Offer badge", "Offer line 1", "Offer amount", "Offer line 2"]],
  ["Headline", ["Kicker", "Headline 1", "Headline 2", "Business name"]],
  ["Details", ["Dividers", "Date label", "Date", "Time label", "Time", "Venue label", "Venue"]],
  ["Footer", ["Footer band", "Footer line 1", "Footer line 2"]],
];

/** Fonts this design uses: CSS family|weight|style, file in /public/fonts/flyer, and the PostScript name Photoshop expects. */
export const FLYER_FONTS: [string, string, string][] = [
  ["Inter|500|normal", "Inter-Medium.woff2", "Inter-Medium"],
  ["Inter|600|normal", "Inter-SemiBold.woff2", "Inter-SemiBold"],
  ["Inter|700|normal", "Inter-Bold.woff2", "Inter-Bold"],
  ["Inter|900|normal", "Inter-Black.woff2", "Inter-Black"],
  ["Playfair Display|700|italic", "PlayfairDisplay-BoldItalic.woff2", "PlayfairDisplay-BoldItalic"],
];
