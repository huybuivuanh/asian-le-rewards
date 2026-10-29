// Phones are stored as 10 digits, no formatting (same digits-only style as POS),
// so "(604) 555-1234" and "1-604-555-1234" are the same number.

export const PHONE_ERROR = "Please enter your full phone number, like (604) 555-1234.";
export const PHONE_PLACEHOLDER = "(000) 000-0000";

/** 10 digits, or null if it isn't a valid North American number. */
export function normalizePhone(value: string): string | null {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  return digits.length === 10 ? digits : null;
}

/**
 * Formats while typing: "604555" → "(604) 555", "6045551234" → "(604) 555-1234".
 * Keeps at most 10 digits. A leading 1 (country code, e.g. from autofill "+1 604…")
 * is dropped, since North American area codes never start with 1.
 */
export function formatPhoneInput(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("1")) digits = digits.slice(1);
  digits = digits.slice(0, 10);
  const area = digits.slice(0, 3);
  const prefix = digits.slice(3, 6);
  const line = digits.slice(6);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${area}`;
  if (digits.length <= 6) return `(${area}) ${prefix}`;
  return `(${area}) ${prefix}-${line}`;
}

/** "6045551234" → "(604) 555-1234". */
export function formatPhone(digits: string): string {
  return formatPhoneInput(digits);
}
