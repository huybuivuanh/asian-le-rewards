const { colors } = require("./src/theme/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  presets: [require("nativewind/preset")],
  // App is light only (no dark: classes). "class" instead of the default "media"
  // because NativeWind 4 throws on web with "media".
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: colors.brand,
        ink: colors.ink,
        "ink-raised": colors.inkRaised,
        "ink-line": colors.inkLine,
        "on-ink": colors.onInk,
        "on-ink-muted": colors.onInkMuted,
        gold: colors.gold,
      },
    },
  },
  plugins: [],
};
