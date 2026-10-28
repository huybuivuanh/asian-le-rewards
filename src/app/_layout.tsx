import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "@/providers/auth-provider";
import { colors } from "@/theme/colors";

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

function RootNavigator() {
  const { session } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: "minimal",
        headerShadowVisible: false,
        headerTintColor: colors.brand,
        contentStyle: { backgroundColor: colors.systemBackground },
      }}
    >
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
