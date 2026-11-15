// Services overview and the four service pages. Home's service grid reads `items` too.
// TODO(content): the user confirms every scope list and client type below.
import { isReal, preview } from "@/config/launch";
import type { ServiceKey } from "@/config/routes";
import { cmsSettings } from "@/lib/cms";

const realEstateProjects = (cmsSettings?.realEstate?.projects ?? []).filter((p) => isReal(p.title)).map((p) => ({ title: p.title, hint: isReal(p.hint) ? p.hint : undefined }));

interface ScopeItem {
  title: string;
  /** Plain-words meaning of a technical term (brand.md v2, "Built for non-technical users"). */
  hint?: string;
}

interface ServicePage {
  meta: { title: string; description: string };
  summary: string;
  jobs: string[];
  intro: string;
  scope: ScopeItem[];
  clients: string[];
  enquiryTitle: string;
}

const pages: Record<ServiceKey, ServicePage> = {
  construction: {
    meta: {
      title: "Construction | Houses, Apartments & Buildings",
      description: "Ambika Group builds independent houses, apartment buildings and commercial buildings, from foundation to finishing.",
    },
    summary: "New buildings from foundation to finishing.",
    jobs: ["Independent houses", "Apartment buildings", "Commercial buildings"],
    intro:
      "We build on your plot from the foundation up: structure, masonry, plumbing and electrical work, and finishing. You deal with one team from the estimate to the handover.",
    scope: [
      { title: "Independent houses", hint: "Single-family homes, including G+1 and G+2 (ground plus one or two floors)" },
      { title: "Apartment buildings" },
      { title: "Commercial buildings", hint: "Shops, offices and showrooms" },
      { title: "Extensions and additional floors" },
      { title: "Boundary walls and site development" },
    ],
    clients: ["Plot owners and families", "Builders and developers", "Businesses"],
    enquiryTitle: "Ask about a construction project",
  },
  roadWorks: {
    meta: {
      title: "Road Works | CC & Bituminous Roads, Drains",
      description: "Ambika Group builds CC and bituminous roads, drains and culverts for private sites and government departments.",
    },
    summary: "Roads and allied civil work for private sites and public departments.",
    jobs: ["CC roads", "Bituminous roads", "Drains and culverts"],
    intro:
      "We build and repair roads for colonies, campuses and industrial sites, and for government departments under tender. The work includes the base, the road surface, and the drains that keep it from breaking up.",
    scope: [
      { title: "CC roads", hint: "Cement concrete roads" },
      { title: "Bituminous roads", hint: "Blacktop, also called tar roads" },
      { title: "Drains and culverts", hint: "A culvert carries water under a road" },
      { title: "Road repair and resurfacing" },
      { title: "Kerbs and footpath edging" },
    ],
    clients: ["Nagar Nigam and PWD", "Housing societies and colonies", "Factories, schools and campuses"],
    enquiryTitle: "Ask about a road project",
  },
  interlockingPaver: {
    meta: {
      title: "Interlocking & Paver Block Work",
      description: "Ambika Group lays interlocking paver blocks for driveways, parking areas, footpaths and campus roads.",
    },
    summary: "Paver block laying on a prepared, compacted base.",
    jobs: ["Driveways and parking", "Footpaths", "Campus and society roads"],
    intro:
      "Interlocking paver blocks are concrete blocks that lock together. They are quick to lay, take heavy loads and can be lifted and relaid for repairs. We prepare and compact the base first, because that decides how long the paving lasts.",
    scope: [
      { title: "Driveways and parking areas" },
      { title: "Footpaths and walkways" },
      { title: "Society and campus roads" },
      { title: "Petrol pumps and commercial yards" },
      { title: "Base preparation and edge restraints", hint: "Edge restraints stop the blocks from spreading" },
    ],
    clients: ["Homeowners", "Housing societies", "Nagar Nigam and PWD", "Businesses and institutions"],
    enquiryTitle: "Ask about paver work",
  },
  realEstate: {
    meta: {
      title: "Real Estate Development",
      description: "Residential projects developed and built by Ambika Group.",
    },
    summary: "Residential projects that Ambika Group develops and builds.",
    jobs: ["Current projects", "Upcoming projects"],
    intro: "Ambika Group develops residential projects and builds them with its own construction team.",
    // TODO(content): the projects listed come from Site settings (Real estate); the section is left out while empty.
    scope: realEstateProjects.length
      ? realEstateProjects
      : preview
        ? [
            { title: "[Current project name]", hint: "[Location · unit types · status]" },
            { title: "[Upcoming project name]", hint: "[Location · expected launch]" },
          ]
        : [],
    clients: ["Home buyers", "Investors"],
    enquiryTitle: "Ask about our projects",
  },
};

const services = {
  overview: {
    meta: {
      title: "Services | Construction, Roads, Interlocking & Real Estate",
      description:
        "Construction, road works, interlocking paver work and real estate development by Ambika Group, for private clients and government departments.",
    },
    title: "Our services",
    intro: "Choose a service to see what it covers and who we do it for.",
  },
  pages,
  labels: {
    breadcrumb: "Services",
    chapter: "Service",
    scope: "What this covers",
    clients: "Who we do this for",
    photos: "Photos of this work",
    related: "Other services",
    more: "View service",
    enquiryBody: "Share a few details and we will call you back to discuss it.",
  },
};

export default services;
