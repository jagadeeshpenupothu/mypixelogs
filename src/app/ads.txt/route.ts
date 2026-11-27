import { adsensePublisher } from "@/lib/adsense";

/** ads.txt: tells ad buyers which ad accounts may sell ads on this site. */
export function GET() {
  const pub = adsensePublisher();
  if (!pub) return new Response("Not found", { status: 404 });
  return new Response(`google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
