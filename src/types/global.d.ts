import type { Timestamp } from "firebase/firestore";

export {};

declare global {
  /** members/{uid} — created on sign-up; id is the Firebase Auth uid. */
  interface Member {
    id: string;
    name: string;
    email: string;
    /** 10 digits, no formatting (see utils/phone). Unique: reserved in phoneNumbers/{phone}. */
    phone: string;
    createdAt: Timestamp;
    /** Balance. 0 at sign-up; after that only Cloud Functions change it. */
    points: number;
  }

  type TransactionType = "earn" | "redeem" | "reverse";

  /**
   * members/{uid}/transactions/{id} — written only by Cloud Functions.
   * Ids are `earn_<orderId>` / `redeem_<orderId>` so each order counts once.
   */
  interface Transaction {
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
  }
}
