import assert from "node:assert/strict";
import { test } from "node:test";
import { forwardToCrm } from "./crm.js";
import { ownerEmail, sendOwnerEmail } from "./email.js";

const enquiry = {
  name: "Ravi <b>Kumar</b>",
  phone: "+919876543210",
  email: "",
  work_type: "road",
  location: "Lucknow",
  size_or_budget: "",
  message: "1 km CC road",
  consent: "yes",
  source_url: "https://www.example.com/contact",
  utm_source: "meta",
  utm_medium: "",
  utm_campaign: "",
  utm_term: "",
  utm_content: "",
  form_id: "contact-page",
  lang: "en",
  subject: "",
};

test("owner email escapes HTML and carries call/WhatsApp links", () => {
  const m = ownerEmail(enquiry);
  assert.equal(m.subject, "New website enquiry: Road in Lucknow");
  assert.ok(m.html.includes("Ravi &lt;b&gt;Kumar&lt;/b&gt;"));
  assert.ok(m.html.includes("https://wa.me/919876543210"));
});

test("sendOwnerEmail reports sent / failed", async () => {
  let sent;
  const ok = await sendOwnerEmail({ apiKey: "k", to: "a@x.in, b@x.in", from: "f", enquiry, fetchImpl: async (u, o) => ((sent = JSON.parse(o.body)), { ok: true }) });
  assert.equal(ok, "sent");
  assert.deepEqual(sent.to, ["a@x.in", "b@x.in"]);
  assert.equal(await sendOwnerEmail({ apiKey: "k", to: "a", from: "f", enquiry, fetchImpl: async () => ({ ok: false, status: 422 }) }), "failed: HTTP 422");
});

test("CRM forward: not configured, sent, failed", async () => {
  assert.equal(await forwardToCrm(null, enquiry), "not_configured");
  assert.equal(await forwardToCrm({ baseUrl: "https://crm.example" }, enquiry), "not_configured");
  let call;
  const sent = await forwardToCrm({ baseUrl: "https://crm.example/", apiKey: "s" }, enquiry, async (u, o) => ((call = { u, body: JSON.parse(o.body) }), { ok: true, json: async () => ({ success: true }) }));
  assert.equal(sent, "sent");
  assert.equal(call.u, "https://crm.example/submitEnquiry");
  assert.equal(call.body.phone, "9876543210", "the contract sends the 10 digits");
  assert.equal(await forwardToCrm({ baseUrl: "https://crm.example", apiKey: "s" }, enquiry, async () => ({ ok: true, json: async () => ({ success: false }) })), "failed: HTTP undefined");
});
