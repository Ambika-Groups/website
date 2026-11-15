import assert from "node:assert/strict";
import { test } from "node:test";
import { launchAnswers, type LaunchAnswers } from "../config/launch-answers.ts";
import { questions } from "../../scripts/launch-questions.mjs";
import { answersToProjects, answersToSettings, filledAnswerNumbers, hasContent, merge, youtubeId } from "./answers.ts";

const blank = (): LaunchAnswers => JSON.parse(JSON.stringify(launchAnswers), (_k, v) => (typeof v === "string" ? "" : typeof v === "boolean" ? false : v)) as LaunchAnswers;
const emptyAnswers = (): LaunchAnswers => {
  const a = blank();
  for (const k of Object.keys(a) as (keyof LaunchAnswers)[]) if (Array.isArray(a[k])) (a[k] as unknown[]) = [];
  a.q33_trusted = { clients: [], certificates: [] };
  return a;
};

test("every answerable question has an entry named after its number, and nothing else is in the file", () => {
  const keys = Object.keys(launchAnswers);
  const expected = questions.flatMap((q) => (q.answerKey ? [q.answerKey] : []));
  questions.forEach((q, i) => {
    if (q.answerKey) assert.ok(q.answerKey.startsWith(`q${i + 1}_`), `${q.key}: answerKey ${q.answerKey} does not start with q${i + 1}_ (renumbered?)`);
  });
  assert.deepEqual([...keys].sort(), [...expected].sort());
});

test("the questions that are not in the file are the ones answered elsewhere (env, files, admin, translation)", () => {
  const elsewhere = questions.filter((q) => !q.answerKey).map((q) => q.key);
  assert.deepEqual(elsewhere.sort(), ["backend", "blog", "enquiryDelivery", "hindi", "logo", "ogImage", "ownerEmail", "photos"]);
});

