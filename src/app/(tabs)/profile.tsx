import { useState } from "react";
import { ScrollView, Text } from "react-native";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/AuthProvider";
import { DeleteAccountSection } from "@/features/member/components/DeleteAccountSection";
import { MemberDetailsCard } from "@/features/member/components/MemberDetailsCard";

export default function ProfileScreen() {
  const { member, logout, deleteAccount } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!member) return null;

  const signOut = async () => {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerClassName="w-full max-w-[640px] self-center gap-6 px-6 pb-10 pt-6"
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text className="text-[28px] font-bold text-zinc-950">Profile</Text>

      <MemberDetailsCard member={member} />

      <Button
        variant="secondary"
        title="Sign out"
        onPress={signOut}
        loading={signingOut}
        disabled={deleting}
      />

      <DeleteAccountSection
        points={member.points}
        onDelete={deleteAccount}
        disabled={signingOut}
        onBusyChange={setDeleting}
      />
    </ScrollView>
  );
}
