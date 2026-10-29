import { Text, View } from "react-native";
import { BrandTitle } from "./BrandTitle";

// "Asian [logo] Le Rewards" title with a subtitle, used on the sign-in flow screens.
export function BrandHeader({ subtitle }: { subtitle: string }) {
  return (
    <View className="items-center gap-3">
      <BrandTitle />
      <Text className="text-center text-base text-zinc-500">{subtitle}</Text>
    </View>
  );
}
