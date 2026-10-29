// Slides in from the top when points change while the app is open
// ("+42 points earned"), then hides by itself. Tap to hide sooner.
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { SlideInUp, SlideOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { listenToNewTransactions } from "@/services/memberService";

const SHOW_MS = 4000;

type Message = {
  key: string;
  title: string;
  detail: string;
  tone: "brand" | "neutral";
};

function toMessage(t: Transaction): Message | null {
  const abs = Math.abs(t.points).toLocaleString();
  switch (t.type) {
    case "earn":
      return {
        key: t.id,
        title: `+${abs} points earned`,
        detail: "Thanks for dining with us!",
        tone: "brand",
      };
    case "redeem":
      return {
        key: t.id,
        title:
          t.discount != null
            ? `Reward used: $${t.discount} off`
            : "Reward used",
        detail: `−${abs} points`,
        tone: "brand",
      };
    case "reverse":
      if (t.points === 0) return null;
      return {
        key: t.id,
        title:
          t.points > 0 ? `+${abs} points returned` : `−${abs} points removed`,
        detail: "An order was cancelled",
        tone: "neutral",
      };
  }
}

export function PointsBanner({ uid }: { uid: string }) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState<Message | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = listenToNewTransactions(uid, (t) => {
      const next = toMessage(t);
      if (!next) return;
      setMessage(next); // a newer one replaces the current one
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setMessage(null), SHOW_MS);
    });
    return () => {
      unsubscribe();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [uid]);

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: insets.top + 8,
        left: 16,
        right: 16,
        alignItems: "center",
      }}
    >
      {message && (
        <Animated.View
          key={message.key}
          entering={SlideInUp.springify().damping(18)}
          exiting={SlideOutUp.duration(200)}
          style={{ width: "100%", maxWidth: 440 }}
        >
          <Pressable
            accessibilityRole="alert"
            accessibilityLabel={`${message.title}. ${message.detail}`}
            onPress={() => setMessage(null)}
            className={`gap-0.5 rounded-2xl px-5 py-4 ${message.tone === "brand" ? "bg-brand" : "bg-zinc-800"}`}
            style={{
              borderCurve: "continuous",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.18)",
            }}
          >
            <Text className="text-[17px] font-bold text-white">
              {message.title}
            </Text>
            <Text className="text-[15px] text-white/85">{message.detail}</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}
