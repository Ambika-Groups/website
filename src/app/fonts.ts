import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";

// Latin fonts for every locale (brand.md v4.1: sharp fonts, so Inter Tight headings, not a rounded face).
// Self-hosted at build time by next/font (no runtime Google call).
// Only the weights in use are loaded.
//
// font-display "swap": text is never hidden while fonts load (low-end phones on poor networks see
// the fallback first). next/font's size-adjusted fallback keeps the swap small (CLS ≈ 0; the M4 checkpoint
// accepted swap over "optional" and over a hide-until-loaded gate).

/** Body and UI text: 400 body, 500 labels and buttons, 600 emphasis. */
export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
  adjustFontFallback: true,
});

/** Headings and display type: Inter Tight 600, tracked about −0.02 em in the type scale. */
export const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-inter-tight",
  display: "swap",
  adjustFontFallback: true,
});

/** Eyebrows, labels, section numbers and IDs. */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-jetbrains",
  display: "swap",
  adjustFontFallback: true,
  // Keep the preload: without it the late swap re-wraps the label above page titles and shifts the page (CLS 0.12
  // measured on a project page, slow 4G).
});
