// Rewards Cloud Functions (codebase "rewards" in the shared asianlepos project).
import { initializeApp } from "firebase-admin/app";

initializeApp();

export { deleteAccount } from "./account.js";
export { earnPoints, lookupMember, redeemPoints, reverseOrder } from "./pos.js";
