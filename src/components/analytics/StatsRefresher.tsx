"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/** Reloads the numbers every 30 seconds while the page is open. */
export function StatsRefresher({ updated }: { updated: number }) {
  const router = useRouter();
  const [now, setNow] = useState(updated);
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 30_000);
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(id);
      clearInterval(tick);
    };
  }, [router]);
  const ago = Math.max(0, Math.round((now - updated) / 1000));
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground" title="Refreshes every 30 seconds">
      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" aria-hidden="true" />
      Updated {ago < 5 ? "just now" : `${ago}s ago`}
    </span>
  );
}
