// Cloud Functions for the loyalty project.
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

initializeApp();
const db = getFirestore();

/**
 * Customer deletes their own account (required by the App Store).
 * Deletes members/{uid} with its transactions, frees phoneNumbers/{phone},
 * then deletes the login. Safe to call again if a previous call stopped halfway.
 */
export const deleteAccount = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Sign in first.");

  const memberRef = db.doc(`members/${uid}`);
  const member = await memberRef.get();
  const phone = member.get("phone") as string | undefined;

  // Free the phone number, but only if it's really this member's.
  if (phone) {
    const phoneRef = db.doc(`phoneNumbers/${phone}`);
    const phoneDoc = await phoneRef.get();
    if (phoneDoc.get("uid") === uid) await phoneRef.delete();
  }

  // The member doc and everything under it (transactions).
  await db.recursiveDelete(memberRef);

  try {
    await getAuth().deleteUser(uid);
  } catch (error) {
    // Already gone (e.g. a retry): nothing left to do.
    if ((error as { code?: string }).code !== "auth/user-not-found") throw error;
  }

  return { deleted: true };
});
