import { Text, View } from "react-native";
import { POINTS_PER_REWARD, REWARD_DOLLARS, rewardProgress } from "../rewards";

type Props = {
  points: number;
  /** Fill the height of a side-by-side row (tablet / desktop). */
  stretch?: boolean;
};

/** Red card with the balance and progress to the next reward. */
export function PointsCard({ points, stretch }: Props) {
  const { dollarsOff, intoNext, toNext } = rewardProgress(points);

  return (
    <View
      className={`gap-4 rounded-3xl bg-brand p-6 ${stretch ? "flex-1 justify-between" : ""}`}
      style={{ borderCurve: "continuous" }}
    >
      <View className="gap-1">
        <Text className="text-[15px] font-semibold text-white/80">Your points</Text>
        <View
          className="flex-row flex-wrap items-baseline gap-x-3"
          accessible
          accessibilityLabel={
            dollarsOff > 0 ? `${points} points, worth $${dollarsOff} off` : `${points} points`
          }
        >
          <Text
            className="text-[44px] font-bold text-white"
            style={{ fontVariant: ["tabular-nums"] }}
          >
            {points.toLocaleString()}
          </Text>
          {/* What the balance is worth right now, e.g. 300 = $15 */}
          {dollarsOff > 0 && (
            <Text
              className="text-[24px] font-semibold text-white/90"
              style={{ fontVariant: ["tabular-nums"] }}
            >
              = ${dollarsOff.toLocaleString()} off
            </Text>
          )}
        </View>
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
          {dollarsOff > 0
            ? `${toNext} more points to the next $${REWARD_DOLLARS} off.`
            : `${toNext} more points to $${REWARD_DOLLARS} off.`}
        </Text>
      </View>
    </View>
  );
}
