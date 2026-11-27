import type { Metadata } from "next";
import Link from "next/link";

import { DailyChart } from "@/components/analytics/DailyChart";
import { GoogleSignIn, SignOutButton } from "@/components/analytics/GoogleSignIn";
import { StatsRefresher } from "@/components/analytics/StatsRefresher";
import { adminEmail, adminPassword, GOOGLE_CLIENT_ID, isAdmin } from "@/lib/analytics/auth";
import { getStats } from "@/lib/analytics/summary";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Website stats" };
export const dynamic = "force-dynamic";

const RANGES = [
  { days: 1, label: "Today" },
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
];

const EVENT_NAMES: Record<string, string> = {
  page_view: "Page views",
  asset_download: "Downloads",
  audio_play: "Music / SFX plays",
  open_in_app: "Opened in an app",
  prompt_copy: "Prompts copied",
  credit_copy: "Music credits copied",
  export_click: "Editor / tool exports",
  file_selected: "Files added to tools",
  search: "Searches",
  not_found: "Broken links hit",
};

const countryName = (code: string) => {
  if (code === "Unknown" || code.length !== 2) return code;
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
};
const flag = (code: string) => (code.length === 2 ? String.fromCodePoint(...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0))) : "");

const duration = (sec: number) => {
  const s = Math.round(sec);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return m < 60 ? `${m}m ${s % 60}s` : `${Math.floor(m / 60)}h ${m % 60}m`;
};
const timeIST = (t: number) => new Date(t).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
const dateIST = (t: number) => new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
const ago = (t: number, now: number) => {
  const m = Math.round((now - t) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} h ago` : dateIST(t);
};
const cap = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

const pct = (x: number) => `${Math.round(x * 100)}%`;
const money = (n: number) => (n < 10 ? `$${n.toFixed(2)}` : `$${Math.round(n).toLocaleString("en-US")}`);

function Change({ label, now, change, period }: { label: string; now: number; change: number | null; period: string }) {
  const up = change !== null && change > 0;
  const down = change !== null && change < 0;
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{now.toLocaleString("en-IN")}</p>
      <p className={cn("mt-0.5 text-xs font-medium", up ? "text-emerald-600 dark:text-emerald-400" : down ? "text-red-600 dark:text-red-400" : "text-muted-foreground")}>
        {change === null ? "New this period" : `${up ? "▲" : down ? "▼" : "■"} ${Math.abs(Math.round(change * 100))}% ${up ? "up" : down ? "down" : "same"} vs ${period}`}
      </p>
    </div>
  );
}

function Rate({ label, value, good, note }: { label: string; value: number; good: number; note: string }) {
  const ok = value >= good;
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{pct(value)}</p>
      <p className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
        <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.min(100, value * 100)}%` }} />
      </p>
      <p className="mt-1.5 text-xs text-muted-foreground">
        <span className={ok ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>{ok ? "✓ Healthy" : "! Below target"}</span> · {note}
      </p>
    </div>
  );
}

