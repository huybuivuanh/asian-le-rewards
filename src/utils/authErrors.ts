// Turns Firebase auth error codes into messages for customers.
import { PASSWORD_HINT } from "@/utils/password";
import { PHONE_HINT } from "@/utils/phone";

const MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Email or password is incorrect.",
  "auth/wrong-password": "Email or password is incorrect.",
  "auth/user-not-found": "No account found for this email.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/missing-email": "Enter your email address.",
  "auth/email-already-in-use": "An account with this email already exists. Try signing in.",
  "auth/weak-password": `Password is too weak. ${PASSWORD_HINT}`,
  "auth/password-does-not-meet-requirements": `Password is too weak. ${PASSWORD_HINT}`,
  "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
  "auth/network-request-failed": "No internet connection. Check your connection and try again.",
  "auth/account-exists-with-different-credential":
    "This email already has an account. Sign in with your email and password.",
  "auth/popup-blocked": "Your browser blocked the Google window. Allow pop-ups and try again.",
  "google/expo-go": "Google sign-in doesn't work in Expo Go. Use email, or a development build.",
  "member/phone-taken": "This phone number is already used by another account.",
  "member/invalid-phone": `Please enter a valid phone number. ${PHONE_HINT}`,
  "google/play-services": "Google Play services is missing or out of date on this device.",
};

/** True for errors about the phone number (taken or invalid), to highlight that field. */
export function isPhoneError(error: unknown): boolean {
  const code = (error as { code?: unknown } | null)?.code;
  return code === "member/phone-taken" || code === "member/invalid-phone";
}

export function authErrorMessage(error: unknown, fallback: string): string {
  const code = (error as { code?: unknown } | null)?.code;
  if (typeof code === "string" && MESSAGES[code]) return MESSAGES[code];
  if (__DEV__) console.warn("[auth]", error);
  return fallback;
}
