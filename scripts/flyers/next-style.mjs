// Picks today's flyer style so flyers don't look alike: a layout archetype, a type pairing and a colour mood,
// each the least used so far and never the same as the previous flyer.   node scripts/flyers/next-style.mjs
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const LAYOUTS = {
  "editorial-fullbleed": "One full-bleed natural photo fills the page; text sits in the photo's calm area; a slim info strip at the bottom. Like a magazine ad.",
  "split-screen": "Page split vertically or horizontally: one half a photo, the other half a solid or textured colour block holding all the text. Clean, modern.",
  "arch-window": "Photo shown inside one or two tall arch (rounded-top) frames on a warm textured background, with elegant serif text beside or below. Very Pinterest.",
  "magazine-cover": "Masthead across the top in huge type, a portrait photo filling the page behind/under it, short cover lines down one side, a price or date roundel.",
  "photo-collage": "3–4 photos in an asymmetric grid with thin gutters (one large, others small), a colour block with the headline. Good for food, fashion, events.",
  "typographic-poster": "Huge, tightly set headline as the hero (two or three stacked words), a smaller photo or cut-out overlapping the letters, lots of colour.",
  "circle-frame": "A large circular photo frame (or ring) as the centrepiece, decorative rings/ornaments around it, centred symmetrical text. Good for festivals and greetings.",
  "diagonal-dynamic": "Bold diagonal colour bands cutting across the page, a cut-out hero breaking out of the band, energetic type. Good for sales and sports.",
  "minimal-luxury": "Mostly empty space, one small elegant photo or product, thin rules, small serif type and generous letter-spacing. Quiet and premium.",
  "retail-burst": "Products as cut-outs on a podium or in a row, a big offer badge or starburst, price tags, strong contrast. Shop and supermarket style.",
  "polaroid-scrapbook": "Photos as tilted polaroid prints with tape, handwritten-style script accents, paper texture, doodles. Warm, personal, community events.",
  "event-ticket": "Layout styled like an event ticket or pass: perforated edge, stub with date/time/venue, a photo on the main part. Good for concerts, parties, shows.",
};

export const TYPE_PAIRS = {
  "playfair-montserrat": "Playfair Display (headings) + Montserrat (text): classic editorial",
  "bebas-inter": "Bebas Neue (headings) + Inter (text): tall, bold, modern",
  "cormorant-lato": "Cormorant Garamond (headings) + Lato (text): luxury, weddings",
  "dmserif-dmsans": "DM Serif Display (headings) + DM Sans (text): warm and friendly",
  "anton-poppins": "Anton (headings) + Poppins (text): loud retail and sports",
  "fraunces-worksans": "Fraunces (headings) + Work Sans (text): trendy, soft serif",
  "syne-manrope": "Syne (headings) + Manrope (text): contemporary, artsy",
  "greatvibes-raleway": "Great Vibes (accent script) + Raleway (headings and text): festive and elegant",
};

export const MOODS = {
  "warm-earthy": "terracotta, sand, olive, cream",
  "jewel-tones": "emerald, sapphire, ruby, gold",
  "pastel-soft": "blush, powder blue, lilac, butter yellow",
  "monochrome-accent": "black, white and greys with one bright accent",
  "festive-bright": "marigold, magenta, turquoise, saffron",
  "deep-night": "midnight navy, plum, with metallic gold or neon highlights",
  "fresh-natural": "leaf green, white, wood brown, sky blue",
  "bold-pop": "two strong complementary brights (e.g. electric blue + orange) on white",
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
  const flyers = JSON.parse(readFileSync(path.join(root, "src/data/designs.json"), "utf8")).filter((d) => d.category === "flyer" || d.category === "poster");
  const used = flyers.map((d) => d.style ?? {});
  const last = used.at(-1) ?? {};
  const pick = (key, options) => {
    const count = (o) => used.filter((u) => u[key] === o).length;
    const pool = Object.keys(options).filter((o) => o !== last[key]).sort((a, b) => count(a) - count(b) || Math.random() - 0.5);
    return pool[0];
  };
  const layout = pick("layout", LAYOUTS);
  const type = pick("type", TYPE_PAIRS);
  const mood = pick("mood", MOODS);
  console.log(JSON.stringify({ style: { layout, type, mood }, layout: LAYOUTS[layout], type: TYPE_PAIRS[type], mood: MOODS[mood], previous: last }, null, 1));
}
