// Forward to the CRM (contract v3, step 3), once the user provides the CRM API. The base URL and key live in the
// Firestore doc `private/crm`, which no browser can read (firestore.rules); the admin can only overwrite them.
// The CRM's own submitEnquiry (contract stage 2) is its inbound API: same JSON, so the forward sends the fields as is.
const FIELDS = ["name", "phone", "email", "work_type", "location", "size_or_budget", "message", "consent", "source_url", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "form_id", "lang", "subject"];

export async function forwardToCrm(config, enquiry, fetchImpl = fetch) {
  if (!config?.baseUrl || !config?.apiKey) return "not_configured";
  const payload = Object.fromEntries(FIELDS.map((k) => [k, enquiry[k] ?? ""]));
  payload.phone = payload.phone.replace(/^\+91/, ""); // the contract sends the 10 digits
  payload.from_name = "Ambika Group Website";
  const res = await fetchImpl(`${config.baseUrl.replace(/\/$/, "")}/submitEnquiry`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${config.apiKey}` },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => null);
  return res.ok && body?.success === true ? "sent" : `failed: HTTP ${res.status}`;
}

// TODO(crm): when the CRM API exists, add `syncCrmProjects` (scheduled or callable) that reads projects and their
// completion status from the CRM into `projects`, setting crmId / crmLinked and never touching showOnWebsite.
