import * as christmasPhoto from "@/lib/flyers/christmas-photo";
import specs from "@/data/flyer-specs.json";
import * as grandOpening from "@/lib/flyers/grand-opening";
import { POSTER_FONTS, POSTER_SECTIONS, POSTER_THEMES, posterSvg, type PosterSpec } from "@/lib/flyers/photo-poster";

type Fields = Record<string, string>;
type Theme = { name: string };

/** Everything the online editor needs to know about one flyer design. */
export type FlyerDesign = {
  defaults: Fields;
  themes: Record<string, Theme>;
  svg: (fields: Fields, theme: Theme, opts: { fonts?: Record<string, string>; photo?: string | null; bg?: string }) => string;
  fonts: [string, string, string][];
  /** Form sections: field key and label. */
  sections: { title: string; fields: [string, string][]; row?: boolean }[];
  /** Two colours that show a theme in the colour picker. */
  swatch: (theme: Theme) => [string, string];
  /** Background photo (designs built on a photo); the visitor's own photo replaces it. */
  bg?: string;
  photoLabel: string;
};

/* The design modules have exact field and theme types; the editor works with any of them. */
const loose = <T,>(x: T) => x as never;

export const FLYER_DESIGNS: Record<string, FlyerDesign> = {
  "grand-opening": {
    defaults: grandOpening.FLYER_DEFAULTS,
    themes: grandOpening.FLYER_THEMES,
    svg: loose(grandOpening.flyerSvg),
    fonts: grandOpening.FLYER_FONTS,
    sections: [
      { title: "Headline", fields: [["kicker", "Small line above"], ["h1", "Headline (script)"], ["h2", "Headline (bold)"], ["business", "Business name"]] },
      { title: "Offer badge", row: true, fields: [["offerTop", "Top"], ["offerBig", "Offer"], ["offerBottom", "Bottom"]] },
      { title: "Details", fields: [["date", "Date"], ["time", "Time"], ["place", "Venue"]] },
      { title: "Footer", fields: [["footer1", "Line 1"], ["footer2", "Line 2"]] },
    ],
    swatch: (t) => [(t as unknown as { main: string }).main, (t as unknown as { accent: string }).accent],
    photoLabel: "Photo in the arch",
  },
  "christmas-photo": {
    defaults: christmasPhoto.FLYER_DEFAULTS,
    themes: christmasPhoto.FLYER_THEMES,
    svg: loose(christmasPhoto.flyerSvg),
    fonts: christmasPhoto.FLYER_FONTS,
    sections: [
      { title: "Headline", fields: [["merry", "Top word"], ["christmas", "Script word"], ["tagline", "Line under the title"]] },
      { title: "Event", fields: [["kicker", "Small line"], ["event", "Event name"], ["details", "Date · time · venue"]] },
      { title: "Footer", fields: [["verse", "Verse or message"], ["logo", "Church or organisation name"]] },
    ],
    swatch: (t) => {
      const g = (t as unknown as { gold: readonly string[] }).gold;
      return [g[1], g[2]];
    },
    bg: christmasPhoto.FLYER_BG,
    photoLabel: "Background photo",
  },
  // Photo flyers made from settings files (src/data/flyer-specs.json), one design each: "poster:<slug>".
  ...Object.fromEntries(
    (specs as PosterSpec[]).map((spec): [string, FlyerDesign] => [
      `poster:${spec.slug}`,
      {
        defaults: spec.fields,
        themes: POSTER_THEMES,
        svg: loose((fields: PosterSpec["fields"], theme: (typeof POSTER_THEMES)[keyof typeof POSTER_THEMES], opts: object) => posterSvg(spec, fields, theme, opts)),
        fonts: POSTER_FONTS,
        sections: POSTER_SECTIONS,
        swatch: (t) => {
          const g = (t as unknown as { gold: readonly string[] }).gold;
          return [g[1], g[2]];
        },
        bg: spec.bg,
        photoLabel: "Background photo",
      },
    ]),
  ),
};
