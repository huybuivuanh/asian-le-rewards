// Web-only tab bar. Native apps use NativeTabs instead.
// Wide screens: a header across the top (brand left, tabs right).
// Narrow screens (phone browsers): a bottom bar with icons, like the app.
import { Image } from "expo-image";
import type { BottomTabBarProps } from "expo-router/tabs";
import { Pressable, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useIsWide } from "@/utils/useIsWide";

const BRAND = "#DA251D";
const MUTED = "#71717A";

// Material icon paths (24×24), matching the Android icons.
const ICONS: Record<string, string> = {
  index: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
  activity:
    "M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z",
  profile:
    "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
};

function TabIcon({ name, color }: { name: string; color: string }) {
  const d = ICONS[name];
  if (!d) return null;
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path d={d} fill={color} />
    </Svg>
  );
}

export function WebTabBar({
  state,
  descriptors,
  navigateToTab,
  insets,
}: BottomTabBarProps) {
  const wide = useIsWide();

  const tabs = state.routes.map((route, i) => ({
    key: route.key,
    name: route.name,
    label: descriptors[route.key]?.options.title ?? route.name,
    focused: state.index === i,
  }));

  if (wide) {
    return (
      <View className="border-b border-zinc-200 bg-white">
        <View className="h-16 w-full max-w-[960px] flex-row items-center justify-between self-center px-6">
          <View
            className="flex-row items-center gap-2"
            accessible
            accessibilityRole="header"
            accessibilityLabel="Asian Le Rewards"
          >
            <Image
              source={require("../../assets/images/logo.png")}
              style={{ width: 18, height: 34 }}
              contentFit="contain"
            />
            <Text className="text-[19px] font-bold text-zinc-950">
              Asian Le Rewards
            </Text>
          </View>

          <View
            className="flex-row items-center gap-1"
            accessibilityRole="tablist"
          >
            {tabs.map((tab) => (
              <Pressable
                key={tab.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: tab.focused }}
                onPress={() => navigateToTab(tab.key)}
                className={`rounded-full px-4 py-2 ${tab.focused ? "bg-red-50" : "hover:bg-zinc-100"}`}
              >
                <Text
                  className={`text-[15px] font-semibold ${tab.focused ? "text-brand" : "text-zinc-600"}`}
                >
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View
      className="flex-row border-t border-zinc-200 bg-white"
      style={{ paddingBottom: insets.bottom }}
      accessibilityRole="tablist"
    >
      {tabs.map((tab) => (
        <Pressable
          key={tab.key}
          accessibilityRole="tab"
          accessibilityState={{ selected: tab.focused }}
          onPress={() => navigateToTab(tab.key)}
          className="h-14 flex-1 items-center justify-center gap-0.5"
        >
          <TabIcon name={tab.name} color={tab.focused ? BRAND : MUTED} />
          <Text
            className={`text-[11px] font-semibold ${tab.focused ? "text-brand" : "text-zinc-500"}`}
          >
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
