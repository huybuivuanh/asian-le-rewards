import { useEffect, useState } from "react";
import { listenToTransactions } from "./transactionService";
import type { Transaction } from "./types";

/** Live points history for a member. `transactions` is null until the first load. */
export function useTransactions(uid: string | undefined) {
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    return listenToTransactions(
      uid,
      (next) => {
        setTransactions(next);
        setError(null);
      },
      (e) => {
        if (__DEV__) console.warn("[activity]", e);
        setError("Couldn't load your activity. Check your connection.");
      },
    );
  }, [uid]);

  return { transactions, error };
}
