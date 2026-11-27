// Christmas service flyer (shared by the online editor and scripts/flyers/build.mjs).
// A4 portrait drawn at 1240 x 1754; exports render at 2x = 2480 x 3508 (300 dpi).
// Every part is drawn here (no stock photos), so each group becomes its own PSD layer.

export const FLYER_DEFAULTS = {
  logo: "YOUR CHURCH LOGO",
  merry: "MERRY",
  christmas: "Christmas",
  tagline: "CELEBRATING THE BIRTH OF JESUS CHRIST",
  kicker: "JOIN US FOR A",
  event: "Candlelight Carol Service",
  date: "24 DEC 2026",
  time: "7:00 PM",
  venue: "ST. MARK'S CHURCH, VIJAYAWADA",
  verse: "“For unto you is born this day a Saviour” — Luke 2:11",
};

export type FlyerFields = Record<keyof typeof FLYER_DEFAULTS, string>;

export const FLYER_THEMES = {
  night: { name: "Royal night", sky: ["#060A22", "#170A2C", "#3A0D1E", "#0C0408"], left: "#0F6B45", right: "#C8102E", gold: ["#FFF7D6", "#F6C453", "#B8741A"], cream: "#FFF3DA", hill: "#1E0E26", ground: "#0A050C" },
  crimson: { name: "Crimson", sky: ["#1A0408", "#4A0A14", "#6E1218", "#120305"], left: "#0F6B45", right: "#F0A020", gold: ["#FFF7D6", "#F7CF6A", "#C0821F"], cream: "#FFF3DA", hill: "#2A0A10", ground: "#0E0305" },
  evergreen: { name: "Evergreen", sky: ["#02140F", "#06281C", "#0E3A26", "#020A07"], left: "#C8102E", right: "#C8102E", gold: ["#FFF7D6", "#F2C75C", "#B07A1E"], cream: "#FFF3DA", hill: "#08231A", ground: "#020906" },
} as const;

export type FlyerTheme = (typeof FLYER_THEMES)[keyof typeof FLYER_THEMES];
export type FlyerOptions = { fonts?: Record<string, string>; photo?: string | null; width?: number | string; height?: number | string };

/** Fonts this design uses: CSS family|weight|style, file in /public/fonts/flyer, and the PostScript name Photoshop expects. */
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
  ["Sky", ["Night sky", "Colour glow", "Stars"]],
  ["Star of Bethlehem", ["Light beam", "Star glow", "Star"]],
  ["Landscape", ["Far hills", "Bethlehem town", "Palm trees", "Stable glow", "Stable", "Foreground"]],
  ["Atmosphere", ["Bokeh lights", "Snow"]],
  ["Headline", ["Logo frame", "Logo text", "Merry", "Christmas", "Flourish", "Tagline"]],
  ["Event details", ["Kicker", "Event name", "Date, time and venue", "Bible verse"]],
];

const W = 1240;

