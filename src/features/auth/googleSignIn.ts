// Google sign-in on iOS / Android: the native Google library gets an ID token,
// then Firebase signs in with it. Web uses googleSignIn.web.ts instead.
import type * as GoogleSignInModule from "@react-native-google-signin/google-signin";
import { isRunningInExpoGo } from "expo";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { codedError } from "@/lib/errors";
import { auth } from "@/lib/firebase";

let google: typeof GoogleSignInModule | null = null;

// Loaded on first use: the native module isn't in Expo Go, and importing it
// there would crash the app before email sign-in could be used.
function loadGoogle(): typeof GoogleSignInModule {
  if (isRunningInExpoGo()) {
    throw codedError("google/expo-go", "Google sign-in needs a development build.");
  }
  if (!google) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- must stay lazy, see above
    google = require("@react-native-google-signin/google-signin") as typeof GoogleSignInModule;
    google.GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    });
  }
  return google;
}

/** Returns false if the customer closed the Google sheet. */
export async function signInWithGoogle(): Promise<boolean> {
  const { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } = loadGoogle();
  let response: GoogleSignInModule.SignInResponse;
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    response = await GoogleSignin.signIn();
  } catch (error) {
    if (isErrorWithCode(error)) {
      // A second tap while the sheet is already open: ignore it.
      if (error.code === statusCodes.IN_PROGRESS) return false;
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw codedError("google/play-services", error.message);
      }
    }
    throw error;
  }
  if (!isSuccessResponse(response)) return false;
  const { idToken } = response.data;
  if (!idToken) throw new Error("Google didn't return an ID token. Check webClientId.");
  await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
  return true;
}

/** Forget the Google account too, so the account picker shows next time. */
export async function signOutGoogle(): Promise<void> {
  if (!google) return; // never used Google in this session
  await google.GoogleSignin.signOut().catch(() => {});
}
