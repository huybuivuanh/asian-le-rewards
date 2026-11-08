// Which business's rewards program this app shows. Rewards data lives under
// businesses/{businessId}/members/… in the shared Firebase project.
//
// The app is built for one business (EXPO_PUBLIC_BUSINESS_ID). An account with a
// `businessId` custom claim uses that business instead: that's how the App Store
// review account opens the Demo business.
import type { User } from "firebase/auth";
import { collection, doc } from "firebase/firestore";
import { db } from "./firebase";

const DEFAULT_BUSINESS_ID = process.env.EXPO_PUBLIC_BUSINESS_ID;
if (!DEFAULT_BUSINESS_ID) {
  throw new Error(
    "Missing EXPO_PUBLIC_BUSINESS_ID. Add it to a root .env file (see .env.example) and restart Expo.",
  );
}

let currentBusinessId: string = DEFAULT_BUSINESS_ID;

export function getBusinessId(): string {
  return currentBusinessId;
}

/** Picks the business for a login: its `businessId` claim if it has one, else the app's. */
export async function setBusinessForUser(user: User | null): Promise<void> {
  if (!user) {
    currentBusinessId = DEFAULT_BUSINESS_ID!;
    return;
  }
  try {
    const { claims } = await user.getIdTokenResult();
    currentBusinessId =
      typeof claims.businessId === "string" && claims.businessId
        ? claims.businessId
        : DEFAULT_BUSINESS_ID!;
  } catch {
    // Offline: keep the current business.
  }
}

/** A doc inside the current business, e.g. businessDoc("members", uid). */
export function businessDoc(...path: [string, ...string[]]) {
  return doc(db, "businesses", currentBusinessId, ...path);
}

/** A collection inside the current business, e.g. businessCol("members", uid, "transactions"). */
export function businessCol(...path: [string, ...string[]]) {
  return collection(db, "businesses", currentBusinessId, ...path);
}
