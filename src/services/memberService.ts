import type { User } from "firebase/auth";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "@/lib/firebaseConfig";
import { normalizePhone } from "@/utils/phone";

type MemberDetails = Pick<Member, "name" | "phone">;

function codedError(code: string, message: string) {
  return Object.assign(new Error(message), { code });
}

/**
 * Writes members/{uid} and reserves phoneNumbers/{phone} in one batch, so a phone
 * number belongs to one member only. The doc id is the Firebase Auth uid, and the
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
  batch.set(doc(db, "members", user.uid), member);
  batch.set(doc(db, "phoneNumbers", digits), { uid: user.uid });
  try {
    await batch.commit();
  } catch (error) {
    // The rules only refuse a valid member when phoneNumbers/{phone} already
    // exists (writing over it counts as an update, which is denied).
    if ((error as { code?: string }).code === "permission-denied") {
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
    doc(db, "members", uid),
    (snap) => onChange(snap.exists() ? (snap.data() as Member) : null),
    onError,
  );
}

/** Newest first, live. Returns unsubscribe. */
export function listenToTransactions(
  uid: string,
  onChange: (transactions: Transaction[]) => void,
  onError: (error: Error) => void,
): () => void {
  return onSnapshot(
    query(collection(db, "members", uid, "transactions"), orderBy("createdAt", "desc"), limit(100)),
    (snap) => onChange(snap.docs.map((d) => ({ ...(d.data() as Omit<Transaction, "id">), id: d.id }))),
    onError,
  );
}

/** Deletes the member, their history, phone reservation and login (Cloud Function). */
export async function deleteAccount(): Promise<void> {
  await httpsCallable(functions, "deleteAccount")();
}
