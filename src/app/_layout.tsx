import "../../global.css";

import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router/react-navigation";
import { AuthProvider, useAuth } from "@/providers/auth-provider";

// Header + screen background colors, matched to bg-white / dark:bg-black and the brand red.
const lightTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: "#DA251D", background: "#FFFFFF", card: "#FFFFFF" },
};
const darkTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, primary: "#DA251D", background: "#000000", card: "#000000" },
};

// Web: dark: classes only apply when <html> has the "dark" class, so follow the system.
// NativeWind strips that class once when its styles load, so re-apply on any change.
function useWebDarkClass() {
  const scheme = useColorScheme();
  useEffect(() => {
    if (process.env.EXPO_OS !== "web") return;
    const root = document.documentElement;
    const wantDark = scheme === "dark";
    const apply = () => {
      if (root.classList.contains("dark") !== wantDark) root.classList.toggle("dark", wantDark);
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [scheme]);
}

export default function RootLayout() {
  const scheme = useColorScheme();
  useWebDarkClass();

  return (
    <ThemeProvider value={scheme === "dark" ? darkTheme : lightTheme}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { session } = useAuth();

  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal", headerShadowVisible: false }}>
      {/* Signed out: only the sign-in flow is reachable */}
      <Stack.Protected guard={!session}>
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="verify" options={{ title: "Enter code" }} />
      </Stack.Protected>

      {/* Signed in: the main app */}
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
