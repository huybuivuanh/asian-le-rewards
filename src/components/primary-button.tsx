import { ActivityIndicator, Pressable, Text } from "react-native";
import { colors } from "@/theme/colors";

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
      style={({ pressed }) => ({
        height: 52,
        borderRadius: 14,
        borderCurve: "continuous",
        backgroundColor: colors.brand,
        alignItems: "center",
        justifyContent: "center",
        opacity: inactive ? 0.45 : pressed ? 0.8 : 1,
      })}
    >
      {loading ? (
        <ActivityIndicator color={colors.onBrand} />
      ) : (
        <Text style={{ color: colors.onBrand, fontSize: 17, fontWeight: "600" }}>{title}</Text>
      )}
    </Pressable>
  );
}
