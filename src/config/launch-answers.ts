/**
 * LAUNCH ANSWERS: the quick path for LAUNCH-QUESTIONS.md.
 *
 * Type each answer between the quotes (or into the list), save the file, and rebuild. No admin, Firebase or
 * Netlify account is needed. Every key starts with the question number it answers (q5_phone answers Q5), so you
 * can find it in LAUNCH-QUESTIONS.md. All entries are empty until you fill them.
 *
 * HOW IT IS USED
 *  - Priority: /admin → Site settings (once the back end exists) overrides this file, and this file overrides the
 *    site's built-in defaults. An empty or switched-off value in the admin does not override a filled one here.
 *  - `npm run launch-check` reads this file and says which answers come from here and which from the admin.
 *  - The admin stays the long-term path: once it is live, move the answers there and leave these empty.
 *
 * KEEP IT FREE OF SECRETS. This file is committed and ends up on the public website. Put only public details here
 * (phone, address, wording). Never a key, password, token or private link: the enquiry key and the back-end keys
 * stay in Netlify's environment settings (DEPLOY.md). A unit test fails if something that looks like a secret is
 * typed here. Questions that are not in this file (Q2, Q3, Q17, Q35 to Q39) are answered elsewhere; their
 * entries in LAUNCH-QUESTIONS.md say where.
 */

export interface LaunchAnswers {
  q1_siteUrl: string;
  q4_tradingName: string;
  q5_phone: { display: string; dialling: string };
  q6_whatsapp: { display: string; number: string };
  q7_email: string;
  q8_address: { line: string; city: string; state: string; pin: string };
  q9_contactCopyApproved: boolean;
  q10_privacyApproved: boolean;
  q11_retention: string;
  q12_lastUpdated: string;
  q13_servicesCopyApproved: boolean;
  q14_governmentCopyApproved: boolean;
  q15_homeCopyApproved: boolean;
  q16_consentCopyApproved: boolean;
  q18_hours: string;
  q19_serviceArea: string;
  q20_mapUrl: string;
  q21_videoId: string;
  q22_responseTime: string;
  q23_legalName: string;
  q24_gstin: string;
  q25_pan: string;
  q26_registrations: { label: string; value: string }[];
  q27_departments: string[];
  q28_projects: {
    slug: string;
    title: string;
    service: "construction" | "roadWorks" | "interlockingPaver" | "realEstate";
    location: string;
    year: string;
    clientType: string;
    status: "completed" | "ongoing";
    summary: string;
    scope: string[];
    /** How many photos the project has (photos/project-<slug>-1.jpg, -2.jpg …). */
    photos: number;
  }[];
  q29_realEstateProjects: { title: string; hint: string }[];
  q30_aboutStory: string[];
  q31_aboutPeople: { name: string; role: string }[];
  q32_numbers: { value: string; label: string }[];
  q33_trusted: { clients: string[]; certificates: string[] };
  q34_closingStatement: string;
}

