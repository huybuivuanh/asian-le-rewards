import { getFirestore } from "firebase-admin/firestore";
import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";

export const db = () => getFirestore();

// Same numbers as the app (src/utils/rewards.ts).
export const POINTS_PER_DOLLAR = 1;
export const POINTS_PER_REWARD = 100;
export const REWARD_DOLLARS = 5;
/** Most $5 steps one order can redeem. */
export const MAX_REWARD_STEPS = 20;

/** POS-only functions: the caller must be the POS login with the `role: "pos"` claim. */
export function requirePos(request: CallableRequest): void {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in first.");
  if (request.auth.token.role !== "pos") {
    throw new HttpsError("permission-denied", "Only the POS can do this.");
  }
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

export const memberRef = (uid: string) => db().doc(`members/${uid}`);
export const transactionRef = (uid: string, id: string) =>
  db().doc(`members/${uid}/transactions/${id}`);
