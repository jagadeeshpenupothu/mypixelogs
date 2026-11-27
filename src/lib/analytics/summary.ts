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
  v: 3;
  date: string;
  pageViews: number;
  visitors: Record<string, VisitorInfo>;
  sessions: number;
  bounces: number;
  sessionSeconds: number;
  /** Visits with 2+ pages, 10+ seconds, or a useful action. */
  engaged: number;
  /** Visits with a useful action (download, tool use, copy, open in app). */
  converted: number;
  pages: Record<string, { n: number; title: string }>;
  pageTime: Record<string, [number, number]>;
  pageActions: Counts;
  zeroSearches: Counts;
  notFound: Counts;
  vitals: { lcp: number[]; cls: number[]; inp: number[] };
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
/** Things a visitor does that show the site was useful to them. */
const KEY_ACTIONS = new Set(["asset_download", "open_in_app", "prompt_copy", "credit_copy", "export_click", "file_selected"]);
/** Events that are measurements, not visitor actions. */
const NOT_ACTIONS = new Set(["page_view", "page_time", "vitals", "not_found"]);

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
  const s: DaySummary = { v: 3, date, pageViews: 0, visitors: {}, sessions: 0, bounces: 0, sessionSeconds: 0, engaged: 0, converted: 0, pages: {}, pageTime: {}, pageActions: {}, zeroSearches: {}, notFound: {}, vitals: { lcp: [], cls: [], inp: [] }, hours: {}, entries: {}, exits: {}, sections: {}, events: {}, downloads: {}, plays: {}, searches: {}, apps: {}, exports: {}, uploads: {}, prompts: {} };
  const sessions = new Map<string, { first: number; last: number; pages: string[]; seconds: number; key: boolean }>();
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
    const ses = sessions.get(h.s) ?? { first: h.t, last: h.t, pages: [], seconds: 0, key: false };
    ses.last = Math.max(ses.last, h.t);
    sessions.set(h.s, ses);
    bump(s.events, h.e);

    if (h.e === "page_time") {
      const sec = Number(x.seconds) || 0;
      v.seconds += sec;
      ses.seconds += sec;
      const pt = (s.pageTime[h.p] ??= [0, 0]);
      pt[0] += sec;
      pt[1] += 1;
      continue;
    }
    if (h.e === "vitals") {
      if (s.vitals.lcp.length < 1000) {
        if (Number(x.lcp) > 0) s.vitals.lcp.push(Number(x.lcp));
        if (x.cls !== undefined) s.vitals.cls.push(Number(x.cls));
        if (Number(x.inp) > 0) s.vitals.inp.push(Number(x.inp));
      }
      continue;
    }
    if (h.e === "not_found") {
      bump(s.notFound, String(x.path ?? h.p));
      continue;
    }
    if (KEY_ACTIONS.has(h.e)) {
      ses.key = true;
      bump(s.pageActions, h.p);
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
    else if (h.e === "search") {
      bump(s.searches, String(x.search_term ?? "").toLowerCase());
      if (x.results !== undefined && Number(x.results) === 0) bump(s.zeroSearches, String(x.search_term ?? "").toLowerCase());
    }
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
    const secs = Math.max(ses.seconds, (ses.last - ses.first) / 1000);
    s.sessionSeconds += secs;
    if (ses.pages.length >= 2 || secs >= 10 || ses.key) s.engaged += 1;
    if (ses.key) s.converted += 1;
  }
  s.sessions = sessions.size;
  return s;
}

async function day(date: string, today: string, keys: Set<string>): Promise<{ summary: DaySummary; hits: Hit[] }> {
  const store = await analyticsStore();
  if (date !== today && keys.has(`daily/${date}.json`)) {
    const saved = (await store.get(`daily/${date}.json`)) as DaySummary | null;
    if (saved?.v === 3) return { summary: saved, hits: [] };
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

/** Headline numbers for a set of days (used for this period and the one before it). */
function periodTotals(list: DaySummary[]) {
  const ids = new Set<string>();
  let pageViews = 0, sessions = 0, engaged = 0, converted = 0, actions = 0;
  for (const s of list) {
    Object.keys(s.visitors).forEach((id) => ids.add(id));
    pageViews += s.pageViews;
    sessions += s.sessions;
    engaged += s.engaged ?? 0;
    converted += s.converted ?? 0;
    actions += Object.entries(s.events).filter(([e]) => !NOT_ACTIONS.has(e)).reduce((n, [, c]) => n + c, 0);
  }
  return { visitors: ids.size, pageViews, sessions, engaged, converted, actions };
}

const change = (now: number, before: number) => (before === 0 ? (now > 0 ? null : 0) : (now - before) / before);
const p75 = (xs: number[]) => {
  if (!xs.length) return null;
  const sorted = [...xs].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.75))];
};

