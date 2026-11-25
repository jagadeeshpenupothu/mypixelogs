/** Everyday words people type, and the words the site uses for them. */
const sameMeaning: Record<string, string[]> = {
  smaller: ["compress"], small: ["compress"], reduce: ["compress"], shrink: ["compress"], lower: ["compress"], size: ["compress", "resize"], mb: ["compress"], kb: ["compress"], whatsapp: ["compress", "wedding"],
  bigger: ["resize"], larger: ["resize"], resolution: ["resize"], dimensions: ["resize"],
  cut: ["trim", "crop"], clip: ["trim", "video"], shorten: ["trim"], split: ["trim", "extract"],
  mirror: ["flip"], reverse: ["flip"], sideways: ["rotate"], turn: ["rotate"], upside: ["rotate"],
  change: ["convert"], format: ["convert"], into: ["convert"],
  photo: ["image"], picture: ["image"], pic: ["image"], photos: ["image"], pictures: ["image"], images: ["image"],
  movie: ["video"], videos: ["video"], reel: ["video"], mp4: ["video"],
  bill: ["invoice"], billing: ["invoice"], receipt: ["invoice"],
  marriage: ["wedding"], pelli: ["wedding"], shaadi: ["wedding"], invite: ["wedding", "invitation"], card: ["invitation"],
  loan: ["emi"], installment: ["emi"], tax: ["gst"], birthday: ["age"], dob: ["age"], investment: ["sip", "fd"], mutual: ["sip"], deposit: ["fd"],
  typing: ["telugu"], translate: ["telugu"], barcode: ["qr"], scan: ["qr"], code: ["qr", "json"],
  animation: ["gif"], document: ["invoice", "pdf"], page: ["pdf"], pages: ["pdf"],
  background: ["image"], logo: ["psd", "image"], photoshop: ["psd"], chatgpt: ["prompt"], midjourney: ["prompt"],
};

const ignored = new Set(["a", "an", "the", "my", "to", "i", "want", "need", "make", "how", "do", "for", "of", "in", "on", "online", "free", "please", "and", "with", "can", "me", "it", "is", "from", "create", "get", "file"]);

export function searchWords(query: string) {
  const words = query.toLowerCase().split(/[^\p{L}\p{M}\p{N}]+/u).filter(Boolean);
  const useful = words.filter((word) => !ignored.has(word));
  return useful.length > 0 ? useful : words;
}

/** How well some texts match a search, best text first. Zero when a word is missing, unless `loose`. */
export function matchScore(words: string[], texts: string[], loose = false) {
  let total = 0;
  for (const word of words) {
    const options = [word, ...(sameMeaning[word] ?? [])];
    let best = 0;
    texts.forEach((text, place) => {
      const parts = text.toLowerCase().split(/[^\p{L}\p{M}\p{N}]+/u);
      const weight = 10 / (place + 1);
      options.forEach((option, order) => {
        const value = parts.includes(option) ? 1 : parts.some((part) => part.startsWith(option)) ? 0.8 : 0;
        best = Math.max(best, value * weight * (order === 0 ? 1 : 0.9));
      });
    });
    if (best === 0 && !loose) return 0;
    total += best;
  }
  return total / Math.max(1, words.length);
}
