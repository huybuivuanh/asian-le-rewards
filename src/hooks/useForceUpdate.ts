import Constants from "expo-constants";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { db } from "@/lib/firebase";

type UpdateConfig = {
  minVersion?: string;
  iosUpdateUrl?: string;
  androidUpdateUrl?: string;
};

/** Compares dot-separated versions ("1.2.10" vs "1.10.0") number by number. */
function isVersionLower(current: string, min: string): boolean {
  const c = current.split(".").map((n) => parseInt(n, 10) || 0);
  const m = min.split(".").map((n) => parseInt(n, 10) || 0);
  const len = Math.max(c.length, m.length);
  for (let i = 0; i < len; i++) {
    const cv = c[i] ?? 0;
    const mv = m[i] ?? 0;
    if (cv !== mv) return cv < mv;
  }
  return false;
}

/**
 * Same as the POS app: watches `appConfig/version` in Firestore and reports when
 * this build is older than `minVersion`. Runs only while signed in (the rules
 * only allow signed-in reads). Live, so an update pushed mid-session applies
 * without a relaunch. Web is skipped since it always serves the latest build.
 */
export function useForceUpdate(enabled: boolean) {
  const [config, setConfig] = useState<UpdateConfig | null>(null);

  useEffect(() => {
    if (!enabled || Platform.OS === "web") return;
    const ref = doc(db, "appConfig", "version");
    return onSnapshot(
      ref,
      (snap) => setConfig((snap.data() as UpdateConfig | undefined) ?? null),
      // A failed read (offline, rules) shouldn't lock anyone out.
      () => setConfig(null),
    );
  }, [enabled]);

  const currentVersion = Constants.expoConfig?.version ?? "0.0.0";
  const updateRequired =
    enabled &&
    Platform.OS !== "web" &&
    !!config?.minVersion &&
    isVersionLower(currentVersion, config.minVersion);

  const updateUrl =
    Platform.OS === "ios" ? config?.iosUpdateUrl : config?.androidUpdateUrl;

  return { updateRequired, updateUrl };
}
