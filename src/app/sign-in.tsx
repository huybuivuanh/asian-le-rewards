import { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton } from "@/components/primary-button";
import { useAuth } from "@/providers/auth-provider";
import { colors } from "@/theme/colors";
import { formatPhone, isValidPhone, phoneDigits, toE164 } from "@/utils/phone";

export default function SignInScreen() {
  const { sendCode } = useAuth();
  const insets = useSafeAreaInsets();
  const [digits, setDigits] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = isValidPhone(digits);

  const submit = async () => {
    if (!valid || loading) return;
    setError(null);
    setLoading(true);
    try {
      await sendCode(toE164(digits));
      router.push("/verify");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't send the code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.systemBackground }}
      contentContainerStyle={{
        paddingTop: insets.top + 48,
        paddingBottom: insets.bottom + 24,
        paddingHorizontal: 24,
        gap: 32,
        width: "100%",
        maxWidth: 440,
        alignSelf: "center",
      }}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <View style={{ alignItems: "center", gap: 12 }}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={{ width: 56, height: 104 }}
          contentFit="contain"
          accessibilityLabel="Asian Le logo"
        />
        <Text style={{ fontSize: 28, fontWeight: "700", color: colors.label }}>Asian Le Rewards</Text>
        <Text style={{ fontSize: 16, color: colors.secondaryLabel, textAlign: "center" }}>
          Earn points every time you eat with us.
        </Text>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 15, fontWeight: "600", color: colors.label }}>Phone number</Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            height: 52,
            paddingHorizontal: 16,
            gap: 10,
            borderRadius: 14,
            borderCurve: "continuous",
            backgroundColor: colors.fieldBackground,
            borderWidth: error ? 1 : 0,
            borderColor: colors.error,
          }}
        >
          <Text style={{ fontSize: 17, color: colors.secondaryLabel }}>+1</Text>
          <View style={{ width: 1, height: 22, backgroundColor: colors.separator }} />
          <TextInput
            value={formatPhone(digits)}
            onChangeText={(text) => {
              setDigits(phoneDigits(text));
              if (error) setError(null);
            }}
            onSubmitEditing={submit}
            placeholder="(604) 555-1234"
            placeholderTextColor={colors.tertiaryLabel}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoComplete="tel"
            returnKeyType="done"
            autoFocus
            editable={!loading}
            accessibilityLabel="Phone number"
            style={{ flex: 1, fontSize: 17, color: colors.label, height: "100%" }}
          />
        </View>
        {error ? (
          <Text selectable style={{ fontSize: 14, color: colors.error }}>
            {error}
          </Text>
        ) : (
          <Text style={{ fontSize: 13, color: colors.secondaryLabel }}>
            We'll text you a 6-digit code. Message and data rates may apply.
          </Text>
        )}
      </View>

      <PrimaryButton title="Send code" onPress={submit} disabled={!valid} loading={loading} />
    </ScrollView>
  );
}
