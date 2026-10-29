// One-time setup: gives a login the `role: "pos"` claim so it can call the POS
// functions. Only server code can set claims, so customers can't give it to themselves.
//
// 1. Firebase console → Authentication → Add user (e.g. pos@asianle.ca + a strong password).
// 2. Firebase console → Project settings → Service accounts → Generate new private key.
//    Save it OUTSIDE the repo. It's an admin key: never commit or share it.
// 3. From the repo root:
//      node functions/scripts/set-pos-role.mjs pos@asianle.ca C:\path\to\key.json
// 4. Sign the POS in (or out and in again) so its login picks up the claim.
//
// Remove the role:
//      node functions/scripts/set-pos-role.mjs pos@asianle.ca C:\path\to\key.json --remove
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { readFileSync } from "node:fs";

const [email, keyPath, flag] = process.argv.slice(2);
if (!email || !keyPath) {
  console.error(
    "Usage: node functions/scripts/set-pos-role.mjs <email> <service-account-key.json> [--remove]",
  );
  process.exit(1);
}

const key = JSON.parse(readFileSync(keyPath, "utf8"));
initializeApp({ credential: cert(key) });
const auth = getAuth();
let user;
try {
  user = await auth.getUserByEmail(email);
} catch (error) {
  if (error.code === "auth/user-not-found") {
    console.error(
      `No login "${email}" in Firebase project "${key.project_id}".\n` +
        "Create it first: Firebase console → (this project) → Authentication → Users → Add user.",
    );
    process.exit(1);
  }
  throw error;
}
const claims = { ...(user.customClaims ?? {}) };
if (flag === "--remove") delete claims.role;
else claims.role = "pos";
await auth.setCustomUserClaims(user.uid, claims);
console.log(`${email} (${user.uid}) claims are now:`, claims);
