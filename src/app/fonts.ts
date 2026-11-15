import { Inter, Inter_Tight, JetBrains_Mono, Noto_Sans_Devanagari } from "next/font/google";

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

/**
 * Devanagari for the one place English pages show it (the office address on Contact and About). Never preloaded, and the
 * browser downloads the file only on pages that actually contain Devanagari characters (the footer shows the Latin
 * address only), so other pages pay nothing for it.
 */
export const notoDevanagariNative = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500"],
  variable: "--font-noto-devanagari",
  display: "swap",
  preload: false,
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
