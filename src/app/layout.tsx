import type { Metadata } from "next";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { siteConfig } from "@/constants/site";
import "./globals.css";

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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "mypixelogs | Free Templates, Tools & Design Resources",
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "mypixelogs | Free Templates, Tools & Design Resources",
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
