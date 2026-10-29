import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { formatPhone } from "@/utils/phone";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="gap-0.5 py-3.5">
      <Text className="text-[13px] text-zinc-500">{label}</Text>
      <Text selectable className="text-[17px] text-zinc-950">
        {value}
      </Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { member, logout, deleteAccount } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  // Delete asks for confirmation in place (no pop-up, so it works on web too).
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!member) return null;

  const signOut = async () => {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      setSigningOut(false);
    }
  };

  const confirmDelete = async () => {
    setError(null);
    setDeleting(true);
    try {
      // Signs out when done; the route guard then shows sign-in.
      await deleteAccount();
    } catch (e) {
      if (__DEV__) console.warn("[delete account]", e);
      setError("Couldn't delete your account. Check your connection and try again.");
      setDeleting(false);
    }
  };

  const busy = signingOut || deleting;

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerClassName="w-full max-w-[640px] self-center gap-6 px-6 pb-10 pt-6"
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text className="text-[28px] font-bold text-zinc-950">Profile</Text>

      <View className="rounded-3xl bg-zinc-100 px-5" style={{ borderCurve: "continuous" }}>
        <InfoRow label="Name" value={member.name} />
        <View className="h-px bg-zinc-200" />
        <InfoRow label="Phone number" value={formatPhone(member.phone)} />
        <View className="h-px bg-zinc-200" />
        <InfoRow label="Email" value={member.email} />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={signOut}
        disabled={busy}
        className={`h-[52px] items-center justify-center rounded-2xl border border-zinc-300 active:bg-zinc-50 ${
          busy ? "opacity-40" : ""
        }`}
        style={{ borderCurve: "continuous" }}
      >
        {signingOut ? (
          <ActivityIndicator color="#18181B" />
        ) : (
          <Text className="text-[17px] font-semibold text-zinc-950">Sign out</Text>
        )}
      </Pressable>

      {confirmingDelete ? (
        <View
          className="gap-4 rounded-3xl border border-red-200 bg-red-50 p-5"
          style={{ borderCurve: "continuous" }}
        >
          <View className="gap-1">
            <Text className="text-[17px] font-semibold text-red-700">Delete your account?</Text>
            <Text className="text-[15px] text-zinc-700">
              This permanently deletes your account, your {member.points.toLocaleString()} points
              and your activity. This can{"’"}t be undone.
            </Text>
          </View>

          {error && (
            <Text selectable className="text-sm text-red-600" accessibilityRole="alert">
              {error}
            </Text>
          )}

          <Pressable
            accessibilityRole="button"
            onPress={confirmDelete}
            disabled={deleting}
            className={`h-[52px] items-center justify-center rounded-2xl bg-red-600 active:opacity-80 ${
              deleting ? "opacity-60" : ""
            }`}
            style={{ borderCurve: "continuous" }}
          >
            {deleting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-[17px] font-semibold text-white">Delete my account</Text>
            )}
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setConfirmingDelete(false);
              setError(null);
            }}
            disabled={deleting}
            className="self-center"
            hitSlop={8}
          >
            <Text className="text-[15px] font-semibold text-zinc-500">Cancel</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={() => setConfirmingDelete(true)}
          disabled={busy}
          className="self-center"
          hitSlop={8}
        >
          <Text className="text-[15px] font-semibold text-red-600">Delete account</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}
