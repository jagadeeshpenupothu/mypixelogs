import "server-only";

import { createHash } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "mp_admin";

/** The password lives only in Netlify's environment variables (ADMIN_PASSWORD), never in the code. */
export const adminPassword = () => process.env.ADMIN_PASSWORD ?? "";

export const passwordToken = (pw: string) => createHash("sha256").update(`mypixelogs-admin:${pw}`).digest("hex");

export async function isAdmin() {
  const pw = adminPassword();
  if (!pw) return false;
  return (await cookies()).get(ADMIN_COOKIE)?.value === passwordToken(pw);
}
