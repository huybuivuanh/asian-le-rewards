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
}
