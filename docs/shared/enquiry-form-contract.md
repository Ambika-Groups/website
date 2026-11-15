# Enquiry form contract: website → CRM

> **Version 3, 26 Oct 2026 (supervisor). This supersedes "stage 2" below.**
>
> **Why:** the user asked for a website admin dashboard that stores and analyses every quote request. So the website now has its **own** back end: a separate Firebase project, kept inside the free tier.
>
> **How enquiries flow now:**
> 1. The form posts the **same JSON fields** to the website's own `submitEnquiry` function.
>    - The function rules are unchanged from "CRM behaviour" below: CORS, a 10 KB cap, the rate limit, a low maxInstances, the honeypot, validation, logging and identical replies.
>    - The function stores the enquiry in the website's Firestore `enquiries` collection, which the website admin dashboard reads.
>    - It emails the owner through a free email tier.
> 2. **Fallback:** if the website back end isn't configured yet, the form keeps using Web3Forms, as in stage 1.
> 3. **CRM link, later:** when the user provides the CRM API, the website back end forwards each accepted enquiry to the CRM, where it becomes a lead with source Website (§13.1), and it records the link status.
>
> Field keys, enums, the phone rule and the website's behaviour stay exactly as below. The CRM's own `submitEnquiry` (stage 2 below) becomes the CRM's inbound API for that forward.

**Version 2.1, 25 Oct 2026.** Owner: supervisor session `ambikagroups-3f`. Source: spec v1.4, §13.1.

**What changed from version 1:** Web3Forms' free plan has no webhooks, and the user's rule is that everything stays free. So from CRM Phase 3, the website posts enquiries straight to a CRM function, and Web3Forms is dropped. Until then the website keeps using Web3Forms for email only. The fields, the phone rule and the website's behaviour are unchanged. The webhook token is gone.

**Version 2.1** settles which rejected requests are kept. See "Rejected requests" under CRM behaviour.

