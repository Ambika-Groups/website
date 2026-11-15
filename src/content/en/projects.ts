import { usePlaceholderProjects } from "@/config/launch";
import { cmsProjects } from "@/lib/cms";
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

const placeholderItems: Project[] = [
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

// Once the website back end is live, the admin's Projects (only those switched on with "Show on website") replace
// the placeholders above, in the admin's order. null means no snapshot yet (demo mode): keep the placeholders.
const items: Project[] = cmsProjects
  ? [...cmsProjects]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((p) => ({
        slug: p.slug,
        title: p.title,
        service: p.service,
        location: p.location,
        year: p.year,
        clientType: p.clientType ?? "",
        status: p.status === "completed" ? "Completed" : "Ongoing",
        summary: p.summary,
        scope: p.scope ?? [],
        // Gallery slots after the main photo: exactly the photos the admin uploaded.
        photos: Math.max(0, p.photoAlts.length - 1),
      }))
  : usePlaceholderProjects
    ? placeholderItems
    : []; // a production build with no real project shows none (and leaves the Projects links out)

const projects = {
  meta: {
    title: "Projects | Construction, Roads & Paver Work",
    description: "Completed and ongoing construction, road and paver projects by Ambika Groups.",
  },
  title: "Projects",
  intro: "Completed and ongoing work for private clients and government departments.",
  placeholderNotice: usePlaceholderProjects ? "These entries are placeholders. Real projects and photos will replace them." : "",
  empty: {
    title: "Our project gallery is being prepared",
    body: "Tell us what you are planning and we will tell you about similar work we have done.",
  },
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
