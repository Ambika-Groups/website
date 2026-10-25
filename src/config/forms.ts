import type { ServiceKey } from "./routes";

// One form_id per form placement (contract: "form_id"). Add new placements here only,
// so the full list stays in one place for the CRM's "leads by source" report.
export const formIds = {
  contactPage: "contact-page",
  homeCta: "home-cta",
  serviceConstruction: "service-construction",
  serviceRoadWorks: "service-road-works",
  serviceInterlockingPaver: "service-interlocking-paver",
  serviceRealEstate: "service-real-estate",
  governmentWork: "government-work",
} as const;

export type FormId = (typeof formIds)[keyof typeof formIds];

/** The form placement on each service page. */
export const serviceFormIds = {
  construction: formIds.serviceConstruction,
  roadWorks: formIds.serviceRoadWorks,
  interlockingPaver: formIds.serviceInterlockingPaver,
  realEstate: formIds.serviceRealEstate,
} as const satisfies Record<ServiceKey, FormId>;

export const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

/**
 * Where the form posts (contract v2). Stage 1: Web3Forms (the default). Stage 2: the CRM's
 * submitEnquiry function, set with NEXT_PUBLIC_ENQUIRY_ENDPOINT. Switching is configuration only.
 */
export const ENQUIRY_ENDPOINT = process.env.NEXT_PUBLIC_ENQUIRY_ENDPOINT || WEB3FORMS_ENDPOINT;

/** access_key is sent only to Web3Forms; the CRM endpoint never receives it (contract v2). */
export function isWeb3Forms(endpoint: string): boolean {
  try {
    return new URL(endpoint).hostname === new URL(WEB3FORMS_ENDPOINT).hostname;
  } catch {
    return false;
  }
}
export const WEB3FORMS_FROM_NAME = "Ambika Group Website";

/** Contract enum. Labels are translated in content files; these values never are. */
export const workTypes = ["house", "apartment", "road", "interlocking", "other"] as const;
export type WorkType = (typeof workTypes)[number];

export const fieldLimits = {
  nameMin: 2,
  nameMax: 100,
  location: 120,
  sizeOrBudget: 100,
  message: 2000,
} as const;
