import { getFirestore } from "firebase-admin/firestore";
import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";

export const db = () => getFirestore();

// Same numbers as the app (src/features/rewards/rewards.ts).
export const POINTS_PER_DOLLAR = 1;
export const POINTS_PER_REWARD = 100;
export const REWARD_DOLLARS = 5;
/** Most $5 steps one order can redeem. */
export const MAX_REWARD_STEPS = 20;
/** Welcome bonus: extra points on a member's first order, if its pre-tax subtotal is at least this. */
export const WELCOME_BONUS_POINTS = 200;
export const WELCOME_BONUS_MIN_SUBTOTAL = 15;

const STAFF_ROLES = ["staff", "admin"];

/**
 * Staff-only functions (POS, Orders app): the caller needs custom claims
 * { businessId, role: "staff" | "admin" }. Returns the caller's business id.
 * The business always comes from the claim, never from the request, so staff
 * can only reach their own business's members.
 */
export function requireStaff(request: CallableRequest): string {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in first.");
  const { businessId, role } = request.auth.token;
  if (typeof role !== "string" || !STAFF_ROLES.includes(role)) {
    throw new HttpsError("permission-denied", "Only staff can do this.");
  }
  if (typeof businessId !== "string" || !businessId || businessId.includes("/")) {
    throw new HttpsError("permission-denied", "This account isn't linked to a business.");
  }
  return businessId;
}

/** A Firestore doc id: non-empty, no slashes. */
export function requireId(value: unknown, name: string): string {
  if (typeof value !== "string" || !value || value.length > 128 || value.includes("/")) {
    throw new HttpsError("invalid-argument", `${name} is missing or invalid.`);
  }
  return value;
}

/** Same rules as the app: 10 digits, a leading 1 (country code) is dropped. */
export function normalizePhone(value: unknown): string | null {
  if (typeof value !== "string") return null;
  let digits = value.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  return digits.length === 10 ? digits : null;
}

// All rewards data lives inside a business: businesses/{businessId}/members/…
export const memberRef = (businessId: string, uid: string) =>
  db().doc(`businesses/${businessId}/members/${uid}`);
export const transactionRef = (businessId: string, uid: string, id: string) =>
  db().doc(`businesses/${businessId}/members/${uid}/transactions/${id}`);
export const phoneRef = (businessId: string, phone: string) =>
  db().doc(`businesses/${businessId}/phoneNumbers/${phone}`);
