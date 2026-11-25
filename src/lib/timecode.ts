/** 3725.5 -> "01:02:05.500" */
export function formatTimecode(seconds: number): string {
  const total = Math.max(0, Math.round(seconds * 1000));
  const pad = (value: number, size = 2) => String(value).padStart(size, "0");
  return `${pad(Math.floor(total / 3600000))}:${pad(Math.floor(total / 60000) % 60)}:${pad(Math.floor(total / 1000) % 60)}.${pad(total % 1000, 3)}`;
}

/** Accepts HH:MM:SS.mmm, MM:SS or plain seconds. Returns null when it is not a time. */
export function parseTimecode(text: string): number | null {
  const parts = text.trim().replace(",", ".").split(":");
  if (parts.length > 3 || !/^\d+(\.\d*)?$|^\.\d+$/.test(parts[parts.length - 1])) return null;
  if (parts.slice(0, -1).some((part) => !/^\d+$/.test(part))) return null;
  const numbers = parts.map(Number);
  // In 1:75 the seconds are a mistake. A lone "75" is fine.
  if (numbers.slice(1).some((value) => value >= 60)) return null;
  return numbers.reduce((sum, value) => sum * 60 + value, 0);
}