This file is the agreement between the website's enquiry form (`Website\`) and the CRM's enquiry endpoint (`CRM\`). Neither side adds, renames or re-types a field, enum value or rule on its own. Send the change to the supervisor, who bumps the version here and tells both workers.

## Flow

**Stage 1, now until the CRM endpoint ships (Phase 3):**
1. A visitor submits the enquiry form on the website.
2. The website validates the input and POSTs JSON to Web3Forms (`https://api.web3forms.com/submit`).
3. Web3Forms emails the owner. The free plan allows 250 submissions a month and has no webhook, so nothing reaches the CRM in this stage.

**Stage 2, from CRM Phase 3:**
1. A visitor submits the enquiry form on the website.
2. The website POSTs the same JSON to the CRM function `submitEnquiry`.
3. The function validates the input, creates or updates the lead, emails the owner using a free email tier, and replies like Web3Forms does (`{ "success": true }`).
4. Web3Forms is removed.

**Switching stages** is a configuration change on the website, not a code change. The endpoint comes from `NEXT_PUBLIC_ENQUIRY_ENDPOINT`: the Web3Forms URL in stage 1, the function URL in stage 2. In stage 2 the website stops sending `access_key`.

## Fields
All values are strings. Optional fields are sent as `""` when empty. The one exception is `botcheck` (see below).

### Shown to the visitor
| Key | Required | Values | Website | CRM |
|---|---|---|---|---|
| `name` | yes | 2–100 characters after trimming | Inline error if too short | Trim; reject if empty |
| `phone` | yes | 10-digit Indian mobile | Apply the phone rule below; submit the 10 digits | Apply the phone rule again; store `+91XXXXXXXXXX` |
| `email` | no | Email address, or `""` | Browser email validation | Store it if it parses; otherwise drop the value and keep the lead |
| `work_type` | yes | `house`, `apartment`, `road`, `interlocking`, `other` | Select or radio buttons. Labels may be translated; the values are always these English keys | Store an unknown value as `other` and keep the raw value in the lead note |
| `location` | yes | Site city or location, up to 120 characters | Free text | Trim; cap the length |
| `size_or_budget` | no | Free text up to 100 characters, e.g. "1,200 sq ft" or "₹25 lakh" | Free text, no enum | Store as text |
| `message` | yes | Up to 2,000 characters | Textarea | Trim; cap the length |
| `consent` | yes | `"yes"` | Checkbox with `value="yes"`. The form can't submit unticked. The label links to the Privacy page | Reject if not `"yes"` |

### Hidden
| Key | Required | Values | Website | CRM |
|---|---|---|---|---|
| `source_url` | yes | Full URL of the page the form was submitted from | `location.href` | Store |
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` | no | The captured value, or `""` | Read from the URL of the visit's first page, keep in `sessionStorage`, send on submit | Store, for the "leads by source" report |
| `form_id` | yes | Kebab-case ID for each form placement, e.g. `contact-page`, `home-cta`, `service-road-works` | One ID per placement; keep the list in the website code | Store |
| `lang` | yes | `en` or `hi` | The page's locale | Use as the lead's preferred language for follow-up messages; default to `en` if missing or unknown |

`lang` is a supervisor addition, not part of §13.1. It lets follow-ups use the spec's English/Hindi message templates (§8.5).

### Delivery fields
| Key | Value | Stage 1 (Web3Forms) | Stage 2 (CRM) |
|---|---|---|---|
| `access_key` | From `NEXT_PUBLIC_WEB3FORMS_KEY`. Public by design | Sent | **Not sent** |
| `subject` | `New website enquiry: <work type label> in <location>` | Email subject | Used as the owner email's subject |
| `from_name` | `Ambika Group Website` | Email sender name | Used as the owner email's sender name |
| `botcheck` | Honeypot: a checkbox hidden from people (not focusable, `aria-hidden`) that no real visitor ticks. Build the JSON from `FormData`, so the key is absent unless a bot ticks the box | Web3Forms discards spam | If present with any value other than `""`, `"false"` or `false`: answer as if accepted, create nothing, and log it to Cloud Logging only |

## Phone rule (identical on both sides)
```ts
function normaliseIndianMobile(input: string): string | null {
  let d = input.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}
```

| Input | Result |
|---|---|
| `98765 43210` | `9876543210` |
| `+91 98765-43210` | `9876543210` |
| `09876543210` | `9876543210` |
| `919876543210` | `9876543210` |
| `0522 2345678` (landline) | invalid |
| `12345` | invalid |

The website's error text is "Enter a 10-digit mobile number." The CRM stores `+91` followed by the 10 digits and de-duplicates on that value.

## Website behaviour (both stages)
- Submit with `fetch(NEXT_PUBLIC_ENQUIRY_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body })`.
- Disable the submit button while sending, so one click sends one enquiry.
- On success (`success: true` in the response), replace the form with an inline thank-you message. Don't redirect.
- On failure (a network error, a non-2xx status, or `success: false`), keep everything the visitor typed and show an inline error that gives the company phone number and WhatsApp link as a fallback.
- Show validation errors inline, as text, next to the field (spec §4A.11).
- The site never contains a secret. Everything in it is public.

## CRM behaviour (stage 2, Phase 3)
- **Endpoint:** a public 2nd-gen HTTPS Cloud Function, `submitEnquiry`, in `asia-south1`.
- **CORS:** allow only the website's origins. The site is on Netlify, so that means its custom domain, its `*.netlify.app` addresses including deploy previews, and localhost for development.
- **No shared secret.** Anything the browser sends is public. Protection comes from the layers below, applied in order and before any Firestore write:
  1. **Size:** reject bodies over 10 KB.
  2. **Rate limit:** about 5 submissions per IP per hour, counted in memory. Run the function with a low `maxInstances` (e.g. 2), so a flood gets turned away cheaply instead of scaling up and costing money.
  3. **Honeypot:** see `botcheck` above.
  4. **Validation:** check every field as in the tables above.

  See "Rejected requests" below for what is kept when a step fails.
- **Same answer every time:** respond identically whether the phone is new or already known, so the endpoint can't be used to find out who has enquired.
- **Responses:**
  - `200 { "success": true }` when accepted (including honeypot hits)
  - `200 { "success": false, "message": "…" }` on validation failure
  - `429` when rate-limited
- **Idempotency:** the log ID is a sha256 hash of the canonical contract fields (decision D-31), so an identical resubmission is a no-op.
- **New phone number:** create a lead with stage New and source Website, plus a follow-up task due within 2 hours (configurable). Assign it to the default sales user or the owner, and send an in-app and push notification with Call and WhatsApp buttons (spec §13.1).
- **Known phone number:** add a note to the existing lead instead of creating a new one.
- **Logging accepted enquiries:** log each one to `lead_webhook_logs` with the payload and the result (`created` or `noted`).
- **Rejected requests:**
  - **Steps 1–3 and CORS** (size, rate limit, honeypot, wrong origin): Cloud Logging only, with the reason and a hash. No form contents and no Firestore write.
  - **Step 4, validation, when the visitor can be contacted** (`consent` is `"yes"` and `phone` passes the phone rule): store it in `lead_webhook_logs` as `rejected`, with the payload and the reason, and show it in the CRM's leads list as "Needs checking". Since Web3Forms no longer emails a copy, this is the only way a real but mistyped enquiry isn't lost.
  - **Step 4, any other validation failure** (no consent, or no usable phone): Cloud Logging only, with the reason. No personal data is kept anywhere.
- **Owner email:** send one email per accepted enquiry, through a free email tier.

## Spam
Launch with the honeypot, the rate limit and the low instance cap. Add a free CAPTCHA (Cloudflare Turnstile, or hCaptcha's free tier) only if spam gets through; doing so is a contract change.

## Open items
- **Privacy page:** in stage 1 it names Web3Forms as the service that handles enquiries. When stage 2 starts, the website worker changes this to the CRM on Google Cloud (Firebase), in the same release as the endpoint switch.
- **Consent and privacy wording:** the consent label and the Privacy page text are placeholders for the user, or their advocate, to approve.
