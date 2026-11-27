"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Contact form: messages are saved for the site owner (no email app needed). */
export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setState("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const res = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...data, page: document.referrer }) }).catch(() => null);
    const out = (await res?.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (out?.ok) setState("sent");
    else {
      setError(out?.error ?? "Couldn't send. Please check your connection and try again.");
      setState("idle");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" aria-hidden="true" />
        <p className="mt-3 text-lg font-semibold text-foreground">Thanks, your message was sent.</p>
        <p className="mt-1 text-sm text-muted-foreground">If you left an email address, we&apos;ll reply there.</p>
      </div>
    );
  }

  const field = "text-sm font-medium text-foreground";
  return (
    <form onSubmit={submit} className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="grid gap-5">
        <div>
          <label htmlFor="name" className={field}>Name</label>
          <Input id="name" name="name" className="mt-2" placeholder="Your name" autoComplete="name" />
        </div>
        <div>
          <label htmlFor="email" className={field}>Email <span className="font-normal text-muted-foreground">(to get a reply)</span></label>
          <Input id="email" name="email" type="email" className="mt-2" placeholder="you@example.com" autoComplete="email" />
        </div>
        <div>
          <label htmlFor="subject" className={field}>Subject</label>
          <Input id="subject" name="subject" className="mt-2" placeholder="Template request, bug, suggestion…" />
        </div>
        <div>
          <label htmlFor="message" className={field}>Message</label>
          <textarea
            id="message"
            name="message"
            required
            minLength={5}
            rows={6}
            className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
            placeholder="How can we help?"
          />
        </div>
        <div className="hidden" aria-hidden="true">
          <label htmlFor="company">Company</label>
          <input id="company" name="company" tabIndex={-1} autoComplete="off" />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" size="lg" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
