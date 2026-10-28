# Asian Le Rewards — Plan

Loyalty program for Asian Le. A separate customer app (this repo) with its own Firebase
project. Customers see their points and a personal QR code. The POS (`D:\Projects\AsianLePOS`)
scans the QR to collect and redeem points.

## Status (2026-10-27)

- [x] Repo renamed `asian-le-customers` → `asian-le-rewards` on GitHub; local `origin` updated
- [ ] Rename local folder `D:\Projects\asian-le-customers` → `D:\Projects\asian-le-rewards`
      (was locked by VS Code / expo — close both, then rename)
- [x] App renamed in `app.json` (name "Asian Le Rewards", slug `asian-le-rewards`, scheme `asianlerewards`)
- [x] NativeWind 4.2.7 + Tailwind 3 (same as POS)
- [x] Web "Metro error: This operation was aborted" — harmless (cancelled server render on reload)
- [x] Light theme only
- [x] Firebase email + password auth (sign in, create account, forgot password) — JS SDK, same as POS
- [ ] Create the loyalty Firebase project, enable Email/Password sign-in, fill `.env`
- [ ] Nothing committed yet

## Decisions

| Topic | Decision |
|---|---|
| Projects | Separate Firebase project for loyalty (customers isolated from POS) |
| QR code | Fixed QR containing a random `memberCode` — **not** the Firebase uid |
| Member lookup at POS | Scan QR, or search by phone (members are separate from POS `customers`) |
| Earn rate | 1 point per $1 of pre-tax subtotal |
| Who earns | Dine-in and take-out |
| When to earn | Any time after the order, **once per order**; POS marks the order as collected |
| Redeem | Fixed steps: 100 pts = $5 off, applied as the POS's existing Amount discount |
| Cancelled order | Points automatically reversed (earned removed, redeemed refunded) |
| Customer sign-up | Self sign-up in the app or website, email + password (same as POS; no SMS / Blaze needed for auth) |
| Scanning | Device camera |
| Customer display | Shows "Scan your loyalty QR" and "+N points earned" |

## How POS and loyalty talk

One-way only: **POS → loyalty**. No callbacks.

```
Customer app ──reads own data──▶  Loyalty Firebase project  ◀──Cloud Functions── POS
(points, QR, history)              (members, ledger)            (lookup / earn / redeem)
```

- The POS calls loyalty Cloud Functions. The function's response **is** the confirmation
  (e.g. `{ pointsEarned: 42, newBalance: 292 }`).
- The customer app listens live to its own member doc, so points update on the phone
  the moment staff scan.

### POS connecting to two Firebase projects

The Firebase SDK can hold several connections, each with a name:

```ts
const app = initializeApp(posConfig);                       // existing
const loyaltyApp = initializeApp(loyaltyConfig, "loyalty");  // new
export const loyaltyAuth = getAuth(loyaltyApp);
export const loyaltyFunctions = getFunctions(loyaltyApp);
```

- Each connection has its own login. Staff keep using the normal POS login.
- Each POS device signs into loyalty **once** as `pos@asianle.com` from a
  **Loyalty section in the Profile tab**. The login is remembered.
- The password is **never** put in `.env` — the web POS is public and `EXPO_PUBLIC_*`
  values are visible in the bundle. The loyalty Firebase *config* is fine in `.env`.

### Security

- `pos@asianle.com` gets a custom claim `role: "pos"` via a one-time admin script.
  Only server code can set claims, so customers can't give it to themselves.
- Every POS-only function checks `request.auth.token.role === "pos"`.
- Customers can only **read** their own member doc and history. All writes go through functions.

## Data model (loyalty project)

```
members/{uid}                      name, phone, memberCode, points, createdAt
members/{uid}/transactions/{id}    type (earn | redeem | reverse), points, orderId, createdAt
memberCodes/{code}                 uid   (unique codes + fast lookup)
```

- Transaction ids `earn_<orderId>` / `redeem_<orderId>` make every call safe to retry
  and enforce "once per order".
- Balance and transaction are written in one Firestore transaction.

## Cloud Functions (loyalty project)

| Function | Caller | Does |
|---|---|---|
| `registerMember(name)` | customer | Create member doc + random QR code |
| `lookupMember(code or phone)` | POS | Name, balance |
| `earnPoints(code, orderId, subtotal)` | POS | 1 pt/$1, once per order |
| `redeemPoints(code, orderId, steps)` | POS | −100 pts per $5 step, returns $ amount |
| `reverseOrder(orderId)` | POS | Refund redeemed points, remove earned points |

## Phases

0. **Lock down the POS Firebase project** (do first)
   - Authentication → Settings → User actions → turn **off** "Enable create (sign-up)"
   - Review Firestore rules (no rules file in the POS repo yet) and track them in the repo
1. **Loyalty Firebase project**: create it, Blaze plan (needed for functions),
   Email/Password auth, Firestore, `pos@asianle.com` + `role: pos` script, security rules
2. **Cloud Functions** (table above), tested with emulators
3. **Customer app** (this repo): sign-in ✅ (Firebase email) → name + phone on first
   sign-in (phone is for POS search, not verified) → home (points + QR) → history.
4. **POS integration**
   - Second Firebase connection + Loyalty section in Profile
   - `src/services/loyaltyService.ts` wrapping the functions
   - Member panel on dine-in table page and take-out orders: scan / phone search →
     Collect points (once, saves `order.loyalty = { memberId, points, collectedAt }`)
     → Redeem $5 / $10 → Amount discount
   - Cancel → `reverseOrder`
   - Customer display prompts
5. **Test with emulators, then deploy**

## Open questions

1. If an order already has a staff discount, should a redemption stack, replace it, or be blocked?
2. Earn on the amount after redemption ($42 − $5 → 37 pts)? Suggested: yes.
3. Points expiry? Suggested: never, to start.

## Notes on this repo

- Expo SDK 58, routes in `src/app`, alias `@/*` → `src/*`
- Structure follows POS: `src/lib/firebaseConfig.ts`, `src/providers/AuthProvider.tsx`,
  `src/services/`, `src/ui/`, `src/utils/`.
- Auth: Firebase JS SDK email + password on all platforms (works in Expo Go).
  `src/lib/firebaseConfig.ts` (AsyncStorage persistence on native) →
  `src/services/authService.ts` (signIn / signUp / resetPassword / signOutUser) →
  `src/providers/AuthProvider.tsx` (user, loading, logout). Screens: `sign-in`, `sign-up`,
  guarded with `Stack.Protected`. Config: `EXPO_PUBLIC_FIREBASE_*` in `.env` (see `.env.example`).
- `tsconfig.json` maps `@firebase/auth` to its React Native types (same as POS) so
  `getReactNativePersistence` type-checks.
- Styling: NativeWind classes; brand color `brand` (#DA251D, logo red) in `tailwind.config.js`.
- Light theme only (`userInterfaceStyle: "light"`). Header/background colors come from the
  React Navigation theme in the root layout.
- After config changes, start with a cleared cache: `npx expo start -c`
