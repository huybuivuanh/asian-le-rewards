// businesses/{businessId}/members/{uid}: create, listen, delete.
import type { User } from "firebase/auth";
import { onSnapshot, Timestamp, writeBatch } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { codedError, errorCode } from "@/lib/errors";
import { businessDoc } from "@/lib/business";
import { db, functions } from "@/lib/firebase";
import { normalizePhone } from "./phone";
import type { Member } from "./types";

type MemberDetails = Pick<Member, "name" | "phone">;

/**
 * Writes members/{uid} and reserves phoneNumbers/{phone} (both inside the current
 * business) in one batch, so a phone number belongs to one member per business. The doc id is the Firebase Auth uid, and the
 * email comes from the login (security rules require both).
 */
export async function createMember(user: User, { name, phone }: MemberDetails): Promise<Member> {
  const digits = normalizePhone(phone);
  if (!digits) throw codedError("member/invalid-phone", "Invalid phone number.");

  const member: Member = {
    id: user.uid,
    name: name.trim(),
    email: user.email ?? "",
    phone: digits,
    createdAt: Timestamp.now(),
    points: 0,
  };

  const batch = writeBatch(db);
  batch.set(businessDoc("members", user.uid), member);
  batch.set(businessDoc("phoneNumbers", digits), { uid: user.uid });
  try {
    await batch.commit();
  } catch (error) {
    // The rules only refuse a valid member when phoneNumbers/{phone} already
    // exists (writing over it counts as an update, which is denied).
    if (errorCode(error) === "permission-denied") {
      throw codedError("member/phone-taken", "Phone number already used.");
    }
    throw error;
  }
  return member;
}

/** Live updates of members/{uid}; `null` when the doc doesn't exist. Returns unsubscribe. */
export function listenToMember(
  uid: string,
  onChange: (member: Member | null) => void,
  onError: (error: Error) => void,
): () => void {
  return onSnapshot(
    businessDoc("members", uid),
    (snap) => onChange(snap.exists() ? (snap.data() as Member) : null),
    onError,
  );
}

/** Deletes the member (in every business), their history, phone reservations and login (Cloud Function). */
export async function deleteAccount(): Promise<void> {
  await httpsCallable(functions, "deleteAccount")();
}
