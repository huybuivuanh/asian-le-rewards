import { useEffect, useState } from "react";
import { Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Redirect, router } from "expo-router";
import { PrimaryButton } from "@/components/primary-button";
import { MOCK_CODE } from "@/lib/auth-service";
import { useAuth } from "@/providers/auth-provider";
import { colors } from "@/theme/colors";
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
      style={{ flex: 1, backgroundColor: colors.systemBackground }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        padding: 24,
        gap: 28,
        width: "100%",
        maxWidth: 440,
        alignSelf: "center",
      }}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 16, color: colors.secondaryLabel }}>We texted a code to</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <Text selectable style={{ fontSize: 17, fontWeight: "600", color: colors.label }}>
            +1 {formatPhone(phoneDigits(pending.phone))}
          </Text>
          <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8}>
            <Text style={{ fontSize: 15, color: colors.brand, fontWeight: "600" }}>Change</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <TextInput
          value={code}
          onChangeText={(text) => {
            const next = text.replace(/\D/g, "").slice(0, CODE_LENGTH);
            setCode(next);
            if (error) setError(null);
            if (next.length === CODE_LENGTH) submit(next);
          }}
          placeholder="••••••"
          placeholderTextColor={colors.tertiaryLabel}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete={Platform.select({ android: "sms-otp", default: "one-time-code" })}
          maxLength={CODE_LENGTH}
          autoFocus
          editable={!loading}
          accessibilityLabel="6-digit verification code"
          style={{
            height: 64,
            borderRadius: 14,
            borderCurve: "continuous",
            backgroundColor: colors.fieldBackground,
            borderWidth: error ? 1 : 0,
            borderColor: colors.error,
            textAlign: "center",
            fontSize: 28,
            fontWeight: "600",
            letterSpacing: 12,
            fontVariant: ["tabular-nums"],
            color: colors.label,
          }}
        />
        {error ? (
          <Text selectable style={{ fontSize: 14, color: colors.error }}>
            {error}
          </Text>
        ) : notice ? (
          <Text style={{ fontSize: 14, color: colors.secondaryLabel }}>{notice}</Text>
        ) : null}
        {__DEV__ && (
          <Text style={{ fontSize: 13, color: colors.tertiaryLabel }}>
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

      <View style={{ alignItems: "center" }}>
        {seconds > 0 ? (
          <Text style={{ fontSize: 15, color: colors.secondaryLabel, fontVariant: ["tabular-nums"] }}>
            Resend code in {seconds}s
          </Text>
        ) : (
          <Pressable accessibilityRole="button" onPress={resend} disabled={resending} hitSlop={8}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: colors.brand,
                opacity: resending ? 0.5 : 1,
              }}
            >
              {resending ? "Sending…" : "Resend code"}
            </Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}