export const launchAnswers: LaunchAnswers = {
  // Q1. The website's real address. Example: "https://www.ambikagroup.in" (https, no slash at the end).
  // (A NEXT_PUBLIC_SITE_URL setting in Netlify, if there is one, takes priority.)
  // The owner owns ambikagroups.tech, but it is NOT connected to this website yet ("we don't have the company
  // domain for now"). Left empty on purpose: the address must be the one the site is really served from. When the
  // domain is connected, type "https://www.ambikagroups.tech" (or whatever it is served as) here.
  q1_siteUrl: "",

  // Q4. Trading name. Example: "Ambika Groups". Empty keeps "Ambika Groups".
  q4_tradingName: "Ambika Groups",

  // Q5. Main phone. display: "+91 98765 43210"   dialling: "+919876543210" (plus sign, 91, ten digits, no spaces)
  q5_phone: { display: "+91 79056 46351", dialling: "+917905646351" },

  // Q6. WhatsApp. display: "+91 98765 43210"   number: "919876543210" (digits only, starting with 91)
  q6_whatsapp: { display: "+91 79056 46351", number: "917905646351" },

  // Q7. Email shown on the site. Example: "info@ambikagroup.in"
  q7_email: "ambikagroups.tech@gmail.com",

  // Q8. Office address. Example: line "12 Station Road", city "Lucknow", state "Uttar Pradesh", pin "226001"
  // The owner gave no PIN code, so it stays empty (never guessed); the address reads correctly without it.
  q8_address: { line: "A-329/1, Bengali Colony (बंगाली कॉलोनी), Bhagwanpur", city: "Varanasi", state: "Uttar Pradesh", pin: "" },

  // Q9, Q13, Q14, Q15, Q16. Set to true once you have read and approved the draft wording for that page.
  q9_contactCopyApproved: true, // Contact page: headline, "What happens next", FAQ answers
  q13_servicesCopyApproved: true, // the five service pages: work lists and client types
  q14_governmentCopyApproved: true, // Government work page text
  q15_homeCopyApproved: true, // Home headline and steps, About "Who we work for"
  q16_consentCopyApproved: true, // the consent sentence under the enquiry form

  // Q10. Set to true once the advocate has approved the Privacy policy text (removes the "draft" notice and brackets).
  // Approved by the owner and live. The owner's advocate has NOT reviewed it yet and will adjust it later; advocate
  // review is still advised (edit src/content/en/privacy.ts when they send changes).
  q10_privacyApproved: true,
  // Q11. Example: "For as long as the enquiry or project is active, and then for 2 years."
  // Deliberately NOT a fixed period: the owner keeps enquiry details until they are no longer needed, so the notice
  // must say that. (A real 2-year period needs an automatic cleanup first: docs/BACKEND-PLAN.md.)
  q11_retention:
    "We keep enquiry details for as long as the enquiry or project is active and for our business records afterwards. You can ask us to delete your details at any time by calling or emailing us.",
  // Q12. Example: "12 November 2026"
  // The owner said "31 June 2026", which is not a date (June has 30 days); 30 June 2026 is used. Confirm it.
  q12_lastUpdated: "30 June 2026",

  // Q18. Example: "Mon–Sat, 10:00–18:00"
  q18_hours: "Mon–Sat, 9:00–17:00",
  // Q19. Example: "Lucknow and nearby districts"
  q19_serviceArea: "Varanasi, and across Uttar Pradesh and other states",
  // Q20. Google Maps share link. Example: "https://maps.app.goo.gl/AbCdEf123"
  q20_mapUrl: "https://maps.app.goo.gl/9e9VVzyVNkRT2brB6",
  // Q21. YouTube video id or link for the Contact page. Empty hides the video. Example: "AbCdEfGhIjK"
  // No video yet: the Contact page shows a neutral "Video coming soon" frame (nothing from YouTube loads).
  // When the owner sends a link, paste it here.
  q21_videoId: "",
  // Q22. Optional promise. Example: "We call you back within one working day." Empty means no promise.
  q22_responseTime: "We usually call you back within 1 to 6 hours.",

  // Q23. Registered legal name, as on the GST certificate.
  // Dictated as "Ambika Groups" without a registered suffix: confirm the exact spelling against the GST certificate.
  q23_legalName: "Ambika Groups",
  // Q24. GSTIN. Example: "09ABCDE1234F1Z5"
  q24_gstin: "09AGTPO8309F1ZU",
  // Q25. PAN. Example: "ABCDE1234F"
  q25_pan: "",

  // Q26. Registrations and class. Example: [{ label: "Contractor class", value: "Class A, PWD UP" }]
  q26_registrations: [],
  // Q27. Other departments besides Nagar Nigam and PWD. Example: ["Jal Nigam", "Lucknow Development Authority"]
  q27_departments: ["Jal Nigam Varanasi", "Jal Kal Vibhag (Jalkal Vibhag)", "Irrigation Department"],

  // Q28. Projects to show (text here; photos go in the photos folder as project-<slug>-1.jpg, -2.jpg …).
  // Example: { slug: "colony-cc-road", title: "Colony CC road", service: "roadWorks", location: "Barabanki",
  //   year: "2025", clientType: "Housing society", status: "completed", summary: "About 800 m of CC road with drains.",
  //   scope: ["800 m CC road", "Side drains"], photos: 4 }
  q28_projects: [],

  // Q29. Real estate projects. Example: [{ title: "Ambika Residency", hint: "Lucknow, 2 and 3 BHK, booking open" }]
  q29_realEstateProjects: [],

  // Q30. Company story, one paragraph per entry. Facts you are happy to publish.
  q30_aboutStory: [],
  // Q31. People shown on About. Example: [{ name: "Ramesh Verma", role: "Founder" }]
  q31_aboutPeople: [],

  // Q32. Four true figures. Example: [{ value: "15+", label: "Years of work" }, { value: "140", label: "Projects completed" },
  //   { value: "9", label: "Districts served" }, { value: "35", label: "Kilometres of road" }]. Fill all four to show it.
  q32_numbers: [],
  // Q33. Clients that agreed to be named, and certificates. Example: { clients: ["Nagar Nigam Lucknow"], certificates: ["ISO 9001:2015"] }
  q33_trusted: { clients: [], certificates: [] },

  // Q34. One closing line about the work. Example: "Houses, roads and paved ground, built to specification."
  q34_closingStatement: "",
};
