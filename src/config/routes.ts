// Locale-neutral paths. Wrap with localePath(locale, …) before linking.
export const routes = {
  home: "/",
  about: "/about",
  services: "/services",
  construction: "/services/construction",
  roadWorks: "/services/road-works",
  interlockingPaver: "/services/interlocking-paver",
  realEstate: "/services/real-estate-development",
  governmentWork: "/government-work",
  projects: "/projects",
  contact: "/contact",
  privacy: "/privacy",
} as const;

export type RouteKey = keyof typeof routes;

/** The four service pages, in display order. Each key is also a key of `routes`. */
export const serviceKeys = ["construction", "roadWorks", "interlockingPaver", "realEstate"] as const;
export type ServiceKey = (typeof serviceKeys)[number];

/** URL slug of a service page: /services/<slug>. */
export function serviceSlug(key: ServiceKey): string {
  return routes[key].split("/").pop()!;
}

export function serviceFromSlug(slug: string): ServiceKey | undefined {
  return serviceKeys.find((key) => serviceSlug(key) === slug);
}

/** Anchor of the enquiry form on any page that embeds one. */
export const ENQUIRY_ANCHOR = "enquiry";
