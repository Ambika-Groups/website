import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/SiteShell";
import { ThemeScript } from "@/components/ThemeScript";
import { plexDevanagari } from "../../fonts-hi";
import { baseMetadata } from "../../metadata";
import { plex, plexCondensed } from "../../fonts";
import "../../globals.css";

// Hindi root layout, ready for /hi/... pages. It has no pages yet, so nothing is exported.
// To launch Hindi: add src/content/hi/*, register it in src/content/index.ts, add pages here
// mirroring app/(en), and add "hi" to publishedLocales in src/i18n/config.ts.
export const metadata: Metadata = baseMetadata("hi");

export default function HindiRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="hi" className={`${plex.variable} ${plexCondensed.variable} ${plexDevanagari.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <SiteShell locale="hi">{children}</SiteShell>
      </body>
    </html>
  );
}
