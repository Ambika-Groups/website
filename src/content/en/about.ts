// TODO(content): the story and the people come from Site settings (About). No history, years or figures are
// published until the user supplies them: a production build leaves the section out while it is empty; review
// builds show the bracketed placeholders.
import { isReal, preview } from "@/config/launch";
import { cmsSettings } from "@/lib/cms";

const realStory = (cmsSettings?.about?.story ?? []).map((p) => p.trim()).filter(isReal);
const realPeople = (cmsSettings?.about?.people ?? []).filter((p) => isReal(p.name) && isReal(p.role));

const about = {
  meta: {
    title: "About Ambika Group",
    description: "Ambika Group: construction, road works, interlocking and real estate development.",
  },
  title: "About Ambika Group",
  intro: "Construction, road works, interlocking and real estate development, for private clients and government departments.",
  story: {
    title: "Who we are",
    paragraphs: realStory.length
      ? realStory
      : preview
        ? ["[How and when the company started, and who started it.]", "[What the company does today, and where it works.]"]
        : [],
  },
  work: {
    title: "What we do",
    body: "Choose a service to see what it covers.",
  },
  clients: {
    title: "Who we work for",
    items: [
      { title: "Private clients", body: "Families, plot owners, builders, housing societies and businesses." },
      { title: "Government departments", body: "Departments such as Nagar Nigam and PWD, through tenders." },
    ],
  },
  team: {
    title: "Leadership",
    // TODO(content): names, roles and photos, only if the user wants them shown.
    people: realPeople.length ? realPeople : preview ? [{ name: "[Name]", role: "[Role, e.g. Founder]" }, { name: "[Name]", role: "[Role]" }] : [],
  },
  company: {
    title: "Company details",
    name: "Registered name",
    gstin: "GSTIN",
    office: "Office",
    area: "Service area",
  },
};

export default about;
