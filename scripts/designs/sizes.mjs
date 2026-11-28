// Print sizes for hand-made designs. "vb" is the SVG viewBox (10 units per mm for stationery, including bleed);
// "mm" is the full artboard (trim + bleed on each side); "sides" 2 means a back side is required.
export const SIZES = {
  a4: { label: "A4", mm: [210, 297], mmLabel: "210 × 297 mm", vb: [1240, 1754], sides: 1, bleed: 0 },
  "business-card": {
    label: "Business card", mm: [96, 60], mmLabel: "90 × 54 mm", vb: [960, 600], sides: 2, bleed: 3,
    minLayers: 4, minTexts: 4, preview: { width: 760, radius: 10 },
  },
  "id-card": {
    label: "ID card (CR80, PVC)", mm: [60, 91.6], mmLabel: "54 × 85.6 mm", vb: [600, 916], sides: 2, bleed: 3,
    minLayers: 5, minTexts: 4, preview: { width: 430, radius: 18 },
  },
  letterhead: {
    label: "A4 letterhead", mm: [210, 297], mmLabel: "210 × 297 mm", vb: [2100, 2970], sides: 1, bleed: 0,
    minLayers: 5, minTexts: 4, preview: { width: 780, radius: 0 },
  },
  "c4-envelope": {
    label: "C4 envelope", mm: [324, 229], mmLabel: "324 × 229 mm (fits A4 unfolded)", vb: [3240, 2290], sides: 2, bleed: 0,
    minLayers: 4, minTexts: 3, preview: { width: 880, radius: 4 },
  },
};
