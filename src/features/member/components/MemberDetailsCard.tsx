import { Fragment } from "react";
import { Text, View } from "react-native";
import { formatPhone } from "../phone";
import type { Member } from "../types";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="gap-0.5 py-3.5">
      <Text className="text-[13px] text-zinc-500">{label}</Text>
      <Text selectable className="text-[17px] text-zinc-950">
        {value}
      </Text>
    </View>
  );
}

/** Name, phone and email in a grouped card. */
export function MemberDetailsCard({ member }: { member: Member }) {
  const rows = [
    { label: "Name", value: member.name },
    { label: "Phone number", value: formatPhone(member.phone) },
    { label: "Email", value: member.email },
  ];

  return (
    <View className="rounded-3xl bg-zinc-100 px-5" style={{ borderCurve: "continuous" }}>
      {rows.map((row, i) => (
        <Fragment key={row.label}>
          {i > 0 && <View className="h-px bg-zinc-200" />}
          <InfoRow label={row.label} value={row.value} />
        </Fragment>
      ))}
    </View>
  );
}
