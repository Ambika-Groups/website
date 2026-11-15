// Run: cd functions && npm test (no emulator, no Java, no Firebase packages needed).
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  canonicalString,
  createRateLimiter,
  isAllowedOrigin,
  isHoneypotHit,
  normaliseIndianMobile,
  sourcePath,
  validateEnquiry,
} from "./validation.js";

const good = {
  name: "Ravi Kumar",
  phone: "98765 43210",
  email: "ravi@example.com",
  work_type: "house",
  location: "Lucknow",
  size_or_budget: "1,200 sq ft",
  message: "G+1 house on a 30x40 plot.",
  consent: "yes",
  source_url: "https://www.example.com/contact?utm_source=meta",
  utm_source: "meta",
  utm_medium: "paid",
  utm_campaign: "launch",
  utm_term: "",
  utm_content: "",
  form_id: "contact-page",
  lang: "en",
  subject: "New website enquiry: House in Lucknow",
};

test("phone rule matches the contract table", () => {
  assert.equal(normaliseIndianMobile("98765 43210"), "9876543210");
  assert.equal(normaliseIndianMobile("+91 98765-43210"), "9876543210");
  assert.equal(normaliseIndianMobile("09876543210"), "9876543210");
  assert.equal(normaliseIndianMobile("919876543210"), "9876543210");
  assert.equal(normaliseIndianMobile("0522 2345678"), null);
  assert.equal(normaliseIndianMobile("12345"), null);
  assert.equal(normaliseIndianMobile(undefined), null);
});

test("a valid enquiry passes and is normalised", () => {
  const r = validateEnquiry(good);
  assert.equal(r.ok, true);
  assert.equal(r.enquiry.phone, "+919876543210");
  assert.equal(r.enquiry.utm_source, "meta");
  assert.equal(r.enquiry.lang, "en");
});

test("each required field is checked", () => {
  for (const [key, value, reason] of [
    ["name", "R", "name"],
    ["name", "x".repeat(101), "name"],
    ["phone", "12345", "phone"],
    ["work_type", "castle", "work_type"],
    ["location", "", "location"],
    ["location", "x".repeat(121), "location"],
    ["size_or_budget", "x".repeat(101), "size_or_budget"],
    ["message", "", "message"],
    ["message", "x".repeat(2001), "message"],
    ["consent", "no", "consent"],
    ["form_id", "Contact Page", "form_id"],
    ["source_url", "javascript:alert(1)", "source_url"],
  ]) {
    const r = validateEnquiry({ ...good, [key]: value });
    assert.equal(r.ok, false, `${key}=${String(value).slice(0, 10)}`);
    assert.ok(r.reasons.includes(reason), `${key} → ${r.reasons}`);
  }
});

test("a bad email is dropped, not rejected (contract)", () => {
  const r = validateEnquiry({ ...good, email: "not-an-email" });
  assert.equal(r.ok, true);
  assert.equal(r.enquiry.email, "");
});

test("unknown lang falls back to en", () => {
  assert.equal(validateEnquiry({ ...good, lang: "fr" }).enquiry.lang, "en");
  assert.equal(validateEnquiry({ ...good, lang: "hi" }).enquiry.lang, "hi");
});

test("rejected but contactable only with consent and a usable phone", () => {
  assert.equal(validateEnquiry({ ...good, message: "" }).contactable, true);
  assert.equal(validateEnquiry({ ...good, message: "", consent: "" }).contactable, false);
  assert.equal(validateEnquiry({ ...good, message: "", phone: "1" }).contactable, false);
});

test("non-object bodies are rejected", () => {
  assert.equal(validateEnquiry(null).ok, false);
  assert.equal(validateEnquiry([]).ok, false);
  assert.equal(validateEnquiry("x").ok, false);
});

test("honeypot", () => {
  assert.equal(isHoneypotHit(good), false);
  assert.equal(isHoneypotHit({ ...good, botcheck: "" }), false);
  assert.equal(isHoneypotHit({ ...good, botcheck: "false" }), false);
  assert.equal(isHoneypotHit({ ...good, botcheck: false }), false);
  assert.equal(isHoneypotHit({ ...good, botcheck: "on" }), true);
  assert.equal(isHoneypotHit({ ...good, botcheck: true }), true);
});

test("rate limit: 5 per hour per key, then a fresh window", () => {
  let t = 0;
  const allow = createRateLimiter({ limit: 5, windowMs: 1000, now: () => t });
  for (let i = 0; i < 5; i++) assert.equal(allow("ip"), true);
  assert.equal(allow("ip"), false);
  assert.equal(allow("other"), true);
  t = 1000;
  assert.equal(allow("ip"), true);
});

test("allowed origins", () => {
  const site = ["https://www.ambikagroup.in"];
  assert.equal(isAllowedOrigin("https://www.ambikagroup.in", site), true);
  assert.equal(isAllowedOrigin("https://deploy-preview-3--ambika.netlify.app", site), true);
  assert.equal(isAllowedOrigin("http://localhost:3000", site), true);
  assert.equal(isAllowedOrigin("http://ambika.netlify.app", site), false);
  assert.equal(isAllowedOrigin("https://evil.example", site), false);
  assert.equal(isAllowedOrigin("https://netlify.app.evil.example", site), false);
  assert.equal(isAllowedOrigin("", site), false);
});

test("source path and idempotency key", () => {
  assert.equal(sourcePath("https://www.example.com/services/road-works/?x=1"), "/services/road-works");
  assert.equal(sourcePath("https://www.example.com/"), "/");
  const a = validateEnquiry(good).enquiry;
  const b = validateEnquiry({ ...good, utm_source: "google" }).enquiry;
  assert.equal(canonicalString(a), canonicalString(b), "UTM does not change the identity of an enquiry");
  assert.notEqual(canonicalString(a), canonicalString(validateEnquiry({ ...good, message: "Different" }).enquiry));
});