/** Where a visit came from, grouped the way marketers read it. */
export function channelOf(r?: string) {
  const h = (r ?? "").toLowerCase();
  if (!h || h === "direct") return "Direct";
  if (/google\.|bing\.|duckduckgo|yahoo\.|yandex|ecosia|baidu|search\./.test(h)) return "Search engines";
  if (/chatgpt|openai|perplexity|gemini|copilot|claude\.ai|bard|you\.com|meta\.ai/.test(h)) return "AI assistants";
  if (/instagram|facebook|fb\.|whatsapp|wa\.me|youtube|youtu\.be|t\.co|twitter|x\.com|linkedin|pinterest|reddit|telegram|threads|snapchat|quora/.test(h)) return "Social & messaging";
  return "Other websites";
}

/** Countries whose visitors pay advertisers the most ("Tier 1" for ad networks). */
const TIER1 = new Set(["US", "GB", "CA", "AU", "NZ", "IE", "DE", "NL", "SE", "NO", "DK", "CH"]);

/** Stats for the last `days` days (1 = today), in Indian time. */
export async function getStats(days: number) {
  const now = Date.now();
  const today = dayKey(now);
  const dates = Array.from({ length: days }, (_, i) => dayKey(now - (days - 1 - i) * 86_400_000));
  const keys = await allKeys();
  const prevDates = Array.from({ length: days }, (_, i) => dayKey(now - (2 * days - 1 - i) * 86_400_000));
  const [results, prevResults] = await Promise.all([Promise.all(dates.map((d) => day(d, today, keys))), Promise.all(prevDates.map((d) => day(d, today, keys)))]);
  const todayHits = results.at(-1)?.summary.date === today ? results.at(-1)!.hits : await rawHits(today, keys);

  const visitors: Record<string, VisitorInfo> = {};
  const m = { pageTime: {} as Record<string, [number, number]>, pageActions: {} as Counts, zeroSearches: {} as Counts, notFound: {} as Counts, pages: {} as Counts, titles: {} as Record<string, string>, entries: {} as Counts, exits: {} as Counts, sections: {} as Counts, events: {} as Counts, downloads: {} as Counts, plays: {} as Counts, searches: {} as Counts, apps: {} as Counts, exports: {} as Counts, uploads: {} as Counts, prompts: {} as Counts };
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
    for (const k of ["entries", "exits", "sections", "events", "downloads", "plays", "searches", "apps", "exports", "uploads", "prompts", "pageActions", "zeroSearches", "notFound"] as const) for (const [name, n] of Object.entries(s[k] ?? {})) bump(m[k], name, n);
    for (const [p, [sec, n]] of Object.entries(s.pageTime ?? {})) {
      const t = (m.pageTime[p] ??= [0, 0]);
      t[0] += sec;
      t[1] += n;
    }
  }
  const vitals = { lcp: results.flatMap((r) => r.summary.vitals?.lcp ?? []), cls: results.flatMap((r) => r.summary.vitals?.cls ?? []), inp: results.flatMap((r) => r.summary.vitals?.inp ?? []) };
  const vs = Object.values(visitors);
  const by = (f: (v: VisitorInfo) => string | undefined, n = 8) => {
    const c: Counts = {};
    for (const v of vs) bump(c, f(v) ?? "Unknown");
    return top(c, n);
  };
  const returning = vs.filter((v) => v.sessions.length > 1).length;
  const cur = periodTotals(results.map((r) => r.summary));
  const prev = periodTotals(prevResults.map((r) => r.summary));

  // ---- Growth & earnings ----
  const channelCounts: Counts = {};
  for (const v of vs) bump(channelCounts, channelOf(v.r));
  const tier1 = vs.filter((v) => v.c && TIER1.has(v.c)).length;
  const tier1Share = vs.length ? tier1 / vs.length : 0;
  // A 30-day picture: the real 30 days, or the current pace scaled to 30 days.
  const monthly = { pageViews: Math.round((cur.pageViews / days) * 30), sessions: Math.round((cur.sessions / days) * 30) };
  // Rough display-ad income from public RPM benchmarks (USD per 1,000 page views): Tier-1 visitors ≈ $5–15, others ≈ $0.5–2.
  const rpmLow = tier1Share * 5 + (1 - tier1Share) * 0.5;
  const rpmHigh = tier1Share * 15 + (1 - tier1Share) * 2;
  const earnings = { rpmLow, rpmHigh, low: (monthly.pageViews / 1000) * rpmLow, high: (monthly.pageViews / 1000) * rpmHigh };
  const milestones = [
    { name: "Google AdSense", need: "No traffic minimum: original, useful content and policy-compliant pages", value: monthly.pageViews, target: 0, unit: "page views / month" },
    { name: "Mediavine Journey", need: "1,000 sessions a month", value: monthly.sessions, target: 1000, unit: "sessions / month" },
    { name: "Raptive", need: "25,000 page views a month", value: monthly.pageViews, target: 25000, unit: "page views / month" },
    { name: "Mediavine (full)", need: "50,000 sessions a month, about half from Tier-1 countries", value: monthly.sessions, target: 50000, unit: "sessions / month" },
  ];
  const engagementRate = cur.sessions ? cur.engaged / cur.sessions : 0;
  const conversionRate = cur.sessions ? cur.converted / cur.sessions : 0;
  const returningRate = vs.length ? returning / vs.length : 0;
  const searchShare = vs.length ? (channelCounts["Search engines"] ?? 0) / vs.length : 0;
  const bounceRate = sessions ? bounces / sessions : 0;
  const vitalsP75 = { lcp: p75(vitals.lcp), cls: p75(vitals.cls), inp: p75(vitals.inp), samples: vitals.lcp.length };

  // Plain-language tips, most important first. Only shown once there's enough data to mean something.
  const tips: string[] = [];
  if (cur.sessions >= 20) {
    if (returningRate < 0.15) tips.push(`Only ${Math.round(returningRate * 100)}% of visitors come back (aim for 15%+). Give them a reason to return: a WhatsApp channel or email list for new templates, and a "new this week" section.`);
    if (searchShare < 0.3) tips.push(`Search engines bring ${Math.round(searchShare * 100)}% of visitors. Free tools and templates grow mostly through Google: keep adding pages for things people search (see "Searches with no results"), and submit the sitemap in Google Search Console.`);
    if (bounceRate > 0.6) tips.push(`${Math.round(bounceRate * 100)}% of visits end after one page. Add "related templates/tools" links on the entry pages listed below.`);
    if (conversionRate < 0.2) tips.push(`Only ${Math.round(conversionRate * 100)}% of visits lead to a download or tool use. Make the main button on each page more obvious and faster to reach.`);
    if (tier1Share < 0.2) tips.push(`${Math.round(tier1Share * 100)}% of visitors are from high-paying ad countries (US/UK/CA/AU…). English templates for global needs (invoices, resumes, letters) raise ad earnings per visitor.`);
  } else tips.push("Tips appear once there are at least 20 visits in the selected period. Share the site (WhatsApp, Instagram) to get the first visitors.");
  if (Object.keys(m.notFound).length) tips.push("Some visitors hit pages that don't exist (see \"Broken links\"). Fix or redirect those links.");
  if (vitalsP75.lcp !== null && vitalsP75.lcp > 2500) tips.push(`Pages take ${(vitalsP75.lcp / 1000).toFixed(1)}s to show their main content for most visitors (Google's "good" is under 2.5s). Slow pages rank lower and earn less from ads.`);
  const todaySummary = results.at(-1)!.summary;
  const titleOf = (p: string) => m.titles[p] || p;

  return {
    growth: {
      compare: {
        visitors: { now: cur.visitors, before: prev.visitors, change: change(cur.visitors, prev.visitors) },
        pageViews: { now: cur.pageViews, before: prev.pageViews, change: change(cur.pageViews, prev.pageViews) },
        actions: { now: cur.actions, before: prev.actions, change: change(cur.actions, prev.actions) },
      },
      engagementRate,
      conversionRate,
      returningRate,
      channels: top(channelCounts, 6).map(([k, n]) => [k, n, vs.length ? n / vs.length : 0] as [string, number, number]),
      tier1Share,
      monthly,
      projected: days < 30,
      earnings,
      milestones,
      vitals: vitalsP75,
      zeroSearches: top(m.zeroSearches, 10),
      notFound: top(m.notFound, 10),
      holdingPages: Object.entries(m.pageTime).filter(([, [, n]]) => n >= 1).map(([p, [sec, n]]) => [titleOf(p), Math.round(sec / n)] as [string, number]).sort((a, b) => b[1] - a[1]).slice(0, 8),
      actionPages: top(m.pageActions, 8).map(([p, n]) => [titleOf(p), n] as [string, number]),
      tips,
    },
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
      actions: cur.actions,
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
    events: top(m.events, 14).filter(([e]) => !["page_time", "vitals"].includes(e)),
    downloads: top(m.downloads),
    plays: top(m.plays),
    searches: top(m.searches),
    apps: top(m.apps),
    exports: top(m.exports),
    uploads: top(m.uploads),
    prompts: top(m.prompts),
    people: vs.sort((a, b) => b.last - a.last).slice(0, 60),
    recent: todayHits.filter((h) => !["page_time", "vitals"].includes(h.e)).slice(-40).reverse().map((h) => ({ t: h.t, e: h.e, p: h.p, c: h.c, ci: h.ci, d: h.d, detail: step(h)[2] === h.p ? h.ti ?? "" : step(h)[2] })),
  };
}
