/**
 * Google AdSense publisher ID, e.g. "pub-1234567890123456", set as ADSENSE_PUBLISHER_ID in Netlify.
 * Empty = ads off. Changing it needs a redeploy.
 */
export function adsensePublisher() {
  const raw = (process.env.ADSENSE_PUBLISHER_ID ?? "").trim();
  const id = raw.replace(/^ca-/, "");
  return /^pub-\d{10,20}$/.test(id) ? id : "";
}
