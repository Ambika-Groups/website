import type { PublishEntry } from "./types";

export const MONTHLY_CREDITS = 300;
export const CREDITS_PER_PUBLISH = 15;

/** Netlify credits used by this site's publishes this calendar month, counted from our own publish log. */
export function creditsThisMonth(publishes: PublishEntry[], now = new Date()) {
  const month = now.toISOString().slice(0, 7);
  const list = publishes.filter((p) => p.at.slice(0, 7) === month && p.credits > 0);
  return { used: list.reduce((s, p) => s + p.credits, 0), count: list.length };
}
