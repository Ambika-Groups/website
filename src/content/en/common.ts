import { preview } from "@/config/launch";
import type { RouteKey } from "@/config/routes";
import { cmsPostCount, cmsSettings, filled } from "@/lib/cms";

// Optional promise from Site settings (empty = no promise is made anywhere on the site).
const responseTime = filled(cmsSettings?.wording?.responseTime);

const common = {
  skipToContent: "Skip to content",
  nav: {
    label: "Main",
    items: [
      { route: "services", label: "Services" },
      { route: "governmentWork", label: "Government work" },
      { route: "projects", label: "Projects" },
      // The blog joins the menu once a post is published (src/lib/cms.ts, snapshotted at build).
      ...(cmsPostCount > 0 ? [{ route: "blog" as const, label: "Blog" }] : []),
      { route: "about", label: "About" },
      { route: "contact", label: "Contact" },
    ] satisfies { route: RouteKey; label: string }[],
    // The chevron button beside "Services" that opens the list of service pages.
    subMenu: "Service pages",
    allServices: "All services",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    menu: "Menu",
  },
  themeSwitch: "Dark mode",
  actions: {
    requestQuote: "Request a quote",
    call: "Call",
    whatsapp: "WhatsApp",
    openMaps: "Open in Google Maps",
  },
  whatsappButton: {
    label: "Chat on WhatsApp",
    shortLabel: "WhatsApp", // phones; must appear in `label` (accessible name contains the visible text)
    prefill: "Hello, I would like to enquire about a project.",
  },
  ctaBand: {
    title: "Planning a project?",
    // The response-time promise comes from Site settings (wording), never from code.
    body: responseTime
      ? `Tell us what you want to build and where. ${responseTime}`
      : "Tell us what you want to build and where. We will call you back to discuss it.",
  },
  footer: {
    tagline: "Construction, road works, interlocking and real estate development.",
    // The closing statement at the top of the footer ("the final page of a publication").
    // A claim about the work, so the client must supply or approve it: it comes from Site settings (wording).
    // A production build without one shows the plain "Planning a project?" line instead; review builds show the draft.
    statement: filled(cmsSettings?.wording?.closingStatement) ?? (preview ? "Houses, roads and paved ground, built to specification." : "Planning a project?"),
    contactHeading: "Contact",
    servicesHeading: "Services",
    companyHeading: "Company",
    gstinLabel: "GSTIN",
    hoursLabel: "Hours",
    addressLabel: "Office",
    emailLabel: "Email",
    privacy: "Privacy",
    rights: "All rights reserved.",
    backToTop: "Back to top",
  },
  enquiry: {
    label: "Enquiry",
    talkHeading: "Prefer to talk?",
    talkBody: "Call or send a WhatsApp message.",
  },
  serviceNames: {
    construction: "Construction",
    roadWorks: "Road works",
    interlockingPaver: "Interlocking & paver",
    realEstate: "Real estate development",
  } satisfies Partial<Record<RouteKey, string>>,
  placeholder: {
    photo: "Photo placeholder",
    // Shown on temporary stock photos (config/photos.ts) until real Ambika photos replace them.
    illustrative: "Illustrative photo",
  },
};

export default common;
