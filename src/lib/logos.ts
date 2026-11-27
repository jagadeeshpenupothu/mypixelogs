import data from "@/data/logos.json";

/** One free logo: source in logos/<slug>.svg, downloads in public/logos/<slug>/ (scripts/logos/build.mjs). */
export type Logo = {
  slug: string;
  title: string;
  /** The placeholder business name shown in the logo. */
  name: string;
  style: LogoStyleSlug;
  industry: string;
  description: string;
  colors: { name: string; hex: string }[];
  fonts: { family: string; weight: number }[];
  previewBg: string;
  published: string;
  keywords?: string[];
};

export const LOGO_STYLES = [
  { slug: "emblem", name: "Emblem", about: "Text and symbol inside one closed shape, like a seal or crest. Classic for schools, cafes, clubs and heritage brands." },
  { slug: "badge", name: "Vintage badge", about: "Retro badge with ribbons, stars or 'EST.' lines. Popular with barbers, breweries, bakeries and outdoor brands." },
  { slug: "wordmark", name: "Wordmark", about: "The business name alone, in carefully chosen lettering. Works for short, memorable names." },
  { slug: "lettermark", name: "Lettermark", about: "Initials only, for long names: think two or three letters built into a strong shape." },
  { slug: "monogram", name: "Monogram", about: "Interlocking initials, often elegant. Used for fashion, jewellery, weddings and law firms." },
  { slug: "pictorial", name: "Pictorial mark", about: "A recognisable icon (a leaf, a tooth, a house) with the name beside or below it." },
  { slug: "abstract", name: "Abstract mark", about: "A geometric symbol that suggests an idea rather than showing an object. Common for tech and finance." },
  { slug: "combination", name: "Combination mark", about: "Symbol and name designed to work together and apart. The most versatile style for small businesses." },
  { slug: "mascot", name: "Mascot", about: "A friendly character that represents the brand. Great for food, kids, sports teams and gaming." },
  { slug: "negative-space", name: "Negative space", about: "A clever second shape hidden in the empty space of the first. Memorable and premium." },
  { slug: "line-art", name: "Line art", about: "A symbol drawn with one even stroke weight. Light, modern and calm: wellness, interiors, cafes." },
  { slug: "gradient", name: "Modern gradient", about: "A bold symbol filled with a vivid colour gradient. Apps, startups and digital services." },
] as const;

export type LogoStyleSlug = (typeof LOGO_STYLES)[number]["slug"];

export const logos = (data as Logo[]).slice().sort((a, b) => b.published.localeCompare(a.published));

export const getLogo = (slug: string) => logos.find((l) => l.slug === slug);
export const styleOf = (slug: string) => LOGO_STYLES.find((s) => s.slug === slug);
export const logoFile = (l: Logo, ext: string) => `/logos/${l.slug}/${l.slug}${ext}`;
export const relatedLogos = (l: Logo, limit = 4) =>
  logos.filter((x) => x.slug !== l.slug).sort((a, b) => Number(b.style === l.style) - Number(a.style === l.style) || Number(b.industry === l.industry) - Number(a.industry === l.industry)).slice(0, limit);
