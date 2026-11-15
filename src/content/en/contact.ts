import { cmsSettings } from "@/lib/cms";

const contact = {
  meta: {
    title: "Request a Site Visit | Ambika Group, Construction & Road Works",
    description:
      "Planning a house, apartment, road or paver work? Share a few details and our team calls you back to plan a site visit and an itemised estimate.",
  },
  // The page is also the landing page for ads, so the first screen says what to do and links straight to the form.
  // TODO(content): the hero and card wording is a draft; the client should confirm it (CONTENT-CHECKLIST.md, section 3).
  hero: {
    kicker: "Houses · Apartments · Roads · Interlocking",
    titleLead: "Building a house, road or paver yard?",
    titleAccent: "Start with a site visit.",
    lead: "Share a few details. Our team calls you back, visits your site and gives you an itemised estimate.",
    cta: "Request a site visit",
    orTalk: "Or talk to us now",
  },
  // The video beside the enquiry card (a click-to-load player; nothing loads from YouTube before play).
  // TODO(content): CONFIRM THE VIDEO. This ID was supplied for the layout, but the video ("Apply your own photo|company
  // logo| on your pendrive", channel "Hem K Tech 3232") is not about Ambika Group. Replace it with the company's own
  // video, or remove the video block (CONTENT-CHECKLIST.md, section 3).
  // To switch the video off, set id to "": the page then hides the video and its caption. Once the website back end
  // is live, the admin's Site settings set it instead (an empty video id there hides the block too).
  video: {
    id: cmsSettings?.videoId !== undefined ? cmsSettings.videoId.trim() : "jSkQGg2Tgoc",
    title: "Apply your own photo|company logo| on your pendrive",
    play: "Play video",
    watchOnYoutube: "Watch on YouTube",
    caption: "Watch this short video first, then fill in the form.",
  },
  card: {
    titleLead: "Let's talk about your",
    titleAccent: "project.",
    intro: "Fill in your details and our team will call you back.",
    // TODO(content): replace with the response-time promise once the client confirms one (common.ts has the same TODO).
    badge: "Your enquiry goes straight to our team",
    intentLabel: "How would you like to start?",
    intents: {
      form: { title: "Request a site visit", sub: "Fill in the form below" },
      talk: { title: "Talk to us first", sub: "Call or WhatsApp now" },
    },
    talk: {
      title: "Talk to us first",
      body: "Ask a quick question before you send any details.",
      hours: "Office hours",
    },
  },
  next: {
    label: "What happens next",
    steps: [
      { title: "We call you back", body: "To understand the work and fix a time that suits you." },
      { title: "Site visit", body: "We visit the site, take measurements and note what you need." },
      { title: "Itemised estimate", body: "You get an itemised estimate and a schedule to review." },
      { title: "Your details stay private", body: "We use what you send only to reply to this enquiry." },
    ],
  },
  // TODO(content): draft answers built from the rest of the site; the client should confirm them.
  faq: {
    title: "Questions people ask",
    intro: "Not ready to send details yet? These might help.",
    items: [
      {
        q: "What kind of work do you take on?",
        a: "House and apartment construction, road works (CC and bituminous roads, drains, culverts), interlocking and paver block work, and real estate development.",
      },
      {
        q: "Do you work for government departments?",
        a: "Yes. We carry out civil and road works for departments such as Nagar Nigam and PWD, to the tender's specification and schedule.",
      },
      {
        q: "What happens after I send an enquiry?",
        a: "Our team calls you on the number you gave to understand the work. We then visit the site, take measurements and give you an itemised estimate to review.",
      },
      {
        q: "Do you visit the site before quoting?",
        a: "Yes. We visit the site and take measurements first, so the estimate is based on your actual site.",
      },
      {
        q: "Can I just call or message on WhatsApp?",
        a: "Yes. Use the call or WhatsApp buttons on this page. You don't need to fill in the form first.",
      },
      {
        q: "What do you do with my details?",
        a: "We use them only to reply to your enquiry. The privacy policy explains what we keep and for how long.",
      },
    ],
  },
  details: {
    heading: "Reach us directly",
    phone: "Phone",
    whatsapp: "WhatsApp",
    email: "Email",
    address: "Office",
    hours: "Hours",
    serviceArea: "Service area",
  },
  map: {
    heading: "Location",
    load: "Show map",
    note: "The map loads from Google when you click.",
    title: "Map of the Ambika Group office",
  },
};

export default contact;
