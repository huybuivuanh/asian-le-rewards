import { NativeTabs } from "expo-router/native-tabs";
import { Tabs } from "expo-router/tabs";
import { Platform } from "react-native";
import { useIsWide } from "@/utils/useIsWide";
import { WebTabBar } from "@/ui/WebTabBar";

export default function TabsLayout() {
  return Platform.OS === "web" ? <WebTabs /> : <AppTabs />;
}

// iOS / Android: real native tab bar.
function AppTabs() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="activity">
        <NativeTabs.Trigger.Label>Activity</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="clock.arrow.circlepath" md="history" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.crop.circle.fill" md="person" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

// Web: NativeTabs floats over the page there, so use a regular tab bar —
// a header on wide screens, a bottom bar in phone browsers.
function WebTabs() {
  const wide = useIsWide();
  return (
    <Tabs
      tabBar={(props) => <WebTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarPosition: wide ? "top" : "bottom",
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="activity" options={{ title: "Activity" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
