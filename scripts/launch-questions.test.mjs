// Keeps the launch question list, LAUNCH-QUESTIONS.md and the launch check in step. Run with `npm test`.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { questions } from "./launch-questions.mjs";

const md = readFileSync(new URL("../LAUNCH-QUESTIONS.md", import.meta.url), "utf8");
const check = readFileSync(new URL("./launch-check.mjs", import.meta.url), "utf8");

test("every question is complete and keys are unique", () => {
  const keys = new Set();
  for (const q of questions) {
    for (const f of ["key", "tier", "page", "question", "example", "ifSkipped", "where"]) assert.ok(q[f], `${q.key}: missing ${f}`);
    assert.ok(["must", "nice"].includes(q.tier), `${q.key}: tier`);
    assert.ok(!keys.has(q.key), `duplicate key ${q.key}`);
    keys.add(q.key);
    if (q.tier === "nice") assert.equal(q.skip, true, `${q.key}: nice-to-have questions are marked safe to skip`);
  }
});

test("must-have questions come first", () => {
  const firstNice = questions.findIndex((q) => q.tier === "nice");
  assert.ok(firstNice > 0);
  assert.ok(questions.slice(firstNice).every((q) => q.tier === "nice"), "a must-have appears after a nice-to-have");
});

test("LAUNCH-QUESTIONS.md lists every question with its number (run npm run launch-questions to refresh)", () => {
  questions.forEach((q, i) => {
    assert.ok(md.includes(`#### Q${i + 1}. ${q.question}`), `Q${i + 1} (${q.key}) is missing or changed in LAUNCH-QUESTIONS.md`);
    assert.ok(md.includes(`<!-- q:${q.key} -->`), `${q.key} marker missing`);
  });
  assert.equal((md.match(/#### Q\d+\./g) ?? []).length, questions.length, "the file has questions the list does not");
});

test("launch-check has a check for every question", () => {
  for (const q of questions) assert.ok(new RegExp(`\\n  ${q.key}(\\(|:|\\s*=)`).test(check), `no check for ${q.key} in launch-check.mjs`);
});
