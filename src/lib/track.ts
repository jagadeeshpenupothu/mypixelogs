/** Send one event to Google Analytics. Safe to call anywhere: does nothing until GA has loaded. */
export function track(event: string, params: Record<string, string | number | undefined> = {}) {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag !== "function") return;
  const section = window.location.pathname.split("/").filter(Boolean)[0] ?? "home";
  gtag("event", event, { section, page_path: window.location.pathname, ...params });
}
