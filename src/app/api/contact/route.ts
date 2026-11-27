import { NextResponse } from "next/server";

import { analyticsStore } from "@/lib/analytics/store";

export const dynamic = "force-dynamic";

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Saves a contact-form message for the owner to read at /admin/messages. */
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = JSON.parse(await req.text());
  } catch {
    return NextResponse.json({ ok: false, error: "Please try again." }, { status: 400 });
  }
  // Bots fill the hidden "company" field; people never see it.
  if (clean(body.company, 100)) return NextResponse.json({ ok: true });
  const msg = { name: clean(body.name, 100), email: clean(body.email, 200), subject: clean(body.subject, 200), message: clean(body.message, 5000), page: clean(body.page, 200), at: Date.now() };
  if (!msg.message || msg.message.length < 5) return NextResponse.json({ ok: false, error: "Please write a message." }, { status: 400 });
  if (msg.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(msg.email)) return NextResponse.json({ ok: false, error: "Please check your email address." }, { status: 400 });
  const store = await analyticsStore();
  await store.set(`messages/${msg.at}-${Math.random().toString(36).slice(2, 8)}.json`, msg);
  return NextResponse.json({ ok: true });
}
