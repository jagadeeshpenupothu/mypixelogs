import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { siteConfig } from "@/constants/site";
import { defaultOpenGraphImage } from "@/lib/metadata";
import "./globals.css";

const googleAnalyticsId = "G-KBP6GF6R4C";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "mypixelogs | Free Templates, Tools & Design Resources",
    template: "%s | mypixelogs",
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: "mypixelogs" }],
  creator: "mypixelogs",
  verification: {
    google: "5UjKcH6E_Gl3gfIo6e1Ip3xzBvGxlE5KL3kLNkz0jqs",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "mypixelogs | Free Templates, Tools & Design Resources",
    description: siteConfig.description,
    images: [defaultOpenGraphImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "mypixelogs | Free Templates, Tools & Design Resources",
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
          <Footer />
        </ThemeProvider>
        {process.env.NODE_ENV === "production" ? (
          <GoogleAnalytics gaId={googleAnalyticsId} />
        ) : null}
      </body>
    </html>
  );
}