test("the file holds no secret: no key-like, token-like or private-link values, and no secret-sounding names", () => {
  const strings: string[] = [];
  (function walk(v: unknown, path: string) {
    if (typeof v === "string") strings.push(`${path}=${v}`);
    else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`));
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, `${path}.${k}`);
  })(launchAnswers, "");
  for (const s of strings) for (const re of secretPatterns) assert.ok(!re.test(s), `${s.slice(0, 40)}… looks like a secret (${re})`);
  for (const k of Object.keys(launchAnswers)) assert.ok(!/(key|token|secret|password)/i.test(k.replace(/^q\d+_/, "")), `${k}: secret-sounding name`);
});

test("the secret patterns do catch typical secrets (so the check above means something)", () => {
  const samples = [
    "a1b2c3d4-e5f6-4789-8abc-0123456789ab", // Web3Forms-style access key
    "AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q",
    "re_AbCdEf1234567890XyZ",
    "https://api.netlify.com/hooks.netlify.com/build_hooks/abc",
    "-----BEGIN PRIVATE KEY-----",
    "ZmFrZXRva2VuZmFrZXRva2VuZmFrZXRva2VuMTIzNDU2",
    "my password is hunter2",
    "Bearer abc",
  ];
  for (const sample of samples) assert.ok(secretPatterns.some((re) => re.test(sample)), `not caught: ${sample}`);
  for (const fine of ["+91 98765 43210", "https://maps.app.goo.gl/AbCdEf123", "Mon–Sat, 10:00–18:00", "Houses, roads and paved ground, built to specification."]) {
    assert.ok(!secretPatterns.some((re) => re.test(fine)), `false alarm: ${fine}`);
  }
});

const secretPatterns = [
    /AIza[0-9A-Za-z_-]{20,}/, // Google API key
    /\bre_[A-Za-z0-9]{16,}/, // Resend key
    /hooks\.netlify\.com/, // Netlify build hook
    /BEGIN [A-Z ]*PRIVATE KEY/,
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i, // a UUID-style access key (Web3Forms)
    /(?<![\w/.:-])[A-Za-z0-9_-]{32,}(?![\w/.:-])/, // a long unbroken token
    /\b(password|passwd|secret|api[_ -]?key|access[_ -]?key|bearer)\b/i,
];

test("hasContent: text, lists, objects and true count; blanks, empty lists and false do not", () => {
  assert.equal(hasContent(""), false);
  assert.equal(hasContent("  "), false);
  assert.equal(hasContent("a"), true);
  assert.equal(hasContent(false), false);
  assert.equal(hasContent(true), true);
  assert.equal(hasContent([]), false);
  assert.equal(hasContent([{ value: "", label: "" }]), false);
  assert.equal(hasContent([{ value: "1", label: "" }]), true);
  assert.equal(hasContent({ a: "", b: [] }), false);
});

test("priority: the admin overrides the file, the file overrides the defaults, a blank admin value never wipes a file answer", () => {
  const file = { contact: { phoneDisplay: "FILE phone", email: "file@x.in", hours: "" }, wording: { copyApproved: true }, numbers: { show: true, items: [{ value: "9", label: "years" }] } };
  const admin = {
    contact: { phoneDisplay: "ADMIN phone", email: "", hours: "ADMIN hours" },
    wording: { copyApproved: false },
    numbers: { show: false, items: [{ value: "", label: "" }, { value: "", label: "" }] },
  };
  const m = merge(file, admin);
  assert.equal(m.contact.phoneDisplay, "ADMIN phone", "admin wins");
  assert.equal(m.contact.email, "file@x.in", "a blank admin value keeps the file's");
  assert.equal(m.contact.hours, "ADMIN hours", "admin fills what the file left empty");
  assert.equal(m.wording.copyApproved, true, "switched off in the admin does not undo a file approval");
  assert.deepEqual(m.numbers.items, [{ value: "9", label: "years" }], "blank admin list rows do not replace the file's list");
  // nothing from either: the field is empty, so the site's built-in default applies
  const none = merge({ contact: { phoneDisplay: "" } }, {} as { contact: { phoneDisplay: string } });
  assert.equal(none.contact.phoneDisplay, "");
});

test("an empty file maps to settings with no content, so the defaults apply", () => {
  const s = answersToSettings(emptyAnswers());
  assert.equal(hasContent(s), false);
  assert.deepEqual(answersToProjects(emptyAnswers()), []);
  assert.deepEqual(filledAnswerNumbers(emptyAnswers()), []);
});

test("answers map to the admin's settings shape", () => {
  const a = emptyAnswers();
  a.q5_phone = { display: " +91 98765 43210 ", dialling: "+919876543210" };
  a.q8_address = { line: "12 Station Road", city: "Lucknow", state: "UP", pin: "226001" };
  a.q9_contactCopyApproved = a.q13_servicesCopyApproved = a.q14_governmentCopyApproved = a.q15_homeCopyApproved = true;
  a.q21_videoId = "https://www.youtube.com/watch?v=AbCdEfGhIjK";
  a.q26_registrations = [{ label: "Class", value: "A" }, { label: "", value: "ignored" }];
  a.q32_numbers = [{ value: "15+", label: "Years" }];
  a.q33_trusted = { clients: ["Nagar Nigam"], certificates: [] };
  const s = answersToSettings(a);
  assert.equal(s.contact?.phoneDisplay, "+91 98765 43210", "trimmed");
  assert.equal(s.contact?.street, "12 Station Road");
  assert.equal(s.wording?.copyApproved, false, "all five approvals are needed for the single admin flag (Q16 missing)");
  a.q16_consentCopyApproved = true;
  assert.equal(answersToSettings(a).wording?.copyApproved, true);
  assert.equal(s.videoId, "AbCdEfGhIjK");
  assert.deepEqual(s.government?.registrations, [{ label: "Class", value: "A" }]);
  assert.equal(s.numbers?.show, true);
  assert.equal(s.trust?.show, true);
  assert.deepEqual(filledAnswerNumbers(a).sort((x, y) => x - y), [5, 8, 9, 13, 14, 15, 16, 21, 26, 32, 33]);
});

test("projects typed in the file become published-project shaped records, in order", () => {
  const a = emptyAnswers();
  a.q28_projects = [
    { slug: "colony-road", title: "Colony road", service: "roadWorks", location: "Barabanki", year: "2025", clientType: "", status: "completed", summary: "About 800 m.", scope: ["CC road", ""], photos: 3 },
    { slug: "", title: "No slug", service: "construction", location: "", year: "", clientType: "", status: "ongoing", summary: "", scope: [], photos: 0 },
  ];
  const p = answersToProjects(a);
  assert.equal(p.length, 1, "an entry without a slug is ignored");
  assert.equal(p[0].slug, "colony-road");
  assert.deepEqual(p[0].scope, ["CC road"]);
  assert.equal(p[0].photoAlts.length, 3);
  assert.equal(p[0].order, 1);
});

test("youtubeId accepts links and ids, rejects anything else", () => {
  assert.equal(youtubeId("AbCdEfGhIjK"), "AbCdEfGhIjK");
  assert.equal(youtubeId("https://youtu.be/AbCdEfGhIjK?t=5"), "AbCdEfGhIjK");
  assert.equal(youtubeId("https://www.youtube.com/embed/AbCdEfGhIjK"), "AbCdEfGhIjK");
  assert.equal(youtubeId("not a video"), "");
  assert.equal(youtubeId(""), "");
});
