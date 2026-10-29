import { Pressable, Text } from "react-native";

type Tone = "brand" | "muted" | "danger";

const TONES: Record<Tone, string> = {
  brand: "text-brand",
  muted: "text-zinc-500",
  danger: "text-red-600",
};

type Props = {
  title: string;
  onPress: () => void;
  tone?: Tone;
  disabled?: boolean;
  /** Layout classes for the button itself, e.g. "self-center". */
  className?: string;
};

/** A small text-only button, for secondary actions like "Cancel" or "Forgot password?". */
export function TextButton({ title, onPress, tone = "brand", disabled, className = "" }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      className={className}
    >
      <Text className={`text-[15px] font-semibold ${TONES[tone]}`}>{title}</Text>
    </Pressable>
  );
}
