// Canadian / North American numbers only (+1).

/** Keeps up to 10 digits, dropping a leading country code "1" if pasted. */
export function phoneDigits(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  return digits.slice(0, 10);
}

/** "6045551234" → "(604) 555-1234", formatted progressively while typing. */
export function formatPhone(digits: string): string {
  if (digits.length < 4) return digits;
  const area = digits.slice(0, 3);
  const prefix = digits.slice(3, 6);
  const line = digits.slice(6);
  if (digits.length < 7) return `(${area}) ${prefix}`;
  return `(${area}) ${prefix}-${line}`;
}

export function isValidPhone(digits: string): boolean {
  return digits.length === 10;
}

export function toE164(digits: string): string {
  return `+1${digits}`;
}
