import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async redirects() {
    return [
      {
        source: "/resources",
        destination: "/assets",
        permanent: true,
      },
      // Old placeholder design-file pages were removed; their links go to the Assets page.
      { source: "/resources/:path*", destination: "/assets", permanent: true },
      { source: "/resources", destination: "/assets", permanent: true },
      { source: "/assets/:slug((?!fonts$|music$|sound-effects$|logos$)[^/]+)", destination: "/assets", permanent: true },
      // The old AI section (placeholder prompts and images) became one ChatGPT prompt library at /ai.
      { source: "/ai/prompts", destination: "/ai", permanent: true },
      { source: "/ai/images/:path*", destination: "/ai", permanent: true },
      { source: "/ai/images", destination: "/ai", permanent: true },
      { source: "/ai/image-prompts/:path*", destination: "/ai", permanent: true },
      { source: "/ai/image-prompts", destination: "/ai", permanent: true },
      {
        source: "/blog",
        destination: "/",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // The folder name holds the version, so these files never change.
        source: "/(ffmpeg|pdfjs)/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // Lets Photopea (photopea.com) open our PSD files straight from the site.
        source: "/downloads/:path*",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
