// Adds settings to app.json that come from .env.
import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const iosUrlScheme = process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME;
  const plugins = [...(config.plugins ?? [])];

  // Google Sign-In on iOS needs the reversed iOS client ID as a URL scheme.
  // Skipped when unset so web and Expo Go still start; iOS builds need it.
  if (iosUrlScheme) {
    plugins.push(["@react-native-google-signin/google-signin", { iosUrlScheme }]);
  } else {
    console.warn("EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME is not set; Google sign-in won't work in iOS builds.");
  }

  return { ...config, name: config.name ?? "Asian Le Rewards", slug: config.slug ?? "asian-le-rewards", plugins };
};
