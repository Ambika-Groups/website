// Owner email through Resend's free tier (REST API, no SDK). Returns a short status string for the enquiry doc.
const WORK_LABELS = { house: "House", apartment: "Apartment", road: "Road", interlocking: "Interlocking / paver", other: "Other" };

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export function ownerEmail(enquiry) {
  const subject = enquiry.subject || `New website enquiry: ${WORK_LABELS[enquiry.work_type] ?? "Other"} in ${enquiry.location}`;
  const rows = [
    ["Name", enquiry.name],
    ["Phone", enquiry.phone],
    ["Email", enquiry.email || "—"],
    ["Work", WORK_LABELS[enquiry.work_type] ?? enquiry.work_type],
    ["Location", enquiry.location],
    ["Size or budget", enquiry.size_or_budget || "—"],
    ["Message", enquiry.message],
    ["Page", enquiry.source_url],
    ["Form", enquiry.form_id],
    ["Source", [enquiry.utm_source, enquiry.utm_medium, enquiry.utm_campaign].filter(Boolean).join(" / ") || "direct"],
  ];
  const wa = `https://wa.me/${enquiry.phone.replace(/\D/g, "")}`;
  const html = `<table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${rows
    .map(([k, v]) => `<tr><td style="color:#6b5e57;vertical-align:top">${esc(k)}</td><td style="white-space:pre-wrap">${esc(v)}</td></tr>`)
    .join("")}</table><p style="font-family:Arial,sans-serif"><a href="tel:${esc(enquiry.phone)}">Call</a> · <a href="${esc(wa)}">WhatsApp</a></p>`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  return { subject, html, text };
}

export async function sendOwnerEmail({ apiKey, to, from, enquiry, fetchImpl = fetch }) {
  const { subject, html, text } = ownerEmail(enquiry);
  const res = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: to.split(",").map((s) => s.trim()), subject, html, text, reply_to: enquiry.email || undefined }),
  });
  return res.ok ? "sent" : `failed: HTTP ${res.status}`;
}
