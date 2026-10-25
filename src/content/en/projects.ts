import type { ServiceKey } from "@/config/routes";

// TODO(content): every project below is a placeholder. Replace with real projects and photos.
// Slugs become URLs (/projects/<slug>); pick short, lowercase, hyphenated slugs for real ones.

export interface Project {
  slug: string;
  title: string;
  service: ServiceKey;
  location: string;
  year: string;
  clientType: string;
  status: string;
  summary: string;
  scope: string[];
  /** Placeholder gallery slots shown until photos/project-<slug>-N files exist. */
  photos: number;
}

const items: Project[] = [
  {
    slug: "sample-house",
    title: "[Sample project: house]",
    service: "construction",
    location: "[Location]",
    year: "[Year]",
    clientType: "[Private client]",
    status: "[Completed]",
    summary: "[One or two sentences about the project: what was built and for whom.]",
    scope: ["[Scope item, e.g. G+1 house, 1,800 sq ft]", "[Scope item]", "[Scope item]"],
    photos: 6,
  },
  {
    slug: "sample-road",
    title: "[Sample project: road]",
    service: "roadWorks",
    location: "[Location]",
    year: "[Year]",
    clientType: "[Government department]",
    status: "[Completed]",
    summary: "[One or two sentences about the project.]",
    scope: ["[Scope item, e.g. 1.2 km CC road]", "[Scope item]", "[Scope item]"],
    photos: 6,
  },
  {
    slug: "sample-paver",
    title: "[Sample project: paver work]",
    service: "interlockingPaver",
    location: "[Location]",
    year: "[Year]",
    clientType: "[Housing society]",
    status: "[Ongoing]",
    summary: "[One or two sentences about the project.]",
    scope: ["[Scope item, e.g. 4,000 sq ft parking area]", "[Scope item]"],
    photos: 4,
  },
];

const projects = {
  meta: {
    title: "Projects | Construction, Roads & Paver Work",
    description: "Completed and ongoing construction, road and paver projects by Ambika Group.",
  },
  title: "Projects",
  intro: "Completed and ongoing work for private clients and government departments.",
  placeholderNotice: "These entries are placeholders. Real projects and photos will replace them.",
  items,
  labels: {
    view: "View project",
    breadcrumb: "Projects",
    details: "Project details",
    service: "Service",
    location: "Location",
    year: "Year",
    clientType: "Client",
    status: "Status",
    scope: "Scope of work",
    photos: "Photos",
    all: "All projects",
  },
};

export default projects;
