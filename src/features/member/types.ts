import type { Timestamp } from "firebase/firestore";

/** members/{uid}, created on sign-up. The id is the Firebase Auth uid. */
export type Member = {
  id: string;
  name: string;
  email: string;
  /** 10 digits, no formatting (see ./phone). Unique: reserved in phoneNumbers/{phone}. */
  phone: string;
  createdAt: Timestamp;
  /** Balance. 0 at sign-up; after that only Cloud Functions change it. */
  points: number;
};
