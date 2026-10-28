// Email + password sign-in with the Firebase JS SDK (same on web, iOS and Android).
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";

export async function signIn(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function signUp(email: string, password: string): Promise<void> {
  await createUserWithEmailAndPassword(auth, email.trim(), password);
}

export function resetPassword(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email.trim());
}

export function signOutUser(): Promise<void> {
  return signOut(auth);
}
