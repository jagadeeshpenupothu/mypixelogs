import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";


export const ADMIN_COOKIE = "mp_admin";
const DAYS = 30;

/**
 * Google sign-in "Client ID" (public by design; create it in Google Cloud → Credentials → OAuth client ID,
 * type Web application, origin https://mypixelogs.netlify.app). Empty = sign-in not set up yet.
 */
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";

/** The only email allowed in. It lives in Netlify's environment variables (ADMIN_EMAIL), not in the code. */
export const adminEmail = () => (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();

/** Optional password sign-in (ADMIN_PASSWORD in Netlify). */
export const adminPassword = () => process.env.ADMIN_PASSWORD ?? "";

/** Constant-time check of a typed password. */
export function passwordMatches(given: string) {
  const pw = adminPassword();
  if (!pw || !given) return false;
  const a = createHmac("sha256", "pw").update(given).digest();
  const b = createHmac("sha256", "pw").update(pw).digest();
  return timingSafeEqual(a, b);
}

/** The signing key comes from the server-only settings, so signing in never waits on storage. */
const secret = async () => createHmac("sha256", "mypixelogs-admin-session").update(`${adminPassword()}|${adminEmail()}|${process.env.GOOGLE_CLIENT_ID ?? ""}`).digest("hex");

const sign = async (payload: string) => createHmac("sha256", await secret()).update(payload).digest("hex");

export async function sessionCookie(email: string) {
  const exp = Date.now() + DAYS * 86_400_000;
  const payload = `${Buffer.from(email).toString("base64url")}.${exp}`;
  return { value: `${payload}.${await sign(payload)}`, maxAge: DAYS * 86_400 };
}

export async function isAdmin() {
  const allowed = adminEmail() || "owner";
  const raw = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!raw || (!adminEmail() && !adminPassword())) return false;
  const [b64, exp, sig] = raw.split(".");
  if (!b64 || !exp || !sig || Number(exp) < Date.now()) return false;
  const expected = await sign(`${b64}.${exp}`);
  if (expected.length !== sig.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return false;
  return Buffer.from(b64, "base64url").toString() === allowed;
}

/** Checks a Google sign-in token with Google and returns the verified email, or null. */
export async function verifyGoogleToken(credential: string) {
  if (!GOOGLE_CLIENT_ID) return null;
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`, { cache: "no-store" }).catch(() => null);
  if (!res?.ok) return null;
  const info = (await res.json()) as { aud?: string; email?: string; email_verified?: string | boolean; exp?: string };
  if (info.aud !== GOOGLE_CLIENT_ID) return null;
  if (!(info.email_verified === true || info.email_verified === "true")) return null;
  if (Number(info.exp) * 1000 < Date.now()) return null;
  return info.email?.toLowerCase() ?? null;
}
