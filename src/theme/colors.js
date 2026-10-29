// Raw color values for places that can't use Tailwind classes (ActivityIndicator,
// SVG fills, navigation theme). CommonJS so tailwind.config.js can share it.
// The zinc values match Tailwind's zinc scale.
const colors = {
  brand: "#DA251D", // red from the Asian Le logo
  white: "#FFFFFF",
  text: "#18181B", // zinc-900
  muted: "#71717A", // zinc-500
  placeholder: "#A1A1AA", // zinc-400
};

module.exports = { colors };
