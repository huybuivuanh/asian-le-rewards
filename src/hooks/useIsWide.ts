import { useWindowDimensions } from "react-native";

/** Tablet / desktop width. Used for the web header tab bar and two-column layouts. */
export const WIDE_BREAKPOINT = 768;

export function useIsWide(): boolean {
  return useWindowDimensions().width >= WIDE_BREAKPOINT;
}
