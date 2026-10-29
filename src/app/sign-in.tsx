import { useState } from "react";
import { Keyboard, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { TextButton } from "@/components/ui/TextButton";
import { TextField } from "@/components/ui/TextField";
import { authErrorMessage } from "@/features/auth/authErrors";
import { resetPassword, signIn } from "@/features/auth/authService";
import { AuthScreen } from "@/features/auth/components/AuthScreen";
import { AuthSwitchLink } from "@/features/auth/components/AuthSwitchLink";
import { GoogleButton } from "@/features/auth/components/GoogleButton";
import { OrDivider } from "@/features/auth/components/OrDivider";

export default function SignInScreen() {
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
    <AuthScreen subtitle="Earn points every time you eat with us.">
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
          <FormError message={error} />
        ) : notice ? (
          <Text className="text-sm text-zinc-500">{notice}</Text>
        ) : null}

        <TextButton title="Forgot password?" onPress={forgotPassword} className="self-end" />
      </View>

      <Button title="Sign in" onPress={submit} disabled={!canSubmit} loading={loading} />

      <AuthSwitchLink prompt="New here?" linkText="Create an account" href="/sign-up" />
    </AuthScreen>
  );
}
