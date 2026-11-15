// Demo mode only: clearly labelled sample data, generated the same way every time, so the dashboard can be
// reviewed before the website's Firebase project exists. Every record has `sample: true` and "Sample" in its
// name or title; nothing here is ever shown on the public site.
import type { Enquiry, EnquiryStatus, Post, Project, PublishEntry, SiteSettings } from "./types";

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

const firstNames = ["Ravi", "Anita", "Suresh", "Pooja", "Imran", "Neha", "Vikas", "Sunita", "Arjun", "Meera", "Rahul", "Kavita"];
const places = ["Lucknow, Gomti Nagar", "Lucknow", "Kanpur", "Barabanki", "Lucknow, Aliganj", "Unnao", "Sitapur", "Rae Bareli"];
const workTypes = ["house", "house", "house", "apartment", "road", "interlocking", "interlocking", "other"];
const forms = ["contact-page", "contact-page", "home-cta", "service-construction", "service-road-works", "service-interlocking-paver", "government-work"];
const sources: [string, string, string][] = [
  ["", "", ""],
  ["", "", ""],
  ["meta", "paid", "site-visit-oct"],
  ["meta", "paid", "site-visit-oct"],
  ["google", "organic", ""],
  ["whatsapp", "share", ""],
];
const messages = [
  "Sample: planning a G+1 house on a 30x40 plot, need an estimate.",
  "Sample: interlocking tiles for a 2,000 sq ft parking area.",
  "Sample: boundary wall and gate for a new plot.",
  "Sample: CC road inside our colony, about 300 m.",
  "Sample: second floor on an existing house.",
];

export function sampleEnquiries(now = Date.now()): Enquiry[] {
  const r = rng(42);
  const out: Enquiry[] = [];
  for (let i = 0; i < 64; i++) {
    const created = new Date(now - Math.floor(r() * 120 * 86_400_000));
    const age = (now - created.getTime()) / 86_400_000;
    const roll = r();
    // Older enquiries have moved further along; recent ones are mostly new.
    const status: EnquiryStatus = age < 2 ? "new" : roll < 0.15 ? "new" : roll < 0.45 ? "contacted" : roll < 0.65 ? "quoted" : roll < 0.82 ? "won" : "lost";
    const firstContactAt = status === "new" ? null : new Date(created.getTime() + (0.5 + r() * 30) * 3_600_000).toISOString();
    const [utm_source, utm_medium, utm_campaign] = sources[Math.floor(r() * sources.length)];
    const form = forms[Math.floor(r() * forms.length)];
    const path = form === "contact-page" ? "/contact" : form === "home-cta" ? "/" : form === "government-work" ? "/government-work" : `/services/${form.replace("service-", "")}`;
    out.push({
      id: `sample-${i + 1}`,
      createdAt: created.toISOString(),
      name: `Sample ${firstNames[i % firstNames.length]}`,
      phone: `+9199999${String(10000 + i).slice(-5)}`,
      email: i % 3 === 0 ? `sample${i + 1}@example.com` : "",
      work_type: workTypes[Math.floor(r() * workTypes.length)],
      location: places[Math.floor(r() * places.length)],
      size_or_budget: i % 2 ? "1,200 sq ft" : "",
      message: messages[i % messages.length],
      consent: "yes",
      source_url: `https://www.example.com${path}${utm_source ? `?utm_source=${utm_source}` : ""}`,
      sourcePath: path,
      source: utm_source || "direct",
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term: "",
      utm_content: "",
      form_id: form,
      lang: "en",
      status,
      needsChecking: i === 5,
      rejectReasons: i === 5 ? ["location"] : undefined,
      notes: status === "new" ? [] : [{ at: firstContactAt as string, by: "sample", text: "Sample note: called, site visit planned." }],
      firstContactAt,
      statusHistory: [],
      email_status: "sent",
      crm_status: "not_configured",
      sample: true,
    });
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function samplePosts(now = Date.now()): Post[] {
  const day = 86_400_000;
  return [
    {
      id: "sample-post-1",
      slug: "sample-planning-a-house",
      title: "Sample post: what to check before building a house",
      excerpt: "Sample excerpt. Real posts are written by the company in the admin.",
      body: "## Sample heading\n\nThis is **sample** text for the demo. Real posts are written in the admin.\n\n- A list item\n- Another item\n\n[Request a site visit](/contact)",
      tags: ["Sample", "Houses"],
      seoTitle: "",
      seoDescription: "",
      status: "published",
      publishedAt: new Date(now - 20 * day).toISOString(),
      updatedAt: new Date(now - 20 * day).toISOString(),
      cover: null,
      relatedProjects: ["sample-house"],
      sample: true,
    },
    {
      id: "sample-post-2",
      slug: "sample-paver-blocks",
      title: "Sample draft: choosing paver blocks",
      excerpt: "Sample draft for the demo.",
      body: "Sample draft text.",
      tags: ["Sample", "Paver work"],
      seoTitle: "",
      seoDescription: "",
      status: "draft",
      publishedAt: null,
      updatedAt: new Date(now - 2 * day).toISOString(),
      cover: null,
      relatedProjects: [],
      sample: true,
    },
  ];
}

export function sampleProjects(now = Date.now()): Project[] {
  const iso = new Date(now).toISOString();
  return [
    { id: "sample-house", slug: "sample-house", title: "[Sample project: house]", service: "construction", location: "[Location]", year: "[Year]", clientType: "[Private client]", status: "completed", summary: "[Sample summary]", scope: ["[Scope item]"], photos: [], showOnWebsite: true, reviewFlag: false, crmLinked: false, order: 1, updatedAt: iso, sample: true },
    { id: "sample-road", slug: "sample-road", title: "[Sample project: road]", service: "roadWorks", location: "[Location]", year: "[Year]", clientType: "[Government department]", status: "completed", summary: "[Sample summary]", scope: ["[Scope item]"], photos: [], showOnWebsite: true, reviewFlag: false, crmLinked: false, order: 2, updatedAt: iso, sample: true },
    { id: "sample-paver", slug: "sample-paver", title: "[Sample project: paver work]", service: "interlockingPaver", location: "[Location]", year: "[Year]", clientType: "[Housing society]", status: "ongoing", summary: "[Sample summary]", scope: ["[Scope item]"], photos: [], showOnWebsite: true, reviewFlag: false, crmLinked: false, order: 3, updatedAt: iso, sample: true },
    { id: "sample-school", slug: "sample-school-boundary", title: "[Sample project: school boundary wall]", service: "construction", location: "[Location]", year: "[Year]", clientType: "[Private client]", status: "completed", summary: "[Sample summary]", scope: [], photos: [], showOnWebsite: false, reviewFlag: true, crmLinked: false, order: 4, updatedAt: iso, sample: true },
  ];
}

export const sampleSettings = (): SiteSettings => ({ contact: {}, videoId: "jSkQGg2Tgoc", numbers: { show: false, items: [] }, trust: { show: false, logos: [], certifications: [] } });

export function samplePublishes(now = Date.now()): PublishEntry[] {
  return [{ id: "sample-pub-1", at: new Date(now - 6 * 86_400_000).toISOString(), by: "sample", status: "simulated", credits: 15 }];
}
