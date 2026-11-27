// A layered "campaign" flyer: a background plate, a cut-out hero (person, dish, product) and optional extra
// cut-outs and overlays, with a heavy modern headline, glass info cards, a check-list, a call-to-action pill and
// a contact bar. Images usually come from ChatGPT (see automation/FLYER_RUNBOOK.md); every flyer is a settings
// object in src/data/flyer-composites.json, so new flyers need no new code.
// A4 portrait drawn at 1240 x 1754; exports render at 2x = 2480 x 3508 (300 dpi).

type Box = { x: number; y: number; w: number; h: number };
type Placed = Box & { src: string; front?: boolean; opacity?: number; rotate?: number };

export type CompositeSpec = {
  slug: string;
  title: string;
  description: string;
  published: string;
  /** hero-right: text column on the left, hero on the right (people, dishes). hero-center: headline on top, hero below (products). */
  layout: "hero-right" | "hero-center";
  palette: { accent: string; dark: string };
  images: {
    /** Full-page background plate (JPEG). */
    bg: string;
    /** Main cut-out (transparent PNG/WebP). A person bleeds off the bottom; an object stands on a soft shadow. */
    hero: { src: string; kind: "person" | "object"; box?: Box };
    /** More cut-outs, drawn behind the hero unless front is true. */
    extras?: Placed[];
    /** Full-page transparent overlays (confetti, sparkles, petals), drawn over the photos and under the text. */
    overlays?: { src: string; opacity?: number }[];
  };
  /** Huge word behind the hero, e.g. FEAST. Empty for none. */
  ghost?: string;
  /** Darkening over the photo behind the text (0–1). */
  shade?: number;
  fields: CompositeFields;
  features: string[];
  useCases: string[];
  credit: { title?: string; creator?: string; license: string; source: string; page?: string };
};

export type CompositeFields = {
  brand: string;
  brandSub: string;
  kicker: string;
  headline1: string;
  headline2: string;
  sub: string;
  cardTitle: string;
  point1: string;
  point2: string;
  point3: string;
  date: string;
  time: string;
  place: string;
  cta: string;
  phone: string;
  social: string;
};

export type CompositeTheme = { name: string; accent?: string; dark?: string };

/** The flyer's own colours come first; the rest are alternatives in the editor. */
export const COMPOSITE_THEMES: Record<string, CompositeTheme> = {
  brand: { name: "Original" },
  gold: { name: "Gold", accent: "#F5B942", dark: "#0E0A05" },
  blue: { name: "Royal blue", accent: "#3D8BFF", dark: "#050F26" },
  red: { name: "Red", accent: "#FF3B3B", dark: "#160404" },
};

export const COMPOSITE_FONTS: [string, string, string][] = [
  ["Poppins|900|normal", "Poppins-Black.woff2", "Poppins-Black"],
  ["Poppins|800|normal", "Poppins-ExtraBold.woff2", "Poppins-ExtraBold"],
  ["Poppins|700|normal", "Poppins-Bold.woff2", "Poppins-Bold"],
  ["Poppins|600|normal", "Poppins-SemiBold.woff2", "Poppins-SemiBold"],
  ["Poppins|500|normal", "Poppins-Medium.woff2", "Poppins-Medium"],
];

export const COMPOSITE_GROUPS: [string, string[]][] = [
  ["Background", ["Background photo", "Shade", "Light streaks", "Big word", "Cut-outs (back)"]],
  ["Main photo", ["Ground shadow", "Main photo", "Cut-outs (front)", "Overlay"]],
  ["Brand", ["Logo mark", "Logo letter", "Brand name", "Brand line", "Tag frame", "Tag"]],
  ["Headline", ["Headline 1", "Headline 2", "Swoosh", "Sub line"]],
  ["Info", ["Card", "Card label frame", "Card label", "Ticks", "Point 1", "Point 2", "Point 3", "Date frame", "Date", "Time frame", "Time", "Place icon", "Place"]],
  ["Call to action", ["Button", "Button text"]],
  ["Contact bar", ["Bar", "Contact icons", "Phone", "Social"]],
];

