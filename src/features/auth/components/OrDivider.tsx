import { Text, View } from "react-native";

/** "or" line between the Google button and the email form. */
export function OrDivider() {
  return (
    <View className="flex-row items-center gap-3">
      <View className="h-px flex-1 bg-zinc-200" />
      <Text className="text-[13px] text-zinc-500">or</Text>
      <View className="h-px flex-1 bg-zinc-200" />
    </View>
  );
}
