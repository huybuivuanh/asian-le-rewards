import { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton } from "@/components/primary-button";
import { useAuth } from "@/providers/auth-provider";
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
      className="flex-1 bg-white dark:bg-black"
      contentContainerClassName="w-full max-w-[440px] self-center gap-8 px-6"
      contentContainerStyle={{ paddingTop: insets.top + 48, paddingBottom: insets.bottom + 24 }}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <View className="items-center gap-3">
        <Image
          source={require("../../assets/images/logo.png")}
          style={{ width: 56, height: 104 }}
          contentFit="contain"
          accessibilityLabel="Asian Le logo"
        />
        <Text className="text-[28px] font-bold text-zinc-950 dark:text-zinc-50">
          Asian Le Rewards
        </Text>
        <Text className="text-center text-base text-zinc-500 dark:text-zinc-400">
          Earn points every time you eat with us.
        </Text>
      </View>

      <View className="gap-2">
        <Text className="text-[15px] font-semibold text-zinc-950 dark:text-zinc-50">
          Phone number
        </Text>
        <View
          className={`h-[52px] flex-row items-center gap-2.5 rounded-2xl bg-zinc-100 px-4 dark:bg-zinc-900 ${
            error ? "border border-red-600 dark:border-red-400" : ""
          }`}
          style={{ borderCurve: "continuous" }}
        >
          <Text className="text-[17px] text-zinc-500 dark:text-zinc-400">+1</Text>
          <View className="h-[22px] w-px bg-zinc-300 dark:bg-zinc-700" />
          <TextInput
            value={formatPhone(digits)}
            onChangeText={(text) => {
              setDigits(phoneDigits(text));
              if (error) setError(null);
            }}
            onSubmitEditing={submit}
            placeholder="(604) 555-1234"
            placeholderTextColor="#A1A1AA"
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoComplete="tel"
            returnKeyType="done"
            autoFocus
            editable={!loading}
            accessibilityLabel="Phone number"
            className="h-full flex-1 text-[17px] text-zinc-950 dark:text-zinc-50"
          />
        </View>
        {error ? (
          <Text selectable className="text-sm text-red-600 dark:text-red-400">
            {error}
          </Text>
        ) : (
          <Text className="text-[13px] text-zinc-500 dark:text-zinc-400">
            We'll text you a 6-digit code. Message and data rates may apply.
          </Text>
        )}
      </View>

      <PrimaryButton title="Send code" onPress={submit} disabled={!valid} loading={loading} />
    </ScrollView>
  );
}
