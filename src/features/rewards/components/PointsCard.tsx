import { Text, View } from "react-native";
import { POINTS_PER_REWARD, REWARD_DOLLARS, rewardProgress } from "../rewards";

type Props = {
  points: number;
  /** Fill the height of a side-by-side row (tablet / desktop). */
  stretch?: boolean;
};

/** Red card with the balance and progress to the next reward. */
export function PointsCard({ points, stretch }: Props) {
  const { rewards, intoNext, toNext } = rewardProgress(points);

  return (
    <View
      className={`gap-4 rounded-3xl bg-brand p-6 ${stretch ? "flex-1 justify-between" : ""}`}
      style={{ borderCurve: "continuous" }}
    >
      <View className="gap-1">
        <Text className="text-[15px] font-semibold text-white/80">Your points</Text>
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
          accessibilityValue={{ min: 0, max: POINTS_PER_REWARD, now: intoNext }}
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
  );
}
