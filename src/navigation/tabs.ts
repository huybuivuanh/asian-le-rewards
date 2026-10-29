// The app's tabs, in order. Both the native tab bar and the web tab bar
// are built from this list, so add or rename tabs here only.
// - sf: SF Symbol (iOS)
// - md: Material icon (Android)
// - svg: the same Material icon as a 24×24 path (web)
export const TABS = [
  {
    name: "index",
    label: "Home",
    sf: "house.fill",
    md: "home",
    svg: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
  },
  {
    name: "activity",
    label: "Activity",
    sf: "clock.arrow.circlepath",
    md: "history",
    svg: "M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z",
  },
  {
    name: "profile",
    label: "Profile",
    sf: "person.crop.circle.fill",
    md: "person",
    svg: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  },
] as const;
