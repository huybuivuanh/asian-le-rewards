// Points history: earned, redeemed and reversed, newest first. Updates live.
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { listenToTransactions } from "@/services/memberService";
import { POINTS_PER_REWARD, REWARD_DOLLARS } from "@/utils/rewards";

function describe(t: Transaction): { title: string; detail?: string } {
  switch (t.type) {
    case "earn":
      return { title: "Points earned" };
    case "redeem": {
      const dollars = (Math.abs(t.points) / POINTS_PER_REWARD) * REWARD_DOLLARS;
      return { title: "Reward used", detail: `$${dollars} off` };
    }
    case "reverse":
      return {
        title: "Order cancelled",
        detail: t.points >= 0 ? "Points returned" : "Points removed",
      };
  }
}

function formatWhen(t: Transaction): string {
  const date = t.createdAt?.toDate?.();
  if (!date) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function Row({ item }: { item: Transaction }) {
  const { title, detail } = describe(item);
  const positive = item.points > 0;
  return (
    <View className="flex-row items-center justify-between gap-4 py-4">
      <View className="flex-1 gap-0.5">
        <Text className="text-[17px] font-semibold text-zinc-950">{title}</Text>
        <Text className="text-[13px] text-zinc-500">
          {[detail, formatWhen(item)].filter(Boolean).join(" · ")}
        </Text>
      </View>
      <Text
        className={`text-[17px] font-semibold ${positive ? "text-green-700" : "text-zinc-950"}`}
        style={{ fontVariant: ["tabular-nums"] }}
      >
        {positive ? "+" : "−"}
        {Math.abs(item.points).toLocaleString()}
      </Text>
    </View>
  );
}

export default function ActivityScreen() {
  const { user } = useAuth();
  const uid = user?.uid;
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    return listenToTransactions(
      uid,
      (next) => {
        setTransactions(next);
        setError(null);
      },
      (e) => {
        if (__DEV__) console.warn("[activity]", e);
        setError("Couldn't load your activity. Check your connection.");
      },
    );
  }, [uid]);

  return (
    <FlatList
      className="flex-1 bg-white"
      contentContainerClassName="w-full max-w-[440px] grow self-center px-6 pb-10 pt-6"
      contentInsetAdjustmentBehavior="automatic"
      data={transactions ?? []}
      keyExtractor={(t) => t.id}
      renderItem={Row}
      ItemSeparatorComponent={() => <View className="h-px bg-zinc-100" />}
      ListHeaderComponent={
        <Text className="pb-2 text-[28px] font-bold text-zinc-950">Activity</Text>
      }
      ListEmptyComponent={
        <View className="flex-1 items-center justify-center gap-2 py-20">
          {error ? (
            <Text className="text-center text-[15px] text-red-600">{error}</Text>
          ) : transactions === null ? (
            <ActivityIndicator color="#71717A" />
          ) : (
            <>
              <Text className="text-[17px] font-semibold text-zinc-950">No activity yet</Text>
              <Text className="text-center text-[15px] text-zinc-500">
                Show your QR code when you pay to start earning points.
              </Text>
            </>
          )}
        </View>
      }
    />
  );
}
