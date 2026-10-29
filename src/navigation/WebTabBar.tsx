// Web-only navigation bar. Native apps use NativeTabs instead.
// A header across the top with the brand on the left:
// - wide screens: the tabs sit on the right
// - narrow screens (phone browsers): a hamburger button opens the tabs as a menu
import type { BottomTabBarProps } from "expo-router/tabs";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { BrandTitle } from "@/components/BrandTitle";
import { useIsWide } from "@/hooks/useIsWide";
import { colors } from "@/theme/colors";
import { TABS } from "./tabs";

// Material "menu" and "close" icons (24×24).
const MENU_ICON = "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z";
const CLOSE_ICON =
  "M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z";

function Icon({ d, color }: { d: string; color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path d={d} fill={color} />
    </Svg>
  );
}

export function WebTabBar({ state, descriptors, navigateToTab, insets }: BottomTabBarProps) {
  const wide = useIsWide();
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = state.routes.map((route, i) => ({
    key: route.key,
    name: route.name,
    label: descriptors[route.key]?.options.title ?? route.name,
    svg: TABS.find((tab) => tab.name === route.name)?.svg,
    focused: state.index === i,
  }));

  const showMenu = menuOpen && !wide;

  return (
    <View className="border-b border-zinc-200 bg-white" style={{ paddingTop: insets.top }}>
      <View className="h-16 w-full max-w-[960px] flex-row items-center justify-between self-center px-6">
        <BrandTitle size="small" />

        {wide ? (
          <View className="flex-row items-center gap-1" accessibilityRole="tablist">
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
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showMenu ? "Close menu" : "Open menu"}
            accessibilityState={{ expanded: showMenu }}
            onPress={() => setMenuOpen((open) => !open)}
            hitSlop={8}
            className="-mr-2 rounded-full p-2 hover:bg-zinc-100"
          >
            <Icon d={showMenu ? CLOSE_ICON : MENU_ICON} color={colors.text} />
          </Pressable>
        )}
      </View>

      {/* Opens below the header and pushes the page down, like a website's mobile menu */}
      {showMenu && (
        <View className="border-t border-zinc-100 px-3 pb-3 pt-2" accessibilityRole="menu">
          {tabs.map((tab) => (
            <Pressable
              key={tab.key}
              accessibilityRole="menuitem"
              accessibilityState={{ selected: tab.focused }}
              onPress={() => {
                navigateToTab(tab.key);
                setMenuOpen(false);
              }}
              className={`h-12 flex-row items-center gap-3 rounded-xl px-3 ${
                tab.focused ? "bg-red-50" : "hover:bg-zinc-100"
              }`}
            >
              {tab.svg && <Icon d={tab.svg} color={tab.focused ? colors.brand : colors.muted} />}
              <Text
                className={`text-[17px] font-semibold ${tab.focused ? "text-brand" : "text-zinc-950"}`}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
