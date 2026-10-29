import { Image } from "expo-image";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { signInWithGoogle } from "@/services/authService";
import { authErrorMessage } from "@/utils/authErrors";

type Props = {
  disabled?: boolean;
  /** Called before signing in (with null) and with a message if it fails. */
  onError: (message: string | null) => void;
  /** Lets the screen disable its own form while Google is busy. */
  onBusyChange?: (busy: boolean) => void;
};

/** Signs in with Google. On success the route guard moves on by itself. */
export function GoogleButton({ disabled, onError, onBusyChange }: Props) {
  const [loading, setLoading] = useState(false);
  const inactive = disabled || loading;

  const setBusy = (busy: boolean) => {
    setLoading(busy);
    onBusyChange?.(busy);
  };

  const onPress = async () => {
    onError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      onError(authErrorMessage(e, "Google sign-in failed. Please try again."));
    }
    // On success this screen unmounts; resetting is harmless either way.
    setBusy(false);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      className={`h-[52px] flex-row items-center justify-center gap-3 rounded-2xl border border-zinc-300 bg-white active:bg-zinc-50 ${
        inactive ? "opacity-40" : ""
      }`}
      style={{ borderCurve: "continuous" }}
    >
      {loading ? (
        <ActivityIndicator color="#18181B" />
      ) : (
        <>
          <Image source={require("../../assets/images/google.svg")} style={{ width: 20, height: 20 }} />
          <Text className="text-[17px] font-semibold text-zinc-950">Continue with Google</Text>
        </>
      )}
    </Pressable>
  );
}

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
