import { useAuth } from "@/providers/AuthProvider";
import { BrandHeader } from "@/ui/BrandHeader";
import { GoogleButton, OrDivider } from "@/ui/GoogleButton";
import { PrimaryButton } from "@/ui/PrimaryButton";
import { PhoneField } from "@/ui/PhoneField";
import { TextField } from "@/ui/TextField";
import { authErrorMessage, isPhoneError } from "@/utils/authErrors";
import { MIN_PASSWORD, PASSWORD_HINT, passwordError } from "@/utils/password";
import { normalizePhone, PHONE_ERROR } from "@/utils/phone";
import { Link } from "expo-router";
import { useState } from "react";
import { Keyboard, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Turns the password hint red when the password is what failed.
  const [passwordInvalid, setPasswordInvalid] = useState(false);
  const [phoneInvalid, setPhoneInvalid] = useState(false);

  const canSubmit =
    name.trim().length > 0 &&
    phone.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length > 0 &&
    confirm.length > 0 &&
    !loading &&
    !googleBusy;

  const submit = async () => {
    if (!canSubmit) return;
    Keyboard.dismiss();
    if (!normalizePhone(phone)) {
      setError(PHONE_ERROR);
      setPhoneInvalid(true);
      return;
    }
    const weak = passwordError(password);
    if (weak) {
      setError(weak);
      setPasswordInvalid(true);
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
      await signUp({ name, phone, email, password });
    } catch (e) {
      setError(
        authErrorMessage(e, "Couldn't create your account. Please try again."),
      );
      setPhoneInvalid(isPhoneError(e));
      setLoading(false);
    }
  };

  const edit = (setter: (v: string) => void) => (text: string) => {
    setter(text);
    if (error) setError(null);
    setPasswordInvalid(false);
    setPhoneInvalid(false);
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerClassName="w-full max-w-[440px] grow justify-center self-center gap-8 px-6"
      contentContainerStyle={{
        paddingTop: insets.top + 24,
        paddingBottom: insets.bottom + 24,
      }}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <BrandHeader subtitle="Create an account and start earning points." />

      <View className="gap-4">
        {/* Google sign-up asks for name + phone afterwards on complete-profile. */}
        <GoogleButton
          disabled={loading}
          onBusyChange={setGoogleBusy}
          onError={(message) => {
            setPasswordInvalid(false);
            setError(message);
          }}
        />
        <OrDivider />
        <TextField
          label="Name"
          value={name}
          onChangeText={edit(setName)}
          autoCapitalize="words"
          textContentType="name"
          autoComplete="name"
          returnKeyType="next"
          editable={!loading}
        />
        <PhoneField
          value={phone}
          onChangeText={edit(setPhone)}
          invalid={phoneInvalid}
          returnKeyType="next"
          editable={!loading}
        />
        <TextField
          label="Email"
          value={email}
          onChangeText={edit(setEmail)}
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
          textContentType="newPassword"
          autoComplete="new-password"
          // iOS strong-password suggestions follow the same rules.
          passwordRules={`minlength: ${MIN_PASSWORD}; required: upper; required: digit; required: special;`}
          returnKeyType="next"
          hint={PASSWORD_HINT}
          invalid={passwordInvalid}
          editable={!loading}
        />
        <TextField
          label="Confirm password"
          password
          value={confirm}
          onChangeText={edit(setConfirm)}
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
