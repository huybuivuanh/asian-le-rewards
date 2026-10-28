import { useEffect, useState } from "react";
import { Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Redirect, router } from "expo-router";
import { PrimaryButton } from "@/components/primary-button";
import { MOCK_CODE } from "@/lib/auth-service";
import { useAuth } from "@/providers/auth-provider";
import { formatPhone, phoneDigits } from "@/utils/phone";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function VerifyScreen() {
  const { pending, sendCode, verifyCode } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  // Opened directly (e.g. web refresh) without a code in flight.
  if (!pending) return <Redirect href="/sign-in" />;

  const submit = async (value: string) => {
    if (value.length !== CODE_LENGTH || loading) return;
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      // On success the protected route guard moves to the app automatically.
      await verifyCode(value);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't verify the code. Please try again.");
      setCode("");
      setLoading(false);
    }
  };

  const resend = async () => {
    setError(null);
    setNotice(null);
    setResending(true);
    try {
      await sendCode(pending.phone);
      setCode("");
      setSeconds(RESEND_SECONDS);
      setNotice("A new code is on its way.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't resend the code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-black"
      contentContainerClassName="w-full max-w-[440px] self-center gap-7 p-6"
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <View className="gap-1.5">
        <Text className="text-base text-zinc-500 dark:text-zinc-400">We texted a code to</Text>
        <View className="flex-row flex-wrap items-center gap-3">
          <Text selectable className="text-[17px] font-semibold text-zinc-950 dark:text-zinc-50">
            +1 {formatPhone(phoneDigits(pending.phone))}
          </Text>
          <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8}>
            <Text className="text-[15px] font-semibold text-brand">Change</Text>
          </Pressable>
        </View>
      </View>

      <View className="gap-2">
        <TextInput
          value={code}
          onChangeText={(text) => {
            const next = text.replace(/\D/g, "").slice(0, CODE_LENGTH);
            setCode(next);
            if (error) setError(null);
            if (next.length === CODE_LENGTH) submit(next);
          }}
          placeholder="••••••"
          placeholderTextColor="#A1A1AA"
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete={Platform.select({ android: "sms-otp", default: "one-time-code" })}
          maxLength={CODE_LENGTH}
          autoFocus
          editable={!loading}
          accessibilityLabel="6-digit verification code"
          className={`h-16 rounded-2xl bg-zinc-100 text-center text-[28px] font-semibold tracking-[12px] text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50 ${
            error ? "border border-red-600 dark:border-red-400" : ""
          }`}
          style={{ borderCurve: "continuous", fontVariant: ["tabular-nums"] }}
        />
        {error ? (
          <Text selectable className="text-sm text-red-600 dark:text-red-400">
            {error}
          </Text>
        ) : notice ? (
          <Text className="text-sm text-zinc-500 dark:text-zinc-400">{notice}</Text>
        ) : null}
        {__DEV__ && (
          <Text className="text-[13px] text-zinc-400 dark:text-zinc-500">
            Test mode: use code {MOCK_CODE}
          </Text>
        )}
      </View>

      <PrimaryButton
        title="Verify"
        onPress={() => submit(code)}
        disabled={code.length !== CODE_LENGTH}
        loading={loading}
      />

      <View className="items-center">
        {seconds > 0 ? (
          <Text
            className="text-[15px] text-zinc-500 dark:text-zinc-400"
            style={{ fontVariant: ["tabular-nums"] }}
          >
            Resend code in {seconds}s
          </Text>
        ) : (
          <Pressable accessibilityRole="button" onPress={resend} disabled={resending} hitSlop={8}>
            <Text className={`text-[15px] font-semibold text-brand ${resending ? "opacity-50" : ""}`}>
              {resending ? "Sending…" : "Resend code"}
            </Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}
