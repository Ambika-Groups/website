// CSV export for the enquiries inbox. Quotes every cell, doubles inner quotes, and defuses spreadsheet formulas
// (a cell starting with = + - @ or a tab/carriage return gets a leading apostrophe), since enquiry text comes from
// the public form.
export function csvCell(value: unknown): string {
  let s = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function toCsv(headers: string[], rows: unknown[][]): string {
  // UTF-8 BOM so Excel shows ₹ and Hindi text correctly; CRLF line ends.
  return "﻿" + [headers, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
}
