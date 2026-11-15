import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeScript } from "@/components/ThemeScript";
import { inter, interTight, jetbrainsMono } from "../../fonts";
import "../../globals.css";

// The website admin (M7c): its own root layout, without the public header and footer. Never indexed: noindex here,
// X-Robots-Tag on /admin in public/_headers, and it is left out of the sitemap and robots.txt.
export const metadata: Metadata = {
  title: "Admin | Ambika Group website",
  // Same icons as the public site; without them the browser asks for /favicon.ico, which doesn't exist (a 404).
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }], apple: "/apple-icon.png" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${interTight.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
