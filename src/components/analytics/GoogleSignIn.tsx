"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type GoogleId = {
  accounts: { id: { initialize: (o: object) => void; renderButton: (el: HTMLElement, o: object) => void } };
};

/** The official "Sign in with Google" button; the server checks the account and lets only the owner in. */
export function GoogleSignIn({ clientId }: { clientId: string }) {
  const box = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const start = () => {
      const g = (window as unknown as { google?: GoogleId }).google;
      if (!g || !box.current) return;
      g.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }: { credential: string }) => {
          setError("");
          const res = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ credential }) });
          if (res.ok) router.refresh();
          else setError(((await res.json().catch(() => ({}))) as { reason?: string }).reason ?? "Sign-in failed.");
        },
      });
      g.accounts.id.renderButton(box.current, { theme: "outline", size: "large", shape: "pill", text: "signin_with" });
    };
    if ((window as unknown as { google?: GoogleId }).google) return start();
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = start;
    document.head.appendChild(s);
  }, [clientId, router]);

  return (
    <div className="grid justify-items-center gap-3">
      <div ref={box} />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.refresh();
      }}
      className="text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      Sign out
    </button>
  );
}
