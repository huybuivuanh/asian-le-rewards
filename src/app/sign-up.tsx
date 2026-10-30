import { useState } from "react";
import { Keyboard, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { TextField } from "@/components/ui/TextField";
import { authErrorMessage, isPhoneError } from "@/features/auth/authErrors";
import { useAuth } from "@/features/auth/AuthProvider";
import { AuthScreen } from "@/features/auth/components/AuthScreen";
import { AuthSwitchLink } from "@/features/auth/components/AuthSwitchLink";
import { GoogleButton } from "@/features/auth/components/GoogleButton";
import { OrDivider } from "@/features/auth/components/OrDivider";
import { MIN_PASSWORD, PASSWORD_HINT, passwordError } from "@/features/auth/password";
import { PhoneField } from "@/features/member/components/PhoneField";
import { normalizePhone, PHONE_ERROR } from "@/features/member/phone";
import { WELCOME_BONUS_MIN_SUBTOTAL, WELCOME_BONUS_POINTS } from "@/features/rewards/rewards";

export default function SignUpScreen() {
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
      setError(authErrorMessage(e, "Couldn't create your account. Please try again."));
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
    <AuthScreen
      subtitle={`Sign up and get ${WELCOME_BONUS_POINTS} bonus points with your first $${WELCOME_BONUS_MIN_SUBTOTAL}+ order.`}
    >
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

        <FormError message={error} />
      </View>

      <Button title="Create account" onPress={submit} disabled={!canSubmit} loading={loading} />

      <AuthSwitchLink prompt="Already a member?" linkText="Sign in" href="/sign-in" />
    </AuthScreen>
  );
}
