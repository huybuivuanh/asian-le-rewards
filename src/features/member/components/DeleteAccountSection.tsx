import { useState } from "react";
import { Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { TextButton } from "@/components/ui/TextButton";

type Props = {
  points: number;
  /** Deletes the account and signs out. Should throw if it fails. */
  onDelete: () => Promise<void>;
  /** Blocks the first "Delete account" tap, e.g. while signing out. */
  disabled?: boolean;
  /** Lets the screen disable its other actions while deleting. */
  onBusyChange?: (busy: boolean) => void;
};

/**
 * "Delete account" link that expands into an in-place confirmation
 * (no pop-up, so it works the same on web).
 */
export function DeleteAccountSection({ points, onDelete, disabled, onBusyChange }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setBusy = (busy: boolean) => {
    setDeleting(busy);
    onBusyChange?.(busy);
  };

  const confirmDelete = async () => {
    setError(null);
    setBusy(true);
    try {
      // Signs out when done; the route guard then shows sign-in.
      await onDelete();
    } catch (e) {
      if (__DEV__) console.warn("[delete account]", e);
      setError("Couldn't delete your account. Check your connection and try again.");
      setBusy(false);
    }
  };

  if (!confirming) {
    return (
      <TextButton
        title="Delete account"
        tone="danger"
        onPress={() => setConfirming(true)}
        disabled={disabled}
        className="self-center"
      />
    );
  }

  return (
    <View
      className="gap-4 rounded-3xl border border-red-200 bg-red-50 p-5"
      style={{ borderCurve: "continuous" }}
    >
      <View className="gap-1">
        <Text className="text-[17px] font-semibold text-red-700">Delete your account?</Text>
        <Text className="text-[15px] text-zinc-700">
          This permanently deletes your account, your {points.toLocaleString()} points and your
          activity. This can{"’"}t be undone.
        </Text>
      </View>

      <FormError message={error} />

      <Button variant="danger" title="Delete my account" onPress={confirmDelete} loading={deleting} />
      <TextButton
        title="Cancel"
        tone="muted"
        onPress={() => {
          setConfirming(false);
          setError(null);
        }}
        disabled={deleting}
        className="self-center"
      />
    </View>
  );
}
