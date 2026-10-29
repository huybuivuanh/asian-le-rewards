// Phones are stored as 10 digits, no formatting (same digits-only style as POS),
// so "(604) 555-1234" and "1-604-555-1234" are the same number.

export const PHONE_HINT = "10-digit phone number, e.g. 604 555 1234.";

/** 10 digits, or null if it isn't a valid North American number. */
export function normalizePhone(value: string): string | null {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  return digits.length === 10 ? digits : null;
}

/** "6045551234" → "604 555-1234" (same as POS formatPhone). */
export function formatPhone(digits: string): string {
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
