/**
 * Visitor activity: sent to Google Analytics and to our own stats (/admin/stats).
 * Our own stats get small batches through navigator.sendBeacon, so the site never waits on them.
 */
type Hit = { t: number; e: string; p: string; r?: string; ti?: string; x?: Record<string, string | number> };

const queue: Hit[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

function ids() {
  const make = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
  let v = "";
  let s = "";
  try {
    v = localStorage.getItem("mp_vid") || "";
    if (!v) localStorage.setItem("mp_vid", (v = make()));
    s = sessionStorage.getItem("mp_sid") || "";
    if (!s) sessionStorage.setItem("mp_sid", (s = make()));
  } catch {
    v ||= make();
    s ||= v;
  }
  return { v, s };
}

export function flush() {
  if (!queue.length || typeof navigator === "undefined") return;
  const body = JSON.stringify({ ...ids(), hits: queue.splice(0, queue.length) });
  if (!navigator.sendBeacon?.("/api/collect", new Blob([body], { type: "application/json" }))) {
    void fetch("/api/collect", { method: "POST", body, keepalive: true }).catch(() => {});
  }
}

function enqueue(hit: Hit) {
  if (process.env.NODE_ENV !== "production") return;
  queue.push(hit);
  // Send shortly after things happen (several actions close together go in one request).
  if (timer) clearTimeout(timer);
  if (queue.length >= 20) flush();
  else timer = setTimeout(() => ((timer = null), flush()), 2_000);
}

export function trackPageView(path: string, referrer?: string) {
  enqueue({ t: Date.now(), e: "page_view", p: path, r: referrer, ti: document.title.split(" | ")[0] });
}

/** Send one event. Safe to call anywhere. */
export function track(event: string, params: Record<string, string | number | undefined> = {}) {
  if (typeof window === "undefined") return;
  const x = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== "")) as Record<string, string | number>;
  enqueue({ t: Date.now(), e: event, p: window.location.pathname, x });
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag !== "function") return;
  const section = window.location.pathname.split("/").filter(Boolean)[0] ?? "home";
  gtag("event", event, { section, page_path: window.location.pathname, ...x });
}
