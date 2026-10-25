// TODO(content): every [bracketed] value is a placeholder. No history, years or figures are
// published until the user supplies them.

const about = {
  meta: {
    title: "About Ambika Group",
    description: "Ambika Group: construction, road works, interlocking and real estate development.",
  },
  title: "About Ambika Group",
  intro: "Construction, road works, interlocking and real estate development, for private clients and government departments.",
  story: {
    title: "Who we are",
    paragraphs: [
      "[How and when the company started, and who started it.]",
      "[What the company does today, and where it works.]",
    ],
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
    people: [
      { name: "[Name]", role: "[Role, e.g. Founder]" },
      { name: "[Name]", role: "[Role]" },
    ],
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
