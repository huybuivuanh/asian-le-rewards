import type { ComponentProps } from "react";
import { TextField } from "@/components/ui/TextField";
import { formatPhoneInput, PHONE_PLACEHOLDER } from "../phone";

type Props = Omit<ComponentProps<typeof TextField>, "label" | "onChangeText"> & {
  onChangeText: (formatted: string) => void;
};

/** Phone number field that formats as (000) 000-0000 while typing. */
export function PhoneField({ onChangeText, ...props }: Props) {
  return (
    <TextField
      label="Phone number"
      placeholder={PHONE_PLACEHOLDER}
      keyboardType="phone-pad"
      textContentType="telephoneNumber"
      autoComplete="tel"
      maxLength={PHONE_PLACEHOLDER.length}
      {...props}
      onChangeText={(text) => onChangeText(formatPhoneInput(text))}
    />
  );
}
