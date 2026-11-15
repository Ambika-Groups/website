import { isReal, preview } from "@/config/launch";
import { cmsSettings } from "@/lib/cms";

const registrations = (cmsSettings?.government?.registrations ?? []).filter((r) => isReal(r.label) && isReal(r.value));
const moreDepartments = (cmsSettings?.government?.departments ?? []).filter(isReal).map((name) => ({ name, hint: "" }));

const government = {
  meta: {
    title: "Government Work | Nagar Nigam & PWD Contractor",
    description:
      "Ambika Groups carries out road, drain and paver works for government departments such as Nagar Nigam and PWD, to tender specification.",
  },
  title: "Work for government departments",
  intro:
    "We carry out civil and road works for departments such as Nagar Nigam and PWD, to the tender's specification and schedule.",
  departments: {
    title: "Departments we work with",
    items: [
      { name: "Nagar Nigam", hint: "Municipal corporation of a city" },
      { name: "PWD", hint: "Public Works Department of the state government" },
      // Further departments the client confirms (Site settings → Government work).
      ...moreDepartments,
    ],
  },
  work: {
    title: "Types of work",
    items: ["CC and bituminous roads", "Drains and culverts", "Interlocking paver footpaths and roads", "Repair and resurfacing"],
  },
  credentials: {
    title: "Registrations",
    intro: "Details a department needs before awarding work.",
    // TODO(content): registrations come from Site settings (Government work). Never published until supplied;
    // PAN and GSTIN are added by the page from Site settings (Company details). The section is left out while empty.
    items: registrations.length
      ? registrations
      : preview
        ? [
            { label: "Contractor registration", value: "[Department and registration number]" },
            { label: "Contractor class", value: "[Class]" },
          ]
        : [],
  },
  howWeWork: {
    title: "How we take on tendered work",
    steps: [
      { title: "Tender review", body: "We study the specification, the BOQ and the site before quoting." },
      { title: "Execution", body: "Work follows the specified materials, thicknesses and the department's schedule." },
      { title: "Inspection", body: "We work with the department's engineers on measurement and quality checks." },
      { title: "Handover", body: "Finished work is handed over with the documents the department asks for." },
    ],
    hints: { boq: "Bill of quantities (BOQ): the itemised list of work and materials in a tender" },
  },
  enquiry: {
    title: "Enquiries from departments",
    body: "Departments and their engineers can send work details here, or call us directly.",
  },
};

export default government;
