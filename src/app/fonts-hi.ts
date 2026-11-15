import { Noto_Sans_Devanagari } from "next/font/google";

// Imported only by the Hindi root layout, so English pages never download it (brand.md v4.1).

/** Hindi body text and headings (600). */
export const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600"],
  variable: "--font-noto-devanagari",
  display: "swap",
});
