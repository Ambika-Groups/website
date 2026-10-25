import { test } from "node:test";
import assert from "node:assert/strict";
import { normaliseIndianMobile } from "./phone.ts";

// The table from docs/shared/enquiry-form-contract.md, "Phone rule".
const cases: [string, string | null][] = [
  ["98765 43210", "9876543210"],
  ["+91 98765-43210", "9876543210"],
  ["09876543210", "9876543210"],
  ["919876543210", "9876543210"],
  ["0522 2345678", null],
  ["12345", null],
];

for (const [input, expected] of cases) {
  test(`normaliseIndianMobile(${JSON.stringify(input)})`, () => {
    assert.equal(normaliseIndianMobile(input), expected);
  });
}
