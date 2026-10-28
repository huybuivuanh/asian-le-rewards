import { useState } from "react";
import { ScrollView, Text } from "react-native";
import { PrimaryButton } from "@/components/primary-button";
import { useAuth } from "@/providers/auth-provider";
import { formatPhone, phoneDigits } from "@/utils/phone";

// Placeholder home — points and QR code come next.
export default function HomeScreen() {
  const { session, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-black"
      contentContainerClassName="gap-4 p-6 pt-20"
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text className="text-[28px] font-bold text-zinc-950 dark:text-zinc-50">Welcome</Text>
      <Text selectable className="text-base text-zinc-500 dark:text-zinc-400">
        Signed in as +1 {formatPhone(phoneDigits(session?.phone ?? ""))}
      </Text>
      <PrimaryButton
        title="Sign out"
        loading={signingOut}
        onPress={async () => {
          setSigningOut(true);
          await signOut();
        }}
      />
    </ScrollView>
  );
}
