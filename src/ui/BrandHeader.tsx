import { Text, View } from "react-native";
import { Image } from "expo-image";

// "Asian [logo] Le Rewards" title with a subtitle, used on the sign-in and sign-up screens.
export function BrandHeader({ subtitle }: { subtitle: string }) {
  return (
    <View className="items-center gap-3">
      <View
        className="flex-row items-center gap-1.5"
        accessible
        accessibilityRole="header"
        accessibilityLabel="Asian Le Rewards"
      >
        <Text className="text-[28px] font-bold text-zinc-950">Asian</Text>
        {/* Logo is tall (56×104), so it stands a little taller than the text */}
        <Image
          source={require("../../assets/images/logo.png")}
          style={{ width: 28, height: 52 }}
          contentFit="contain"
        />
        <Text className="text-[28px] font-bold text-zinc-950">Le Rewards</Text>
      </View>
      <Text className="text-center text-base text-zinc-500">{subtitle}</Text>
    </View>
  );
}
