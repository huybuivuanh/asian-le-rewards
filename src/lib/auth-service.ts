// MOCK auth service — stands in for Firebase phone sign-in until the loyalty
// Firebase project exists. Only this file should change when wiring Firebase.
//
// Test behaviour:
//   - any valid number gets a code "sent"
//   - code 123456 signs in; any other code fails

export type Session = { uid: string; phone: string };

export const MOCK_CODE = "123456";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function sendVerificationCode(phoneE164: string): Promise<string> {
  await delay(800);
  return `mock-verification-${phoneE164}`;
}

export async function confirmVerificationCode(
  verificationId: string,
  phoneE164: string,
  code: string,
): Promise<Session> {
  await delay(800);
  if (!verificationId || code !== MOCK_CODE) {
    throw new Error("That code is incorrect. Check the text message and try again.");
  }
  return { uid: `mock-${phoneE164}`, phone: phoneE164 };
}

export async function signOutUser(): Promise<void> {}