export const COMPOSITE_SECTIONS: { title: string; fields: [keyof CompositeFields, string][] }[] = [
  { title: "Brand", fields: [["brand", "Business name"], ["brandSub", "Line under the name"], ["kicker", "Tag (top right)"]] },
  { title: "Headline", fields: [["headline1", "Headline line 1"], ["headline2", "Headline line 2 (colour)"], ["sub", "Line under the headline"]] },
  { title: "Highlights", fields: [["cardTitle", "Card label"], ["point1", "Point 1"], ["point2", "Point 2"], ["point3", "Point 3"]] },
  { title: "When and where", fields: [["date", "Date"], ["time", "Time"], ["place", "Place"], ["cta", "Button"]] },
  { title: "Contact", fields: [["phone", "Phone"], ["social", "Instagram / website"]] },
];

const W = 1240;
const H = 1754;

/** Font size that keeps a line inside a width, from the average glyph width as a share of the size. */
const fit = (text: string, max: number, glyph: number, width: number) => Math.round(Math.min(max, width / Math.max(1, text.length * glyph)));
/** Rough rendered width of a line, to size the pills around it. */
const measure = (text: string, size: number, glyph: number, ls = 0) => text.length * (size * glyph + ls);

/** Text on the accent colour: dark on light accents, white on dark ones. */
function onAccent(hex: string, dark: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.55 ? dark : "#FFFFFF";
}

