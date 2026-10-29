import { Image } from "expo-image";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { authErrorMessage } from "../authErrors";
import { signInWithGoogle } from "../authService";

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
    <Button
      variant="secondary"
      title="Continue with Google"
      accessibilityLabel="Continue with Google"
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      icon={
        <Image
          source={require("../../../../assets/images/google.svg")}
          style={{ width: 20, height: 20 }}
        />
      }
    />
  );
}