export function flyerSvg(f: FlyerFields, t: FlyerTheme, opts: FlyerOptions = {}): string {
  const esc = (s: string) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let seed = 20261224;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
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
  const g = (layer: string, name: string, body: string, attrs = "") => `<g data-layer="${layer}" data-name="${name}"${attrs}>${body}</g>`;

  const defs = `<defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.sky[0]}"/><stop offset=".42" stop-color="${t.sky[1]}"/><stop offset=".78" stop-color="${t.sky[2]}"/><stop offset="1" stop-color="${t.sky[3]}"/></linearGradient>
    <radialGradient id="glowL" cx="0" cy=".55" r=".75"><stop offset="0" stop-color="${t.left}" stop-opacity=".55"/><stop offset="1" stop-color="${t.left}" stop-opacity="0"/></radialGradient>
    <radialGradient id="glowR" cx="1" cy=".05" r=".7"><stop offset="0" stop-color="${t.right}" stop-opacity=".6"/><stop offset="1" stop-color="${t.right}" stop-opacity="0"/></radialGradient>
    <radialGradient id="halo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF1C2" stop-opacity=".75"/><stop offset=".35" stop-color="${t.gold[1]}" stop-opacity=".28"/><stop offset="1" stop-color="${t.gold[1]}" stop-opacity="0"/></radialGradient>
    <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF3C8" stop-opacity=".7"/><stop offset=".7" stop-color="${t.gold[1]}" stop-opacity=".16"/><stop offset="1" stop-color="${t.gold[1]}" stop-opacity="0"/></linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.gold[0]}"/><stop offset=".5" stop-color="${t.gold[1]}"/><stop offset="1" stop-color="${t.gold[2]}"/></linearGradient>
    <radialGradient id="stableLight" cx=".5" cy=".75" r=".7"><stop offset="0" stop-color="#FFE7A6"/><stop offset=".55" stop-color="#F3A33A"/><stop offset="1" stop-color="#9A3D12"/></radialGradient>
    <radialGradient id="spill" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFC765" stop-opacity=".55"/><stop offset="1" stop-color="#FFC765" stop-opacity="0"/></radialGradient>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.ground}" stop-opacity="0"/><stop offset=".35" stop-color="${t.ground}" stop-opacity=".85"/><stop offset="1" stop-color="${t.ground}"/></linearGradient>
    <filter id="b2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"/></filter>
    <filter id="b6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="b18" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18"/></filter>
    <filter id="b40" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"/></filter>
    <filter id="textGlow" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur in="SourceAlpha" stdDeviation="10" result="b"/><feFlood flood-color="${t.gold[1]}" flood-opacity=".55"/><feComposite in2="b" operator="in" result="glow"/><feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity=".55" in="SourceGraphic" result="shadow"/><feMerge><feMergeNode in="glow"/><feMergeNode in="shadow"/></feMerge></filter>
    <filter id="softShadow" x="-20%" y="-40%" width="140%" height="180%"><feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000" flood-opacity=".6"/></filter>
  </defs>`;

  // ---- Sky ----
  let stars = "";
  for (let i = 0; i < 170; i++) {
    const x = rnd() * W, y = rnd() * 1150, r = rnd() < 0.9 ? 0.8 + rnd() * 1.4 : 2 + rnd() * 1.6;
    stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#FFFFFF" opacity="${(0.3 + rnd() * 0.6).toFixed(2)}"/>`;
  }

  // ---- Star of Bethlehem: long lower ray, crossed by a smaller diagonal star ----
  const sx = 620, sy = 255;
  const ray = (len: number[], w: number) => `M${sx} ${sy - len[0]} L${sx + w} ${sy - w} L${sx + len[1]} ${sy} L${sx + w} ${sy + w} L${sx} ${sy + len[2]} L${sx - w} ${sy + w} L${sx - len[1]} ${sy} L${sx - w} ${sy - w}Z`;
  const star =
    `<path d="${ray([120, 95, 230], 14)}" fill="#FFF8E1"/>` +
    `<path d="${ray([52, 52, 52], 9)}" fill="#FFF8E1" transform="rotate(45 ${sx} ${sy})"/>` +
    `<circle cx="${sx}" cy="${sy}" r="16" fill="#FFFFFF"/>`;
  const starGlow =
    `<circle cx="${sx}" cy="${sy}" r="330" fill="url(#halo)"/>` +
    `<circle cx="${sx}" cy="${sy}" r="60" fill="#FFE9A8" opacity=".75" filter="url(#b18)"/>` +
    `<path d="${ray([150, 120, 300], 22)}" fill="#FFE3A0" opacity=".55" filter="url(#b6)"/>`;
  const beam =
    `<path d="M${sx - 10} ${sy + 40} L${sx + 10} ${sy + 40} L760 1440 L480 1440Z" fill="url(#beam)" opacity=".55" filter="url(#b18)"/>` +
    `<path d="M${sx - 4} ${sy + 40} L${sx + 4} ${sy + 40} L690 1430 L550 1430Z" fill="url(#beam)" opacity=".6" filter="url(#b6)"/>` +
    `<path d="M${sx - 6} ${sy + 30} L${sx} ${sy + 30} L300 1350 L250 1340Z" fill="url(#beam)" opacity=".18" filter="url(#b18)"/>` +
    `<path d="M${sx} ${sy + 30} L${sx + 6} ${sy + 30} L990 1340 L940 1350Z" fill="url(#beam)" opacity=".18" filter="url(#b18)"/>`;

  // ---- Landscape ----
  const farHills = `<path d="M0 1255 C140 1200 260 1230 380 1210 C520 1185 600 1235 720 1215 C860 1190 980 1180 1100 1215 C1170 1235 1210 1225 1240 1215 L1240 1754 L0 1754Z" fill="${t.hill}"/>`;
  const town = (() => {
    const c = "#12081A";
    let s = "";
    // Flat-roofed houses and domes on the hills either side of the stable, with warm lit windows.
    const houses: [number, number, number, number, boolean][] = [
      [40, 1215, 70, 55, false], [100, 1195, 56, 75, true], [150, 1222, 80, 48, false], [222, 1200, 46, 70, false], [262, 1210, 70, 60, true], [326, 1226, 60, 44, false], [372, 1214, 44, 56, false],
      [842, 1210, 54, 58, false], [890, 1196, 70, 72, true], [956, 1218, 60, 50, false], [1010, 1190, 48, 80, false], [1052, 1206, 78, 64, true], [1124, 1220, 56, 46, false], [1172, 1204, 60, 62, false],
    ];
    for (const [x, y0, w, h, dome] of houses) {
      let y = y0;
      const lift = Math.abs(x + w / 2 - 620) > 420 ? 0 : 18;
      y += lift;
      s += `<rect x="${x}" y="${y}" width="${w}" height="${1320 - y}" fill="${c}"/><rect x="${x - 2}" y="${y - 4}" width="${w + 4}" height="5" fill="${c}"/>`;
      if (dome) s += `<path d="M${x + 4} ${y} A${w / 2 - 4} ${w / 2 - 4} 0 0 1 ${x + w - 4} ${y}Z" fill="${c}"/><rect x="${x + w / 2 - 1.5}" y="${y - w / 2 - 14}" width="3" height="16" fill="${c}"/>`;
      const lit = Math.floor(rnd() * 3);
      for (let k = 0; k < lit; k++) s += `<rect x="${(x + 8 + rnd() * (w - 22)).toFixed(1)}" y="${(y + 10 + rnd() * (h - 26)).toFixed(1)}" width="7" height="10" rx="1.5" fill="#FFC864" opacity=".9"/>`;
    }
    return s;
  })();
  const palm = (x: number, y: number, h: number, lean: number) => {
    const c = "#0B050E";
    const top = [x + lean, y - h];
    let s = `<path d="M${x - 7} ${y} Q${x + lean * 0.3} ${y - h * 0.5} ${top[0] - 3} ${top[1]} L${top[0] + 3} ${top[1]} Q${x + lean * 0.3 + 8} ${y - h * 0.5} ${x + 7} ${y}Z" fill="${c}"/>`;
    for (const deg of [-168, -140, -112, -84, -58, -30, -6, 150, 28]) {
      const a = (deg * Math.PI) / 180, L = h * 0.55;
      const ex = top[0] + L * Math.cos(a), ey = top[1] + L * Math.sin(a) * 0.55 + L * 0.42;
      const cx = top[0] + L * 0.55 * Math.cos(a), cy = top[1] + L * 0.55 * Math.sin(a) * 0.6 - L * 0.12;
      s += `<path d="M${top[0]} ${top[1]} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)} Q${cx.toFixed(1)} ${(cy + L * 0.16).toFixed(1)} ${top[0]} ${top[1] + 7}Z" fill="${c}"/>`;
    }
    s += `<circle cx="${top[0]}" cy="${top[1] + 4}" r="7" fill="${c}"/>`;
    return s;
  };
  const stableGlow = `<ellipse cx="620" cy="1440" rx="330" ry="70" fill="url(#spill)"/><ellipse cx="620" cy="1380" rx="160" ry="110" fill="#FFB347" opacity=".35" filter="url(#b40)"/>`;
  const stable = (() => {
    const c = "#0D0610";
    return (
      `<rect x="512" y="1330" width="216" height="104" fill="url(#stableLight)"/>` +
      // Manger, Mary kneeling (left) and Joseph standing with a staff (right), in silhouette against the light.
      `<path d="M585 1434 L593 1408 L647 1408 L655 1434Z" fill="#2A1206"/><ellipse cx="620" cy="1406" rx="22" ry="6" fill="#FFF2C8"/>` +
      `<path d="M548 1434 C548 1412 553 1396 562 1388 C558 1378 561 1366 571 1364 C582 1362 588 1372 586 1382 C594 1392 598 1410 596 1434Z" fill="#2A1206"/>` +
      `<path d="M664 1434 L668 1388 C664 1376 668 1362 679 1360 C690 1359 695 1370 692 1381 C700 1392 702 1414 700 1434Z" fill="#2A1206"/><rect x="707" y="1352" width="4" height="82" fill="#2A1206" transform="rotate(4 709 1393)"/>` +
      // Posts, beams and thatched roof.
      `<rect x="500" y="1322" width="14" height="114" fill="${c}"/><rect x="726" y="1322" width="14" height="114" fill="${c}"/><rect x="613" y="1322" width="14" height="10" fill="${c}"/>` +
      `<path d="M470 1340 L620 1262 L770 1340 L752 1346 L620 1280 L488 1346Z" fill="${c}"/><path d="M482 1338 L620 1270 L758 1338 L742 1330 L620 1286 L498 1330Z" fill="${c}"/>` +
      `<rect x="512" y="1322" width="216" height="9" fill="${c}"/>`
    );
  })();
  const foreground = `<path d="M0 1400 C180 1360 330 1420 470 1432 C560 1440 680 1440 770 1432 C920 1418 1060 1370 1240 1392 L1240 1754 L0 1754Z" fill="${t.ground}"/><rect y="1430" width="${W}" height="324" fill="url(#shade)"/>`;

  // ---- Atmosphere ----
  let bokeh = "";
  const bokehColors = [t.gold[1], t.gold[1], t.right, t.left, "#FFFFFF"];
  for (let i = 0; i < 22; i++) {
    const x = rnd() * W, y = 80 + rnd() * 1500, r = 6 + rnd() * 26;
    bokeh += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${bokehColors[i % bokehColors.length]}" opacity="${(0.12 + rnd() * 0.22).toFixed(2)}" filter="url(#b2)"/>`;
  }
  let snow = "";
  for (let i = 0; i < 150; i++) {
    const x = rnd() * W, y = rnd() * 1754, r = 1.2 + rnd() * 3;
    snow += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#FFFFFF" opacity="${(0.35 + rnd() * 0.55).toFixed(2)}"${r > 3.4 ? ' filter="url(#b2)"' : ""}/>`;
  }

  // ---- Headline ----
  const goldFx = {
    gradientOverlay: [{ enabled: true, blendMode: "normal", opacity: 1, angle: 90, type: "linear", gradient: { name: "Gold", type: "solid", colorStops: t.gold.map((c, i) => ({ color: hex(c), location: [1, 0.5, 0][i], midpoint: 50 })), opacityStops: [{ opacity: 1, location: 0, midpoint: 50 }, { opacity: 1, location: 1, midpoint: 50 }] } }],
    outerGlow: { enabled: true, blendMode: "screen", color: hex(t.gold[1]), opacity: 0.55, size: { units: "Pixels", value: 40 } },
    dropShadow: [{ enabled: true, blendMode: "multiply", color: { r: 0, g: 0, b: 0 }, opacity: 0.55, angle: 90, distance: { units: "Pixels", value: 12 }, size: { units: "Pixels", value: 24 } }],
  };
  const flourish =
    `<g fill="none" stroke="url(#gold)" stroke-width="4" stroke-linecap="round">` +
    `<path d="M620 905 C560 885 500 935 430 912 C390 899 380 868 405 862 C425 858 432 884 412 890"/>` +
    `<path d="M620 905 C680 885 740 935 810 912 C850 899 860 868 835 862 C815 858 808 884 828 890"/>` +
    `<path d="M405 920 C360 930 320 925 290 912" stroke-width="2.5"/><path d="M835 920 C880 930 920 925 950 912" stroke-width="2.5"/></g>` +
    `<path d="M620 890 L634 905 L620 920 L606 905Z" fill="url(#gold)"/>`;

  const logoFrame = `<rect x="460" y="44" width="320" height="58" rx="29" fill="none" stroke="${t.gold[1]}" stroke-opacity=".75" stroke-width="2"/>`;

  const body =
    g("sky", "Night sky", `<rect width="${W}" height="1754" fill="url(#sky)"/>`) +
    g("colour", "Colour glow", `<rect width="${W}" height="1754" fill="url(#glowL)"/><rect width="${W}" height="1754" fill="url(#glowR)"/>`) +
    g("stars", "Stars", stars) +
    g("beam", "Light beam", beam) +
    g("starGlow", "Star glow", starGlow) +
    g("star", "Star", star) +
    g("hills", "Far hills", farHills) +
    g("town", "Bethlehem town", town) +
    g("palms", "Palm trees", palm(420, 1440, 210, -28) + palm(372, 1446, 150, -40) + palm(845, 1440, 230, 26) + palm(900, 1448, 160, 40)) +
    g("stableGlow", "Stable glow", stableGlow, ' transform="translate(620 1434) scale(1.3) translate(-620 -1434)"') +
    g("stable", "Stable", stable, ' transform="translate(620 1434) scale(1.3) translate(-620 -1434)"') +
    g("foreground", "Foreground", foreground) +
    g("bokeh", "Bokeh lights", bokeh) +
    g("snow", "Snow", snow) +
    g("logoFrame", "Logo frame", logoFrame) +
    g("logo", "Logo text", txt("logoT", f.logo, 620, 80, { family: "Cinzel", size: 17, weight: 700, fill: t.cream, ls: 3 })) +
    g("merry", "Merry", txt("merryT", f.merry, 620, 640, { family: "Cinzel Decorative", size: 128, weight: 900, fill: t.cream, ls: 8, filter: "softShadow", psdFx: { dropShadow: goldFx.dropShadow } })) +
    g("christmas", "Christmas", txt("christmasT", f.christmas, 620, 860, { family: "Great Vibes", size: 285, weight: 400, fill: "url(#gold)", filter: "textGlow", psdFill: t.gold[1], psdFx: goldFx })) +
    g("flourish", "Flourish", flourish) +
    g("tagline", "Tagline", txt("taglineT", f.tagline, 620, 990, { family: "Cinzel", size: 26, weight: 600, fill: t.cream, ls: 5, filter: "softShadow" })) +
    g("kicker", "Kicker", txt("kickerT", f.kicker, 620, 1530, { family: "Cinzel", size: 22, weight: 600, fill: t.gold[1], ls: 8 })) +
    g("event", "Event name", txt("eventT", f.event, 620, 1597, { family: "Playfair Display", size: 62, weight: 700, italic: true, fill: t.cream, filter: "softShadow" })) +
    g("details", "Date, time and venue", txt("detailsT", [f.date, f.time, f.venue].filter(Boolean).join("   ·   "), 620, 1655, { family: "Cinzel", size: 26, weight: 700, fill: t.gold[1], ls: 2 })) +
    g("verse", "Bible verse", txt("verseT", f.verse, 620, 1712, { family: "Playfair Display", size: 24, weight: 400, italic: true, fill: t.cream, ls: 0.5 }));

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 1754" width="${opts.width ?? W}" height="${opts.height ?? 1754}">${fonts}${defs}${body}</svg>`;
}

function hex(h: string) {
  return { r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16) };
}
