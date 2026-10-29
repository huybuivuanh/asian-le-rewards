import { Text } from "react-native";

/** Red error message under a form. Renders nothing when there's no message. */
export function FormError({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return (
    <Text selectable className="text-sm text-red-600" accessibilityRole="alert">
      {message}
    </Text>
  );
}
