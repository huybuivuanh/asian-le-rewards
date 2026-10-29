// Shown when someone is signed in but has no member doc (sign-up was interrupted
// between creating the login and saving the member).
import { useState } from "react";
import { Keyboard, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { TextButton } from "@/components/ui/TextButton";
import { TextField } from "@/components/ui/TextField";
import { authErrorMessage, isPhoneError } from "@/features/auth/authErrors";
import { useAuth } from "@/features/auth/AuthProvider";
import { AuthScreen } from "@/features/auth/components/AuthScreen";
import { PhoneField } from "@/features/member/components/PhoneField";
import { createMember } from "@/features/member/memberService";
import { normalizePhone, PHONE_ERROR } from "@/features/member/phone";

export default function CompleteProfileScreen() {
  const { user, logout } = useAuth();
  // Google sign-ins come with a name; the customer can still change it.
  const [name, setName] = useState(user?.displayName ?? "");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneInvalid, setPhoneInvalid] = useState(false);

  const canSubmit = name.trim().length > 0 && phone.trim().length > 0 && !loading;

  const submit = async () => {
    if (!canSubmit || !user) return;
    Keyboard.dismiss();
    if (!normalizePhone(phone)) {
      setError(PHONE_ERROR);
      setPhoneInvalid(true);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      // The live member listener picks this up and the route guard moves on.
      await createMember(user, { name, phone });
    } catch (e) {
      setError(authErrorMessage(e, "Couldn't save your details. Please try again."));
      setPhoneInvalid(isPhoneError(e));
      setLoading(false);
    }
  };

  const edit = (setter: (v: string) => void) => (text: string) => {
    setter(text);
    if (error) setError(null);
    setPhoneInvalid(false);
  };

  return (
    <AuthScreen subtitle="Almost done. Add your details to finish creating your account.">
      <View className="gap-4">
        {user?.email && (
          <Text selectable className="text-[15px] text-zinc-500">
            Signed in as {user.email}
          </Text>
        )}
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
          returnKeyType="go"
          onSubmitEditing={submit}
          editable={!loading}
        />

        <FormError message={error} />
      </View>

      <Button title="Finish" onPress={submit} disabled={!canSubmit} loading={loading} />

      <TextButton
        title="Sign out"
        tone="muted"
        onPress={logout}
        disabled={loading}
        className="self-center"
      />
    </AuthScreen>
  );
}
