import { NextResponse } from "next/server";

import { ADMIN_COOKIE, adminEmail, passwordMatches, sessionCookie } from "@/lib/analytics/auth";

export const dynamic = "force-dynamic";

/** Password sign-in for /admin (form post). */
export async function POST(req: Request) {
  const form = await req.formData();
  const ok = passwordMatches(String(form.get("password") ?? ""));
  if (!ok) {
    await new Promise((r) => setTimeout(r, 800)); // slow down guessing
    return NextResponse.redirect(new URL("/admin/stats?wrong=1", req.url), 303);
  }
  const { value, maxAge } = await sessionCookie(adminEmail() || "owner");
  const res = NextResponse.redirect(new URL("/admin/stats", req.url), 303);
  res.cookies.set(ADMIN_COOKIE, value, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge });
  return res;
}
