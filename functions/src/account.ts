import { getAuth } from "firebase-admin/auth";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { db, phoneRef } from "./shared.js";

/**
 * Customer deletes their own account (required by the App Store).
 * A customer can be a member of several businesses, so this finds every
 * businesses/{id}/members/{uid} (collection group query on `id`), deletes each with
 * its transactions, frees that business's phoneNumbers/{phone}, then deletes the
 * login. Safe to call again if a previous call stopped halfway.
 */
export const deleteAccount = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Sign in first.");

  const memberships = await db().collectionGroup("members").where("id", "==", uid).get();

  for (const member of memberships.docs) {
    // businesses/{businessId}/members/{uid}
    const businessId = member.ref.parent.parent?.id;
    if (!businessId || member.id !== uid) continue;

    // Free the phone number, but only if it's really this member's.
    const phone = member.get("phone") as string | undefined;
    if (phone) {
      const ref = phoneRef(businessId, phone);
      const phoneDoc = await ref.get();
      if (phoneDoc.get("uid") === uid) await ref.delete();
    }

    // The member doc and everything under it (transactions).
    await db().recursiveDelete(member.ref);
  }

  try {
    await getAuth().deleteUser(uid);
  } catch (error) {
    // Already gone (e.g. a retry): nothing left to do.
    if ((error as { code?: string }).code !== "auth/user-not-found") throw error;
  }

  return { deleted: true };
});
