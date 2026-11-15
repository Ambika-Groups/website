// TODO(content): DRAFT. To be reviewed and approved by the user or their advocate (including
// against India's Digital Personal Data Protection Act, 2023) before launch. Keep it in step with
// the enquiry form contract (docs/shared/enquiry-form-contract.md) if fields change.

import { preview } from "@/config/launch";
import { cmsSettings, filled } from "@/lib/cms";

// Site settings → Privacy policy: `approved` is switched on once the advocate approves this text. That removes the
// draft notice and the square brackets around the drafted paragraphs; `retention` and `updated` fill the two gaps.
const approved = cmsSettings?.privacy?.approved === true;
const retention = filled(cmsSettings?.privacy?.retention);
const updated = filled(cmsSettings?.privacy?.updated);
const unbracket = (text: string) => (approved ? text.replace(/^\[([\s\S]*)\]$/, "$1") : text);

interface Section {
  heading: string;
  paragraphs?: string[];
  list?: string[];
}

const sections: Section[] = [
  {
    heading: "Who we are",
    paragraphs: [
      "This website belongs to Ambika Group. This page explains what information we collect through the website, why, and what you can ask us to do with it. Our contact details are at the end of the page.",
    ],
  },
  {
    heading: "What you give us in the enquiry form",
    list: [
      "Your name",
      "Your mobile number",
      "Your email address, if you give one",
      "The type of work, the site location, and the plot size or budget if you give it",
      "Your message",
      "Your agreement that we may contact you about the enquiry",
    ],
  },
  {
    heading: "What the website adds to your enquiry",
    list: [
      "The address of the page you sent the form from",
      "The language of that page",
      "Campaign tags, if you arrived through one of our advertisements or links (for example, which advertisement it was)",
    ],
  },
  {
    heading: "Why we use it",
    list: [
      "To reply to your enquiry and discuss your project",
      "To follow up with you by phone, WhatsApp or email about that enquiry",
      "To understand which of our advertisements and links bring enquiries",
    ],
    paragraphs: ["We do not sell your information, and we do not share it with anyone for their own marketing."],
  },
  {
    heading: "Who handles it",
    // TODO(content): draft for the advocate to approve (contract v3). It describes the website's own back end:
    // enquiries stored on Google Cloud (Firebase, Mumbai region), owner emails sent through Resend, and Web3Forms
    // only as the fallback. The bracketed parts are placeholders. When the CRM link is switched on, add the third
    // sentence about the customer records system. Site settings → Privacy policy switches the brackets off.
    paragraphs: [
      unbracket("[Your enquiry is stored in our website's database on Google Cloud (Firebase), in Google's Mumbai region. Only our staff can see it, after signing in.]"),
      unbracket("[When an enquiry arrives, we are sent an email about it through Resend, an email delivery service.]"),
      unbracket("[Until our database is switched on, the form sends your enquiry to us by email through Web3Forms, a form service, instead.]"),
      unbracket("[Once our customer records system (CRM) is connected, your enquiry is also copied there so our team can follow it up.]"),
    ],
  },
  {
    heading: "How long we keep it",
    paragraphs: [retention ?? "[Period to be decided, for example: for as long as the enquiry or project is active, and then for [N] years.]"],
  },
  {
    heading: "What the website stores on your device",
    list: [
      "Your light or dark mode choice, so the site remembers it",
      "Campaign tags, until you close the browser tab",
    ],
    paragraphs: [
      "The website does not use advertising cookies. The map on the Contact page loads from Google only when you choose “Show map”, and Google's own privacy policy then applies. The video on the Contact page shows only its preview picture until you press play; the player then loads from YouTube (youtube-nocookie.com), and Google's privacy policy applies. WhatsApp links open WhatsApp, where WhatsApp's policy applies.",
    ],
  },
  {
    heading: "Your choices",
    paragraphs: [
      "You can ask us to show you, correct or delete the information we hold about you, or to stop contacting you. Call, WhatsApp or email us using the details below.",
    ],
  },
];

const privacy = {
  meta: {
    title: "Privacy Policy",
    description: "How Ambika Group uses the information you send through the website's enquiry form.",
  },
  title: "Privacy policy",
  draftNotice: "Draft. This policy has not yet been approved and will change before the website goes live.",
  approved,
  lastUpdated: updated ? `Last updated: ${updated}` : preview ? "Last updated: [date]" : "",
  sections,
  contactHeading: "Contact us about your information",
  contentsHeading: "Contents",
};

export default privacy;
