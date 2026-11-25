const KEY = "mypixelogs:recent";
const MOST = 4;

/** Pages opened on this device, newest first. Nothing leaves the browser. */
export function readRecent(): string[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(saved) ? saved.filter((slug): slug is string => typeof slug === "string").slice(0, MOST) : [];
  } catch {
    return [];
  }
}

export function addRecent(slug: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify([slug, ...readRecent().filter((item) => item !== slug)].slice(0, MOST)));
  } catch {
    // Storage is off. The list is optional.
  }
}
