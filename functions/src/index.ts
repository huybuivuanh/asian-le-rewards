// Cloud Functions for the loyalty project.
import { initializeApp } from "firebase-admin/app";

initializeApp();

export { deleteAccount } from "./account.js";
export { earnPoints, lookupMember, redeemPoints, reverseOrder } from "./pos.js";
