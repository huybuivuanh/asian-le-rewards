import { useState } from "react";
import { ScrollView, Text } from "react-native";
import { PrimaryButton } from "@/components/primary-button";
import { useAuth } from "@/providers/auth-provider";
import { colors } from "@/theme/colors";
import { formatPhone, phoneDigits } from "@/utils/phone";

// Placeholder home — points and QR code come next.
export default function HomeScreen() {
  const { session, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.systemBackground }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 24, paddingTop: 80, gap: 16 }}
    >
      <Text style={{ fontSize: 28, fontWeight: "700", color: colors.label }}>Welcome</Text>
      <Text selectable style={{ fontSize: 16, color: colors.secondaryLabel }}>
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
