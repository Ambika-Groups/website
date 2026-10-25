import { IBM_Plex_Sans_Devanagari } from "next/font/google";

// Imported only by the Hindi root layout, so English pages never download it.
export const plexDevanagari = IBM_Plex_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-devanagari",
  display: "swap",
});
