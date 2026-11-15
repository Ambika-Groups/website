// Website back end (contract v3): its own Firebase project, separate from the CRM's, inside the free tier.
//
// submitEnquiry  public HTTPS endpoint the enquiry form posts to. Same JSON as before; same protections as the
//                contract's "CRM behaviour": CORS, 10 KB cap, rate limit, low maxInstances, honeypot, validation,
//                logging and identical replies. Stores accepted enquiries in `enquiries`, emails the owner, and
//                forwards to the CRM once its API is configured.
// publishSite    callable, admin only: triggers the Netlify build hook (its URL is a secret here, never in the
//                browser) and records the publish, so the dashboard can count Netlify credits.
//
// Setup and secrets: see DEPLOY.md, "Website back end".
import { createHash } from "node:crypto";
import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import { HttpsError, onCall, onRequest } from "firebase-functions/v2/https";
import { defineSecret, defineString } from "firebase-functions/params";
import { logger } from "firebase-functions";
import { forwardToCrm } from "./src/crm.js";
import { sendOwnerEmail } from "./src/email.js";
import {
  MAX_BODY_BYTES,
  canonicalString,
  createRateLimiter,
  isAllowedOrigin,
  isHoneypotHit,
  sourceLabel,
  sourcePath,
  validateEnquiry,
} from "./src/validation.js";

initializeApp();
const db = getFirestore();

// asia-south1 (Mumbai), like the CRM. A low maxInstances turns a flood away cheaply instead of scaling up.
setGlobalOptions({ region: "asia-south1", maxInstances: 2, memory: "256MiB" });

// Comma-separated site origins, e.g. "https://www.ambikagroup.in,https://ambikagroup.in". *.netlify.app and
// localhost are always allowed (contract).
const SITE_ORIGINS = defineString("SITE_ORIGINS", { default: "" });
const OWNER_EMAIL = defineString("OWNER_EMAIL", { default: "" });
const EMAIL_FROM = defineString("EMAIL_FROM", { default: "Ambika Group Website <onboarding@resend.dev>" });
// Secrets (Secret Manager). Set to "none" until there is a real value; the code then skips that step.
const RESEND_API_KEY = defineSecret("RESEND_API_KEY");
const NETLIFY_BUILD_HOOK = defineSecret("NETLIFY_BUILD_HOOK");

const allow = createRateLimiter({ limit: 5, windowMs: 60 * 60 * 1000 });
const hashOf = (s) => createHash("sha256").update(s).digest("hex");
const configured = (v) => !!v && v !== "none";

