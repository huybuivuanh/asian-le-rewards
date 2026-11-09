// Email + password sign-in with the Firebase JS SDK (same on web, iOS and Android).
import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { codedError } from "@/lib/errors";
import { auth } from "@/lib/firebase";
import { createMember } from "@/features/member/memberService";
import { signInWithGoogle as googleSignIn, signOutGoogle } from "./googleSignIn";

/**
 * True for POS / admin accounts (they have a `role` claim; customers have none). Staff
 * can't be rewards members with their work login — the security rules refuse it too.
 */
export async function isStaffAccount(user: User): Promise<boolean> {
  try {
    return "role" in (await user.getIdTokenResult()).claims;
  } catch {
    return false; // offline: the rules still refuse staff
  }
}

/** Signs a staff account straight back out with a clear message. */
async function refuseStaff(user: User): Promise<void> {
  if (!(await isStaffAccount(user))) return;
  await signOutUser();
  throw codedError("auth/staff-account", "Staff account.");
}

export async function signIn(email: string, password: string): Promise<void> {
  const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);
  await refuseStaff(user);
}

/** Returns false if the customer closed the Google sheet. */
export async function signInWithGoogle(): Promise<boolean> {
  const signedIn = await googleSignIn();
  if (signedIn && auth.currentUser) await refuseStaff(auth.currentUser);
  return signedIn;
}

export type SignUpInput = { name: string; phone: string; email: string; password: string };

/**
 * Creates the login, then members/{uid}. If the member doc can't be saved, the new
 * login is deleted so the customer can simply try again with the same email.
 */
export async function signUp({ name, phone, email, password }: SignUpInput): Promise<void> {
  const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
  try {
    await createMember(user, { name, phone });
  } catch (error) {
    // Deleting can fail too (e.g. offline). Sign out either way so no one is
    // left signed in without a member doc.
    await deleteUser(user).catch(() => signOut(auth));
    throw error;
  }
}

export function resetPassword(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email.trim());
}

export async function signOutUser(): Promise<void> {
  await signOutGoogle();
  await signOut(auth);
}
