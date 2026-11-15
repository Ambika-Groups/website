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
  servicePlumbingSewage: "service-plumbing-sewage",
  governmentWork: "government-work",
} as const;

export type FormId = (typeof formIds)[keyof typeof formIds];

/** The form placement on each service page. */
export const serviceFormIds = {
  construction: formIds.serviceConstruction,
  roadWorks: formIds.serviceRoadWorks,
  interlockingPaver: formIds.serviceInterlockingPaver,
  realEstate: formIds.serviceRealEstate,
  plumbingSewage: formIds.servicePlumbingSewage,
} as const satisfies Record<ServiceKey, FormId>;

/** The service a form belongs to, for the forms on the service pages (form_id → service key). */
export const serviceByFormId = Object.fromEntries(Object.entries(serviceFormIds).map(([service, id]) => [id, service])) as Partial<Record<FormId, ServiceKey>>;

/**
 * The contract's work_type list is frozen (house, apartment, road, interlocking, other), so a service with no entry of
 * its own is sent as "other" and its name goes into the subject and the message (see buildPayload's serviceLabel).
 */
export const workTypeForService: Partial<Record<ServiceKey, WorkType>> = { plumbingSewage: "other" };

export const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

/**
 * Where the form posts (contract v3): the website's own submitEnquiry function (functions/index.js), set with
 * NEXT_PUBLIC_ENQUIRY_ENDPOINT. While that is empty the form falls back to Web3Forms, as in stage 1. The CRM is
 * reached only through the back end's forward, never from the browser. Switching is configuration only.
 */
export const ENQUIRY_ENDPOINT = process.env.NEXT_PUBLIC_ENQUIRY_ENDPOINT || WEB3FORMS_ENDPOINT;

/** access_key is sent only to Web3Forms; the website's own function never receives it (contract v2/v3). */
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
