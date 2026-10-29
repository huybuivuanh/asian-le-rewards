import { Text, View } from "react-native";
import type { Transaction } from "../types";

function describe(t: Transaction): { title: string; detail?: string } {
  switch (t.type) {
    case "earn":
      return {
        title: "Points earned",
        detail: t.subtotal != null ? `$${t.subtotal.toFixed(2)} order` : undefined,
      };
    case "redeem":
      return {
        title: "Reward used",
        detail: t.discount != null ? `$${t.discount} off` : undefined,
      };
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

/** One line of the points history: what happened, when, and the points change. */
export function TransactionRow({ transaction }: { transaction: Transaction }) {
  const { title, detail } = describe(transaction);
  const positive = transaction.points > 0;

  return (
    <View className="flex-row items-center justify-between gap-4 py-4">
      <View className="flex-1 gap-0.5">
        <Text className="text-[17px] font-semibold text-zinc-950">{title}</Text>
        <Text className="text-[13px] text-zinc-500">
          {[detail, formatWhen(transaction)].filter(Boolean).join(" · ")}
        </Text>
      </View>
      <Text
        className={`text-[17px] font-semibold ${positive ? "text-green-700" : "text-zinc-950"}`}
        style={{ fontVariant: ["tabular-nums"] }}
      >
        {positive ? "+" : "−"}
        {Math.abs(transaction.points).toLocaleString()}
      </Text>
    </View>
  );
}
