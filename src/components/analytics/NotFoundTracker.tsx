"use client";

import { useEffect } from "react";

import { track } from "@/lib/track";

/** Records which missing pages people try to open, so broken links can be fixed. */
export function NotFoundTracker() {
  useEffect(() => {
    track("not_found", { path: window.location.pathname, from: document.referrer ? new URL(document.referrer).pathname : "" });
  }, []);
  return null;
}
