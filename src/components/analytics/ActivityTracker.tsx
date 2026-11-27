"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { flush, track, trackPageView } from "@/lib/track";

/** Apps we send people to, by host. */
const APPS: [RegExp, string][] = [
  [/chatgpt\.com|chat\.openai\.com/, "ChatGPT"],
  [/photopea\.com/, "Photopea"],
  [/overleaf\.com/, "Overleaf"],
  [/docs\.google\.com\/document/, "Google Docs"],
  [/docs\.google\.com\/spreadsheets/, "Google Sheets"],
  [/canva\.com/, "Canva"],
  [/fonts\.google\.com/, "Google Fonts"],
];

const fileOf = (href: string) => decodeURIComponent(href.split("?")[0].split("/").pop() ?? "");
const pageName = () => document.title.split(" | ")[0];

/**
 * One listener for the whole site, so we learn what visitors do without wiring every button:
 * - any element with data-track="event_name" (extra data-track-* attributes become parameters)
 * - downloads from our site (asset_download: file, type)
 * - links that open another app (open_in_app: app)
 * - "Download / Save / Export…" buttons in editors and tools (export_click: label)
 * - a file chosen in any tool (file_selected)
 */
export function ActivityTracker() {
  const pathname = usePathname();
  const first = useRef(true);

  // A page view on every page, including moves inside the site. The first one says where the visitor came from.
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    let referrer: string | undefined;
    if (first.current) {
      first.current = false;
      const utm = new URLSearchParams(window.location.search).get("utm_source");
      try {
        const host = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : "";
        referrer = utm || (host && host !== window.location.hostname ? host : "direct");
      } catch {
        referrer = utm || "direct";
      }
    }
    // Wait a moment so the new page's title is in place.
    const id = setTimeout(() => trackPageView(pathname, referrer), 300);
    return () => clearTimeout(id);
  }, [pathname]);

  // Send what's queued when the visitor leaves or switches tabs.
  useEffect(() => {
    const onHide = () => document.visibilityState === "hidden" && flush();
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
    };
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("a, button, [data-track]") as HTMLElement | null;
      if (!el) return;
      const tagged = el.closest("[data-track]") as HTMLElement | null;
      if (tagged) {
        const params: Record<string, string> = {};
        for (const [k, v] of Object.entries(tagged.dataset)) {
          if (k.startsWith("track") && k !== "track" && v) params[k.slice(5).replace(/^./, (c) => c.toLowerCase())] = v;
        }
        track(tagged.dataset.track!, params);
        return;
      }
      if (el instanceof HTMLAnchorElement) {
        const href = el.getAttribute("href") ?? "";
        if (el.hasAttribute("download") || /\/downloads\/|\/audio\/(music|sfx)\//.test(href)) {
          const file = el.getAttribute("download") || fileOf(href);
          track("asset_download", { file_name: file, file_type: (file.split(".").pop() ?? "").toLowerCase(), item: pageName() });
          return;
        }
        const app = APPS.find(([re]) => re.test(href));
        if (app) track("open_in_app", { app: app[1], item: pageName() });
        return;
      }
      const label = el.innerText.trim().replace(/\s+/g, " ").slice(0, 60);
      if (/^(download|save|export|convert|compress|merge|split)/i.test(label)) track("export_click", { label, item: pageName() });
    };
    const onChange = (e: Event) => {
      const input = e.target as HTMLInputElement;
      if (input?.type === "file" && input.files?.length) {
        const f = input.files[0];
        track("file_selected", { file_type: (f.name.split(".").pop() ?? "").toLowerCase(), files: input.files.length, size_mb: Math.round((f.size / 1e6) * 10) / 10 });
      }
    };
    document.addEventListener("click", onClick, { capture: true });
    document.addEventListener("change", onChange, { capture: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("change", onChange, { capture: true });
    };
  }, []);
  return null;
}
