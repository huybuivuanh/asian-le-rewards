import type { Timestamp } from "firebase/firestore";

export type TransactionType = "earn" | "redeem" | "reverse";

/**
 * members/{uid}/transactions/{id}, written only by Cloud Functions.
 * Ids are `earn_<orderId>` / `redeem_<orderId>` / `reverse_<orderId>`, so each order counts once.
 */
export type Transaction = {
  id: string;
  type: TransactionType;
  /** Change to the balance: +42 earned, -100 redeemed; a reverse undoes one. */
  points: number;
  orderId: string;
  createdAt: Timestamp;
  /** earn only: pre-tax subtotal in dollars the points came from. */
  subtotal?: number;
  /** redeem only: dollars off the order. */
  discount?: number;
};
