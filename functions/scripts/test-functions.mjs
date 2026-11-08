// Emulator test for the rewards functions: business isolation, roles, earn /
// redeem / reverse, and deleteAccount across businesses.
//
// From the repo root (needs Java 21 for the Firestore emulator):
//   npm --prefix functions run test
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const PROJECT = process.env.GCLOUD_PROJECT ?? "demo-asianle";
const FUNCTIONS = `http://127.0.0.1:5001/${PROJECT}/us-central1`;
const AUTH_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST ?? "127.0.0.1:9099";

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  console.error("Run inside `firebase emulators:exec` (see the header).");
  process.exit(1);
}

initializeApp({ projectId: PROJECT });
const db = getFirestore();
const auth = getAuth();

let passed = 0;
let failed = 0;
function check(name, ok, detail = "") {
  if (ok) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.log(`  ✗ ${name} ${detail}`);
  }
}

async function createUser(email, claims) {
  const user = await auth.createUser({ email, password: "secret123" });
  if (claims) await auth.setCustomUserClaims(user.uid, claims);
  const res = await fetch(
    `http://${AUTH_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "secret123", returnSecureToken: true }),
    },
  );
  const { idToken } = await res.json();
  return { uid: user.uid, token: idToken };
}

/** Calls a callable function; returns { data } or { error: { status, message } }. */
async function call(name, token, data) {
  const res = await fetch(`${FUNCTIONS}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ data }),
  });
  const body = await res.json();
  return body.error ? { error: body.error } : { data: body.result };
}

const status = (r) => r.error?.status;
const points = async (bid, uid) =>
  (await db.doc(`businesses/${bid}/members/${uid}`).get()).get("points");

// ── Setup ──────────────────────────────────────────────────────────────────
const A = "bizA";
const B = "bizB";
await db.doc(`businesses/${A}`).set({ name: "A" });
await db.doc(`businesses/${B}`).set({ name: "B" });

async function addMember(bid, uid, phone, pts) {
  await db.doc(`businesses/${bid}/members/${uid}`).set({
    id: uid, name: `Member ${uid}`, email: `${uid}@test.com`, phone,
    createdAt: Timestamp.now(), points: pts,
  });
  await db.doc(`businesses/${bid}/phoneNumbers/${phone}`).set({ uid });
}
await addMember(A, "m1", "6045551111", 500);
await addMember(B, "m2", "6045552222", 300);

const staffA = await createUser("staffA@test.com", { businessId: A, role: "staff" });
const adminA = await createUser("adminA@test.com", { businessId: A, role: "admin" });
const staffB = await createUser("staffB@test.com", { businessId: B, role: "staff" });
const customer = await createUser("customer@test.com", null);
const oldPos = await createUser("pos@test.com", { role: "pos" });
const noBusiness = await createUser("nobiz@test.com", { role: "staff" });

// ── Access ─────────────────────────────────────────────────────────────────
console.log("Access");
check("no login → unauthenticated", status(await call("lookupMember", null, { uid: "m1" })) === "UNAUTHENTICATED");
check("customer → permission-denied", status(await call("lookupMember", customer.token, { uid: "m1" })) === "PERMISSION_DENIED");
check("old role: pos → permission-denied", status(await call("lookupMember", oldPos.token, { uid: "m1" })) === "PERMISSION_DENIED");
check("staff without business → permission-denied", status(await call("lookupMember", noBusiness.token, { uid: "m1" })) === "PERMISSION_DENIED");

// ── Lookup ─────────────────────────────────────────────────────────────────
console.log("Lookup");
let r = await call("lookupMember", staffA.token, { uid: "m1" });
check("staff A finds A's member by QR", r.data?.member?.uid === "m1" && r.data.member.points === 500, JSON.stringify(r));
r = await call("lookupMember", staffA.token, { phone: "604-555-1111" });
check("staff A finds A's member by phone", r.data?.member?.uid === "m1", JSON.stringify(r));
check("staff B can't find A's member by QR", status(await call("lookupMember", staffB.token, { uid: "m1" })) === "NOT_FOUND");
check("staff B can't find A's member by phone", status(await call("lookupMember", staffB.token, { phone: "6045551111" })) === "NOT_FOUND");
r = await call("lookupMember", staffB.token, { phone: "6045552222" });
check("staff B finds B's own member", r.data?.member?.uid === "m2", JSON.stringify(r));

