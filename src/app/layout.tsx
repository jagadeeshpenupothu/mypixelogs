import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";

import { Navbar } from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { siteConfig } from "@/constants/site";
import { defaultOpenGraphImage } from "@/lib/metadata";
import "./globals.css";

const googleAnalyticsId = "G-KBP6GF6R4C";
const homepageTitle = "MyPixelogs — Free PDF Tools, Templates, Calculators & Assets";

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
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main>{children}</main>
        </ThemeProvider>
        {process.env.NODE_ENV === "production" ? (
          <GoogleAnalytics gaId={googleAnalyticsId} />
        ) : null}
      </body>
    </html>
  );
}
