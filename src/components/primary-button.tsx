import { ActivityIndicator, Pressable, Text } from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function PrimaryButton({ title, onPress, disabled, loading }: Props) {
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      className={`h-[52px] items-center justify-center rounded-2xl bg-brand active:opacity-80 ${
        inactive ? "opacity-40" : ""
      }`}
      style={{ borderCurve: "continuous" }}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text className="text-[17px] font-semibold text-white">{title}</Text>
      )}
    </Pressable>
  );
}
