import { NextResponse } from "next/server";

import { analyticsStore, dayKey } from "@/lib/analytics/store";
import type { Hit } from "@/lib/analytics/types";

export const dynamic = "force-dynamic";

const BOT = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp|curl|wget|python|node-fetch/i;
const clean = (v: unknown, max = 120) => (typeof v === "string" ? v.slice(0, max) : typeof v === "number" && Number.isFinite(v) ? String(v) : undefined);

function device(ua: string) {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return "tablet";
  return /mobi|iphone|android/i.test(ua) ? "mobile" : "desktop";
}
function browser(ua: string) {
  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\/|opera/i.test(ua)) return "Opera";
  if (/samsungbrowser/i.test(ua)) return "Samsung Internet";
  if (/chrome|crios/i.test(ua)) return "Chrome";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua)) return "Safari";
  return "Other";
}
function country(req: Request) {
  const direct = req.headers.get("x-country");
  if (direct) return direct.toUpperCase();
  const geo = req.headers.get("x-nf-geo");
  if (geo) {
    try {
      return (JSON.parse(Buffer.from(geo, "base64").toString()).country?.code as string | undefined)?.toUpperCase();
    } catch {}
  }
  return undefined;
}

/** Receives batches of page views and actions from the site (sent with navigator.sendBeacon). */
export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") ?? "";
  if (BOT.test(ua)) return new NextResponse(null, { status: 204 });
  let body: { v?: unknown; s?: unknown; hits?: unknown };
  try {
    body = JSON.parse(await req.text());
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const v = clean(body.v, 40);
  const s = clean(body.s, 40);
  if (!v || !s || !Array.isArray(body.hits)) return new NextResponse(null, { status: 400 });

  const now = Date.now();
  const c = country(req);
  const d = device(ua);
  const b = browser(ua);
  const hits: Hit[] = body.hits.slice(0, 50).flatMap((raw: Record<string, unknown>) => {
    const e = clean(raw.e, 40);
    const p = clean(raw.p, 200);
    if (!e || !p) return [];
    const t = typeof raw.t === "number" && Math.abs(raw.t - now) < 86_400_000 ? raw.t : now;
    const x: Record<string, string | number> = {};
    if (raw.x && typeof raw.x === "object") {
      for (const [k, val] of Object.entries(raw.x as Record<string, unknown>).slice(0, 12)) {
        const cv = clean(val);
        if (cv) x[k.slice(0, 30)] = cv;
      }
    }
    return [{ t, v, s, e, p, c, d, b, r: clean(raw.r, 80), ti: clean(raw.ti, 120), ...(Object.keys(x).length ? { x } : {}) }];
  });
  if (!hits.length) return new NextResponse(null, { status: 204 });

  const store = await analyticsStore();
  await store.set(`raw/${dayKey(now)}/${now}-${Math.random().toString(36).slice(2, 8)}.json`, hits);
  return new NextResponse(null, { status: 204 });
}
