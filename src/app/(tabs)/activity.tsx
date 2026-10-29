// Points history: earned, redeemed and reversed, newest first. Updates live.
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { useAuth } from "@/features/auth/AuthProvider";
import { TransactionRow } from "@/features/rewards/components/TransactionRow";
import { useTransactions } from "@/features/rewards/useTransactions";
import { colors } from "@/theme/colors";

export default function ActivityScreen() {
  const { user } = useAuth();
  const { transactions, error } = useTransactions(user?.uid);

  return (
    <FlatList
      className="flex-1 bg-white"
      contentContainerClassName="w-full max-w-[640px] grow self-center px-6 pb-10 pt-6"
      contentInsetAdjustmentBehavior="automatic"
      data={transactions ?? []}
      keyExtractor={(t) => t.id}
      renderItem={({ item }) => <TransactionRow transaction={item} />}
      ItemSeparatorComponent={() => <View className="h-px bg-zinc-100" />}
      ListHeaderComponent={
        <Text className="pb-2 text-[28px] font-bold text-zinc-950">Activity</Text>
      }
      ListEmptyComponent={
        <View className="flex-1 items-center justify-center gap-2 py-20">
          {error ? (
            <Text className="text-center text-[15px] text-red-600">{error}</Text>
          ) : transactions === null ? (
            <ActivityIndicator color={colors.muted} />
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
