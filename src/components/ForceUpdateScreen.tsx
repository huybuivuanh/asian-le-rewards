import { Linking, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";

/** Blocks the app until the customer installs the required version. */
export function ForceUpdateScreen({ updateUrl }: { updateUrl?: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-white px-8">
      <Text className="mb-2 text-center text-xl font-bold text-zinc-900">
        Update Required
      </Text>
      <Text className="mb-6 text-center text-base text-zinc-500">
        A new version of this app is required to continue. Please update to
        keep using it.
      </Text>
      {updateUrl && (
        <View className="w-full max-w-sm">
          <Button title="Update Now" onPress={() => Linking.openURL(updateUrl)} />
        </View>
      )}
    </View>
  );
}
