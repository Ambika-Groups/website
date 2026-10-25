import type { RouteKey } from "@/config/routes";
import type { Dictionary } from "@/content";

/**
 * Section reference for a top-level page, from its place in the main navigation, so page headers
 * match the phone menu's numbering ("01 — Services" … "05 — Contact").
 */
export function sectionRef(t: Dictionary["common"], route: RouteKey): { index: string; label: string } | undefined {
  const i = t.nav.items.findIndex((item) => item.route === route);
  if (i === -1) return undefined;
  return { index: String(i + 1).padStart(2, "0"), label: t.nav.items[i].label };
}
