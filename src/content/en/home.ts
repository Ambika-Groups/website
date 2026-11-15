import { cmsSettings } from "@/lib/cms";

const home = {
  meta: {
    title: "Ambika Group | Construction, Road Works & Interlocking",
    description:
      "Ambika Group builds houses, apartments, roads and interlocking paver works for private clients and government departments.",
  },
  hero: {
    eyebrow: "Construction · Road works · Interlocking · Real estate",
    // The company's real positioning, set as a display statement (one line per entry).
    titleLines: ["We build", "houses, roads", "and paved areas."],
    body: "Construction, road works, interlocking paver work and real estate development, for families, builders and businesses, and for government departments such as Nagar Nigam and PWD.",
    imageAlt: "Apartment towers under construction, seen from above", // TODO(photo): real Ambika site photo
    secondary: "See our projects",
    facts: [
      { label: "Private clients", value: "Families, builders, businesses" },
      { label: "Government", value: "Nagar Nigam · PWD" },
    ],
    scroll: "Scroll",
  },
  // Service names, summaries and job lists live in services.ts.
  // The work-types strip under the hero (the site's one marquee, brand.md v4).
  marquee: {
    label: "Work we take on",
  },
  services: {
    index: "02",
    label: "Services",
    title: "Our services",
    intro: "Choose a service to see what it covers.",
  },
  numbers: {
    // No section number: an interlude, and hidden in production until real figures exist.
    label: "In numbers",
    title: "Work that adds up",
    // TODO(content): real figures only. The whole section is hidden in production builds until
    // these placeholders are replaced (src/config/flags.ts).
    // The admin's Site settings replace these once they hold real values (src/config/flags.ts).
    items: cmsSettings?.numbers?.items?.length
      ? cmsSettings.numbers.items
      : [
          { value: "[00]+", label: "Years of work" },
          { value: "[000]+", label: "Projects completed" },
          { value: "[00]", label: "Districts served" },
          { value: "[000]", label: "Kilometres of road" },
        ],
    notice: "Placeholder figures. This section stays hidden on the live site until real numbers are supplied.",
  },
  trust: {
    label: "Clients and registrations",
    title: "Trusted by",
    // TODO(content): real client logos (with each client's permission) and real certifications only.
    // Hidden in production builds until then (config/flags.ts).
    logos: cmsSettings?.trust?.logos?.length ? cmsSettings.trust.logos : ["[Client logo]", "[Client logo]", "[Client logo]", "[Client logo]", "[Client logo]"],
    certifications: cmsSettings?.trust?.certifications?.length
      ? cmsSettings.trust.certifications
      : ["[Contractor registration]", "[ISO or quality certificate]", "[Safety certificate]"],
    notice: "Placeholder logos. This section stays hidden on the live site until real client logos and certificates are supplied.",
  },
  government: {
    index: "03",
    label: "Government work",
    title: "Work for government departments",
    body: "We carry out civil and road works for departments such as Nagar Nigam and PWD, to the tender's specification and schedule.",
    departments: ["Nagar Nigam (municipal corporation)", "PWD (Public Works Department)"],
    // TODO(content): registrations / contractor class / empanelments to list here.
    credentials: "[Contractor registration and class to be supplied]",
    link: "About our government work",
  },
  projects: {
    index: "01",
    label: "Portfolio",
    title: "Selected projects",
    intro: "Completed and ongoing work for private clients and government departments.",
    projectId: "PRJ",
    view: "View project",
    // Shows the first three entries of projects.ts.
    all: "All projects",
  },
  process: {
    index: "04",
    label: "Process",
    title: "How a project runs",
    steps: [
      { title: "Site visit", body: "We visit the site, take measurements and note what you need." },
      { title: "Estimate", body: "You get an itemised estimate and a schedule to review." },
      { title: "Build", body: "Our team carries out the work and updates you at each stage." },
      { title: "Handover", body: "We inspect the finished work with you before handing it over." },
    ],
  },
  enquiry: {
    title: "Tell us about your project",
    body: "Share a few details and we will call you back to discuss it.",
  },
};

export default home;
