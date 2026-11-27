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
  const pagesPerVisit = s.totals.sessions ? (s.totals.pageViews / s.totals.sessions).toFixed(1) : "0";

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

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Tile label="On the site now" value={s.live} note="last 5 minutes" />
        <Tile label="Visitors" value={s.totals.visitors} note="unique people" />
        <Tile label="Visits" value={s.totals.sessions} note={`${pagesPerVisit} pages per visit`} />
        <Tile label="Page views" value={s.totals.pageViews} />
        <Tile label="Downloads" value={s.totals.downloads} />
        <Tile label="Actions" value={s.totals.actions} note="downloads, plays, copies…" />
      </div>

      {days > 1 ? (
        <section className="mt-5 rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Visitors per day</h2>
          <DailyChart data={s.perDay} />
        </section>
      ) : null}

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        <Ranked title="Top pages" rows={s.pages.map((p) => [`${p.title}\u0000${p.path}`, p.n] as [string, number])} format={(k) => {
          const [title, path] = k.split("\u0000");
          return <span title={path}>{title}</span>;
        }} />
        <Ranked title="Where visitors come from" rows={s.sources} />
        <Ranked title="Countries" rows={s.countries} format={(c) => `${flag(c)} ${countryName(c)}`} />
        <Ranked title="What visitors did" rows={s.events.map(([e, n]) => [EVENT_NAMES[e] ?? e, n] as [string, number])} />
        <Ranked title="Devices" rows={s.devices} format={(d) => d.charAt(0).toUpperCase() + d.slice(1)} />
        <Ranked title="Browsers" rows={s.browsers} />
        <Ranked title="Most downloaded" rows={s.downloads} />
        <Ranked title="Most played music & sounds" rows={s.plays} />
        <Ranked title="Opened in apps" rows={s.apps} />
        <Ranked title="Searches on the site" rows={s.searches} />
        <Ranked title="Editor & tool exports" rows={s.exports} />
        <Ranked title="Files added to tools" rows={s.uploads} />
      </div>

      <section className="mt-5 rounded-xl border border-border bg-card p-4">
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
                    <td className="py-1.5 pr-3 text-muted-foreground">{r.c ? `${flag(r.c)} ` : ""}{r.d ?? ""}</td>
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
