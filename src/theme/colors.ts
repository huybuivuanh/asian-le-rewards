import { Platform } from "react-native";
import { Color } from "expo-router";

export const colors = {
  // Brand red from the Asian Le logo. Fixed on every platform so buttons stay on-brand.
  brand: "#DA251D",
  onBrand: "#FFFFFF",

  label: Platform.select({
    ios: Color.ios.label,
    android: Color.android.dynamic.onSurface,
    default: "#000000",
  })!,
  secondaryLabel: Platform.select({
    ios: Color.ios.secondaryLabel,
    android: Color.android.dynamic.onSurfaceVariant,
    default: "#3C3C43",
  })!,
  tertiaryLabel: Platform.select({
    ios: Color.ios.tertiaryLabel,
    android: Color.android.dynamic.outline,
    default: "#8E8E93",
  })!,
  systemBackground: Platform.select({
    ios: Color.ios.systemBackground,
    android: Color.android.dynamic.surface,
    default: "#FFFFFF",
  })!,
  fieldBackground: Platform.select({
    ios: Color.ios.secondarySystemBackground,
    android: Color.android.dynamic.surfaceContainerHighest,
    default: "#F2F2F7",
  })!,
  separator: Platform.select({
    ios: Color.ios.separator,
    android: Color.android.dynamic.outlineVariant,
    default: "#C6C6C8",
  })!,
  error: Platform.select({
    ios: Color.ios.systemRed,
    android: Color.android.dynamic.error,
    default: "#D70015",
  })!,
};
