// TODO(content): DRAFT. To be reviewed and approved by the user or their advocate (including
// against India's Digital Personal Data Protection Act, 2023) before launch. Keep it in step with
// the enquiry form contract (docs/shared/enquiry-form-contract.md) if fields change.

import { preview } from "@/config/launch";
import { cmsSettings, filled } from "@/lib/cms";

// Site settings → Privacy policy: `approved` is switched on once the advocate approves this text. That removes the
// draft notice; `retention` and `updated` fill the two gaps.
const approved = cmsSettings?.privacy?.approved === true;
const retention = filled(cmsSettings?.privacy?.retention);
const updated = filled(cmsSettings?.privacy?.updated);

interface Section {
  heading: string;
  paragraphs?: string[];
  list?: string[];
}

const sections: Section[] = [
  {
    heading: "Who we are",
    paragraphs: [
      "This website belongs to Ambika Groups. This page explains what information we collect through the website, why, and what you can ask us to do with it. Our contact details are at the end of the page.",
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
    // Describes what happens today: the form is sent through Web3Forms and emailed to us. The owner approved this text
    // (the advocate has not reviewed it yet and will adjust it; see LAUNCH-QUESTIONS.md, Q10). Update it BEFORE any new
    // service (the website's own database, an email service, the CRM) starts handling enquiries.
    paragraphs: [
      "When you send the enquiry form, your details are passed to Web3Forms, a form service, which emails them to us. Web3Forms handles the form on our behalf.",
      "If we change how enquiries are stored or who handles them, for example by adding our own database or a customer records system, we will update this page.",
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
    description: "How Ambika Groups uses the information you send through the website's enquiry form.",
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
