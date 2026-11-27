import type { Metadata } from "next";
import Link from "next/link";

import { isAdmin } from "@/lib/analytics/auth";
import { analyticsStore } from "@/lib/analytics/store";

export const metadata: Metadata = { title: "Messages" };
export const dynamic = "force-dynamic";

type Message = { name: string; email: string; subject: string; message: string; page: string; at: number };

/** Contact-form messages, newest first. Owner only. */
export default async function MessagesPage() {
  if (!(await isAdmin())) {
    return (
      <p className="mx-auto mt-16 max-w-sm text-center text-sm text-muted-foreground">
        Private page. <Link href="/admin/stats" className="text-primary hover:underline">Sign in on the stats page</Link> first.
      </p>
    );
  }
  const store = await analyticsStore();
  const keys = (await store.list("messages/")).sort().reverse().slice(0, 200);
  const messages = (await Promise.all(keys.map((k) => store.get(k) as Promise<Message | null>))).filter(Boolean) as Message[];

  return (
    <div className="mx-auto max-w-3xl pb-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-foreground">Messages <span className="text-base font-medium text-muted-foreground">· {messages.length}</span></h1>
        <Link href="/admin/stats" className="text-sm font-medium text-primary hover:underline">Website stats</Link>
      </div>
      {messages.length ? (
        <ul className="mt-5 space-y-3">
          {messages.map((m) => (
            <li key={m.at + m.message.slice(0, 10)} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold text-foreground">{m.subject || "(no subject)"}</p>
                <p className="text-xs text-muted-foreground">{new Date(m.at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })}</p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {m.name || "Someone"}
                {m.email ? (
                  <>
                    {" · "}
                    <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || "your message to MyPixelogs"}`)}`} className="text-primary hover:underline">{m.email}</a>
                  </>
                ) : " · no email left"}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground">{m.message}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">No messages yet.</p>
      )}
    </div>
  );
}
