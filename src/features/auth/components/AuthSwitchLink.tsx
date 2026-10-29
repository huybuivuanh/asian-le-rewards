import { Link, type Href } from "expo-router";
import { Text, View } from "react-native";

type Props = {
  prompt: string;
  linkText: string;
  href: Href;
};

/** "New here? Create an account" line at the bottom of the sign-in / sign-up screens. */
export function AuthSwitchLink({ prompt, linkText, href }: Props) {
  return (
    <View className="flex-row justify-center gap-1.5">
      <Text className="text-[15px] text-zinc-500">{prompt}</Text>
      <Link href={href} replace>
        <Text className="text-[15px] font-semibold text-brand">{linkText}</Text>
      </Link>
    </View>
  );
}
