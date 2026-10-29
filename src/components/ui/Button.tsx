import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";
import { colors } from "@/theme/colors";

type Variant = "primary" | "secondary" | "danger";

const VARIANTS: Record<Variant, { container: string; text: string; spinner: string }> = {
  primary: {
    container: "bg-brand active:opacity-80",
    text: "text-white",
    spinner: colors.white,
  },
  secondary: {
    container: "border border-zinc-300 bg-white active:bg-zinc-50",
    text: "text-zinc-950",
    spinner: colors.text,
  },
  danger: {
    container: "bg-red-600 active:opacity-80",
    text: "text-white",
    spinner: colors.white,
  },
};

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  /** Shows a spinner instead of the title and blocks presses. */
  loading?: boolean;
  /** Shown before the title, e.g. a logo. */
  icon?: ReactNode;
  accessibilityLabel?: string;
};

/** Full-width 52pt button used for the main action on a screen. */
export function Button({
  title,
  onPress,
  variant = "primary",
  disabled,
  loading,
  icon,
  accessibilityLabel,
}: Props) {
  const style = VARIANTS[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      className={`h-[52px] flex-row items-center justify-center gap-3 rounded-2xl ${style.container} ${
        inactive ? "opacity-40" : ""
      }`}
      style={{ borderCurve: "continuous" }}
    >
      {loading ? (
        <ActivityIndicator color={style.spinner} />
      ) : (
        <>
          {icon}
          <Text className={`text-[17px] font-semibold ${style.text}`}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}
