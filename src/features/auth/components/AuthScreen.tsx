import type { ReactNode } from "react";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BrandHeader } from "@/components/BrandHeader";

type Props = {
  subtitle: string;
  children: ReactNode;
};

/** Centered, keyboard-aware page with the brand title, shared by the sign-in flow screens. */
export function AuthScreen({ subtitle, children }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerClassName="w-full max-w-[440px] grow justify-center self-center gap-8 px-6"
      contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <BrandHeader subtitle={subtitle} />
      {children}
    </ScrollView>
  );
}
