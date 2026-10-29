import { useState } from "react";
import { Pressable, Text, TextInput, View, type TextInputProps } from "react-native";

type Props = TextInputProps & {
  label: string;
  /** Adds a Show/Hide toggle and hides the text by default. */
  password?: boolean;
  invalid?: boolean;
  /** Small note shown under the field. */
  hint?: string;
};

export function TextField({ label, password, invalid, hint, ...input }: Props) {
  const [hidden, setHidden] = useState(true);

  return (
    <View className="gap-2">
      <Text className="text-[15px] font-semibold text-zinc-950">{label}</Text>
      <View
        className={`h-[52px] flex-row items-center rounded-2xl bg-zinc-100 px-4 ${
          invalid ? "border border-red-600" : ""
        }`}
        style={{ borderCurve: "continuous" }}
      >
        <TextInput
          placeholderTextColor="#A1A1AA"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={password && hidden}
          accessibilityLabel={label}
          className="h-full flex-1 text-[17px] text-zinc-950"
          {...input}
        />
        {password && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Show password" : "Hide password"}
            onPress={() => setHidden((h) => !h)}
            hitSlop={8}
          >
            <Text className="text-[15px] font-semibold text-zinc-500">
              {hidden ? "Show" : "Hide"}
            </Text>
          </Pressable>
        )}
      </View>
      {hint && (
        <Text className={`text-[13px] ${invalid ? "text-red-600" : "text-zinc-500"}`}>{hint}</Text>
      )}
    </View>
  );
}
