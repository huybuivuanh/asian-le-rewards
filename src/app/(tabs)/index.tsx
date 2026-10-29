import { ScrollView, Text, View } from "react-native";
import { useAuth } from "@/features/auth/AuthProvider";
import { MemberQrCard } from "@/features/rewards/components/MemberQrCard";
import { PointsCard } from "@/features/rewards/components/PointsCard";
import { POINTS_PER_REWARD, REWARD_DOLLARS } from "@/features/rewards/rewards";
import { useIsWide } from "@/hooks/useIsWide";

export default function HomeScreen() {
  const { member } = useAuth();
  const wide = useIsWide();

  // The route guard only shows this screen when the member doc exists.
  if (!member) return null;

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerClassName={`w-full self-center gap-6 px-6 pb-10 pt-6 ${wide ? "max-w-[880px]" : "max-w-[440px]"}`}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View className="gap-1">
        <Text className="text-[15px] text-zinc-500">Asian Le Rewards</Text>
        <Text className="text-[28px] font-bold text-zinc-950">Hi, {member.name}</Text>
      </View>

      {/* Side by side on tablet / desktop, stacked on phones */}
      <View className={wide ? "flex-row items-stretch gap-6" : "gap-6"}>
        {/* Live: updates the moment staff add points at the POS */}
        <PointsCard points={member.points} stretch={wide} />
        <MemberQrCard memberId={member.id} stretch={wide} />
      </View>

      <Text className="text-center text-[13px] text-zinc-500">
        1 point for every $1 spent · {POINTS_PER_REWARD} points = ${REWARD_DOLLARS} off
      </Text>
    </ScrollView>
  );
}
