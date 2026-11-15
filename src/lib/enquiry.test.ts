import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPayload, isEnquirySuccess, readFields, validateEnquiry } from "./enquiry.ts";
import { isWeb3Forms, WEB3FORMS_ENDPOINT } from "../config/forms.ts";
import { captureUtm, readUtm } from "./utm.ts";

const valid = {
  name: "  Ramesh Kumar ",
  phone: "+91 98765-43210",
  email: "ramesh@example.com",
  work_type: "house",
  location: "Gomti Nagar, Lucknow",
  size_or_budget: "1,200 sq ft",
  message: "Need a G+1 house built on our plot.",
  consent: "yes",
};

const ctx = {
  accessKey: "TEST_KEY",
  formId: "contact-page",
  lang: "en" as const,
  sourceUrl: "https://www.example.com/contact?utm_source=google",
  utm: { utm_source: "google", utm_medium: "cpc", utm_campaign: "", utm_term: "", utm_content: "" },
  workTypeLabel: "House construction",
};

test("a service without its own work type is sent as 'other' with its name in the subject and the message", () => {
  const raw = readFields(Object.entries({ ...valid, work_type: "other" }));
  assert.deepEqual(validateEnquiry(raw, true), {});
  const payload = buildPayload(raw, { ...ctx, workTypeLabel: "Something else", serviceLabel: "Plumbing and sewage" });
  assert.equal(payload.work_type, "other");
  assert.equal(payload.subject, "New website enquiry: Plumbing and sewage in Gomti Nagar, Lucknow");
  assert.ok(payload.message.startsWith("Service: Plumbing and sewage\n"));
  assert.ok(payload.message.endsWith(valid.message));
  // a message at the 2,000-character limit is never pushed over it
  const long = readFields(Object.entries({ ...valid, work_type: "other", message: "x".repeat(2000) }));
  assert.equal(buildPayload(long, { ...ctx, serviceLabel: "Plumbing and sewage" }).message.length, 2000);
});

test("valid entry has no errors and builds the contract payload", () => {
  const raw = readFields(Object.entries(valid));
  assert.deepEqual(validateEnquiry(raw, true), {});
  const payload = buildPayload(raw, ctx);
  assert.equal(payload.name, "Ramesh Kumar");
  assert.equal(payload.phone, "9876543210");
  assert.equal(payload.subject, "New website enquiry: House construction in Gomti Nagar, Lucknow");
  assert.equal(payload.from_name, "Ambika Group Website");
  assert.equal(payload.form_id, "contact-page");
  assert.equal(payload.lang, "en");
  assert.ok(!("botcheck" in payload), "botcheck absent unless ticked");
  for (const value of Object.values(payload)) assert.equal(typeof value, "string");
});

test("optional fields are sent as empty strings", () => {
  const raw = readFields(Object.entries({ ...valid, email: "", size_or_budget: "" }));
  const payload = buildPayload(raw, ctx);
  assert.equal(payload.email, "");
  assert.equal(payload.size_or_budget, "");
});

test("ticked honeypot is passed through", () => {
  const raw = readFields(Object.entries({ ...valid, botcheck: "on" }));
  assert.equal(buildPayload(raw, ctx).botcheck, "on");
});

test("each rule reports its error", () => {
  const raw = readFields(
    Object.entries({
      name: "R",
      phone: "0522 2345678",
      email: "not-an-email",
      work_type: "villa",
      location: "",
      size_or_budget: "x".repeat(101),
      message: "",
    }),
  );
  assert.deepEqual(validateEnquiry(raw, false), {
    name: "nameLength",
    phone: "phoneInvalid",
    email: "emailInvalid",
    work_type: "workTypeRequired",
    location: "locationRequired",
    size_or_budget: "sizeTooLong",
    message: "messageRequired",
    consent: "consentRequired",
  });
});

test("length caps", () => {
  const raw = readFields(
    Object.entries({ ...valid, name: "x".repeat(101), location: "x".repeat(121), message: "x".repeat(2001) }),
  );
  assert.deepEqual(validateEnquiry(raw, true), {
    name: "nameLength",
    location: "locationTooLong",
    message: "messageTooLong",
  });
});

test("contract v2: access_key only when a key is given (Web3Forms stage)", () => {
  const raw = readFields(Object.entries(valid));
  assert.equal(buildPayload(raw, ctx).access_key, "TEST_KEY");
  const crm = buildPayload(raw, { ...ctx, accessKey: undefined });
  assert.ok(!("access_key" in crm), "no access_key for the CRM endpoint");
  assert.equal(crm.phone, "9876543210");
});

test("contract v2: endpoint detection", () => {
  assert.equal(isWeb3Forms(WEB3FORMS_ENDPOINT), true);
  assert.equal(isWeb3Forms("https://asia-south1-demo.cloudfunctions.net/submitEnquiry"), false);
  assert.equal(isWeb3Forms("not a url"), false);
});

test("contract v2: success needs 2xx and success:true", () => {
  assert.equal(isEnquirySuccess(true, { success: true }), true);
  assert.equal(isEnquirySuccess(true, { success: false, message: "x" }), false);
  assert.equal(isEnquirySuccess(false, { success: true }), false, "non-2xx is a failure");
  assert.equal(isEnquirySuccess(false, null), false, "429 with no JSON");
  assert.equal(isEnquirySuccess(true, null), false);
});

test("UTM values come from the first page only", () => {
  const store = new Map<string, string>();
  const storage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
  } as Storage;
  captureUtm("?utm_source=facebook&utm_campaign=diwali", storage);
  captureUtm("?utm_source=google", storage);
  assert.deepEqual(readUtm(storage), {
    utm_source: "facebook",
    utm_medium: "",
    utm_campaign: "diwali",
    utm_term: "",
    utm_content: "",
  });
  assert.equal(readUtm(undefined).utm_source, "");
});
