import { useAuth } from "@/providers/AuthProvider";
import {
  POINTS_PER_REWARD,
  REWARD_DOLLARS,
  rewardProgress,
} from "@/utils/rewards";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

export default function HomeScreen() {
  const { member, logout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  // The route guard only shows this screen when the member doc exists.
  if (!member) return null;

  const points = member.points;
  const { rewards, intoNext, toNext } = rewardProgress(points);

  const signOut = async () => {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerClassName="w-full max-w-[440px] self-center gap-6 px-6 pb-10 pt-6"
      contentInsetAdjustmentBehavior="automatic"
    >
      <View className="gap-1">
        <Text className="text-[15px] text-zinc-500">Asian Le Rewards</Text>
        <Text className="text-[28px] font-bold text-zinc-950">
          Hi, {member.name}
        </Text>
      </View>

      {/* Points (live: updates the moment staff add points at the POS) */}
      <View
        className="gap-4 rounded-3xl bg-brand p-6"
        style={{ borderCurve: "continuous" }}
      >
        <View className="gap-1">
          <Text className="text-[15px] font-semibold text-white/80">
            Your points
          </Text>
          <Text
            className="text-[44px] font-bold text-white"
            style={{ fontVariant: ["tabular-nums"] }}
            accessibilityLabel={`${points} points`}
          >
            {points.toLocaleString()}
          </Text>
        </View>

        <View className="gap-2">
          <View
            className="h-2 overflow-hidden rounded-full bg-white/25"
            accessibilityRole="progressbar"
            accessibilityValue={{
              min: 0,
              max: POINTS_PER_REWARD,
              now: intoNext,
            }}
          >
            <View
              className="h-full rounded-full bg-white"
              style={{ width: `${(intoNext / POINTS_PER_REWARD) * 100}%` }}
            />
          </View>
          <Text className="text-[15px] text-white">
            {rewards > 0
              ? `You have ${rewards} × $${REWARD_DOLLARS} off ready. ${toNext} more points to the next one.`
              : `${toNext} more points to $${REWARD_DOLLARS} off.`}
          </Text>
        </View>
      </View>

      {/* Member QR: the uid, scanned at the POS */}
      <View
        className="items-center gap-4 rounded-3xl border border-zinc-200 p-6"
        style={{ borderCurve: "continuous" }}
      >
        <View
          accessible
          accessibilityRole="image"
          accessibilityLabel="Your member QR code"
        >
          <QRCode value={member.id} size={240} ecl="M" />
        </View>
        <View className="items-center gap-1">
          <Text className="text-center text-[17px] font-semibold text-zinc-950">
            Show this when you pay
          </Text>
        </View>
      </View>

      <Text className="text-center text-[13px] text-zinc-500">
        1 point for every $1 spent · {POINTS_PER_REWARD} points = $
        {REWARD_DOLLARS} off
      </Text>

      {/* Moves to an Account tab later (with Delete account). */}
      <Pressable
        accessibilityRole="button"
        onPress={signOut}
        disabled={signingOut}
        className="self-center"
        hitSlop={8}
      >
        <Text
          className={`text-[15px] font-semibold text-zinc-500 ${signingOut ? "opacity-40" : ""}`}
        >
          Sign out
        </Text>
      </Pressable>
    </ScrollView>
  );
}