export const submitEnquiry = onRequest({ secrets: [RESEND_API_KEY], cors: false }, async (req, res) => {
  const origin = req.get("origin") ?? "";
  const origins = SITE_ORIGINS.value().split(",").map((s) => s.trim()).filter(Boolean);
  if (!isAllowedOrigin(origin, origins)) {
    logger.warn("enquiry rejected: origin", { origin: origin.slice(0, 100) });
    res.status(403).json({ success: false, message: "Forbidden" });
    return;
  }
  res.set("Access-Control-Allow-Origin", origin);
  res.set("Vary", "Origin");
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type, Accept");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ success: false, message: "Method not allowed" });
    return;
  }

  // 1. Size.
  const size = req.rawBody?.length ?? 0;
  if (size > MAX_BODY_BYTES) {
    logger.warn("enquiry rejected: size", { size });
    res.status(413).json({ success: false, message: "Too large" });
    return;
  }
  // 2. Rate limit (per instance, per IP).
  const ipHash = hashOf(req.ip ?? "unknown").slice(0, 16);
  if (!allow(ipHash)) {
    logger.warn("enquiry rejected: rate limit", { ip: ipHash });
    res.status(429).json({ success: false, message: "Too many requests" });
    return;
  }
  const body = req.body;
  // 3. Honeypot: answer as if accepted, store nothing.
  if (isHoneypotHit(body)) {
    logger.info("enquiry dropped: honeypot", { ip: ipHash });
    res.status(200).json({ success: true });
    return;
  }
  // 4. Validation.
  const result = validateEnquiry(body);
  if (!result.ok) {
    logger.info("enquiry rejected: validation", { reasons: result.reasons, contactable: result.contactable });
    // A real but mistyped enquiry from someone who can be called back is kept for checking (contract 2.1).
    if (result.contactable) {
      await db.collection("enquiries").add({
        ...result.enquiry,
        status: "new",
        needsChecking: true,
        rejectReasons: result.reasons,
        notes: [],
        createdAt: FieldValue.serverTimestamp(),
        firstContactAt: null,
        sourcePath: sourcePath(result.enquiry.source_url),
        source: sourceLabel(result.enquiry),
        crm: { status: "not_sent" },
      });
    }
    res.status(200).json({ success: false, message: "Please check the form and try again." });
    return;
  }

  const enquiry = result.enquiry;
  // Idempotency (D-31): an identical resubmission maps to the same document and is a no-op.
  const ref = db.collection("enquiries").doc(hashOf(canonicalString(enquiry)).slice(0, 40));
  try {
    await ref.create({
      ...enquiry,
      status: "new",
      needsChecking: false,
      notes: [],
      createdAt: FieldValue.serverTimestamp(),
      firstContactAt: null,
      sourcePath: sourcePath(enquiry.source_url),
      source: sourceLabel(enquiry),
      email: { status: "pending" },
      crm: { status: "pending" },
    });
  } catch (err) {
    if (err?.code === 6 /* ALREADY_EXISTS */) {
      res.status(200).json({ success: true });
      return;
    }
    logger.error("enquiry store failed", { message: err?.message });
    res.status(500).json({ success: false, message: "Could not save" });
    return;
  }

  // Email and CRM run after the enquiry is safe in Firestore; their failures never fail the visitor's request.
  const key = RESEND_API_KEY.value();
  const emailStatus = configured(key) && OWNER_EMAIL.value()
    ? await sendOwnerEmail({ apiKey: key, to: OWNER_EMAIL.value(), from: EMAIL_FROM.value(), enquiry }).catch((e) => `failed: ${e.message}`)
    : "not_configured";
  const crmDoc = await db.doc("private/crm").get();
  const crmStatus = await forwardToCrm(crmDoc.exists ? crmDoc.data() : null, enquiry).catch((e) => `failed: ${e.message}`);
  await ref.update({ "email.status": emailStatus.slice(0, 200), "crm.status": crmStatus.slice(0, 200), "crm.at": FieldValue.serverTimestamp() });

  res.status(200).json({ success: true });
});

async function requireAdmin(auth) {
  if (!auth) throw new HttpsError("unauthenticated", "Sign in first.");
  const doc = await db.doc(`admins/${auth.uid}`).get();
  if (!doc.exists) throw new HttpsError("permission-denied", "Not an admin.");
}

// Each production deploy costs 15 of the 300 monthly Netlify credits (DEPLOY.md). Publishes are logged so the
// dashboard can count them; two publishes within 2 minutes are refused, so a double click never costs twice.
export const publishSite = onCall({ secrets: [NETLIFY_BUILD_HOOK] }, async (request) => {
  await requireAdmin(request.auth);
  const hook = NETLIFY_BUILD_HOOK.value();
  if (!configured(hook)) throw new HttpsError("failed-precondition", "The Netlify build hook is not set up yet (DEPLOY.md).");
  const last = await db.collection("publishes").orderBy("at", "desc").limit(1).get();
  const lastAt = last.empty ? 0 : last.docs[0].get("at")?.toMillis?.() ?? 0;
  if (Date.now() - lastAt < 2 * 60 * 1000) throw new HttpsError("resource-exhausted", "A publish started less than 2 minutes ago.");

  const response = await fetch(hook, { method: "POST", body: "{}", headers: { "Content-Type": "application/json" } }).catch((e) => ({ ok: false, status: 0, statusText: e.message }));
  const entry = {
    at: FieldValue.serverTimestamp(),
    by: request.auth.token.email ?? request.auth.uid,
    status: response.ok ? "triggered" : "failed",
    http: response.status,
    credits: response.ok ? 15 : 0,
  };
  await db.collection("publishes").add(entry);
  if (response.ok) await db.doc("settings/publishState").set({ dirty: false, changes: 0, lastPublishAt: FieldValue.serverTimestamp() }, { merge: true });
  if (!response.ok) throw new HttpsError("unavailable", `Netlify did not accept the build (${response.status}).`);
  return { ok: true };
});
