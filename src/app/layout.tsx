import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";

import { ActivityTracker } from "@/components/analytics/ActivityTracker";
import { Clarity } from "@/components/analytics/Clarity";

import { Navbar, TabBar } from "@/components/layout/Navbar";
import { PageFooter } from "@/components/layout/PageFooter";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { siteConfig } from "@/constants/site";
import { defaultOpenGraphImage, getAbsoluteUrl } from "@/lib/metadata";
import "./globals.css";

const googleAnalyticsId = "G-KBP6GF6R4C";
const homepageTitle = "MyPixelogs — Free PDF Tools, Templates, Calculators & Assets";
const siteJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: getAbsoluteUrl(siteConfig.logo),
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
];

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: homepageTitle,
    template: "%s | MyPixelogs",
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  alternates: {
    canonical: siteConfig.url,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  verification: {
    google: "5UjKcH6E_Gl3gfIo6e1Ip3xzBvGxlE5KL3kLNkz0jqs",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: homepageTitle,
    description: siteConfig.description,
    images: [defaultOpenGraphImage],
  },
  twitter: {
    card: "summary_large_image",
    title: homepageTitle,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <a href="#content" className="skip-link">
            Skip to content
          </a>
          <Navbar />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
          />
          <main id="content" tabIndex={-1} className="outline-none">
            {children}
            <PageFooter />
          </main>
          <TabBar />
        </ThemeProvider>
        {process.env.NODE_ENV === "production" ? (
          <>
            <GoogleAnalytics gaId={googleAnalyticsId} />
            <ActivityTracker />
            <Clarity />
          </>
        ) : null}
      </body>
    </html>
  );
}
