// Google sign-in on web: Firebase's popup.
import * as firebaseAuth from "firebase/auth";
import type { Auth, AuthProvider, UserCredential } from "firebase/auth";
import { errorCode } from "@/lib/errors";
import { auth } from "@/lib/firebase";

// tsconfig points firebase/auth at its React Native types, which leave out this
// web-only function. It exists in the web build that Metro loads here.
const { GoogleAuthProvider } = firebaseAuth;
const signInWithPopup = (
  firebaseAuth as unknown as {
    signInWithPopup: (auth: Auth, provider: AuthProvider) => Promise<UserCredential>;
  }
).signInWithPopup;

const CANCELLED = ["auth/popup-closed-by-user", "auth/cancelled-popup-request"];

/** Returns false if the customer closed the popup. */
export async function signInWithGoogle(): Promise<boolean> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    await signInWithPopup(auth, provider);
    return true;
  } catch (error) {
    if (CANCELLED.includes(errorCode(error) ?? "")) return false;
    throw error;
  }
}

export async function signOutGoogle(): Promise<void> {}
