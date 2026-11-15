import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/SiteShell";
import { ThemeScript } from "@/components/ThemeScript";
import { inter, interTight, jetbrainsMono, notoDevanagariNative } from "../fonts";
import { baseMetadata } from "../metadata";
import "../globals.css";

// English root layout. English pages live in this route group at the bare URLs.
// <meta name="theme-color"> is written by ThemeScript, so it follows the chosen theme.
export const metadata: Metadata = baseMetadata("en");

export default function EnglishRootLayout({ children }: { children: ReactNode }) {
  return (
    // ThemeScript sets data-theme before hydration, so the attribute differs from the server HTML.
    <html lang="en" className={`${inter.variable} ${interTight.variable} ${jetbrainsMono.variable} ${notoDevanagariNative.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <SiteShell locale="en">{children}</SiteShell>
      </body>
    </html>
  );
}
