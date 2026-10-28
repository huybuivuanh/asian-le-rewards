// Turns Firebase auth error codes into messages for customers.

const MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Email or password is incorrect.",
  "auth/wrong-password": "Email or password is incorrect.",
  "auth/user-not-found": "No account found for this email.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/missing-email": "Enter your email address.",
  "auth/email-already-in-use": "An account with this email already exists. Try signing in.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/password-does-not-meet-requirements": "Password must be at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
  "auth/network-request-failed": "No internet connection. Check your connection and try again.",
};

export function authErrorMessage(error: unknown, fallback: string): string {
  const code = (error as { code?: unknown } | null)?.code;
  if (typeof code === "string" && MESSAGES[code]) return MESSAGES[code];
  if (__DEV__) console.warn("[auth]", error);
  return fallback;
}
