/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  presets: [require("nativewind/preset")],
  // "class" instead of the default "media": NativeWind 4 throws on web with "media".
  // Native still follows the system; on web, useWebDarkClass() mirrors it.
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
