import "server-only";

import { analyticsStore, dayKey } from "@/lib/analytics/store";
import type { Hit } from "@/lib/analytics/types";

type Counts = Record<string, number>;

/** One person on one day (or across a range once merged). */
export type VisitorInfo = {
  id: string;
  c?: string;
  rg?: string;
  ci?: string;
  d?: string;
  b?: string;
  os?: string;
  r?: string;
  lang?: string;
  sw?: number;
  first: number;
  last: number;
  pageViews: number;
  actions: number;
  seconds: number;
  sessions: string[];
  /** Last steps: time, kind, page or detail. */
  journey: [number, string, string][];
};

/** Everything for one day, added up. Past days are saved this way so they're only added up once. */
export type DaySummary = {
  v: 2;
  date: string;
  pageViews: number;
  visitors: Record<string, VisitorInfo>;
  sessions: number;
  bounces: number;
  sessionSeconds: number;
  pages: Record<string, { n: number; title: string }>;
  hours: Record<string, { pv: number; v: string[] }>;
  entries: Counts;
  exits: Counts;
  sections: Counts;
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
const IST = 5.5 * 3600_000;
const hourOf = (t: number) => new Date(t + IST).getUTCHours();
const sectionOf = (p: string) => {
  const seg = p.split("/").filter(Boolean)[0];
  return { undefined: "Home", tools: "Tools", templates: "Templates", assets: "Assets", ai: "AI prompts" }[String(seg)] ?? (seg ? seg[0].toUpperCase() + seg.slice(1) : "Home");
};
const MAX_JOURNEY = 40;

/** Every stored key, from one listing call, so we never ask storage for things that don't exist (slow on Netlify). */
async function allKeys(): Promise<Set<string>> {
  const store = await analyticsStore();
  return new Set(await store.list(""));
}

async function rawHits(date: string, keysNow?: Set<string>): Promise<Hit[]> {
  const store = await analyticsStore();
  const keys = keysNow ? [...keysNow].filter((k) => k.startsWith(`raw/${date}/`)) : await store.list(`raw/${date}/`);
  const batches = await Promise.all(keys.map((k) => store.get(k) as Promise<Hit[] | null>));
  return batches.flatMap((b) => b ?? []).sort((a, b) => a.t - b.t);
}

function step(h: Hit): [number, string, string] {
  const x = h.x ?? {};
  const detail = String(x.title ?? x.file_name ?? x.app ?? x.search_term ?? x.label ?? x.file_type ?? "");
  return [h.t, h.e, h.e === "page_view" ? h.p : detail ? `${detail} · ${h.p}` : h.p];
}

function summarise(date: string, hits: Hit[]): DaySummary {
  const s: DaySummary = { v: 2, date, pageViews: 0, visitors: {}, sessions: 0, bounces: 0, sessionSeconds: 0, pages: {}, hours: {}, entries: {}, exits: {}, sections: {}, events: {}, downloads: {}, plays: {}, searches: {}, apps: {}, exports: {}, uploads: {}, prompts: {} };
  const sessions = new Map<string, { first: number; last: number; pages: string[]; seconds: number }>();
  for (const h of hits) {
    const x = h.x ?? {};
    const v = (s.visitors[h.v] ??= { id: h.v, first: h.t, last: h.t, pageViews: 0, actions: 0, seconds: 0, sessions: [], journey: [] });
    v.c ??= h.c;
    v.rg ??= h.rg;
    v.ci ??= h.ci;
    v.d ??= h.d;
    v.b ??= h.b;
    v.os ??= h.os;
    if (h.r && !v.r) v.r = h.r;
    if (x.lang && !v.lang) v.lang = String(x.lang);
    if (x.sw && !v.sw) v.sw = Number(x.sw);
    v.last = Math.max(v.last, h.t);
    if (!v.sessions.includes(h.s)) v.sessions.push(h.s);
    const ses = sessions.get(h.s) ?? { first: h.t, last: h.t, pages: [], seconds: 0 };
    ses.last = Math.max(ses.last, h.t);
    sessions.set(h.s, ses);
    bump(s.events, h.e);

    if (h.e === "page_time") {
      const sec = Number(x.seconds) || 0;
      v.seconds += sec;
      ses.seconds += sec;
      continue;
    }
    v.journey.push(step(h));
    if (v.journey.length > MAX_JOURNEY) v.journey.shift();
    if (h.e === "page_view") {
      s.pageViews += 1;
      v.pageViews += 1;
      ses.pages.push(h.p);
      const pg = (s.pages[h.p] ??= { n: 0, title: h.ti ?? "" });
      pg.n += 1;
      if (h.ti) pg.title = h.ti;
      const hr = (s.hours[hourOf(h.t)] ??= { pv: 0, v: [] });
      hr.pv += 1;
      if (!hr.v.includes(h.v)) hr.v.push(h.v);
      bump(s.sections, sectionOf(h.p));
      continue;
    }
    v.actions += 1;
    if (h.e === "asset_download") bump(s.downloads, x.file_name);
    else if (h.e === "audio_play") bump(s.plays, x.title);
    else if (h.e === "search") bump(s.searches, String(x.search_term ?? "").toLowerCase());
    else if (h.e === "open_in_app") bump(s.apps, x.app);
    else if (h.e === "export_click") bump(s.exports, `${x.label} · ${x.item ?? h.p}`);
    else if (h.e === "file_selected") bump(s.uploads, `${String(x.file_type ?? "?").toUpperCase()} on ${h.p}`);
    else if (h.e === "prompt_copy") bump(s.prompts, h.p.split("/").pop());
  }
  for (const ses of sessions.values()) {
    if (ses.pages.length) {
      bump(s.entries, ses.pages[0]);
      bump(s.exits, ses.pages.at(-1));
    }
    if (ses.pages.length <= 1) s.bounces += 1;
    s.sessionSeconds += Math.max(ses.seconds, (ses.last - ses.first) / 1000);
  }
  s.sessions = sessions.size;
  return s;
}

async function day(date: string, today: string, keys: Set<string>): Promise<{ summary: DaySummary; hits: Hit[] }> {
  const store = await analyticsStore();
  if (date !== today && keys.has(`daily/${date}.json`)) {
    const saved = (await store.get(`daily/${date}.json`)) as DaySummary | null;
    if (saved?.v === 2) return { summary: saved, hits: [] };
  }
  const hits = await rawHits(date, keys);
  const summary = summarise(date, hits);
  if (date < today && hits.length) await store.set(`daily/${date}.json`, summary);
  return { summary, hits };
}

const top = (m: Counts, n = 10) => Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, n);

