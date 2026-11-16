import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { db } from "@/lib/firebase";

// After "Not now", stay hidden on this browser for a week.
const DISMISS_KEY = "appStoreBannerDismissedAt";
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

/** iPhone / iPad browsers. iPads report a Mac user agent, so a Mac with a
 * touchscreen counts as an iPad. */
function isIOSBrowser(): boolean {
  if (Platform.OS !== "web" || typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /iPhone|iPad|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  );
}

function dismissedRecently(): boolean {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY));
    return !!at && Date.now() - at < DISMISS_MS;
  } catch {
    return false;
  }
}

/**
 * Web only, iPhone/iPad only: a bar at the top pointing to the App Store app.
 * The link is `iosUpdateUrl` in `appConfig/rewardsVersion` (same one the force
 * update uses); nothing shows if it's missing or can't be read. Android web
 * customers install the web app instead (public/manifest.webmanifest).
 */
export function AppStoreBanner() {
  const insets = useSafeAreaInsets();
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isIOSBrowser() || dismissedRecently()) return;
    let cancelled = false;
    getDoc(doc(db, "appConfig", "rewardsVersion"))
      .then((snap) => {
        const link = snap.data()?.iosUpdateUrl;
        if (!cancelled && typeof link === "string" && link) setUrl(link);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!url) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setUrl(null);
  };

  return (
    <View
      className="flex-row items-center gap-3 bg-ink px-4 py-2.5"
      style={{ paddingTop: insets.top + 10 }}
    >
      <View className="flex-1">
        <Text className="text-[15px] font-semibold text-on-ink">
          Get the Asian Le Rewards app
        </Text>
        <Text className="text-[13px] text-on-ink-muted">
          Free on the App Store
        </Text>
      </View>
      <Pressable accessibilityRole="button" onPress={dismiss} hitSlop={8}>
        <Text className="text-[14px] text-on-ink-muted">Not now</Text>
      </Pressable>
      <Pressable
        accessibilityRole="link"
        onPress={() => window.location.assign(url)}
        className="rounded-full bg-brand px-4 py-2"
      >
        <Text className="text-[14px] font-bold text-white">Open</Text>
      </Pressable>
    </View>
  );
}
