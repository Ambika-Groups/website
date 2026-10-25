import type { WorkType } from "@/config/forms";
import type { FieldErrorCode } from "@/lib/enquiry";

const form = {
  title: "Request a quote",
  intro: "Share a few details and our team will call you back.",
  requiredNote: "All fields are required unless marked optional.",
  // Examples live in hints, not placeholders, so they stay visible while typing (brand.md v2, Forms).
  fields: {
    name: { label: "Your name" },
    phone: { label: "Mobile number", hint: "10-digit mobile, for example 98765 43210" },
    email: { label: "Email (optional)", hint: "For example name@example.com" },
    work_type: { label: "Type of work", placeholder: "Choose one" },
    location: { label: "Site location", hint: "Area and city where the work is" },
    size_or_budget: { label: "Plot size or budget (optional)", hint: "For example 1,200 sq ft or ₹25 lakh" },
    message: { label: "Tell us about the project", hint: "For example: what you want built and when you want to start" },
  },
  workTypes: {
    house: "House construction",
    apartment: "Apartment / building",
    road: "Road works",
    interlocking: "Interlocking / paver blocks",
    other: "Something else",
  } satisfies Record<WorkType, string>,
  // TODO(content): consent wording to be approved by the user or their advocate.
  consent: {
    before: "I agree that Ambika Group may contact me about this enquiry by phone, WhatsApp or email, as described in the ",
    link: "privacy policy",
    after: ".",
  },
  errors: {
    nameLength: "Enter your name (2 to 100 characters).",
    phoneInvalid: "Enter a 10-digit mobile number.",
    emailInvalid: "Enter a valid email address, or leave it blank.",
    workTypeRequired: "Choose the type of work.",
    locationRequired: "Enter the site location.",
    locationTooLong: "Keep the location under 120 characters.",
    sizeTooLong: "Keep this under 100 characters.",
    messageRequired: "Tell us briefly about the project.",
    messageTooLong: "Keep the message under 2,000 characters.",
    consentRequired: "Tick the box so we can contact you.",
  } satisfies Record<FieldErrorCode, string>,
  errorSummary: "Please correct the highlighted fields.",
  submit: "Send enquiry",
  sending: "Sending…",
  success: {
    title: "Enquiry sent. Thank you.",
    // TODO(content): add a response-time promise once the user confirms it.
    body: "We will call you on the number you gave. For anything urgent, call or WhatsApp us.",
  },
  failure: {
    title: "Your enquiry could not be sent.",
    body: "Nothing you typed has been lost. Please try again, or reach us directly:",
  },
  honeypotLabel: "Leave this box unticked",
};

export default form;
