import "server-only";

import { analyticsStore, dayKey } from "@/lib/analytics/store";
import type { Hit } from "@/lib/analytics/types";

type Counts = Record<string, number>;
type Visitor = { c?: string; d?: string; b?: string; r?: string };

/** Everything for one day, added up. Past days are saved this way so they're only added up once. */
export type DaySummary = {
  date: string;
  pageViews: number;
  visitors: Record<string, Visitor>;
  sessions: number;
  pages: Record<string, { n: number; title: string }>;
  events: Counts;
  downloads: Counts;
  plays: Counts;
  searches: Counts;
  apps: Counts;
  exports: Counts;
  uploads: Counts;
  prompts: Counts;
};

const bump = (m: Counts, k: string | number | undefined, n = 1) => {
  if (k === undefined || k === "") return;
  m[String(k)] = (m[String(k)] ?? 0) + n;
};

async function rawHits(date: string): Promise<Hit[]> {
  const store = await analyticsStore();
  const keys = await store.list(`raw/${date}/`);
  const batches = await Promise.all(keys.map((k) => store.get(k) as Promise<Hit[] | null>));
  return batches.flatMap((b) => b ?? []).sort((a, b) => a.t - b.t);
}

function summarise(date: string, hits: Hit[]): DaySummary {
  const s: DaySummary = { date, pageViews: 0, visitors: {}, sessions: 0, pages: {}, events: {}, downloads: {}, plays: {}, searches: {}, apps: {}, exports: {}, uploads: {}, prompts: {} };
  const sessions = new Set<string>();
  for (const h of hits) {
    sessions.add(h.s);
    const v = (s.visitors[h.v] ??= {});
    v.c ??= h.c;
    v.d ??= h.d;
    v.b ??= h.b;
    if (h.r && !v.r) v.r = h.r;
    bump(s.events, h.e);
    const x = h.x ?? {};
    if (h.e === "page_view") {
      s.pageViews += 1;
      const pg = (s.pages[h.p] ??= { n: 0, title: h.ti ?? "" });
      pg.n += 1;
      if (h.ti) pg.title = h.ti;
    } else if (h.e === "asset_download") bump(s.downloads, x.file_name);
    else if (h.e === "audio_play") bump(s.plays, x.title);
    else if (h.e === "search") bump(s.searches, String(x.search_term ?? "").toLowerCase());
    else if (h.e === "open_in_app") bump(s.apps, x.app);
    else if (h.e === "export_click") bump(s.exports, `${x.label} · ${x.item ?? h.p}`);
    else if (h.e === "file_selected") bump(s.uploads, `${String(x.file_type ?? "?").toUpperCase()} on ${h.p}`);
    else if (h.e === "prompt_copy") bump(s.prompts, h.p.split("/").pop());
  }
  if (Object.keys(s.prompts).length === 0) {
    for (const h of hits) if (h.e === "open_in_app" && h.x?.app === "ChatGPT") bump(s.prompts, h.p.split("/").pop());
  }
  s.sessions = sessions.size;
  return s;
}

async function day(date: string, today: string): Promise<{ summary: DaySummary; hits: Hit[] }> {
  const store = await analyticsStore();
  if (date !== today) {
    const saved = (await store.get(`daily/${date}.json`)) as DaySummary | null;
    if (saved) return { summary: saved, hits: [] };
  }
  const hits = await rawHits(date);
  const summary = summarise(date, hits);
  if (date < today && hits.length) await store.set(`daily/${date}.json`, summary);
  return { summary, hits };
}

/** The most useful one-line detail of a hit for the activity list. */
function detailOf(h: Hit) {
  const x = h.x ?? {};
  for (const k of ["title", "file_name", "app", "search_term", "label", "file_type"]) if (x[k] !== undefined) return String(x[k]);
  if (h.e === "page_view") return h.r && h.r !== "direct" ? `${h.ti ?? ""} · from ${h.r}` : h.ti ?? "";
  return h.p.split("/").pop() ?? "";
}

const top = (m: Counts, n = 10) => Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, n);

export type Stats = Awaited<ReturnType<typeof getStats>>;

/** Stats for the last `days` days (1 = today), in Indian time. */
export async function getStats(days: number) {
  const now = Date.now();
  const today = dayKey(now);
  const dates = Array.from({ length: days }, (_, i) => dayKey(now - (days - 1 - i) * 86_400_000));
  const results = await Promise.all(dates.map((d) => day(d, today)));
  const todayHits = results.at(-1)?.summary.date === today ? results.at(-1)!.hits : await rawHits(today);

  const visitors: Record<string, Visitor> = {};
  const merged = { pages: {} as Counts, titles: {} as Record<string, string>, events: {} as Counts, downloads: {} as Counts, plays: {} as Counts, searches: {} as Counts, apps: {} as Counts, exports: {} as Counts, uploads: {} as Counts, prompts: {} as Counts };
  let pageViews = 0;
  let sessions = 0;
  for (const { summary: s } of results) {
    pageViews += s.pageViews;
    sessions += s.sessions;
    for (const [id, v] of Object.entries(s.visitors)) visitors[id] = { ...v, ...visitors[id] };
    for (const [p, { n, title }] of Object.entries(s.pages)) {
      bump(merged.pages, p, n);
      if (title) merged.titles[p] = title;
    }
    for (const k of ["events", "downloads", "plays", "searches", "apps", "exports", "uploads", "prompts"] as const) for (const [name, n] of Object.entries(s[k])) bump(merged[k], name, n);
  }
  const by = (f: (v: Visitor) => string | undefined) => {
    const m: Counts = {};
    for (const v of Object.values(visitors)) bump(m, f(v) ?? "Unknown");
    return top(m, 8);
  };

  return {
    range: days,
    updated: now,
    live: new Set(todayHits.filter((h) => now - h.t < 5 * 60_000).map((h) => h.v)).size,
    totals: { visitors: Object.keys(visitors).length, pageViews, sessions, downloads: merged.events.asset_download ?? 0, plays: merged.events.audio_play ?? 0, actions: Object.entries(merged.events).filter(([e]) => e !== "page_view").reduce((n, [, c]) => n + c, 0) },
    perDay: results.map(({ summary: s }) => ({ date: s.date, visitors: Object.keys(s.visitors).length, pageViews: s.pageViews })),
    pages: top(merged.pages, 12).map(([p, n]) => ({ path: p, title: merged.titles[p] || p, n })),
    countries: by((v) => v.c),
    devices: by((v) => v.d),
    browsers: by((v) => v.b),
    sources: by((v) => v.r),
    events: top(merged.events, 12),
    downloads: top(merged.downloads),
    plays: top(merged.plays),
    searches: top(merged.searches),
    apps: top(merged.apps),
    exports: top(merged.exports),
    uploads: top(merged.uploads),
    prompts: top(merged.prompts),
    recent: todayHits.slice(-40).reverse().map((h) => ({ t: h.t, e: h.e, p: h.p, c: h.c, d: h.d, detail: detailOf(h) })),
  };
}