// ── Earn / redeem / reverse ────────────────────────────────────────────────
console.log("Earn / redeem / reverse");
r = await call("earnPoints", staffA.token, { uid: "m1", orderId: "o1", subtotal: 42.5 });
check("earn 42 + 200 welcome bonus", r.data?.pointsEarned === 42 && r.data.bonusPoints === 200 && r.data.balance === 742, JSON.stringify(r));
r = await call("earnPoints", staffA.token, { uid: "m1", orderId: "o1", subtotal: 42.5 });
check("earning again for the same order changes nothing", r.data?.alreadyEarned === true && (await points(A, "m1")) === 742, JSON.stringify(r));
check("staff B can't earn on A's member", status(await call("earnPoints", staffB.token, { uid: "m1", orderId: "x", subtotal: 100 })) === "NOT_FOUND" && (await points(A, "m1")) === 742);
check("staff B can't redeem from A's member", status(await call("redeemPoints", staffB.token, { uid: "m1", orderId: "x", steps: 1 })) === "NOT_FOUND" && (await points(A, "m1")) === 742);
r = await call("redeemPoints", adminA.token, { uid: "m1", orderId: "o2", steps: 2 });
check("admin A redeems 200 pts for $10", r.data?.pointsRedeemed === 200 && r.data.discount === 10 && r.data.balance === 542, JSON.stringify(r));
check("redeeming more than the balance fails", status(await call("redeemPoints", staffA.token, { uid: "m1", orderId: "o3", steps: 20 })) === "FAILED_PRECONDITION");
check("staff B can't reverse A's order", status(await call("reverseOrder", staffB.token, { uid: "m1", orderId: "o1" })) === "NOT_FOUND" && (await points(A, "m1")) === 542);
r = await call("reverseOrder", staffA.token, { uid: "m1", orderId: "o1" });
const m1 = (await db.doc(`businesses/${A}/members/m1`).get()).data();
check("reverse removes earned + bonus, clears first order", r.data?.pointsChanged === -242 && m1.points === 300 && m1.firstOrderId === undefined, JSON.stringify(r));

const tx = await db.collection(`businesses/${A}/members/m1/transactions`).get();
check("history is inside the business", tx.size === 4, `got ${tx.size}`);
check("nothing written at top-level members/", (await db.collection("members").get()).empty);
check("B's member untouched", (await points(B, "m2")) === 300);

// ── deleteAccount ──────────────────────────────────────────────────────────
console.log("deleteAccount");
const leaving = await createUser("leaving@test.com", null);
await addMember(A, leaving.uid, "6045553333", 50);
await addMember(B, leaving.uid, "6045553333", 70);
await db.doc(`businesses/${A}/members/${leaving.uid}/transactions/earn_z`).set({ points: 50 });
r = await call("deleteAccount", leaving.token, {});
const gone = async (path) => !(await db.doc(path).get()).exists;
check("returns deleted", r.data?.deleted === true, JSON.stringify(r));
check("membership in A deleted", await gone(`businesses/${A}/members/${leaving.uid}`));
check("membership in B deleted", await gone(`businesses/${B}/members/${leaving.uid}`));
check("history deleted", (await db.collection(`businesses/${A}/members/${leaving.uid}/transactions`).get()).empty);
check("phone freed in both businesses", (await gone(`businesses/${A}/phoneNumbers/6045553333`)) && (await gone(`businesses/${B}/phoneNumbers/6045553333`)));
let authGone = false;
try {
  await auth.getUser(leaving.uid);
} catch {
  authGone = true;
}
check("login deleted", authGone);
check("other members untouched", (await points(A, "m1")) === 300 && (await points(B, "m2")) === 300);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
