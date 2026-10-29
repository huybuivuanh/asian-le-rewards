# Asian Le Rewards

Customer loyalty app for Asian Le. Customers sign up, see their points balance and a
personal QR code, and follow their points history. Staff scan the QR at the POS to earn
and redeem points.

Runs on **iOS, Android and web** from one Expo codebase. The backend is a dedicated
Firebase project (Auth, Firestore, Cloud Functions).

## Tech stack

| Area       | Tools                                                           |
| ---------- | --------------------------------------------------------------- |
| App        | Expo SDK 58, React Native, Expo Router (file-based routes)      |
| Styling    | NativeWind 4 (Tailwind 3)                                       |
| Auth       | Firebase Auth: email + password, Google                         |
| Data       | Cloud Firestore (live listeners), security rules in `firestore.rules` |
| Backend    | Cloud Functions v2 (`functions/`), Node 22                      |
| Builds     | EAS Build (`eas.json`)                                          |

## Getting started

```bash
npm install
cp .env.example .env     # fill in the Firebase and Google values
npm start                # then press i / a / w
```

Google sign-in uses a native module, so on iOS and Android it needs a development build
(`eas build --profile development`). Email sign-in works in Expo Go.

### Scripts

| Command             | What it does                                         |
| ------------------- | ---------------------------------------------------- |
| `npm start`         | Start the Expo dev server                            |
| `npm run ios` / `android` / `web` | Start and open on a platform           |
| `npm run lint`      | ESLint (Expo config)                                 |
| `npm run typecheck` | TypeScript, no emit                                  |
| `npm run check`     | Lint + typecheck the app, and build the functions    |

Cloud Functions (from `functions/`): `npm run build`, `npm run serve` (emulators),
`npm run deploy`.

## Project structure

```
src/
├── app/                  Routes only (Expo Router). Screens compose features; no data access here.
│   ├── _layout.tsx       Root stack + auth route guards (Stack.Protected)
│   ├── (tabs)/           Home, Activity, Profile. Native tabs on iOS/Android, custom bar on web
│   ├── sign-in.tsx
│   ├── sign-up.tsx
│   └── complete-profile.tsx
├── features/             Business logic, grouped by domain
│   ├── auth/             AuthProvider (session state), auth service, Google sign-in,
│   │                     password rules, error messages, auth screen components
│   ├── member/           members/{uid}: types, service, phone rules, profile components
│   └── rewards/          Points rules, transaction history service + hook, points/QR cards,
│                         "+42 points" banner
├── components/
│   ├── ui/               Generic building blocks: Button, TextButton, TextField, FormError
│   └── BrandHeader.tsx
├── navigation/           Tab list (single source for every platform) and the web tab bar
├── hooks/                App-wide hooks (useIsWide)
├── lib/                  Firebase clients, error helpers
└── theme/                Color tokens (shared with tailwind.config.js)

functions/src/            Cloud Functions: deleteAccount, and the POS-only lookupMember,
                          earnPoints, redeemPoints, reverseOrder
```

### Conventions

- **Imports:** use the `@/` alias (`@/features/auth/AuthProvider`) across folders, and
  relative imports inside a feature.
- **Dependencies point inward:** `app/` → `features/` → `components/`, `lib/`, `theme/`.
  `components/ui` never imports from `features/`.
- **Firestore access lives in `*Service.ts` files.** Screens and components call services
  or hooks, never the Firebase SDK directly.
- **Colors:** use Tailwind classes (`bg-brand`, `text-zinc-500`). Where a raw value is
  needed (spinners, SVG, navigation theme), import from `@/theme/colors`.
- **Platform code:** use a `.web.ts` file for different implementations
  (`googleSignIn.web.ts`), and `Platform.OS` for small differences.
- **Business rules are duplicated on purpose** between `src/features/rewards/rewards.ts`
  and `functions/src/shared.ts`. The functions are the source of truth, so change both together.

## Data model

```
members/{uid}                      name, email, phone, points, createdAt
members/{uid}/transactions/{id}    earn_<orderId> | redeem_<orderId> | reverse_<orderId>
phoneNumbers/{phone}               uid (one phone per member, used for POS lookup)
```

Points only change through Cloud Functions. See [PLAN.md](PLAN.md) for the full design,
decisions and roadmap.
