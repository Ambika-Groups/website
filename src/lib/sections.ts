import { hasProjects } from "@/config/launch";
import type { RouteKey } from "@/config/routes";
import type { Dictionary } from "@/content";

/**
 * Section reference for a top-level page, from its place in the main navigation, so page headers
 * match the phone menu's numbering ("01 — Services" … "05 — Contact").
 */
export function sectionRef(t: Dictionary["common"], route: RouteKey): { index: string; label: string } | undefined {
  // The menu leaves Projects out while there is no project to show, so the numbers follow the visible items.
  const items = t.nav.items.filter((item) => item.route === route || item.route !== "projects" || hasProjects);
  const i = items.findIndex((item) => item.route === route);
  if (i === -1) return undefined;
  return { index: String(i + 1).padStart(2, "0"), label: items[i].label };
}
