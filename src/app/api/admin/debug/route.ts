import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/analytics/auth";
import { analyticsStore, dayKey } from "@/lib/analytics/store";

export const dynamic = "force-dynamic";

/** Owner-only check of what the stats storage holds (helps when numbers look wrong). */
export async function GET() {
  if (!(await isAdmin())) return new NextResponse(null, { status: 404 });
  const store = await analyticsStore();
  const t0 = Date.now();
  const all = await store.list("");
  const t1 = Date.now();
  const today = await store.list(`raw/${dayKey(Date.now())}/`);
  const t2 = Date.now();
  return NextResponse.json({
    backend: (store as { kind?: string }).kind ?? "unknown",
    env: { NETLIFY: Boolean(process.env.NETLIFY), BLOBS_CTX: Boolean(process.env.NETLIFY_BLOBS_CONTEXT), LAMBDA: Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME), cwd: process.cwd() },
    today: dayKey(Date.now()),
    allCount: all.length,
    allMs: t1 - t0,
    todayCount: today.length,
    todayMs: t2 - t1,
    newest: [...all].sort().slice(-8),
  });
}
