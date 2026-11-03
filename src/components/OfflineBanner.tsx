import { useNetInfo } from "@react-native-community/netinfo";
import { Modal, Text, View } from "react-native";

// Full-screen notice while the device is offline. Same behavior as the POS app:
// it blocks the app and disappears on its own once the connection returns.
export function OfflineBanner() {
  const { isConnected } = useNetInfo();

  // null = still checking; treat as online so it doesn't flash on launch.
  if (isConnected !== false) return null;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <View className="flex-1 bg-black/45 justify-center items-center px-8">
        <View className="w-full max-w-sm rounded-2xl bg-white px-8 py-7 items-center border border-zinc-200 shadow-lg">
          <Text className="text-base font-semibold text-zinc-900 text-center">
            No Internet Connection
          </Text>
          <Text className="mt-2 text-sm text-zinc-500 text-center">
            Check your connection. The app will resume automatically when
            restored.
          </Text>
        </View>
      </View>
    </Modal>
  );
}
