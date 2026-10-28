import { useState } from "react";
import { ScrollView, Text } from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { PrimaryButton } from "@/ui/PrimaryButton";

// Placeholder home — points and QR code come next.
export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerClassName="gap-4 p-6 pt-20"
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text className="text-[28px] font-bold text-zinc-950">Welcome</Text>
      <Text selectable className="text-base text-zinc-500">
        Signed in as {user?.email}
      </Text>
      <PrimaryButton
        title="Sign out"
        loading={signingOut}
        onPress={async () => {
          setSigningOut(true);
          try {
            await logout();
          } finally {
            setSigningOut(false);
          }
        }}
      />
    </ScrollView>
  );
}
