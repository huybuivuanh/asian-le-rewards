import { onAuthStateChanged, type User } from "firebase/auth";
import { createContext, use, useEffect, useRef, useState, type ReactNode } from "react";
import { deleteAccount as deleteAccountService, listenToMember } from "@/features/member/memberService";
import type { Member } from "@/features/member/types";
import { auth } from "@/lib/firebase";
import { signOutUser, signUp as signUpService, type SignUpInput } from "./authService";

type AuthContextValue = {
  user: User | null;
  /** members/{uid}, live. `null` when signed out or the doc is missing. */
  member: Member | null;
  /** True until the saved login and (if signed in) the member doc have loaded. */
  loading: boolean;
  signUp: (input: SignUpInput) => Promise<void>;
  logout: () => Promise<void>;
  /** Deletes everything for this member (Cloud Function), then signs out. */
  deleteAccount: () => Promise<void>;
};

/** The member doc and whose it is, so a stale doc from another login is never shown. */
type LoadedMember = { uid: string; member: Member | null };

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loaded, setLoaded] = useState<LoadedMember | null>(null);
  // Firebase signs in as soon as the login is created, before the member doc is
  // saved. Hide the user until sign-up fully finishes so the sign-up screen stays
  // up (and can show an error) if saving the member fails.
  const [signingUp, setSigningUp] = useState(false);
  // While deleting, the member doc disappears before the login does. Ignore that
  // so "Finish your profile" doesn't flash before we sign out.
  const deletingRef = useRef(false);

  useEffect(
    () =>
      onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        if (!firebaseUser) setLoaded(null);
        setAuthLoading(false);
      }),
    [],
  );

  const uid = user?.uid;
  useEffect(() => {
    if (!uid) return;
    return listenToMember(
      uid,
      (member) => {
        if (deletingRef.current && !member) return;
        setLoaded({ uid, member });
      },
      (error) => {
        if (__DEV__) console.warn("[member]", error);
        setLoaded({ uid, member: null });
      },
    );
  }, [uid]);

  const signUp = async (input: SignUpInput) => {
    setSigningUp(true);
    try {
      await signUpService(input);
    } finally {
      setSigningUp(false);
    }
  };

  const deleteAccount = async () => {
    deletingRef.current = true;
    try {
      await deleteAccountService();
      await signOutUser();
    } finally {
      deletingRef.current = false;
    }
  };

  const visibleUser = signingUp ? null : user;
  const memberLoaded = !!visibleUser && loaded?.uid === visibleUser.uid;

  return (
    <AuthContext
      value={{
        user: visibleUser,
        member: memberLoaded ? loaded.member : null,
        loading: authLoading || (!!visibleUser && !memberLoaded),
        signUp,
        logout: signOutUser,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext>
  );
}

export function useAuth(): AuthContextValue {
  const value = use(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
