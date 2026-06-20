import type { Metadata } from "next";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/providers/theme-provider";
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
      </body>
    </html>
  );
}
