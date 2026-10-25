// Copied verbatim from docs/shared/enquiry-form-contract.md ("Phone rule"). The CRM runs the
// identical function; change it only through a contract version bump.
export function normaliseIndianMobile(input: string): string | null {
  let d = input.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}
