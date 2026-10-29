// Email + password sign-in with the Firebase JS SDK (same on web, iOS and Android).
import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { signOutGoogle } from "@/services/googleSignIn";
import { createMember } from "@/services/memberService";

export { signInWithGoogle } from "@/services/googleSignIn";

export async function signIn(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email.trim(), password);
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