/** Core Web Vitals thresholds from Google: good / needs improvement / poor. */
function Vital({ label, value, unit, good, poor, note }: { label: string; value: number | null; unit: string; good: number; poor: number; note: string }) {
  const status = value === null ? null : value <= good ? "Good" : value <= poor ? "Needs work" : "Poor";
  const shown = value === null ? "–" : unit === "s" ? `${(value / 1000).toFixed(1)}s` : unit === "ms" ? `${Math.round(value)}ms` : value.toFixed(2);
  return (
    <div className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5">
      <span className="min-w-0">
        <span className="block text-sm text-foreground">{label}</span>
        <span className="block text-xs text-muted-foreground">{note}</span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block text-sm font-semibold tabular-nums text-foreground">{shown}</span>
        {status ? (
          <span className={cn("block text-xs font-medium", status === "Good" ? "text-emerald-600 dark:text-emerald-400" : status === "Poor" ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400")}>
            {status === "Good" ? "✓ " : "! "}
            {status}
          </span>
        ) : (
          <span className="block text-xs text-muted-foreground">no data yet</span>
        )}
      </span>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-base font-bold text-foreground">{title}</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  );
}

function Tile({ label, value, note }: { label: string; value: number | string; note?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">{typeof value === "number" ? value.toLocaleString("en-IN") : value}</p>
      {note ? <p className="mt-0.5 text-xs text-muted-foreground">{note}</p> : null}
    </div>
  );
}

/** A ranked list: label, count, and a light bar for scale (one colour; text stays in text colours). */
function Ranked({ title, rows, empty = "Nothing yet", format = (s: string) => s }: { title: string; rows: [string, number][]; empty?: string; format?: (s: string) => React.ReactNode }) {
  const max = Math.max(1, ...rows.map(([, n]) => n));
  return (
    <section className="min-w-0 rounded-xl border border-border bg-card p-4">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {rows.length ? (
        <ul className="mt-3 space-y-1.5">
          {rows.map(([k, n]) => (
            <li key={k} className="relative flex items-center justify-between gap-3 overflow-hidden rounded-md px-2 py-1 text-sm">
              <span className="absolute inset-y-0 left-0 rounded-md bg-primary/10" style={{ width: `${(n / max) * 100}%` }} aria-hidden="true" />
              <span className="relative min-w-0 truncate text-foreground">{format(k)}</span>
              <span className="relative shrink-0 tabular-nums text-muted-foreground">{n.toLocaleString("en-IN")}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">{empty}</p>
      )}
    </section>
  );
}

export default async function StatsPage({ searchParams }: { searchParams: Promise<{ range?: string; wrong?: string }> }) {
  const { range, wrong } = await searchParams;
  if (!(await isAdmin())) {
    const google = Boolean(GOOGLE_CLIENT_ID && adminEmail());
    const password = Boolean(adminPassword());
    return (
      <div className="mx-auto mt-16 grid max-w-sm gap-4 rounded-xl border border-border bg-card p-6 text-center">
        <h1 className="text-lg font-bold text-foreground">Website stats</h1>
        <p className="text-sm text-muted-foreground">Private page for the site owner.</p>
        {password ? (
          <form action="/api/admin/password" method="post" className="grid gap-2 text-left">
            <label className="grid gap-1 text-sm font-medium text-muted-foreground">
              Password
              <input type="password" name="password" required autoFocus autoComplete="current-password" className="h-10 rounded-lg border border-border bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70" />
            </label>
            {wrong ? <p className="text-sm text-destructive">Wrong password.</p> : null}
            <button className="h-10 rounded-lg bg-primary font-semibold text-primary-foreground">Open stats</button>
          </form>
        ) : null}
        {password && google ? <p className="text-xs text-muted-foreground">or</p> : null}
        {google ? <GoogleSignIn clientId={GOOGLE_CLIENT_ID} /> : null}
        {!password && !google ? <p className="text-sm leading-6 text-muted-foreground">Sign-in isn&apos;t set up yet: add ADMIN_PASSWORD (or GOOGLE_CLIENT_ID and ADMIN_EMAIL) in Netlify&apos;s environment variables.</p> : null}
      </div>
    );
  }

  const days = RANGES.find((r) => String(r.days) === range)?.days ?? 7;
  const s = await getStats(days);

  return (
    <div className="pb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-foreground">Website stats</h1>
          <StatsRefresher updated={s.updated} />
          <SignOutButton />
        </div>
        <nav aria-label="Time range" className="flex gap-1 rounded-full border border-border bg-card p-1">
          {RANGES.map((r) => (
            <Link key={r.days} prefetch={false} href={`/admin/stats?range=${r.days}`} className={cn("rounded-full px-3 py-1 text-sm font-medium", r.days === days ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              {r.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile label="On the site now" value={s.live} note="last 5 minutes" />
        <Tile label="Visitors" value={s.totals.visitors} note={`${s.totals.newVisitors} new · ${s.totals.returning} returning`} />
        <Tile label="Visits" value={s.totals.sessions} note={`${s.totals.pagesPerVisit.toFixed(1)} pages per visit`} />
        <Tile label="Page views" value={s.totals.pageViews} />
        <Tile label="Average visit" value={duration(s.totals.avgVisitSeconds)} note="time on the site" />
        <Tile label="Bounce rate" value={`${Math.round(s.totals.bounceRate * 100)}%`} note="left after one page" />
        <Tile label="Downloads" value={s.totals.downloads} />
        <Tile label="Actions" value={s.totals.actions} note="downloads, plays, copies…" />
      </div>

      {(() => {
        const g = s.growth;
        const period = days === 1 ? "yesterday" : `previous ${days} days`;
        return (
          <section className="mt-8">
            <h2 className="text-base font-bold text-foreground">Growth &amp; earnings</h2>
            <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
              <p className="text-sm font-semibold text-foreground">What to work on next</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-foreground">
                {g.tips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <Change label="Visitors" now={g.compare.visitors.now} change={g.compare.visitors.change} period={period} />
              <Change label="Page views" now={g.compare.pageViews.now} change={g.compare.pageViews.change} period={period} />
              <Change label="Useful actions" now={g.compare.actions.now} change={g.compare.actions.change} period={period} />
              <Rate label="Engaged visits" value={g.engagementRate} good={0.5} note="2+ pages, 10s+, or an action" />
              <Rate label="Visits with a useful action" value={g.conversionRate} good={0.2} note="download, tool use, copy" />
              <Rate label="Returning visitors" value={g.returningRate} good={0.15} note="target 15%+" />
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <section className="min-w-0 rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-semibold text-foreground">Estimated ad income</h3>
                <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
                  {money(g.earnings.low)}–{money(g.earnings.high)}
                  <span className="text-base font-medium text-muted-foreground"> / month</span>
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  If ads were on the site, at {g.monthly.pageViews.toLocaleString("en-IN")} page views a month{g.projected ? " (current pace)" : ""} and {pct(g.tier1Share)} visitors from high-paying countries. Uses public RPM benchmarks (${g.earnings.rpmLow.toFixed(2)}–${g.earnings.rpmHigh.toFixed(2)} per 1,000 views); real earnings vary.
                </p>
              </section>
              <section className="min-w-0 rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-semibold text-foreground">Ad network readiness</h3>
                <ul className="mt-2 space-y-2.5">
                  {g.milestones.map((ms) => {
                    const share = ms.target ? Math.min(1, ms.value / ms.target) : 1;
                    return (
                      <li key={ms.name}>
                        <p className="flex justify-between gap-2 text-sm">
                          <span className="font-medium text-foreground">{ms.name}</span>
                          <span className="tabular-nums text-muted-foreground">{ms.target ? `${ms.value.toLocaleString("en-IN")} / ${ms.target.toLocaleString("en-IN")}` : "Apply any time"}</span>
                        </p>
                        <p className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                          <span className="block h-full rounded-full bg-primary" style={{ width: `${share * 100}%` }} />
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{ms.need}</p>
                      </li>
                    );
                  })}
                </ul>
              </section>
              <section className="min-w-0 rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-semibold text-foreground">Page speed for real visitors</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">Google uses these for ranking. {g.vitals.samples ? `${g.vitals.samples} page loads measured (75% of visitors are at or below these).` : "Measured from new visits."}</p>
                <div className="mt-2 space-y-1">
                  <Vital label="Main content shows (LCP)" value={g.vitals.lcp} unit="s" good={2500} poor={4000} note="good under 2.5s" />
                  <Vital label="Layout stays still (CLS)" value={g.vitals.cls} unit="" good={0.1} poor={0.25} note="good under 0.10" />
                  <Vital label="Reacts to taps (INP)" value={g.vitals.inp} unit="ms" good={200} poor={500} note="good under 200ms" />
                </div>
              </section>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <Ranked title="Traffic channels" rows={g.channels.map(([k, n, share]) => [`${k}\u0000${pct(share)}`, n] as [string, number])} format={(k) => {
                const [name, share] = k.split("\u0000");
                return <>{name} <span className="text-muted-foreground">· {share}</span></>;
              }} />
              <Ranked title="Searches with no results (content ideas)" rows={g.zeroSearches} empty="None yet. These are things people want that the site doesn't have." />
              <Ranked title="Broken links visitors hit (404)" rows={g.notFound} empty="None. Good!" />
              <Ranked title="Pages that hold attention (avg. seconds)" rows={g.holdingPages} empty="Measured from new visits" />
              <Ranked title="Pages that lead to downloads & tool use" rows={g.actionPages} />
            </div>
          </section>
        );
      })()}

      <section className="mt-5 rounded-xl border border-border bg-card p-4">
        {days > 1 ? (
          <>
            <h2 className="mb-3 text-sm font-semibold text-foreground">Visitors per day</h2>
            <DailyChart data={s.perDay.map((d) => ({ label: new Date(`${d.date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" }), visitors: d.visitors, pageViews: d.pageViews }))} />
          </>
        ) : (
          <>
            <h2 className="mb-3 text-sm font-semibold text-foreground">Visitors by hour today (IST)</h2>
            <DailyChart data={s.perHour.map((h) => ({ label: `${String(h.hour).padStart(2, "0")}:00`, visitors: h.visitors, pageViews: h.pageViews }))} firstLabel="12 am" lastLabel="11 pm" />
          </>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-base font-bold text-foreground">Visitors <span className="text-sm font-medium text-muted-foreground">· tap a visitor to see their path</span></h2>
        {s.people.length ? (
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {s.people.map((v) => (
              <li key={v.id}>
                <details className="group">
                  <summary className="grid cursor-pointer list-none grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 px-4 py-3 hover:bg-muted/50 sm:grid-cols-[minmax(180px,1.3fr)_1.2fr_1fr_auto] [&::-webkit-details-marker]:hidden">
                    <span className="min-w-0 truncate text-sm font-semibold text-foreground">
                      {v.c ? `${flag(v.c)} ` : ""}
                      {v.ci ? `${v.ci}${v.rg ? `, ${v.rg}` : ""}` : v.c ? countryName(v.c) : "Unknown place"}
                    </span>
                    <span className="text-right text-xs tabular-nums text-muted-foreground sm:order-last">{ago(v.last, s.updated)}</span>
                    <span className="col-span-2 truncate text-xs text-muted-foreground sm:col-span-1 sm:text-sm">
                      {[cap(v.d), v.os, v.b].filter(Boolean).join(" · ")}
                    </span>
                    <span className="col-span-2 text-xs text-muted-foreground sm:col-span-1 sm:text-sm">
                      {v.pageViews} {v.pageViews === 1 ? "page" : "pages"}
                      {v.actions ? ` · ${v.actions} ${v.actions === 1 ? "action" : "actions"}` : ""}
                      {v.seconds ? ` · ${duration(v.seconds)}` : ""}
                      {v.sessions.length > 1 ? ` · ${v.sessions.length} visits` : ""}
                    </span>
                  </summary>
                  <div className="border-t border-border bg-muted/30 px-4 py-3 text-sm">
                    <p className="text-xs text-muted-foreground">
                      Came from <span className="text-foreground">{v.r ?? "unknown"}</span>
                      {v.lang ? <> · Language <span className="text-foreground">{v.lang}</span></> : null}
                      {v.sw ? <> · Screen <span className="text-foreground">{v.sw}px</span></> : null}
                      {" "}· First seen <span className="text-foreground">{dateIST(v.first)} {timeIST(v.first)}</span>
                    </p>
                    <ol className="mt-2 space-y-1">
                      {v.journey.map(([t, e, what], i) => (
                        <li key={i} className="grid grid-cols-[3.5rem_1fr] gap-2">
                          <span className="tabular-nums text-xs leading-5 text-muted-foreground">{timeIST(t)}</span>
                          <span className="min-w-0 truncate text-foreground">
                            <span className="mr-1.5 text-xs text-muted-foreground">{EVENT_NAMES[e]?.replace(/s$/, "") ?? e}</span>
                            {what}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">No visitors yet in this period.</p>
        )}
      </section>

      <Group title="Pages">
        <Ranked title="Top pages" rows={s.pages.map((p) => [`${p.title}\u0000${p.path}`, p.n] as [string, number])} format={(k) => {
          const [title, path] = k.split("\u0000");
          return <span title={path}>{title}</span>;
        }} />
        <Ranked title="Where visitors land (entry pages)" rows={s.entries} />
        <Ranked title="Where visitors leave (exit pages)" rows={s.exits} />
        <Ranked title="Sections" rows={s.sections} />
        <Ranked title="Where visitors come from" rows={s.sources} />
      </Group>

      <Group title="Audience">
        <Ranked title="Countries" rows={s.countries} format={(c) => `${flag(c)} ${countryName(c)}`} />
        <Ranked title="Cities" rows={s.cities} empty="Shown once visitors arrive on the live site" />
        <Ranked title="Devices" rows={s.devices} format={cap} />
        <Ranked title="Operating systems" rows={s.os} />
        <Ranked title="Browsers" rows={s.browsers} />
        <Ranked title="Screen sizes" rows={s.screens} empty="Recorded from new visits" />
        <Ranked title="Languages" rows={s.languages} empty="Recorded from new visits" />
      </Group>

      <Group title="What visitors did">
        <Ranked title="Actions" rows={s.events.map(([e, n]) => [EVENT_NAMES[e] ?? e, n] as [string, number])} />
        <Ranked title="Most downloaded" rows={s.downloads} />
        <Ranked title="Most played music & sounds" rows={s.plays} />
        <Ranked title="Opened in apps" rows={s.apps} />
        <Ranked title="Searches on the site" rows={s.searches} />
        <Ranked title="Editor & tool exports" rows={s.exports} />
        <Ranked title="Files added to tools" rows={s.uploads} />
        <Ranked title="Prompts copied" rows={s.prompts} />
      </Group>

      <section className="mt-8 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">Latest activity today</h2>
        {s.recent.length ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="py-1.5 pr-3 font-medium">Time</th>
                  <th className="py-1.5 pr-3 font-medium">Visitor</th>
                  <th className="py-1.5 pr-3 font-medium">Action</th>
                  <th className="py-1.5 pr-3 font-medium">Page</th>
                  <th className="py-1.5 font-medium">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {s.recent.map((r, i) => (
                  <tr key={i}>
                    <td className="py-1.5 pr-3 tabular-nums text-muted-foreground">{new Date(r.t).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })}</td>
                    <td className="py-1.5 pr-3 text-muted-foreground">{r.c ? `${flag(r.c)} ` : ""}{r.ci ? `${r.ci} · ` : ""}{r.d ?? ""}</td>
                    <td className="py-1.5 pr-3 text-foreground">{EVENT_NAMES[r.e] ?? r.e}</td>
                    <td className="max-w-[240px] truncate py-1.5 pr-3 text-muted-foreground">{r.p}</td>
                    <td className="max-w-[260px] truncate py-1.5 text-muted-foreground">{r.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">No visits yet today.</p>
        )}
      </section>
      <p className="mt-4 text-xs text-muted-foreground">Our own counting: each browser gets an anonymous random ID; no names or IP addresses are stored. Bots are left out.</p>
    </div>
  );
}
