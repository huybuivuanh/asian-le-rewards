// Password rules for new accounts. Keep in sync with the Firebase password policy
// (Console → Authentication → Settings → Password policy) so the server enforces them too.

export const MIN_PASSWORD = 8;

export const PASSWORD_HINT = `At least ${MIN_PASSWORD} characters, with 1 uppercase letter, 1 number and 1 special character (Ex: ! @ # $).`;

const RULES: { test: (p: string) => boolean; message: string }[] = [
  {
    test: (p) => p.length >= MIN_PASSWORD,
    message: `at least ${MIN_PASSWORD} characters`,
  },
  { test: (p) => /[A-Z]/.test(p), message: "1 uppercase letter" },
  { test: (p) => /[0-9]/.test(p), message: "1 number" },
  { test: (p) => /[^A-Za-z0-9\s]/.test(p), message: "1 special character" },
];

/** Returns an error naming what's missing, or null if the password is OK. */
export function passwordError(password: string): string | null {
  const missing = RULES.filter((rule) => !rule.test(password)).map(
    (rule) => rule.message,
  );
  if (missing.length === 0) return null;
  return `Password needs ${missing.join(", ")}.`;
}
