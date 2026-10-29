// members/{uid}/transactions: the points history, read-only for the app.
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Transaction } from "./types";

/** New transactions older than this aren't announced (e.g. after reconnecting). */
const ANNOUNCE_WINDOW_MS = 10 * 60 * 1000;

function transactionsQuery(uid: string, count: number) {
  return query(
    collection(db, "members", uid, "transactions"),
    orderBy("createdAt", "desc"),
    limit(count),
  );
}

function toTransaction(snap: QueryDocumentSnapshot): Transaction {
  return { ...(snap.data() as Omit<Transaction, "id">), id: snap.id };
}

/** Newest first, live. Returns unsubscribe. */
export function listenToTransactions(
  uid: string,
  onChange: (transactions: Transaction[]) => void,
  onError: (error: Error) => void,
): () => void {
  return onSnapshot(
    transactionsQuery(uid, 100),
    (snap) => onChange(snap.docs.map(toTransaction)),
    onError,
  );
}

/**
 * Calls `onNew` for transactions that arrive while listening (not ones that already
 * existed when it started). Used for the "+42 points earned" banner. Returns unsubscribe.
 */
export function listenToNewTransactions(
  uid: string,
  onNew: (transaction: Transaction) => void,
): () => void {
  let seen: Set<string> | null = null;

  return onSnapshot(
    transactionsQuery(uid, 5),
    (snap) => {
      // The first answer from the server is the existing history: remember it, don't announce it.
      if (!seen) {
        if (snap.metadata.fromCache) return;
        seen = new Set(snap.docs.map((d) => d.id));
        return;
      }
      for (const change of snap.docChanges()) {
        if (change.type !== "added" || seen.has(change.doc.id)) continue;
        seen.add(change.doc.id);
        const transaction = toTransaction(change.doc);
        const created = transaction.createdAt?.toMillis?.() ?? 0;
        if (Date.now() - created < ANNOUNCE_WINDOW_MS) onNew(transaction);
      }
    },
    (error) => {
      if (__DEV__) console.warn("[new transactions]", error);
    },
  );
}
