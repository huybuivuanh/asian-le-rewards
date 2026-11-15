// Web-only navigation bar. Native apps use NativeTabs instead.
// Styled like the Asian Le website's nav: a dark bar with the brand on the left,
// light links that turn gold on hover / when active.
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

// Same stroked hamburger / close icons as the website.
const MENU_ICON = "M4 7h16M4 12h16M4 17h16";
const CLOSE_ICON = "M6 18L18 6M6 6l12 12";

function StrokeIcon({ d, color }: { d: string; color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d={d} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Filled Material tab icons (from TABS).
function FillIcon({ d, color }: { d: string; color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
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
    <View className="border-b border-ink-line bg-ink" style={{ paddingTop: insets.top }}>
      <View className="h-16 w-full max-w-[960px] flex-row items-center justify-between self-center px-6">
        <BrandTitle size="small" />

        {wide ? (
          <View className="flex-row items-center gap-7" accessibilityRole="tablist">
            {tabs.map((tab) => (
              <Pressable
                key={tab.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: tab.focused }}
                onPress={() => navigateToTab(tab.key)}
                className="rounded-md py-2"
              >
                {({ hovered }) => (
                  <Text
                    className={`text-[15px] font-medium ${
                      tab.focused || hovered ? "text-gold" : "text-on-ink"
                    }`}
                  >
                    {tab.label}
                  </Text>
                )}
              </Pressable>
            ))}
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showMenu ? "Close menu" : "Open menu"}
            accessibilityState={{ expanded: showMenu }}
            onPress={() => setMenuOpen((open) => !open)}
            className="-mr-2 h-11 w-11 items-center justify-center rounded-full hover:bg-ink-raised"
          >
            <StrokeIcon d={showMenu ? CLOSE_ICON : MENU_ICON} color={colors.onInk} />
          </Pressable>
        )}
      </View>

      {/* Opens below the header and pushes the page down, like the website's mobile menu */}
      {showMenu && (
        <View className="border-t border-ink-line px-4 pb-4 pt-3" accessibilityRole="menu">
          {tabs.map((tab) => (
            <Pressable
              key={tab.key}
              accessibilityRole="menuitem"
              accessibilityState={{ selected: tab.focused }}
              onPress={() => {
                navigateToTab(tab.key);
                setMenuOpen(false);
              }}
              className="flex-row items-center gap-3 rounded-xl px-3 py-3.5 hover:bg-ink-raised"
            >
              {tab.svg && <FillIcon d={tab.svg} color={tab.focused ? colors.gold : colors.onInkMuted} />}
              <Text
                className={`text-base font-semibold ${tab.focused ? "text-gold" : "text-on-ink"}`}
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
