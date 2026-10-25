import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed } from "next/font/google";

// Latin fonts for every locale. Self-hosted at build time by next/font (no runtime Google call).
// Weights per brand.md: body 400, labels/buttons 500, headings 600.
//
// font-display "swap": text is never hidden while fonts load (low-end phones on poor networks see
// the fallback first). next/font's size-adjusted fallback keeps the swap small; on slow 4G the hero
// lead can still re-wrap once (CLS ≈ 0.01, a tenth of the 0.1 "good" threshold; accepted by the
// supervisor at the M4 checkpoint). Rejected: "optional" (fallback on fast-4G first visits),
// "block" and a hide-until-loaded gate (invisible text).
export const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
  display: "swap",
  adjustFontFallback: true,
});

// Display lines and metadata labels (brand.md v3). Latin only; Hindi falls back to Plex Sans Devanagari.
export const plexCondensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-plex-condensed",
  display: "swap",
  adjustFontFallback: true,
});