const screenBucket = (w?: number) => (!w ? undefined : w < 640 ? "Phone (under 640 px)" : w < 1024 ? "Tablet (640–1023 px)" : w < 1440 ? "Laptop (1024–1439 px)" : "Large screen (1440 px+)");
const langName = (code?: string) => {
  if (!code) return undefined;
  try {
    return new Intl.DisplayNames(["en"], { type: "language" }).of(code) ?? code;
  } catch {
    return code;
  }
};

export type Stats = Awaited<ReturnType<typeof getStats>>;

/** Stats for the last `days` days (1 = today), in Indian time. */
export async function getStats(days: number) {
  const now = Date.now();
  const today = dayKey(now);
  const dates = Array.from({ length: days }, (_, i) => dayKey(now - (days - 1 - i) * 86_400_000));
  const keys = await allKeys();
  const results = await Promise.all(dates.map((d) => day(d, today, keys)));
  const todayHits = results.at(-1)?.summary.date === today ? results.at(-1)!.hits : await rawHits(today, keys);

  const visitors: Record<string, VisitorInfo> = {};
  const m = { pages: {} as Counts, titles: {} as Record<string, string>, entries: {} as Counts, exits: {} as Counts, sections: {} as Counts, events: {} as Counts, downloads: {} as Counts, plays: {} as Counts, searches: {} as Counts, apps: {} as Counts, exports: {} as Counts, uploads: {} as Counts, prompts: {} as Counts };
  let pageViews = 0;
  let sessions = 0;
  let bounces = 0;
  let sessionSeconds = 0;
  for (const { summary: s } of results) {
    pageViews += s.pageViews;
    sessions += s.sessions;
    bounces += s.bounces ?? 0;
    sessionSeconds += s.sessionSeconds ?? 0;
    for (const [id, v] of Object.entries(s.visitors)) {
      const prev = visitors[id];
      visitors[id] = prev
        ? { ...v, ...Object.fromEntries(Object.entries(prev).filter(([, val]) => val !== undefined)), first: Math.min(prev.first, v.first), last: Math.max(prev.last, v.last), pageViews: prev.pageViews + v.pageViews, actions: prev.actions + v.actions, seconds: prev.seconds + v.seconds, sessions: [...new Set([...prev.sessions, ...v.sessions])], journey: [...prev.journey, ...v.journey].slice(-MAX_JOURNEY) }
        : { ...v };
    }
    for (const [p, { n, title }] of Object.entries(s.pages)) {
      bump(m.pages, p, n);
      if (title) m.titles[p] = title;
    }
    for (const k of ["entries", "exits", "sections", "events", "downloads", "plays", "searches", "apps", "exports", "uploads", "prompts"] as const) for (const [name, n] of Object.entries(s[k] ?? {})) bump(m[k], name, n);
  }
  const vs = Object.values(visitors);
  const by = (f: (v: VisitorInfo) => string | undefined, n = 8) => {
    const c: Counts = {};
    for (const v of vs) bump(c, f(v) ?? "Unknown");
    return top(c, n);
  };
  const returning = vs.filter((v) => v.sessions.length > 1).length;
  const todaySummary = results.at(-1)!.summary;
  const titleOf = (p: string) => m.titles[p] || p;

  return {
    range: days,
    updated: now,
    live: new Set(todayHits.filter((h) => now - h.t < 5 * 60_000).map((h) => h.v)).size,
    totals: {
      visitors: vs.length,
      newVisitors: vs.length - returning,
      returning,
      pageViews,
      sessions,
      pagesPerVisit: sessions ? pageViews / sessions : 0,
      avgVisitSeconds: sessions ? sessionSeconds / sessions : 0,
      bounceRate: sessions ? bounces / sessions : 0,
      downloads: m.events.asset_download ?? 0,
      plays: m.events.audio_play ?? 0,
      actions: Object.entries(m.events).filter(([e]) => e !== "page_view" && e !== "page_time").reduce((n, [, c]) => n + c, 0),
    },
    perDay: results.map(({ summary: s }) => ({ date: s.date, visitors: Object.keys(s.visitors).length, pageViews: s.pageViews })),
    perHour: Array.from({ length: 24 }, (_, h) => ({ hour: h, visitors: todaySummary.hours?.[h]?.v.length ?? 0, pageViews: todaySummary.hours?.[h]?.pv ?? 0 })),
    pages: top(m.pages, 12).map(([p, n]) => ({ path: p, title: titleOf(p), n })),
    entries: top(m.entries, 8).map(([p, n]) => [titleOf(p), n] as [string, number]),
    exits: top(m.exits, 8).map(([p, n]) => [titleOf(p), n] as [string, number]),
    sections: top(m.sections, 8),
    countries: by((v) => v.c),
    cities: by((v) => (v.ci ? `${v.ci}${v.rg ? `, ${v.rg}` : ""}` : undefined), 10).filter(([k]) => k !== "Unknown"),
    devices: by((v) => v.d),
    os: by((v) => v.os),
    browsers: by((v) => v.b),
    screens: by((v) => screenBucket(v.sw)).filter(([k]) => k !== "Unknown"),
    languages: by((v) => langName(v.lang)).filter(([k]) => k !== "Unknown"),
    sources: by((v) => v.r),
    events: top(m.events, 12).filter(([e]) => e !== "page_time"),
    downloads: top(m.downloads),
    plays: top(m.plays),
    searches: top(m.searches),
    apps: top(m.apps),
    exports: top(m.exports),
    uploads: top(m.uploads),
    prompts: top(m.prompts),
    people: vs.sort((a, b) => b.last - a.last).slice(0, 60),
    recent: todayHits.filter((h) => h.e !== "page_time").slice(-40).reverse().map((h) => ({ t: h.t, e: h.e, p: h.p, c: h.c, ci: h.ci, d: h.d, detail: step(h)[2] === h.p ? h.ti ?? "" : step(h)[2] })),
  };
}
