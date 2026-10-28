import "../../global.css";

import { useEffect } from "react";
import { Stack } from "expo-router";
import { DefaultTheme, ThemeProvider } from "expo-router/react-navigation";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";

// Keep the splash up until Firebase restores the saved login, so signed-in
// customers don't see the sign-in screen flash on launch.
SplashScreen.preventAutoHideAsync();

// Light only. Header + screen background match bg-white and the brand red.
const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: "#DA251D", background: "#FFFFFF", card: "#FFFFFF" },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={theme}>
      <StatusBar style="dark" />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);

  if (loading) return null;

  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal", headerShadowVisible: false }}>
      {/* Signed out: only the sign-in flow is reachable */}
      <Stack.Protected guard={!user}>
        <Stack.Screen name="sign-in" options={{ headerShown: false, animation: "fade" }} />
        <Stack.Screen name="sign-up" options={{ headerShown: false, animation: "fade" }} />
      </Stack.Protected>

      {/* Signed in: the main app */}
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
