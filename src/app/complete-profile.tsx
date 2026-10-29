// Shown when someone is signed in but has no member doc (sign-up was interrupted
// between creating the login and saving the member).
import { useAuth } from "@/providers/AuthProvider";
import { createMember } from "@/services/memberService";
import { BrandHeader } from "@/ui/BrandHeader";
import { PrimaryButton } from "@/ui/PrimaryButton";
import { TextField } from "@/ui/TextField";
import { authErrorMessage, isPhoneError } from "@/utils/authErrors";
import { normalizePhone, PHONE_HINT } from "@/utils/phone";
import { useState } from "react";
import { Keyboard, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CompleteProfileScreen() {
  const insets = useSafeAreaInsets();
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
      setError(`Please enter a valid phone number. ${PHONE_HINT}`);
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
      <BrandHeader subtitle="Almost done. Add your details to finish creating your account." />

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
        <TextField
          label="Phone number"
          value={phone}
          onChangeText={edit(setPhone)}
          placeholder="604 555 1234"
          invalid={phoneInvalid}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          returnKeyType="go"
          onSubmitEditing={submit}
          editable={!loading}
        />

        {error && (
          <Text selectable className="text-sm text-red-600" accessibilityRole="alert">
            {error}
          </Text>
        )}
      </View>

      <PrimaryButton title="Finish" onPress={submit} disabled={!canSubmit} loading={loading} />

      <Pressable
        accessibilityRole="button"
        onPress={logout}
        disabled={loading}
        className="self-center"
        hitSlop={8}
      >
        <Text className="text-[15px] font-semibold text-zinc-500">Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}
