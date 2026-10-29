import { Text, useWindowDimensions, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

type Props = {
  /** The member's uid, which the POS scans. */
  memberId: string;
  /** Fill the height of a side-by-side row (tablet / desktop). */
  stretch?: boolean;
};

/** The member QR code, shown at the till to earn or redeem points. */
export function MemberQrCard({ memberId, stretch }: Props) {
  const { width } = useWindowDimensions();
  // Fit very small phones: screen minus page and card padding (24 + 24 each side).
  const qrSize = Math.min(240, Math.max(160, width - 98));

  return (
    <View
      className={`items-center gap-4 rounded-3xl border border-zinc-200 p-6 ${stretch ? "flex-1 justify-center" : ""}`}
      style={{ borderCurve: "continuous" }}
    >
      <View accessible accessibilityRole="image" accessibilityLabel="Your member QR code">
        <QRCode value={memberId} size={qrSize} ecl="M" />
      </View>
      <Text className="text-center text-[17px] font-semibold text-zinc-950">
        Show this when you pay
      </Text>
    </View>
  );
}
