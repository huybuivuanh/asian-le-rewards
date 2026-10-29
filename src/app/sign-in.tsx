import { useState } from "react";
import { Keyboard, Pressable, ScrollView, Text, View } from "react-native";
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { resetPassword, signIn } from "@/services/authService";
import { BrandHeader } from "@/ui/BrandHeader";
import { GoogleButton, OrDivider } from "@/ui/GoogleButton";
import { PrimaryButton } from "@/ui/PrimaryButton";
import { TextField } from "@/ui/TextField";
import { authErrorMessage } from "@/utils/authErrors";

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading && !googleBusy;

  const clearMessages = () => {
    setError(null);
    setNotice(null);
  };

  const submit = async () => {
    if (!canSubmit) return;
    Keyboard.dismiss();
    clearMessages();
    setLoading(true);
    try {
      // On success the protected route guard moves to the app automatically.
      await signIn(email, password);
    } catch (e) {
      setError(authErrorMessage(e, "Sign in failed. Please try again."));
      setLoading(false);
    }
  };

  const forgotPassword = async () => {
    clearMessages();
    if (!email.trim()) {
      setError("Enter your email above, then tap Forgot password.");
      return;
    }
    try {
      await resetPassword(email);
      setNotice(`If an account exists for ${email.trim()}, we sent a link to reset the password.`);
    } catch (e) {
      setError(authErrorMessage(e, "Couldn't send the reset email. Please try again."));
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerClassName="w-full max-w-[440px] grow justify-center self-center gap-8 px-6"
      contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <BrandHeader subtitle="Earn points every time you eat with us." />

      <View className="gap-4">
        <GoogleButton
          disabled={loading}
          onBusyChange={setGoogleBusy}
          onError={(message) => {
            setNotice(null);
            setError(message);
          }}
        />
        <OrDivider />
        <TextField
          label="Email"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            clearMessages();
          }}
          placeholder="you@example.com"
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          returnKeyType="next"
          editable={!loading}
          invalid={!!error}
        />
        <TextField
          label="Password"
          password
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            clearMessages();
          }}
          placeholder="••••••••"
          textContentType="password"
          autoComplete="current-password"
          returnKeyType="go"
          onSubmitEditing={submit}
          editable={!loading}
          invalid={!!error}
        />

        {error ? (
          <Text selectable className="text-sm text-red-600" accessibilityRole="alert">
            {error}
          </Text>
        ) : notice ? (
          <Text className="text-sm text-zinc-500">{notice}</Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={forgotPassword}
          hitSlop={8}
          className="self-end"
        >
          <Text className="text-[15px] font-semibold text-brand">Forgot password?</Text>
        </Pressable>
      </View>

      <PrimaryButton title="Sign in" onPress={submit} disabled={!canSubmit} loading={loading} />

      <View className="flex-row justify-center gap-1.5">
        <Text className="text-[15px] text-zinc-500">New here?</Text>
        <Link href="/sign-up" replace>
          <Text className="text-[15px] font-semibold text-brand">Create an account</Text>
        </Link>
      </View>
    </ScrollView>
  );
}
