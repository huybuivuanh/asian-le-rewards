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
        // Red from the Asian Le logo
        brand: "#DA251D",
      },
    },
  },
  plugins: [],
};
