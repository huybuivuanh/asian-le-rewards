import { signUp } from "@/services/authService";
import { PrimaryButton } from "@/ui/PrimaryButton";
import { TextField } from "@/ui/TextField";
import { authErrorMessage } from "@/utils/authErrors";
import { Link } from "expo-router";
import { useState } from "react";
import { Keyboard, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MIN_PASSWORD = 9; // Firebase's default minimum

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    email.trim().length > 0 &&
    password.length > 0 &&
    confirm.length > 0 &&
    !loading;

  const submit = async () => {
    if (!canSubmit) return;
    Keyboard.dismiss();
    if (password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      // Creating the account also signs in; the route guard moves to the app.
      await signUp(email, password);
    } catch (e) {
      setError(
        authErrorMessage(e, "Couldn't create your account. Please try again."),
      );
      setLoading(false);
    }
  };

  const edit = (setter: (v: string) => void) => (text: string) => {
    setter(text);
    if (error) setError(null);
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerClassName="w-full max-w-[440px] self-center gap-8 px-6"
      contentContainerStyle={{
        paddingTop: insets.top + 48,
        paddingBottom: insets.bottom + 24,
      }}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <View className="gap-2">
        <Text className="text-[28px] font-bold text-zinc-950">
          Create an account
        </Text>
        <Text className="text-base text-zinc-500">
          Join Asian Le Rewards and start earning points.
        </Text>
      </View>

      <View className="gap-4">
        <TextField
          label="Email"
          value={email}
          onChangeText={edit(setEmail)}
          placeholder="you@example.com"
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          returnKeyType="next"
          editable={!loading}
        />
        <TextField
          label="Password"
          password
          value={password}
          onChangeText={edit(setPassword)}
          placeholder={`At least ${MIN_PASSWORD} characters`}
          textContentType="newPassword"
          autoComplete="new-password"
          returnKeyType="next"
          editable={!loading}
        />
        <TextField
          label="Confirm password"
          password
          value={confirm}
          onChangeText={edit(setConfirm)}
          placeholder="Type it again"
          textContentType="newPassword"
          autoComplete="new-password"
          returnKeyType="go"
          onSubmitEditing={submit}
          editable={!loading}
        />

        {error && (
          <Text
            selectable
            className="text-sm text-red-600"
            accessibilityRole="alert"
          >
            {error}
          </Text>
        )}
      </View>

      <PrimaryButton
        title="Create account"
        onPress={submit}
        disabled={!canSubmit}
        loading={loading}
      />

      <View className="flex-row justify-center gap-1.5">
        <Text className="text-[15px] text-zinc-500">Already a member?</Text>
        <Link href="/sign-in" replace>
          <Text className="text-[15px] font-semibold text-brand">Sign in</Text>
        </Link>
      </View>
    </ScrollView>
  );
}
