import { Image } from "expo-image";
import { Text, View } from "react-native";

// The logo is tall (56×104), so it stands a little taller than the text.
const SIZES = {
  large: { text: "text-[28px]", gap: "gap-1.5", logo: { width: 28, height: 52 } },
  small: { text: "text-[20px]", gap: "gap-1", logo: { width: 20, height: 37 } },
};

type Props = {
  /** large: sign-in flow screens. small: the web header. */
  size?: keyof typeof SIZES;
};

/** "Asian [logo] Le Rewards", the app's wordmark. */
export function BrandTitle({ size = "large" }: Props) {
  const s = SIZES[size];
  return (
    <View
      className={`flex-row items-center ${s.gap}`}
      accessible
      accessibilityRole="header"
      accessibilityLabel="Asian Le Rewards"
    >
      <Text className={`${s.text} font-bold text-zinc-950`}>Asian</Text>
      <Image
        source={require("../../assets/images/logo.png")}
        style={s.logo}
        contentFit="contain"
      />
      <Text className={`${s.text} font-bold text-zinc-950`}>Le Rewards</Text>
    </View>
  );
}