const ICONS = {
  check: (x: number, y: number, c: string) => `<path d="M${x - 9} ${y + 1} l6 6 l12 -13" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
  phone: (x: number, y: number, c: string) =>
    `<path transform="translate(${x - 14} ${y - 14}) scale(1.15)" d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="${c}"/>`,
  insta: (x: number, y: number, c: string) =>
    `<g fill="none" stroke="${c}" stroke-width="3.2"><rect x="${x - 15}" y="${y - 15}" width="30" height="30" rx="9"/><circle cx="${x}" cy="${y}" r="7"/></g><circle cx="${x + 8.5}" cy="${y - 8.5}" r="2.2" fill="${c}"/>`,
  pin: (x: number, y: number, c: string) =>
    `<path d="M${x} ${y + 16} C${x - 4} ${y + 8} ${x - 13} ${y + 1} ${x - 13} ${y - 7} a13 13 0 0 1 26 0 C${x + 13} ${y + 1} ${x + 4} ${y + 8} ${x} ${y + 16}z" fill="${c}"/><circle cx="${x}" cy="${y - 7}" r="5" fill="#000" fill-opacity=".35"/>`,
};

export function compositeSvg(
  spec: CompositeSpec,
  f: CompositeFields,
  theme: CompositeTheme,
  opts: { fonts?: Record<string, string>; photo?: string | null; assets?: Record<string, string>; width?: number | string; height?: number | string } = {},
): string {
  const esc = (s: string) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const src = (p: string) => opts.assets?.[p] ?? p;
  const accent = theme.accent ?? spec.palette.accent;
  const dark = theme.dark ?? spec.palette.dark;
  const ink = onAccent(accent, dark);
  const fonts = opts.fonts
    ? "<style>" + Object.keys(opts.fonts).map((k) => {
        const [family, weight, style] = k.split("|");
        return `@font-face{font-family:'${family}';font-weight:${weight};font-style:${style};src:url(${opts.fonts![k]}) format('woff2')}`;
      }).join("") + "</style>"
    : "";

  type Txt = { size: number; weight: number; fill: string; ls?: number; anchor?: "start" | "middle" | "end"; opacity?: number; shadow?: boolean };
  const txt = (s: string, x: number, y: number, o: Txt) =>
    s.trim()
      ? `<text x="${x}" y="${y}" text-anchor="${o.anchor ?? "start"}" font-family="'Poppins', sans-serif" font-size="${o.size}" font-weight="${o.weight}"` +
        (o.ls ? ` letter-spacing="${o.ls}"` : "") + (o.opacity != null ? ` fill-opacity="${o.opacity}"` : "") + (o.shadow ? ' filter="url(#tshadow)"' : "") +
        ` fill="${o.fill}">${esc(s)}</text>`
      : "";
  const g = (name: string, body: string, attrs = "") => (body ? `<g data-layer="${name.replace(/\W+/g, "-").toLowerCase()}" data-name="${name}"${attrs}>${body}</g>` : "");
  const img = (p: Placed | (Box & { src: string }), align = "xMidYMid meet", extra = "") =>
    `<image href="${src(p.src)}" x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" preserveAspectRatio="${align}"${extra}/>`;

  const center = spec.layout === "hero-center";
  const left = 80;
  const colW = center ? 1080 : 620;
  const shade = Math.min(1, Math.max(0, spec.shade ?? 0.6));

  // ---- Headline block ----
  const h1Size = fit(f.headline1, center ? 132 : 128, 0.66, center ? 1060 : 1000);
  const h2Size = fit(f.headline2, center ? 132 : 128, 0.66, center ? 1060 : 1000);
  const hx = center ? W / 2 : left - 4;
  const anchor = center ? "middle" : "start";
  const points0 = [f.point1, f.point2, f.point3].filter((p) => p.trim());
  const natural = 360 + h2Size * 0.98 + 44 + 74 + 64 + (points0.length ? 104 + points0.length * 66 + 34 : 0) + 120 + (f.place.trim() ? 64 : 0) + 76;
  const spare = center ? 0 : Math.max(0, Math.min(320, 1636 - 70 - natural));
  const gap = spare / 5;
  let y = center ? 330 : 360 + gap;
  const yH1 = f.headline1 ? y : y - h1Size;
  y = yH1 + (f.headline2 ? h2Size * 0.98 : 0);
  const yH2 = y;
  const ySwoosh = y + 44;
  const swW = Math.min(center ? 560 : 520, Math.max(300, measure(f.headline2 || f.headline1, h2Size, 0.62) * 0.75));
  const swX = center ? W / 2 - swW / 2 : left;
  const subSize = fit(f.sub, 38, 0.56, colW);
  const ySub = ySwoosh + 74;

  // ---- Info column (hero-right) or row (hero-center) ----
  const points = [f.point1, f.point2, f.point3].filter((p) => p.trim());
  const cardY = ySub + 64 + gap;
  const cardH = points.length ? 104 + points.length * 66 : 0;
  const cardW = 560;
  const labelW = measure(f.cardTitle.toUpperCase(), 22, 0.66, 3) + 56;
  const dateY = cardY + cardH + (cardH ? 34 + gap : 0);
  const dateW = Math.max(230, measure(f.date, 34, 0.6) + 60);
  const timeW = Math.max(150, measure(f.time, 30, 0.6) + 50);
  const placeY = dateY + 120;
  const ctaY = (f.place.trim() ? placeY + 50 : dateY + 110) + 14 + gap;
  const ctaSize = fit(f.cta.toUpperCase(), 28, 0.68, 480);
  const ctaW = measure(f.cta.toUpperCase(), ctaSize, 0.66, 2) + 90;

  // ---- Hero placement ----
  const heroBox: Box =
    spec.images.hero.box ??
    (center
      ? { x: 150, y: 770, w: 940, h: 760 }
      : spec.images.hero.kind === "person"
        ? { x: 500, y: 470, w: 820, h: 1284 }
        : { x: 470, y: 600, w: 860, h: 1000 });
  const heroAlign = spec.images.hero.kind === "person" ? "xMidYMax meet" : "xMidYMid meet";
  const hero = opts.photo ?? spec.images.hero.src;

  // Giant word behind the hero, reading upwards along the right edge (or across, behind a centred hero).
  const ghost = (spec.ghost ?? "").toUpperCase();
  const ghostSize = center ? fit(ghost, 300, 0.74, 1180) : fit(ghost, 330, 0.74, 1350);
  const ghostBody = ghost
    ? center
      ? txt(ghost, W / 2, 1000, { size: ghostSize, weight: 900, fill: accent, anchor: "middle", opacity: 0.85 })
      : txt(ghost, 1240 - 24, 980, { size: ghostSize, weight: 900, fill: accent, anchor: "middle", opacity: 0.92 })
    : "";

  const defs = `<defs>
    <linearGradient id="shadeX" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${dark}" stop-opacity="${shade + 0.3}"/><stop offset=".42" stop-color="${dark}" stop-opacity="${shade}"/><stop offset=".7" stop-color="${dark}" stop-opacity="${shade * 0.2}"/><stop offset="1" stop-color="${dark}" stop-opacity="0"/></linearGradient>
    <linearGradient id="shadeY" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dark}" stop-opacity="${center ? shade + 0.2 : 0.55}"/><stop offset="${center ? 0.42 : 0.2}" stop-color="${dark}" stop-opacity="${center ? shade * 0.5 : 0}"/><stop offset=".7" stop-color="${dark}" stop-opacity="0"/><stop offset="1" stop-color="${dark}" stop-opacity=".85"/></linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".16"/><stop offset="1" stop-color="#FFFFFF" stop-opacity=".05"/></linearGradient>
    <linearGradient id="streak" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${accent}" stop-opacity="0"/><stop offset=".5" stop-color="${accent}"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></linearGradient>
    <radialGradient id="ground"><stop offset="0" stop-color="#000" stop-opacity=".75"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    <filter id="blur30" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30"/></filter>
    <filter id="heroShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000" flood-opacity=".55"/></filter>
    <filter id="tshadow" x="-10%" y="-30%" width="120%" height="160%"><feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity=".55"/></filter>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="#000" flood-opacity=".35"/></filter>
  </defs>`;

  const extras = spec.images.extras ?? [];
  const placed = (list: Placed[]) =>
    list.map((p) => (p.rotate ? `<g transform="rotate(${p.rotate} ${p.x + p.w / 2} ${p.y + p.h / 2})">` : "<g>") + img(p, "xMidYMid meet", ` filter="url(#heroShadow)"${p.opacity != null ? ` opacity="${p.opacity}"` : ""}`) + "</g>").join("");

  // Contact bar
  const barY = 1636;
  const phoneW = f.phone.trim() ? 92 + measure(f.phone, 34, 0.6) : 0;

  const body =
    g("Background photo", `<image href="${src(spec.images.bg)}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>`) +
    g("Shade", (center ? "" : `<rect width="${W}" height="${H}" fill="url(#shadeX)"/>`) + `<rect width="${W}" height="${H}" fill="url(#shadeY)"/>`) +
    g(
      "Light streaks",
      `<g filter="url(#blur30)" opacity=".55"><rect x="-200" y="${center ? 520 : 140}" width="900" height="26" fill="url(#streak)" transform="rotate(-24 250 300)"/><rect x="620" y="1300" width="900" height="20" fill="url(#streak)" transform="rotate(-24 1070 1310)"/></g>`,
    ) +
    g("Big word", ghostBody, !center && ghost ? ` transform="rotate(-90 ${1240 - 24} 980)"` : "") +
    g("Cut-outs (back)", placed(extras.filter((e) => !e.front))) +
    g("Ground shadow", spec.images.hero.kind === "object" ? `<ellipse cx="${heroBox.x + heroBox.w / 2}" cy="${heroBox.y + heroBox.h * 0.93}" rx="${heroBox.w * 0.42}" ry="${heroBox.h * 0.06}" fill="url(#ground)"/>` : "") +
    g("Main photo", img({ src: hero, ...heroBox }, heroAlign, ' filter="url(#heroShadow)"')) +
    g("Cut-outs (front)", placed(extras.filter((e) => e.front))) +
    g("Overlay", (spec.images.overlays ?? []).map((o) => `<image href="${src(o.src)}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice" opacity="${o.opacity ?? 1}"/>`).join("")) +
    // Brand, top left; tag, top right.
    (f.brand.trim()
      ? g("Logo mark", `<circle cx="${left + 34}" cy="112" r="34" fill="${accent}"/>`) +
        g("Logo letter", txt(f.brand.trim()[0].toUpperCase(), left + 34, 126, { size: 38, weight: 900, fill: ink, anchor: "middle" })) +
        g("Brand name", txt(f.brand, left + 84, f.brandSub.trim() ? 108 : 124, { size: fit(f.brand, 34, 0.62, 520), weight: 800, fill: "#FFFFFF" })) +
        g("Brand line", txt(f.brandSub.toUpperCase(), left + 86, 140, { size: 18, weight: 500, fill: "#FFFFFF", ls: 4, opacity: 0.75 }))
      : "") +
    (f.kicker.trim()
      ? (() => {
          const k = f.kicker.toUpperCase();
          const kw = measure(k, 20, 0.66, 3) + 50;
          return g("Tag frame", `<rect x="${1160 - kw}" y="86" width="${kw}" height="52" rx="26" fill="${dark}" fill-opacity=".35" stroke="${accent}" stroke-width="2.5"/>`) +
            g("Tag", txt(k, 1160 - kw / 2, 119, { size: 20, weight: 600, fill: "#FFFFFF", ls: 3, anchor: "middle" }));
        })()
      : "") +
    // Headline
    g("Headline 1", txt(f.headline1, hx, yH1, { size: h1Size, weight: 900, fill: "#FFFFFF", ls: -2, anchor, shadow: true })) +
    g("Headline 2", txt(f.headline2, hx, yH2, { size: h2Size, weight: 900, fill: accent, ls: -2, anchor, shadow: true })) +
    g("Swoosh", `<path d="M${swX} ${ySwoosh + 8} C ${swX + swW * 0.3} ${ySwoosh - 14}, ${swX + swW * 0.7} ${ySwoosh - 10}, ${swX + swW} ${ySwoosh - 22}" fill="none" stroke="${accent}" stroke-width="9" stroke-linecap="round"/><path d="M${swX + swW * 0.18} ${ySwoosh + 22} C ${swX + swW * 0.45} ${ySwoosh + 8}, ${swX + swW * 0.7} ${ySwoosh + 8}, ${swX + swW * 0.86} ${ySwoosh}" fill="none" stroke="#FFFFFF" stroke-opacity=".8" stroke-width="5" stroke-linecap="round"/>`) +
    g("Sub line", txt(f.sub, hx + (center ? 0 : 4), ySub, { size: subSize, weight: 500, fill: "#FFFFFF", opacity: 0.92, anchor, shadow: true })) +
    // Highlights card
    (points.length
      ? center
        ? (() => {
            // One row of tick chips under the sub line.
            const chipSize = 24;
            const widths = points.map((p) => measure(p, chipSize, 0.6) + 92);
            const total = widths.reduce((a, b) => a + b, 0) + (points.length - 1) * 18;
            let cx = W / 2 - total / 2;
            const chips = points.map((p, i) => {
              const x = cx;
              cx += widths[i] + 18;
              return { p, x, w: widths[i] };
            });
            const cy = ySub + 46;
            return g("Card", chips.map((c) => `<rect x="${c.x}" y="${cy}" width="${c.w}" height="60" rx="30" fill="url(#glass)" stroke="#FFFFFF" stroke-opacity=".3" stroke-width="1.5"/>`).join("")) +
              g("Ticks", chips.map((c) => `<circle cx="${c.x + 32}" cy="${cy + 30}" r="17" fill="${accent}"/>` + ICONS.check(c.x + 32, cy + 30, ink).replace('stroke-width="5"', 'stroke-width="4"')).join("")) +
              chips.map((c, i) => g(`Point ${i + 1}`, txt(c.p, c.x + 62, cy + 39, { size: chipSize, weight: 600, fill: "#FFFFFF" }))).join("");
          })()
        : g("Card", `<rect x="${left}" y="${cardY}" width="${cardW}" height="${cardH}" rx="28" fill="${dark}" fill-opacity=".45"/><rect x="${left}" y="${cardY}" width="${cardW}" height="${cardH}" rx="28" fill="url(#glass)" stroke="#FFFFFF" stroke-opacity=".28" stroke-width="1.5"/>`, ' filter="url(#soft)"') +
          (f.cardTitle.trim()
            ? g("Card label frame", `<rect x="${left + 32}" y="${cardY - 26}" width="${labelW}" height="52" rx="26" fill="#FFFFFF"/>`) +
              g("Card label", txt(f.cardTitle.toUpperCase(), left + 32 + labelW / 2, cardY + 8, { size: 22, weight: 700, fill: dark, ls: 3, anchor: "middle" }))
            : "") +
          g("Ticks", points.map((_, i) => `<circle cx="${left + 58}" cy="${cardY + 84 + i * 66}" r="20" fill="${accent}"/>` + ICONS.check(left + 58, cardY + 84 + i * 66, ink)).join("")) +
          points.map((p, i) => g(`Point ${i + 1}`, txt(p, left + 96, cardY + 96 + i * 66, { size: fit(p, 32, 0.56, 430), weight: 600, fill: "#FFFFFF" }))).join("")
      : "") +
    // Date, time, place
    (center
      ? (() => {
          const rx = 1120 - (f.time.trim() ? timeW + 16 : 0) - (f.date.trim() ? dateW : 0);
          return (f.date.trim()
            ? g("Date frame", `<rect x="${rx}" y="1478" width="${dateW}" height="78" rx="18" fill="${dark}" fill-opacity=".6" stroke="${accent}" stroke-width="2.5"/>`) +
              g("Date", txt(f.date, rx + dateW / 2, 1529, { size: fit(f.date, 34, 0.6, 360), weight: 700, fill: "#FFFFFF", anchor: "middle" }))
            : "") +
            (f.time.trim()
              ? g("Time frame", `<rect x="${1120 - timeW}" y="1478" width="${timeW}" height="78" rx="18" fill="${accent}"/>`) +
                g("Time", txt(f.time, 1120 - timeW / 2, 1528, { size: 30, weight: 800, fill: ink, anchor: "middle" }))
              : "") +
            (f.place.trim() ? g("Place", txt(f.place, W / 2, 1606, { size: fit(f.place, 24, 0.56, 1000), weight: 600, fill: "#FFFFFF", anchor: "middle", shadow: true })) : "");
        })()
      : (f.date.trim()
          ? g("Date frame", `<rect x="${left}" y="${dateY}" width="${dateW}" height="78" rx="18" fill="${dark}" fill-opacity=".55" stroke="${accent}" stroke-width="2.5"/>`) +
            g("Date", txt(f.date, left + dateW / 2, dateY + 51, { size: fit(f.date, 34, 0.6, 360), weight: 700, fill: "#FFFFFF", anchor: "middle" }))
          : "") +
        (f.time.trim()
          ? g("Time frame", `<rect x="${left + dateW + 16}" y="${dateY}" width="${timeW}" height="78" rx="18" fill="${accent}"/>`) +
            g("Time", txt(f.time, left + dateW + 16 + timeW / 2, dateY + 50, { size: 30, weight: 800, fill: ink, anchor: "middle" }))
          : "") +
        (f.place.trim()
          ? g("Place icon", ICONS.pin(left + 14, placeY - 8, accent)) +
            g("Place", txt(f.place, left + 44, placeY + 2, { size: fit(f.place, 28, 0.56, 560), weight: 600, fill: "#FFFFFF", shadow: true }))
          : "")) +
    // Call to action
    (f.cta.trim()
      ? (() => {
          const bx = center ? 120 : left;
          const by = center ? 1480 : ctaY;
          return g("Button", `<rect x="${bx}" y="${by}" width="${ctaW}" height="76" rx="38" fill="${accent}"/>`, ' filter="url(#soft)"') +
            g("Button text", txt(f.cta.toUpperCase(), bx + ctaW / 2, by + 48, { size: ctaSize, weight: 700, fill: ink, ls: 2, anchor: "middle" }));
        })()
      : "") +
    // Contact bar
    (f.phone.trim() || f.social.trim()
      ? g("Bar", `<rect x="60" y="${barY}" width="1120" height="92" rx="46" fill="#FFFFFF"/>`, ' filter="url(#soft)"') +
        g(
          "Contact icons",
          (f.phone.trim() ? `<circle cx="112" cy="${barY + 46}" r="32" fill="${accent}"/>` + ICONS.phone(112, barY + 46, ink) : "") +
            (f.social.trim() ? `<rect x="${phoneW ? 118 + phoneW : 76}" y="${barY + 12}" width="${1164 - (phoneW ? 118 + phoneW : 76)}" height="68" rx="34" fill="${accent}"/>` + ICONS.insta((phoneW ? 118 + phoneW : 76) + 46, barY + 46, ink) : ""),
        ) +
        g("Phone", txt(f.phone, 162, barY + 58, { size: 34, weight: 700, fill: dark })) +
        g("Social", txt(f.social, (phoneW ? 118 + phoneW : 76) + 80, barY + 56, { size: fit(f.social, 28, 0.56, 1000 - phoneW - 120), weight: 500, fill: ink }))
      : "");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${opts.width ?? W}" height="${opts.height ?? H}">${fonts}${defs}${body}</svg>`;
}
