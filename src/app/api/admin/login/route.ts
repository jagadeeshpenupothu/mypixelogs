import { NextResponse } from "next/server";

import { ADMIN_COOKIE, adminEmail, sessionCookie, verifyGoogleToken } from "@/lib/analytics/auth";

export const dynamic = "force-dynamic";

/** Google sign-in for /admin: only the email in ADMIN_EMAIL gets in. */
export async function POST(req: Request) {
  const { credential } = (await req.json().catch(() => ({}))) as { credential?: string };
  const email = credential ? await verifyGoogleToken(credential) : null;
  if (!email || !adminEmail() || email !== adminEmail()) {
    return NextResponse.json({ ok: false, reason: email ? "This Google account doesn't have access." : "Sign-in failed. Please try again." }, { status: 403 });
  }
  const { value, maxAge } = await sessionCookie(email);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, value, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge });
  return res;
}
